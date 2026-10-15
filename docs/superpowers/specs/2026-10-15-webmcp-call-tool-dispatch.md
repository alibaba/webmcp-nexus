# Spec: SDK 内置全局代调工具 `webmcpCallTool` —— 绕过客户端启动快照的工具发现缺口

> 状态：**已实施，待 double-check 复核**（2026-10-15 起草并实施；实施记录见 §11）
> 范围：`packages/webmcp-sdk` 新增一个内置全局工具 + 两份 SDK README + 根 README 一处补充。纯增量，不改既有注册/注销/双轴归一逻辑。

## 1. 问题

部分 MCP 客户端的会话工具索引是**启动快照**，不响应 `tools/list_changed`（实测 Qoder 如此；MCP 2026-07-28 规范把它降为 SHOULD 并允许客户端缓存 `ttlMs`/`cacheScope`，所以"靠 list_changed 刷新"不能作为通用前提）。nexus 的页面工具随路由 mount/unmount 增删，于是会话开始后才出现的工具，Agent 永远调不到。

relay 侧是实时准确的（`getTools()` 2s 轮询 + `list_changed` 通知，已实测无瑕疵），阻塞层在客户端。客户端改不了，只能在**页面侧**补逃生口：一个启动时就存在、因此必然进客户端快照的全局工具，接受 `{ name, arguments }`，在页面内实时查表并代调任意当前工具。

**这个能力位不是新发明。** relay 首个 commit（`8430f487`，2026-02-25）就有 `webmcp_call_tool`，在 `52928a62`（2026-08-02，PR #278，MCP SDK v2 迁移）被整体删除、无兼容 shim、无迁移文档，随 5.0.0（2026-08-23）对外生效。已从 git 历史逐字核实旧实现（见 §3 取证 F）。本方案是它的**页面侧复活**：旧版在 relay server 侧按名转发到某个 tab，新版在页面内按名转发到本 tab 的 `document.modelContext`。放页面侧的关键好处是它自己也在被转发的工具表里，因此必然出现在客户端启动快照中。

**不做配套 list 工具**：relay 内置的 `webmcp_list_tools` 已实时提供发现能力（返回 `name`/`originalName`/`description`/`inputSchema`/`sources`）。

## 2. 前后对比

| 场景 | 现在 | 改后 |
| --- | --- | --- |
| 会话启动后导航到 `/todos`，Agent 想调 `listTodos` | 客户端快照里没有 → 调不到，Agent 只能报"无此工具" | `webmcpCallTool({name:'listTodos'})` → 实时命中并执行 |
| Agent 猜错工具名 | 客户端报 "unknown tool"，无任何线索 | `isError` + **当前页工具目录**（原始名/description/inputSchema），模型自我纠正 |
| 只用 `useWebMcpTools` 的应用 | — | 同样自动获得该工具（不依赖用户调 `registerGlobalTools`） |
| 不想要这个工具 | — | `configureBuiltinTools({ callTool: false })`，与调用顺序无关 |
| 破坏性工具失败 | — | 内层 `isError: true` 原样透传到客户端（取证 A） |

## 3. 决策与取证

每条都已核实并附出处。

### 决策 1：注册时机 —— SDK 自动注册，不依赖用户调 `registerGlobalTools`

一个幂等的 `ensureBuiltinTools()`，由 `registerGlobalTools` 与 `useWebMcpTools` 各自在注册自己的工具**之前**调用（`withWebMcpTools` 委托给 hook，自动覆盖）。谁先跑谁注册，后续调用是 no-op —— 不是"兜底"，是同一条 ensure 路径的两个入口。

### 决策 2：annotations 三个 hint 全 false（`buildToolConfig` 默认）

> 大白话：hint 是工具自报的"我是只读的吗 / 返回值可能含不可信内容吗 / 会造成不可逆后果吗"，客户端据此决定是否弹确认框。全 false = 透明代理，不打扰。

裁定依据：能不能调是 Agent 客户端的判断，该工具只管执行。**代价**：原生 Chrome 153+ 上被代调的破坏性工具原本会触发的原生确认弹窗被绕过（polyfill 5.1.0 丢弃 `consequentialHint`，故 demo 与绝大多数部署路径无差异）。**上游同样取向**：旧 relay `webmcp_call_tool` 的 annotations 只有 `{ readOnlyHint: false }`（取证 F）。

### 决策 3：工具名 `webmcpCallTool`

| 判据 | `nexus_call_tool`（初版，已否决） | `webmcpCallTool`（采纳） |
| --- | --- | --- |
| 名字能否自解释 | ✗ `nexus` 是本仓产品名，对没见过本仓的模型是纯噪声；`call_tool` 在"全都是工具"的列表里同义反复，不传达"按名代调你看不见的工具"这层间接性 | ✓ `WebMCP` + `CallTool` 两个 token 都在说事 |
| 与 relay 静态工具的关系 | ✗ 不同族，与它必须配对使用的 `webmcp_list_tools` 割裂 | ✓ 客户端列表本就有 `webmcp_list_sources`/`webmcp_list_tools`/`webmcp_open_page`；用法恰是"`webmcp_list_tools` 拿 `originalName` → `webmcpCallTool` 调它"，同族命名让这对组合成对出现 |
| 是否符合本仓规范 | ✗ **违反** `skill/SKILL.md:31` M3（MUST 级："工具名只能用 `[A-Za-z0-9_]`（camelCase）"）与根 `README.md:320`（"工具名请只用 camelCase"）。既有工具全 camelCase：`navigate`/`listTodos`/`getCanvasSnapshot` | ✓ camelCase |
| 血缘 | ✗ 看不出与旧 relay 能力的关系 | ✓ 熟悉旧 `webmcp_call_tool` 的人立刻认出传承 |

**唯一代价与缓解**：可能被误认为 relay 提供的工具（provenance 混淆）。① description 首句写明"由页面内的 webmcp-nexus-sdk 提供，只能调**本页**工具"；② 根 README「在 MCP 客户端里会看到什么」把它与 relay 的 3 个静态工具**分表列出并注明来源**。字面撞车不存在：relay `sanitizeName` 只替换 `[^a-zA-Z0-9_]`，`webmcpCallTool` 原样通过，与 `webmcp_call_tool` 是两个不同字符串；两仓 grep `webmcpCallTool` 零命中。

### 取证 A：`executeTool` 返回 JSON **字符串**，不是对象 —— 全案最关键前提

- polyfill `#invokeToolByName` 末尾 `return serializeChromeToolResult(rawResult)`；该函数对对象/函数走 `JSON.stringify`，其余 `String(value)`（`node_modules/.pnpm/@mcp-b+webmcp-polyfill@5.1.0/node_modules/@mcp-b/webmcp-polyfill/dist/schema.js:118-124`；调用点 `dist/index.js:818`）。
- relay 侧 `normalizeSerializedToolResult` 先 `JSON.parse`，是纯对象才交给 `normalizeToolResponse`（`mcp-b/packages/webmcp-local-relay/src/browser/shared.ts:33-53`）；`normalizeToolResponse` 对**已是 CallToolResult 形状**的值经 `isProtocolToolResponse` 判定后**原样返回**（`mcp-b/packages/webmcp-ts-sdk/src/schema.ts`）。
- **结论**：handler 必须先 `JSON.parse`。若把字符串直接往上返回，客户端会收到「text 里塞着一整个内层 CallToolResult 的 JSON」，且内层 `isError: true` 被外层抹成 `false` —— **破坏性工具失败会被当成成功**。parse 之后**不在页面内归一**，原样上交（理由见 §12.1）。
- parse 失败按纯文本处理（原生 declarative 工具返回 plain text，`shared.ts:38` 注释）。
- 返回 `null` = 被页面导航中断，照抄既有文案（`registry.ts:607-611`）。

### 取证 B：把 `getTools()` 拿到的对象原样喂回 `executeTool` 是**充分条件，不是必要条件**

polyfill 对 `name`/`description`/`window`/`origin` 四键既做存在性检查又做 `tool.window === globalThis.window && tool.origin === currentOrigin()` 值比较，缺一即抛（`dist/index.js:757-767`）。但通过校验后它走 `#invokeToolByName(tool.name, …)`（`:768`）→ `this.#tools.get(toolName)`（`:804`），**按名查内部注册表，传入对象的身份不参与调用** —— 所以值相等的重建描述符同样能执行。实现仍然原样传递（没有任何理由重建），单测因此用 `toEqual` 而非 `toBe`。（这条是 code-review 推翻其子 agent 结论后校正的，见 §12。）

### 取证 C：原生 Chrome 顶层 `getTools()` 含同源子框架工具，但它们在本框架**不可执行**

polyfill 的 `window` 值比较直接抛 "Tool not found"。relay 自己的处理是宿主页面优先（`selectRelayTools`，`shared.ts:59-75`）—— 对标：查找与目录都**优先 same-document**，目录再按名去重。

### 取证 D：schema 必须手写

SDK 自身由 tsup 打包（`tsup.config.ts`），不经 vite/webpack 插件，拿不到 `__webmcpSchema` 注入。直接构造 `WebMcpToolSchema` 字面量交给 `buildToolConfig`（`registry.ts:835`）。

### 取证 E：`originalName` 语义

relay server 模式下 `originalName: primaryProvider.tool.name`（页面原始名），公开的 `name` 才经 `buildPublicToolName`（sanitize + 多 tab 加 `_<4位tabId>` 后缀）（`mcpRelayServer.ts:189`、`:269-280`、`naming.ts:50-66`）。所以 `name` 传 `originalName` 是对的。

### 取证 F：旧 relay `webmcp_call_tool` 逐字原文（`git show 52928a62^`，一手核实）

- 描述：`'Call a WebMCP tool registered by a connected browser page. Use webmcp_list_tools first to see available tools and their input schemas.'`（`mcpRelayServer.ts:320-323`）
- 入参：`name: z.string().describe('The tool name to call. Use webmcp_list_tools to see available tool names.')`；`arguments: z.record(z.string(), z.unknown()).optional().describe('Arguments to pass to the tool as a JSON object. Check the tool inputSchema from webmcp_list_tools for expected fields.')`（`staticToolSchemas.ts:8-19`）
- annotations：`{ readOnlyHint: false }`
- 未命中文案（`mcpRelayServer.test.ts:697-735` 断言）：`Tool "<name>" not found` + `Available tools:` + 清单；零工具时 `No tools are currently available`；`isError: true`

→ description 以它为底本改写（"a connected browser page" → "the current page"，补"当客户端工具列表已过期时用它"），入参描述沿用其指向 `webmcp_list_tools` 的写法并补一句"`name` 用 `originalName` 字段的值"，错误文案沿用三段式。**不自己发明措辞。**

## 4. 实现

### 4.1 新增 `packages/webmcp-sdk/src/builtinTools.ts`

```ts
export const CALL_TOOL_NAME = 'webmcpCallTool';
const BUILTIN_OWNER = { scope: 'global', scopeId: 'builtin' };

const CALL_TOOL_SCHEMA: WebMcpToolSchema = {
  title: 'Call a page tool',
  description: /* 以取证 F 的旧 relay 描述为底本改写 */,
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '页面原始工具名（webmcp_list_tools 的 originalName），不是客户端看到的改写名' },
      arguments: { type: 'object', description: '目标工具入参 JSON 对象；无参工具可省略' },
    },
    required: ['name'],
  },
};
```

`executeCallTool(input)` 顺序（能力检查与取工具表**必须在** name 校验之前，因为第 3、6 步的错误文案要带目录，而目录来自第 2 步）：

1. `getModelContext()`；`getTools` / `executeTool` 任一缺失 → `isError` + 明确原因。
2. `await mc.getTools()`（try/catch）→ 按名去重、**same-document 优先**。
3. `name` 非字符串或 trim 后为空 → `isError` + 目录。
4. `name === CALL_TOOL_NAME` → `isError` 自递归守卫（**不**调 executeTool）。
5. `arguments` 存在但不是非数组纯对象 → `isError`（模型常传字符串，前置拦掉比让轴一抛 `TypeError` 清楚）。
6. 按名 find；未命中 → `isError` + `Tool "X" not found` + `Available tools:` 目录；零工具 → `No tools are currently available`。
7. `await mc.executeTool(target, args ?? {}, { signal })`（try/catch，透传执行取消信号）→ 抛错转 `isError`；返回 `null` → `isError` 导航中断。
8. `JSON.parse` 容错后**原样返回内层工具的返回值，不在页面内归一**（理由见 §12.1）。parse 失败说明是原生 declarative 工具的纯文本返回值，原样返回字符串。
9. 全程**不 throw**，对齐 `registerGlobalTools` 的"SDK 入口不向调用方传播浏览器 API 异常"（`registerGlobalTools.ts:65-67`）。

其他：

- 目录构建复用 `toWidgetToolDescriptor`（`model-context.ts:294`，顺带 coerce 字符串 schema、畸形返回 null 即丢弃），只挑 `name`/`description`/`inputSchema` 三键，**排除自身**，按名去重，**紧凑 JSON 不缩进**（见 §12.4）。
- 错误结果统一 `{ content: [{ type: 'text', text }], isError: true }`（既有约定，`registry.ts:608-611`）。
- `ensureBuiltinTools(): boolean`：**幂等靠 `getActiveToolNames().includes(CALL_TOOL_NAME)`（`registry.ts:860`）判断，不引入模块级 flag**（对齐 `registry.ts:236-238` "缓存放宿主对象而非模块级变量，跨用例会泄漏"的既有取向；`clearRegistry()` 清空 activeTools 后自然可重注册）。已注册 return false；否则 `registerEntry(name,'global','builtin')`（`registry.ts:909`）+ `registerScopedTool(buildToolConfig(...), BUILTIN_OWNER)`（`registry.ts:961`）+ `notifyToolsChanged()`（`registry.ts:1220`），return true。
- `configureBuiltinTools({ callTool })`：写内部开关，然后
  - **关闭**：`unregisterScopedTool`（`registry.ts:1072`）→ `unregisterEntry`（`registry.ts:930`）。不显式调 `notifyToolsChanged` —— 唯一 owner 时 `unregisterScopedTool` 的 abort 链路（`registry.ts:1008-1013`）会自行通知。
  - **开启**：若 `isModelContextAvailable()`，则 `patchModelContextEventSupport()` + `ensureBuiltinTools()` **立即补注册**；宿主还不存在时（SSR / 应用尚未初始化）什么都不做，交给下一个注册入口。理由见 §12.2。
  - 因此与调用顺序无关：先关后注册、先注册后关、关掉再打开，三种时序都成立。

### 4.2 改动清单

| 文件 | 改动 |
| --- | --- |
| `src/builtinTools.ts` | **新增** |
| `src/registerGlobalTools.ts` | `patchModelContextEventSupport()`（`:36`）之后、遍历 toolMaps 之前插入 `ensureBuiltinTools()` |
| `src/useWebMcpTools.ts` | effect 内 `patchModelContextEventSupport()`（`:94`）之后插入 `ensureBuiltinTools()` |
| `src/types.ts` | 新增 `WebMcpBuiltinToolsOptions { callTool?: boolean }` |
| `src/index.ts` | 主入口导出 `configureBuiltinTools` 与 `WebMcpBuiltinToolsOptions`。**`CALL_TOOL_NAME` 不进主入口**，但从 `src/testing.ts` 导出——而 `./testing` 是 `package.json` 里已发布的 entry point（tsup 也打 dts），所以它**确实属于对外 API 面**，只是不在主入口。集成测试需要它来过滤内置工具 |
| `src/testing.ts` | 导出 `configureBuiltinTools` 与 `CALL_TOOL_NAME` |
| `src/registry.ts` | 把已有 `describeError`（`:723`，当前模块私有）改为 export，复用不另写 |
| `src/__tests__/setup.ts` | 全局 `beforeEach` 关掉内置工具（理由见 §11.2） |
| `src/__tests__/host-helpers.ts` | `teardownHost()` 同样关掉，而不是复位成生产默认 |
| `packages/webmcp-sdk/README.md` + `README.en.md` | 新增"内置工具"章节：何时开/如何关、`name` 传 `originalName`、配合 relay `webmcp_list_tools`、保留名、**客户端快照前提**、与 relay 静态工具的来源区分 |
| 根 `README.md` | 「在 MCP 客户端里会看到什么」（`:308`）把 relay 3 个静态工具与 nexus 自带 `webmcpCallTool` **分表列出并注明来源** |

**不动**：`registry.ts` 的注册/注销/双轴归一逻辑、构建插件、demo 业务代码、DebugPanel（走 `getActiveToolStates()`，新工具自动出现在"全局"分组，scope=`global`、scopeId=`builtin`）。

## 5. 补充的遗漏（超出原始需求）

1. `executeTool` 返回字符串，必须 parse；parse 后**原样上交、不在页面内归一**（取证 A + §12.1）。
2. 内层 `isError: true` 透传、`null`（导航中断）、非 JSON 纯文本三种结果形态。
3. **自递归守卫**：`name === 'webmcpCallTool'` 时不能真的去 executeTool 自己（会多绕一跳并返回一条费解的"空 name"错误）。
4. `arguments` 类型前置校验。
5. `getTools` 抛错 / 宿主无 `executeTool` / 工具体抛错 → 一律 `isError`，绝不向宿主传播异常。
6. **same-document 优先 + 目录按名去重**（取证 C）：原生 Chrome 上子框架同名工具会让 `find()` 命中一个不可执行的目标。
7. 目录排除自身；零工具给 `No tools are currently available` 而非空目录。
8. **保留名冲突语义**：dispatcher 先注册，用户同名工具会被 `registerEntry` warn 且 dispatcher 胜出（`registerScopedTool:966-971` 首注册者 config 胜出）。README 标注保留名。
9. **运维前提（最容易漏、漏了整个功能无效）**：客户端启动快照必须**已包含** `webmcpCallTool`。顺序是「起 relay → 开页面并确认连上 → 再开/重开客户端会话」。页面后开则连逃生口都不在快照里。README 必须显式写。
10. 目录只反映**当前这一个 tab**；多 tab 时客户端看到 `webmcpCallTool_<tabId>`，各 tab 的 dispatcher 与目录彼此独立（relay 负责路由，页面无需处理，但文档要说清）。
11. **幂等**：`registerGlobalTools` 多次调用（多入口 / HMR）不得重复注册。
12. 错误文案**以旧 relay 三段式为底本**（取证 F），不自己发明措辞。两处有意偏离：零工具文案加了尾巴 `No tools are currently available on this page.`（旧版无 "on this page"），未命中文案在目录后追加了一句纠正提示（`DIRECTORY_HINT`），明确要页面原始名而不是客户端看到的改写名——旧 relay 不需要这句，因为它的 name 就是公开名。
13. 版本与发布不在本次范围（demo 走 `workspace:*`）；要发版是 minor bump + `scripts/publish.sh`。

## 6. 单测

`src/__tests__/builtinTools.test.ts` 新增 + `registerGlobalTools.test.ts` 扩几条。复用 `host-helpers.ts` 的 `installFakeHost`/`makeObjectEraHost`/`makeStringEraHost`/`makePolyfillHost`/`makeModernHost`/`makeRegisteredTool`/`teardownHost`。

**命中与规范化**

1. 命中 → `executeTool` 收到 `(目标对象, args)`，返回 `{content:[{type:'text',text:'{"ok":true}'}],isError:false}`。
2. **内层已是 CallToolResult 且 `isError:true` → 原样透传，`isError` 保持 true**（防双层包裹/丢错误的回归锁，对应取证 A）。
3. 内层返回普通对象 → text 是其 `JSON.stringify`。
4. 内层返回非 JSON 纯文本 → text 原样，`isError:false`，不炸。
5. `arguments` 省略 → `executeTool` 收到 `{}`。

**失败路径**

6. `executeTool` 返回 `null` → `isError` + 导航中断文案。
7. `executeTool` 抛错 → `isError`，文案含工具名与错误。
8. `getTools()` 抛错 → `isError`，不 throw。
9. 宿主无 `executeTool`（`makeModernHost`）→ `isError` + 明确原因，不 throw。

**目录与入参守卫**

10. 未命中 → `isError`，text 含 `Tool "<name>" not found` 与 `Available tools:`，目录含 `name`/`description`/`inputSchema` 三键，**不含自身**。
11. 零工具 → `isError` + `No tools are currently available`。
12. `name` 缺失/空串/非字符串 → `isError` + 目录，`executeTool` 未被调用。
13. `name === 'webmcpCallTool'` → `isError`，`executeTool` 未被调用。
14. `arguments` 是字符串/数组 → `isError`，`executeTool` 未被调用。
15. string-era 宿主（`makeStringEraHost`）→ 目录里 `inputSchema` 已是对象（轴二已 coerce）。
16. 同名跨 document 工具 → 命中 same-document 那一个。

**注册与开关**

17. **不依赖 `registerGlobalTools`**：只跑 `useWebMcpTools` 挂一个工具 → activeTools 同时含 `webmcpCallTool` 与该工具，`getActiveToolStates()` 里 scope 为 `global`。
18. `registerGlobalTools(tools)` → 两者都注册；schema 固定 `required:['name']`、properties 只有 `name`/`arguments`。
19. 幂等：重复调用/挂载 → 宿主 `registerTool` 对 `webmcpCallTool` 只调用一次。
20. `configureBuiltinTools({callTool:false})` **先关后注册** → 不注册。
21. **先注册后关** → 反注册生效。

## 7. 验收

### 7.1 第一段：页面侧（可自动化）

```bash
pnpm install && pnpm build:sdk
cd packages/webmcp-sdk && pnpm test     # 上面 21 条
pnpm dev                                # demo，http://localhost:5173
```

浏览器控制台做**红绿反证**（不靠"看起来对"）：

- 绿：DebugPanel（`Cmd+\`）在 `/`、`/todos`、`/editor`、`/form` **四个路由都**列出 `webmcpCallTool`，scope=全局。
- 绿：`/todos` 下执行
  `mc.executeTool((await mc.getTools()).find(t=>t.name==='webmcpCallTool'), {name:'listTodos',arguments:{limit:3}})`
  → parse 后 `isError` false/缺省，text 里是 3 条待办。
- 红（同页同时刻）：`{name:'getCanvasSnapshot'}`（画板页工具，此刻已卸载）→ `isError:true` 且目录**只有待办页工具**，证明目录实时按页取、不是陈旧快照。
- 红：`{name:'listTodosXXX'}` → `isError:true` + `Available tools:` 含 `listTodos`，证明自我纠正链路可用。
- 红：`{name:'webmcpCallTool'}` → `isError:true`，无二次调用痕迹。
- 红：`{}`（无 name）→ `isError:true` + 目录。

### 7.2 第二段：relay × 客户端（人工）

前置：`npx -y @mcp-b/webmcp-local-relay@latest`（Node 22+）→ `pnpm dev` → 打开 `http://localhost:5173/` 确认已连上 → **重开一个客户端会话**（让启动快照含 `webmcpCallTool`）；给 `embed.js` 加 `data-debug` 便于看 `[webmcp-relay-embed]` 日志。

| # | 逐字 query | 通过判据 |
| --- | --- | --- |
| 1 | 「调用 webmcp_list_tools，把每个工具的 name 和 originalName 都列出来」 | 含 `webmcpCallTool`；此刻**不含** `listTodos`（还没导航） |
| 2 | 「用 navigate 工具跳到 /todos」 | 浏览器路由变为待办页 |
| 3 | 「列出前 3 条待办」 | Agent 走 `webmcpCallTool({name:'listTodos',arguments:{limit:3}})` 返回数据；**不得**答"没有这个工具" |
| 4 | 「调用 webmcpCallTool，name 传 listTodosXXX」 | `isError` + `Available tools:` 目录，Agent 自行改名重试 |
| 5 | 「创建一条待办：标题 测试代调，优先级 high」 | 页面真的多出一条（破坏性方向也要通） |
| 6 | **反证**：不重开会话，「直接调用 listTodos 工具」 | 仍失败 —— 证明阻塞层确实在客户端快照，而不是本方案没生效 |

日志 grep：`[webmcp-relay-embed]` 应见 `webmcpCallTool` 的 executeTool 往返；页面控制台不应出现新的 `[webmcp]` warn。

## 8. 兼容与回滚

- **纯增量**：不改注册/注销/双轴归一逻辑，不改宿主对象上的任何包装，不改构建插件产物格式，既有工具的注册路径与名字完全不动。
- 唯一行为面变化：宿主多出一个 `webmcpCallTool`，会被 relay 上报、被 DebugPanel 列出、被 `pushToolsToWidget` 推给第三方 widget iframe（既有全量推送语义，无特殊处理）。
- **回滚**：运行时 `configureBuiltinTools({ callTool: false })`（含已注册后反注册）；代码层 revert 本次提交即可，无数据迁移、无 schema 变更。
- 保留名风险：用户同名工具会被 dispatcher 覆盖（有 console.warn），极低概率，README 标注。
- provenance 混淆风险（会被当成 relay 的工具）：靠 description 首句 + README 分表缓解（决策 3）。

## 9. 明确不做

不做配套 list 工具（relay 的 `webmcp_list_tools` 已覆盖发现）；不做多 tab 特殊处理（relay 的 tabId 后缀路由已覆盖）；不改 relay / polyfill / 依赖版本；不发版、不 commit。

## 10. 实施顺序

1. `src/builtinTools.ts`（新增）
2. `src/registry.ts` 导出 `describeError`
3. `src/types.ts` 加 `WebMcpBuiltinToolsOptions`
4. `src/registerGlobalTools.ts` / `src/useWebMcpTools.ts` 接入 `ensureBuiltinTools()`
5. `src/index.ts` 导出
6. 单测 21 条
7. `pnpm build:sdk && pnpm test`
8. 两份 SDK README + 根 README
9. demo 页面侧红绿反证（§7.1）
10. 交人工跑 relay × 客户端第二段（§7.2）

## 11. 实施记录（2026-10-15，与原方案的差异与新发现）

### 11.1 新发现：宿主 `getTools()` 按工具名字典序排序，不反映注册顺序

polyfill 5.1.0 的 `getTools()` 结尾有 `.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)`（`dist/index.js:753`）；Chrome 155 原生实测同样输出字典序（21 个工具 a→w）。

**影响**：「内置工具早于用户工具注册」这个性质**只能在 SDK 侧断言**，不能在宿主工具表上断言。我最初在 demo 端到端用例里写了 `names.indexOf(CALL_TOOL_NAME) < names.indexOf('listTodos')`，实测红（宿主返回 `['listTodos','webmcpCallTool']`），已改为断言 `getActiveToolStates()[0].name === CALL_TOOL_NAME`；SDK 侧的注册顺序由 `registerGlobalTools.test.ts` 用宿主 `registerTool` 的调用序锁定（mock 是同步记录，确定性的）。

注意这**不影响**本方案的立论：客户端快照关心的是"启动时它在不在"，不是它排第几。

### 11.2 测试隔离策略（原方案未覆盖）

既有套件里有 45 条断言测的是**用户工具**契约（宿主 `registerTool` 的精确调用次数、`activeTools` 的精确名单、`mock.calls[0][0]` 就是刚注册那个）。内置工具默认开启会让它们整体偏移一位。逐条改断言等于把索引位移焊进测试、日后每加一个内置工具都要再改一遍，所以改为集中隔离：

- `src/__tests__/setup.ts` 加全局 `beforeEach` 关掉内置工具（开关是模块级状态、初值为生产默认「开」，每个文件第一个用例需要它）。
- `host-helpers.ts` 的 `teardownHost()` 也关，**而不是**复位成生产默认：有用例会在测试中途调 `teardownHost()` 再装一个假宿主，若复位成「开」，中途之后注册的内置工具会污染该用例后半段的名单与 widget 推送断言（实测 3 条）。
- demo 的 `webmcp-upgrade.test.tsx` 顶层 `beforeEach` 同样关掉。
- 内置工具的行为由两处显式打开后覆盖：`builtinTools.test.ts`（假宿主，28 条）与 `webmcp-upgrade.test.tsx` 末尾新增的 describe（真实 polyfill，8 条）。

### 11.3 超出原方案补的两项

- **透传执行取消信号**：handler 把宿主给的 `options.signal` 转发给内层 `executeTool`，对齐 `types.ts:13`「SDK 仍无条件透传，属零成本的向前兼容」的既有取向。polyfill 5.1.0 不转发 signal，原生 Chrome 会。
- **真实 polyfill 端到端用例 8 条**：原方案的 21 条单测全部基于假宿主。demo 侧新增的这组直接跑真实 polyfill 5.1.0，是取证 A 那条双层序列化链路唯一的端到端回归锁（其中「内层 `isError` 穿过两层序列化后仍然是 `true`」是核心那条）。

### 11.4 §7.1 页面侧验收：已执行，全过

宿主档位是 **Chrome 155.0.0.0 原生**（不是 polyfill）：`__isWebMCPPolyfill === false`、`__webmcpNexusInputShape === 'object'`、双轴包装在位、`Object.keys(document.modelContext)` 仍为 `[]`（WebIDL 保真不变量未破）。加上 demo 验收套件跑的真实 polyfill 5.1.0，**两档宿主都覆盖到了**。

| 检查 | 结果 |
| --- | --- |
| 四个路由都含 `webmcpCallTool` | ✅ `/`、`/todos`、`/editor`、`/form` 宿主工具数 21/14/25/7 |
| 目录始终排除自身 | ✅ 目录长度恒为 20/13/24/6 = 宿主工具数 − 1 |
| 绿：`/todos` 上 `{name:'listTodos',arguments:{limit:3}}` | ✅ `isError` 缺省，返回 3 条真实待办 |
| 红：`{name:'getCanvasSnapshot'}`（跨页、已卸载） | ✅ `isError` + 目录只剩 13 个待办页工具，画板工具全部消失 → 目录实时按页取，不是快照 |
| 红：`{name:'listTodosXXX'}` | ✅ `isError` + `Available tools:` 含 `listTodos` |
| 红：`{name:'webmcpCallTool'}` | ✅ `isError` + `cannot call itself`，未二次进入宿主 |
| 红：`{}` | ✅ `isError` + `Missing required argument "name"` + 目录 |
| DebugPanel（`Cmd+\`） | ✅ 「全局」分组显示 `webmcpCallTool`（全局 2 = navigate + 它，页面/组件 19） |
| 控制台零新增 `[webmcp]` 告警 | ✅ 控制台里的 `[WebMCP]` DEBUG 行来自 Chrome 原生实现与浏览器扩展，非 nexus；其中 `Tool "webmcpCallTool" started execution.` → `Tool "listTodos" started execution.` 正是代调链路的直接证据 |

**未执行**：§7.2 relay × 客户端第二段（需人工在 MCP 客户端里重开会话）。

### 11.5 质量门禁

- 全仓 **370 个测试通过**（webmcp-core 99、webmcp-sdk 217、vite-plugin 16、webpack-plugin 17、demo 21），零回归。新增 SDK 37 条（`builtinTools.test.ts` 28 + `registerGlobalTools.test.ts` 5 + `useWebMcpTools.test.ts` 4）+ demo 端到端 8 条。
- `pnpm build:sdk` 通过（含 dts）；demo `tsc -b` 通过。
- `pnpm lint` **基线本来就是红的**（161 errors / 2 warnings，例如 `polyfill.test.ts` 单文件 33 条 `no-explicit-any`）。本次**零新增**：新增的 `builtinTools.ts` / `builtinTools.test.ts` / `setup.ts` 完全干净；改动文件里报错的行号（`registerGlobalTools.test.ts` 最大 645、`useWebMcpTools.ts` 的 50/52/63/67）全在本次插入范围之外的既有代码上。

### 11.6 一处 TS 坑（已修）

`ToolOwner` 没有从 `registry.ts` 导出，所以 `BUILTIN_OWNER` 只能靠字面量推断对上 `ToolScope`。`const BUILTIN_SCOPE = 'global'` 会 widen 成 `string`，dts 构建报 TS2345（`Type 'string' is not assignable to type 'ToolScope'`）。必须写 `'global' as const`。

## 12. code-review 后的修订（2026-10-15 第二轮）

审查结论：8 个问题 + 4 个低把握项，**无 P0/P1 级正确性或安全缺陷**；轴一入参链路、自递归守卫、保留名语义、组件卸载不带走内置工具，审查方逐条核实成立。

审查方还**推翻了自己一个子 agent 的结论**（"`builtinTools.test.ts:70` 该用 `toBe` 而非 `toEqual`，否则身份契约是假绿"），一手证据是 polyfill `dist/index.js:768` 走 `#invokeToolByName(tool.name)`、`:804` `this.#tools.get(toolName)` —— 按名查表，传入对象的身份不参与调用。我复核后接受这条更正，并据此把取证 B 从"必须原样喂回"收窄为"原样喂回是充分条件"。

### 12.1 已改：dispatcher 不再对成功结果做二次归一（审查 #3，P2）

原实现在 handler 里调 `normalizeToCallToolResult`。问题是 nexus 的 `isCallToolResult`（`registry.ts:30-44`）只认 text/image/resource 三种 content 类型、且只看首元素，而上游 `isContentBlock`（`webmcp-ts-sdk/src/schema.ts`）认 6 种（另有 audio / resource_link）并逐个校验必填字段。内层工具返回 `{content:[{type:'resource_link',…}], isError:true}` 会被判成"不是 CallToolResult"而重新包成 text、`isError` 抹成 `false` —— 正是取证 A 最想防的那类静默事故。同时 relay 那层更宽的归一被短路：丢 `structuredContent`，且 relay 对 `resultType:'input_required'` 的特判（`webmcp-local-relay/src/browser/shared.ts:44-49`）不再生效。

**这不是预存问题**：`normalizeToCallToolResult` 在本次改动前全仓只有一个调用方，且被 `if (!hasCallTool && …)` 关在旧宿主 relay 2.x 合成面里（`registry.ts:26-28` 的注释自己写着"仅用于旧宿主档"）。本次把它变成了所有宿主档、每次代调的必经之路，属于"从不可达变为可达"。

**改法**（采审查建议的方案①，比"对齐 6 种 content 类型"的方案②更简单也更通用）：handler 只 `JSON.parse`，把内层工具的返回值**原样上交**，由消费方用它那层更宽的规则收尾；只有失败路径才由 nexus 构造 `{content, isError:true}`。净效果是**代调结果与客户端直调该工具的结果逐字一致**，demo 端到端用例已改成直接断言这个等式（`expect(viaDispatch).toBe(direct)`）。两份 README 里那句无条件声称也已按新机制改写。

### 12.2 已改：重新开启立即生效（审查 #4，P2）

原实现 `configureBuiltinTools({callTool:true})` 走进 `if (next) return` 什么都不做，要等下一次 `registerGlobalTools` 或组件重挂载才补注册，而 `ensureBuiltinTools` 没有对外导出。应用若启动时只注册一次、之后没有组件重挂载，一个 disable→enable 循环就会让 `webmcpCallTool` 永久消失。现在 enable 分支在 `isModelContextAvailable()` 为真时立即 `patchModelContextEventSupport()` + `ensureBuiltinTools()`；宿主还不存在时**不**装 polyfill（交给下一个入口），避免裸调 ensure 在无宿主环境往 activeTools 塞幽灵记录。

副作用（已处理）：enable 分支现在会顺手 patch 宿主，于是 `host.getTools` 被换成不可枚举的轴二包装版、原 mock 被遮蔽。单测必须自己持有原始 mock 引用（`getToolsMock`），不能再通过 `host.getTools.mockXxx` 改行为。

### 12.3 已补：三条缺失的测试（审查 #2 / #5 / 低把握项 d）

- **生产默认值此前零覆盖**（审查 #2，P1）：全局 `beforeEach` 关、`teardownHost()` 也关，而所有期望注册的用例都先显式开启，于是 `let callToolEnabled = true` 这个初值从未被观察到 —— 谁把默认值改坏，全仓测试照样全绿，而客户端快照的逃生口整体消失（那正是这个功能存在的全部理由）。新增一条用 `vi.resetModules()` + 动态 import 取全新模块实例、不做任何 configure 直接 `registerGlobalTools`，断言宿主收到了 `CALL_TOOL_NAME`。同时把原名叫「默认注册 webmcpCallTool」实则第一步就显式开启的用例改名，并把两个入口套件的 `beforeEach` 改成「先翻开关、再装宿主」——否则内置工具是 beforeEach 注册的，测不到入口自己会不会注册。
- **宿主侧摘除此前无端到端断言**（审查 #5，P2）：spec §8 说的唯一运行时回滚手段，原来只断言了 `getActiveToolNames()`（SDK 内部镜像）。而 polyfill 5.x 没有 `unregisterTool`，摘除完全依赖 `controller.abort()` → polyfill 注册时自己挂的 signal hook，是一条纯上游行为链路。demo 的真实 polyfill 套件里补了「先注册后关 → `host().getTools()` 里真的没有它」与「关掉再打开 → 立即回到宿主工具表」两条。
- **入口早退顺序**（低把握项 d）：补了「宿主不可用时即使开关是开的也不注册」。注意 jsdom 下这个前提**必须靠 `vi.stubGlobal('navigator', undefined)` 才造得出来** —— `registerGlobalTools` 第一步 `ensureModelContextPolyfill()` 在没有任何 context 时会自己装一个 polyfill，于是 `isModelContextAvailable()` 恒为真、早退分支不可达。既有那条「document/navigator 都没有 modelContext 时静默跳过」用例只能断言旧假宿主的 spy 没被调用，原因就在这里。

### 12.4 已改：目录改紧凑 JSON（审查 #6，P3）

`JSON.stringify(directory, null, 2)` 的 2 空格缩进对模型零收益，却把载荷放大三到四成，还与代码里自己写的"多给只是烧 token"矛盾。改为紧凑 JSON。**没有加条数上限**：截断有可能恰好藏掉模型要找的那个工具，比多花 token 更糟；且 relay 的 `webmcp_list_tools` 同样不设上限，错误文案里已经把模型指向它了。

### 12.5 已补：same-document 优先的两个方向（审查 #7，P3）

原来只测了 `[crossDocument, sameDocument]` 一种顺序，而 `dedupeByName` 的正确性同样依赖"已持有 same-document 时不被后来的 cross-document 替换"。改成 `it.each` 两种顺序都断言 `toBe(sameDocument)`。原生 Chrome 顶层 `getTools()` 里子框架工具排在前还是后并无保证。

### 12.6 判定为不改的项

| 审查项 | 判定 | 理由 |
| --- | --- | --- |
| #1 把被姊妹文档否认的调研报告从暂存区摘出 | **交给用户决定，未动** | 证据已一手复核成立（该文档 `:10` 逐字写着"25 条核心断言全部确认…0 条被驳、0 条验证失败"，姊妹文档 `:292` 逐字写着"编造的验证统计…该文件的内容一律未采信"）。但这两个文档是本次改动开始前就由用户 stage 的，既定纪律是不动用户已 stage 的内容；且真正的处置（删除或重写 264 行报告）不可逆、属用户判断 |
| 低把握项：目录 `JSON.stringify` 无 try/catch 兜底 | 不改 | 触发条件是某工具的 `inputSchema` 含循环引用或 BigInt。schema 来自构建插件生成的 JSON；第三方注册也得先过宿主的 `serializeInputSchema`，循环引用在注册阶段就炸了。属"不会发生"的场景，按项目纪律不加防御代码 |
| 低把握项：用户抢注同名工具后再关内置工具 → config 提升错位 | 不改 | 需要用户无视保留名告警才会走到；正确修法涉及 `registerScopedTool` 的 owner 提升语义，超出本次范围。README 已标注保留名 |
| 低把握项：`toolchange` 派发次数未在生产配置下验证 | 不改 | demo 跑的是真实 polyfill（现代宿主），而 `notifyToolsChanged` 在现代宿主档根本不派发（派发责任在宿主），补这条只能验到"polyfill 每次 registerTool 自派发一次"，既有单工具用例已覆盖 |
| annotations 三个 hint 全 false | 不改 | 决策 2 已裁定，审查方也未找到反证 |

### 12.7 第二轮门禁

全仓 **378 个测试通过**（core 99 / sdk 223 / vite-plugin 16 / webpack-plugin 17 / demo 23），比第一轮 +8。`pnpm build:sdk` 通过含 dts，demo `tsc -b` 通过。`pnpm lint` 仍是既有基线红（161 errors），本次零新增。demo 页面侧红绿反证已在 Chrome 155 原生档重跑（见 §11.4，成功路径的返回形态随 §12.1 改变，已重新确认）。
