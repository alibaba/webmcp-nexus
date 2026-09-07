import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { extractToolsFromFile } from '../ts-extractor';
import {
  assertValidToolName,
  generateSchemaInjectionCode,
  generateFieldSchemasInjectionCode,
  resolveToolDescription,
  WEBMCP_TOOL_NAME_PATTERN,
} from '../schema-generator';

/**
 * WebMCP 协议字段的构建期适配：
 * - @title / @untrusted / @consequential 三个 JSDoc 标签的抽取（与既有 @readonly 同构）
 * - 空 description 兜底（polyfill 5.x 对空描述抛 InvalidStateError）
 * - 非法工具名构建报错（polyfill 5.x 校验名称；relay 5.x 还会因工具列表非法切断连接）
 */

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-protocol-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function extractFrom(source: string, fileName = 'component.tsx') {
  const filePath = path.join(tmpDir, fileName);
  fs.writeFileSync(filePath, source);
  return extractToolsFromFile(source, filePath);
}

describe('JSDoc 协议标签抽取 — 函数声明', () => {
  it('@title / @untrusted / @consequential 与 @readonly 同时抽取', () => {
    const result = extractFrom(`
/**
 * 删除一条待办
 * @title 删除待办
 * @readonly
 * @untrusted
 * @consequential
 */
function removeTodo(params: { id: string }) { return null; }

useWebMcpTools({ removeTodo });
`);

    const tool = result!.tools.find(t => t.name === 'removeTodo')!;
    expect(tool.description).toBe('删除一条待办');
    expect(tool.title).toBe('删除待办');
    expect(tool.readOnly).toBe(true);
    expect(tool.untrustedContent).toBe(true);
    expect(tool.consequential).toBe(true);
  });

  it('无标签时三个可选字段为 undefined（不写入产物，避免膨胀）', () => {
    const result = extractFrom(`
/** 列出待办 */
function listTodos(params: { done?: boolean }) { return []; }

useWebMcpTools({ listTodos });
`);

    const tool = result!.tools.find(t => t.name === 'listTodos')!;
    expect(tool.title).toBeUndefined();
    expect(tool.untrustedContent).toBeUndefined();
    expect(tool.consequential).toBeUndefined();
    expect(tool.readOnly).toBe(false);
  });

  it('@title 带多词文本时完整保留', () => {
    const result = extractFrom(`
/**
 * 在画板上绘制一个矩形
 * @title Draw a rectangle
 */
function drawRect(params: { w: number }) { return null; }

useWebMcpTools({ drawRect });
`);

    expect(result!.tools.find(t => t.name === 'drawRect')!.title).toBe('Draw a rectangle');
  });
});

describe('JSDoc 协议标签抽取 — class 成员（withWebMcpTools）', () => {
  const classSource = `
class FormPanel {
  /**
   * 读取表单数据
   * @title 读取表单
   * @readonly
   */
  getFormData(params: { id: string }) { return {}; }

  /**
   * 提交表单
   * @consequential
   * @untrusted
   */
  submitForm = (params: { id: string }) => { return {}; };

  render() { return null; }
}

export default withWebMcpTools(FormPanel);
`;

  it('原型方法抽取 @title / @readonly', () => {
    const result = extractFrom(classSource, 'form-panel.tsx');
    const proto = result!.tools.find(t => t.name === 'getFormData')!;
    expect(proto.memberType).toBe('prototype');
    expect(proto.title).toBe('读取表单');
    expect(proto.readOnly).toBe(true);
    expect(proto.consequential).toBeUndefined();
  });

  it('class field 箭头函数抽取 @consequential / @untrusted', () => {
    const result = extractFrom(classSource, 'form-panel.tsx');
    const field = result!.tools.find(t => t.name === 'submitForm')!;
    expect(field.memberType).toBe('field');
    expect(field.consequential).toBe(true);
    expect(field.untrustedContent).toBe(true);
    expect(field.readOnly).toBe(false);
  });
});

describe('空 description 兜底（构建期左移）', () => {
  it('空描述回退为工具名并 warn 一次', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const description = resolveToolDescription('', 'submitForm', 'FormPanel.prototype.submitForm');
    expect(description).toBe('submitForm');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('submitForm');
  });

  it('纯空白描述同样回退', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveToolDescription('   \n  ', 'fn', 'fn')).toBe('fn');
  });

  it('非空描述原样保留且不 warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveToolDescription('  列出待办  ', 'listTodos', 'listTodos')).toBe('列出待办');
    expect(warn).not.toHaveBeenCalled();
  });

  it('generateSchemaInjectionCode 产物的 description 已兜底', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const code = generateSchemaInjectionCode('Cls.prototype.m', '', [], false, { toolName: 'm' });
    const payload = JSON.parse(code.slice(code.indexOf('=') + 1, code.lastIndexOf(';')));
    expect(payload.description).toBe('m');
  });

  it('generateFieldSchemasInjectionCode 同样兜底', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const code = generateFieldSchemasInjectionCode('Cls', [
      { name: 'fillForm', description: '', properties: [], readOnly: false },
    ]);
    const payload = JSON.parse(code.slice(code.indexOf('=') + 1, code.lastIndexOf(';')));
    expect(payload.fillForm.description).toBe('fillForm');
  });
});

describe('非法工具名构建报错', () => {
  it.each([
    ['中文名', '获取数据'],
    ['含空格', 'my tool'],
    ['含斜杠', 'ns/tool'],
    ['空字符串', ''],
    ['129 字符', 'a'.repeat(129)],
  ])('%s 抛错', (_label, name) => {
    expect(() => assertValidToolName(name, 'target')).toThrow(/Invalid tool name/);
  });

  it.each([
    ['camelCase', 'listTodos'],
    ['下划线', 'list_todos'],
    ['连字符', 'list-todos'],
    ['点号', 'list.todos'],
    ['数字开头', '2fa_verify'],
    ['128 字符', 'a'.repeat(128)],
  ])('%s 通过', (_label, name) => {
    expect(() => assertValidToolName(name, 'target')).not.toThrow();
    expect(WEBMCP_TOOL_NAME_PATTERN.test(name)).toBe(true);
  });

  it('错误信息包含工具名与注入目标，便于定位', () => {
    expect(() => assertValidToolName('获取数据', 'userApi.获取数据')).toThrow(
      /获取数据.*userApi\.获取数据/s,
    );
  });

  it('generateSchemaInjectionCode 未显式传 toolName 时从注入目标推导并校验', () => {
    expect(() => generateSchemaInjectionCode('userApi.获取数据', '描述', [], false)).toThrow(
      /Invalid tool name "获取数据"/,
    );
  });
});

describe('重命名形式的 useCallback 工具（{ toolName: implVar }）', () => {
  // 回归：标识符解析到 `const implVar = useCallback(...)` 后必须再解包一次，
  // 否则 funcNode 停在 CallExpression 上，extractFunctionMetadata 的三个场景全不匹配，
  // description 静默为空 —— polyfill 2.x 容忍空描述所以从未暴露，5.x 会抛 InvalidStateError。
  it('能从 useCallback 包装的变量声明上拿到 JSDoc 与全部标签', () => {
    const result = extractFrom(
      `
import { useCallback } from 'react';

export function TodosPage() {
  /**
   * [作用域：待办页] 列出全部待办
   * @readonly
   * @title 列出待办
   */
  const listTodosImpl = useCallback((params: { limit?: number }) => [], []);

  useWebMcpTools({ listTodos: listTodosImpl });
  return null;
}
`,
      'todos-page.tsx',
    );

    const tool = result!.tools.find(t => t.name === 'listTodos')!;
    expect(tool).toBeDefined();
    expect(tool.description).toBe('[作用域：待办页] 列出全部待办');
    expect(tool.readOnly).toBe(true);
    expect(tool.title).toBe('列出待办');
    expect(tool.properties.map(p => p.name)).toEqual(['limit']);
    // 注入目标仍是变量名（运行时作用域里可赋值）
    expect(tool.injectionTarget).toBe('listTodosImpl');
  });

  it('简写形式 { fn } 与内联 useCallback 形式仍正常（无回归）', () => {
    const result = extractFrom(
      `
import { useCallback } from 'react';

export function Page() {
  /** 内联 useCallback */
  const inline = useCallback((params: { a: string }) => null, []);

  useWebMcpTools({ inline });
  return null;
}
`,
      'inline-page.tsx',
    );

    const tool = result!.tools.find(t => t.name === 'inline')!;
    expect(tool.description).toBe('内联 useCallback');
    expect(tool.properties.map(p => p.name)).toEqual(['a']);
  });
});

describe('__webmcpSchema 产物字段', () => {
  function parsePayload(code: string) {
    return JSON.parse(code.slice(code.indexOf('=') + 1, code.lastIndexOf(';')));
  }

  it('六字段全开时全部写入', () => {
    const code = generateSchemaInjectionCode('bookFlight', 'Book a flight', [], false, {
      toolName: 'bookFlight',
      title: 'Book flight',
      untrustedContent: true,
      consequential: true,
    });
    expect(parsePayload(code)).toEqual({
      description: 'Book a flight',
      inputSchema: { type: 'object', properties: {} },
      readOnly: false,
      title: 'Book flight',
      untrustedContent: true,
      consequential: true,
    });
  });

  it('可选字段缺省时不出现在产物里', () => {
    const code = generateSchemaInjectionCode('listTodos', 'List todos', [], true, {
      toolName: 'listTodos',
    });
    const payload = parsePayload(code);
    expect(Object.keys(payload).sort()).toEqual(['description', 'inputSchema', 'readOnly']);
    expect(payload.readOnly).toBe(true);
  });

  it('端到端：抽取结果经 transform 后写入注入代码', () => {
    const result = extractFrom(`
/**
 * 清空画板
 * @title 清空画板
 * @consequential
 */
function clearCanvas(params: { confirm: boolean }) { return null; }

useWebMcpTools({ clearCanvas });
`);
    const tool = result!.tools.find(t => t.name === 'clearCanvas')!;
    const code = generateSchemaInjectionCode(
      tool.injectionTarget,
      tool.description,
      tool.properties,
      tool.readOnly,
      {
        toolName: tool.name,
        ...(tool.title ? { title: tool.title } : {}),
        ...(tool.consequential ? { consequential: true } : {}),
      },
    );
    const payload = parsePayload(code);
    expect(payload.title).toBe('清空画板');
    expect(payload.consequential).toBe(true);
    expect(payload.untrustedContent).toBeUndefined();
    expect(payload.inputSchema.properties.confirm).toEqual({ type: 'boolean' });
    expect(payload.inputSchema.required).toEqual(['confirm']);
  });
});
