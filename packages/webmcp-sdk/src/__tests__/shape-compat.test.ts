// packages/webmcp-sdk/src/__tests__/shape-compat.test.ts
//
// 双轴归一层的测试。两轴分别是：
//   轴一 executeTool 入参形态 —— Chrome 155+ 原生收对象，149–154 与 polyfill 5.1.0 收 JSON 字符串
//   轴二 getTools 的 inputSchema 形态 —— relay 6.x 丢弃字符串 schema 的工具（发现阶段就少工具）
//
// 设计依据见 docs/superpowers/specs/2026-10-12-executetool-input-shape-compat.md §5。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { clearRegistry, patchModelContextEventSupport } from '../registry';
import { getModelContext } from '../model-context';
import {
  installFakeHost,
  makeLegacyHost,
  makeObjectEraHost,
  makePolyfillHost,
  makeRegisteredTool,
  makeStringEraHost,
  SHAPE_SCHEMA_OBJECT,
  SHAPE_SCHEMA_STRING,
  teardownHost,
  type FakeShapeHost,
} from './host-helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHost = any;

afterEach(() => {
  delete (navigator as unknown as Record<string, unknown>).modelContextTesting;
  teardownHost();
});

/**
 * 注入假宿主并装上归一层。
 *
 * 返回安装**前**抓住的两个 mock：installFakeHost 注入的是同一个对象引用，而归一层会用
 * 包装器覆盖其上的 getTools/executeTool，安装后 host.getTools 已不是原 mock。
 */
function install(host: FakeShapeHost) {
  const getTools = host.getTools;
  const executeTool = host.executeTool;
  installFakeHost(host);
  patchModelContextEventSupport();
  return { mc: getModelContext() as AnyHost, getTools, executeTool };
}

/** 装一个只有 modelContextTesting 的旧宿主（Chrome 146–148 形态） */
function installTestingOnlyHost(nativeExecuteTool?: ReturnType<typeof vi.fn>) {
  const testingExecuteTool = vi.fn(async (_name: string, _json: string) => '{"ok":1}');
  installFakeHost(makeLegacyHost(nativeExecuteTool ? { executeTool: nativeExecuteTool } : {}));
  (navigator as unknown as Record<string, unknown>).modelContextTesting = {
    listTools: () => [{ name: 'myTool', description: 'd', inputSchema: SHAPE_SCHEMA_STRING }],
    executeTool: testingExecuteTool,
  };
  patchModelContextEventSupport();
  return { mc: getModelContext() as AnyHost, testingExecuteTool };
}

describe('归一层 — 轴一：executeTool 入参形态', () => {
  it('1. object-era 宿主：对象入参按原引用透传', async () => {
    const { mc, executeTool } = install(makeObjectEraHost());
    const [tool] = await mc.getTools();
    const args = { a: 1 };

    await mc.executeTool(tool, args);

    expect(executeTool).toHaveBeenCalledTimes(1);
    expect(executeTool.mock.calls[0][1]).toBe(args);
  });

  it('2. string-era 宿主：对象入参转成 JSON 字符串', async () => {
    const { mc, executeTool } = install(makeStringEraHost());
    const [tool] = await mc.getTools();

    await mc.executeTool(tool, { a: 1 });

    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('3. polyfill 档：转字符串，且不调 getTools 探测（__isWebMCPPolyfill 短路）', async () => {
    const { mc, getTools, executeTool } = install(makePolyfillHost());
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_OBJECT);

    await mc.executeTool(tool, { a: 1 });

    expect(getTools).toHaveBeenCalledTimes(0);
    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('4. Chrome 146–148 档：合成版 executeTool 把对象转成字符串再交给 testing 面', async () => {
    const { mc, testingExecuteTool } = installTestingOnlyHost();

    const [tool] = await mc.getTools();
    await mc.executeTool(tool, { a: 1 });

    expect(testingExecuteTool).toHaveBeenCalledWith('myTool', '{"a":1}');
  });

  it('5. object-era 宿主：字符串入参转成对象', async () => {
    const { mc, executeTool } = install(makeObjectEraHost());
    const [tool] = await mc.getTools();

    await mc.executeTool(tool, '{"a":1}');

    expect(executeTool.mock.calls[0][1]).toEqual({ a: 1 });
  });

  it('6. 畸形字符串入参抛错而非降级，且宿主 executeTool 未被调用', async () => {
    const { mc, executeTool } = install(makeObjectEraHost());
    const [tool] = await mc.getTools();

    await expect(mc.executeTool(tool, 'not json')).rejects.toBeInstanceOf(SyntaxError);
    await expect(mc.executeTool(tool, '[1,2]')).rejects.toBeInstanceOf(TypeError);
    // 关键：抛错发生在归一阶段，工具体一次都没执行
    expect(executeTool).toHaveBeenCalledTimes(0);
  });

  it('7. 无参入参：undefined / {} / 空串在两档都归一为「无参」', async () => {
    const stringSide = install(makeStringEraHost());
    const stringTool = makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING);
    for (const input of [undefined, {}, '']) {
      await stringSide.mc.executeTool(stringTool, input);
    }
    expect(stringSide.executeTool.mock.calls.map(c => c[1])).toEqual(['{}', '{}', '{}']);

    teardownHost();

    const objectSide = install(makeObjectEraHost());
    const objectTool = makeRegisteredTool('myTool', SHAPE_SCHEMA_OBJECT);
    for (const input of [undefined, '']) {
      await objectSide.mc.executeTool(objectTool, input);
    }
    expect(objectSide.executeTool.mock.calls.map(c => c[1])).toEqual([{}, {}]);
  });
});

describe('归一层 — 轴二：getTools 的 inputSchema 形态', () => {
  it('8. string-era 宿主：转换后四键与 title/description/annotations 全部保真，且是新对象', async () => {
    const raw: Record<string, unknown> = {
      ...makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING),
      annotations: { readOnlyHint: true },
    };
    const { mc } = install(makeStringEraHost([raw]));

    const [converted] = await mc.getTools();

    // 拷贝而非就地改写：relay 会把返回的对象原样喂回 executeTool，
    // polyfill 对 name/description/window/origin 四键既查存在又比值，缺一即抛
    expect(converted).not.toBe(raw);
    expect(converted.inputSchema).toEqual(SHAPE_SCHEMA_OBJECT);
    expect(converted.name).toBe('myTool');
    expect(converted.title).toBe('myTool');
    expect(converted.description).toBe('myTool description');
    expect(converted.annotations).toEqual({ readOnlyHint: true });
    expect(converted.window).toBe(globalThis.window);
    expect(converted.origin).toBe('http://localhost:3000');
    // 宿主返回的原对象未被污染
    expect(raw.inputSchema).toBe(SHAPE_SCHEMA_STRING);
  });

  it('9. object schema 的工具原引用透传，不产生拷贝', async () => {
    const raw = makeRegisteredTool('myTool', SHAPE_SCHEMA_OBJECT);
    const { mc } = install(makeObjectEraHost([raw]));

    const [tool] = await mc.getTools();

    expect(tool).toBe(raw);
  });

  it('10. 字符串 schema 解析失败时保留原字符串透传，不丢弃也不降级成零参数工具', async () => {
    const raw = makeRegisteredTool('badTool', 'not json at all');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mc } = install(makeStringEraHost([raw]));

    const [tool] = await mc.getTools();

    expect(tool).toBe(raw);
    expect(tool.inputSchema).toBe('not json at all');
    warn.mockRestore();
  });

  it('11. 轴二产物满足 relay 6.x 的 schema 守卫形状（非数组对象）', async () => {
    const { mc } = install(makeStringEraHost());

    const [tool] = await mc.getTools();
    const schema = tool.inputSchema;

    expect(!!schema && typeof schema === 'object' && !Array.isArray(schema)).toBe(true);
  });

  it('20. 混合列表：只有字符串 schema 的工具被拷贝改写，对象 schema 的原引用透传', async () => {
    const stringTool = makeRegisteredTool('strTool', SHAPE_SCHEMA_STRING);
    const objectTool = makeRegisteredTool('objTool', SHAPE_SCHEMA_OBJECT);
    const { mc } = install(makeStringEraHost([stringTool, objectTool]));

    const tools = await mc.getTools();

    expect(tools[0]).not.toBe(stringTool);
    expect(tools[0].inputSchema).toEqual(SHAPE_SCHEMA_OBJECT);
    expect(tools[1]).toBe(objectTool);
  });

  it('21. 整批无字符串 schema 时返回原数组引用，不产生拷贝', async () => {
    const rawArray = [
      makeRegisteredTool('a', SHAPE_SCHEMA_OBJECT),
      makeRegisteredTool('b', SHAPE_SCHEMA_OBJECT),
    ];
    const { mc } = install(makeObjectEraHost(rawArray));

    const tools = await mc.getTools();

    expect(tools).toBe(rawArray);
  });

  it('25. getTools(options) 用 rest args 透传，原函数收到同一 options 对象', async () => {
    const { mc, getTools } = install(makeObjectEraHost());
    const options = { fromOrigins: ['http://localhost:3000'] };

    await mc.getTools(options);

    expect(getTools).toHaveBeenCalledWith(options);
  });
});

describe('归一层 — 形态判定、守卫与缓存', () => {
  it('12. 宿主有原生 executeTool 但 getTools 是合成版：轴二跳过、轴一仍装上', async () => {
    // 该组合无探测源，会走「判定退化」告警路径（由用例 32 专门断言），此处静默
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nativeExecuteTool = vi.fn(async (_tool: unknown, _args: unknown) => '{"ok":true}');
    const { mc } = installTestingOnlyHost(nativeExecuteTool);

    expect(mc.__webmcpNexusGetToolsSynthesized).toBe(true);
    expect(mc.__webmcpNexusGetToolsWrapped).toBeUndefined();
    expect(mc.__webmcpNexusExecuteToolSynthesized).toBeUndefined();
    expect(mc.__webmcpNexusExecuteToolWrapped).toBe(true);

    // 合成版 getTools 已 coerce，形态信号不可信 → 无法探测 → 落 'object'
    const [tool] = await mc.getTools();
    await mc.executeTool(tool, { a: 1 });
    expect(nativeExecuteTool).toHaveBeenCalledTimes(1);
    expect(nativeExecuteTool.mock.calls[0][1]).toEqual({ a: 1 });
  });

  it('13. 自指陷阱回归：包装后的 getTools 返回对象 schema，但 executeTool 仍按 string 转发', async () => {
    const { mc, executeTool } = install(makeStringEraHost());

    const [toolFromWrapped] = await mc.getTools();
    expect(typeof toolFromWrapped.inputSchema).toBe('object');

    // 若探测读的是包装后的 getTools，这里会误判成 object-era 并把对象透传下去
    await mc.executeTool(toolFromWrapped, { a: 1 });
    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('14. 判定结果缓存：连续两次 executeTool，originalGetTools 总共只调一次', async () => {
    const { mc, getTools, executeTool } = install(makeStringEraHost());
    getTools.mockClear();
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING);

    await mc.executeTool(tool, { a: 1 });
    await mc.executeTool(tool, { a: 2 });

    expect(getTools).toHaveBeenCalledTimes(1);
    expect(executeTool.mock.calls.map(c => c[1])).toEqual(['{"a":1}', '{"a":2}']);
  });

  it('15. 工具列表为空时不缓存判定，下次调用重探', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mc, getTools, executeTool } = install(makeStringEraHost([]));
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING);

    await mc.executeTool(tool, { a: 1 });
    expect(mc.__webmcpNexusInputShape).toBeUndefined();
    expect(executeTool.mock.calls[0][1]).toEqual({ a: 1 });

    getTools.mockImplementation(async () => [makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING)]);
    await mc.executeTool(tool, { a: 2 });
    expect(mc.__webmcpNexusInputShape).toBe('string');
    expect(executeTool.mock.calls[1][1]).toBe('{"a":2}');
  });

  it('16. cross-document 工具的对象 schema 不干扰判定', async () => {
    const { mc, executeTool } = install(
      makeStringEraHost([
        makeRegisteredTool('crossDoc', SHAPE_SCHEMA_OBJECT, { sameDocument: false }),
        makeRegisteredTool('sameDoc', SHAPE_SCHEMA_STRING),
      ]),
    );
    const tool = makeRegisteredTool('sameDoc', SHAPE_SCHEMA_STRING);

    await mc.executeTool(tool, { a: 1 });

    expect(mc.__webmcpNexusInputShape).toBe('string');
    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('17. 宿主 getTools 抛错时落 object、不缓存、不把错误抛穿给调用方', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const host = makeObjectEraHost();
    host.getTools.mockRejectedValue(new DOMException('not active', 'InvalidStateError'));
    const { mc, executeTool } = install(host);
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_OBJECT);

    await expect(mc.executeTool(tool, { a: 1 })).resolves.toBe('{"ok":true}');
    expect(executeTool.mock.calls[0][1]).toEqual({ a: 1 });
    expect(mc.__webmcpNexusInputShape).toBeUndefined();
  });

  it('18. 归一层写入的属性都不可枚举（不破坏 "no own enumerable keys" 不变量）', () => {
    const { mc } = install(makeObjectEraHost());

    for (const key of [
      'getTools',
      'executeTool',
      '__webmcpNexusGetToolsWrapped',
      '__webmcpNexusExecuteToolWrapped',
    ]) {
      const descriptor = Object.getOwnPropertyDescriptor(mc, key);
      expect(descriptor, key).toBeDefined();
      expect(descriptor!.enumerable, key).toBe(false);
    }
  });

  it('19. 重复 patch 不会重复包装（clearRegistry 复位 modelContextPatched 后仍只包一层）', async () => {
    const { mc, executeTool } = install(makeStringEraHost());
    const firstExecuteTool = mc.executeTool;
    const firstGetTools = mc.getTools;

    // clearRegistry() 会把 modelContextPatched 置回 false；Vite HMR 换模块走的是同一条路。
    // 缺 …Wrapped 守卫时会再包一层，第二层闭包里的「原函数」其实是第一层的包装版。
    clearRegistry();
    patchModelContextEventSupport();

    expect(mc.executeTool).toBe(firstExecuteTool);
    expect(mc.getTools).toBe(firstGetTools);

    await mc.executeTool(makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING), { a: 1 });
    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('23. 传感器优先：先 getTools 再 executeTool 时不再额外探测', async () => {
    const { mc, getTools, executeTool } = install(makeStringEraHost());
    getTools.mockClear();

    const [tool] = await mc.getTools();
    expect(mc.__webmcpNexusInputShape).toBe('string');

    await mc.executeTool(tool, { a: 1 });
    expect(getTools).toHaveBeenCalledTimes(1);
    expect(executeTool.mock.calls[0][1]).toBe('{"a":1}');
  });

  it('24. 缓存窗口回归：只有 cross-document 工具时不写传感器，之后 same-document 出现仍能正确判定', async () => {
    const crossOnly = [
      makeRegisteredTool('crossDoc', SHAPE_SCHEMA_OBJECT, { sameDocument: false }),
    ];
    const { mc, getTools, executeTool } = install(makeStringEraHost(crossOnly));
    const tool = makeRegisteredTool('sameDoc', SHAPE_SCHEMA_STRING);

    // 兜底结论若被缓存，此后注册的 same-document 工具会全量报错且不自愈
    await mc.executeTool(tool, { a: 1 });
    expect(mc.__webmcpNexusInputShape).toBeUndefined();

    getTools.mockImplementation(async () => [
      ...crossOnly,
      makeRegisteredTool('sameDoc', SHAPE_SCHEMA_STRING),
    ]);
    await mc.executeTool(tool, { a: 2 });
    expect(mc.__webmcpNexusInputShape).toBe('string');
    expect(executeTool.mock.calls[1][1]).toBe('{"a":2}');
  });
});

describe('归一层 — code review 补强', () => {
  it('26. 无 inputSchema 的样本不参与代际投票，传感器不被写成 object', async () => {
    // 上游 IDL 是 `object inputSchema;` —— 非 required 也无默认值，按 dictionary 语义整键省略。
    // 无 schema 的工具对代际什么也证明不了；若计入投票，string-era 宿主会被永久误判成
    // object-era（传感器 write-once），此后全量调用失败且刷新前不自愈。
    const schemaless = { ...makeRegisteredTool('noSchema', SHAPE_SCHEMA_STRING) };
    delete schemaless.inputSchema;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mc, executeTool } = install(makeStringEraHost([schemaless]));
    const tool = makeRegisteredTool('noSchema', undefined as unknown as string);

    await mc.executeTool(tool, { a: 1 });

    expect(mc.__webmcpNexusInputShape).toBeUndefined();
    // 落非确定的 'object'，但**不缓存**，下次有真样本时仍能纠正
    expect(executeTool.mock.calls[0][1]).toEqual({ a: 1 });
  });

  it('27. 轴一用 rest args 透传 options（取消信号不得静默丢失）', async () => {
    const { mc, executeTool } = install(makeObjectEraHost());
    const [tool] = await mc.getTools();
    const controller = new AbortController();
    const options = { signal: controller.signal };

    await mc.executeTool(tool, { a: 1 }, options);

    // 删掉 ...rest 这条断言就会失败；本仓有过「包装器丢弃 signal 导致工具无法感知取消」的踩坑记录
    expect(executeTool.mock.calls[0][2]).toBe(options);
  });

  it('28. 并发首调只探测一次（在途 Promise 去重）', async () => {
    const { mc, getTools, executeTool } = install(makeStringEraHost());
    getTools.mockClear();
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_STRING);

    await Promise.all([
      mc.executeTool(tool, { a: 1 }),
      mc.executeTool(tool, { a: 2 }),
      mc.executeTool(tool, { a: 3 }),
    ]);

    expect(getTools).toHaveBeenCalledTimes(1);
    expect(executeTool.mock.calls.map(c => c[1])).toEqual(['{"a":1}', '{"a":2}', '{"a":3}']);
    // 探测结束后在途 Promise 被清掉，只留确定值
    expect(mc.__webmcpNexusInputShapeProbe).toBeUndefined();
    expect(mc.__webmcpNexusInputShape).toBe('string');
  });

  it('29. null 入参在两档都归一为「无参」', async () => {
    const stringSide = install(makeStringEraHost());
    await stringSide.mc.executeTool(makeRegisteredTool('t', SHAPE_SCHEMA_STRING), null);
    expect(stringSide.executeTool.mock.calls[0][1]).toBe('{}');

    teardownHost();

    const objectSide = install(makeObjectEraHost());
    await objectSide.mc.executeTool(makeRegisteredTool('t', SHAPE_SCHEMA_OBJECT), null);
    expect(objectSide.executeTool.mock.calls[0][1]).toEqual({});
  });

  it('30. 数组入参在两档都被拒绝（polyfill 明文接受数组，放行会让工具在缺参状态下执行）', async () => {
    const objectSide = install(makeObjectEraHost());
    await expect(
      objectSide.mc.executeTool(makeRegisteredTool('t', SHAPE_SCHEMA_OBJECT), [1, 2]),
    ).rejects.toBeInstanceOf(TypeError);
    expect(objectSide.executeTool).toHaveBeenCalledTimes(0);

    teardownHost();

    const stringSide = install(makeStringEraHost());
    await expect(
      stringSide.mc.executeTool(makeRegisteredTool('t', SHAPE_SCHEMA_STRING), [1, 2]),
    ).rejects.toBeInstanceOf(TypeError);
    expect(stringSide.executeTool).toHaveBeenCalledTimes(0);
  });

  it('31. 轴二对畸形 schema 的告警文案准确（不说 skipped）且按工具名去重', async () => {
    const raw = makeRegisteredTool('badTool', 'not json at all');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mc } = install(makeStringEraHost([raw]));

    // relay 每 2 秒轮询一次 getTools()，不去重就会持续刷屏
    await mc.getTools();
    await mc.getTools();
    await mc.getTools();

    const messages = warn.mock.calls.map(c => String(c[0]));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('badTool');
    expect(messages[0]).toContain('passing it through unchanged');
    // coerceInputSchema 的默认文案说的是「被跳过」，而轴二并不跳过 —— 不得出现
    expect(messages[0]).not.toContain('was skipped');
    warn.mockRestore();
  });

  it('32. 判定退化时留一条面包屑（每宿主至多一次）', async () => {
    const host = makeObjectEraHost();
    host.getTools.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mc, executeTool } = install(host);
    const tool = makeRegisteredTool('myTool', SHAPE_SCHEMA_OBJECT);

    await mc.executeTool(tool, { a: 1 });
    await mc.executeTool(tool, { a: 2 });

    const messages = warn.mock.calls.map(c => String(c[0]));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('NotAllowedError');
    expect(messages[0]).toContain('assuming object input');
    // 语义未变：仍落 'object'、仍不缓存
    expect(mc.__webmcpNexusInputShape).toBeUndefined();
    expect(executeTool.mock.calls.map(c => c[1])).toEqual([{ a: 1 }, { a: 2 }]);
    warn.mockRestore();
  });
});
