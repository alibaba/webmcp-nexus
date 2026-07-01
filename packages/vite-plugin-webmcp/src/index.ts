/**
 * vite-plugin-webmcp-nexus
 *
 * Vite 插件胶水层，在构建时通过 transform hook 委托 webmcp-nexus-core
 * 自动提取 TypeScript 类型并注入 __webmcpSchema 属性。
 */

import nodePath from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { transformCode, type AliasMap } from 'webmcp-nexus-core';

const isDebug = () => (process.env.DEBUG ?? '').toLowerCase().includes('webmcp');

export interface WebMcpPluginOptions {
  /** 扫描范围（glob patterns），默认 ['src/\*\*\/*.ts', 'src/\*\*\/*.tsx'] */
  include?: string[];
  /**
   * 额外的模块路径 alias（合并到 vite 的 resolve.alias 之上）。
   * 用于解析 `import * as api from '@alias/xxx'` 类型的模块说明符。
   */
  alias?: Record<string, string>;
}

/**
 * 将 Vite 解析后的 resolve.alias（Alias[] 形式）归一化为 Record<string, string>。
 * 仅取 find 为 string 的项；RegExp find 无法直接形成前缀匹配表，忽略。
 */
function normalizeViteAlias(raw: ResolvedConfig['resolve']['alias']): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  const list = Array.isArray(raw) ? raw : [];
  for (const item of list) {
    if (!item || typeof item.find !== 'string' || typeof item.replacement !== 'string') continue;
    out[item.find] = item.replacement;
  }
  return out;
}

export function vitePluginWebMcp(options: WebMcpPluginOptions = {}): Plugin {
  const { include = ['src/**/*.ts', 'src/**/*.tsx'], alias: userAlias = {} } = options;
  let projectRoot = '';
  let mergedAlias: AliasMap = {};

  return {
    name: 'vite-plugin-webmcp',
    enforce: 'pre',

    configResolved(config) {
      projectRoot = config.root;
      const viteAlias = normalizeViteAlias(config.resolve?.alias);
      // 用户显式配置优先覆盖 vite 默认 alias
      mergedAlias = { ...viteAlias, ...userAlias };
    },

    transform(code: string, id: string) {
      const cleanId = id.split('?')[0];
      if (!/\.[jt]sx?$/.test(cleanId)) return null;

      // include 匹配检查
      // 统一使用正斜杠，避免 Windows 反斜杠导致 glob 匹配失败
      const relativePath = nodePath.relative(projectRoot, cleanId).replace(/\\/g, '/');
      const isIncluded = include.some(pattern => {
        const regex = new RegExp(
          '^' +
            pattern
              .replace(/\./g, '\\.')
              .replace(/\*\*\//g, '(?:.*\\/)?')
              .replace(/\*/g, '[^/]*') +
            '$',
        );
        return regex.test(relativePath);
      });
      if (!isIncluded) return null;

      if (isDebug()) {
        console.log(`[webmcp] vite transform processing: ${cleanId}`);
      }

      // 委托给 webmcp-nexus-core
      try {
        const result = transformCode(code, cleanId, { projectRoot, alias: mergedAlias });

        if (result.transformed) {
          if (isDebug()) {
            console.log(`[webmcp] vite transformed: ${cleanId}`);
          }
          return { code: result.code, map: null };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.warn(`[webmcp] transform failed for ${cleanId}: ${message}`);
        if (isDebug()) {
          console.warn(`[webmcp] transform error:`, err);
        }
      }

      return null;
    },
  };
}

export default vitePluginWebMcp;
