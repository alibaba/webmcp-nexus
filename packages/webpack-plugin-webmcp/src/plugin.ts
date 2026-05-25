import type { Compiler, RuleSetRule } from 'webpack';
import path from 'node:path';
import { resolveLoaderPath } from './resolve-loader';

export interface WebMcpPluginOptions {
  /** 文件匹配规则，默认 /\.[jt]sx?$/ */
  test?: RegExp;
  /** 包含的目录路径（相对于项目根目录或绝对路径），默认 ['src'] */
  include?: string[];
  /**
   * 额外的模块路径 alias（合并到 webpack 的 resolve.alias 之上）。
   * 用于解析 `import * as api from '@alias/xxx'` 类型的模块说明符。
   */
  alias?: Record<string, string>;
}

const PLUGIN_NAME = 'WebMcpPlugin';

/**
 * 将 webpack resolve.alias 归一化为 Record<string, string>。
 * 支持对象形式和数组形式两种配置；忽略 false / string[] 等非字符串 value。
 */
function normalizeWebpackAlias(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const name = (item as { name?: unknown }).name;
      const alias = (item as { alias?: unknown }).alias;
      if (typeof name === 'string' && typeof alias === 'string') {
        out[name] = alias;
      }
    }
    return out;
  }

  if (typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'string') out[k] = v;
    }
  }
  return out;
}

export class WebMcpPlugin {
  private options: Required<Pick<WebMcpPluginOptions, 'test' | 'include'>> & {
    alias: Record<string, string>;
  };

  constructor(options: WebMcpPluginOptions = {}) {
    this.options = {
      test: options.test ?? /\.[jt]sx?$/,
      include: options.include ?? ['src'],
      alias: options.alias ?? {},
    };
  }

  apply(compiler: Compiler): void {
    const projectRoot = compiler.context;

    // 自动注入 Loader 到 module.rules
    const loaderPath = resolveLoaderPath();

    // 合并 webpack resolve.alias 和用户显式配置的 alias（后者优先）
    const webpackAlias = normalizeWebpackAlias(compiler.options.resolve?.alias);
    const mergedAlias: Record<string, string> = { ...webpackAlias, ...this.options.alias };

    const rule: RuleSetRule = {
      test: this.options.test,
      // Webpack RuleSetRule.include 使用绝对路径前缀匹配，不支持 glob
      include: this.options.include.map(p =>
        path.isAbsolute(p) ? p : path.resolve(projectRoot, p),
      ),
      enforce: 'pre' as const,
      use: [{ loader: loaderPath, options: { projectRoot, alias: mergedAlias } }],
    };

    compiler.options.module.rules.push(rule);

    // === 全局协调扩展点（当前空实现，预留未来能力）===
    compiler.hooks.done.tap(PLUGIN_NAME, _stats => {
      // 预留：工具名冲突检测、manifest 生成、全局分析等
      // 当前版本不实现任何逻辑
    });
  }
}
