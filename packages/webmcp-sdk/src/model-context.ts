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
  /**
   * Chromium 扩展，非规范面，使用前必须特征检测。
   *
   * 第二参形态按宿主代际分档：原生 Chrome 155+ 只收**对象**，Chrome 149–154 与
   * polyfill 5.1.0 只收 **JSON 字符串**。故声明为联合类型，实际形态由 registry 的
   * 归一层按宿主决定 —— 调用方两种都可以传，但不要假设宿主只吃某一种。
   */
  executeTool?(
    tool: RegisteredTool,
    inputArgs: object | string,
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
  /**
   * 以下四个标记按**方法**分别打，粒度必须与跳过理由对齐：
   * 函数级的粗粒度守卫会让「合成版 executeTool 已归一」这种只关一轴的理由，
   * 顺带关掉另一轴（详见 spec §5.5）。`__webmcpNexusSynthesized` 只服务 isModernHost，
   * 不参与归一层决策。
   */
  /** nexus 合成了 executeTool；合成版内部已归一入参，轴一跳过 */
  __webmcpNexusExecuteToolSynthesized?: boolean;
  /** nexus 合成了 getTools；合成版已 coerce schema、形态信号不可信，轴二跳过 */
  __webmcpNexusGetToolsSynthesized?: boolean;
  /** 轴一已包装。modelContextPatched 会被 clearRegistry() 与 Vite HMR 复位，缺它会重复包装 */
  __webmcpNexusExecuteToolWrapped?: boolean;
  /** 轴二已包装，同上 */
  __webmcpNexusGetToolsWrapped?: boolean;
  /** 宿主级形态传感器的**确定值**；只由 same-document 命中写入，不用模块级变量（跨用例会泄漏） */
  __webmcpNexusInputShape?: ExecuteToolInputShape;
  /** 在途探测，避免并发首调重复探测；得出非确定结论时 resolve 后需清掉 */
  __webmcpNexusInputShapeProbe?: Promise<InputShapeProbeResult>;
  /** 形态判定退化已告警过（每宿主至多一条面包屑，避免 relay 轮询刷屏） */
  __webmcpNexusShapeWarned?: boolean;
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
 * nexus 据此决定 patch 范围：现代宿主不碰 EventTarget / registerTool / listTools /
 * callTool（协议规定派发责任在宿主），但**会**装 getTools / executeTool 的双轴形态归一
 * 包装 —— 用不可枚举 own property，故 polyfill 刻意维持的 "Chrome's ModelContext
 * instance has no own **enumerable** keys" 不变量仍成立；旧宿主才补齐 EventTarget、
 * 合成 listTools/callTool、包装 registerTool 以桥接事件。
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
 * - object：polyfill 5.x 自持 context、Chrome 155+ 的 same-document 工具
 * - string：Chrome 149–154 的 same-document 工具返回序列化字符串（上游 `webmcp-types`
 *   明文记了这条滚动发布边界，并要求消费方 branch on `typeof`）；modelContextTesting 面也是字符串
 * - 缺键 / 空串：polyfill 5.x 在 schema 的自定义 toJSON 序列化成非对象时会完全省略该键
 *
 * 解析失败时返回 null（调用方应丢弃该工具）而非降级为空 schema，与 relay 5.x 的
 * `mapRegisteredTool` 语义对齐：把一个 schema 损坏的工具降级成"零参数可调用工具"
 * 暴露给 Agent 比丢弃它更危险。
 *
 * `silent` 供**不丢弃**该工具的调用方使用（如 registry 的轴二归一：它原样透传、把丢弃权
 * 交给 relay），此时默认那条 "was skipped" 文案是假的，由调用方自己出准确告警。
 */
export function coerceInputSchema(raw: unknown, toolName: string, silent = false): object | null {
  if (typeof raw === 'string') {
    if (raw.length === 0) return DEFAULT_INPUT_SCHEMA;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        if (!silent) warnMalformedSchema(toolName);
        return null;
      }
      return parsed as object;
    } catch {
      if (!silent) warnMalformedSchema(toolName);
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
 * 宿主 `executeTool` 第二参期望的形态。
 *
 * Chrome 155 把原生 `executeTool` 的入参从「JSON 字符串」改成了「对象」，而 Chrome
 * 149–154 原生与 polyfill 5.1.0 仍只收字符串。relay 6.x 一律传对象，因此 nexus 必须
 * 按宿主实际期望归一，否则 string-era 宿主上全量工具执行失败。
 *
 * 形态是**宿主级**属性（不是逐工具属性），判定见 registry 的 resolveInputShape。
 */
export type ExecuteToolInputShape = 'object' | 'string';

/**
 * 形态探测的结果。
 *
 * `definitive` 为假表示结论来自全量兜底 / 空样本 / `getTools()` 失败，**不得写入传感器**：
 * 传感器在文档生命周期内是 write-once 的（命中即直接返回），写入错误结论会导致此后全量
 * 调用失败且刷新前不自愈。
 */
export interface InputShapeProbeResult {
  shape: ExecuteToolInputShape;
  definitive: boolean;
}

/**
 * 归一为 JSON 字符串形态（原生 Chrome 149–154、polyfill 5.1.0、modelContextTesting 面）。
 *
 * 空串按「无参」处理而非原样返回：polyfill 5.1.0 的 parseChromeToolInput 是硬
 * `JSON.parse(input)`，`''` 会抛 SyntaxError，而空串本就是合法的无参表达。
 *
 * 校验与 toArgsObject **对称**：数组、标量、函数一律拒绝。polyfill 的 parseChromeToolInput
 * 明文接受数组（`Array.isArray(value) || isPlainObject(value)`），若在这里放行，工具体会收到
 * 一个数组、解构出的命名参数全是 undefined，破坏性工具就在缺参状态下真的执行一遍 ——
 * 正是 toArgsObject 抛错所要防的同一件事。
 */
export function toArgsJson(input: unknown): string {
  if (typeof input === 'string') return input.length === 0 ? '{}' : input;
  if (input === undefined || input === null) return '{}';
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('executeTool input must be an object');
  }
  return JSON.stringify(input);
}

/**
 * 归一为对象形态（原生 Chrome 155+）。
 *
 * 非空字符串必须解析成 JSON 对象，否则抛错：静默降级成空参数会让工具在缺参状态下
 * 真的执行一遍，比直接失败危险得多。与 coerceInputSchema 对畸形 schema 返回 null
 * 让调用方丢弃工具，是同一个价值判断。
 */
export function toArgsObject(input: unknown): object {
  if (input === undefined || input === null) return {};
  if (typeof input === 'string') {
    if (input.length === 0) return {};
    const parsed: unknown = JSON.parse(input);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('executeTool input must be a JSON object');
    }
    return parsed as object;
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('executeTool input must be an object');
  }
  return input as object;
}

/** 按宿主期望的形态归一 executeTool 入参 */
export function coerceExecuteToolInput(
  input: unknown,
  shape: ExecuteToolInputShape,
): object | string {
  return shape === 'string' ? toArgsJson(input) : toArgsObject(input);
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
