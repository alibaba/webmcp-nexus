import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ensureModelContextPolyfill,
  __resetPolyfillStateForTest,
  __cleanupPolyfillOnlyForTest,
} from '../polyfill';
import { registerGlobalTools } from '../registerGlobalTools';
import { getActiveToolNames, unregisterScopedTool } from '../registry';
import { getModelContext, isModernHost } from '../model-context';
import { installDocumentOnlyHost, installNavigatorOnlyHost, teardownHost } from './host-helpers';

function makeToolFn() {
  const fn = async (input: any) => input;
  (fn as any).__webmcpSchema = {
    description: 'test tool',
    inputSchema: { type: 'object', properties: {} },
  };
  return fn;
}

/** 等待 polyfill 的 #notifyToolsChanged（内部 await setTimeout(0)）落地 */
function flushHostTasks() {
  return new Promise(resolve => setTimeout(resolve, 20));
}

describe('ensureModelContextPolyfill — polyfill 自持 context', () => {
  beforeEach(() => {
    __resetPolyfillStateForTest();
  });

  afterEach(() => {
    teardownHost();
  });

  it('document.modelContext 缺失时安装 polyfill 并暴露 v5 规范面', () => {
    expect('modelContext' in document).toBe(false);

    ensureModelContextPolyfill();

    expect('modelContext' in document).toBe(true);
    const mc = document.modelContext as any;
    // 规范面 + Chromium 扩展
    expect(typeof mc.registerTool).toBe('function');
    expect(typeof mc.getTools).toBe('function');
    expect(typeof mc.executeTool).toBe('function');
    // v5 已移除 unregisterTool，注销统一走 AbortSignal
    expect(mc.unregisterTool).toBeUndefined();
    // 协议面不含 listTools/callTool（前者是 MCP-B 扩展，后者 5.x 已从 MCP-B 移除）
    expect(mc.listTools).toBeUndefined();
    expect(mc.callTool).toBeUndefined();
    expect(mc.__isWebMCPPolyfill).toBe(true);
    expect(mc instanceof EventTarget).toBe(true);
    // installTestingShim: true 且 polyfill 自持 context → shim 装在 navigator 上
    expect(typeof (navigator as any).modelContextTesting?.listTools).toBe('function');
  });

  it('注册的工具同时可被 getTools() 与 modelContextTesting.listTools() 看到', async () => {
    registerGlobalTools({ myTool: makeToolFn() });

    expect(getActiveToolNames()).toEqual(['myTool']);

    const mc = document.modelContext as any;
    const tools = await mc.getTools();
    expect(tools.map((t: any) => t.name)).toContain('myTool');
    // polyfill 5 自持 context 时 inputSchema 是 JSON Schema 对象（webmcp#241）。
    // 注意：这验证的是 polyfill 的形态，Chrome 149+ 的 same-document 工具仍返回字符串。
    expect(typeof tools.find((t: any) => t.name === 'myTool').inputSchema).toBe('object');

    const testingTools = (navigator as any).modelContextTesting.listTools();
    expect(testingTools.map((t: any) => t.name)).toContain('myTool');
    // testing 面是 pre-241 的形态：inputSchema 仍是序列化字符串
    expect(typeof testingTools.find((t: any) => t.name === 'myTool').inputSchema).toBe('string');
  });

  it('navigator.modelContext 已废弃别名返回同一实例，且首次访问恰好 warn 一次', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    ensureModelContextPolyfill();

    const viaDocument = document.modelContext;
    expect(warn).not.toHaveBeenCalled();

    const viaNavigator = (navigator as any).modelContext;
    expect(viaNavigator).toBe(viaDocument);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('navigator.modelContext is deprecated');

    // 一次性告警：第二次访问不再重复
    void (navigator as any).modelContext;
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('SDK 全链路走 document，不触发已废弃别名的 deprecation warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerGlobalTools({ myTool: makeToolFn() });
    await flushHostTasks();
    unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    await flushHostTasks();

    expect(warn.mock.calls.map(c => String(c[0]))).toEqual(
      expect.not.arrayContaining([expect.stringContaining('is deprecated')]),
    );
  });

  it('多次调用幂等：卸载后不重装（attempted 不重置）', () => {
    ensureModelContextPolyfill();
    const firstMc = document.modelContext;
    expect(firstMc).toBeDefined();

    // polyfill 5 把 modelContext 定义在 Document.prototype 上（WebIDL 的 [SameObject]
    // readonly attribute），delete document.modelContext 对原型链无效、in 恒为 true，
    // 必须用只 cleanup 不重置 attempted 的钩子才能观测"卸载后不重装"
    __cleanupPolyfillOnlyForTest();
    expect(document.modelContext).toBeUndefined();

    ensureModelContextPolyfill();
    expect(document.modelContext).toBeUndefined();
  });

  it('abort 注销：unregisterScopedTool 后 getTools() 不再含该工具', async () => {
    registerGlobalTools({ myTool: makeToolFn() });
    expect(getActiveToolNames()).toEqual(['myTool']);

    // v5 移除了 unregisterTool，注销只能走 registerTool 时传入的 AbortSignal
    const released = unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    expect(released).toBe(true);

    const tools = await (document.modelContext as any).getTools();
    expect(tools.map((t: any) => t.name)).not.toContain('myTool');
    expect((navigator as any).modelContextTesting.listTools()).toEqual([]);
  });

  it('现代宿主判定成立，且 patchModelContextEventSupport 不写**可枚举** own key', async () => {
    registerGlobalTools({ myTool: makeToolFn() });
    await flushHostTasks();

    const mc = document.modelContext as any;
    expect(isModernHost(mc)).toBe(true);
    // polyfill 刻意维持 "Chrome's ModelContext instance has no own keys" 的 WebIDL 保真。
    // nexus 现在会在现代宿主上装 getTools/executeTool 的形态归一包装，但用的是
    // defineHiddenProperty（enumerable: false），所以可枚举 own key 仍为空。
    expect(Object.keys(mc)).toEqual([]);
    expect({ ...mc }).toEqual({});
    // 归一层确实装上了（own property 存在，只是不可枚举）
    expect(mc.__webmcpNexusGetToolsWrapped).toBe(true);
    expect(mc.__webmcpNexusExecuteToolWrapped).toBe(true);
    // registerTool 未被包装，arity 仍是 1（WebIDL idlharness 会检查）
    expect(mc.registerTool.length).toBe(1);
    expect(mc.listTools).toBeUndefined();
    expect(mc.callTool).toBeUndefined();
    expect(mc.__toolchangeCoalesced).toBeUndefined();
  });

  it('一次注册只派发 1 次 toolchange（nexus 不再与宿主重复派发）', async () => {
    ensureModelContextPolyfill();
    const onToolChange = vi.fn();
    (document.modelContext as any).addEventListener('toolchange', onToolChange);

    registerGlobalTools({ myTool: makeToolFn() });
    await flushHostTasks();

    expect(onToolChange).toHaveBeenCalledTimes(1);
  });

  it('一次注销只派发 1 次 toolchange', async () => {
    registerGlobalTools({ myTool: makeToolFn() });
    await flushHostTasks();

    const onToolChange = vi.fn();
    (document.modelContext as any).addEventListener('toolchange', onToolChange);

    unregisterScopedTool('myTool', { scope: 'global', scopeId: 'app' });
    await flushHostTasks();

    expect(onToolChange).toHaveBeenCalledTimes(1);
  });
});

describe('ensureModelContextPolyfill — 非破坏性', () => {
  beforeEach(() => {
    __resetPolyfillStateForTest();
  });
  afterEach(() => {
    teardownHost();
  });

  it('原生 document.modelContext 已存在时 polyfill 完全不介入（Chrome 150+）', () => {
    const native = { registerTool: vi.fn(), getTools: vi.fn(async () => []), __nativeMarker: true };
    installDocumentOnlyHost(native);

    ensureModelContextPolyfill();

    expect(document.modelContext).toBe(native as any);
    expect((document.modelContext as any).__nativeMarker).toBe(true);
    // 早退发生在安装之前：不装 navigator 别名、不装 testing shim、不装 window.ModelContext
    expect('modelContext' in navigator).toBe(false);
    expect((navigator as any).modelContextTesting).toBeUndefined();
    expect((window as any).ModelContext).toBeUndefined();
  });

  it('只有原生 navigator.modelContext 时做入口桥接（Chrome 146–149）', () => {
    const native = { registerTool: vi.fn(), __nativeMarker: true };
    installNavigatorOnlyHost(native);

    ensureModelContextPolyfill();

    // 桥接：同一实例出现在规范入口上，不替换、不包装原生实现
    expect(document.modelContext).toBe(native as any);
    expect((navigator as any).modelContext).toBe(native);
    // 早退发生在装 shim 之前 → installTestingShim 在这一档不生效。
    // 这正是 relay 2.x 在原生 Chrome 下不可用、必须升到 5.x 的原因。
    expect((navigator as any).modelContextTesting).toBeUndefined();
  });

  it('getModelContext() 优先返回 document 面', () => {
    const onDocument = { registerTool: vi.fn(), getTools: vi.fn(async () => []) };
    const onNavigator = { registerTool: vi.fn() };
    installDocumentOnlyHost(onDocument);
    installNavigatorOnlyHost(onNavigator);

    expect(getModelContext()).toBe(onDocument as any);
  });

  it('只有 navigator 面时 getModelContext() 回退到它', () => {
    const onNavigator = { registerTool: vi.fn() };
    installNavigatorOnlyHost(onNavigator);

    expect(getModelContext()).toBe(onNavigator as any);
  });

  it('document 面存在但为 null 时回退到 navigator 面', () => {
    installNavigatorOnlyHost({ registerTool: vi.fn() });
    Object.defineProperty(document, 'modelContext', {
      value: null,
      configurable: true,
      writable: true,
    });

    expect(getModelContext()).toBe((navigator as any).modelContext);
  });
});

describe('ensureModelContextPolyfill — 非浏览器环境', () => {
  beforeEach(() => {
    __resetPolyfillStateForTest();
  });
  afterEach(() => {
    teardownHost();
    vi.unstubAllGlobals();
  });

  it('navigator 未定义时（SSR）静默跳过', () => {
    vi.stubGlobal('navigator', undefined);
    expect(() => ensureModelContextPolyfill()).not.toThrow();
    expect('modelContext' in document).toBe(false);
  });

  it('document 未定义时（SSR）静默跳过', () => {
    vi.stubGlobal('document', undefined);
    expect(() => ensureModelContextPolyfill()).not.toThrow();
  });

  it('window 未定义时（SSR）静默跳过', () => {
    vi.stubGlobal('window', undefined);
    expect(() => ensureModelContextPolyfill()).not.toThrow();
  });
});
