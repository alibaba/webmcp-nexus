// packages/webmcp-sdk/src/builtinTools.ts
//
// SDK 内置的全局代调工具 `webmcpCallTool`。
//
// 存在的理由是一个客户端侧的缺口：部分 MCP 客户端的会话工具索引是**启动快照**，不响应
// `tools/list_changed`（MCP 2026-07-28 规范把它降为 SHOULD 并允许客户端缓存，所以"靠
// list_changed 刷新"不能作为通用前提）。nexus 的页面工具随路由 mount/unmount 增删，于是
// 会话开始后才出现的工具，这类客户端永远调不到。relay 侧是实时准确的，阻塞层在客户端。
//
// 客户端改不了，只能在页面侧补一个逃生口：本工具启动时就注册，因此必然进客户端快照；
// 它接受 { name, arguments }，在页面内实时查 document.modelContext.getTools() 并代调。
//
// 这是 relay 已删除的 `webmcp_call_tool`（随 5.0.0 移除）的页面侧复活：旧版在 relay server
// 侧按名转发到某个 tab，新版在页面内按名转发到本 tab。入参形状、指向 `webmcp_list_tools`
// 的描述写法、以及未命中时「isError + Available tools: 目录」的自我纠正行为都沿用旧版，
// 不自己发明措辞。
import type { RegisteredTool } from '@mcp-b/webmcp-types';
import {
  buildToolConfig,
  describeError,
  getActiveToolNames,
  notifyToolsChanged,
  patchModelContextEventSupport,
  registerEntry,
  registerScopedTool,
  unregisterEntry,
  unregisterScopedTool,
} from './registry';
import { getModelContext, isModelContextAvailable, toWidgetToolDescriptor } from './model-context';
import type { WebMcpBuiltinToolsOptions, WebMcpToolExecuteOptions, WebMcpToolSchema } from './types';

/** 内置代调工具名。camelCase 是硬约束：见 skill/SKILL.md M3 与根 README 的工具名规范 */
export const CALL_TOOL_NAME = 'webmcpCallTool';

// `as const` 是必需的：registry 的 ToolOwner.scope 是 'global'|'route'|'component' 字面量联合，
// 而 ToolOwner 未导出，只能靠字面量推断对上号（否则 widen 成 string 无法赋值）。
const BUILTIN_SCOPE = 'global' as const;
const BUILTIN_SCOPE_ID = 'builtin';
const BUILTIN_OWNER = { scope: BUILTIN_SCOPE, scopeId: BUILTIN_SCOPE_ID };

/**
 * 手写 schema：SDK 自身由 tsup 打包、不经 vite/webpack 插件，拿不到 __webmcpSchema 注入。
 *
 * description 是模型唯一的决策依据，因此写明三件事：谁提供的（避免被误认为 relay 的静态
 * 工具）、什么时候该用（客户端工具列表已过期）、name 从哪来（webmcp_list_tools 的
 * originalName，不是客户端看到的改写名）。
 */
const CALL_TOOL_SCHEMA: WebMcpToolSchema = {
  title: 'Call a page tool',
  description:
    'Call a WebMCP tool registered on the current page, by name. Provided by ' +
    'webmcp-nexus-sdk (not by the relay), so it reaches only this page\'s own tools. ' +
    'Use it when a tool you need is missing from your tool list: pages register and ' +
    'unregister tools as the user navigates, and some MCP clients never refresh ' +
    'tools/list_changed, so your list can be stale. Get names from the relay\'s ' +
    'webmcp_list_tools (pass its originalName field) or from the directory this tool ' +
    'returns on a miss.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          'The tool name to call, exactly as the page registered it. Use the originalName ' +
          'field from webmcp_list_tools — not the sanitized or tab-suffixed name your MCP ' +
          'client displays.',
      },
      arguments: {
        type: 'object',
        description:
          'Arguments to pass to the tool as a JSON object. Check the target tool ' +
          'inputSchema from webmcp_list_tools for expected fields. Omit for tools that ' +
          'take no arguments.',
      },
    },
    required: ['name'],
  },
};

let callToolEnabled = true;

function errorResult(text: string): Record<string, unknown> {
  return { content: [{ type: 'text', text }], isError: true };
}

/**
 * 本框架（same-document）判据。
 *
 * 原生 Chrome 的顶层 `getTools()` 会带同源子框架的工具，而 polyfill 的 `executeTool` 对
 * `tool.window !== globalThis.window` 直接抛 "Tool not found" —— 即这些工具在本框架列出
 * 但不可执行。relay 自己的处理是宿主页面优先（selectRelayTools），此处对标。
 */
function isSameDocument(tool: RegisteredTool): boolean {
  return typeof window !== 'undefined' && tool.window === window;
}

/** 按名去重，同名时本框架优先 */
function dedupeByName(tools: RegisteredTool[]): RegisteredTool[] {
  const byName = new Map<string, RegisteredTool>();
  for (const tool of tools) {
    if (!tool || typeof tool.name !== 'string' || tool.name.length === 0) continue;
    const kept = byName.get(tool.name);
    if (!kept || (!isSameDocument(kept) && isSameDocument(tool))) {
      byName.set(tool.name, tool);
    }
  }
  return Array.from(byName.values());
}

/**
 * 当前页工具目录，供未命中时让模型自我纠正。
 *
 * 只给 name / description / inputSchema 三键：够模型改对名字即可，多给只是烧 token。
 * 排除自身，避免模型拿它递归调用。
 * 复用 toWidgetToolDescriptor 顺带把字符串 inputSchema coerce 成对象（原生 Chrome
 * 149–154 档），畸形 schema 返回 null 即丢弃 —— 与「把 schema 损坏的工具降级成零参数
 * 可调用工具比丢弃它更危险」的既有判断一致。
 */
function buildToolDirectory(tools: RegisteredTool[]): Array<Record<string, unknown>> {
  const directory: Array<Record<string, unknown>> = [];
  for (const tool of tools) {
    if (tool.name === CALL_TOOL_NAME) continue;
    const descriptor = toWidgetToolDescriptor(tool);
    if (!descriptor) continue;
    directory.push({
      name: descriptor.name,
      description: descriptor.description,
      inputSchema: descriptor.inputSchema,
    });
  }
  return directory;
}

/** name 传错时给的纠正提示：明确要页面原始名，不是客户端看到的改写名 */
const DIRECTORY_HINT =
  'Pass one of the names above verbatim as `name`. These are the page-side original names ' +
  "(the `originalName` field of the relay's webmcp_list_tools), not the sanitized or " +
  'tab-suffixed names your MCP client displays.';

function directoryText(directory: Array<Record<string, unknown>>): string {
  if (directory.length === 0) {
    return 'No tools are currently available on this page.';
  }
  // 紧凑 JSON，不缩进：目录会整段回灌给模型，缩进对它零收益却把载荷放大三到四成
  // （单页 24 个工具时一次未命中约 10–20KB）。工具特别多的页面请改用 relay 的
  // webmcp_list_tools —— 上面那条 hint 已经指过去了，所以这里不做条数截断：
  // 截断有可能恰好藏掉模型要找的那个工具，比多花 token 更糟。
  return `Available tools:\n${JSON.stringify(directory)}\n${DIRECTORY_HINT}`;
}

/**
 * 代调 handler。
 *
 * 全程不 throw：对齐 registerGlobalTools 的「SDK 入口不向调用方传播浏览器 API 异常」，
 * 一切失败都转成 isError 结果，让模型看得见原因而不是收到一个协议级错误。
 *
 * 返回类型是 unknown 而不是 CallToolResult：**成功路径刻意不归一**，见下方 executeTool
 * 之后的说明。只有失败路径才由本函数构造 `{ content, isError: true }`。
 */
async function executeCallTool(
  input: Record<string, unknown> | undefined,
  options?: WebMcpToolExecuteOptions,
): Promise<unknown> {
  const mc = getModelContext();
  if (!mc || typeof mc.getTools !== 'function') {
    return errorResult(
      'webmcpCallTool is unavailable: this host exposes no document.modelContext.getTools().',
    );
  }
  if (typeof mc.executeTool !== 'function') {
    return errorResult(
      'webmcpCallTool is unavailable: this host exposes no document.modelContext.executeTool(), ' +
        'so page tools cannot be invoked by name.',
    );
  }

  let rawTools: RegisteredTool[];
  try {
    rawTools = await mc.getTools();
  } catch (error) {
    return errorResult(
      `webmcpCallTool could not list the current page's tools: ${describeError(error)}`,
    );
  }
  const tools = dedupeByName(Array.isArray(rawTools) ? rawTools : []);

  const rawName = input?.name;
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (name.length === 0) {
    return errorResult(
      `Missing required argument "name". ${directoryText(buildToolDirectory(tools))}`,
    );
  }
  // 自递归守卫：真的去 executeTool 自己会多绕一跳，最后落回上面那条「空 name」错误，
  // 模型看到的是一条与它的意图毫不相干的消息
  if (name === CALL_TOOL_NAME) {
    return errorResult(
      `Tool "${name}" cannot call itself. Pass the name of the page tool you want to run.`,
    );
  }

  const rawArguments = input?.arguments;
  if (
    rawArguments !== undefined &&
    rawArguments !== null &&
    (typeof rawArguments !== 'object' || Array.isArray(rawArguments))
  ) {
    return errorResult(
      `"arguments" must be a JSON object matching the target tool's inputSchema, got ${typeof rawArguments}. ` +
        directoryText(buildToolDirectory(tools)),
    );
  }

  const target = tools.find(tool => tool.name === name);
  if (!target) {
    return errorResult(
      `Tool "${name}" not found. ${directoryText(buildToolDirectory(tools))}`,
    );
  }

  let raw: string | null;
  try {
    // 把 getTools() 拿到的对象**原样**喂回去：polyfill 对 name/description/window/origin
    // 四键既做存在性检查又做 window/origin 值比较，自己重建描述符必抛。
    // 第三个参数透传执行取消信号（原生 Chrome 会用到；polyfill 5.1.0 不转发，属零成本向前兼容）。
    raw = await mc.executeTool(
      target,
      (rawArguments ?? {}) as object,
      options?.signal ? { signal: options.signal } : undefined,
    );
  } catch (error) {
    return errorResult(`Tool "${name}" failed to execute: ${describeError(error)}`);
  }

  // null = 被页面导航中断，沿用 registry 合成 callTool 的既有文案
  if (raw === null) {
    return errorResult('Tool execution interrupted by navigation');
  }

  // 宿主的 executeTool 返回的是 **JSON 字符串**（polyfill serializeChromeToolResult 对对象
  // 走 JSON.stringify），所以必须先 parse：把字符串原样往上返回会让内层结果被二次序列化，
  // 且内层的 isError: true 被外层的 false 覆盖 —— 破坏性工具失败会被当成成功。
  //
  // 但 parse 之后**不在这里归一**，把内层工具的返回值原样交回宿主，由消费方（relay 的
  // normalizeToolResponse）用它那层更宽的规则收尾。曾经在这里调 normalizeToCallToolResult，
  // 那是错的：nexus 的 isCallToolResult 只认 text/image/resource 三种 content 且只看首元素，
  // 而上游 isContentBlock 认 6 种（另有 audio / resource_link）并逐个校验必填字段 ——
  // 内层返回 {content:[{type:'resource_link',…}], isError:true} 会被判成「不是 CallToolResult」
  // 而重新包成 text 且 isError 抹成 false，正是本段开头最想防的那类静默事故。
  // 交给上游还顺带保住 structuredContent，以及 relay 对 resultType:'input_required' 的特判。
  //
  // 净效果：**代调结果与客户端直调该工具的结果一致**。
  // parse 失败说明是原生 declarative 工具的纯文本返回值，原样返回字符串即可。
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * 注册内置工具（当前只有 webmcpCallTool）。幂等，返回是否真的注册了。
 *
 * 幂等判据取自注册表本身而不是模块级 flag：`clearRegistry()` 之后能自然重注册，也不会跨
 * 测试用例泄漏 —— 与 registry 把形态传感器挂宿主对象而非模块变量是同一取向。
 *
 * 前置条件：调用方已跑过 `ensureModelContextPolyfill()` + `isModelContextAvailable()` +
 * `patchModelContextEventSupport()`（registerGlobalTools 与 useWebMcpTools 都是这个顺序）。
 */
export function ensureBuiltinTools(): boolean {
  if (!callToolEnabled) return false;
  if (getActiveToolNames().includes(CALL_TOOL_NAME)) return false;

  registerEntry(CALL_TOOL_NAME, BUILTIN_SCOPE, BUILTIN_SCOPE_ID);
  registerScopedTool(
    buildToolConfig(CALL_TOOL_NAME, CALL_TOOL_SCHEMA, async (input, options) =>
      executeCallTool(input, options),
    ),
    BUILTIN_OWNER,
  );
  // 宿主自己会派发 toolchange，但 widget iframe 的推送只有 notifyToolsChanged 会触发。
  // 调用方随后可能再调一次（它注册了自己的工具时），无妨：旧宿主档的派发被
  // patchDispatchEventForCoalescing 合到同一微任务，widget 推送是 100ms 防抖。
  notifyToolsChanged();
  return true;
}

/**
 * 开关内置工具。默认全部开启。
 *
 * 与调用顺序无关：
 * - 关闭时若已注册，就地反注册（unregisterScopedTool 的 abort 链路会摘掉宿主注册并自行
 *   notifyToolsChanged），所以「先注册后关」立即生效；
 * - 重新开启时若宿主已就绪，立即补注册，不等下一次注册入口 —— 否则应用只在启动时调一次
 *   registerGlobalTools、之后没有组件重挂载的话，一个 disable→enable 循环就会让
 *   webmcpCallTool 永久消失。
 */
export function configureBuiltinTools(options: WebMcpBuiltinToolsOptions): void {
  const next = options?.callTool !== false;
  if (next === callToolEnabled) return;
  callToolEnabled = next;

  if (next) {
    // 宿主还不存在时（SSR、或应用尚未初始化）不为一次配置调用去装 polyfill：交给下一个
    // 注册入口，它本来就会 ensure + patch。裸调 ensureBuiltinTools 会在无宿主环境下往
    // activeTools 里塞一条幽灵记录（见该函数自述的前置条件）。
    if (isModelContextAvailable()) {
      patchModelContextEventSupport();
      ensureBuiltinTools();
    }
    return;
  }

  unregisterScopedTool(CALL_TOOL_NAME, BUILTIN_OWNER);
  unregisterEntry(CALL_TOOL_NAME, BUILTIN_SCOPE, BUILTIN_SCOPE_ID);
}
