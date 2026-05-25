// packages/webmcp-sdk/src/registerGlobalTools.ts
import {
  registerEntry,
  registerScopedTool,
  notifyToolsChanged,
  patchModelContextEventSupport,
} from './registry';
import { ensureModelContextPolyfill } from './polyfill';
import type { WebMcpAnnotatedFn } from './types';

/**
 * 全局注册 WebMCP 工具。应用启动时调用一次。
 * 支持可变参数，兼容 import * as module 批量导入。
 *
 * @param toolMaps - 一个或多个 Record<string, Function> 对象
 *
 * @example
 * import * as userApi from './api/user';
 * import * as productApi from './api/product';
 * registerGlobalTools(userApi, productApi);
 *
 * @example
 * registerGlobalTools({ getUser, searchUsers }, { searchProducts });
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function registerGlobalTools(...toolMaps: Record<string, Function>[]): void {
  ensureModelContextPolyfill();
  if (typeof navigator === 'undefined' || !('modelContext' in navigator)) {
    return;
  }

  try {
    patchModelContextEventSupport();

    let registeredCount = 0;

    for (const toolMap of toolMaps) {
      for (const [name, fn] of Object.entries(toolMap)) {
        // 跳过非函数值（如 TypeScript 类型导出在运行时可能不存在）
        if (typeof fn !== 'function') continue;

        // __webmcpSchema 由 Vite 插件在构建时注入
        const schema = (fn as WebMcpAnnotatedFn).__webmcpSchema;
        if (!schema) continue;

        registerEntry(name, 'global', 'app');
        registerScopedTool(
          {
            name,
            description: schema.description,
            inputSchema: schema.inputSchema,
            execute: async (input: unknown) => fn(input),
            annotations: { readOnlyHint: schema.readOnly ?? false },
          },
          { scope: 'global', scopeId: 'app' },
        );
        registeredCount++;
      }
    }

    if (registeredCount > 0) {
      notifyToolsChanged();
    }
  } catch {
    // 全局兜底：SDK 入口不向调用方传播浏览器 API 异常
  }
}
