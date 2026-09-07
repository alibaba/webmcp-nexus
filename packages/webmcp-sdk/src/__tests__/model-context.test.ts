import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RegisteredTool } from '@mcp-b/webmcp-types';
import {
  coerceInputSchema,
  isModernHost,
  isValidToolName,
  toWidgetToolDescriptor,
} from '../model-context';

/**
 * model-context 纯函数单测：inputSchema 三形态归一、工具名校验、现代宿主判定。
 * 宿主解析优先级（document 优先 / navigator 回退）由 polyfill.test.ts 覆盖。
 */

function makeRegisteredTool(overrides: Partial<RegisteredTool> = {}): RegisteredTool {
  return {
    name: 'myTool',
    description: 'my tool',
    window: globalThis.window,
    origin: 'http://localhost:3000',
    ...overrides,
  } as RegisteredTool;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('coerceInputSchema — 三种形态', () => {
  it('object 原样返回（polyfill 5.x 自持 context / Chrome 154+ cross-doc）', () => {
    const schema = { type: 'object', properties: { a: { type: 'string' } } };
    expect(coerceInputSchema(schema, 'myTool')).toBe(schema);
  });

  it('string 解析为对象（Chrome 149+ 的 same-document 工具、modelContextTesting 面）', () => {
    expect(coerceInputSchema('{"type":"object","properties":{}}', 'myTool')).toEqual({
      type: 'object',
      properties: {},
    });
  });

  it('string 解析失败返回 null 并告警（不降级为空 schema）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(coerceInputSchema('{not json', 'brokenTool')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('brokenTool');
  });

  it('string 解析成非对象（数组 / 标量）也返回 null', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(coerceInputSchema('[1,2]', 'myTool')).toBeNull();
    expect(coerceInputSchema('"text"', 'myTool')).toBeNull();
    expect(coerceInputSchema('null', 'myTool')).toBeNull();
  });

  it('缺键（polyfill 在自定义 toJSON 序列化成非对象时会完全省略该键）补默认 schema', () => {
    expect(coerceInputSchema(undefined, 'myTool')).toEqual({ type: 'object', properties: {} });
  });

  it('空字符串补默认 schema', () => {
    expect(coerceInputSchema('', 'myTool')).toEqual({ type: 'object', properties: {} });
  });

  it('数组形态不被误当成 schema 对象', () => {
    expect(coerceInputSchema([{ type: 'string' }], 'myTool')).toEqual({
      type: 'object',
      properties: {},
    });
  });
});

describe('toWidgetToolDescriptor', () => {
  it('归一对象形态并补 title（上游推荐读法 tool.title || tool.name）', () => {
    const descriptor = toWidgetToolDescriptor(
      makeRegisteredTool({ inputSchema: { type: 'object', properties: {} } }),
    );
    expect(descriptor).toEqual({
      name: 'myTool',
      title: 'myTool',
      description: 'my tool',
      inputSchema: { type: 'object', properties: {} },
    });
  });

  it('title 为空串时回落工具名（polyfill 恒输出 title: tool.title ?? ""）', () => {
    const descriptor = toWidgetToolDescriptor(makeRegisteredTool({ title: '' }));
    expect(descriptor!.title).toBe('myTool');
  });

  it('title 有值时原样保留', () => {
    const descriptor = toWidgetToolDescriptor(makeRegisteredTool({ title: '我的工具' }));
    expect(descriptor!.title).toBe('我的工具');
  });

  it('annotations 有值时透传，无值时不写入该键', () => {
    expect(
      toWidgetToolDescriptor(
        makeRegisteredTool({ annotations: { readOnlyHint: true, untrustedContentHint: false } }),
      )!.annotations,
    ).toEqual({ readOnlyHint: true, untrustedContentHint: false });

    const descriptor = toWidgetToolDescriptor(makeRegisteredTool());
    expect('annotations' in descriptor!).toBe(false);
  });

  it('schema 损坏时返回 null（调用方应丢弃该工具）', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(toWidgetToolDescriptor(makeRegisteredTool({ inputSchema: '{oops' }))).toBeNull();
  });

  it('产出物不含 window/origin，因此不可直接喂给 executeTool', () => {
    const descriptor = toWidgetToolDescriptor(makeRegisteredTool()) as unknown as Record<
      string,
      unknown
    >;
    // polyfill 的 executeTool 要求实参含 name/description/window/origin 四键，
    // 缺任一即抛 TypeError: RegisteredTool.window is required
    expect('window' in descriptor).toBe(false);
    expect('origin' in descriptor).toBe(false);
  });
});

describe('isValidToolName', () => {
  it.each([
    ['camelCase', 'listTodos'],
    ['下划线', 'list_todos'],
    ['连字符', 'list-todos'],
    ['点号', 'list.todos'],
    ['数字', '2fa'],
    ['1 字符', 'a'],
    ['128 字符', 'a'.repeat(128)],
  ])('接受 %s', (_label, name) => {
    expect(isValidToolName(name)).toBe(true);
  });

  it.each([
    ['空字符串', ''],
    ['中文名', '获取数据'],
    ['含空格', 'my tool'],
    ['含斜杠', 'ns/tool'],
    ['含冒号', 'ns:tool'],
    ['129 字符', 'a'.repeat(129)],
  ])('拒绝 %s', (_label, name) => {
    expect(isValidToolName(name)).toBe(false);
  });

  it('拒绝非字符串输入', () => {
    expect(isValidToolName(undefined as unknown as string)).toBe(false);
    expect(isValidToolName(null as unknown as string)).toBe(false);
  });
});

describe('isModernHost', () => {
  // 宿主对象可能是任意形状，用 unknown 中转而非 as any
  const asHost = (value: unknown) => value as Parameters<typeof isModernHost>[0];

  it('有 getTools 即判定为现代宿主（polyfill 5.x / Chrome 149+）', () => {
    expect(isModernHost(asHost({ registerTool: vi.fn(), getTools: vi.fn() }))).toBe(true);
  });

  it('无 getTools 判定为旧宿主（Chrome 146–148）', () => {
    expect(isModernHost(asHost({ registerTool: vi.fn(), unregisterTool: vi.fn() }))).toBe(false);
  });

  it('getTools 存在但不是函数时判定为旧宿主', () => {
    expect(isModernHost(asHost({ registerTool: vi.fn(), getTools: null }))).toBe(false);
  });
});
