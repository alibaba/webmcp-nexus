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
});
