import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformCode } from 'webmcp-nexus-core';

/**
 * mock webmcp-nexus-core，避免真实解析 TypeScript 的开销。
 * 测试仅关注 include 匹配逻辑，transformCode 一律返回已转换。
 */
vi.mock('webmcp-nexus-core', () => ({
  transformCode: vi.fn(() => ({
    code: '// transformed',
    transformed: true,
  })),
}));

const mockedTransformCode = vi.mocked(transformCode);

import { vitePluginWebMcp } from '../index';

/**
 * 构造一个最小化的 Vite ResolvedConfig，仅包含插件实际使用的 config.root 和 resolve.alias。
 */
function createMockConfig(root: string, alias?: unknown) {
  return {
    root,
    resolve: { alias: alias ?? [] },
  } as never;
}

/**
 * 初始化插件并模拟 configResolved → transform 调用链。
 * 返回 transform 的调用结果（null 表示被 include 排除，对象表示被处理）。
 */
function runTransform(
  projectRoot: string,
  fileId: string,
  options?: Parameters<typeof vitePluginWebMcp>[0],
  code = 'export const x = 1;',
) {
  const plugin = vitePluginWebMcp(options);
  (plugin as unknown as { configResolved: Function }).configResolved(createMockConfig(projectRoot));
  const context = { warn: vi.fn() };
  return (plugin as unknown as { transform: Function }).transform.call(context, code, fileId);
}

describe('vitePluginWebMcp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 恢复默认 mock 实现
    mockedTransformCode.mockReturnValue({ code: '// transformed', transformed: true });
  });

  describe('include 匹配', () => {
    const projectRoot = '/project';

    it('默认 include 匹配 src 下的 .ts 文件', () => {
      const result = runTransform(projectRoot, '/project/src/main.ts');
      expect(result).not.toBeNull();
    });

    it('默认 include 匹配 src 下的 .tsx 文件', () => {
      const result = runTransform(projectRoot, '/project/src/App.tsx');
      expect(result).not.toBeNull();
    });

    it('默认 include 匹配 src 子目录下的文件', () => {
      const result = runTransform(projectRoot, '/project/src/components/Button.tsx');
      expect(result).not.toBeNull();
    });

    it('默认 include 排除 src 之外的文件', () => {
      const result = runTransform(projectRoot, '/project/tests/main.test.ts');
      expect(result).toBeNull();
    });

    it('默认 include 排除非 JS/TS 文件', () => {
      const result = runTransform(projectRoot, '/project/src/style.css');
      expect(result).toBeNull();
    });

    it('自定义 include 覆盖默认值', () => {
      const result = runTransform(projectRoot, '/project/lib/utils.ts', {
        include: ['lib/**/*.ts'],
      });
      expect(result).not.toBeNull();
    });

    it('自定义 include 排除未匹配的文件', () => {
      const result = runTransform(projectRoot, '/project/src/main.ts', {
        include: ['lib/**/*.ts'],
      });
      expect(result).toBeNull();
    });
  });

  describe('Windows 路径兼容性', () => {
    it('处理带 query string 的模块 ID', () => {
      const result = runTransform('/project', '/project/src/main.ts?v=123');
      expect(result).not.toBeNull();
    });

    it('排除项目根目录之外的文件', () => {
      const result = runTransform('/project', '/other/src/main.ts');
      expect(result).toBeNull();
    });

    it('多层嵌套目录的 ** 匹配正确', () => {
      const result = runTransform('/project', '/project/src/a/b/c/d/deep.ts');
      expect(result).not.toBeNull();
    });
  });

  describe('configResolved', () => {
    it('读取 config.root 作为 projectRoot', () => {
      const plugin = vitePluginWebMcp();
      (plugin as unknown as { configResolved: Function }).configResolved(
        createMockConfig('/my-app'),
      );

      const context = { warn: vi.fn() };
      const result = (plugin as unknown as { transform: Function }).transform.call(
        context,
        'export const x = 1;',
        '/my-app/src/index.ts',
      );
      expect(result).not.toBeNull();
    });

    it('合并 vite resolve.alias 和用户 alias', () => {
      const plugin = vitePluginWebMcp({ alias: { '@custom': '/custom/path' } });
      (plugin as unknown as { configResolved: Function }).configResolved(
        createMockConfig('/project', [{ find: '@vite', replacement: '/vite/path' }]),
      );

      const context = { warn: vi.fn() };
      const result = (plugin as unknown as { transform: Function }).transform.call(
        context,
        'export const x = 1;',
        '/project/src/main.ts',
      );
      expect(result).not.toBeNull();
    });
  });

  describe('transform 行为', () => {
    it('非 JS/TS 扩展名直接返回 null', () => {
      const result = runTransform('/project', '/project/src/style.less');
      expect(result).toBeNull();
    });

    it('匹配到的文件调用 transformCode', () => {
      runTransform('/project', '/project/src/main.ts');
      expect(mockedTransformCode).toHaveBeenCalledTimes(1);
      expect(mockedTransformCode).toHaveBeenCalledWith(
        'export const x = 1;',
        '/project/src/main.ts',
        expect.objectContaining({ projectRoot: '/project' }),
      );
    });

    it('transformCode 返回 transformed=false 时返回 null', () => {
      mockedTransformCode.mockReturnValueOnce({ code: '// unchanged', transformed: false });

      const result = runTransform('/project', '/project/src/main.ts');
      expect(result).toBeNull();
    });

    it('transformCode 抛错时 warn 并返回 null', () => {
      mockedTransformCode.mockImplementationOnce(() => {
        throw new Error('parse failed');
      });

      const plugin = vitePluginWebMcp();
      (plugin as unknown as { configResolved: Function }).configResolved(
        createMockConfig('/project'),
      );

      const warnSpy = vi.fn();
      const result = (plugin as unknown as { transform: Function }).transform.call(
        { warn: warnSpy },
        'invalid code',
        '/project/src/main.ts',
      );

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('parse failed'));
    });
  });
});
