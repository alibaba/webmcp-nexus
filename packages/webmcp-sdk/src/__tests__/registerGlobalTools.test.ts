import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerGlobalTools } from '../registerGlobalTools';
import { clearRegistry, getActiveToolNames } from '../registry';

function makeToolFn(schemaOverrides?: Record<string, unknown> | false) {
  const fn = async (input: any) => input;
  if (schemaOverrides !== false) {
    (fn as any).__webmcpSchema = {
      description: 'test tool',
      inputSchema: { type: 'object', properties: {} },
      ...(schemaOverrides || {}),
    };
  }
  return fn;
}

describe('registerGlobalTools', () => {
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
    mockRegisterTool.mockClear();
    mockUnregisterTool.mockClear();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('navigator.modelContext 不存在时静默跳过', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });
    expect(() => registerGlobalTools({ myTool: makeToolFn() })).not.toThrow();
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('跳过非函数值', () => {
    registerGlobalTools({ notAFunction: 42 } as any);
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('跳过无 __webmcpSchema 的函数', () => {
    const plainFn = makeToolFn(false);
    registerGlobalTools({ plainFn });
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('正确注册带 schema 的函数', () => {
    const fn = makeToolFn({ description: 'test tool', readOnly: true });
    registerGlobalTools({ myTool: fn });
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'myTool',
        description: 'test tool',
        annotations: { readOnlyHint: true },
      }),
      { signal: expect.any(AbortSignal) },
    );
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('支持多个 toolMap 参数', () => {
    const fn1 = makeToolFn();
    const fn2 = makeToolFn();
    registerGlobalTools({ tool1: fn1 }, { tool2: fn2 });
    expect(mockRegisterTool).toHaveBeenCalledTimes(2);
    expect(mockRegisterTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'tool1' }), {
      signal: expect.any(AbortSignal),
    });
    expect(mockRegisterTool).toHaveBeenCalledWith(expect.objectContaining({ name: 'tool2' }), {
      signal: expect.any(AbortSignal),
    });
  });

  it('重复注册同名全局工具时不重复调用原生 registerTool', () => {
    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });
    registerGlobalTools({ myTool: fn });
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toEqual(['myTool']);
  });

  it('readOnly 默认为 false', () => {
    const fn = makeToolFn({ readOnly: undefined });
    registerGlobalTools({ myTool: fn });
    expect(mockRegisterTool).toHaveBeenCalledWith(
      expect.objectContaining({
        annotations: { readOnlyHint: false },
      }),
      { signal: expect.any(AbortSignal) },
    );
  });

  it('execute 包装器调用原始函数', async () => {
    const fn = makeToolFn();
    registerGlobalTools({ myTool: fn });
    const registeredTool = mockRegisterTool.mock.calls[0][0];
    const result = await registeredTool.execute({ key: 'value' });
    expect(result).toEqual({ key: 'value' });
  });

  it('navigator 未定义时（SSR）静默跳过', () => {
    const originalNav = globalThis.navigator;
    delete (globalThis as any).navigator;
    try {
      expect(() => registerGlobalTools({ myTool: makeToolFn() })).not.toThrow();
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
