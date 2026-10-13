// packages/webmcp-sdk/src/registry.ts
import type { WebMcpToolConfig, WebMcpToolAnnotations, WebMcpToolSchema } from './types';
import {
  coerceExecuteToolInput,
  coerceInputSchema,
  getModelContext,
  getModelContextTesting,
  isModernHost,
  isValidToolName,
  toArgsJson,
  type ExecuteToolInputShape,
  type InputShapeProbeResult,
  type WebMcpHostContext,
  type WidgetToolDescriptor,
} from './model-context';

let modelContextPatched = false;

/** 宿主原生注册状态。'pending' 期间仍视为可用，避免异步 registerTool 尚未 resolve 时列表闪烁 */
export type NativeToolState = 'pending' | 'registered' | 'failed';

/**
 * 严格判断值是否为合法的 MCP CallToolResult。
 * 检查 content 数组存在且首元素含合法 type 字段，防止业务对象误判。
 *
 * 仅用于旧宿主档 nexus 合成的 `callTool`（relay 2.x 路径）。现代宿主下工具返回值由
 * relay 5.x 走 polyfill 的 `normalizeToolResponse` 归一，会额外补 `structuredContent`，
 * 与本函数的产物存在已知差异。
 */
export function isCallToolResult(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.content)) return false;
  if (obj.content.length === 0) return true;
  const first = obj.content[0];
  return (
    first !== null &&
    typeof first === 'object' &&
    'type' in first &&
    ((first as Record<string, unknown>).type === 'text' ||
      (first as Record<string, unknown>).type === 'image' ||
      (first as Record<string, unknown>).type === 'resource')
  );
}

/**
 * 将工具原始返回值规范化为 MCP CallToolResult 格式。
 * 若已是合法 CallToolResult 则直接返回，否则将完整内容包装为 text content。
 * 注意：不对结果做任何截断，完整保留工具返回的全部数据。
 */
export function normalizeToCallToolResult(value: unknown): Record<string, unknown> {
  if (isCallToolResult(value)) {
    return value as Record<string, unknown>;
  }
  let text: string;
  if (typeof value === 'string') {
    text = value;
  } else {
    try {
      const serialized = JSON.stringify(value);
      text = serialized === undefined ? String(value) : serialized;
    } catch {
      text = String(value);
    }
  }
  return {
    content: [{ type: 'text', text }],
    isError: false,
  };
}

/**
 * 以非枚举 own property 的形式写入宿主对象。
 *
 * polyfill 5.x 刻意维持 "Chrome's ModelContext instance has no own keys" 的 WebIDL 保真
 * 不变量（为此用 ECMAScript #private 而非 TypeScript private，并把 __isWebMCPPolyfill
 * 设为非枚举）。直接赋值会产生 own **enumerable** 属性，破坏 Object.keys / for..in /
 * spread 的行为一致性，故 nexus 对宿主对象的**所有**写入统一走本函数。
 *
 * 已知偏差：polyfill 把原型上的 registerTool/getTools/executeTool/ontoolchange 设为
 * enumerable，own 非枚举属性会遮蔽 inherited 枚举属性，于是 for...in 不再产出被包装的
 * 那两个方法（Object.keys / spread / instanceof 不受影响，全仓零处 for-in 遍历 ModelContext）。
 */
function defineHiddenProperty(target: object, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    value,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

/**
 * 在 dispatchEvent 层面合并 toolchange 事件。
 * 无论来源（SDK 包装器、polyfill 内部、第三方代码），同一微任务内只触发 1 次。
 *
 * 仅旧宿主档安装：旧宿主自己不在规范入口派发 toolchange，需要 nexus 包装 registerTool
 * 后手动派发，合并器用于压制同一 tick 内的重复。现代宿主自派发，nexus 不再派发（见
 * notifyToolsChanged），故不需要合并器。
 */
function patchDispatchEventForCoalescing(mcToPatch: WebMcpHostContext): void {
  if (mcToPatch.__toolchangeCoalesced) return;
  const originalDispatch: (event: Event) => boolean = mcToPatch.dispatchEvent.bind(mcToPatch);
  let pending = false;
  defineHiddenProperty(mcToPatch, 'dispatchEvent', (event: Event): boolean => {
    if (event.type === 'toolchange') {
      if (!pending) {
        pending = true;
        queueMicrotask(() => {
          originalDispatch(new Event('toolchange'));
          pending = false;
        });
      }
      return true;
    }
    return originalDispatch(event);
  });
  defineHiddenProperty(mcToPatch, '__toolchangeCoalesced', true);
}

/** 当前页 origin，供合成版 getTools 补齐 RegisteredTool 的 origin 键 */
function currentOrigin(): string {
  try {
    return typeof location !== 'undefined' ? location.origin : '';
  } catch {
    return '';
  }
}

/**
 * 若宿主缺 `executeTool`（relay 5.x 的 hasDescriptorToolApi 只认它）且存在
 * modelContextTesting，则从 testing 面合成规范面的 executeTool（按名 → 按对象形态转换）。
 * 现代宿主档与旧宿主档共用；两者皆无时抛 NotSupportedError 而非静默返回。
 *
 * 合成版**内部就把入参归一为字符串**（testing 面只吃字符串），因此打
 * `__webmcpNexusExecuteToolSynthesized` 让轴一的包装跳过它，不再包第二层。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function synthesizeExecuteToolIfMissing(mcToPatch: any): void {
  if (typeof mcToPatch.executeTool === 'function') return;
  defineHiddenProperty(
    mcToPatch,
    'executeTool',
    async (tool: { name?: string } | undefined, inputArgs: unknown) => {
      const testing = getModelContextTesting();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testingAny = testing as any;
      if (!testingAny || typeof testingAny.executeTool !== 'function') {
        throw new DOMException('No executable WebMCP runtime on this host', 'NotSupportedError');
      }
      // testing 面是「按名 + JSON 字符串」调用，规范面是「按对象 + 对象或字符串」调用。
      // relay 6.x 传对象，故此处必须归一，否则对象会被原样透传给只吃字符串的 testing 面。
      return testingAny.executeTool(tool?.name, toArgsJson(inputArgs));
    },
  );
  defineHiddenProperty(mcToPatch, '__webmcpNexusExecuteToolSynthesized', true);
}

/**
 * 旧宿主档（Chrome 146–148 原生）合成规范面的 getTools + executeTool，使 relay 5.x
 * 在该档也能发现/调用工具。relay 5.x 只读 document.modelContext 且只认 executeTool，
 * 而 146–148 原生两者皆无（只有 modelContextTesting.listTools/executeTool）。
 *
 * 合成版 getTools 返回对象带 window/origin 四键，使 relay 把该对象原样回传
 * executeTool 时形态合法；合成版 executeTool 只取 tool.name（它本就转发到本页 testing 面）。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function synthesizeDescriptorApiIfMissing(mcToPatch: any): void {
  // 标记必须先打：isModernHost 以 getTools 为判据，合成后若不打标会把旧宿主误判为
  // 现代宿主，导致 notifyToolsChanged 停止手动派发（旧宿主原生不自派发）→ toolchange 断流。
  defineHiddenProperty(mcToPatch, '__webmcpNexusSynthesized', true);

  if (typeof mcToPatch.getTools !== 'function') {
    defineHiddenProperty(mcToPatch, 'getTools', async () => {
      const testing = getModelContextTesting();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testingAny = testing as any;
      if (!testingAny || typeof testingAny.listTools !== 'function') return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return testingAny.listTools().map((t: any) => ({
        name: t.name,
        title: t.name, // relay 会转发 title；缺省回落工具名
        description: t.description ?? '',
        inputSchema: coerceInputSchema(t.inputSchema, t.name) ?? { type: 'object', properties: {} },
        window: typeof window !== 'undefined' ? window : undefined,
        origin: currentOrigin(),
      }));
    });
    // 合成版已用 coerceInputSchema 把字符串 schema 转成对象，raw 形态信号在此被销毁，
    // 轴二再读它只会得到「对象代际」的错误结论 —— 打标让轴二跳过（见 ensureHostShapeCompat）。
    defineHiddenProperty(mcToPatch, '__webmcpNexusGetToolsSynthesized', true);
  }
  synthesizeExecuteToolIfMissing(mcToPatch);
}

/**
 * 扫描 raw 工具列表，观测宿主代际。
 *
 * `onlySameDocument` 为真时只认 `tool.window === globalThis.window` 的工具 —— Chrome 154
 * 的 cross-document 工具已先行对象化，混进来会把 string-era 宿主误判成 object-era。
 * 该模式得出的是**确定结论**，可缓存。
 *
 * 为假时扫全量，是「本页还没有自己的工具」时的兜底，得出的是**非确定结论**，
 * 调用方不得缓存（见 resolveInputShape 的缓存窗口说明）。
 *
 * 无可用样本时返回 undefined。
 */
function scanInputShape(
  tools: unknown,
  onlySameDocument: boolean,
): ExecuteToolInputShape | undefined {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;
  let sampled = false;
  let sawStringSchema = false;
  for (const entry of tools) {
    const tool = entry as { window?: unknown; inputSchema?: unknown } | null | undefined;
    if (!tool) continue;
    if (onlySameDocument && tool.window !== globalThis.window) continue;
    // 无 inputSchema 的工具**提供不了代际证据**，不得计入投票。上游 IDL 是
    // `object inputSchema;` —— 既非 required 也无默认值，按 WebIDL dictionary 语义整键省略。
    // 若把它算作样本，「本页只有无 schema 工具」会被误判成 object-era 并写进 write-once
    // 的传感器，此后在 string-era 宿主上全量调用失败且刷新前不自愈。
    if (tool.inputSchema === undefined) continue;
    sampled = true;
    if (typeof tool.inputSchema === 'string') sawStringSchema = true;
  }
  if (!sampled) return undefined;
  return sawStringSchema ? 'string' : 'object';
}

/**
 * 写入宿主级形态传感器。
 *
 * 必须走 defineHiddenProperty：直接赋值会创建**可枚举** own property，破坏 polyfill 刻意
 * 维持的「ModelContext 实例无 own enumerable keys」WebIDL 保真不变量。
 * 缓存放宿主对象而非模块级变量 —— clearRegistry() 会重置 modelContextPatched 但不会重置
 * 模块级缓存，跨测试用例会泄漏；假宿主每次都是新对象，天然隔离。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setHostInputShape(mc: any, shape: ExecuteToolInputShape): void {
  defineHiddenProperty(mc, '__webmcpNexusInputShape', shape);
}

/**
 * 形态判定退化时留一条面包屑（每个宿主至多一次）。
 *
 * 落 'object' 这个取向本身可辩护：它偏向当前主流档，且在 string-era 宿主上会表现为宿主侧
 * 显式解析失败，不是静默错误执行。但**零诊断**不行 —— 触发原因恰恰是 Permissions Policy
 * 拒绝（跨域 iframe 没配 allow="tools"）或页面正在导航，用户只会看到宿主侧一条费解的
 * parse 错误，控制台没有任何线索指向真因。同文件的 handleRegistrationFailure 对注册失败
 * 按 error.name 分流成五种带修复指引的 warn，判定退化不该一声不响。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function warnShapeFallbackOnce(mc: any, reason: string): void {
  if (mc.__webmcpNexusShapeWarned === true) return;
  defineHiddenProperty(mc, '__webmcpNexusShapeWarned', true);
  console.warn(
    `[webmcp] Could not determine the host's executeTool input shape (${reason}); assuming object input. ` +
      'If tools fail to execute on Chrome 149-154, please report this.',
  );
}

/**
 * 判定宿主 `executeTool` 期望的入参形态。
 *
 * 必须确定性判定，**禁止「先按对象调、失败再按字符串重试」**：无法区分「形态错」和
 * 「工具体自己抛的 TypeError」，误判会让有副作用的工具执行两遍。同理不用临时探针工具
 * —— relay 在轮询 getTools()，探针会泄漏进它读到的列表。
 *
 * `originalGetTools` 必须是**包装前**的原函数（由 ensureHostShapeCompat 用闭包捕获）。
 * 轴二会把 getTools 换成永远返回 object schema 的版本，读包装版会永久误判成 object-era。
 */
async function resolveInputShape(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mc: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalGetTools: ((...args: any[]) => unknown) | undefined,
): Promise<ExecuteToolInputShape> {
  // polyfill 短路必须**先于**传感器：polyfill 5.1.0 的 getTools() 返回对象 schema，
  // 但它的 executeTool 只吃字符串（parseChromeToolInput 是硬 JSON.parse），
  // 轴二观测到的形态在这一档是无效信号。
  //
  // ⚠️ 版本前提：此短路绑定 polyfill **5.x**。polyfill 6.0.0 已改为对象入参
  // （isObject 校验 + 内部 serializeJSON），若将来升级必须同步改这里，否则变成静默错误源。
  if (mc.__isWebMCPPolyfill === true) return 'string';

  const cached = mc.__webmcpNexusInputShape as ExecuteToolInputShape | undefined;
  if (cached) return cached;

  if (typeof originalGetTools !== 'function') {
    warnShapeFallbackOnce(mc, 'host exposes no usable getTools()');
    return 'object';
  }

  // 并发首调只探测一次
  const inflight = mc.__webmcpNexusInputShapeProbe as Promise<InputShapeProbeResult> | undefined;
  if (inflight) return (await inflight).shape;

  const probe = (async () => {
    let tools: unknown;
    try {
      tools = await originalGetTools.call(mc);
    } catch (error) {
      // 宿主 getTools 可能因 document 非 fully active（InvalidStateError）或 Permissions
      // Policy 拒绝（NotAllowedError）而抛错。落 'object' 但不缓存，下次调用重探。
      warnShapeFallbackOnce(mc, `getTools() failed: ${describeError(error)}`);
      return { shape: 'object' as ExecuteToolInputShape, definitive: false };
    }
    const definitive = scanInputShape(tools, true);
    if (definitive) return { shape: definitive, definitive: true };
    // 缓存窗口：本页可能还没有自己的工具，此时全量里全是 cross-document 的对象 schema。
    // 若把兜底结论缓存下来，此后注册的 same-document 工具会全量报 TypeError 且不自愈 ——
    // 这是「判错比不判更糟」的唯一路径，故兜底结论只用于本次调用。
    const fallback = scanInputShape(tools, false);
    if (!fallback) {
      warnShapeFallbackOnce(mc, 'no same-document tool with an inputSchema to sample');
    }
    return { shape: fallback ?? ('object' as ExecuteToolInputShape), definitive: false };
  })();

  defineHiddenProperty(mc, '__webmcpNexusInputShapeProbe', probe);
  try {
    const { shape, definitive } = await probe;
    if (definitive) setHostInputShape(mc, shape);
    return shape;
  } finally {
    defineHiddenProperty(mc, '__webmcpNexusInputShapeProbe', undefined);
  }
}

/**
 * 轴二：把 `getTools()` 返回的字符串 `inputSchema` 逐工具转成对象。
 *
 * relay 6.x 的发现阶段有 schema 守卫（`inputSchema !== undefined && !isJsonObject(inputSchema)`
 * → warn "input schema is malformed" 并**丢弃整个工具**），而 relay 5.x 是 `JSON.parse` 后使用。
 * 原生 Chrome 149–154 的 same-document 工具返回序列化字符串，因此在 relay 6.x 下会**零工具**，
 * 比执行失败更隐蔽。上游 webmcp-types 明文要求消费方 "branch on `typeof`"，故逐工具条件转换
 * 而非按宿主代际整体转换 —— 后者需要形态探测，会把自指陷阱引进来。
 *
 * 逐工具转换的额外好处：拷贝只发生在真有字符串 schema 的工具上（即只有原生 149–154 一档），
 * polyfill / 155+ / 146–148 三档原引用透传，是严格 no-op。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapGetToolsForSchemaShape(mc: any): void {
  if (typeof mc.getTools !== 'function') return;
  // 合成版已 coerceInputSchema，raw 形态信号被销毁，再包一层只会读到「对象代际」的错误结论
  if (mc.__webmcpNexusGetToolsSynthesized === true) return;
  // modelContextPatched 会被 clearRegistry() 与 Vite HMR 复位，而宿主上的包装不会消失；
  // 缺这条守卫会重复包装，第二层闭包里的「原函数」其实是第一层的包装版
  if (mc.__webmcpNexusGetToolsWrapped === true) return;

  const original = mc.getTools;
  // 闭包内去重（不是模块级）：relay 每 2 秒轮询一次 getTools()，一个畸形 schema 就能持续刷屏。
  // 闭包作用域还避免跨测试用例污染，且每次重新 patch 会自然重置。
  const malformedWarned = new Set<string>();
  defineHiddenProperty(mc, '__webmcpNexusGetToolsWrapped', true);
  defineHiddenProperty(
    mc,
    'getTools',
    // rest args 转发 options：上游签名是 getTools(options?: { fromOrigins?: string[] })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (...args: any[]) => {
      const raw = await original.apply(mc, args);
      if (!Array.isArray(raw)) return raw;

      let changed = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = raw.map((tool: any) => {
        if (typeof tool?.inputSchema !== 'string') return tool;
        // silent：coerceInputSchema 默认那条 "was skipped" 文案在这里是**假的** ——
        // 轴二不丢弃工具，丢弃权归 relay（relay 5.x 与 6.x 都会自己 warn）
        const coerced = coerceInputSchema(tool.inputSchema, tool.name, true);
        // 解析失败：保留原字符串透传，让 relay warn + drop。nexus 不抢答（会掩盖真实原因），
        // 也不降级成「零参数可调用工具」（那会让工具在缺参状态下有害地执行）
        if (!coerced) {
          if (!malformedWarned.has(tool.name)) {
            malformedWarned.add(tool.name);
            console.warn(
              `[webmcp] Tool "${tool.name}" has a malformed input schema; passing it through unchanged and leaving the drop decision to the consumer.`,
            );
          }
          return tool;
        }
        changed = true;
        // 必须保留全部 own 键：relay 的执行路径不复用它自己映射出的对象，而是重新 getTools()
        // 再按名 find()，所以这里返回的对象会被**原样喂回 executeTool**。polyfill 对
        // name/description/window/origin 四键既做存在性检查又做 window/origin 值比较，
        // 缺一即抛。不得照抄 relay 自己的部分拷贝形状（它丢掉 window/origin）
        return { ...tool, inputSchema: coerced };
      });

      // 顺带喂传感器：逐工具扫描天然看到 raw 形态，省掉轴一的一次冷启动探测。
      // polyfill 档不写 —— 该档 schema 是对象但 executeTool 只吃字符串，信号无效。
      if (mc.__isWebMCPPolyfill !== true && mc.__webmcpNexusInputShape === undefined) {
        const observed = scanInputShape(raw, true);
        if (observed) setHostInputShape(mc, observed);
      }

      // 整批无字符串 schema → 返回原数组引用，不产生拷贝
      return changed ? mapped : raw;
    },
  );
}

/**
 * 轴一：把 `executeTool` 的第二参归一到宿主实际期望的形态。
 *
 * Chrome 155 起原生只收**对象**（传字符串抛
 * `TypeError: … invalid input object: value is not an object`），Chrome 149–154 与
 * polyfill 5.1.0 只收 **JSON 字符串**。relay 6.x 一律传对象、5.x 一律传字符串，
 * 归一后两代 relay 在四档宿主上都能执行。
 */
function wrapExecuteToolForInputShape(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mc: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalGetTools: ((...args: any[]) => unknown) | undefined,
): void {
  if (typeof mc.executeTool !== 'function') return;
  // 合成版内部已 toArgsJson，再包一层是多余的
  if (mc.__webmcpNexusExecuteToolSynthesized === true) return;
  if (mc.__webmcpNexusExecuteToolWrapped === true) return;

  const original = mc.executeTool;
  defineHiddenProperty(mc, '__webmcpNexusExecuteToolWrapped', true);
  defineHiddenProperty(
    mc,
    'executeTool',
    // 三参签名兼容已发布 relay 6.0.0（两参无 signal）与上游 HEAD（带 { signal }）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tool: any, inputArgs: unknown, ...rest: any[]) => {
      const shape = await resolveInputShape(mc, originalGetTools);
      // .call(mc, …) 保证 native WebIDL 方法拿到正确的 this
      return original.call(mc, tool, coerceExecuteToolInput(inputArgs, shape), ...rest);
    },
  );
}

/**
 * 在宿主的 `getTools` / `executeTool` 上安装双轴归一包装。
 *
 * 守卫**按方法分别打标记**而非函数级整体 return：每条跳过理由只够关掉其中一轴，
 * 粗粒度守卫会让「合成版 executeTool 已归一」顺带关掉 schema 归一（→ 静默少工具），
 * 也会让「合成版 getTools 信号不可信」顺带关掉入参归一（→ 恰恰是最需要包装的组合）。
 *
 * 用 defineHiddenProperty（enumerable: false）安装，故 `Object.keys(mc)` 仍为 []，
 * 「实例无 own enumerable keys」不变量保持。已知偏差：polyfill 5.1.0 刻意把原型方法设为
 * enumerable，own 非枚举属性会遮蔽 inherited 枚举属性，导致 `for...in` 不再产出这两个方法
 * （Object.keys / spread / instanceof 均不受影响，全仓零处 for-in 遍历 ModelContext）。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureHostShapeCompat(mc: any): void {
  // 必须在任何包装**之前**捕获原 getTools：轴二装完后 mc.getTools 就是包装版，
  // 轴一的冷启动探测读它会永久误判成 object-era（自指陷阱）。
  // 合成版 getTools 的信号同样不可信，一并排除。
  const originalGetTools =
    typeof mc.getTools === 'function' &&
    mc.__webmcpNexusGetToolsWrapped !== true &&
    mc.__webmcpNexusGetToolsSynthesized !== true
      ? mc.getTools
      : undefined;

  wrapGetToolsForSchemaShape(mc);
  wrapExecuteToolForInputShape(mc, originalGetTools);
}

/**
 * 按宿主代际决定是否 patch document.modelContext。
 *
 * **现代宿主（polyfill 5.x / Chrome 149+，判据 `typeof mc.getTools === 'function'`）：
 * 不碰 EventTarget / registerTool / listTools / callTool，但会装 `getTools` 与
 * `executeTool` 的双轴形态归一包装**（见 ensureHostShapeCompat）。不碰前四者的理由：
 * - 协议规定 `toolchange` 的派发责任在宿主，polyfill 的 `registerTool` 末尾与 abort
 *   监听器内均会自派发；nexus 再派发一次会造成重复通知（实测一次路由切换 3 次）
 * - 宿主自带 EventTarget，无需补齐
 * - relay 的 embed.js 只需要 `getTools()` + `executeTool()` + `addEventListener`，
 *   不需要 `listTools`/`callTool`
 * - `registerTool` 保持原样才能维持 polyfill 的 WebIDL 保真不变量（arity 为 1、
 *   实例无 own **enumerable** keys）。旧实现往宿主挂 own enumerable 属性并包装
 *   registerTool，会同时破坏这两点，且包装器不透传返回值 —— polyfill 5.x 的
 *   `registerTool` 是 async，Promise 被就地丢弃后重名/空描述等 rejection 会变成
 *   unhandled rejection
 *
 * 归一包装是**不得不加**的：Chrome 155 把原生 executeTool 第二参改成对象、relay 6.x
 * 又删掉了对字符串 inputSchema 的容忍度，两代 relay × 四档宿主的形态差异只能在这里吸收。
 * 包装用 defineHiddenProperty（enumerable: false），故「实例无 own enumerable keys」
 * 不变量仍然成立；已知偏差是 polyfill 档 for...in 不再产出这两个方法。
 *
 * **旧宿主（Chrome 146–148 原生，无 `getTools`）：保留全套 patch。** 那一档
 * `registerTool` 是同步的（无 Promise 问题），且 toolchange 只在 `modelContextTesting`
 * 上派发，embed.js 订阅的却是 modelContext，必须由 nexus 桥接：
 * 1. 补齐 EventTarget
 * 2. 从 `modelContextTesting` 合成 `listTools`/`callTool`（供 relay 2.x 特征检测）
 * 3. 从 `modelContextTesting` 合成 `getTools`/`executeTool`（供 relay 发现/调用）
 * 4. 包装 `registerTool`/`unregisterTool` 以在规范入口上派发 toolchange
 * 5. 安装 toolchange 合并器
 */
export function patchModelContextEventSupport(): void {
  if (modelContextPatched) {
    return;
  }
  // 该函数会向宿主对象写入合成方法与私有标记，故用 any；其余只读位置一律走强类型。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mcToPatch = getModelContext() as any;
  if (!mcToPatch) {
    return;
  }

  if (isModernHost(mcToPatch as WebMcpHostContext)) {
    // 现代宿主不碰 EventTarget / registerTool / listTools / callTool，只做两件事：
    // 1. 补缺口：若该原生版本有 getTools 却无 executeTool（relay 只认 executeTool）且存在
    //    modelContextTesting，则合成 executeTool
    // 2. 装双轴归一包装（Chrome 155 起原生 executeTool 改收对象、relay 6.x 起不再容忍
    //    字符串 inputSchema，两代 relay × 四档宿主的形态差异只能在这里吸收）
    synthesizeExecuteToolIfMissing(mcToPatch);
    ensureHostShapeCompat(mcToPatch);
    modelContextPatched = true;
    return;
  }

  const hasEventTarget = typeof mcToPatch.addEventListener === 'function';
  const hasListTools = typeof mcToPatch.listTools === 'function';
  const hasCallTool = typeof mcToPatch.callTool === 'function';

  // 补齐 EventTarget（旧宿主可能缺失）
  if (!hasEventTarget) {
    const listeners = new Map<string, Set<EventListener>>();

    defineHiddenProperty(mcToPatch, 'addEventListener', (type: string, callback: EventListener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(callback);
    });

    defineHiddenProperty(
      mcToPatch,
      'removeEventListener',
      (type: string, callback: EventListener) => {
        listeners.get(type)?.delete(callback);
      },
    );

    defineHiddenProperty(mcToPatch, 'dispatchEvent', (event: Event): boolean => {
      const set = listeners.get(event.type);
      if (set) {
        set.forEach(fn => {
          try {
            fn.call(mcToPatch, event);
          } catch {
            // Ignore listener errors
          }
        });
      }
      return true;
    });
  }

  // 从 modelContextTesting 合成 listTools/callTool（relay 2.x 的 getExtendedModelContext
  // 要求它们挂在 modelContext 上）。callTool 不是任何宿主提供的方法，纯属 nexus 合成面。
  if (!hasListTools || !hasCallTool) {
    const testing = getModelContextTesting();
    if (testing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testingAny = testing as any;
      if (typeof testingAny.listTools === 'function' && !testingAny.__webmcpNexusListToolsPatched) {
        const originalTestingListTools = testingAny.listTools.bind(testingAny);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const patchedListTools = (...args: any[]) => {
          const nativeTools = originalTestingListTools(...args);
          return Array.isArray(nativeTools)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nativeTools.filter((tool: any) => {
                if (!managedToolNames.has(tool.name)) return true;
                return activeTools.has(tool.name);
              })
            : nativeTools;
        };
        defineHiddenProperty(testingAny, 'listTools', patchedListTools);
        defineHiddenProperty(testingAny, '__webmcpNexusListToolsPatched', true);
      }
      if (!hasListTools && typeof testingAny.listTools === 'function') {
        // testing 面的 inputSchema 是 JSON 字符串，合成时转为对象形态
        defineHiddenProperty(mcToPatch, 'listTools', () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return testingAny.listTools().map((t: any) => ({
              name: t.name,
              description: t.description || '',
              inputSchema:
                typeof t.inputSchema === 'string' && t.inputSchema.length > 0
                  ? JSON.parse(t.inputSchema)
                  : { type: 'object', properties: {} },
            }));
          } catch {
            return [];
          }
        });
      }
      if (!hasCallTool && typeof testingAny.executeTool === 'function') {
        defineHiddenProperty(
          mcToPatch,
          'callTool',
          async (params: { name: string; arguments?: Record<string, unknown> }) => {
            const result = await testingAny.executeTool(
              params.name,
              JSON.stringify(params.arguments || {}),
            );
            if (result === null) {
              return {
                isError: true,
                content: [{ type: 'text', text: 'Tool execution interrupted by navigation' }],
              };
            }
            try {
              const parsed = JSON.parse(result);
              return normalizeToCallToolResult(parsed);
            } catch {
              throw new Error(`Tool returned invalid JSON: ${String(result).slice(0, 500)}`);
            }
          },
        );
      }
    }
  }

  // 合成规范面 getTools/executeTool，使 relay 在该档也可发现/调用工具。
  // 内部会先打 __webmcpNexusSynthesized 标记，避免 isModernHost 误判，
  // 并按方法分别打 __webmcpNexusGetToolsSynthesized / __webmcpNexusExecuteToolSynthesized，
  // 使紧随其后的 ensureHostShapeCompat 能按轴跳过已归一的合成面。
  synthesizeDescriptorApiIfMissing(mcToPatch);
  ensureHostShapeCompat(mcToPatch);

  // 包装 registerTool/unregisterTool，在规范入口上桥接 toolchange。
  // 旧宿主的 registerTool 是同步的；仍透传返回值以免未来宿主形态变化时被误判。
  if (typeof mcToPatch.registerTool === 'function') {
    const originalRegisterTool = mcToPatch.registerTool.bind(mcToPatch);
    defineHiddenProperty(
      mcToPatch,
      'registerTool',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (tool: any, options?: any) => {
        let registrationError: unknown;
        let result: unknown;
        try {
          result = originalRegisterTool(tool, options);
        } catch (error) {
          registrationError = error;
        }
        try {
          mcToPatch.dispatchEvent(new Event('toolchange'));
        } catch {
          // Ignore dispatch errors
        }
        if (registrationError) {
          throw registrationError;
        }
        return result;
      },
    );
  }

  if (typeof mcToPatch.unregisterTool === 'function') {
    const originalUnregisterTool = mcToPatch.unregisterTool.bind(mcToPatch);
    defineHiddenProperty(mcToPatch, 'unregisterTool', (name: string) => {
      try {
        originalUnregisterTool(name);
      } catch {
        // Swallow unregister errors
      }
      try {
        mcToPatch.dispatchEvent(new Event('toolchange'));
      } catch {
        // Ignore dispatch errors
      }
    });
  }

  patchDispatchEventForCoalescing(mcToPatch as WebMcpHostContext);
  modelContextPatched = true;
}

type ToolScope = 'global' | 'route' | 'component';

interface ToolEntry {
  name: string;
  scope: ToolScope;
  scopeId: string;
}

interface ToolOwner {
  scope: ToolScope;
  scopeId: string;
}

interface ActiveToolRecord {
  name: string;
  config: WebMcpToolConfig;
  configs: Map<string, WebMcpToolConfig>;
  controller: AbortController;
  owners: Map<string, ToolOwner>;
  nativeState: NativeToolState;
}

/** 供 DebugPanel 与单测使用的只读快照 */
export interface ActiveToolState {
  name: string;
  scope: ToolScope;
  scopeId: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations?: WebMcpToolAnnotations;
  nativeState: NativeToolState;
}

const registry = new Map<string, ToolEntry[]>();
const activeTools = new Map<string, ActiveToolRecord>();
const managedToolNames = new Set<string>();

function getOwnerKey(owner: ToolOwner): string {
  return `${owner.scope}:${owner.scopeId}`;
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

/**
 * 判别 rejection 是否由注册用的 AbortSignal 引起。
 *
 * 用 reason 与 error.name 判别，而非只读异步时刻的 `signal.aborted` 布尔：
 * 若"重名 rejection"与"组件卸载 abort"时间重叠，回调执行时 aborted 已为真，
 * 只看布尔会把真正的注册错误误判为 abort 而静默吞掉。
 */
function isAbortRejection(record: ActiveToolRecord, error: unknown): boolean {
  const reason = record.controller.signal.reason;
  if (reason !== undefined && error === reason) return true;
  const name = (error as { name?: unknown } | null | undefined)?.name;
  return name === 'AbortError';
}

/**
 * 处理原生注册失败。
 *
 * polyfill 5.x / Chrome 会在 registerTool 入口跑一整套宿主准入校验（2.x 不校验），
 * 失败模式从"重名"一种扩展到五种，泛化的 warn 无法指导排障，故按 error.name 分流。
 * 失败后保留 SDK 所有权镜像（scope 记账需要它），但 getActiveToolConfigs 会过滤掉
 * failed 项，避免向 widget / DebugPanel 暴露宿主里并不存在的幽灵工具 —— relay 5.x
 * 每次调用前都会重新 getTools() 按名查找，幽灵工具必然得到 "Tool not found"。
 */
function handleRegistrationFailure(record: ActiveToolRecord, error: unknown): void {
  record.nativeState = 'failed';

  // 组件快速挂载/卸载的正常路径：polyfill 在 signal abort 时 throw signal.reason
  if (isAbortRejection(record, error)) return;

  const errorName = (error as { name?: string } | null | undefined)?.name ?? '';
  const detail = describeError(error);

  // 页面正在导航：宿主拒绝在非 fully-active 文档上注册，属正常路径
  if (errorName === 'InvalidStateError' && /fully active/i.test(detail)) return;

  if (errorName === 'NotAllowedError') {
    console.warn(
      `[webmcp] Tool "${record.name}" was blocked by Permissions Policy. ` +
        `Cross-origin iframes need allow="tools"; otherwise check the "Permissions-Policy: tools" response header. (${detail})`,
    );
    return;
  }
  if (errorName === 'SecurityError') {
    console.warn(
      `[webmcp] Tool "${record.name}" requires an origin-isolated document. ` +
        `Check for "Origin-Agent-Cluster: ?0" or document.domain usage. (${detail})`,
    );
    return;
  }
  if (errorName === 'NotSupportedError') {
    console.warn(
      `[webmcp] Tool "${record.name}" could not be registered: cross-document exposure ` +
        `(exposedTo/fromOrigins) requires native WebMCP. (${detail})`,
    );
    return;
  }
  console.warn(
    `[webmcp] Failed to register tool "${record.name}" on document.modelContext: ${detail}`,
  );
}

/**
 * 单点兜底空描述。
 *
 * polyfill 5.x / Chrome 对空 description 抛 InvalidStateError（2.x 不校验），而构建插件
 * 在 `withWebMcpTools(Cls, ['m'])` 显式列名且方法无 JSDoc 时会产出 `description: ''`。
 * 三个公共 API（registerGlobalTools / useWebMcpTools / withWebMcpTools）最终都汇聚到
 * registerScopedTool，故兜底只做在这一处，天然无需去重。
 */
function normalizeToolConfig(config: WebMcpToolConfig): WebMcpToolConfig {
  const description = config.description?.trim();
  if (description) {
    return description === config.description ? config : { ...config, description };
  }
  console.warn(
    `[webmcp] Tool "${config.name}" has an empty description; falling back to the tool name. ` +
      `Add a JSDoc description so agents can tell what it does.`,
  );
  return { ...config, description: config.name };
}

/**
 * 入口守卫：过滤不应注册的工具名。
 *
 * polyfill 5.x / Chrome 对工具名做 `^[A-Za-z0-9_.-]{1,128}$` 校验（2.x 不校验），
 * 不合法会抛 InvalidStateError。被过滤的名字**不得写入 activeTools 镜像**，
 * 否则会与宿主的真实工具表分裂，产生幽灵工具。
 */
export function isRegistrableToolName(name: string): boolean {
  // `registerGlobalTools(import * as ns)` 的 CJS interop 必然带 default 键。
  // 它字符集合法但语义错误，会被当成一个叫 "default" 的工具注册且不报错，最难排查。
  if (name === 'default') return false;
  if (!isValidToolName(name)) {
    console.warn(
      `[webmcp] Skipped tool "${name}": WebMCP tool names must be 1-128 characters and ` +
        `contain only ASCII letters, digits, underscore, hyphen, or period.`,
    );
    return false;
  }
  return true;
}

/**
 * 从构建插件注入的 __webmcpSchema 构造 WebMcpToolConfig。
 *
 * title / annotations 的映射只在这一处做，两个入口（registerGlobalTools、useWebMcpTools，
 * withWebMcpTools 内部委托给后者）共用，避免多处映射漂移。
 */
export function buildToolConfig(
  name: string,
  schema: WebMcpToolSchema,
  execute: WebMcpToolConfig['execute'],
): WebMcpToolConfig {
  return {
    name,
    // polyfill 的 getTools() 恒输出 `title: tool.title ?? ''`，relay 5.x 原样转发到
    // MCP 客户端 → 不传就是空标题。回落工具名符合上游推荐读法 `tool.title || tool.name`。
    title: schema.title || name,
    description: schema.description,
    inputSchema: schema.inputSchema,
    execute,
    annotations: {
      readOnlyHint: schema.readOnly ?? false,
      untrustedContentHint: schema.untrustedContent ?? false,
      // 已知差异：consequentialHint 是 Chrome 153+ 的原生 annotation，
      // @mcp-b/webmcp-types@5.1.0 尚未收录、polyfill 5.1.0 会丢弃它，
      // 仅原生 Chrome 153+ 生效。透传是安全的向前兼容。
      consequentialHint: schema.consequential ?? false,
    },
  };
}

/** 获取当前活跃工具名列表（仅用于测试和内部同步） */
export function getActiveToolNames(): string[] {
  return Array.from(activeTools.keys());
}

function toDescriptor(record: ActiveToolRecord): WidgetToolDescriptor {
  return {
    name: record.name,
    title: record.config.title || record.name,
    description: record.config.description,
    inputSchema: record.config.inputSchema || { type: 'object', properties: {} },
    ...(record.config.annotations ? { annotations: record.config.annotations } : {}),
  };
}

/**
 * 获取当前活跃工具描述符列表（供 pushToolsToWidget 在 SDK 有工具时使用）。
 *
 * 过滤掉 nativeState === 'failed' 的记录：宿主校验失败时 `#tools.set` 根本没执行，
 * 宿主 getTools() 里没有该工具，若仍上报就成了幽灵工具。'pending' 不过滤，
 * 否则异步 registerTool 尚未 resolve 时列表会闪烁。
 */
export function getActiveToolConfigs(): WidgetToolDescriptor[] {
  return Array.from(activeTools.values())
    .filter(record => record.nativeState !== 'failed')
    .map(toDescriptor);
}

/**
 * 获取当前活跃工具的完整状态快照（只读）。
 *
 * 两个用途：给 nativeState 一个真实读取方（此前它全仓只写不读）；让 DebugPanel 用权威
 * scope 元数据分类，不再靠 description 文本里的「[作用域：全局]」正则猜测。
 */
export function getActiveToolStates(): ActiveToolState[] {
  return Array.from(activeTools.values()).map(record => {
    const primaryOwner = record.owners.values().next().value as ToolOwner | undefined;
    return {
      ...toDescriptor(record),
      scope: primaryOwner?.scope ?? 'component',
      scopeId: primaryOwner?.scopeId ?? 'unknown',
      nativeState: record.nativeState,
    };
  });
}

/**
 * 在内部注册表中记录工具的所有权信息。
 * 如果同名工具已被其他 scope 注册，输出警告但仍允许注册。
 */
export function registerEntry(name: string, scope: ToolScope, scopeId: string): void {
  const entries = registry.get(name) || [];
  if (entries.length > 0) {
    const isSameScopeAndId = entries.some(e => e.scope === scope && e.scopeId === scopeId);
    if (!isSameScopeAndId) {
      const existing = entries[0];
      console.warn(
        `[webmcp] Tool "${name}" is already registered by scope "${existing.scope}:${existing.scopeId}". ` +
          `Re-registering from "${scope}:${scopeId}". This may cause unexpected behavior.`,
      );
    }
  }
  entries.push({ name, scope, scopeId });
  registry.set(name, entries);
}

/**
 * 从内部注册表中移除指定 scope 的工具所有权记录。
 * @returns true 表示可以安全注销（最后一个持有者已移除）；
 *          false 表示还有其他 scope 持有该工具，不应注销。
 */
export function unregisterEntry(name: string, scope: ToolScope, scopeId: string): boolean {
  const entries = registry.get(name);
  if (!entries) return false;
  const idx = entries.findIndex(e => e.scope === scope && e.scopeId === scopeId);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  if (entries.length === 0) {
    registry.delete(name);
    return true; // 可以安全注销
  }
  return false; // 其他 scope 仍持有该工具
}

/**
 * 清空注册表（仅用于测试）
 */
export function clearRegistry(): void {
  registry.clear();
  activeTools.clear();
  managedToolNames.clear();
  modelContextPatched = false;
  if (pushToolsTimer) {
    clearTimeout(pushToolsTimer);
    pushToolsTimer = null;
  }
}

/**
 * 注册带 owner 的工具。
 * 同名工具只会原生注册一次；多个组件/作用域通过 owners 聚合生命周期。
 */
export function registerScopedTool(toolConfig: WebMcpToolConfig, owner: ToolOwner): void {
  try {
    const config = normalizeToolConfig(toolConfig);
    const ownerKey = getOwnerKey(owner);
    managedToolNames.add(config.name);
    const existing = activeTools.get(config.name);
    if (existing) {
      existing.owners.set(ownerKey, owner);
      existing.configs.set(ownerKey, config);
      return;
    }

    const controller = new AbortController();
    const owners = new Map<string, ToolOwner>([[ownerKey, owner]]);
    const record: ActiveToolRecord = {
      name: config.name,
      config,
      configs: new Map([[ownerKey, config]]),
      controller,
      owners,
      nativeState: 'pending',
    };

    activeTools.set(config.name, record);

    const mc = getModelContext();

    controller.signal.addEventListener(
      'abort',
      () => {
        // 身份校验：polyfill 用 #removeTool(name, expected) 防止旧 handler 删掉新注册的
        // 同名工具，nexus 侧需要等价保护，否则正确性依赖调用时序而非不变量。
        if (activeTools.get(config.name) !== record) return;
        try {
          // L2 注销兜底：仅当宿主不是自带 signal 处理的实现时才调用 unregisterTool。
          // - polyfill 5.x / Chrome 148+：已移除 unregisterTool，typeof 判定为 false，自动跳过
          //   （polyfill 5.x 在 registerTool 内部已 hook signal abort 自动删除工具，
          //   再调 unregisterTool 既多余又会触发 deprecation 警告）
          // - Chrome 146/147 原生：registerTool 不识别 signal，必须靠 unregisterTool 注销
          // __isWebMCPPolyfill 在 5.x 下已冗余（前一个条件就短路了），保留它作为
          // 未来"既有 unregisterTool 又自管 signal 的宿主"的防御。
          if (mc && typeof mc.unregisterTool === 'function' && !mc.__isWebMCPPolyfill) {
            mc.unregisterTool(config.name);
          }
        } catch {
          // Ignore legacy fallback errors
        }
        try {
          activeTools.delete(config.name);
          notifyToolsChanged();
        } catch {
          // Ignore notification errors
        }
      },
      { once: true },
    );

    if (mc && typeof mc.registerTool === 'function') {
      const nativeToolConfig = {
        ...config,
        // 透传宿主的第二个参数（执行取消信号）：Chrome 官方 imperative API 规定
        // execute 会以 { signal } 作为第二参，旧实现直接丢弃导致工具无法感知取消。
        execute: async (input: Record<string, unknown>, options?: { signal?: AbortSignal }) => {
          const latestRecord = activeTools.get(config.name);
          return latestRecord?.config.execute(input, options);
        },
      };

      let result: unknown;
      try {
        result = mc.registerTool(nativeToolConfig, { signal: controller.signal });
      } catch (error) {
        // 同步抛错：仅旧宿主（Chrome 146/147 原生重名）会走到这里
        if (typeof mc.unregisterTool === 'function') {
          try {
            mc.unregisterTool(config.name);
            result = mc.registerTool(nativeToolConfig, { signal: controller.signal });
          } catch (retryError) {
            handleRegistrationFailure(record, retryError);
            return;
          }
        } else {
          handleRegistrationFailure(record, error);
          return;
        }
      }

      // 现代宿主（polyfill 5.x）：registerTool 返回 Promise<void>，在本地 toolchange
      // 通知后 resolve；旧宿主同步返回 undefined。Promise.resolve 对非 promise 值直接
      // 包装，两代宿主统一处理（沿用上游 usewebmcp 的惯用法，不另写 isThenable）。
      void Promise.resolve(result).then(
        () => {
          // 卸载后才 resolve：不写孤儿状态
          if (controller.signal.aborted) return;
          if (activeTools.get(config.name) !== record) return;
          record.nativeState = 'registered';
        },
        error => {
          handleRegistrationFailure(record, error);
        },
      );
    }
  } catch {
    // SDK public paths should never surface browser API errors.
  }
}

/**
 * 移除工具 owner。只有最后一个 owner 移除时才 abort 原生注册。
 * @returns true 表示工具列表发生了实际注销；false 表示仍有其他 owner。
 */
export function unregisterScopedTool(name: string, owner: ToolOwner): boolean {
  try {
    const record = activeTools.get(name);
    if (!record) {
      return false;
    }

    const ownerKey = getOwnerKey(owner);
    const removedConfig = record.configs.get(ownerKey);
    record.owners.delete(ownerKey);
    record.configs.delete(ownerKey);
    if (removedConfig && record.config === removedConfig) {
      const nextConfig = record.configs.values().next().value as WebMcpToolConfig | undefined;
      if (nextConfig) {
        record.config = nextConfig;
      }
    }
    if (record.owners.size > 0) return false;

    if (!record.controller.signal.aborted) {
      record.controller.abort();
    } else {
      activeTools.delete(name);
      notifyToolsChanged();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce timer for pushing tools to widget iframe.
 */
let pushToolsTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Directly push the current tool list to any widget iframes via postMessage.
 *
 * 该通道服务的是**第三方 widget iframe**，当前 demo 没有消费者。relay iframe 被刻意跳过
 * （见下方 data-webmcp-relay 注释），relay 自行调 document.modelContext.getTools() 拉取。
 *
 * This bypasses Chrome's registerToolsChangedCallback mechanism which doesn't
 * fire on unregisterTool, ensuring the relay always has the correct tool list.
 */
function pushToolsToWidget(): void {
  try {
    if (typeof document === 'undefined') return;

    const iframes = document.querySelectorAll('iframe');
    if (iframes.length === 0) return;

    const tools = getToolsForWidget();

    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      // 【正确性屏障，不只是去重】跳过 relay iframe。
      //
      // relay 5.x 的 widget 运行时（widgetRuntime.ts）会接受宿主页面推来的
      // `webmcp.tools.changed` 并直接转发给 relay 覆盖自己的快照；而 nexus 推的是
      // **SDK 所有权镜像**，它是宿主全量的子集 —— 缺 polyfill declarative forms 自动
      // 注册的 `<form toolname>` 工具，也缺第三方直接调 document.modelContext.registerTool
      // 注册的工具。一旦推过去，MCP 客户端会少看到工具。
      // relay iframe 已自行调 getTools() 拉取权威全量，因此必须跳过。
      //
      // 属性名与 relay 5.1.0 的 RELAY_IFRAME_SELECTOR = '[data-webmcp-relay]' 一致。
      if (iframe.hasAttribute('data-webmcp-relay')) continue;
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'webmcp.tools.changed',
              tools,
            },
            // 不用 '*'：relay 的 widget 是 blob URL iframe、与宿主同源，'*' 对它一定送达；
            // 页面一旦出现第三方 iframe，'*' 会把工具表广播给任意 origin。
            typeof location !== 'undefined' ? location.origin : '*',
          );
        }
      } catch {
        // Cross-origin or other iframe access error, skip
      }
    }
  } catch {
    // Ignore errors
  }
}

function getToolsForWidget(): WidgetToolDescriptor[] {
  // tier-1：SDK 所有权镜像。条件用 activeTools.size 而非曾经的 hasManagedTools ——
  // 后者一旦置真就永不复位（唯一复位点是仅供测试的 clearRegistry），
  // "SDK 工具全部卸载后"会把宿主里仍存在的第三方工具短路成空列表。
  if (activeTools.size > 0) {
    return getActiveToolConfigs();
  }
  // tier-2：旧宿主 / nexus 合成面的 listTools。注意这里的 listTools 可能来自宿主的
  // MCP-B 扩展，也可能来自 nexus 从 modelContextTesting 合成（已带 ownership 过滤），
  // 两者语义不同。现代宿主下 relay 自行走 getTools()，本通道无消费者，故保持同步。
  try {
    const mc = getModelContext();
    if (mc && typeof mc.listTools === 'function') {
      const tools: WidgetToolDescriptor[] = [];
      for (const tool of mc.listTools()) {
        // 与旧宿主 testing.listTools 包装器同一套 ownership 过滤：SDK 托管过但已卸载的
        // 工具，宿主可能尚未同步移除（Chrome 146/147 的 registerTool 不认 signal，
        // 只能靠 unregisterTool），不过滤就会把幽灵工具推给 widget。
        // 非 SDK 托管的工具（第三方直接注册、polyfill declarative forms）则放行。
        if (managedToolNames.has(tool.name) && !activeTools.has(tool.name)) continue;
        const inputSchema = coerceInputSchema(tool.inputSchema, tool.name);
        if (!inputSchema) continue;
        tools.push({
          name: tool.name,
          title: tool.name,
          description: tool.description || '',
          inputSchema,
        });
      }
      return tools;
    }
  } catch {
    // Fall through to activeTools mirror
  }
  return getActiveToolConfigs();
}

/**
 * Schedule a debounced push of tools to widget iframes.
 * Uses 100ms delay to coalesce rapid register/unregister cycles
 * (e.g., during SPA navigation when old component unmounts and new one mounts).
 */
function schedulePushToolsToWidget(): void {
  if (pushToolsTimer) {
    clearTimeout(pushToolsTimer);
  }
  pushToolsTimer = setTimeout(() => {
    pushToolsTimer = null;
    pushToolsToWidget();
  }, 100);
}

/**
 * 通知工具列表已变化。
 *
 * 现代宿主自己派发 toolchange（polyfill 的 registerTool 末尾与 abort 监听器内均有
 * #notifyToolsChanged），nexus 再派发一次会造成重复通知（实测一次路由切换 3 次，
 * 因为 polyfill 用 setTimeout(0) 派发、跨过了合并器的微任务窗口），故仅在旧宿主档手动派发。
 * 若某个宿主有 getTools 却不自派发，relay 的 2000ms 轮询与 DebugPanel 的轮询会兜底。
 */
export function notifyToolsChanged(): void {
  const mc = getModelContext();
  if (mc && !isModernHost(mc) && typeof mc.dispatchEvent === 'function') {
    try {
      mc.dispatchEvent(new Event('toolchange'));
    } catch {
      // Ignore dispatch errors
    }
  }

  schedulePushToolsToWidget();
}

/**
 * 安全注册工具，处理重复名称的情况。
 * 如果 registerTool 因重复名称抛错，则先 unregister 再重试。
 */
export function safeRegisterTool(toolConfig: WebMcpToolConfig): void {
  registerScopedTool(toolConfig, { scope: 'global', scopeId: 'safe-register' });
}
