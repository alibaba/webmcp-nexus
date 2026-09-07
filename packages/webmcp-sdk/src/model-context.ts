// packages/webmcp-sdk/src/model-context.ts
//
// SDK 唯一的宿主访问入口。
//
// WebMCP 草案（2026-05-27，webmachinelearning/webmcp#173 / #184）把 modelContext getter
// 从 Navigator 移到 Document：`document.modelContext` 是规范入口，`navigator.modelContext`
// 是已废弃别名（polyfill 5.x 与 Chrome 150+ 访问它都会打一次性 deprecation warning）。
// 因此本模块一律 document 优先、navigator 兜底，SDK 内部不主动访问已废弃别名。
import type {
  ModelContext,
  ModelContextTesting,
  RegisteredTool,
  WebMcpToolAnnotations,
} from '@mcp-b/webmcp-types';

/**
 * 宿主上下文可能同时具备四种面，按来源分层：
 *
 * 1. 规范面（`ModelContext`）：`registerTool` / `getTools` / `ontoolchange` + EventTarget
 * 2. Chromium 扩展面：`executeTool`（不属于规范，必须特征检测）
 * 3. MCP-B 扩展面：`listTools`（旧宿主 / relay 2.x 使用）
 * 4. nexus 合成面：`callTool`（宿主**不提供**，仅旧宿主档由 patchModelContextEventSupport
 *    从 modelContextTesting 合成挂上，供 relay 2.x 的 getExtendedModelContext 特征检测）
 *
 * `registerTool` 被显式 Omit 后重声明为宽松签名：上游 `ModelContext.registerTool` 的三个
 * 重载带 `JsonSchemaForInference` 字面量推导泛型，无法接受 nexus 运行时构造的动态描述符。
 */
export type WebMcpHostContext = Omit<ModelContext, 'registerTool'> & {
  /** polyfill 5.x 返回 `Promise<void>`；Chrome 146/147 原生同步返回 undefined */
  registerTool(tool: object, options?: { signal?: AbortSignal }): unknown;
  /** Chromium 扩展，非规范面，使用前必须特征检测 */
  executeTool?(
    tool: RegisteredTool,
    inputArgsJson: string,
    options?: { signal?: AbortSignal },
  ): Promise<string | null>;
  /** MCP-B 扩展面。旧宿主原生提供，或由 nexus 从 modelContextTesting 合成（后者已转为对象形态） */
  listTools?(): Array<{ name: string; description?: string; inputSchema?: object | string }>;
  /** nexus 合成面，宿主不提供 */
  callTool?(params: { name: string; arguments?: Record<string, unknown> }): Promise<unknown>;
  /** 遗留注销面：Chrome 146/147 原生 + polyfill 2.x；polyfill 5.x 与 Chrome 148+ 已移除 */
  unregisterTool?(name: string): void;
  /** polyfill 自持 context 的标记（非枚举 own property，polyfill 官方提供的判别方式） */
  __isWebMCPPolyfill?: boolean;
  /** nexus 的 toolchange 合并器已安装标记 */
  __toolchangeCoalesced?: boolean;
  /** nexus 在旧宿主档合成了 getTools/executeTool 的标记；isModernHost 据此避免误判 */
  __webmcpNexusSynthesized?: boolean;
};

/** 推送给第三方 widget iframe 的工具描述符（不含 window/origin，因此不可用于 executeTool） */
export interface WidgetToolDescriptor {
  name: string;
  /** 上游推荐读法 `tool.title || tool.name`：规范默认值是空串，`??` 不会穿透 */
  title: string;
  description: string;
  inputSchema: object;
  annotations?: WebMcpToolAnnotations;
}

/**
 * WebMCP §4.2 的工具名约束。与 polyfill 5.x 的 `VALID_TOOL_NAME_RE` 一致。
 * 本地复制而非 import 上游内部符号，避免依赖 `exports` 子路径（webpack 4 不认）。
 */
const VALID_TOOL_NAME_RE = /^[A-Za-z0-9_.-]{1,128}$/u;

const DEFAULT_INPUT_SCHEMA: object = { type: 'object', properties: {} };

/** 校验工具名是否符合 WebMCP 规范 */
export function isValidToolName(name: string): boolean {
  return typeof name === 'string' && VALID_TOOL_NAME_RE.test(name);
}

/**
 * 解析宿主上下文：document 优先，navigator 兜底。
 *
 * - document 优先既符合规范，也避免触发 polyfill 的一次性 deprecation warning
 * - navigator 兜底覆盖 Chrome 146–149 原生（那一档只有 navigator 面，
 *   且 polyfill 的入口桥接需要 `initializeWebMCPPolyfill()` 先跑过才会补上 document 面）
 */
export function getModelContext(): WebMcpHostContext | undefined {
  try {
    if (typeof document !== 'undefined' && 'modelContext' in document) {
      const fromDocument = document.modelContext;
      if (fromDocument) return fromDocument as WebMcpHostContext;
    }
  } catch {
    // 某些宿主的 document.modelContext getter 会抛错（如跨域 WindowProxy），落到兜底
  }
  try {
    if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
      const fromNavigator = navigator.modelContext;
      if (fromNavigator) return fromNavigator as WebMcpHostContext;
    }
  } catch {
    // 同上
  }
  return undefined;
}

/** 宿主上下文是否可用（SSR / 无 WebMCP 环境下为 false） */
export function isModelContextAvailable(): boolean {
  return getModelContext() !== undefined;
}

/**
 * 读取已废弃的 Chromium testing 面。
 *
 * polyfill 5.x 在 `installTestingShim: true` 且自持 context 时把它装在 navigator 上；
 * Chrome 146–149 原生也提供。原生 Chrome 150+ 若已移除该属性则返回 undefined，
 * 调用方必须把它当作**不可靠兜底**而非稳定数据源。
 */
export function getModelContextTesting(): ModelContextTesting | undefined {
  try {
    if (typeof navigator !== 'undefined' && navigator.modelContextTesting) {
      return navigator.modelContextTesting;
    }
    if (typeof document !== 'undefined') {
      const onDocument = (document as unknown as { modelContextTesting?: ModelContextTesting })
        .modelContextTesting;
      if (onDocument) return onDocument;
    }
  } catch {
    // 忽略宿主访问异常
  }
  return undefined;
}

/**
 * 现代宿主判据。
 *
 * `getTools()` 属于规范面，具备它即意味着宿主实现了当前草案的完整生命周期：
 * 自带 EventTarget、自派发 `toolchange`、`registerTool` 返回 Promise、靠 AbortSignal 注销。
 * polyfill 5.x 与 Chrome 149+ 满足；Chrome 146–148 原生不满足（旧宿主档）。
 *
 * nexus 据此决定是否 patch 宿主：现代宿主零 patch（协议规定派发责任在宿主，且 polyfill
 * 刻意维持 "Chrome's ModelContext instance has no own keys" 的 WebIDL 保真不变量）；
 * 旧宿主才补齐 EventTarget、合成 listTools/callTool、包装 registerTool 以桥接事件。
 *
 * 注意合成标记：旧宿主档 nexus 会从 modelContextTesting 合成 getTools（见 registry.ts
 * synthesizeDescriptorApiIfMissing），合成后若不排除，本判据会把旧宿主误判为现代宿主，
 * 导致 notifyToolsChanged 停止手动派发（旧宿主原生不自派发）→ toolchange 断流。
 */
export function isModernHost(mc: WebMcpHostContext): boolean {
  return typeof mc.getTools === 'function' && mc.__webmcpNexusSynthesized !== true;
}

/**
 * 归一 `inputSchema` 的三种形态，解析失败返回 null。
 *
 * - object：polyfill 5.x 自持 context、Chrome 154+ 的 cross-document 工具、
 *   以及 nexus 自己合成的 listTools 面
 * - string：Chrome 149 起 same-document 工具仍返回序列化字符串（webmcp#241 的对象化
 *   自 154.0.8013 起 cross-document 先行滚动发布，边界还在上移），nexus 注册的全是
 *   same-document 工具，所以这一形态是常态而非例外；modelContextTesting 面也是字符串
 * - 缺键 / 空串：polyfill 5.x 在 schema 的自定义 toJSON 序列化成非对象时会完全省略该键
 *
 * 解析失败时返回 null（调用方应丢弃该工具）而非降级为空 schema，与 relay 5.x 的
 * `mapRegisteredTool` 语义对齐：把一个 schema 损坏的工具降级成"零参数可调用工具"
 * 暴露给 Agent 比丢弃它更危险。
 */
export function coerceInputSchema(raw: unknown, toolName: string): object | null {
  if (typeof raw === 'string') {
    if (raw.length === 0) return DEFAULT_INPUT_SCHEMA;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        warnMalformedSchema(toolName);
        return null;
      }
      return parsed as object;
    } catch {
      warnMalformedSchema(toolName);
      return null;
    }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as object;
  }
  return DEFAULT_INPUT_SCHEMA;
}

function warnMalformedSchema(toolName: string): void {
  console.warn(`[webmcp] Tool "${toolName}" was skipped because its input schema is malformed.`);
}

/**
 * 把宿主返回的 RegisteredTool 归一为 widget 载荷条目。
 * `inputSchema` 的三形态处理见 coerceInputSchema。
 */
export function toWidgetToolDescriptor(tool: RegisteredTool): WidgetToolDescriptor | null {
  const inputSchema = coerceInputSchema(tool.inputSchema, tool.name);
  if (!inputSchema) return null;

  return {
    name: tool.name,
    title: tool.title || tool.name,
    description: tool.description ?? '',
    inputSchema,
    ...(tool.annotations ? { annotations: tool.annotations } : {}),
  };
}
