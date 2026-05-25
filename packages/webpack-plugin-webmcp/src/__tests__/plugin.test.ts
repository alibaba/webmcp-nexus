import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';

const MOCK_LOADER_PATH = '/mocked/path/to/loader.js';

vi.mock('../resolve-loader', () => ({
  resolveLoaderPath: () => MOCK_LOADER_PATH,
}));

import { WebMcpPlugin } from '../plugin';

function createMockCompiler(context: string = '/project') {
  return {
    context,
    options: {
      module: {
        rules: [] as any[],
      },
    },
    hooks: {
      done: {
        tap: vi.fn(),
      },
    },
  } as any;
}

function createMockCompilerWithAlias(context: string, alias: unknown) {
  const compiler = createMockCompiler(context);
  compiler.options.resolve = { alias };
  return compiler;
}

describe('WebMcpPlugin', () => {
  describe('constructor', () => {
    it('should use default options when none provided', () => {
      const plugin = new WebMcpPlugin();
      // We verify defaults through the apply behavior
      const compiler = createMockCompiler();
      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      expect(rule.test).toEqual(/\.[jt]sx?$/);
      expect(rule.include).toEqual([path.resolve('/project', 'src')]);
    });

    it('should accept custom options', () => {
      const plugin = new WebMcpPlugin({
        test: /\.ts$/,
        include: ['lib', 'src'],
      });

      const compiler = createMockCompiler('/my-app');
      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      expect(rule.test).toEqual(/\.ts$/);
      expect(rule.include).toEqual([
        path.resolve('/my-app', 'lib'),
        path.resolve('/my-app', 'src'),
      ]);
    });
  });

  describe('apply', () => {
    it('should inject a loader rule into compiler.options.module.rules', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompiler();

      plugin.apply(compiler);

      expect(compiler.options.module.rules).toHaveLength(1);
      const rule = compiler.options.module.rules[0];
      expect(rule.enforce).toBe('pre');
      expect(rule.use).toEqual([
        { loader: expect.any(String), options: { projectRoot: '/project', alias: {} } },
      ]);
    });

    it('should resolve relative include paths against compiler.context', () => {
      const plugin = new WebMcpPlugin({ include: ['src', 'lib'] });
      const compiler = createMockCompiler('/workspace/my-project');

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      expect(rule.include).toEqual([
        path.resolve('/workspace/my-project', 'src'),
        path.resolve('/workspace/my-project', 'lib'),
      ]);
    });

    it('should preserve absolute include paths as-is', () => {
      const plugin = new WebMcpPlugin({
        include: ['/absolute/path/src'],
      });
      const compiler = createMockCompiler('/project');

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      expect(rule.include).toEqual(['/absolute/path/src']);
    });

    it('should tap into compiler.hooks.done', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompiler();

      plugin.apply(compiler);

      expect(compiler.hooks.done.tap).toHaveBeenCalledWith('WebMcpPlugin', expect.any(Function));
    });

    it('should append rule to existing rules', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompiler();
      compiler.options.module.rules.push({ test: /\.css$/ });

      plugin.apply(compiler);

      expect(compiler.options.module.rules).toHaveLength(2);
    });
  });

  describe('alias 透传', () => {
    it('从对象形式的 resolve.alias 读取并透传给 loader', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompilerWithAlias('/project', {
        '@src': '/project/src',
        'not-string': false, // 非字符串应被忽略
      });

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      const loaderOptions = rule.use[0].options;
      expect(loaderOptions.alias).toEqual({ '@src': '/project/src' });
    });

    it('从数组形式的 resolve.alias 读取并透传给 loader', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompilerWithAlias('/project', [
        { name: '@src', alias: '/project/src' },
        { name: '@api', alias: '/project/src/api' },
        { name: 'invalid', alias: ['/a', '/b'] }, // 数组 value 应被忽略
      ]);

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      const loaderOptions = rule.use[0].options;
      expect(loaderOptions.alias).toEqual({
        '@src': '/project/src',
        '@api': '/project/src/api',
      });
    });

    it('用户显式配置的 alias 会覆盖 webpack resolve.alias 中的同名项', () => {
      const plugin = new WebMcpPlugin({
        alias: { '@src': '/override/src' },
      });
      const compiler = createMockCompilerWithAlias('/project', {
        '@src': '/project/src',
        '@api': '/project/src/api',
      });

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      const loaderOptions = rule.use[0].options;
      expect(loaderOptions.alias).toEqual({
        '@src': '/override/src',
        '@api': '/project/src/api',
      });
    });

    it('未配置 resolve.alias 时 → 透传空 alias 对象', () => {
      const plugin = new WebMcpPlugin();
      const compiler = createMockCompiler('/project');

      plugin.apply(compiler);

      const rule = compiler.options.module.rules[0];
      const loaderOptions = rule.use[0].options;
      expect(loaderOptions.alias).toEqual({});
    });
  });
});
