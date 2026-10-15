import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerGlobalTools } from '../registerGlobalTools';
import {
  clearRegistry,
  getActiveToolNames,
  getActiveToolConfigs,
  getActiveToolStates,
  unregisterScopedTool,
} from '../registry';
import { installFakeHost, makeLegacyHost, makeModernHost, teardownHost } from './host-helpers';
import { CALL_TOOL_NAME, configureBuiltinTools } from '../builtinTools';
import { getModelContext, isModernHost } from '../model-context';

function makeToolFn(schemaOverrides?: Record<string, unknown> | false) {
  const fn = async (input: any, options?: { signal?: AbortSignal }) => ({ input, options });
  if (schemaOverrides !== false) {
    (fn as any).__webmcpSchema = {
      description: 'test tool',
      inputSchema: { type: 'object', properties: {} },
      ...(schemaOverrides || {}),
    };
  }
  return fn;
}

/** 三个 hint 全开的 annotations（buildToolConfig 的固定映射结果） */
const FULL_ANNOTATIONS = {
  readOnlyHint: false,
  untrustedContentHint: false,
  consequentialHint: false,
};

describe('registerGlobalTools', () => {
  let host: ReturnType<typeof makeModernHost>;

  beforeEach(() => {
    host = makeModernHost();
    installFakeHost(host);
  });

  afterEach(() => {
    teardownHost();
  });

  it('document/navigator 都没有 modelContext 时静默跳过', () => {
    teardownHost();
    const spy = vi.fn();
    installFakeHost({ registerTool: spy });
    // 卸载后立即删除，模拟无宿主环境
    delete (document as any).modelContext;
    delete (navigator as any).modelContext;

    expect(() => registerGlobalTools({ myTool: makeToolFn() })).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('跳过非函数值', () => {
    registerGlobalTools({ notAFunction: 42 } as any);
    expect(host.registerTool).not.toHaveBeenCalled();
  });

  it('跳过无 __webmcpSchema 的函数', () => {
    const plainFn = makeToolFn(false);
    registerGlobalTools({ plainFn });
    expect(host.registerTool).not.toHaveBeenCalled();
  });

  it('正确注册带 schema 的函数，并映射 title 与三个 annotations hint', () => {
    const fn = makeToolFn({ description: 'test tool', readOnly: true });
    registerGlobalTools({ myTool: fn });

    expect(host.registerTool).toHaveBeenCalledTimes(1);
    expect(host.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'myTool',
        // polyfill 的 getTools() 恒输出 title，不传就是空标题 → SDK 回落工具名
        title: 'myTool',
        description: 'test tool',
        annotations: {
          readOnlyHint: true,
          untrustedContentHint: false,
          consequentialHint: false,
        },
      }),
      { signal: expect.any(AbortSignal) },
    );
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('@title / @untrusted / @consequential 透传到协议字段', () => {
    const fn = makeToolFn({
      title: '预订机票',
      untrustedContent: true,
      consequential: true,
    });
    registerGlobalTools({ bookFlight: fn });

    expect(host.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '预订机票',
        annotations: {
          readOnlyHint: false,
          untrustedContentHint: true,
          // 已知差异：polyfill 5.1.0 会丢弃该 hint，仅原生 Chrome 153+ 生效；
          // SDK 侧照常透传，属安全的向前兼容
          consequentialHint: true,
        },
      }),
      { signal: expect.any(AbortSignal) },
    );
  });

  it('readOnly 缺省时三个 hint 均为 false', () => {
    const fn = makeToolFn({ readOnly: undefined });
    registerGlobalTools({ myTool: fn });
    expect(host.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({ annotations: FULL_ANNOTATIONS }),
      { signal: expect.any(AbortSignal) },
    );
  });

  it('支持多个 toolMap 参数', () => {
    registerGlobalTools({ tool1: makeToolFn() }, { tool2: makeToolFn() });
    expect(host.registerTool).toHaveBeenCalledTimes(2);
    expect(host.registerTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'tool1' }), {
      signal: expect.any(AbortSignal),
    });
    expect(host.registerTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'tool2' }), {
      signal: expect.any(AbortSignal),
    });
  });

  it('重复注册同名全局工具时不重复调用原生 registerTool', () => {
    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });
    registerGlobalTools({ myTool: fn });
    expect(host.registerTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('execute 包装器透传入参与宿主的第二参（执行取消信号）', async () => {
    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });

    const descriptor = (host.registerTool as any).mock.calls[0][0];
    const controller = new AbortController();
    const result = await descriptor.execute({ key: 'value' }, { signal: controller.signal });

    expect(result).toEqual({ input: { key: 'value' }, options: { signal: controller.signal } });
  });

  it('execute 只传一个参数时 options 为 undefined（旧工具函数零改动）', async () => {
    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });
    const descriptor = (host.registerTool as any).mock.calls[0][0];
    const result = await descriptor.execute({ a: 1 });
    expect(result).toEqual({ input: { a: 1 }, options: undefined });
  });

  it('SSR（document 与 navigator 均未定义）静默跳过', () => {
    // 规范入口已迁到 document，所以 SSR 的含义是两者都缺失；
    // 只删 navigator 不够——getModelContext() 会先从 document 拿到宿主
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('navigator', undefined);
    try {
      expect(() => registerGlobalTools({ myTool: makeToolFn() })).not.toThrow();
      expect(host.registerTool).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('registerGlobalTools — 工具名守卫（polyfill 5.x 新增校验）', () => {
  let host: ReturnType<typeof makeModernHost>;

  beforeEach(() => {
    host = makeModernHost();
    installFakeHost(host);
  });
  afterEach(() => teardownHost());

  it('跳过 default 键且不写入所有权镜像', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ default: makeToolFn(), realTool: makeToolFn() });

    expect(host.registerTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toEqual(['realTool']);
    // default 是合法字符集但语义错误，静默跳过即可，不该刷 warning
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ['中文名', '获取数据'],
    ['含空格', 'my tool'],
    ['129 字符', 'a'.repeat(129)],
  ])('跳过非法工具名（%s）且不写入镜像', (_label, name) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ [name]: makeToolFn() });

    expect(host.registerTool).not.toHaveBeenCalled();
    expect(getActiveToolNames()).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('Skipped tool');
  });

  it('允许 WebMCP 合法但 relay 会 sanitize 的名字（. 与 -）', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ 'get-canvas.info': makeToolFn() });
    expect(host.registerTool).toHaveBeenCalledTimes(1);
  });
});

describe('registerGlobalTools — 异步 registerTool 的成败处理', () => {
  // 这些用例必须以公共入口为被测对象：patchModelContextEventSupport 只在
  // registerGlobalTools / useWebMcpTools 里调用，直接调 registerScopedTool 会绕开它，
  // 用例通过而生产链路仍坏。

  // 不手动监听 process.on('unhandledRejection')（SDK 的 tsconfig 未引入 @types/node）：
  // Vitest 默认会把未处理的 rejection 报为该测试文件的错误，只要在用例结束前
  // 把微任务与宏任务都跑完，被吞掉的 Promise 就会暴露。
  async function flushAsync() {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  afterEach(() => {
    teardownHost();
  });

  it('现代宿主：registerTool 返回 resolved Promise → nativeState 置 registered 且无告警', async () => {
    const host = makeModernHost({ registerTool: vi.fn(async () => {}) });
    installFakeHost(host);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    await flushAsync();

    expect(getActiveToolStates()[0].nativeState).toBe('registered');
    expect(warn).not.toHaveBeenCalled();
  });

  it('现代宿主：重名 reject → 无 unhandled rejection、warn 含错误类型、镜像标记 failed 且不上报', async () => {
    const host = makeModernHost({
      registerTool: vi.fn(async () => {
        throw new DOMException('Tool already registered: myTool', 'InvalidStateError');
      }),
    });
    installFakeHost(host);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    await flushAsync();

    expect(warn).toHaveBeenCalledTimes(1);
    // DOMException.message 不含错误类型，必须带 name 才可排障
    expect(warn.mock.calls[0][0]).toContain('InvalidStateError');
    expect(warn.mock.calls[0][0]).toContain('Tool already registered');

    // 幽灵工具防护：所有权镜像保留（scope 记账需要），但对外上报要过滤掉
    expect(getActiveToolStates()[0].nativeState).toBe('failed');
    expect(getActiveToolConfigs()).toEqual([]);
  });

  it.each([
    ['NotAllowedError', 'WebMCP is disabled by Permissions Policy', 'Permissions Policy'],
    ['SecurityError', '', 'origin-isolated'],
    [
      'NotSupportedError',
      'Cross-document tool exposure requires native WebMCP',
      'cross-document exposure',
    ],
  ])('宿主准入失败（%s）给出可诊断提示', async (name, message, expected) => {
    const host = makeModernHost({
      registerTool: vi.fn(async () => {
        throw new DOMException(message, name);
      }),
    });
    installFakeHost(host);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    await flushAsync();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(expected);
  });

  it('文档非 fully active（导航中）静默忽略，不告警', async () => {
    const host = makeModernHost({
      registerTool: vi.fn(async () => {
        throw new DOMException('The associated document is not fully active', 'InvalidStateError');
      }),
    });
    installFakeHost(host);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    await flushAsync();

    expect(warn).not.toHaveBeenCalled();
    expect(getActiveToolStates()[0].nativeState).toBe('failed');
  });

  it('注册途中 signal 被 abort 导致的 rejection 静默处理', async () => {
    const host = makeModernHost({
      registerTool: vi.fn((_tool: unknown, options?: { signal?: AbortSignal }) => {
        return new Promise<void>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(options.signal!.reason), {
            once: true,
          });
        });
      }),
    });
    installFakeHost(host);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    // 组件卸载：释放最后一个 owner → abort
    unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    await flushAsync();

    expect(warn).not.toHaveBeenCalled();
  });

  it('旧宿主：同步抛错时走 unregisterTool 重试路径', async () => {
    const unregisterTool = vi.fn();
    const registerTool = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('duplicate');
      })
      .mockImplementationOnce(() => undefined);
    // 旧宿主：无 getTools
    installFakeHost({ registerTool, unregisterTool });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });

    expect(unregisterTool).toHaveBeenCalledWith('myTool');
    expect(registerTool).toHaveBeenCalledTimes(2);
    // nativeState 的统一置位走 Promise.resolve().then()，需等一个微任务
    await Promise.resolve();
    expect(getActiveToolStates()[0].nativeState).toBe('registered');
  });

  it('旧宿主：重试仍失败时标记 failed 并告警', () => {
    const registerTool = vi.fn(() => {
      throw new Error('duplicate');
    });
    installFakeHost({ registerTool, unregisterTool: vi.fn() });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });

    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(getActiveToolStates()[0].nativeState).toBe('failed');
    expect(getActiveToolConfigs()).toEqual([]);
  });

  it('旧宿主：无 unregisterTool（Chrome 148+）时同步抛错不重试', () => {
    const registerTool = vi.fn(() => {
      throw new Error('duplicate');
    });
    installFakeHost({ registerTool });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });

    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('registerGlobalTools — 空描述兜底', () => {
  let host: ReturnType<typeof makeModernHost>;

  beforeEach(() => {
    host = makeModernHost();
    installFakeHost(host);
  });
  afterEach(() => teardownHost());

  it('空 description 回落为工具名并 warn 一次', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ submitForm: makeToolFn({ description: '' }) });

    expect(host.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'submitForm' }),
      { signal: expect.any(AbortSignal) },
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('empty description');
  });

  it('纯空白 description 同样回落', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ m: makeToolFn({ description: '   ' }) });
    expect(host.registerTool).toHaveBeenCalledWith(expect.objectContaining({ description: 'm' }), {
      signal: expect.any(AbortSignal),
    });
  });

  it('非空 description 不告警、原样传递', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerGlobalTools({ myTool: makeToolFn({ description: '列出待办' }) });
    expect(host.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({ description: '列出待办' }),
      { signal: expect.any(AbortSignal) },
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('registerGlobalTools — 现代宿主零 patch', () => {
  afterEach(() => teardownHost());

  it('不合成 listTools/callTool、不包装 registerTool、不手动派发 toolchange', () => {
    const originalRegisterTool = vi.fn(async () => {});
    const dispatchEvent = vi.fn(() => true);
    const host = makeModernHost({ registerTool: originalRegisterTool, dispatchEvent });
    installFakeHost(host);

    registerGlobalTools({ myTool: makeToolFn() });

    // 宿主实例未被写入任何合成方法（polyfill 刻意维持 "no own keys" 的 WebIDL 保真）
    expect((host as any).listTools).toBeUndefined();
    expect((host as any).callTool).toBeUndefined();
    expect((host as any).__toolchangeCoalesced).toBeUndefined();
    // registerTool 未被替换（旧实现的包装器会丢弃 Promise，正是 unhandled rejection 的来源）
    expect((host as any).registerTool).toBe(originalRegisterTool);
    expect(host.registerTool).toHaveBeenCalledTimes(1);
    // 协议规定 toolchange 派发责任在宿主，nexus 不再手动派发
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('SDK 工具全部卸载后，widget 载荷回落到宿主工具而非空列表', async () => {
    const thirdParty = { name: 'thirdParty', description: 'd', inputSchema: '{}' };
    const host = makeModernHost({
      // 旧宿主风格的同步 listTools：widget 通道的 tier-2 数据源
      listTools: vi.fn(() => [thirdParty]),
    });
    installFakeHost(host);
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const posted = vi.spyOn(iframe.contentWindow!, 'postMessage');

    registerGlobalTools({ myTool: makeToolFn() });
    unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    expect(getActiveToolNames()).toEqual([]);

    // schedulePushToolsToWidget 有 100ms 防抖
    await new Promise(resolve => setTimeout(resolve, 150));

    const payload = posted.mock.calls.at(-1)?.[0] as any;
    expect(payload.type).toBe('webmcp.tools.changed');
    expect(payload.tools.map((t: any) => t.name)).toEqual(['thirdParty']);

    iframe.remove();
    clearRegistry();
  });
});

describe('registerGlobalTools — 旧宿主保留全套 patch', () => {
  afterEach(() => teardownHost());

  it('补齐 EventTarget、包装 registerTool/unregisterTool 以桥接 toolchange', () => {
    const registerTool = vi.fn();
    const legacy = makeLegacyHost({ registerTool });
    installFakeHost(legacy);

    registerGlobalTools({ myTool: makeToolFn() });

    // 旧宿主无 getTools → nexus 补齐 EventTarget 并安装合并器
    expect(typeof (legacy as any).addEventListener).toBe('function');
    expect(typeof (legacy as any).dispatchEvent).toBe('function');
    expect((legacy as any).__toolchangeCoalesced).toBe(true);
    // registerTool 已被包装（旧宿主不会在规范入口派发 toolchange，必须由 nexus 桥接）
    expect((legacy as any).registerTool).not.toBe(registerTool);
    expect(registerTool).toHaveBeenCalledTimes(1);
  });

  it('包装器透传 registerTool 的返回值（旧实现的包装器无 return，是 Promise 被吞的根因）', () => {
    const sentinel = Promise.resolve();
    const legacy = makeLegacyHost({ registerTool: vi.fn(() => sentinel) });
    installFakeHost(legacy);
    registerGlobalTools({ myTool: makeToolFn() });

    expect((legacy as any).registerTool({ name: 'x' })).toBe(sentinel);
  });

  it('有 modelContextTesting 时合成 listTools/callTool（relay 2.x 的特征检测依赖）', async () => {
    const legacy = makeLegacyHost();
    installFakeHost(legacy);
    Object.defineProperty(navigator, 'modelContextTesting', {
      value: {
        listTools: () => [{ name: 'myTool', description: 'd', inputSchema: '{"type":"object"}' }],
        executeTool: async () => '{"ok":true}',
      },
      configurable: true,
      writable: true,
    });

    registerGlobalTools({ myTool: makeToolFn() });

    expect(typeof (legacy as any).listTools).toBe('function');
    expect(typeof (legacy as any).callTool).toBe('function');
    // testing 面的 inputSchema 是 JSON 字符串，合成时转为对象形态
    expect((legacy as any).listTools()).toEqual([
      { name: 'myTool', description: 'd', inputSchema: { type: 'object' } },
    ]);
    await expect((legacy as any).callTool({ name: 'myTool', arguments: {} })).resolves.toEqual({
      content: [{ type: 'text', text: '{"ok":true}' }],
      isError: false,
    });

    delete (navigator as any).modelContextTesting;
  });

  it('现代宿主不合成 listTools/callTool（协议面没有这两个方法）', () => {
    const host = makeModernHost();
    installFakeHost(host);
    Object.defineProperty(navigator, 'modelContextTesting', {
      value: { listTools: () => [], executeTool: async () => null },
      configurable: true,
      writable: true,
    });

    registerGlobalTools({ myTool: makeToolFn() });

    expect((host as any).listTools).toBeUndefined();
    expect((host as any).callTool).toBeUndefined();

    delete (navigator as any).modelContextTesting;
  });

  it('abort 时对带 unregisterTool 且无 polyfill 标记的宿主走 L2 注销兜底', () => {
    // patch 会替换 mc.unregisterTool，故必须持有原始 spy 引用才能断言
    const unregisterTool = vi.fn();
    installFakeHost(makeLegacyHost({ unregisterTool }));

    registerGlobalTools({ myTool: makeToolFn() });
    const released = unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });

    expect(released).toBe(true);
    expect(unregisterTool).toHaveBeenCalledWith('myTool');
  });

  it('带 __isWebMCPPolyfill 标记时跳过 L2 注销兜底', () => {
    const unregisterTool = vi.fn();
    installFakeHost(makeLegacyHost({ unregisterTool, __isWebMCPPolyfill: true }));

    registerGlobalTools({ myTool: makeToolFn() });
    const released = unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });

    expect(released).toBe(true);
    expect(unregisterTool).not.toHaveBeenCalled();
  });
});

describe('旧宿主合成规范面（relay 5.x 全档驱动）', () => {
  // testing 面的 inputSchema 是 JSON 字符串（pre-241 形态）
  const testingTools = [
    { name: 'myTool', description: 'd', inputSchema: '{"type":"object","properties":{}}' },
  ];
  let testingExecuteTool: any;

  beforeEach(() => {
    testingExecuteTool = vi.fn(async (_name: string, _json: string) => '{"ok":1}');
    installFakeHost(makeLegacyHost()); // 旧宿主：无 getTools / executeTool
    (navigator as any).modelContextTesting = {
      listTools: () => testingTools,
      executeTool: testingExecuteTool,
    };
  });

  afterEach(() => {
    delete (navigator as any).modelContextTesting;
    teardownHost();
  });

  it('合成 getTools/executeTool，relay 5.x 的 hasDescriptorToolApi 判据通过', async () => {
    registerGlobalTools({ myTool: makeToolFn() });
    const mc = getModelContext() as any;

    expect('executeTool' in mc).toBe(true);
    expect(typeof mc.executeTool).toBe('function');
    expect(typeof mc.getTools).toBe('function');

    const tools = await mc.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({ name: 'myTool', title: 'myTool', description: 'd' });
    // testing 面的 string inputSchema 被归一为 object
    expect(typeof tools[0].inputSchema).toBe('object');
    // RegisteredTool 四键，供 relay 按对象回传 executeTool 时形态合法
    expect(tools[0].window).toBe(window);
    expect(typeof tools[0].origin).toBe('string');
  });

  it('合成 executeTool 委托到 testing.executeTool（按名调用）', async () => {
    registerGlobalTools({ myTool: makeToolFn() });
    const mc = getModelContext() as any;
    const tools = await mc.getTools();

    const result = await mc.executeTool(tools[0], '{"a":1}');

    expect(testingExecuteTool).toHaveBeenCalledWith('myTool', '{"a":1}');
    expect(result).toBe('{"ok":1}');
  });

  it('合成后 isModernHost 仍为 false（标记生效），旧宿主仍手动派发 toolchange', () => {
    registerGlobalTools({ myTool: makeToolFn() });
    const mc = getModelContext() as any;

    expect(isModernHost(mc)).toBe(false);
    // 旧宿主不自派发：nexus 补齐的 dispatchEvent 应存在，供 notifyToolsChanged 手动派发
    expect(typeof mc.dispatchEvent).toBe('function');
  });

  it('现代宿主缺 executeTool 但有 testing 时只合成 executeTool，不替换 getTools', () => {
    teardownHost();
    const modern = makeModernHost(); // 默认带 getTools、不带 executeTool
    installFakeHost(modern);
    (navigator as any).modelContextTesting = {
      listTools: () => testingTools,
      executeTool: testingExecuteTool,
    };

    registerGlobalTools({ myTool: makeToolFn() });
    const mc = getModelContext() as any;

    expect(typeof mc.executeTool).toBe('function');
    expect(mc.getTools).toBe(modern.getTools); // getTools 未被替换
    expect(isModernHost(mc)).toBe(true); // 合成 executeTool 不改变现代判定
  });

  it('既无 executeTool 又无 testing 时合成版抛 NotSupportedError 而非静默返回', async () => {
    teardownHost();
    delete (navigator as any).modelContextTesting;
    installFakeHost(makeLegacyHost());

    registerGlobalTools({ myTool: makeToolFn() });
    const mc = getModelContext() as any;

    await expect(mc.executeTool({ name: 'myTool' }, '{}')).rejects.toMatchObject({
      name: 'NotSupportedError',
    });
  });
});

describe('registerGlobalTools 与内置工具', () => {
  let host: ReturnType<typeof makeModernHost>;

  beforeEach(() => {
    // 先翻开关、再装宿主：configureBuiltinTools 的 enable 分支在宿主可用时会立即补注册，
    // 那样内置工具就是 beforeEach 注册的了，测不到 registerGlobalTools 自己会不会注册。
    configureBuiltinTools({ callTool: true });
    host = makeModernHost();
    installFakeHost(host);
  });

  afterEach(() => {
    teardownHost();
  });

  function registeredNames(): string[] {
    return host.registerTool.mock.calls.map(c => c[0].name as string);
  }

  it('内置工具先于用户工具注册（开关由 beforeEach 打开）', () => {
    registerGlobalTools({ myTool: makeToolFn() });

    expect(registeredNames()).toEqual([CALL_TOOL_NAME, 'myTool']);
    expect(getActiveToolNames()).toEqual([CALL_TOOL_NAME, 'myTool']);
  });

  it('宿主不可用时即使开关是开的也不注册（早退顺序不能挪）', () => {
    // jsdom 下「无宿主」必须靠 stub navigator 才造得出来：registerGlobalTools 的第一步
    // ensureModelContextPolyfill() 在没有任何 context 时会**自己装一个 polyfill**，于是
    // isModelContextAvailable() 恒为真、早退分支不可达 —— 上面那条既有的
    // 「document/navigator 都没有 modelContext 时静默跳过」用例只能断言旧假宿主的 spy
    // 没被调用，原因就在这里。stub 掉 navigator 后 ensureModelContextPolyfill 的环境守卫
    // 早退、polyfill 不安装，早退分支才真正可达。
    teardownHost();
    vi.stubGlobal('navigator', undefined);
    try {
      configureBuiltinTools({ callTool: true });

      expect(() => registerGlobalTools({ myTool: makeToolFn() })).not.toThrow();

      // ensureBuiltinTools() 必须留在 isModelContextAvailable() 早退**之后**：挪到前面就会
      // 在无宿主页面往 activeTools 塞一条永远注册不上宿主的幽灵记录
      expect(getActiveToolNames()).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('不传任何工具也会注册内置工具', () => {
    registerGlobalTools();

    expect(registeredNames()).toEqual([CALL_TOOL_NAME]);
  });

  it('configureBuiltinTools({ callTool: false }) 时不注册内置工具', () => {
    configureBuiltinTools({ callTool: false });

    registerGlobalTools({ myTool: makeToolFn() });

    expect(registeredNames()).toEqual(['myTool']);
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('重复调用 registerGlobalTools 不重复注册内置工具', () => {
    registerGlobalTools({ myTool: makeToolFn() });
    registerGlobalTools({ otherTool: makeToolFn() });

    expect(registeredNames().filter(n => n === CALL_TOOL_NAME)).toHaveLength(1);
  });

  it('CALL_TOOL_NAME 是保留名：用户同名工具被内置版覆盖并告警', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ [CALL_TOOL_NAME]: makeToolFn() });

    // 原生只注册一次，首注册者（内置）的 config 胜出，用户的 'test tool' 描述被忽略
    const calls = host.registerTool.mock.calls.filter(c => c[0].name === CALL_TOOL_NAME);
    expect(calls).toHaveLength(1);
    expect(calls[0][0].description).not.toBe('test tool');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('already registered'));
  });

  it('生产默认值：不做任何 configure，内置工具就注册', async () => {
    // setup.ts 的全局 beforeEach 关掉的是**已加载模块实例**上的开关，所以本文件其余用例
    // 都得显式开启 —— 代价是 `let callToolEnabled = true` 这个初值本身没有任何用例观察。
    // 谁把默认值改坏，全仓测试照样全绿，而客户端快照的逃生口会整体消失（那正是这个功能
    // 存在的全部理由）。这里用 resetModules + 动态 import 取一套全新实例来锁住初值。
    // 必须放在本文件最后：resetModules 之后的 import 拿到的都是新实例。
    vi.resetModules();
    const fresh = await import('../registerGlobalTools');
    const freshRegistry = await import('../registry');
    const freshHost = makeModernHost();
    installFakeHost(freshHost);

    fresh.registerGlobalTools({ myTool: makeToolFn() });

    expect(freshHost.registerTool.mock.calls.map(c => c[0].name)).toContain(CALL_TOOL_NAME);
    expect(freshRegistry.getActiveToolNames()).toContain(CALL_TOOL_NAME);
  });
});
