import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ensureModelContextPolyfill, __resetPolyfillStateForTest } from '../polyfill';
import { registerGlobalTools } from '../registerGlobalTools';
import { clearRegistry, getActiveToolNames } from '../registry';

function makeToolFn() {
  const fn = async (input: any) => input;
  (fn as any).__webmcpSchema = {
    description: 'test tool',
    inputSchema: { type: 'object', properties: {} },
  };
  return fn;
}

describe('ensureModelContextPolyfill', () => {
  let originalNavigator: any;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
    __resetPolyfillStateForTest();
  });

  afterEach(() => {
    __resetPolyfillStateForTest();
    clearRegistry();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  // 场景 A：navigator.modelContext 缺失时自动安装 polyfill
  it('navigator.modelContext 缺失时安装 polyfill 并暴露核心 API', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    expect('modelContext' in navigator).toBe(false);

    ensureModelContextPolyfill();

    expect('modelContext' in navigator).toBe(true);
    const mc = navigator.modelContext as any;
    expect(typeof mc.registerTool).toBe('function');
    expect(typeof mc.unregisterTool).toBe('function');
    expect(typeof (navigator as any).modelContextTesting?.listTools).toBe('function');
  });

  // 场景 A 延伸：polyfill 装入后 registerGlobalTools 能注册并通过 modelContextTesting.listTools 看到
  it('polyfill 装入后 registerGlobalTools 注册的工具可被 modelContextTesting.listTools 看到', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });

    const testingTools = (navigator as any).modelContextTesting.listTools();
    expect(testingTools).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'myTool' })]),
    );
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  // 场景 B：原生 modelContext 已存在时 polyfill 不动它
  it('原生 modelContext 已存在时 polyfill 不覆盖（非破坏性）', () => {
    const nativeMc = {
      registerTool: vi.fn(),
      unregisterTool: vi.fn(),
      __nativeMarker: true,
    };
    Object.defineProperty(globalThis, 'navigator', {
      value: { modelContext: nativeMc },
      configurable: true,
      writable: true,
    });

    ensureModelContextPolyfill();

    expect((navigator.modelContext as any).__nativeMarker).toBe(true);
    expect(navigator.modelContext).toBe(nativeMc);
  });

  // 场景 B 延伸：attempted 单次标志保证多次调用幂等
  it('多次调用幂等：第一次决定后续行为，attempted 不重置', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    ensureModelContextPolyfill();
    const firstMc = navigator.modelContext;

    // 即便外部把 modelContext 删掉，再调用也不会重装（attempted=true）
    delete (navigator as any).modelContext;
    ensureModelContextPolyfill();

    expect('modelContext' in navigator).toBe(false);
    expect(firstMc).toBeDefined();
  });

  // 场景 C：bridge 之后 modelContext.listTools/callTool 与 modelContextTesting 等价
  it('patchModelContextEventSupport bridge 后 modelContext.listTools 与 modelContextTesting.listTools 同源', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });

    const mc = navigator.modelContext as any;
    const testingTools = (navigator as any).modelContextTesting.listTools();

    // SDK bridge 在 polyfill 不带 listTools 时会从 modelContextTesting 桥过来
    expect(typeof mc.listTools).toBe('function');
    const bridgedTools = mc.listTools();

    expect(bridgedTools.map((t: any) => t.name)).toEqual(testingTools.map((t: any) => t.name));
    expect(bridgedTools[0].inputSchema).toEqual({ type: 'object', properties: {} });
  });

  // 场景 C 延伸：通过 abort signal 注销原生工具，与 W3C 规范一致
  it('unregister 走 abort signal 路径：模拟组件卸载后 modelContextTesting.listTools 同步移除', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });

    expect(getActiveToolNames()).toEqual(['myTool']);

    // 通过 SDK 公共路径释放：直接 abort registry 内的 controller 不暴露，
    // 这里调用 polyfill 自身的 unregisterTool 验证与 abort 等效（webmcp-polyfill 仍提供该方法）
    const mc = navigator.modelContext as any;
    mc.unregisterTool('myTool');

    const testingTools = (navigator as any).modelContextTesting.listTools();
    expect(testingTools.some((t: any) => t.name === 'myTool')).toBe(false);
  });

  it('navigator 未定义时（SSR）静默跳过', () => {
    delete (globalThis as any).navigator;
    expect(() => ensureModelContextPolyfill()).not.toThrow();
    expect((globalThis as any).navigator).toBeUndefined();
  });

  // SDK 在 abort 时不应再调用 unregisterTool（polyfill 2.x 自管理 signal）：
  // 既避免双重操作，又避开 polyfill 的 one-time deprecation warning
  it('polyfill 标记存在时，abort handler 跳过 unregisterTool L2 fallback', () => {
    const unregisterSpy = vi.fn();
    const registerSpy = vi.fn((_tool: any, options?: { signal?: AbortSignal }) => {
      // 模拟 polyfill 2.x 的原生 signal 处理：内部监听 abort 即删除工具
      options?.signal?.addEventListener('abort', () => {}, { once: true });
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: registerSpy,
          unregisterTool: unregisterSpy,
          __isWebMCPPolyfill: true,
        },
      },
      configurable: true,
      writable: true,
    });

    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });
    expect(registerSpy).toHaveBeenCalledTimes(1);

    // 通过清理 registry 触发所有 abort（unregisterScopedTool 路径同样会走 abort handler）
    clearRegistry();

    // abort handler 应跳过 unregisterTool fallback
    expect(unregisterSpy).not.toHaveBeenCalled();
  });

  // Chrome 146/147 原生（无 polyfill 标记）时仍走 L2 fallback 注销
  it('无 polyfill 标记的 modelContext，abort handler 仍调用 unregisterTool L2 fallback', async () => {
    const { unregisterScopedTool } = await import('../registry');
    const unregisterSpy = vi.fn();
    const registerSpy = vi.fn();
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: registerSpy,
          unregisterTool: unregisterSpy,
          // 注意：无 __isWebMCPPolyfill 标记
        },
      },
      configurable: true,
      writable: true,
    });

    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });

    // 模拟 owner 释放走完整生命周期：unregisterScopedTool → controller.abort → handler
    const released = unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    expect(released).toBe(true);
    expect(unregisterSpy).toHaveBeenCalledWith('myTool');
  });
});
