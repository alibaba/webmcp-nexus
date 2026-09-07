// packages/webmcp-sdk/src/testing.ts
//
// 测试专用子入口（`webmcp-nexus-sdk/testing`）。
//
// 主入口 index.ts 只暴露三个注册函数与公共类型，不污染生产 API 面；而集成测试需要
// 清理注册表、卸载 polyfill、以及读取宿主的解析结果。这些钩子统一从这里导出。
//
// 生产代码不应 import 本子入口。
export {
  clearRegistry,
  getActiveToolNames,
  getActiveToolConfigs,
  getActiveToolStates,
} from './registry';
export type { ActiveToolState, NativeToolState } from './registry';

export { __resetPolyfillStateForTest, __cleanupPolyfillOnlyForTest } from './polyfill';

export {
  coerceInputSchema,
  getModelContext,
  getModelContextTesting,
  isModelContextAvailable,
  isModernHost,
  isValidToolName,
  toWidgetToolDescriptor,
} from './model-context';
export type { WebMcpHostContext, WidgetToolDescriptor } from './model-context';
