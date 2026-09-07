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

- 无变更记录
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
