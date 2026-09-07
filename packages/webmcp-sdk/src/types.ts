// packages/webmcp-sdk/src/types.ts

/**
 * 宿主传给工具 `execute` 的第二个参数。
 *
 * Chrome 官方 imperative API 规定："The execute function receives an AbortSignal parameter
 * named `signal` as its second argument to gracefully handle execution cancellations
 * initiated by the user or agent." 长时间运行的工具应把它透传给 `fetch()` 等可取消操作。
 *
 * 已知差异：`@mcp-b/webmcp-polyfill@5.1.0` 内部是 `tool.execute(args)` 单参调用，
 * **不转发**该信号（`executeTool` 的 `options.signal` 只用于 race 外层 promise），
 * 所以 polyfill 环境下工具拿到的 `options` 是 `undefined`；该能力仅原生 Chrome 提供。
 * SDK 仍无条件透传，属零成本的向前兼容。
 */
export interface WebMcpToolExecuteOptions {
  signal?: AbortSignal;
}

/** 工具 schema 元数据（由构建插件在构建时注入到函数的 __webmcpSchema 属性） */
export interface WebMcpToolSchema {
  /** 工具描述（来自 JSDoc 描述） */
  description: string;
  /** 输入参数的 JSON Schema（来自 TypeScript 类型推导） */
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  /** 是否为只读工具（来自 @readonly JSDoc 标签）→ annotations.readOnlyHint */
  readOnly?: boolean;
  /** 人类可读的短标题（来自 @title JSDoc 标签）→ RegisteredTool.title */
  title?: string;
  /**
   * 输出是否含不可信内容（来自 @untrusted JSDoc 标签）→ annotations.untrustedContentHint。
   * 用于提示 Agent 对返回值做净化 / 分隔，缓解间接提示注入。
   */
  untrustedContent?: boolean;
  /**
   * 执行是否产生重大且不可逆的后果（来自 @consequential JSDoc 标签）
   * → annotations.consequentialHint，让 Agent 与浏览器在执行前强制用户确认。
   *
   * 已知差异：该 hint 是 Chrome 153+ 的原生 annotation，`@mcp-b/webmcp-types@5.1.0`
   * 尚未收录、polyfill 5.1.0 的 `coerceWebMcpToolDescriptor` 会丢弃它，
   * 因此仅在原生 Chrome 153+ 生效。透传是安全的向前兼容。
   */
  consequential?: boolean;
}

/**
 * 带有 __webmcpSchema 属性的函数类型。
 * 构建插件在构建时会将 schema 注入到函数的 __webmcpSchema 属性上。
 *
 * 第二个参数 `options` 为可选：现有的单参工具函数无需任何改动即可赋值给该签名
 * （TS 允许参数更少的函数赋值给参数更多的签名）。
 */
export type WebMcpToolFn<TParams = unknown, TResult = unknown> = {
  (params: TParams, options?: WebMcpToolExecuteOptions): Promise<TResult>;
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

/** WebMCP 工具注解。三个 hint 均为官方协议字段，宿主不支持时会被静默忽略 */
export interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
}

/** 传递给 document.modelContext.registerTool 的工具配置 */
export interface WebMcpToolConfig {
  name: string;
  /** 人类可读短标题。缺省时 SDK 回落为工具名，避免 MCP 客户端标题栏空白 */
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>, options?: WebMcpToolExecuteOptions) => Promise<unknown>;
  annotations?: WebMcpToolAnnotations;
}

// Document.modelContext / Navigator.modelContext / SubmitEvent.agentInvoked 的全局声明
// 由 @mcp-b/webmcp-types（@mcp-b/webmcp-polyfill 的依赖，5.1.0 起也是本包的直接依赖）提供。
//
// 历史背景（保留以免重蹈覆辙）：2.x 时代该增强把 Navigator.modelContext 声明为**非可选**，
// 与第三方声明的可选性修饰符冲突，所以 SDK 一度只靠 `as any` 访问、不直接依赖它。
// 5.1.0 已把全部增强改为裸可选（`Document.modelContext?`、`Navigator.modelContext?`、
// `SubmitEvent.agentInvoked?`），冲突消除，因此 SDK 现在通过 model-context.ts 的
// `WebMcpHostContext` 直接复用上游权威类型，不再手写近似接口。
