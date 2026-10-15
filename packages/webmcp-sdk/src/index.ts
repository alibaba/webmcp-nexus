// packages/webmcp-sdk/src/index.ts
export { registerGlobalTools } from './registerGlobalTools';
export { useWebMcpTools } from './useWebMcpTools';
export { withWebMcpTools } from './withWebMcpTools';
export { configureBuiltinTools } from './builtinTools';
export type {
  WebMcpToolFn,
  WebMcpToolSchema,
  WebMcpAnnotatedFn,
  WebMcpToolConfig,
  WebMcpToolAnnotations,
  WebMcpToolExecuteOptions,
  WebMcpBuiltinToolsOptions,
} from './types';
