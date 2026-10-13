import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { registerGlobalTools, useWebMcpTools, type WebMcpToolSchema } from 'webmcp-nexus-sdk';
import {
  clearRegistry,
  getActiveToolStates,
  __resetPolyfillStateForTest,
} from 'webmcp-nexus-sdk/testing';

/**
 * 升级验收：用**真实的 @mcp-b/webmcp-polyfill 5.1.0**（非 mock）验证 nexus 1.0.0 在
 * document.modelContext 规范入口上的端到端行为。
 *
 * 前置条件（见 vitest.config.ts）：
 * - jsdom URL 钉在 http://localhost:3000/，否则 polyfill 的 validateExecutableOrigin
 *   会拒绝 'null' origin，executeTool 全部失败
 * - polyfill 的安装门槛是 `isSecureContext === false`（严格等值），jsdom 返回 undefined
 *   故不早退
 *
 * 严禁用 workspace link 指向本地 mcp-b 仓库：其 packages/webmcp-polyfill/dist 是陈旧的
 * 2.x 构建产物（同步 registerTool + 有 unregisterTool），会得到假绿。
 */

function makeTool(
  name: string,
  impl: (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => unknown,
  schemaOverrides: Partial<WebMcpToolSchema> = {},
) {
  const fn = async (input: Record<string, unknown>, options?: { signal?: AbortSignal }) =>
    impl(input, options);
  (fn as unknown as { __webmcpSchema: WebMcpToolSchema }).__webmcpSchema = {
    description: `${name} 的描述`,
    inputSchema: { type: 'object', properties: {} },
    ...schemaOverrides,
  };
  return fn;
}

/** polyfill 的 #notifyToolsChanged 内部 await setTimeout(0)，需跨宏任务等待 */
function flushHostTasks(ms = 30) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function host(): any {
  return document.modelContext;
}

beforeEach(() => {
  __resetPolyfillStateForTest();
  clearRegistry();
});

afterEach(() => {
  document.body.innerHTML = '';
  // 先移除用例注入的 own property，再还原 polyfill 装在 Document.prototype 上的 accessor。
  // 必须放在 afterEach：若写在用例末尾，断言失败时清理不会执行，假宿主会泄漏到后续所有用例
  try {
    delete (navigator as unknown as Record<string, unknown>).modelContext;
  } catch {
    // 忽略
  }
  try {
    delete (document as unknown as Record<string, unknown>).modelContext;
  } catch {
    // 忽略
  }
  clearRegistry();
  __resetPolyfillStateForTest();
  vi.restoreAllMocks();
});

describe('规范入口：document.modelContext', () => {
  it('registerGlobalTools 后工具出现在 getTools()，且 inputSchema 为 JSON Schema 对象', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    expect(host()).toBeDefined();
    expect(host().__isWebMCPPolyfill).toBe(true);

    const tools = await host().getTools();
    const tool = tools.find((t: { name: string }) => t.name === 'listTodos');
    expect(tool).toBeDefined();
    // polyfill 5 自持 context 时 inputSchema 是对象（webmcp#241）。
    // 注意：这验证的是 polyfill 的形态，Chrome 149+ 的 same-document 工具仍返回字符串，
    // 所以 SDK 的 coerceInputSchema 必须同时处理两种形态。
    expect(typeof tool.inputSchema).toBe('object');
    expect(tool.description).toBe('listTodos 的描述');
  });

  it('executeTool 用 getTools() 返回的真 descriptor 调用，结果可反序列化', async () => {
    registerGlobalTools({
      getCanvasInfo: makeTool('getCanvasInfo', () => ({ width: 800, shapes: 3 })),
    });
    await flushHostTasks();

    const [tool] = (await host().getTools()).filter(
      (t: { name: string }) => t.name === 'getCanvasInfo',
    );
    const serialized = await host().executeTool(tool, '{}');

    expect(typeof serialized).toBe('string');
    expect(JSON.parse(serialized as string)).toEqual({ width: 800, shapes: 3 });
  });

  it('SDK 全链路不触发 navigator.modelContext 的 deprecation warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ t1: makeTool('t1', () => null) });
    await flushHostTasks();
    const tools = await host().getTools();
    await host().executeTool(tools[0], '{}');
    const { unmount } = renderHook(() => useWebMcpTools({ t2: makeTool('t2', () => null) }));
    await flushHostTasks();
    unmount();
    await flushHostTasks();

    const warnings = warn.mock.calls.map(call => String(call[0]));
    expect(warnings.filter(w => w.includes('is deprecated'))).toEqual([]);
  });

  it('nexus 不写**可枚举** own key（polyfill 刻意维持 "ModelContext instance has no own keys"）', async () => {
    registerGlobalTools({ t1: makeTool('t1', () => null) });
    await flushHostTasks();

    // nexus 会装 getTools/executeTool 的形态归一包装，但用 defineHiddenProperty
    // （enumerable: false），所以可枚举 own key 仍为空
    expect(Object.keys(host())).toEqual([]);
    expect(host().__webmcpNexusGetToolsWrapped).toBe(true);
    expect(host().__webmcpNexusExecuteToolWrapped).toBe(true);
    // registerTool 未被包装，arity 仍是 1（WebIDL idlharness 会检查）；
    // 旧实现的包装器会把它变成 2 并吞掉 Promise
    expect(host().registerTool.length).toBe(1);
    expect(host().listTools).toBeUndefined();
    expect(host().callTool).toBeUndefined();
    expect(host().__toolchangeCoalesced).toBeUndefined();
    // v5 移除了 unregisterTool，注销统一走 AbortSignal
    expect(host().unregisterTool).toBeUndefined();
  });

  it('一次注册只派发 1 次 toolchange（协议规定派发责任在宿主，nexus 不再重复派发）', async () => {
    // 先触发 polyfill 安装，再挂监听，避免把安装期的通知算进来
    registerGlobalTools({ seed: makeTool('seed', () => null) });
    await flushHostTasks();

    const onToolChange = vi.fn();
    host().addEventListener('toolchange', onToolChange);

    registerGlobalTools({ t1: makeTool('t1', () => null) });
    await flushHostTasks();

    expect(onToolChange).toHaveBeenCalledTimes(1);
  });
});

describe('生命周期：AbortSignal 取代 unregisterTool', () => {
  it('useWebMcpTools 挂载即注册、卸载即从 getTools() 移除', async () => {
    const { unmount } = renderHook(() =>
      useWebMcpTools({ selectTodo: makeTool('selectTodo', () => null) }),
    );
    await flushHostTasks();

    expect((await host().getTools()).map((t: { name: string }) => t.name)).toContain('selectTodo');
    expect(getActiveToolStates().map(s => s.name)).toContain('selectTodo');

    unmount();
    await flushHostTasks();

    expect((await host().getTools()).map((t: { name: string }) => t.name)).not.toContain(
      'selectTodo',
    );
    expect(getActiveToolStates()).toEqual([]);
  });

  it('路由切换式的一卸一挂不会产生幽灵工具', async () => {
    const first = renderHook(() => useWebMcpTools({ pageA: makeTool('pageA', () => null) }));
    await flushHostTasks();
    first.unmount();

    const second = renderHook(() => useWebMcpTools({ pageB: makeTool('pageB', () => null) }));
    await flushHostTasks();

    const names = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(names).toContain('pageB');
    expect(names).not.toContain('pageA');
    second.unmount();
  });
});

describe('向下兼容：只有 navigator.modelContext 的旧宿主（Chrome 146–149）', () => {
  it('polyfill 做入口桥接，document.modelContext 与原生 navigator 面是同一实例', async () => {
    // patch 会替换 mc.registerTool（旧宿主档），故必须持有原始 spy 引用才能断言
    const registerTool = vi.fn();
    const native = { registerTool, unregisterTool: vi.fn() };
    Object.defineProperty(navigator, 'modelContext', {
      value: native,
      configurable: true,
      writable: true,
    });

    registerGlobalTools({ legacyTool: makeTool('legacyTool', () => null) });
    await flushHostTasks();

    expect(document.modelContext).toBe(native as never);
    expect(registerTool).toHaveBeenCalledTimes(1);
    // 旧宿主档：nexus 保留全套 patch（补齐 EventTarget + 包装 registerTool 以桥接 toolchange）
    expect(
      typeof (document.modelContext as unknown as { addEventListener: unknown }).addEventListener,
    ).toBe('function');
    // 桥接路径早退发生在装 shim 之前 → installTestingShim 在这一档不生效。
    // 这正是 relay 2.x 在原生 Chrome 下不可用、必须升到 5.x 的原因。
    expect(
      (navigator as unknown as { modelContextTesting?: unknown }).modelContextTesting,
    ).toBeUndefined();
  });
});

describe('v5 新增校验的兜底', () => {
  it('空 description 回落为工具名后仍注册成功（polyfill 对空描述抛 InvalidStateError）', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ submitForm: makeTool('submitForm', () => null, { description: '' }) });
    await flushHostTasks();

    const tools = await host().getTools();
    expect(tools.map((t: { name: string }) => t.name)).toContain('submitForm');
    expect(tools.find((t: { name: string }) => t.name === 'submitForm').description).toBe(
      'submitForm',
    );
    expect(warn.mock.calls.map(c => String(c[0])).some(w => w.includes('empty description'))).toBe(
      true,
    );
  });

  it('非法工具名与 default 键被跳过，且不进 SDK 所有权镜像', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 用动态构造的 map 绕过构建插件（插件会在构建期就对非法名报错）
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const tools: Record<string, Function> = {};
    tools['获取数据'] = makeTool('获取数据', () => null);
    tools['a'.repeat(129)] = makeTool('long', () => null);
    tools.default = makeTool('default', () => null);
    tools.validTool = makeTool('validTool', () => null);

    registerGlobalTools(tools);
    await flushHostTasks();

    const hostNames = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(hostNames).toEqual(['validTool']);
    expect(getActiveToolStates().map(s => s.name)).toEqual(['validTool']);
    // 两个非法名各告警一次；default 是静默跳过（字符集合法但语义错误）
    expect(warn.mock.calls.filter(c => String(c[0]).includes('Skipped tool'))).toHaveLength(2);
  });

  it('重名注册被 polyfill 拒绝时不产生 unhandled rejection，且不上报幽灵工具', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // 先跑一次注册以触发 polyfill 安装（ESM 入口无副作用，必须显式初始化）
    registerGlobalTools({ seed: makeTool('seed', () => null) });
    await flushHostTasks();

    // 第三方直接占用同名工具（不经 SDK）
    await host().registerTool({
      name: 'dupTool',
      description: 'third party',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => 'third-party',
    });

    registerGlobalTools({ dupTool: makeTool('dupTool', () => 'sdk') });
    await flushHostTasks();

    expect(warn.mock.calls.map(c => String(c[0])).some(w => w.includes('InvalidStateError'))).toBe(
      true,
    );
    // 所有权镜像保留（scope 记账需要），但对外上报必须过滤，否则 relay 会 Tool not found
    expect(getActiveToolStates().find(s => s.name === 'dupTool')?.nativeState).toBe('failed');
    // 宿主里的 dupTool 仍是第三方那个，未被 SDK 覆盖
    const [dupTool] = (await host().getTools()).filter(
      (t: { name: string }) => t.name === 'dupTool',
    );
    expect(dupTool.description).toBe('third party');
  });
});

describe('declarative forms 边界（polyfill 5.x 自动安装）', () => {
  it('<form toolname> 工具进宿主工具表，但不进 SDK 所有权镜像', async () => {
    registerGlobalTools({ sdkTool: makeTool('sdkTool', () => null) });
    await flushHostTasks();

    const form = document.createElement('form');
    form.setAttribute('toolname', 'declarativeSearch');
    form.setAttribute('tooldescription', 'Search the catalog');
    const input = document.createElement('input');
    input.name = 'query';
    form.appendChild(input);
    document.body.appendChild(form);

    await flushHostTasks(120);

    const names = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(names).toContain('sdkTool');
    expect(names).toContain('declarativeSearch');
    // SDK 所有权镜像只含经 SDK 注册的工具 —— 这就是 pushToolsToWidget 必须跳过
    // relay iframe 的原因：推镜像过去会让 MCP 客户端少看到声明式工具
    expect(getActiveToolStates().map(s => s.name)).toEqual(['sdkTool']);
  });
});

describe('execute 第二参（执行取消信号）', () => {
  it('polyfill 5.1.0 不转发 options：这是原生 Chrome 独有能力（已知差异）', async () => {
    const seen: unknown[] = [];
    registerGlobalTools({
      fetchTool: makeTool('fetchTool', (_input, options) => {
        seen.push(options);
        return 'done';
      }),
    });
    await flushHostTasks();

    const [tool] = (await host().getTools()).filter(
      (t: { name: string }) => t.name === 'fetchTool',
    );
    const controller = new AbortController();
    await host().executeTool(tool, '{}', { signal: controller.signal });

    // polyfill 内部是 tool.execute(args) 单参调用，options.signal 只用于 race 外层 promise。
    // nexus 的透传是正确的向前兼容：原生 Chrome 会真正传入 { signal }。
    expect(seen).toEqual([undefined]);
  });
});
