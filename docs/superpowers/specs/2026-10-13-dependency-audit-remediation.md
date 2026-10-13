# webmcp-nexus 依赖安全告警治理方案

> 目标：用最小改动、可验证地消掉 GitHub Dependabot / `pnpm audit` 告警，不引入迁移成本、不动发布产物契约。
> 本文只出方案，不含任何已执行的改动。

## 0. 结论（TL;DR）

**一处 `package.json` 改动 + 一次范围内 lockfile 刷新，能消掉全部 6 条 critical、以及绝大多数 high/moderate。**

- 改动 1：`packages/webmcp-core/package.json` 的 `vitest` 从 `^3.1.3` 升到 `^4.1.5`（与其余三包对齐）→ 消掉 3 条 critical。
- 改动 2：`pnpm update -r`（**不带 `--latest`**，尊重现有声明范围）→ 消掉另外 3 条 critical 与大批 high/moderate。
- 剩下 3 条（`uuid` / `braces` / `esbuild`）父包范围卡死，范围内刷不动，属"没把握"部分，单独列在第 6 节由你决策。

**已发布的 4 个 npm 包运行时依赖零暴露**（只有 `ts-morph`、`@mcp-b/webmcp-polyfill`、`@mcp-b/webmcp-types` 三个，均不在任何告警列表里），所以这件事**没有安全紧迫性**，是卫生问题；成本很低，值得做，但不该阻塞任何功能工作。

---

## 1. 取证基线（本次已实测，作为改进前后的对照）

### 1.1 告警总量

`pnpm audit --json --registry https://registry.npmjs.org`（基线快照存在 `/tmp/audit-before.json`）：

| 严重度 | 漏洞包计数 |
| --- | --- |
| critical | 6 |
| high | 42 |
| moderate | 36 |
| low | 9 |

GitHub Dependabot 开放告警 77 条（6 critical / 29 high / 33 medium / 9 low），口径比 `pnpm audit` 窄（91 条 advisory）。**验证以 `pnpm audit` 为准**，因为它可本地复现、可脚本化前后对比，不依赖 GitHub UI。

### 1.2 暴露面分层（决定优先级的依据）

按"是否会进对外产物"分三层，用 `pnpm why --recursive` 逐条追链得到：

| 层 | 内容 | 告警情况 |
| --- | --- | --- |
| **L1 发布的 npm 包** | `core`→`ts-morph`；`sdk`→`@mcp-b/webmcp-polyfill`+`@mcp-b/webmcp-types`；两插件→core/sdk | **零告警** |
| **L2 公开部署的 demo** | GitHub Pages 已启用且 built：https://alibaba.github.io/webmcp-nexus/ 。运行时依赖 `react-router@7.15.1`、`@tiptap/*@3.24.0`（→`prosemirror-view@1.41.8`）、`react`、`lucide-react` | 有真告警，但见 §1.3 可利用性分析 |
| **L3 dev / 构建工具链** | 全部经 `webpack-dev-server`→`express`/`sockjs`/`chokidar`、`vite`、`vitest`→`jsdom`→`undici`、`eslint`→`minimatch` 等 | 告警的绝大多数在这里 |

### 1.3 L2 的可利用性（避免被"high"数字误导）

- `react-router` 5 条：其中 RSC CSRF 绕过、SSR hydration 构造器注入、RSCErrorHandler XSS **三条要求 RSC/SSR，demo 是纯静态 CSR SPA，不适用**。剩下开放重定向需要不可信跳转目标（demo 全是硬编码路由）、路由匹配 DoS 在客户端只能 DoS 自己的浏览器。
- `prosemirror-view` 粘贴处理 XSS：**唯一真实的一类**。但 demo 无后端、不跨用户共享内容 → 实际只能自伤（self-XSS）。若将来 demo 加了持久化或分享，它会立刻变成真漏洞——这是本次最值得修的一条。
- `@tiptap/core` ReDoS + `mergeAttributes` 的 `__proto__` 注入：需要攻击者控制 markdown 或属性合并输入。

### 1.4 L3 的 critical 可利用前提

`tinypool` 原型污染→RCE 需要攻击者能控制传给 `run()` 的 options（即能改你的测试配置）；`vitest` UI 任意文件读需要你自己开着 `--ui` 且端口可达；`shell-quote` / `proxy-addr` / `websocket-driver` 都在 dev server 路径上。**均非远程可达**。

---

## 2. 方案 A（有把握）：core 的 vitest 升到 ^4.1.5

### 2.1 改什么

`packages/webmcp-core/package.json` → `devDependencies.vitest`: `^3.1.3` → `^4.1.5`

一处改动，与根 / demo / sdk 三处现有的 `^4.1.5` 对齐（现在只有 core 是 3.x，属历史遗留不一致）。

### 2.2 为什么这是最高性价比的一改

lockfile 里同时存在 `vitest@3.2.4`（core）与 `vitest@4.1.7`（其余）。**Vitest 4 官方迁移指南明确写了「we've completely removed Tinypool and rewritten how pools work without new dependencies」**，所以升到 4 会让以下条目连根消失，而不只是升个版本号：

| 消除项 | 严重度 | advisory 范围 | 现状 |
| --- | --- | --- | --- |
| `tinypool@1.1.1` | **critical ×2** | `<=2.1.0`→2.1.1、`<2.1.2`→2.1.2 | vitest 4 不再依赖 tinypool |
| `vitest@3.2.4` | **critical** | `<3.2.6`→3.2.6 | 3.x 从树里移除 |
| `@vitest/mocker@3.2.4` | moderate | `<4.1.11` | 同上 |
| `vite@7.3.3` | high | `>=7.0.0 <=7.3.4`→7.3.5 | 由 core 的 vitest 3 引入，随之消失 |

即：**6 条 critical 里 3 条 + 1 条 high + 1 条 moderate，一处改动解决。**

### 2.3 迁移风险评估（逐条比对官方迁移指南，非推断）

已抓取 Vitest 4 官方迁移指南（https://v4.vitest.dev/guide/migration ）全部 13 项 breaking change，与 core 的实际用法逐条比对：

| Vitest 4 breaking change | core 是否受影响 | 依据 |
| --- | --- | --- |
| V8 coverage 重做 / 移除 `coverage.all`、`coverage.extensions` | ❌ 不适用 | core 无 coverage 配置 |
| `exclude` 默认简化（不再排除 dist/config 文件） | ❌ 不适用 | `vitest.config.ts` 显式设了 `include: ['src/**/*.test.ts']`，不会扫到 `dist/` |
| **`spyOn`/`fn` 支持构造器**（箭头函数 `mockImplementation` 用于构造器会报错） | ❌ 不适用 | core 的 6 处 `vi.spyOn` **全部**指向 `console.warn`，非构造器 |
| `vi.restoreAllMocks` 不再重置 automock 状态 | ❌ 不适用 | core 无 `vi.mock`，无 automock；用的正是"手工 `vi.spyOn`"这条被支持的路径 |
| `vi.fn().getMockName()` 返回值变化 | ❌ 不适用 | 无快照、无该断言 |
| `mock.invocationCallOrder` 从 1 开始 | ❌ 不适用 | 无该断言（仅 `toHaveBeenCalledTimes(1)` 与 `warn.mock.calls[0][0]`，且 spy 在 test body 内创建） |
| standalone + filename filter 行为变化 | ❌ 不适用 | 用 `vitest run` |
| `vite-node` → Module Runner | ❌ 不适用 | 未用 `__vitest_executor` / `vitest/execute` / `VITE_NODE_DEPS_MODULE_DIRECTORIES` |
| `workspace` → `projects` | ❌ 不适用 | core 无 workspace 配置 |
| Browser provider 重做 | ❌ 不适用 | `environment: 'node'` |
| **Pool 重做**（`maxThreads`/`maxForks`→`maxWorkers`、移除 `poolOptions`、`singleThread`/`singleFork`→`maxWorkers:1,isolate:false`） | ❌ 不适用 | core 配置只有 `globals` / `environment` / `include` 三项 |
| Reporter API 变更、移除 `basic` reporter | ❌ 不适用 | 用默认 reporter |
| 移除废弃 API（`poolMatchGlobs`、`environmentMatchGlobs`、`deps.inline/external/fallbackCJS`、`minWorkers`、**test/describe 第三参 options 对象**） | ❌ 不适用 | 已 grep 确认：无第三参 options、无数字 timeout 第三参、无上述任何配置项 |

前置条件也满足：Vitest 4 要求 **Node >= 20.0.0 且 Vite >= 6.0.0**；本机 Node v24.18.0，core 的 `@types/node` 是 `^24.12.2`；core 不直接依赖 vite（vitest 自带）。

**旁证**：仓库另外 4 个工程已在 vitest 4.1.7 上跑绿（sdk 180 + demo 13 + vite-plugin 16 + webpack-plugin 17 = 226 例）。

**结论：低风险，有把握。**

---

## 3. 方案 B（有把握）：范围内刷新 lockfile

### 3.1 命令

```bash
pnpm update -r          # 不带 --latest：只在 package.json 已声明的范围内取最新
```

若刷新后 `pnpm audit` 显示传递依赖未动，再用 `pnpm update -r --depth Infinity` 强制重解析整棵树。

### 3.2 预期能修掉的条目（父包声明范围已逐个实测确认允许补丁版本）

这是本方案"有把握"的核心依据——**不是猜测 `pnpm update` 大概能修，而是逐条核实了父包的声明范围**：

| 漏洞包 | 现状 → 补丁 | 父包声明范围 | 是否放行 |
| --- | --- | --- | --- |
| `react-router` | 7.15.1 → 7.18.2 | demo `^7.14.2` | ✅ |
| `@tiptap/core` | 3.24.0 → 3.30.5 | demo `^3.24.0` | ✅ |
| `prosemirror-view` | 1.41.8 → 1.42.3 | `@tiptap/pm` 声明 `^1.38.1` | ✅ |
| `vite` | 8.0.14 → 8.0.16 | demo `^8.0.9` | ✅ |
| `vitest` / `@vitest/mocker` | 4.1.7 → ≥4.1.11 | 根/demo/sdk `^4.1.5` | ✅ |
| `undici` | 7.25.0 → 7.29.1 | `jsdom` 声明 `^7.25.0` | ✅ |
| `qs` | 6.15.2 → 6.16.0 | `express` 4.22.3 声明 `~6.16.0`；`webpack-dev-server` 声明 `express: ^4.22.1` 允许 4.22.3 | ✅（两跳，已核实） |
| `shell-quote` | 1.8.3 → 1.9.0 | `launch-editor` 声明 `^1.8.3` | ✅ |
| `websocket-driver` | 0.7.4 → 0.7.5 | `sockjs` 声明 `^0.7.4` | ✅ |
| `proxy-addr` | 2.0.7 → 2.0.8 | `express` 声明 `~2.0.7` | ✅ |
| `webpack-dev-server` | 5.2.4 → 5.2.6 | demo `^5` | ✅ |
| `brace-expansion` | 1.1.14 → 1.1.21 | `minimatch@3.1.5` 声明 `^1.1.7` | ✅ |
| `brace-expansion` | 5.0.6 → 5.0.12 | `minimatch@10.2.5` 声明 `^5.0.5` | ✅ |
| `@babel/core` | 7.29.0 → 7.29.6 | demo `^7` | ✅ |
| `js-yaml` | 4.1.1 → 4.3.2 | `eslint` 声明 `^4.1.0` | ✅ |
| `nanoid` / `postcss` / `source-map-js` / `fast-uri` / `browserslist` / `baseline-browser-mapping` / `compression` / `ws` / `launch-editor` / `http-proxy-middleware` / `postcss-selector-parser` | 见 §1 基线 | 均为 caret/tilde 范围内的 patch/minor | ✅ |

**注意 `pnpm.overrides` 一个都不需要**——根 `package.json` 现有 `pnpm` 字段只有 `onlyBuiltDependencies: ["esbuild"]`，本方案不动它。这是相比"上来就加 override"的关键优势：override 是全局强制，会把上游没测过的组合塞进树里。

---

## 4. 方案 C（有把握）：执行流程与验证

### 4.1 分支与提交划分

新开分支 `chore/deps-refresh`（**不在 main 上直接改**，main 刚发完 v1.1.1）。

两个独立 commit，理由是可 review 性与可回滚性：

1. `chore(core): align vitest with workspace at ^4.1.5` — 只含 1 个 package.json + lockfile 中 vitest 相关部分。语义变更，可单独回滚。
2. `chore(deps): refresh dependencies within declared ranges` — lockfile **与 6 个 package.json 必须同批提交**。

> ⚠️ **实测踩到的坑（原文写成"纯 lockfile"是错的）**：`pnpm update -r` 会**同时改写 package.json 里的 devDependency specifier**（如 `vitest: ^4.1.5` → `^4.1.11`），并把新 specifier 一并记进 lockfile 的 `importers` 段。只提交 lockfile 会让 CI 的 `pnpm install --frozen-lockfile` 直接失败：
>
> ```
> specifiers in the lockfile don't match specifiers in package.json:
> * 8 dependencies are mismatched:
>   - vitest (lockfile: ^4.1.11, manifest: ^4.1.5)
>   - eslint (lockfile: ^9.39.5, manifest: ^9.39.4)
>   …
> ```
>
> 提交前务必用 `pnpm install --frozen-lockfile` 自查一次（exit 必须为 0）。
>
> **但这不影响发布契约**：已 diff 核实，四个发布包的 `dependencies` 与 `peerDependencies` **一个都没变**（`ts-morph ^28.0.0`、`@mcp-b/webmcp-polyfill ^5.1.0`、`@mcp-b/webmcp-types 5.1.0`、vite peer `^7.0.0 || ^8.0.0`、webpack peer `^4.0.0 || ^5.0.0` 全部原样），变的只有 devDependencies 与私有 demo 自己的 dependencies。抬高 devDep 下限是**有意的**：它能让「没有 lockfile 的解析」也不会落到安全修复版本之下。

Commit message 用英文 Conventional Commits（本仓既有规范）。

### 4.2 门禁命令（照 spec §8.1 记录的实测可用命令，勿用想当然的）

```bash
pnpm -r --filter "./packages/*" run test      # 基线 312 例：sdk 180 / core 99 / vite 16 / webpack 17
pnpm --filter webmcp-nexus-demo test          # 基线 13 例
pnpm --filter webmcp-nexus-sdk  exec tsc --noEmit -p tsconfig.json
pnpm --filter webmcp-nexus-demo exec tsc -p tsconfig.app.json --noEmit
pnpm -r --filter "./packages/*" run build
```

**不能当门禁的两个命令**（已实测）：`pnpm -w typecheck` 跑不起来（根与五个子包都没有 `typecheck` script，报 `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`）；`pnpm lint` 基线已红（163 problems / 161 errors，含与本改动无关的 `react-hooks/refs`）。

**core 的 99 例是本次的重点回归**——它是唯一从 vitest 3 迁到 4 的工程。

### 4.3 demo 手工回归（必须做，CI 不覆盖）—— **已执行，见 §4.6**

`@tiptap` 3.24.0→**3.31.4** 与 `react-router` 7.15.1→**7.18.4** 是**真的会进浏览器产物**的（`lucide-react` 更是 1.17.0→**1.56.0**，跨 39 个 minor），而 `.github/workflows/deploy-demo.yml` **只 build、不跑测试**。所以本地必须手工过四页：

- [x] 画板页：绘制、`getCanvasSnapshot`、DebugPanel 点「执行」传对象入参
- [x] 待办页：增删改、路由级工具随导航挂载/注销
- [x] **富文本页（Tiptap）**：输入、加粗/斜体、字号下拉、对齐、下划线、链接、placeholder —— 这是 3.24→3.31 跨 7 个 minor 的重点
- [x] 表单页（`withWebMcpTools` class 组件）：HOC 注册与热更新后 schema 重建

### 4.4 效果验证（可复现，不靠 GitHub UI）

```bash
pnpm audit --json --registry https://registry.npmjs.org > /tmp/audit-after.json
# 与 /tmp/audit-before.json 的 metadata.vulnerabilities 对比
```

基线：`{"info":0,"low":9,"moderate":36,"high":42,"critical":6}`。

**实测结果（已执行，与预期完全一致）**：

| 严重度 | 改前 | 改后 |
| --- | --- | --- |
| critical | 6 | **0** |
| high | 42 | **1** |
| moderate | 36 | **1** |
| low | 9 | **1** |
| 合计 | 93 | **3** |

共消除 **28 个漏洞包**：`@babel/core`、`@tiptap/core`、`@vitest/mocker`、`baseline-browser-mapping`、`body-parser`、`brace-expansion`、`browserslist`、`compression`、`fast-uri`、`http-proxy-middleware`、`js-yaml`、`launch-editor`、`nanoid`、`postcss`、`postcss-selector-parser`、`prosemirror-view`、`proxy-addr`、`qs`、`react-router`、`shell-quote`、`source-map-js`、`tinypool`、`undici`、`vite`、`vitest`、`webpack-dev-server`、`websocket-driver`、`ws`。

剩下的 3 条正是 §6 预判的那三条（`braces` / `uuid` / `esbuild`），**一条不多一条不少**——这反过来验证了 §3.2 逐个核实父包声明范围的做法是对的。

另外核对 lockfile 里 `vitest@3.2.4` / `tinypool` / `vite@7.3.3` / `@vitest/mocker@3.2.4` 四个条目应**完全消失**（实测四个均为 0 处命中）：

```bash
grep -oE "^  (vitest|tinypool|vite|@vitest/mocker)@[0-9][^:(]*" pnpm-lock.yaml | sort -u
```

### 4.5 CI 后果（必须知情）

`deploy-demo.yml` 的触发条件包含 `pnpm-lock.yaml`，且监听 `push: branches: [main]`。**所以这次 lockfile 刷新一旦合进 main，会自动重建并重新部署公开的 GitHub Pages demo。**

- 好处：部署成功本身就是一次真实的 vite build 验证。
- 风险：公开站点内容会变。因此 §4.3 的手工回归必须在合并**之前**做完，不能靠 CI 兜。
- 该 workflow 用 `pnpm install --frozen-lockfile`，所以 lockfile 必须与 package.json 一致地提交，否则 CI 直接失败。

### 4.6 demo 回归实测结果（已执行，Chrome 155.0.0.0 原生档 + localhost:5174）

四页全部通过，且顺带在真实宿主上验证了 v1.1.1 的形态归一层：

| 页面 | 结果 |
| --- | --- |
| 画板 `/` | 20 工具、schema 全为 object、12 个工具栏按钮标签齐全（lucide-react 1.17→1.56 图标导入正常）；`drawRect` → `getCanvasInfo` 从 0 变 1、`getCanvasShapes` 返回带默认值的完整数据；11 个画板工具连续调用零抛错 |
| 待办 `/todos` | 9 条待办正常渲染；`getTodoStats` **对象入参 `{}` 与字符串入参 `'{}'` 返回完全一致**；`listTodos({limit:2})` 带实参正常 |
| 编辑器 `/editor` | Tiptap 3.31.4 下 21 个工具栏按钮全在；点「加粗」后 `<h2>` 变 `<strong>功能演示</strong>`；点「无序列表」后 H2 转为 LI 并**合并进相邻 UL**（ProseMirror 标准 list-joining），`<strong>` 标记在块类型转换中被保留；`isActive()` 对 bold/paragraph/bulletList 判定均正确 |
| 表单 `/form` | class 组件 + `withWebMcpTools` HOC 注册 6 个工具；`fillForm` 带实参写入后，**真实 DOM input 的 value 同步变化**（证明 React state → DOM 渲染链路正常） |

归一层在真实宿主上的实证：`__webmcpNexusGetToolsWrapped` 与 `__webmcpNexusExecuteToolWrapped` 均为 true、形态传感器判为 `object`（Chrome 155 正确）、**`Object.keys(document.modelContext)` 为 `[]` 且 `{...mc}` 为 `{}`**（即 CHANGELOG 承诺的 WebIDL 保真不变量成立）、annotations（`readOnlyHint`/`consequentialHint`/`untrustedContentHint`）映射正确。路由切换时工具数 20 → 24 → 13 → 6 变化正确，说明作用域注册/注销正常。

回归期间 `console.error` / `console.warn` / `window.onerror` / `unhandledrejection` 四个收集器**全部为空**。

### 4.7 回归中发现的三处既有缺陷（按"欠账写文档不同批修"，本批不动）

以下三条**都不是本次依赖刷新引入的**，已用反证实验或版本比对确认，记录在此以免遗忘：

**1. `undo` / `redo` 的返回值恒为失败，且重做栈永远不会被填充**（`apps/demo/src/store/CanvasStore.tsx:63-72`）

```js
let removed = null;
setShapes(prev => { removed = prev[prev.length - 1]; return prev.slice(0, -1); });
if (removed) setRedoStack(prev => [...prev, removed!]);  // removed 此时仍是 null
return removed;                                          // 恒为 null
```

在 **updater 内部**赋值、却在 `setShapes` 返回后**同步读取**。能否"碰巧生效"取决于 React 的 eager-state 优化是否同步调用了 updater。实测表现：`undo` 返回 `{success:false, removedId:null}`，但形状**确实被移除了**（shapeCount 1 → 0）；因为 `removed` 为 null，`setRedoStack` 从不执行，所以 `redo` 永远无法恢复。

> **反证实验（已执行）**：怀疑是 React 19.2.6 → 19.3.0 引入，故临时把 demo 的 react/react-dom 退回 **19.2.6**（已核实 `apps/demo/node_modules/react` 实际为 19.2.6）、清 vite 缓存重启、跑同一个干净序列 —— **行为完全一致**（undo 仍 `success:false`、形状仍被移除、redo 仍无法恢复）。故确认为既有缺陷，与本次刷新无关。实验后已还原并复验（`git status` 干净、react 回到 19.3.0、画板功能正常）。
>
> 修法：不要在 updater 里做副作用赋值。改用 `useRef` 镜像 shapes，或让 `removeLastShape` 只返回布尔并由调用方从 ref 读被删项。

**2. Tiptap 告警 `Duplicate extension names found: ['link', 'underline']`**（`apps/demo/src/components/editor/RichTextEditor.tsx:2-4,19-26`）

demo 显式注册了 `Underline` 与 `Link.configure({...})`，而 `StarterKit` **也会注册这两个**（其源码为 `if (this.options.link !== false) extensions.push(Link.configure(...))`，underline 同理）。

> **归因更正**：一开始怀疑是本次升级引入，实测**否**。`@tiptap/starter-kit@3.24.0`（升级前版本）的 dist 里已有完全相同的 `if (this.options.link !== false)` 逻辑，依赖里也早已包含 `@tiptap/extension-link` 与 `@tiptap/extension-underline`。故为既有欠账。
>
> 一行可修：`StarterKit.configure({ heading: {...}, link: false, underline: false })`（保留 demo 自己那份带 `openOnClick:false` 与 `rel/target` 的 Link 配置）。Tiptap 自述"This can lead to issues"，重名扩展会让命令注册与 `isActive` 判定依赖不确定的覆盖顺序。

**3. `moveShape` 不校验必填参数**：schema 声明 `required: ['id','dx','dy']`，但传 `{id, x, y}`（缺 dx/dy）时仍返回 `{"success":true}`，实际位移为 `NaN`。属工具实现未做入参校验，既有行为。

> 顺带记录一条**测试方法论**教训：本轮我最初用猜测的参数名调 `reorderShape`（传 `direction:'front'`，真实 schema 是 `action` 且 enum 为 `top/bottom/forward/backward`）与 `moveShape`（传 `x/y`，真实是 `dx/dy`），得到 "shape not found" 后差点误判成应用缺陷。**调 WebMCP 工具前必须先读 `inputSchema`，不能按工具名猜参数。**

---

## 5. 明确不做的事（附理由）

| 不做 | 理由 |
| --- | --- |
| **不升 vitest 5** | 安全告警在 4.1.11 就修完了。vitest 5 的 `clearMocks` 默认改 `true`、未 await 的异步断言改为直接失败、`toThrow('')` 语义反转、inline projects 默认继承根配置等，是**纯迁移成本、零安全收益**。等真有功能需求再单独立项。 |
| **不加 `pnpm.overrides`** | override 是全局强制，会把上游没测过的大版本组合塞进依赖树。§3.2 已证明范围内刷新能覆盖绝大多数条目，不需要它。仅当 §6 的某条你决定强推时才局部使用。 |
| **不加 `.github/dependabot.yml` 自动 PR** | 本仓四包锁步发布、demo 私有、无 CI 测试门禁，自动 PR 会持续产生无法自动验证的噪音。人工按季度跑一次 §3.1 + §4.4 更可控。（若你希望自动化，这应是独立议题。） |
| **不收窄 `vite-plugin-webmcp-nexus` 的 peer `vite: ^7.0.0 \|\| ^8.0.0`** | 该范围确实包含有 `server.fs.deny` 绕过的 7.0.0–7.3.4 / 8.0.0–8.0.15，但：① 那个漏洞只在 **Windows dev server** 生效，你在 macOS；② vite 由消费方自己安装，由我们的 peer 范围强制会变成安装期报错，属半个 breaking；③ 1.1.1 刚发布，不该在安全卫生任务里夹带契约变更。**倾向不动**，但这是你的产品决策，列在 §6。 |
| **不为 dev-only 告警投入工程量** | L3 层（webpack-dev-server / eslint / jsdom 链）不进任何对外产物，其 critical 的利用前提都是"攻击者已能控制你的开发环境"。修它们靠 §3.1 的顺带效果即可，不为残留项单独攻坚。 |

---

## 6. 残留三项：刷新后已复查，全部是**上游卡住**

方案 A/B 执行完后，`pnpm audit` 只剩 3 条。逐条追到了上游最新版，结论是**三条都不是我们能范围内解决的**，且每条的"强行修"代价都高于告警本身的风险。

### 6.1 `braces@3.0.3`（high，**npm 上不存在任何补丁版本**）

- 已核实 `npm view braces version` = **3.0.3**，即最高版本就是漏洞版本，advisory 的 patched 字段是 `<0.0.0`。**升级路径不存在。**
- 刷新后引入链：demo → `webpack@5.111.1` → `webpack-cli@6.0.1`(peer) → `webpack-dev-server@**5.2.6**`(peer) → `chokidar@3.6.0` → `braces@3.0.3`。
- 关键核实：webpack-dev-server 已从 5.2.4 升到范围内最新的 **5.2.6，但它仍声明 `chokidar: ^3.6.0`**，没换 chokidar 4/5。（本文早先"未核实 5.2.6 是否已换"的悬念到此关闭：没换。）
- 唯一出路是 **`webpack-dev-server` 5 → 6（大版本）**：其 latest `6.0.0` 声明 `chokidar: ^5.0.0`，而 chokidar 5 不再依赖 braces。但 demo 声明的是 `^5`，升 6 是 dev server 大版本迁移，且 webpack-dev-server 只在 demo 的 **webpack 构建路径**用到（vite 路径不涉及）。
- 实际可利用性：braces 的问题是解析**不可信** brace 展开模式时的 ReDoS，而这里的 glob 全部来自我们自己的 webpack 配置，**攻击者无法控制**；且属 dev server，不进任何产物。
- **结论：接受。** 若要清零，代价是把 demo 的 webpack-dev-server 升大版本，风险与收益不匹配。可作为独立议题延后。

### 6.2 `uuid@8.3.2`（moderate，GHSA-w5hq-g745-h8pq）

- advisory `< 11.1.1` → 补丁 `>= 11.1.1`。引入链：demo → `webpack-dev-server` → `sockjs@0.3.24` → `uuid@8.3.2`。
- 关键核实：**`sockjs` 的 latest 就是 `0.3.24`（我们已在最新），且它仍声明 `uuid: ^8.3.2`** → 上游根本没动，跨 3 个大版本，**范围内无解**。
- `pnpm install` 每次都会打印 `WARN 1 deprecated subdependencies found: uuid@8.3.2`——uuid 8 上游已废弃。
- 唯一出路是 `pnpm.overrides` 强推 `uuid@^11`。**未实测且不建议**：uuid v9 起移除了 default export，sockjs 是否只用 `v4` 命名导出需先验证；为一条 dev-only 的 moderate 去强改上游没测过的组合不划算。
- 实际暴露：sockjs 只是 webpack-dev-server 的 HMR websocket 回退传输，仅本机 dev server 使用。
- **结论：接受并记录，等 sockjs 或 webpack-dev-server 上游放行。**

### 6.3 `esbuild@0.27.7`（low，GHSA-g7r4-m6w7-qqqr）

- advisory `>= 0.27.3, < 0.28.1` → 补丁 `>= 0.28.1`（esbuild latest 是 `0.28.2`）。
- **归因纠正**：本文早先猜"未核实 vite 是否放行 esbuild 0.28"，方向错了。实测 **vite 8.3.4 把 esbuild 声明为 optional peerDependency `^0.27.0 || ^0.28.0`，是放行 0.28 的**。真正把 esbuild 钉在 0.27 的是 **`tsup@8.5.1` 的 `dependencies.esbuild: ^0.27.0`**。
- 而 `tsup` 的 latest 就是 **8.5.1**（我们已在最新）且仍声明 `^0.27.0` → **上游没动，范围内无解**。
- 唯一出路是 `pnpm.overrides` 强推 `esbuild@^0.28.2`。**明确不建议**：tsup 是**四个发布包**的构建工具，绕过它声明的范围强塞 esbuild 0.28 可能改变产物，而这条只是 low 且 esbuild 只在构建期运行、不进浏览器产物。
- **结论：接受，不 override。** 等 tsup 上游放行。

### 6.4 是否收窄 vite-plugin 的 peer 范围

见 §5 最后一行。这是产品/契约决策，不是技术判断，需要你定。

### 6.5 两条需要去 Dependabot 上 dismiss 的滞后告警

已实测确认**不适用当前 lockfile**，留着会一直误导面板数字：

- `vitest >= 4.0.0, < 4.1.0`（"Vitest UI server 任意文件读"）：lockfile 穷举只有 `vitest@3.2.4` 与 `4.1.7`，都不在此区间。（注意：**另有一条** `vitest < 3.2.6` 的 critical 是真适用于 3.2.4 的，不要混淆——它由方案 A 修掉。）
- `vite <= 2.14.0`（launch-editor NTLMv2 泄露）：实际装的是 7.3.3 / 8.0.14。

Dismiss 操作需要 `repo` 权限（`gh` 当前账号 `aliciqin` 已具备），属对仓库共享状态的写操作，**需你确认后我才做**。

---

## 7. 执行顺序（确认后按此推进）

1. `git checkout -b chore/deps-refresh`（从 main 起）
2. 改 `packages/webmcp-core/package.json`：`vitest` → `^4.1.5`
3. `pnpm install` → 跑 §4.2 门禁，**重点看 core 的 99 例**
4. commit 1：`chore(core): align vitest with workspace at ^4.1.5`
5. `pnpm update -r`（必要时 `--depth Infinity`）
6. 跑 §4.2 全量门禁 + §4.3 demo 四页手工回归
7. `pnpm audit --json` 前后对比（§4.4），核对 4 个应消失的条目
8. commit 2：`chore(deps): refresh lockfile within declared ranges`
9. 复查 §6.1–6.3 三项残留，逐条给出"已修 / 仍存在 + 理由"
10. 把 §6.5 两条滞后告警的 dismiss 清单交你确认
11. 你确认后再合 main（**注意会触发公开 demo 重新部署**，见 §4.5）

## 8. 回滚

- 两个 commit 独立，可 `git revert` 任一而不影响另一个。
- lockfile 刷新若导致 demo 回归失败：`git checkout HEAD~1 -- pnpm-lock.yaml && pnpm install --frozen-lockfile` 即可整体退回，无需逐包定位。
- 不涉及任何已发布 npm 包的产物变更，**不需要发版**（core 的 vitest 是 devDependency，插件包的 peer 契约未动）。若你希望把这次刷新带进下一次发版，那也是下一次 `publish.sh` 自然携带，不需要为它单独发版。
