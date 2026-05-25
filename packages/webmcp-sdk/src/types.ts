// packages/webmcp-sdk/src/types.ts

/** 工具 schema 元数据（由 Vite 插件构建时注入到函数的 __webmcpSchema 属性） */
export interface WebMcpToolSchema {
  /** 工具描述（来自 JSDoc） */
  description: string;
  /** 输入参数的 JSON Schema（来自 TypeScript 类型推导） */
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  /** 是否为只读工具（来自 @readonly JSDoc 标签） */
  readOnly?: boolean;
}

/**
 * 带有 __webmcpSchema 属性的函数类型。
 * Vite 插件在构建时会将 schema 注入到函数的 __webmcpSchema 属性上。
 */
export type WebMcpToolFn<TParams = unknown, TResult = unknown> = {
  (params: TParams): Promise<TResult>;
  __webmcpSchema?: WebMcpToolSchema;
};

/**
 * 带有可选 __webmcpSchema 属性的标注函数。
 * 用于替代 `as any` 访问 __webmcpSchema。
 */
export interface WebMcpAnnotatedFn {
  (...args: unknown[]): unknown;
  __webmcpSchema?: WebMcpToolSchema;
}

/** 传递给 navigator.modelContext.registerTool 的工具配置 */
export interface WebMcpToolConfig {
  name: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
}

// Navigator.modelContext 的全局声明现由 @mcp-b/webmcp-types
// （@mcp-b/webmcp-polyfill 的传递依赖）提供，避免与第三方声明的可选性修饰符冲突。
// SDK 内部使用 navigator.modelContext 时统一通过 `as any` 转换，
// 不直接依赖该全局声明的字段类型。
