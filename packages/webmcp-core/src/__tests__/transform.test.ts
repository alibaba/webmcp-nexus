import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { transformCode } from '../transform';

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-core-transform-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('transformCode', () => {
  it('不包含注册调用的代码 → transformed: false', () => {
    const code = `
function hello() {
  return 'world';
}
`;
    const result = transformCode(code, path.join(tmpDir, 'plain.ts'));
    expect(result.transformed).toBe(false);
    expect(result.code).toBe(code);
  });

  it('包含 registerGlobalTools 但无可提取工具 → transformed: false', () => {
    const code = `
// 字符串中出现 registerGlobalTools 但没有实际调用
const name = 'registerGlobalTools';
`;
    const result = transformCode(code, path.join(tmpDir, 'no-call.ts'));
    expect(result.transformed).toBe(false);
  });

  it('包含 useWebMcpTools 调用 → transformed: true，输出包含 __webmcpSchema', () => {
    const code = `
/** 搜索用户 */
function searchUser(params: { query: string; limit?: number }) {
  return [];
}

useWebMcpTools({ searchUser });
`;
    const filePath = path.join(tmpDir, 'use-tools.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('__webmcpSchema');
    expect(result.code).toContain('[webmcp-nexus-core]');
    expect(result.code).toContain('searchUser.__webmcpSchema');
    // 注入代码应在 useWebMcpTools 调用之前
    const schemaIdx = result.code.indexOf('__webmcpSchema');
    const callIdx = result.code.indexOf('useWebMcpTools(');
    expect(schemaIdx).toBeLessThan(callIdx);
  });

  it('包含 registerGlobalTools 调用 → transformed: true，输出包含 __webmcpSchema', () => {
    // 创建源模块文件
    const moduleContent = `
/** 列出产品 */
export async function listProducts(params: { page: number }) {
  return [];
}
`;
    const modulePath = path.join(tmpDir, 'product-api.ts');
    fs.writeFileSync(modulePath, moduleContent);

    const code = `
import * as productApi from './product-api';

registerGlobalTools(productApi);
`;
    const filePath = path.join(tmpDir, 'register-entry.ts');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('__webmcpSchema');
    expect(result.code).toContain('productApi.listProducts.__webmcpSchema');
  });

  it('多个工具应全部生成 schema 注入', () => {
    const code = `
/** 工具A */
function toolA(params: { name: string }) {}

/** 工具B */
function toolB(params: { id: number }) {}

useWebMcpTools({ toolA, toolB });
`;
    const filePath = path.join(tmpDir, 'multi-tools.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('toolA.__webmcpSchema');
    expect(result.code).toContain('toolB.__webmcpSchema');
  });

  it('原始代码中 useWebMcpTools 调用仍保留', () => {
    const code = `
/** 测试工具 */
function myTool() {}

useWebMcpTools({ myTool });
`;
    const filePath = path.join(tmpDir, 'preserve-call.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('useWebMcpTools({ myTool })');
  });

  it('PropertyAssignment with Identifier value → injects on value variable', () => {
    const code = `
/** 列出待办 */
function listTodosTool(params: { limit?: number }) {
  return [];
}

useWebMcpTools({ listTodos: listTodosTool });
`;
    const filePath = path.join(tmpDir, 'prop-assign-identifier.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('listTodosTool.__webmcpSchema');
    expect(result.code).not.toContain('listTodos.__webmcpSchema');
  });

  it('PropertyAssignment with MemberExpression value → injects on member expression', () => {
    // 创建源模块文件
    const moduleContent = `
/** 搜索用户 */
export function searchUser(params: { query: string }) {
  return [];
}
`;
    const modulePath = path.join(tmpDir, 'user-api.ts');
    fs.writeFileSync(modulePath, moduleContent);

    const code = `
import * as userApi from './user-api';

useWebMcpTools({ search: userApi.searchUser });
`;
    const filePath = path.join(tmpDir, 'prop-assign-member.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    expect(result.code).toContain('userApi.searchUser.__webmcpSchema');
    expect(result.code).not.toContain('search.__webmcpSchema');
  });

  it('Mixed shorthand + PropertyAssignment → each injects on correct target', () => {
    const code = `
/** 创建待办 */
function createTodo(params: { title: string }) {
  return { id: '1', title: params.title };
}

/** 列出待办 */
function listTodosTool(params: { limit?: number }) {
  return [];
}

useWebMcpTools({ createTodo, listTodos: listTodosTool });
`;
    const filePath = path.join(tmpDir, 'prop-assign-mixed.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    expect(result.transformed).toBe(true);
    // shorthand: key = variable name
    expect(result.code).toContain('createTodo.__webmcpSchema');
    // non-shorthand: value expression
    expect(result.code).toContain('listTodosTool.__webmcpSchema');
    expect(result.code).not.toContain('listTodos.__webmcpSchema');
  });

  it('PropertyAssignment with inline arrow function → skips injection (no valid target)', () => {
    const code = `
useWebMcpTools({ listTodos: async (params: { limit?: number }) => { return []; } });
`;
    const filePath = path.join(tmpDir, 'prop-assign-inline-arrow.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    // inline 箭头函数无法作为赋值目标，应跳过注入
    expect(result.transformed).toBe(false);
  });

  it('PropertyAssignment with type assertion → skips injection (no valid target)', () => {
    const code = `
/** 工具 */
function myTool(params: { q: string }) { return []; }

useWebMcpTools({ search: myTool as any });
`;
    const filePath = path.join(tmpDir, 'prop-assign-as-expr.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    // 类型断言表达式无法安全注入，应跳过
    expect(result.transformed).toBe(false);
  });

  it('PropertyAssignment with call expression → skips injection (no valid target)', () => {
    const code = `
function createTool() { return (params: { q: string }) => []; }

useWebMcpTools({ search: createTool() });
`;
    const filePath = path.join(tmpDir, 'prop-assign-call-expr.tsx');
    fs.writeFileSync(filePath, code);

    const result = transformCode(code, filePath);

    // 函数调用返回值无法安全注入，应跳过
    expect(result.transformed).toBe(false);
  });
});
