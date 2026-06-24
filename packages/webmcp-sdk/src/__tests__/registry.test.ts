import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerEntry,
  unregisterEntry,
  clearRegistry,
  getActiveToolNames,
  patchModelContextEventSupport,
  registerScopedTool,
  unregisterScopedTool,
} from '../registry';
import type { WebMcpToolConfig } from '../types';

function makeToolConfig(name: string): WebMcpToolConfig {
  return {
    name,
    description: `${name} description`,
    inputSchema: { type: 'object', properties: {} },
    execute: async () => ({}),
  };
}

describe('registry', () => {
  beforeEach(() => {
    clearRegistry();
    vi.restoreAllMocks();
  });

  it('registerEntry 应在 registry 中记录工具', () => {
    registerEntry('myTool', 'global', 'app');
    // 验证：注销后返回 true，说明确实被记录了
    expect(unregisterEntry('myTool', 'global', 'app')).toBe(true);
  });

  it('unregisterEntry 注销最后持有者时返回 true', () => {
    registerEntry('myTool', 'global', 'app');
    expect(unregisterEntry('myTool', 'global', 'app')).toBe(true);
  });

  it('unregisterEntry 注销非最后持有者时返回 false', () => {
    registerEntry('myTool', 'global', 'app');
    registerEntry('myTool', 'component', 'c-1');
    // 注销第一个，但第二个仍持有
    expect(unregisterEntry('myTool', 'global', 'app')).toBe(false);
  });

  it('同名工具被不同 scope 注册时发出 console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerEntry('myTool', 'global', 'app');
    registerEntry('myTool', 'component', 'c-1');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('myTool'));
  });

  it('同 scope 同 scopeId 注册同名工具不应发出警告', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerEntry('myTool', 'global', 'app');
    registerEntry('myTool', 'global', 'app');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('clearRegistry 后所有注册信息被清除', () => {
    registerEntry('tool1', 'global', 'app');
    registerEntry('tool2', 'component', 'c-1');
    clearRegistry();
    expect(unregisterEntry('tool1', 'global', 'app')).toBe(false);
    expect(unregisterEntry('tool2', 'component', 'c-1')).toBe(false);
  });

  it('注销不存在的工具返回 false', () => {
    expect(unregisterEntry('nonExistent', 'global', 'app')).toBe(false);
  });

  it('不同工具名的注册/注销互不影响', () => {
    registerEntry('toolA', 'global', 'app');
    registerEntry('toolB', 'global', 'app');
    // 注销 toolA 不影响 toolB
    expect(unregisterEntry('toolA', 'global', 'app')).toBe(true);
    expect(unregisterEntry('toolB', 'global', 'app')).toBe(true);
  });
});

describe('scoped tool lifecycle', () => {
  const mockRegisterTool = vi.fn();
  const mockUnregisterTool = vi.fn();
  let originalNavigator: Navigator;

  beforeEach(() => {
    clearRegistry();
    vi.restoreAllMocks();
    mockRegisterTool.mockReset();
    mockUnregisterTool.mockReset();
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
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('首次 owner 注册时将 AbortSignal 透传给原生 registerTool', () => {
    const config = makeToolConfig('signalTool');

    registerScopedTool(config, { scope: 'component', scopeId: 'component-a' });

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'signalTool', execute: expect.any(Function) }),
      {
        signal: expect.any(AbortSignal),
      },
    );
    expect(getActiveToolNames()).toEqual(['signalTool']);
  });

  it('同名工具第二个 owner 不重复调用原生 registerTool', () => {
    const config = makeToolConfig('sharedTool');

    registerScopedTool(config, { scope: 'component', scopeId: 'component-a' });
    registerScopedTool(config, { scope: 'component', scopeId: 'component-b' });

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toEqual(['sharedTool']);
  });

  it('移除非最后 owner 时不 abort 原生注册且不 fallback unregisterTool', () => {
    const config = makeToolConfig('sharedTool');

    registerScopedTool(config, { scope: 'component', scopeId: 'component-a' });
    registerScopedTool(config, { scope: 'component', scopeId: 'component-b' });

    const changed = unregisterScopedTool('sharedTool', {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect(changed).toBe(false);
    expect(mockUnregisterTool).not.toHaveBeenCalled();
    expect(getActiveToolNames()).toEqual(['sharedTool']);
  });

  it('移除最后 owner 时 abort 并在旧环境 fallback 调用 unregisterTool', () => {
    const config = makeToolConfig('legacyTool');

    registerScopedTool(config, { scope: 'component', scopeId: 'component-a' });
    const changed = unregisterScopedTool('legacyTool', {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect(changed).toBe(true);
    expect(mockUnregisterTool).toHaveBeenCalledWith('legacyTool');
    expect(getActiveToolNames()).toEqual([]);
  });

  it('Chrome 148+ 无 unregisterTool 时，最后 owner 移除不抛错', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
        },
      },
      configurable: true,
      writable: true,
    });

    registerScopedTool(makeToolConfig('nativeTool'), {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect(() =>
      unregisterScopedTool('nativeTool', {
        scope: 'component',
        scopeId: 'component-a',
      }),
    ).not.toThrow();
    expect(getActiveToolNames()).toEqual([]);
  });

  it('modelContextTesting.listTools 随原生 signal abort 同步移除工具', () => {
    const nativeTools = new Map<string, WebMcpToolConfig>();
    mockRegisterTool.mockImplementation((tool: WebMcpToolConfig, options?: { signal?: AbortSignal }) => {
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
          unregisterTool: (name: string) => {
            nativeTools.delete(name);
          },
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

    registerScopedTool(makeToolConfig('nativeTool'), {
      scope: 'component',
      scopeId: 'component-a',
    });
    expect((navigator as any).modelContextTesting.listTools()).toEqual([
      expect.objectContaining({ name: 'nativeTool' }),
    ]);

    unregisterScopedTool('nativeTool', {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect((navigator as any).modelContextTesting.listTools()).toEqual([]);
  });

  it('registerTool 包装器不能吞掉原生重复注册错误导致 signal 未绑定', () => {
    const nativeTools = new Map<string, WebMcpToolConfig>();
    mockRegisterTool.mockImplementation((tool: WebMcpToolConfig, options?: { signal?: AbortSignal }) => {
      if (nativeTools.has(tool.name)) {
        throw new DOMException('Duplicate tool name', 'InvalidStateError');
      }
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
          unregisterTool: (name: string) => {
            nativeTools.delete(name);
          },
        },
        modelContextTesting: {
          listTools: () => Array.from(nativeTools.values()),
        },
      },
      configurable: true,
      writable: true,
    });

    patchModelContextEventSupport();
    nativeTools.set('dupTool', makeToolConfig('dupTool'));
    registerScopedTool(makeToolConfig('dupTool'), {
      scope: 'component',
      scopeId: 'component-a',
    });
    unregisterScopedTool('dupTool', {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect(nativeTools.has('dupTool')).toBe(false);
  });

  it('modelContextTesting.listTools 过滤 SDK 已注销但 native 仍残留的工具', () => {
    const nativeTools = new Map<string, WebMcpToolConfig>();
    nativeTools.set('externalTool', makeToolConfig('externalTool'));
    mockRegisterTool.mockImplementation((tool: WebMcpToolConfig) => {
      nativeTools.set(tool.name, tool);
      // 模拟 Chrome/native tool map 没有随 signal abort 删除。
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

    patchModelContextEventSupport();
    registerScopedTool(makeToolConfig('componentTool'), {
      scope: 'component',
      scopeId: 'component-a',
    });
    expect((navigator as any).modelContextTesting.listTools().map((tool: any) => tool.name)).toEqual([
      'externalTool',
      'componentTool',
    ]);

    unregisterScopedTool('componentTool', {
      scope: 'component',
      scopeId: 'component-a',
    });

    expect(nativeTools.has('componentTool')).toBe(true);
    expect((navigator as any).modelContextTesting.listTools().map((tool: any) => tool.name)).toEqual([
      'externalTool',
    ]);
  });
});

import {
  isCallToolResult,
  normalizeToCallToolResult,
} from '../registry';

describe('isCallToolResult', () => {
  it('合法 text content → true', () => {
    expect(isCallToolResult({ content: [{ type: 'text', text: 'hello' }] })).toBe(true);
  });

  it('合法 image content → true', () => {
    expect(isCallToolResult({ content: [{ type: 'image', data: '...' }] })).toBe(true);
  });

  it('空 content 数组 → true', () => {
    expect(isCallToolResult({ content: [] })).toBe(true);
  });

  it('含 isError 的合法结构 → true', () => {
    expect(isCallToolResult({ content: [{ type: 'text', text: 'err' }], isError: true })).toBe(true);
  });

  it('无 content 字段 → false', () => {
    expect(isCallToolResult({ id: 'abc123' })).toBe(false);
  });

  it('content 不是数组 → false', () => {
    expect(isCallToolResult({ content: '文章内容' })).toBe(false);
  });

  it('content 元素无 type 字段 → false（防业务对象误判）', () => {
    expect(isCallToolResult({ content: [{ from: 'user', text: 'hi' }] })).toBe(false);
  });

  it('content 元素 type 不合法 → false', () => {
    expect(isCallToolResult({ content: [{ type: 'paragraph', text: 'x' }] })).toBe(false);
  });

  it('null → false', () => {
    expect(isCallToolResult(null)).toBe(false);
  });

  it('数组 → false', () => {
    expect(isCallToolResult([{ type: 'text', text: 'x' }])).toBe(false);
  });

  it('原始类型 → false', () => {
    expect(isCallToolResult(42)).toBe(false);
    expect(isCallToolResult('hello')).toBe(false);
  });
});

describe('normalizeToCallToolResult', () => {
  it('原始对象被完整包装为 text content（不截断）', () => {
    const largeObj = { data: 'x'.repeat(10000), id: 'abc' };
    const result = normalizeToCallToolResult(largeObj) as any;
    expect(result.content[0].text).toBe(JSON.stringify(largeObj));
    expect(result.content[0].text.length).toBeGreaterThan(10000);
    expect(result.isError).toBe(false);
  });

  it('字符串直接作为 text 不二次序列化', () => {
    const result = normalizeToCallToolResult('操作成功');
    expect(result).toEqual({
      content: [{ type: 'text', text: '操作成功' }],
      isError: false,
    });
  });

  it('数字被完整序列化', () => {
    expect(normalizeToCallToolResult(42)).toEqual({
      content: [{ type: 'text', text: '42' }],
      isError: false,
    });
  });

  it('已是合法 CallToolResult 则直接透传（同引用）', () => {
    const original = { content: [{ type: 'text', text: 'hello' }], isError: false };
    expect(normalizeToCallToolResult(original)).toBe(original);
  });

  it('业务对象含 content 数组但非 MCP 格式 → 被包装', () => {
    const biz = { content: [{ from: 'user', message: 'hi' }], total: 1 };
    const result = normalizeToCallToolResult(biz);
    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify(biz) }],
      isError: false,
    });
  });

  it('null 被包装为 "null"', () => {
    expect(normalizeToCallToolResult(null)).toEqual({
      content: [{ type: 'text', text: 'null' }],
      isError: false,
    });
  });

  it('undefined 被包装为字符串', () => {
    const result = normalizeToCallToolResult(undefined) as any;
    expect(result.content[0].text).toBe('undefined');
  });
});

describe('patchModelContextEventSupport callTool normalization (Chrome 146+)', () => {
  let originalNavigator: any;

  beforeEach(() => {
    clearRegistry();
    originalNavigator = globalThis.navigator;
  });

  afterEach(() => {
    clearRegistry();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('Chrome 原生 executeTool 返回原始对象 JSON → callTool 返回完整规范化结果', async () => {
    const mockExecuteTool = vi.fn().mockResolvedValue('{"id":"shape-1","points":[1,2,3]}');
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: { registerTool: vi.fn() },
        modelContextTesting: {
          listTools: () => [],
          executeTool: mockExecuteTool,
        },
      },
      configurable: true,
      writable: true,
    });

    patchModelContextEventSupport();
    const mc = (navigator as any).modelContext;
    const result = await mc.callTool({ name: 'drawCircle', arguments: { cx: 100 } });

    expect(result).toEqual({
      content: [{ type: 'text', text: '{"id":"shape-1","points":[1,2,3]}' }],
      isError: false,
    });
    expect(mockExecuteTool).toHaveBeenCalledWith('drawCircle', '{"cx":100}');
  });

  it('大体积返回结果不被截断', async () => {
    const bigPayload = JSON.stringify({ data: 'x'.repeat(50000) });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: { registerTool: vi.fn() },
        modelContextTesting: {
          listTools: () => [],
          executeTool: vi.fn().mockResolvedValue(bigPayload),
        },
      },
      configurable: true,
      writable: true,
    });

    patchModelContextEventSupport();
    const result = await (navigator as any).modelContext.callTool({ name: 'tool', arguments: {} });

    expect(result.content[0].text).toBe(bigPayload);
    expect(result.content[0].text.length).toBe(bigPayload.length);
  });

  it('executeTool 返回已规范化的 CallToolResult JSON → 直接透传不重复包装', async () => {
    const normalized = JSON.stringify({ content: [{ type: 'text', text: 'done' }], isError: false });
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: { registerTool: vi.fn() },
        modelContextTesting: {
          listTools: () => [],
          executeTool: vi.fn().mockResolvedValue(normalized),
        },
      },
      configurable: true,
      writable: true,
    });

    patchModelContextEventSupport();
    const result = await (navigator as any).modelContext.callTool({ name: 'tool', arguments: {} });

    expect(result).toEqual({ content: [{ type: 'text', text: 'done' }], isError: false });
  });

  it('executeTool 返回 null → 返回导航中断错误', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: { registerTool: vi.fn() },
        modelContextTesting: {
          listTools: () => [],
          executeTool: vi.fn().mockResolvedValue(null),
        },
      },
      configurable: true,
      writable: true,
    });

    patchModelContextEventSupport();
    const result = await (navigator as any).modelContext.callTool({ name: 'tool', arguments: {} });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('navigation');
  });
});
