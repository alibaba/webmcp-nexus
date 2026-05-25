import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { extractToolsFromFile, resolveWithAlias } from '../ts-extractor';

/**
 * 集成测试：验证 extractToolsFromFile 的完整提取流程
 */

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-test-'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('extractToolsFromFile — 对象字面量参数', () => {
  it('从 useWebMcpTools({ fn1, fn2 }) 提取工具', () => {
    const fileContent = `
/** 搜索用户 */
function searchUser(params: { query: string; limit?: number }) {
  return [];
}

/** 获取用户详情 */
function getUser(params: { id: number }) {
  return {};
}

useWebMcpTools({ searchUser, getUser });
`;
    const filePath = path.join(tmpDir, 'component.tsx');
    fs.writeFileSync(filePath, fileContent);

    const result = extractToolsFromFile(fileContent, filePath);

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(2);

    const searchTool = result!.tools.find(t => t.name === 'searchUser')!;
    expect(searchTool).toBeDefined();
    expect(searchTool.description).toBe('搜索用户');
    expect(searchTool.properties).toHaveLength(2);
    expect(searchTool.injectionTarget).toBe('searchUser');

    const getUserTool = result!.tools.find(t => t.name === 'getUser')!;
    expect(getUserTool).toBeDefined();
    expect(getUserTool.description).toBe('获取用户详情');
    expect(getUserTool.properties).toHaveLength(1);
  });

  it('JSDoc @readonly 标签 → readOnly 为 true', () => {
    const fileContent = `
/**
 * 获取系统状态
 * @readonly
 */
function getStatus() {
  return { ok: true };
}

useWebMcpTools({ getStatus });
`;
    const filePath = path.join(tmpDir, 'readonly-component.tsx');
    fs.writeFileSync(filePath, fileContent);

    const result = extractToolsFromFile(fileContent, filePath);

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(1);
    expect(result!.tools[0].readOnly).toBe(true);
    expect(result!.tools[0].description).toBe('获取系统状态');
  });

  it('无参函数 → 空 properties', () => {
    const fileContent = `
/** 获取当前时间 */
function getCurrentTime() {
  return new Date();
}

useWebMcpTools({ getCurrentTime });
`;
    const filePath = path.join(tmpDir, 'no-params.tsx');
    fs.writeFileSync(filePath, fileContent);

    const result = extractToolsFromFile(fileContent, filePath);

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(1);
    expect(result!.tools[0].properties).toHaveLength(0);
  });
});

describe('extractToolsFromFile — namespace import 参数', () => {
  it('从 import * as api + registerGlobalTools(api) 提取工具', () => {
    // 创建源模块文件
    const moduleContent = `
/** 列出所有用户 */
export async function listUsers(params: { page: number; size: number }) {
  return [];
}

/** 删除用户 */
export async function deleteUser(params: { userId: string }) {
  return { success: true };
}
`;
    const modulePath = path.join(tmpDir, 'user-api.ts');
    fs.writeFileSync(modulePath, moduleContent);

    // 创建注册调用文件
    const entryContent = `
import * as userApi from './user-api';

registerGlobalTools(userApi);
`;
    const entryPath = path.join(tmpDir, 'entry.ts');
    fs.writeFileSync(entryPath, entryContent);

    const result = extractToolsFromFile(entryContent, entryPath);

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(2);

    const listTool = result!.tools.find(t => t.name === 'listUsers')!;
    expect(listTool).toBeDefined();
    expect(listTool.description).toBe('列出所有用户');
    expect(listTool.properties).toHaveLength(2);
    expect(listTool.injectionTarget).toBe('userApi.listUsers');

    const deleteTool = result!.tools.find(t => t.name === 'deleteUser')!;
    expect(deleteTool).toBeDefined();
    expect(deleteTool.injectionTarget).toBe('userApi.deleteUser');
  });

  it('namespace import 中 @readonly 标签被正确提取', () => {
    const moduleContent = `
/**
 * 获取服务器健康状态
 * @readonly
 */
export function healthCheck() {
  return { status: 'ok' };
}
`;
    const modulePath = path.join(tmpDir, 'health-api.ts');
    fs.writeFileSync(modulePath, moduleContent);

    const entryContent = `
import * as healthApi from './health-api';

registerGlobalTools(healthApi);
`;
    const entryPath = path.join(tmpDir, 'health-entry.ts');
    fs.writeFileSync(entryPath, entryContent);

    const result = extractToolsFromFile(entryContent, entryPath);

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(1);
    expect(result!.tools[0].readOnly).toBe(true);
    expect(result!.tools[0].description).toBe('获取服务器健康状态');
  });
});

describe('extractToolsFromFile — 边界情况', () => {
  it('无注册调用 → 返回 null', () => {
    const fileContent = `
function someOtherFunction() {}
`;
    const result = extractToolsFromFile(fileContent, path.join(tmpDir, 'no-reg.ts'));
    expect(result).toBeNull();
  });

  it('registrationCalls 包含正确的调用类型和位置', () => {
    const fileContent = `
/** 测试工具 */
function testTool() {}

useWebMcpTools({ testTool });
`;
    const filePath = path.join(tmpDir, 'reg-call.tsx');
    fs.writeFileSync(filePath, fileContent);

    const result = extractToolsFromFile(fileContent, filePath);

    expect(result).not.toBeNull();
    expect(result!.registrationCalls).toHaveLength(1);
    expect(result!.registrationCalls[0].type).toBe('useWebMcpTools');
    expect(typeof result!.registrationCalls[0].start).toBe('number');
  });
});

describe('resolveWithAlias — 别名解析', () => {
  it('同名匹配 → 返回目标路径', () => {
    expect(resolveWithAlias('@src', { '@src': '/abs/src' })).toBe('/abs/src');
  });

  it('前缀匹配 → 拼接剩余部分', () => {
    expect(resolveWithAlias('@src/foo/bar', { '@src': '/abs/src' })).toBe('/abs/src/foo/bar');
  });

  it('最长前缀优先命中', () => {
    const aliasMap = { '@': '/abs/root', '@src': '/abs/src' };
    expect(resolveWithAlias('@src/foo', aliasMap)).toBe('/abs/src/foo');
  });

  it('精确匹配 $ 后缀 → 仅在等值时命中', () => {
    const aliasMap = { xyz$: '/abs/xyz-only' };
    expect(resolveWithAlias('xyz', aliasMap)).toBe('/abs/xyz-only');
    expect(resolveWithAlias('xyz/foo', aliasMap)).toBeNull();
  });

  it('未命中 → 返回 null', () => {
    expect(resolveWithAlias('lodash', { '@src': '/abs/src' })).toBeNull();
  });

  it('空 alias → 返回 null', () => {
    expect(resolveWithAlias('@src/foo')).toBeNull();
  });
});

describe('extractToolsFromFile — alias 解析', () => {
  it('通过 alias 解析 namespace import 源模块', () => {
    // 模拟一个“项目根”，及别名指向的模块目录
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-alias-'));
    const srcDir = path.join(projectRoot, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const moduleContent = `
/** 写入文档 */
export async function writeDocument(params: { content: string }) {
  return { ok: true };
}
`;
    const modulePath = path.join(srcDir, 'document.ts');
    fs.writeFileSync(modulePath, moduleContent);

    // 入口文件放在另一个子目录，并用 alias 路径 import
    const componentsDir = path.join(projectRoot, 'components');
    fs.mkdirSync(componentsDir, { recursive: true });
    const entryContent = `
import * as docApi from '@src/document';

registerGlobalTools(docApi);
`;
    const entryPath = path.join(componentsDir, 'index.tsx');
    fs.writeFileSync(entryPath, entryContent);

    const result = extractToolsFromFile(entryContent, entryPath, projectRoot, {
      '@src': srcDir,
    });

    expect(result).not.toBeNull();
    expect(result!.tools).toHaveLength(1);
    expect(result!.tools[0].name).toBe('writeDocument');
    expect(result!.tools[0].description).toBe('写入文档');
    expect(result!.tools[0].injectionTarget).toBe('docApi.writeDocument');

    fs.rmSync(projectRoot, { recursive: true, force: true });
  });

  it('bare specifier 且无 alias 命中 → 返回空 tools', () => {
    const entryContent = `
import * as ext from 'some-external-module';

registerGlobalTools(ext);
`;
    const entryPath = path.join(tmpDir, 'bare-import.tsx');
    fs.writeFileSync(entryPath, entryContent);

    const result = extractToolsFromFile(entryContent, entryPath);
    expect(result).toBeNull();
  });
});
