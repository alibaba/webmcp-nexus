import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  registerGlobalTools,
  useWebMcpTools,
  configureBuiltinTools,
  type WebMcpToolSchema,
} from 'webmcp-nexus-sdk';
import {
  clearRegistry,
  getActiveToolStates,
  CALL_TOOL_NAME,
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
  // 关掉 SDK 内置的 webmcpCallTool：以下用例断言的是宿主工具表与 SDK 所有权镜像的
  // **精确名单**，内置工具会让它们整体偏移一位。内置工具对真实 polyfill 的端到端行为
  // 由文件末尾专门的 describe 覆盖，它会显式打开。
  configureBuiltinTools({ callTool: false });
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

describe('内置代调工具 webmcpCallTool（真实 polyfill 端到端）', () => {
  beforeEach(() => {
    configureBuiltinTools({ callTool: true });
  });

  interface DispatchResult {
    content?: Array<{ type?: string; text?: string }>;
    isError?: boolean;
    [key: string]: unknown;
  }

  /**
   * 经真实宿主代调一次：取 descriptor → executeTool → 反序列化。
   *
   * 入参故意传**对象**：polyfill 5.1.0 只吃 JSON 字符串，靠 nexus 的轴一包装归一，
   * 这样连包装一起验（relay 6.x 正是传对象）。
   */
  async function dispatchRaw(input: Record<string, unknown>): Promise<string> {
    const callTool = (await host().getTools()).find(
      (t: { name: string }) => t.name === CALL_TOOL_NAME,
    );
    expect(callTool).toBeDefined();
    // 宿主的 executeTool 返回 JSON 字符串（本文件上方已有用例单独断言过这一点）
    const serialized = await host().executeTool(callTool, input);
    expect(typeof serialized).toBe('string');
    return serialized as string;
  }

  async function dispatch(input: Record<string, unknown>): Promise<DispatchResult> {
    return JSON.parse(await dispatchRaw(input)) as DispatchResult;
  }

  function textOf(result: DispatchResult): string {
    return (result.content ?? []).map(block => block.text ?? '').join('\n');
  }

  it('随 registerGlobalTools 自动注册，且注册早于用户工具', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    const names = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(names).toContain(CALL_TOOL_NAME);
    expect(names).toContain('listTodos');
    // 注册顺序只能在 SDK 侧断言：polyfill 5.1.0 的 getTools() 末尾按名字字典序 sort，
    // 宿主工具表的顺序与注册顺序无关（'listTodos' < 'webmcpCallTool'）。
    // 顺序本身的语义在 registerGlobalTools.test.ts 里用宿主的 registerTool 调用序锁定。
    expect(getActiveToolStates().map(s => s.name)[0]).toBe(CALL_TOOL_NAME);
  });

  it('只用 useWebMcpTools（从不调 registerGlobalTools）也能拿到内置工具', async () => {
    renderHook(() => useWebMcpTools({ pageTool: makeTool('pageTool', () => ({ ok: 1 })) }));
    await flushHostTasks();

    const names = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(names).toContain(CALL_TOOL_NAME);
    expect(names).toContain('pageTool');
  });

  it('命中：代调结果与客户端直调该工具的结果**逐字一致**', async () => {
    registerGlobalTools({ getCanvasInfo: makeTool('getCanvasInfo', () => ({ width: 800 })) });
    await flushHostTasks();

    const tools = await host().getTools();
    const direct = await host().executeTool(
      tools.find((t: { name: string }) => t.name === 'getCanvasInfo'),
      '{}',
    );
    const viaDispatch = await dispatchRaw({ name: 'getCanvasInfo' });

    // dispatcher 刻意**不做二次归一**：宿主 executeTool 返回 JSON 字符串，handler 只 parse
    // 后把内层工具的返回值原样上交，由消费方（relay 的 normalizeToolResponse）用它那层更宽
    // 的规则收尾。nexus 自己的 isCallToolResult 只认 text/image/resource 三种 content 且只看
    // 首元素，上游 isContentBlock 认 6 种并逐个校验必填字段 —— 在页面内先归一会把
    // resource_link/audio 形状的结果误判重包、把 isError 抹成 false，还会丢 structuredContent。
    expect(viaDispatch).toBe(direct);
    expect(JSON.parse(viaDispatch)).toEqual({ width: 800 });
  });

  it('内层 isError 穿过两层序列化后仍然是 true', async () => {
    registerGlobalTools({
      failing: makeTool('failing', () => ({
        content: [{ type: 'text', text: 'boom' }],
        isError: true,
      })),
    });
    await flushHostTasks();

    const result = await dispatch({ name: 'failing' });

    expect(result.isError).toBe(true);
    expect(result.content).toEqual([{ type: 'text', text: 'boom' }]);
  });

  it('未命中：isError + 当前页工具目录，且目录不含自身', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    const result = await dispatch({ name: 'listTodosXXX' });
    const text = textOf(result);

    expect(result.isError).toBe(true);
    expect(text).toContain('Tool "listTodosXXX" not found');
    expect(text).toContain('Available tools:');
    expect(text).toContain('listTodos');
    expect(text).not.toContain(CALL_TOOL_NAME);
  });

  it('目录是实时的：路由级工具卸载后再代调即未命中', async () => {
    const { unmount } = renderHook(() =>
      useWebMcpTools({ pageTool: makeTool('pageTool', () => ({ ok: 1 })) }),
    );
    await flushHostTasks();
    expect((await dispatch({ name: 'pageTool' })).isError).toBeFalsy();

    unmount();
    await flushHostTasks();

    const result = await dispatch({ name: 'pageTool' });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('Tool "pageTool" not found');
  });

  it('name 指向自己 → isError 自递归守卫，不会二次进入宿主', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    const result = await dispatch({ name: CALL_TOOL_NAME });

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('cannot call itself');
  });

  it('configureBuiltinTools({ callTool: false }) 时宿主工具表里没有它', async () => {
    configureBuiltinTools({ callTool: false });

    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    const names = (await host().getTools()).map((t: { name: string }) => t.name);
    expect(names).not.toContain(CALL_TOOL_NAME);
    expect(names).toContain('listTodos');
  });

  async function hostNames(): Promise<string[]> {
    return (await host().getTools()).map((t: { name: string }) => t.name);
  }

  it('先注册后关：宿主工具表里**真的**摘掉了（走 polyfill 的 signal hook，不是 SDK 内部镜像）', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();
    expect(await hostNames()).toContain(CALL_TOOL_NAME);

    configureBuiltinTools({ callTool: false });
    await flushHostTasks();

    // spec §8 说的唯一运行时回滚手段。polyfill 5.x 没有 unregisterTool，摘除完全依赖
    // controller.abort() → polyfill 注册时自己挂的 signal hook，是一条纯上游行为链路，
    // 所以必须端到端锁一次：只断言 getActiveToolNames()（SDK 内部镜像）的话，abort 链路
    // 对 builtin owner 静默失效时单测全绿，而生产上关掉开关后 relay 仍在上报、Agent 仍能代调。
    const names = await hostNames();
    expect(names).not.toContain(CALL_TOOL_NAME);
    expect(names).toContain('listTodos');
  });

  it('关掉再打开：立即回到宿主工具表，不需要再跑一次注册入口', async () => {
    registerGlobalTools({ listTodos: makeTool('listTodos', () => ({ ok: true })) });
    await flushHostTasks();

    configureBuiltinTools({ callTool: false });
    await flushHostTasks();
    expect(await hostNames()).not.toContain(CALL_TOOL_NAME);

    // 此后不再调 registerGlobalTools、也不挂载任何组件，只翻开关。
    // 应用可能启动时只注册一次、之后没有组件重挂载，若 enable 分支不补注册，
    // 一个 disable→enable 循环就会让 webmcpCallTool 永久消失。
    configureBuiltinTools({ callTool: true });
    await flushHostTasks();

    expect(await hostNames()).toContain(CALL_TOOL_NAME);
  });
});
