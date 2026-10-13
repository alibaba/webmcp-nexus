# Changelog

本文件记录 webmcp-nexus 全部 npm 包的变更。四个包（`webmcp-nexus-core`、
`webmcp-nexus-sdk`、`vite-plugin-webmcp-nexus`、`webpack-plugin-webmcp-nexus`）
版本锁步发布，因此这里只有一份统一的变更日志。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循
[语义化版本](https://semver.org/lang/zh-CN/)。版本标题使用裸版本号（`## 1.0.0`），
git tag 使用 `v` 前缀（`v1.0.0`），两者有意区分。

`<!-- manual:start -->` 与 `<!-- manual:end -->` 之间的内容由人工撰写，
`scripts/changelog.mjs` 不会覆盖；`<!-- auto:start -->` 与 `<!-- auto:end -->`
之间的内容由脚本从 git log 自动生成。

## 1.1.1 - 2026-10-13

<!-- manual:start -->

选 minor（`1.1.1`）而非 patch（`1.0.1`）：本次不止修复 Chrome 155 / relay 6.x 下的工具执行
失败，还新增了一条 1.0.0 没有的对外保证（业务代码传对象或字符串均可、`getTools()` 一律返回
对象 `inputSchema`），并**修订了 1.0.0 的一条已发布兼容性承诺**（见「行为变化」首条）。
SDK 对外 API 只增不改，无破坏性变更，业务代码零改动。

### 新增

- **双轴形态归一层**：吸收 Chrome 155 的 `executeTool` 入参形态变更与 relay 6.x 对字符串
  `inputSchema` 的不容忍。
  - **轴一**（`executeTool` 入参）：按宿主实际期望转换。业务代码与 relay 传对象或 JSON
    字符串都可以，无需感知宿主代际；四档宿主 × 两代 relay 的组合全部可执行。
  - **轴二**（`getTools()` 的 `inputSchema`）：逐工具 `typeof` 分支，把字符串 schema 转成
    对象。这既是上游 `webmcp-types` 明文要求的写法（"Consumers that support both
    generations must branch on `typeof`"），也是 relay 6.x 能发现工具的前提 —— relay 6.x 在
    **发现阶段**就丢弃字符串 schema 的工具，Agent 侧表现为静默零工具，比执行失败更隐蔽。
- **形态判定是确定性的**：不采用「先按对象调、失败再按字符串重试」—— 那无法区分「形态错」
  与「工具体自己抛的 TypeError」，误判会让有副作用的工具执行两遍。改为扫描 same-document
  工具的 raw schema 形态；结论只在**确定**时写入宿主级传感器（write-once），全量兜底得出的
  非确定结论只用于本次调用、不缓存。
- **判定退化的诊断面包屑**：无探测源 / `getTools()` 抛错 / 无可用样本三种退化路径各留一条
  按宿主去重的 `console.warn`，与既有 `handleRegistrationFailure` 按 `error.name` 分流成
  五种带修复指引告警的诊断标准对齐，不再静默落默认值。
- 新增 `shape-compat.test.ts` 31 例，覆盖四档宿主 × 两代 relay 的形态矩阵、重复 patch 去重、
  畸形 schema 原样透传、并发首调只探测一次、归一属性不可枚举等。SDK 单测现共 180 例，
  四包合计 312 例全过。

### 行为变化

- **修订 1.0.0 的「现代宿主零 patch」承诺。** 1.0.0 曾承诺 polyfill 5.x / Chrome 149+ 上
  「nexus 不改写宿主对象」。自本版起，SDK 会在这些档位的 `getTools` / `executeTool` 上装形态
  归一包装。该承诺的**可验证判据仍然成立且有测试锁定**：`Object.keys(document.modelContext)`
  仍为 `[]`、`{ ...document.modelContext }` 仍为 `{}`、`registerTool` 一律不包装（arity 仍为
  1）。不再成立的是「零 patch」这个表述本身。
- **Chrome 149–154 档 `getTools()` 的 `inputSchema` 从字符串变为对象。** 这是本版唯一可能
  影响既有代码的变化：若在业务代码里硬写 `JSON.parse(tool.inputSchema)`，该档会失败。上游
  `webmcp-types` 把它声明为 `InputSchema | string` 并要求 branch on `typeof`，按规范写的
  消费方不受影响；nexus 自己的 DebugPanel 与 widget 推送链路均已适配。
- **`executeTool` 对非法入参改为显式抛错。** 数组 / 标量 / 函数入参现在抛
  `TypeError: executeTool input must be an object`，而非原样透传给宿主 —— 透传会让工具体收到
  一个数组、解构出的命名参数全是 `undefined`，破坏性工具就在缺参状态下真的执行一遍。畸形
  字符串在对象档同理抛错，不静默降级成「零参数可调用」。
- **polyfill 档 `for...in` 不再产出 `getTools` / `executeTool`。** polyfill 5.1.0 刻意把原型
  方法设为 enumerable，而 own 非枚举属性会遮蔽 inherited 枚举属性。`Object.keys`、spread、
  `instanceof` 均不受影响；全仓零处 for-in 遍历 ModelContext。
- 首次 `executeTool` 可能触发一次宿主 `getTools()` 探测（并发首调只探一次），并多一个 await
  tick。

### 升级指引

- **业务代码零改动**：三个注册 API（`registerGlobalTools` / `useWebMcpTools` /
  `withWebMcpTools`）签名与行为不变，构建插件配置不变，依赖范围不变
  （`@mcp-b/webmcp-polyfill@^5.1.0`、`@mcp-b/webmcp-types@5.1.0`）。
- **relay embed 建议从钉 `@5` 改为跟随 `@latest`，且页面侧与本机 relay server 侧必须同策略**
  （server 版本在每个用户自己 MCP 客户端配置的 `npx -y @mcp-b/webmcp-local-relay@…` 里）。
  半钉半浮正是本次故障的成因：`@5` embed × `@latest`(6.0.0) server 会让全部工具执行失败。
  nexus 只控制得了 embed，钉任何固定版本都会让它成为错配关系中唯一固定的那一端。
- 直接消费 `document.modelContext.getTools()` 的代码（自建调试面板、自建 relay 集成）请按
  `typeof inputSchema` 分支，不要假定单一形态。

### 已知边界

- **Chrome 149–154 档的两条形态假设未在本机实证**（该档需 Origin Trial / flag，本机无该档位
  浏览器），依据是上游 `webmcp-types` 的类型声明与滚动发布说明；Chrome 155.0.8059.40 与
  polyfill 自持档已实测。若假设判错，行为退化为 1.0.0，不会更糟。
- 形态传感器是 write-once 的，判据依赖上游 `inputSchema` 对象化的滚动发布边界（上游自述该
  边界仍在上移）。上游再翻转时，改动局限在 `resolveInputShape` 与轴二包装体两处。
- `@latest` 的 embed 无 SRI，CDN 或上游被投毒即可在本源执行代码。这与「跟随最新版」互斥，
  demo 页场景已接受；自托管生产环境请自行评估。
- relay 7.x 若引入第三条形态轴，`@latest` 会静默失败且无版本可 bisect。
- polyfill 停在 5.1.0，不升 6.0.0 —— 那是迁移而非版本号变更（`initializeWebMCPPolyfill` /
  `cleanupWebMCPPolyfill` 已删除、`installWebMCP()` 无参数且无卸载），且升级也省不掉归一层：
  最难的原生 Chrome 149–154 档根本没有 polyfill 参与。该组合属上游支持矩阵之外，靠归一层
  吸收差异。

<!-- manual:end -->

<!-- auto:start -->
### 修复

- **webmcp-sdk**: normalize executeTool input and inputSchema shapes across host generations (8c1a4d3)
<!-- auto:end -->

## 1.0.0 - 2026-09-06

<!-- manual:start -->

首个稳定版。选 `1.0.0` 而非 `0.2.0`（semver 下 `0.x` 的 breaking change 只需 minor），
是因为本次是**协议层**的规范入口迁移，并以此宣告 SDK 对外 API 自此稳定。

### 破坏性变更（协议层）

- **规范入口从 `navigator.modelContext` 迁移到 `document.modelContext`**。跟进 2026-05-27
  WebMCP 草案（[webmachinelearning/webmcp#173](https://github.com/webmachinelearning/webmcp/issues/173)
  / [#184](https://github.com/webmachinelearning/webmcp/pull/184)）：Chrome 150 已废弃
  `navigator.modelContext`。SDK 内部全链路改为 document 优先、navigator 兜底，
  **业务代码无需任何改动**。
- **`@mcp-b/webmcp-polyfill` `^2.3.2` → `^5.1.0`**，并新增 `@mcp-b/webmcp-types@5.1.0`
  作为类型依赖（纯类型，不进浏览器产物）。
- **`registerTool` 现为异步**。polyfill 5.x 返回 `Promise<void>`，重名 / 空描述 /
  非法工具名 / 宿主准入被拒均以 rejection 返回而非同步抛错。SDK 已改为
  `void Promise.resolve(result).then(...)` 统一处理，**注册失败不再阻断 UI 渲染**，
  也不会产生 unhandled rejection。
- **宿主开始校验工具描述符**（polyfill 2.x 不校验）：空 `description` 与不匹配
  `^[A-Za-z0-9_.-]{1,128}$` 的工具名会抛 `InvalidStateError`；非 origin-isolated 文档抛
  `SecurityError`；Permissions Policy `tools` 被拒抛 `NotAllowedError`。SDK 与构建插件
  均已做兜底与校验左移（见下）。
- **`unregisterTool` 已从协议移除**（Chrome 148 起、polyfill 5.x 起），注销统一走
  `registerTool(tool, { signal })` 的 `AbortSignal`。仅 Chrome 146–147 原生档保留
  L2 注销兜底。
- **`@mcp-b/webmcp-local-relay` 需升到 5.x**。relay 5.x 的 `embed.js` 只读
  `document.modelContext` 且只认 `getTools()` / `executeTool()`；relay 2.x 仅在 polyfill
  自持 context 的浏览器（Chrome <146 / Firefox / Safari）下可用。

### 新增

- **`execute` 透传执行取消信号**：工具函数现在可以声明第二个参数
  `(params, { signal })`。现有单参工具函数**零改动**。
- **`@title` / `@untrusted` / `@consequential` 三个 JSDoc 标签**，分别映射到协议的
  `RegisteredTool.title`、`annotations.untrustedContentHint`、`annotations.consequentialHint`，
  与既有的 `@readonly` 同构。`__webmcpSchema` 从三字段扩为六字段（可选字段仅在有值时写入）。
- **构建期校验左移**：工具名不合法时 `pnpm build` 直接报错（而非静默产出不可注册的
  工具）；空 JSDoc 描述在构建期兜底为工具名并告警，使"产物即合法"。
- **运行期单点兜底**：空 `description` 回落为工具名；`default` 键与非法工具名被跳过且
  **不写入所有权镜像**，避免与宿主真实工具表分裂。
- **注册失败按 `error.name` 分流给出可诊断提示**（Permissions Policy / origin isolation /
  跨文档暴露 / 描述符非法），不再是一条泛化告警。
- **幽灵工具防护**：原生注册失败的工具不再出现在 widget 推送与 `getActiveToolConfigs()` 里。
  relay 5.x 每次调用前会重新 `getTools()` 按名查找，幽灵工具必然得到 `Tool not found`。
- **`webmcp-nexus-sdk/testing` 子入口**：导出 `clearRegistry` / `getActiveToolStates` /
  `getModelContext` / `isModernHost` 等测试钩子，不污染主 API 面。
- **根 `CHANGELOG.md` 与 `scripts/changelog.mjs`**：发布时自动从 git log 生成条目，
  人工撰写段用 `<!-- manual:start/end -->` 保护。
- demo 新增 13 例升级验收测试（用真实 polyfill 5.1.0，非 mock）；SDK 单测从 78 例增至 144 例；
  webmcp-core 从 71 例增至 97 例。

### 兼容性承诺

- **SDK 对外 API 只增不改**：`registerGlobalTools` / `useWebMcpTools` / `withWebMcpTools`
  的签名与行为保持不变，业务代码与构建插件配置均无需改动。
- **现代宿主零 patch**：polyfill 5.x / Chrome 149+（判据 `typeof getTools === 'function'`）上
  nexus 不再改写宿主对象，保持 polyfill 刻意维持的 "ModelContext instance has no own keys"
  WebIDL 保真不变量（`Object.keys(document.modelContext)` 为空、`registerTool.length === 1`）。
  旧宿主（Chrome 146–148 原生）保留全套 EventTarget 补齐、`listTools`/`callTool` 合成与
  事件桥接，且改用非枚举属性写入。
- `toolchange` 派发责任归还宿主：现代宿主上 nexus 不再手动派发，一次路由切换从 3 次降为 1 次。
- `inputSchema` 的 string / object / 缺键三种形态全部兼容，一律特征检测、不做浏览器版本嗅探。
- webpack 4 仍可解析：SDK 只 import polyfill 的**主入口**，不使用 `exports` 子路径。

### 已知差异

- `annotations.consequentialHint` 是 Chrome 153+ 的原生 annotation，
  `@mcp-b/webmcp-types@5.1.0` 尚未收录、polyfill 5.1.0 会丢弃它 → 仅原生 Chrome 生效。
- `execute` 的第二参 `{ signal }` 在 polyfill 5.1.0 下**不会**被转发（其内部是
  `tool.execute(args)` 单参调用，`executeTool` 的 `options.signal` 只用于 race 外层 promise），
  该能力仅原生 Chrome 提供。SDK 仍无条件透传，属零成本的向前兼容。
- abort 中断 in-flight execution 的行为分歧：polyfill 5.1.0 抛 `UnknownError: Tool unregistered`
  且**工具的副作用已经执行完毕**（`withAbortSignal` 只 reject 外层 promise，内层 execute 继续跑），
  Chrome 153+ 返回 `null` 且不中断。demo 的 DebugPanel 已把两种形态归一呈现。
- polyfill 5.1.0 会自动安装 declarative forms 支持（`<form toolname tooldescription>`、
  `SubmitEvent.agentInvoked` / `respondWith()`），并改写 `Element.prototype.attachShadow` 与
  `HTMLFormElement.prototype.submit`。这类工具由 polyfill 直接注册进宿主，**不经 nexus 的
  所有权镜像**，因此会出现在 `document.modelContext.getTools()` 与 DebugPanel 中，
  但不出现在 nexus 的 widget 推送里。
- `@mcp-b/global` **不可与 nexus SDK 同时引入**：它 import 即自动初始化，用 value 描述符把
  `document` / `navigator` 两个面替换为 `BrowserMcpServer`，会摧毁 nexus 的旧宿主 patch。
- relay 5.x 会把工具名 sanitize 为 `[a-zA-Z0-9_]`，多标签页同名时追加 `_<4 位 tabId>` 后缀。
  因此工具名应只用 camelCase，避免 `.` 与 `-`（详见 `skill/SKILL.md`）。
- relay 5.x 不支持转发 MCP 多轮 elicitation：工具返回 `{ resultType: 'input_required' }`
  会被转为错误结果。需要多轮交互的工具应拆成多个单轮工具。
- relay CLI 要求 **Node 22+**（`engines: node >= 22`）。

<!-- manual:end -->

<!-- auto:start -->
### 破坏性变更

- **webmcp-sdk**: 适配 document.modelContext 协议并升级 polyfill 至 5.1.0 (568a638)

### 新增

- **webmcp-sdk**: 适配 document.modelContext 协议并升级 polyfill 至 5.1.0 (568a638)
<!-- auto:end -->

## 0.1.14 - 2026-07-02

<!-- auto:start -->

### 修复

- **webmcp-core**: normalize Windows path separators in module identifiers (#4) (94535e0)
- **vite-plugin-webmcp**: fix glob \*\* regex and add unit tests (#3) (35148fb)
- **vite-plugin-webmcp**: normalize Windows path for include matching (#2) (a5d3393)

### 文档

- remove unpkg fallback CDN and unify to jsDelivr (179479d)
- replace npmmirror CDN with unpkg as alternative source (a6bb44c)

### 维护

- bump all packages to v0.1.14 (e4581ab)

### 其他

- 添加embed.js国内镜像 (af6afde)
<!-- auto:end -->

## 0.1.13 - 2026-06-25

<!-- auto:start -->

### 新增

- **demo**: add form page to demonstrate withWebMcpTools class component (7d52f97)
- **sdk**: add withWebMcpTools HOC for class component tool registration (0ef70d2)

### 修复

- **core**: prevent schema injection from breaking export default statement (82dc5df)
- **webmcp-sdk**: normalize Chrome 146+ native executeTool result to MCP CallToolResult format (d604a8c)

### 维护

- bump version to 0.1.13 (16ddfba)
<!-- auto:end -->

## 0.1.12 - 2026-06-23

<!-- auto:start -->

### 新增

- **demo**: 扩展画板能力并优化工具栏视觉 (1f971a1)
- **demo**: fix GitHub Pages routing, add toolchange event display, default debug panel open (4d71354)

### 修复

- **core**: debounce widget push and skip relay iframe to prevent duplicate notifications (41af13c)
- **core**: coalesce toolchange events via microtask batching (d8e7992)
- **core**: replace deprecated toolschanged event with standard toolchange (af27937)

### 文档

- **demo**: update drawLine tool description to clarify polyline usage (1fd050d)
- 新增移除 drawShapes 工具的迭代计划 (f8e67e4)

### 维护

- bump version to 0.1.12 (eb5b1ba)
- 添加 .qoder 到 .gitignore 并移除其 Git 跟踪 (a29909a)
- **repowiki**: 更新 RepoWiki 知识库索引与文档 (2f13ac4)

### 其他

- support webpack v4 (5682f7c)
<!-- auto:end -->

## 0.1.11 - 2026-05-31

<!-- auto:start -->

### 新增

- **demo**: add rich text editor page with Tiptap and 23 MCP tools (9de3bc8)
- **demo**: add canvas tools for full agent parity with user operations (ba486db)
- **demo**: wire TodoFormDialog to TodosPage (create + edit on click) (c141512)
- **demo**: rewrite CSS for top-tab layout with canvas and todos styles (bc1535b)
- **demo**: simplify global tools (remove project/tag queries, add canvas) (75fee80)
- **demo**: rewrite App.tsx with top tab nav and new routes (bbf1aaa)
- **demo**: add simplified TodoFormDialog (create/edit with datetime) (9755281)
- **demo**: simplify TodoStore (remove projects/tags) and create TodosPage (1558ef0)
- **demo**: add CanvasPage with WebMCP tools (draw/undo/clear/query) (1024de5)
- **demo**: add canvas Toolbar and ColorPicker components (7da8d31)
- **demo**: add DrawingCanvas component with freehand/line/rect/circle/text (32a8a7c)
- **demo**: add Shape types and CanvasStore state management (145aff2)
- initial open-source release (b4b1c1a)

### 修复

- **core**: add node kind guard for PropertyAssignment injection and demo (4cc224e)
- **core**: use value expression as injectionTarget for PropertyAssignment (09ed72d)
- **demo**: fix text position shift and add re-edit support (a72d771)
- **demo**: fix text tool area sizing and position alignment (ac289a7)
- **demo**: fix dashed line leak and make text tool WYSIWYG (430ff2c)
- **demo**: remove circle crosshair, rework text tool to drag-area-then-input (b1c0663)
- **demo**: add center crosshair indicator when drawing circles (2126fc7)
- **demo**: fix text tool positioning and add select/move tool (4bc4562)
- **demo**: restore DebugPanel, fix router setup (BrowserRouter + NavigateBridge) (9ac6442)

### 文档

- add implementation plan for demo refactor (336d53f)
- add demo refactor design spec (canvas + simplified todos) (5d706dd)

### 维护

- bump version to 0.1.11 (8fedd98)
- add failing tests for PropertyAssignment injectionTarget bug (881cd63)
- **demo**: remove old pages, components, and tests (projects/tags/dashboard) (1de922f)
- split build/deploy concurrency so new pushes cancel old builds (05e6f2b)
- commit pnpm-lock.yaml for reproducible CI builds (2b2ae63)
- deploy apps/demo to GitHub Pages (27988ae)

### 其他

- refactor demo (72dab25)
- Refactor the demo and add a drawing board. (888c915)
- Optimize the pre-check for login status before publishing npm packages (8c7528b)
- publish npm 0.1.10 (6a570af)
- modify readme (8e3ea61)
- Add a README.md to each npm package (e14cb2e)
- Optimize README.md and update the English version of README.md accordingly. (6a81785)
- publish npm package v0.1.9 to registry.npmjs.org (8c1f9f5)
<!-- auto:end -->
