import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { CALL_TOOL_NAME, configureBuiltinTools, ensureBuiltinTools } from '../builtinTools';
import { getActiveToolNames, getActiveToolStates } from '../registry';
import {
  installFakeHost,
  makeModernHost,
  makeObjectEraHost,
  makeRegisteredTool,
  makeStringEraHost,
  SHAPE_SCHEMA_OBJECT,
  SHAPE_SCHEMA_STRING,
  teardownHost,
  type FakeShapeHost,
} from './host-helpers';

const TODO_SCHEMA = { type: 'object', properties: { limit: { type: 'number' } } };

// configureBuiltinTools 的 enable 分支在宿主可用时会**立即补注册**并顺手
// patchModelContextEventSupport()，所以两种装配顺序语义不同，用例按需选：
//
// - 装宿主 → 翻开关：等价于生产路径（注册 + 打补丁 + 双轴归一包装），下面简称「生产序」
// - 翻开关 → 装宿主 → 手动 ensureBuiltinTools()：开关翻转时宿主还不在，故不注册也不打补丁，
//   由调用方自己驱动 ensure。用来单独观察 ensureBuiltinTools 的行为、以及测未打补丁的宿主档

/** 从宿主的 registerTool 调用里取出内置工具的 execute（走 activeTools 间接层，与宿主一致） */
function callToolExecute(host: { registerTool: Mock }) {
  const call = host.registerTool.mock.calls.find(c => c[0]?.name === CALL_TOOL_NAME);
  if (!call) throw new Error(`${CALL_TOOL_NAME} 没有注册到宿主`);
  return call[0].execute as (
    input: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
}

function builtinRegisterCalls(host: { registerTool: Mock }) {
  return host.registerTool.mock.calls.filter(c => c[0]?.name === CALL_TOOL_NAME);
}

/** handler 的成功路径**不归一**（原样透传内层返回值），所以返回类型是 unknown */
function textOf(result: unknown): string {
  const content = (result as { content?: Array<{ text?: string }> } | null)?.content ?? [];
  return content.map(block => block.text ?? '').join('\n');
}

function isError(result: unknown): boolean {
  return (result as { isError?: boolean } | null)?.isError === true;
}

/** 从错误文案里解析出目录（紧凑 JSON，位于第一个 '[' 与最后一个 ']' 之间） */
function directoryOf(result: unknown): Array<Record<string, unknown>> {
  const text = textOf(result);
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  return JSON.parse(text.slice(start, end + 1)) as Array<Record<string, unknown>>;
}

function directoryNames(result: unknown): string[] {
  return directoryOf(result).map(entry => entry.name as string);
}

describe('webmcpCallTool handler', () => {
  let host: FakeShapeHost;
  let executeTool: Mock;
  // 必须自己持有原始 getTools mock：configureBuiltinTools 的 enable 分支会跑
  // patchModelContextEventSupport()，它用 defineHiddenProperty 把 host.getTools 换成
  // 轴二包装版，此后 host.getTools 不再是 mock（包装版在闭包里调这个原始 mock）。
  let getToolsMock: Mock;
  let callTool: (input: Record<string, unknown>) => Promise<unknown>;

  /** 生产序装配一个 object-era 宿主；tools 是当前页的工具表 */
  function setup(tools: unknown[] = [makeRegisteredTool('listTodos', TODO_SCHEMA)]) {
    executeTool = vi.fn(async () => '{"ok":true}');
    getToolsMock = vi.fn(async () => tools);
    host = makeObjectEraHost(tools, { executeTool, getTools: getToolsMock });
    installFakeHost(host);
    configureBuiltinTools({ callTool: true });
    expect(getActiveToolNames()).toContain(CALL_TOOL_NAME);
    callTool = input => callToolExecute(host)(input);
  }

  afterEach(() => {
    teardownHost();
  });

  describe('命中：结果原样透传，不做二次归一', () => {
    beforeEach(() => setup());

    it('把 getTools() 的对象原样喂回 executeTool，内层返回值原样上交', async () => {
      const result = await callTool({ name: 'listTodos', arguments: { limit: 3 } });

      expect(executeTool).toHaveBeenCalledTimes(1);
      // 必须是 getTools() 返回的那个对象本身：polyfill 对 window/origin 做值比较，重建必抛
      expect(executeTool.mock.calls[0][0]).toEqual(makeRegisteredTool('listTodos', TODO_SCHEMA));
      expect(executeTool.mock.calls[0][1]).toEqual({ limit: 3 });
      // 宿主的 executeTool 返回 JSON 字符串，handler 必须先 parse；parse 之后**不归一**，
      // 交给消费方（relay 的 normalizeToolResponse）用它那层更宽的规则收尾
      expect(result).toEqual({ ok: true });
    });

    it('内层是 CallToolResult 且 isError:true → 原样透传，错误标志不被抹平', async () => {
      // 回归锁（一）：少 parse 这一步，内层结果会被二次序列化、isError 被外层 false 覆盖
      executeTool.mockResolvedValue(
        JSON.stringify({ content: [{ type: 'text', text: 'boom' }], isError: true }),
      );

      const result = await callTool({ name: 'listTodos' });

      expect(result).toEqual({ content: [{ type: 'text', text: 'boom' }], isError: true });
    });

    it('内层 content 类型是 resource_link / audio → 原样透传，不被误判成非 CallToolResult', async () => {
      // 回归锁（二）：nexus 自己的 isCallToolResult 只认 text/image/resource 三种且只看首元素，
      // 而上游 isContentBlock 认 6 种并逐个校验必填字段。曾在 handler 里调
      // normalizeToCallToolResult，这两种形状会被重新包成 text 且 isError 抹成 false。
      // 现在 handler 不归一，所以无论内层用哪种 content 类型都原样到达消费方。
      for (const block of [
        { type: 'resource_link', uri: 'https://example.com/a', name: 'a' },
        { type: 'audio', data: 'base64...', mimeType: 'audio/wav' },
      ]) {
        const inner = { content: [block], isError: true };
        executeTool.mockResolvedValue(JSON.stringify(inner));

        expect(await callTool({ name: 'listTodos' })).toEqual(inner);
      }
    });

    it('内层返回普通对象 → 原样上交（structuredContent 由 relay 那层补，不在这里预判）', async () => {
      executeTool.mockResolvedValue(JSON.stringify({ todos: ['a', 'b'] }));

      expect(await callTool({ name: 'listTodos' })).toEqual({ todos: ['a', 'b'] });
    });

    it('内层返回非 JSON 纯文本（原生 declarative 工具）→ 原样返回字符串，不炸', async () => {
      executeTool.mockResolvedValue('done');

      expect(await callTool({ name: 'listTodos' })).toBe('done');
    });

    it('arguments 省略 → executeTool 收到空对象', async () => {
      await callTool({ name: 'listTodos' });

      expect(executeTool.mock.calls[0][1]).toEqual({});
    });

    it('透传执行取消信号给宿主', async () => {
      const controller = new AbortController();

      await callToolExecute(host)({ name: 'listTodos' }, { signal: controller.signal });

      expect(executeTool.mock.calls[0][2]).toEqual({ signal: controller.signal });
    });
  });

  describe('失败路径一律转 isError，不向宿主抛异常', () => {
    beforeEach(() => setup());

    it('executeTool 返回 null（被导航中断）→ isError', async () => {
      executeTool.mockResolvedValue(null);

      const result = await callTool({ name: 'listTodos' });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('interrupted by navigation');
    });

    it('executeTool 抛错 → isError，文案含工具名与错误', async () => {
      executeTool.mockRejectedValue(new Error('Tool not found: listTodos'));

      const result = await callTool({ name: 'listTodos' });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('listTodos');
      expect(textOf(result)).toContain('Error: Tool not found: listTodos');
    });

    it('getTools() 抛错 → isError，不 throw', async () => {
      getToolsMock.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));

      const result = await callTool({ name: 'listTodos' });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('NotAllowedError: denied');
      expect(executeTool).not.toHaveBeenCalled();
    });
  });

  it('未打补丁且宿主没有 executeTool → isError 并说明原因', async () => {
    // 走「翻开关 → 装宿主」序：configureBuiltinTools 的 enable 分支在宿主可用时会顺手
    // patchModelContextEventSupport()，而 patch 会给缺 executeTool 的宿主**合成**一个
    // （没有 modelContextTesting 时合成版调用即抛 NotSupportedError，同样被 handler 转成
    // isError）。这条用例要的是尚未打补丁、宿主确实没有 executeTool 的那一档。
    configureBuiltinTools({ callTool: true });
    const modern = makeModernHost();
    installFakeHost(modern);
    ensureBuiltinTools();

    const result = await callToolExecute(modern)({ name: 'anything' });

    expect(isError(result)).toBe(true);
    expect(textOf(result)).toContain('executeTool');
  });

  it('字符串 inputSchema 的宿主 → 目录里的 schema 已被 coerce 成对象', async () => {
    // 走「翻开关 → 装宿主」序：避免 patch 的轴二包装先把字符串 schema 转成对象，
    // 那样就测不到 handler 自己的 coerce（它复用 toWidgetToolDescriptor，不依赖轴二）。
    // 注册表是模块级状态，中途换宿主必须先 teardown，否则幂等守卫会跳过新宿主。
    configureBuiltinTools({ callTool: true });
    const stringEra = makeStringEraHost([makeRegisteredTool('listTodos', SHAPE_SCHEMA_STRING)]);
    installFakeHost(stringEra);
    ensureBuiltinTools();

    const entry = directoryOf(await callToolExecute(stringEra)({ name: 'nope' }))[0];

    expect(entry.inputSchema).toEqual(SHAPE_SCHEMA_OBJECT);
  });

  describe('未命中与入参守卫：返回目录让模型自我纠正', () => {
    beforeEach(() => setup());

    it('未命中 → isError + Tool "X" not found + Available tools 目录（含三键、不含自身）', async () => {
      const result = await callTool({ name: 'getCanvasSnapshot' });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('Tool "getCanvasSnapshot" not found');
      expect(textOf(result)).toContain('Available tools:');
      expect(textOf(result)).toContain('originalName');
      expect(directoryNames(result)).toEqual(['listTodos']);
      // 目录条目只给 name/description/inputSchema 三键
      expect(Object.keys(directoryOf(result)[0]).sort()).toEqual([
        'description',
        'inputSchema',
        'name',
      ]);
      expect(directoryOf(result)[0].inputSchema).toEqual(TODO_SCHEMA);
      expect(executeTool).not.toHaveBeenCalled();
    });

    it('目录用紧凑 JSON（不缩进），避免把载荷放大三到四成回灌给模型', async () => {
      const text = textOf(await callTool({ name: 'nope' }));

      expect(text).not.toContain('{\n  "name"');
      expect(text).toContain('{"name":"listTodos"');
    });

    it('零工具 → isError + No tools are currently available', async () => {
      getToolsMock.mockResolvedValue([]);

      const result = await callTool({ name: 'listTodos' });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('No tools are currently available');
    });

    it.each([
      ['缺失', {}],
      ['空串', { name: '   ' }],
      ['非字符串', { name: 42 }],
    ])('name %s → isError + 目录，且不调用 executeTool', async (_label, input) => {
      const result = await callTool(input as Record<string, unknown>);

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('Missing required argument "name"');
      expect(directoryNames(result)).toEqual(['listTodos']);
      expect(executeTool).not.toHaveBeenCalled();
    });

    it('name 指向自己 → isError 自递归守卫，不调用 executeTool', async () => {
      const result = await callTool({ name: CALL_TOOL_NAME });

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('cannot call itself');
      expect(executeTool).not.toHaveBeenCalled();
    });

    it('目录里排除自身', async () => {
      getToolsMock.mockResolvedValue([
        makeRegisteredTool('listTodos', TODO_SCHEMA),
        makeRegisteredTool(CALL_TOOL_NAME, { type: 'object', properties: {} }),
      ]);

      expect(directoryNames(await callTool({ name: 'nope' }))).toEqual(['listTodos']);
    });

    it.each([
      ['字符串', { name: 'listTodos', arguments: '{"limit":3}' }],
      ['数组', { name: 'listTodos', arguments: [1, 2] }],
      ['数字', { name: 'listTodos', arguments: 7 }],
    ])('arguments 是%s → isError，不调用 executeTool', async (_label, input) => {
      const result = await callTool(input);

      expect(isError(result)).toBe(true);
      expect(textOf(result)).toContain('"arguments" must be a JSON object');
      expect(executeTool).not.toHaveBeenCalled();
    });

    // 原生 Chrome 顶层 getTools() 里子框架工具排在本框架之前还是之后并无保证，
    // 两个方向都必须命中本框架那个（cross-document 的工具 polyfill 会直接抛 Tool not found）
    it.each([
      ['跨框架在前', false],
      ['跨框架在后', true],
    ])('同名跨 document 工具（%s）→ 命中 same-document 那一个', async (_label, sameFirst) => {
      const crossDocument = makeRegisteredTool('dup', TODO_SCHEMA, { sameDocument: false });
      const sameDocument = makeRegisteredTool('dup', TODO_SCHEMA, { sameDocument: true });
      getToolsMock.mockResolvedValue(
        sameFirst ? [sameDocument, crossDocument] : [crossDocument, sameDocument],
      );

      await callTool({ name: 'dup' });

      expect(executeTool.mock.calls[0][0]).toBe(sameDocument);
    });
  });
});

describe('内置工具的注册与开关', () => {
  afterEach(() => {
    teardownHost();
  });

  it('ensureBuiltinTools 幂等：首次 true，之后 false，宿主只注册一次', () => {
    const host = makeObjectEraHost();
    // 先翻开关（此时宿主还不在，不会注册），再装宿主手动驱动 ensure
    configureBuiltinTools({ callTool: true });
    installFakeHost(host);

    expect(ensureBuiltinTools()).toBe(true);
    expect(ensureBuiltinTools()).toBe(false);
    expect(ensureBuiltinTools()).toBe(false);

    expect(builtinRegisterCalls(host)).toHaveLength(1);
    expect(getActiveToolNames().filter(n => n === CALL_TOOL_NAME)).toHaveLength(1);
  });

  it('生产序：翻开关即注册，不需要调用方再跑一次注册入口', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);

    configureBuiltinTools({ callTool: true });

    expect(builtinRegisterCalls(host)).toHaveLength(1);
    expect(getActiveToolNames()).toContain(CALL_TOOL_NAME);
    // 幂等：入口随后再 ensure 不会重复注册
    expect(ensureBuiltinTools()).toBe(false);
    expect(builtinRegisterCalls(host)).toHaveLength(1);
  });

  it('注册为 global scope，DebugPanel 能按权威元数据分类', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);
    configureBuiltinTools({ callTool: true });

    const state = getActiveToolStates().find(s => s.name === CALL_TOOL_NAME);
    expect(state?.scope).toBe('global');
    expect(state?.scopeId).toBe('builtin');
  });

  it('schema 固定为 { name: string, arguments?: object }，required 只有 name', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);
    configureBuiltinTools({ callTool: true });

    const config = builtinRegisterCalls(host)[0][0];
    expect(config.inputSchema).toEqual({
      type: 'object',
      properties: {
        name: expect.objectContaining({ type: 'string' }),
        arguments: expect.objectContaining({ type: 'object' }),
      },
      required: ['name'],
    });
    expect(Object.keys(config.inputSchema.properties).sort()).toEqual(['arguments', 'name']);
    // 透明代理：三个 hint 全 false（能不能调是客户端的判断，本工具只管执行）
    expect(config.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: false,
      consequentialHint: false,
    });
    expect(config.description.length).toBeGreaterThan(0);
  });

  it('先关后注册 → 不注册', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);
    configureBuiltinTools({ callTool: false });

    expect(ensureBuiltinTools()).toBe(false);
    expect(getActiveToolNames()).not.toContain(CALL_TOOL_NAME);
    expect(host.registerTool).not.toHaveBeenCalled();
  });

  it('先注册后关 → 就地反注册（开关与调用顺序无关）', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);
    configureBuiltinTools({ callTool: true });
    expect(getActiveToolNames()).toContain(CALL_TOOL_NAME);

    configureBuiltinTools({ callTool: false });

    expect(getActiveToolNames()).not.toContain(CALL_TOOL_NAME);
    // 关掉后再 ensure 也不该回来
    expect(ensureBuiltinTools()).toBe(false);
    expect(getActiveToolNames()).not.toContain(CALL_TOOL_NAME);
  });

  it('关掉再打开 → 立即补注册，不需要再跑一次注册入口', () => {
    const host = makeObjectEraHost();
    installFakeHost(host);
    configureBuiltinTools({ callTool: true });

    configureBuiltinTools({ callTool: false });
    expect(getActiveToolNames()).not.toContain(CALL_TOOL_NAME);
    const callsBefore = builtinRegisterCalls(host).length;

    // 关键：此后不调 registerGlobalTools / 不挂载任何组件，只翻开关。
    // 应用可能启动时只注册一次、之后没有组件重挂载，若这里不补注册，
    // 一个 disable→enable 循环就会让 webmcpCallTool 永久消失。
    configureBuiltinTools({ callTool: true });

    expect(getActiveToolNames()).toContain(CALL_TOOL_NAME);
    expect(builtinRegisterCalls(host)).toHaveLength(callsBefore + 1);
  });
});
