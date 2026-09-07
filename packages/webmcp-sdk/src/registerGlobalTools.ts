// packages/webmcp-sdk/src/registerGlobalTools.ts
import {
  registerEntry,
  registerScopedTool,
  notifyToolsChanged,
  patchModelContextEventSupport,
  isRegistrableToolName,
  buildToolConfig,
} from './registry';
import { ensureModelContextPolyfill } from './polyfill';
import { isModelContextAvailable } from './model-context';
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
  if (!isModelContextAvailable()) {
    return;
  }

  try {
    patchModelContextEventSupport();

    let registeredCount = 0;

    for (const toolMap of toolMaps) {
      for (const [name, fn] of Object.entries(toolMap)) {
        // 跳过非函数值（如 TypeScript 类型导出在运行时可能不存在）
        if (typeof fn !== 'function') continue;

        // __webmcpSchema 由构建插件在构建时注入
        const schema = (fn as WebMcpAnnotatedFn).__webmcpSchema;
        if (!schema) continue;

        // 名称守卫必须在写入镜像之前：default 键与非法名不得进 activeTools，
        // 否则会与宿主的真实工具表分裂
        if (!isRegistrableToolName(name)) continue;

        registerEntry(name, 'global', 'app');
        registerScopedTool(
          buildToolConfig(name, schema, async (input, options) => fn(input, options)),
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
