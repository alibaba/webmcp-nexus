import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebMcpTools } from '../useWebMcpTools';
import { clearRegistry, getActiveToolNames } from '../registry';

function makeToolFn(schemaOverrides?: Record<string, unknown>) {
  const fn = async (input: any) => input;
  (fn as any).__webmcpSchema = {
    description: 'test tool',
    inputSchema: { type: 'object', properties: {} },
    ...schemaOverrides,
  };
  return fn;
}

describe('useWebMcpTools', () => {
  const mockRegisterTool = vi.fn();
  const mockUnregisterTool = vi.fn();
  let originalNavigator: any;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
          unregisterTool: mockUnregisterTool,
        },
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    clearRegistry();
    document.body.innerHTML = '';
    mockRegisterTool.mockClear();
    mockUnregisterTool.mockClear();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
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
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
        },
      },
      configurable: true,
      writable: true,
    });
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
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
        },
        modelContextTesting: {
          listTools: () =>
            Array.from(nativeTools.values()).map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: JSON.stringify(tool.inputSchema),
            })),
        },
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

    unmount();

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'webmcp.tools.changed', tools: [] },
      '*',
    );
  });

  it('原生 listTools 未随 signal 同步时，widget 使用 SDK activeTools 推送正确列表', () => {
    const nativeTools = new Map<string, any>();
    mockRegisterTool.mockImplementation((tool: any) => {
      nativeTools.set(tool.name, tool);
      // 模拟当前 demo 中观察到的环境：registerTool 接受 options 但未把 signal 绑定到 listTools。
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
          listTools: () =>
            Array.from(nativeTools.values()).map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: JSON.stringify(tool.inputSchema),
            })),
        },
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

    unmount();

    expect(nativeTools.has('myTool')).toBe(true);
    expect(getActiveToolNames()).toEqual([]);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'webmcp.tools.changed', tools: [] },
      '*',
    );
  });

  it('navigator.modelContext 不存在时静默跳过', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });
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

  it('navigator 未定义时（SSR）静默跳过', () => {
    const originalNav = globalThis.navigator;
    delete (globalThis as any).navigator;
    try {
      const fn = makeToolFn();
      expect(() => {
        renderHook(() => useWebMcpTools({ myTool: fn }));
      }).not.toThrow();
      expect(mockRegisterTool).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNav,
        configurable: true,
        writable: true,
      });
    }
  });
});
