import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebMcpTools } from '../useWebMcpTools';
import { getActiveToolNames } from '../registry';
import { installFakeHost, teardownHost } from './host-helpers';
import { CALL_TOOL_NAME, configureBuiltinTools } from '../builtinTools';

function makeToolFn(schemaOverrides?: Record<string, unknown>) {
  const fn = async (input: any) => input;
  (fn as any).__webmcpSchema = {
    description: 'test tool',
    inputSchema: { type: 'object', properties: {} },
    ...schemaOverrides,
  };
  return fn;
}

/** widget 推送的 targetOrigin：relay 的 widget 是 blob iframe、与宿主同源，不用 '*' */
const WIDGET_TARGET_ORIGIN = 'http://localhost:3000';

describe('useWebMcpTools', () => {
  const mockRegisterTool = vi.fn();
  const mockUnregisterTool = vi.fn();

  beforeEach(() => {
    installFakeHost({
      registerTool: mockRegisterTool,
      unregisterTool: mockUnregisterTool,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    mockRegisterTool.mockReset();
    mockUnregisterTool.mockReset();
    teardownHost();
  });

  it('mount 时注册工具', () => {
    const fn = makeToolFn();
    renderHook(() => useWebMcpTools({ myTool: fn }));
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'myTool' }), {
      signal: expect.any(AbortSignal),
    });
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('unmount 时释放最后 owner 并触发旧环境 fallback 注销', () => {
    const fn = makeToolFn();
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: fn }));
    unmount();
    expect(mockUnregisterTool).toHaveBeenCalledWith('myTool');
    expect(getActiveToolNames()).toEqual([]);
  });

  it('Chrome 148+ 无 unregisterTool 时 unmount 不抛错', () => {
    teardownHost();
    installFakeHost({ registerTool: mockRegisterTool });
    const fn = makeToolFn();
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: fn }));
    expect(() => unmount()).not.toThrow();
    expect(getActiveToolNames()).toEqual([]);
  });

  it('unmount 后立即向 widget 推送删除后的工具列表', () => {
    const nativeTools = new Map<string, any>();
    mockRegisterTool.mockImplementation((tool: any, options?: { signal?: AbortSignal }) => {
      nativeTools.set(tool.name, tool);
      options?.signal?.addEventListener(
        'abort',
        () => {
          nativeTools.delete(tool.name);
        },
        { once: true },
      );
    });
    teardownHost();
    installFakeHost({ registerTool: mockRegisterTool });
    Object.defineProperty(navigator, 'modelContextTesting', {
      value: {
        listTools: () =>
          Array.from(nativeTools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: JSON.stringify(tool.inputSchema),
          })),
      },
      configurable: true,
      writable: true,
    });
    document.body.innerHTML = '<iframe></iframe>';
    const iframe = document.querySelector('iframe');
    const postMessageSpy = vi
      .spyOn(iframe!.contentWindow!, 'postMessage')
      .mockImplementation(() => {});

    const fn = makeToolFn();
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: fn }));
    postMessageSpy.mockClear();

    vi.useFakeTimers();
    unmount();
    vi.advanceTimersByTime(100);
    vi.useRealTimers();

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'webmcp.tools.changed', tools: [] },
      WIDGET_TARGET_ORIGIN,
    );
    delete (navigator as any).modelContextTesting;
  });

  it('宿主 listTools 未随 signal 同步时，widget 靠 ownership 过滤推送正确列表', () => {
    const nativeTools = new Map<string, any>();
    mockRegisterTool.mockImplementation((tool: any) => {
      nativeTools.set(tool.name, tool);
      // 模拟 Chrome 146/147：registerTool 接受 options 但未把 signal 绑定到工具表
    });
    teardownHost();
    installFakeHost({
      registerTool: mockRegisterTool,
      listTools: () =>
        Array.from(nativeTools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: JSON.stringify(tool.inputSchema),
        })),
    });
    document.body.innerHTML = '<iframe></iframe>';
    const iframe = document.querySelector('iframe');
    const postMessageSpy = vi
      .spyOn(iframe!.contentWindow!, 'postMessage')
      .mockImplementation(() => {});

    const fn = makeToolFn();
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: fn }));
    postMessageSpy.mockClear();

    vi.useFakeTimers();
    unmount();
    vi.advanceTimersByTime(100);
    vi.useRealTimers();

    // 宿主仍残留该工具，但它属于 SDK 托管且已卸载 → 必须被 ownership 过滤掉
    expect(nativeTools.has('myTool')).toBe(true);
    expect(getActiveToolNames()).toEqual([]);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'webmcp.tools.changed', tools: [] },
      WIDGET_TARGET_ORIGIN,
    );
  });

  it('document/navigator 都没有 modelContext 时静默跳过', () => {
    teardownHost();
    const fn = makeToolFn();
    expect(() => {
      renderHook(() => useWebMcpTools({ myTool: fn }));
    }).not.toThrow();
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('跳过无 schema 的函数', () => {
    const plainFn = async () => {};
    renderHook(() => useWebMcpTools({ plainFn }));
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('toolKeys 变化触发重新注册', () => {
    const fn1 = makeToolFn();
    const fn2 = makeToolFn();
    const { rerender } = renderHook(({ tools }) => useWebMcpTools(tools), {
      initialProps: { tools: { a: fn1 } as Record<string, Function> },
    });
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);

    // 增加工具 b → toolKeys 变化
    rerender({ tools: { a: fn1, b: fn2 } });
    // cleanup 注销旧的，再注册新的两个
    expect(mockUnregisterTool).toHaveBeenCalledWith('a');
    expect(mockRegisterTool).toHaveBeenCalledTimes(3); // 1 (初始) + 2 (重新注册 a, b)
  });

  it('函数体变化不触发重新注册（ref 机制）', () => {
    const fn1 = makeToolFn();
    const fn2 = makeToolFn();
    const { rerender } = renderHook(({ tools }) => useWebMcpTools(tools), {
      initialProps: { tools: { myTool: fn1 } as Record<string, Function> },
    });
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);

    // 相同 key，不同函数引用 → 不应重新注册
    rerender({ tools: { myTool: fn2 } });
    expect(mockRegisterTool).toHaveBeenCalledTimes(1); // 没有额外调用
  });

  it('scope ownership 集成：两个 hook 实例注册同名工具，第一个 unmount 不调用 unregisterTool', () => {
    const fn1 = makeToolFn();
    const fn2 = makeToolFn();

    const { unmount: unmount1 } = renderHook(() => useWebMcpTools({ sharedTool: fn1 }));
    const { unmount: unmount2 } = renderHook(() => useWebMcpTools({ sharedTool: fn2 }));

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);

    unmount1();
    expect(mockUnregisterTool).not.toHaveBeenCalled();
    expect(getActiveToolNames()).toEqual(['sharedTool']);

    unmount2();
    expect(mockUnregisterTool).toHaveBeenCalledWith('sharedTool');
    expect(getActiveToolNames()).toEqual([]);
  });

  it('同名工具首个 owner 卸载后 execute 切换到仍存活 owner', async () => {
    const fn1 = vi.fn(async () => 'first');
    (fn1 as any).__webmcpSchema = {
      description: 'first tool',
      inputSchema: { type: 'object', properties: {} },
    };
    const fn2 = vi.fn(async () => 'second');
    (fn2 as any).__webmcpSchema = {
      description: 'second tool',
      inputSchema: { type: 'object', properties: {} },
    };

    const { unmount: unmount1 } = renderHook(() => useWebMcpTools({ sharedTool: fn1 }));
    renderHook(() => useWebMcpTools({ sharedTool: fn2 }));

    const registeredTool = mockRegisterTool.mock.calls[0][0];
    expect(await registeredTool.execute({})).toBe('first');

    unmount1();

    expect(await registeredTool.execute({})).toBe('second');
  });

  it('execute 通过 ref 间接调用保证使用最新函数', async () => {
    const fn1 = vi.fn(async () => 'v1');
    (fn1 as any).__webmcpSchema = {
      description: 'test',
      inputSchema: { type: 'object', properties: {} },
    };
    const fn2 = vi.fn(async () => 'v2');
    (fn2 as any).__webmcpSchema = {
      description: 'test',
      inputSchema: { type: 'object', properties: {} },
    };

    const { rerender } = renderHook(({ tools }) => useWebMcpTools(tools), {
      initialProps: { tools: { myTool: fn1 } as Record<string, Function> },
    });

    // 函数引用变化，但 key 不变 → 不重新注册，但 ref 更新
    rerender({ tools: { myTool: fn2 } });

    // 调用原来注册的 execute，应该执行 fn2（最新的）
    const registeredTool = mockRegisterTool.mock.calls[0][0];
    const result = await registeredTool.execute({});
    expect(result).toBe('v2');
  });

  it('handles StrictMode double-mount correctly', () => {
    const fn = makeToolFn();

    // 第一次 mount → 注册
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: fn }));
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);

    // 第一次 unmount（模拟 StrictMode cleanup）
    unmount();
    expect(mockUnregisterTool).toHaveBeenCalledTimes(1);

    // 第二次 mount（模拟 StrictMode 重新挂载）
    const { unmount: unmount2 } = renderHook(() => useWebMcpTools({ myTool: fn }));
    expect(mockRegisterTool).toHaveBeenCalledTimes(2);

    // 第二次 unmount
    unmount2();
    expect(mockUnregisterTool).toHaveBeenCalledTimes(2);
  });

  it('SSR（navigator 未定义）静默跳过', () => {
    // 先 teardown 移除 beforeEach 装在 document 上的假宿主（否则 getModelContext 仍会从
    // 规范入口拿到它）；再只 stub navigator —— 连 document 一起 stub 会让
    // @testing-library/react 无法渲染（renderHook 需要 document.body）。
    // document 缺失的 SSR 路径由 polyfill.test.ts 与 getModelContext 的用例覆盖。
    teardownHost();
    vi.stubGlobal('navigator', undefined);
    try {
      const fn = makeToolFn();
      expect(() => {
        renderHook(() => useWebMcpTools({ myTool: fn }));
      }).not.toThrow();
      expect(mockRegisterTool).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('useWebMcpTools 与内置工具', () => {
  const registerTool = vi.fn();

  beforeEach(() => {
    registerTool.mockReset();
    // 先翻开关、再装宿主：configureBuiltinTools 的 enable 分支在宿主可用时会立即补注册，
    // 那样内置工具就是 beforeEach 注册的了，测不到 useWebMcpTools 自己会不会注册。
    // 这个顺序下注册只能由被测入口触发。
    configureBuiltinTools({ callTool: true });
    installFakeHost({ registerTool });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    teardownHost();
  });

  function registeredNames(): string[] {
    return registerTool.mock.calls.map(c => c[0].name as string);
  }

  it('不调 registerGlobalTools 也会自动注册 webmcpCallTool', () => {
    renderHook(() => useWebMcpTools({ myTool: makeToolFn() }));

    expect(registeredNames()).toEqual([CALL_TOOL_NAME, 'myTool']);
    expect(getActiveToolNames()).toContain(CALL_TOOL_NAME);
  });

  it('内置工具是 global scope，组件卸载不会带走它', () => {
    const { unmount } = renderHook(() => useWebMcpTools({ myTool: makeToolFn() }));

    unmount();

    expect(getActiveToolNames()).toEqual([CALL_TOOL_NAME]);
  });

  it('多个组件重复挂载不重复注册内置工具', () => {
    renderHook(() => useWebMcpTools({ aTool: makeToolFn() }));
    renderHook(() => useWebMcpTools({ bTool: makeToolFn() }));

    expect(registeredNames().filter(n => n === CALL_TOOL_NAME)).toHaveLength(1);
  });

  it('configureBuiltinTools({ callTool: false }) 时只注册用户工具', () => {
    configureBuiltinTools({ callTool: false });

    renderHook(() => useWebMcpTools({ myTool: makeToolFn() }));

    expect(registeredNames()).toEqual(['myTool']);
  });
});
