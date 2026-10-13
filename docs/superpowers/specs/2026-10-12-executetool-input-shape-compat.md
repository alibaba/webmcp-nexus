# Spec: relay 6.x 双轴归一 —— 让 nexus 在全部 Chrome 档位上兼容 relay 最新版

> 状态：**已批准，待实施**（2026-10-13，经 double-check 完整档复核后修订）
> 本文取代同日早先的单轴版本。相对初版的实质修订：新增轴二（schema 形态归一）、schema 归一改为逐工具 `typeof` 分支、形态缓存改挂宿主对象并新增「传感器」机制、守卫按方法分标记、提交划分取消批次 A/B、验证门禁换成实测可用命令。

## 1. 问题

Chrome 155 把原生 `ModelContext.executeTool(tool, input)` 的第二参从 JSON **字符串**改成了**对象**。`@mcp-b/webmcp-local-relay` 6.x 随之改为传对象，并**同时删掉了对字符串 `inputSchema` 的容忍度**。webmcp-nexus 全链路建立在旧的字符串形态上。

### 1.1 两条 breaking 轴（均已字节级核对 CDN 产物）

**轴一 —— 执行阶段的入参形态**

| relay 版本 | 调用点 | 第二参 |
| --- | --- | --- |
| 5.x | `S(await n.executeTool(r, JSON.stringify(t)))` | 字符串 |
| 6.0.0 | `u(await n.executeTool(r, t))` | 对象 |

**轴二 —— 发现阶段的 schema 形态容忍度**

relay 5.x 显式容忍字符串 schema，`JSON.parse` 后使用：

```js
if (typeof e.inputSchema == 'string') try { t = JSON.parse(e.inputSchema) } catch { …drop… }
else t = e.inputSchema;
```

relay 6.0.0 删掉了容忍度，字符串一律当 malformed **丢弃整个工具**：

```js
function b(e){ if (e.inputSchema !== void 0 && !c(e.inputSchema))
  return console.warn(`[webmcp-relay-embed] Tool "${e.name}" was not relayed because its input schema is malformed.`), null; … }
// c(e) = !!e && typeof e == 'object' && !Array.isArray(e)
// 随后 x() 用 .filter(e => e !== null) 把整个工具丢掉
```

**轴二比轴一更早咬人**：它在 `getTools()` 映射阶段就丢工具，Agent 侧看到零个工具，`executeTool` 根本不会被调用 —— 轴一的归一无从生效。

### 1.2 实测证据（Chrome 155.0.8059.40 + localhost:5173）

宿主探针：

| 探针 | 结果 |
| --- | --- |
| `navigator.userAgent` | `Chrome/155.0.0.0` |
| `document.modelContext.constructor.name` | `ModelContext` |
| `Object.keys(document.modelContext)` | `[]`（WebIDL 保真，非 polyfill 实例） |
| `mc.executeTool` | `function executeTool() { [native code] }` |
| `navigator.modelContextTesting` | **`false`（155 已移除）** |
| `getTools()` | 20 个工具，`inputSchema` 的 `typeof` 全为 `object`，`tool.window === globalThis.window` 为 `true`，`tool.origin === location.origin` 为 `true` |

红绿对照（同一 descriptor，工具 `clearCanvas`）：

| 调用 | 结果 |
| --- | --- |
| `mc.executeTool(tool, '{}')` | 🔴 `TypeError: Failed to execute 'executeTool' on 'ModelContext': invalid input object: value is not an object` |
| `mc.executeTool(tool, {})` | 🟢 `'{"success":true,"clearedCount":0}'` |

注册链路本身健康，故障只在形态。

### 1.3 调用发生在顶层页面 realm（覆盖性结论）

已发布的 relay 6.0.0 `dist/browser/embed.js`（7380 字节、压缩成 1 行）里 `executeTool` **命中 1 次**，是完整调用路径：

```js
…(await n.getTools()).find(t=>t.name===e); if(!r) throw Error(`Tool not found: ${e}`);
return u(await n.executeTool(r,t))
```

`WebSocket` 命中 0 次。即 6.0.0 的 embed.js **同时**做两件事：注入 widget iframe + 自带工具调用路径，且调用发生在**顶层页面 realm**，读的就是页面自己的 `document.modelContext`。

mcp-b 本地 HEAD（领先于已发布版本）把调用移进了 `widgetRuntime.ts`，读 `window.parent.document.modelContext` —— 那是**同一个对象**。

**结论**：归一层作为该对象的 own property，两种形态都确定覆盖，**不需要任何跨 realm 处理**。

### 1.4 上游的两条明文约束

- `mcp-b/apps/documentation-website/how-to/connect-desktop-agents-with-local-relay.mdx:75-77`：「Load the embed from the same major version as the page's MCP-B runtime (`@mcp-b/global` or `@mcp-b/webmcp-polyfill`). A page that still runs a 5.x runtime must load `@mcp-b/webmcp-local-relay@5`.」—— 注意这讲的是 **embed ↔ 页面 runtime**，不是 embed ↔ server
- `mcp-b/packages/webmcp-local-relay/README.md` 的 Runtime Compatibility 只列三种受支持运行时，原生档限定「Current native Chrome with `document.modelContext.getTools()` and **object-input** `executeTool()`」（= 155+）。**原生 Chrome 149–154 不在 relay 6.x 支持矩阵内**

### 1.5 上游明文规定了消费方写法

`@mcp-b/webmcp-types@5.1.0/dist/model-context.d.ts`（nexus 自己的依赖）在 `RegisteredTool.inputSchema` 上写着：

> A JSON Schema object since webmcp#241, rolling out from Chrome 154.0.8013 (cross-document tools first). Chrome 149-153 — most of the Origin Trial population — and 154's same-document tools still return the serialized JSON string the change replaced. **Consumers that support both generations must branch on `typeof` and guard the parse of the string arm.**

类型本身是 `inputSchema?: InputSchema | string`。

这段同时给了两件事：149–154 same-document 返回字符串 schema 的**上游背书**（不是 nexus 自说自话），以及**逐工具 `typeof` 分支**这个指定写法 —— 本 spec 的轴二即照此实现。

## 2. 目标与非目标

**目标**：relay 最新版在 nexus 声称支持的全部四档宿主上都能**发现并执行**工具，且不抬高浏览器下限。

### 2.1 解决什么问题

Chrome 155 已是 stable，这是**现存故障**而非未来风险。

| # | 症状 | 触发条件 | 状态 |
| --- | --- | --- | --- |
| 1 | demo 页所有工具经 relay 执行失败，报 `TypeError: … invalid input object`；**无参工具同样失败**（无参传的 `'{}'` 仍是字符串） | Chrome 155+ 且 embed 是 relay 5.x | 已实测复现 |
| 2 | demo 页内调试面板点**「执行」**报同一个错 | Chrome 155+，与 relay 无关 —— `DebugPanel.tsx` 的 `callTool` 直接把 `buildArgs` 产出的 JSON 字符串透传给 `mc.executeTool` | 已实测复现 |
| 3 | **任何接入 nexus 的业务页面**，用户在 Chrome 155+ 上时页面内直接调 `mc.executeTool(tool, '…')` 就失败 | `WebMcpHostContext.executeTool` 原声明第二参为 `string`，等于 SDK 在**类型层面引导**调用方写出必然失败的代码 | 由 1/2 同源推定 |
| 4 | **换用 relay 6.x 后，Chrome 149–154 上工具直接消失**（不是执行失败，是发现不到） | relay 6.x + 原生 149–154（`getTools()` 返回字符串 schema） | 由轴二源码 + 上游类型声明推定 |

根因：nexus 把「宿主返回什么形态」和「调用方该传什么形态」都硬编码成了字符串时代的假设，而这个假设在 Chrome 155 与 relay 6.x 两侧同时失效。

**解决后，调用方与 relay 版本都不再需要关心宿主代际** —— 传对象或字符串都行，schema 是字符串还是对象都行，SDK 负责双向归一。这是核心价值，不只是修 demo。

### 2.2 非目标

- 不支持 relay 2.x：`callTool`/`listTools` 合成面维持现状
- 不做 polyfill 6.0.0 迁移（决策 2）
- 不消除 Chrome 149–154 的未实证假设（本机只有 155，见 §9）
- 不覆盖 relay 未来可能出现的第三条轴（风险 #3）
- 不修 README 的其它 drift（两层 README 对 146–148 档支持 relay 2.x 还是 5.x 互相矛盾、注释引用的 `hasDescriptorToolApi` 在 mcp-b 全仓不存在）
- 不改 `registry.ts` 既有合成面对畸形 schema 的降级行为（见 §5.4，两处策略有意分歧）

## 3. 修改前后对比

图例：✅ 可用 ｜ ❌ 失败 ｜ 👻 工具发现不到（比 ❌ 更糟，Agent 侧静默少工具）

**改前**（embed 钉 `@5`）

| 路径 | Chrome 155+ | 149–154 | 146–148 | polyfill 自持 |
| --- | --- | --- | --- | --- |
| demo 经 relay 发现+执行 | ❌ 轴一 TypeError | ✅ | ✅ | ✅ |
| 调试面板点「执行」 | ❌ TypeError | ✅ | ✅ | ✅ |
| 业务代码传字符串 | ❌ | ✅ | ✅ | ✅ |
| 业务代码传对象 | ✅ | ❌ | ❌ | ❌ UnknownError |

**只把 embed 换成 relay 6.x、不加归一层**

| 路径 | Chrome 155+ | 149–154 | 146–148 | polyfill 自持 |
| --- | --- | --- | --- | --- |
| demo 经 relay 发现+执行 | ✅ | 👻 **轴二：字符串 schema 被丢弃，零工具** | ❌ 轴一：对象透传给 testing 面 | ❌ 轴一：`parseChromeToolInput` 抛 UnknownError |
| 调试面板点「执行」 | ❌ 仍传字符串 | ✅ | ✅ | ✅ |

注意调试面板**不经 relay**、直连宿主，所以换 embed 版本对它毫无影响，155 上仍是 ❌ —— 它必须单独改。

**只做轴一、不做轴二**

| 路径 | Chrome 155+ | 149–154 | 146–148 | polyfill 自持 |
| --- | --- | --- | --- | --- |
| demo 经 relay 发现+执行 | ✅ | 👻 **仍然零工具** | ✅ | ✅ |

**改后**（双轴归一）

| 路径 | Chrome 155+ | 149–154 | 146–148 | polyfill 自持 |
| --- | --- | --- | --- | --- |
| relay 6.x 发现工具 | ✅ 原生即对象 | ✅ 字符串→对象 | ✅ 合成版已 coerce | ✅ polyfill 即对象 |
| relay 6.x 执行（传对象） | ✅ 透传 | ✅ 转字符串 | ✅ 转字符串后按名调 testing 面 | ✅ 转字符串 |
| relay 5.x 发现+执行（传字符串） | ✅ 转对象 | ✅ 透传 | ✅ | ✅ |
| 调试面板点「执行」（传对象） | ✅ | ✅ | ✅ | ✅ |
| 业务代码传字符串 | ✅ 转对象 | ✅ | ✅ | ✅ |
| 业务代码传对象 | ✅ | ✅ 转字符串 | ✅ | ✅ |

上表中 149–154 与 146–148 两列基于 §9 的未实证假设。若判错，改后行为退化为改前，不会更糟（§9 有四组合推演）。155+ 列与 polyfill 列为实测/源码核实。

## 4. 版本策略

### 4.1 决策 1：embed 用 `@latest`

论据**不是**「保证 embed 与 server 对齐」—— 那条不成立，理由见下。正确论据是：

**nexus 无法获知用户本地 relay server 的版本。** server 版本在每个用户自己的 MCP 客户端配置里（README 那行 `npx -y @mcp-b/webmcp-local-relay@…`），nexus 只能控制 embed（`apps/demo/index.html`）。因此钉任何固定版本都会让 nexus 成为错配关系中**唯一固定的那一端**。跟随 `@latest` 不是「保证对齐」，而是「不成为固定端」。

佐证：**半钉半浮正是本次故障的成因** —— embed `@5` × server `@latest`=6.0.0。

jsDelivr 的 `@latest` 有 CDN 缓存、`npx` 有自己的缓存，两个「最新」本来就不同步，所以任何「对齐」承诺都做不到。

代价须如实承认：若 relay 7.x 引入**第三条**轴，`@latest` 会静默炸且无版本可 bisect。缓解见风险 #3。

### 4.2 决策 2：polyfill 保留 `^5.1.0`，不升 6.0.0

6.0.0 是迁移而非版本号变更：

- `initializeWebMCPPolyfill` / `cleanupWebMCPPolyfill` **已被删除**（`packages/webmcp-polyfill/src/index.ts` 现在只导出 `installWebMCP`），nexus 的 `polyfill.ts` 会在 import 阶段就断
- `installWebMCP()` **无参数、无卸载**（CHANGELOG：「the upstream context lives for the lifetime of the document」），nexus 的 `__resetPolyfillStateForTest` / `__cleanupPolyfillOnlyForTest` 没有等价物，`host-helpers.ts` 的 `teardownHost` 与 `polyfill.test.ts` 都得重写
- `installTestingShim` 选项移除、`./schema` 子路径移除
- 安装门槛是四道 feature gate（`Promise.withResolvers` / `AbortSignal.any` / `String.prototype.toWellFormed` / `URL.parse`），任一不满足**静默什么都不装** → 下限抬到 Chrome 126+

**且升级省不掉归一层**：最难的一档是原生 Chrome 149–154 —— 那一档原生 context 存在，polyfill 的 early-return 判据（`src/upstream/index.ts` 的 `if ("modelContext" in document) return;`）直接命中，**根本没有 polyfill 参与**。

附带约束值得记录：该判据是**属性存在性**，任何在 `document` 上定义 `modelContext` own property 的行为都会让 polyfill 静默不装。

### 4.3 与上游建议的偏离

上游建议是**反的**（§1.4 第一条 + polyfill 6.0.0 CHANGELOG「Pin the major in CDN URLs；没准备好迁移的页面钉 `@5` 而不是 `@latest`」）。我们**明知偏离**，原因是决策 2 把 polyfill 留在 5.1.0（属上游口中的「5.x runtime」）。偏离能成立的唯一前提是归一层把两条轴都吸收掉 —— 这也是为什么轴二不可省略。

因此 README 不写「relay 5.x/6.x 均全档可用」这种无条件承诺，改为：**nexus 侧对 embed 5.x/6.x 均可发现并执行工具；embed 与本地 relay server 的大版本一致性由消费方保证。**

## 5. 方案：双轴归一

拦截点只能是宿主的 `document.modelContext` 对象本身 —— relay 的 embed.js/widget 是上游注入的独立脚本，nexus 改不了它的行为。由 §1.3，归一层作为该对象的 own property 即可确定覆盖。

### 5.1 轴二：逐工具条件转换 `getTools()`（方案 A）

**不按宿主代际整体转换**，而是逐工具 `typeof` 分支 —— 这正是上游类型声明规定的写法（§1.5）。

```
async (...args) => {
  const raw = await originalGetTools.apply(mc, args)      // rest args 转发 options
  if (!Array.isArray(raw)) return raw
  let changed = false, sawSameDocument = false, sawStringSchema = false
  const out = raw.map(tool => {
    if (tool?.window === globalThis.window) {
      sawSameDocument = true
      if (typeof tool.inputSchema === 'string') sawStringSchema = true
    }
    if (typeof tool?.inputSchema !== 'string') return tool           // 原引用透传
    const coerced = coerceInputSchema(tool.inputSchema, tool.name)
    if (!coerced) return tool                                        // 解析失败：保留原字符串
    changed = true
    return { ...tool, inputSchema: coerced }                         // 保留全部 own 键
  })
  if (sawSameDocument) 记入传感器(sawStringSchema ? 'string' : 'object')
  return changed ? out : raw                                         // 整批无字符串 → 原数组
}
```

选 A 而非「按宿主代际整体转换」的理由：

1. **轴二不再需要形态探测** → §5.3 的自指陷阱从设计里消失，不靠实施纪律防
2. 拷贝只发生在「该工具 schema 是字符串」时，即只有原生 149–154 一档；polyfill / 155+ / 146–148 三档（全部可本地实证的档）**原引用透传** → 四键保真从「必须测」降级为「不可能发生」
3. 混合列表处理正确（Chrome 154 上两种形态并存时只动该动的）
4. 少一次宿主 `getTools()` 调用
5. 上游明文指定此写法

代价：每次 `getTools()` 多一趟 O(n) 的 `typeof` 扫描（relay 2 秒轮询一次，可忽略）。

**三条写死的约束（不留实施者判断）**

- 拷贝形状必须是 `{ ...tool, inputSchema: coerced }`，保留全部 own 键。**不得照抄 relay `b()` 的部分拷贝**（只挑 `name`/`title`/`description`/`inputSchema`/`annotations`、丢掉 `window`/`origin`）—— relay 的执行路径 `S()` 不复用它自己映射出的对象，而是重新 `await getTools()` 再按名 `find()`，`d()` 只做 `Map.set(name, n)` 保留原引用，**所以我们返回的对象会被原样喂回 `executeTool`**。polyfill 侧对四键既做存在性检查又做值比较（`for (const required of ["name","description","window","origin"]) if (!(required in tool)) throw new TypeError(...)`，随后 `tool.window !== globalThis.window || tool.origin !== currentOrigin()` → `UnknownError`），缺一即抛。relay 的去重逻辑 `d()` 里 `e.window===window||n.window!==window` 也直接读 `window`，丢键会让 cross-document 工具反而胜出并打出多余重复告警。上游 README 亦明写「the exact returned descriptor… Refreshes the descriptor before every invocation」
- **不得就地改写** `tool.inputSchema`（污染宿主对象）
- 解析失败的工具**保留原字符串透传**，不丢、不降级（理由见 §5.4）

`options` 用 rest args 转发：上游签名是 `getTools(options?: { fromOrigins?: string[] })`，实测 relay 6.0.0 与 DebugPanel 今天都无参调用、全仓零处 `fromOrigins`，所以不是当下回归，但 rest args 是零成本健壮性。

### 5.2 轴一：包装 `executeTool`

```
async (tool, inputArgs, ...rest) => {
  const shape = await resolveInputShape(mc, originalGetTools)   // 显式传原函数
  return originalExecuteTool.call(mc, tool, coerceExecuteToolInput(inputArgs, shape), ...rest)
}
```

签名收三参，兼容已发布 6.0.0（两参无 signal）与 mcp-b 本地 HEAD（带 `{signal}`）。`originalExecuteTool.call(mc, …)` 保证 native WebIDL 方法拿到正确 `this`。

入参形态是**宿主级**属性（不是逐工具属性），所以 `resolveInputShape` + `originalGetTools` + same-document 过滤全部保留，不因轴二改成方案 A 而删除。

### 5.3 形态判定与传感器

**必须确定性，禁止「调用失败再重试」**：无法区分「形态错」和「工具体自己抛的 TypeError」，误判会让有副作用的工具执行两遍（demo 里就有 `clearCanvas`/`deleteShape`/`bulkSetTodoStatus`）。同理否决临时探针工具 —— relay 的轮询真实存在（embed.js 的 `setInterval(j, 2e3)`），探针会泄漏进它读到的列表。

**传感器机制（轴二顺带喂，轴一优先读）**

轴二的逐工具扫描天然会看到 raw schema 形态，让它顺手记录：

```
轴二每次执行：若列表中存在 same-document 工具（tool.window === globalThis.window），
              按「其 raw schema 是否含字符串」把 'string'/'object' 写入宿主级传感器
              （仅 same-document 命中才写；无 same-document 工具则不写）
轴一读取顺序：宿主级传感器（确定值）→ __isWebMCPPolyfill 短路 → 冷启动探测 originalGetTools
```

三点收益：

1. 常见路径（relay 与 DebugPanel 都是先 `getTools()` 再 `executeTool()`）**零额外宿主调用**
2. 冷启动探测仍保留，覆盖「`executeTool` 先于任何 `getTools`」的极端顺序，设计是完备的而非「实践中够用」
3. 传感器写入规则**只认 same-document**，从构造上规避缓存窗口 bug（见下）

**冷启动探测**

```
resolveInputShape(mc, originalGetTools) → 'string' | 'object'

1. mc.__isWebMCPPolyfill === true    → 'string'（短路，**必须先于**读传感器，见下）
2. 读宿主级传感器 __webmcpNexusInputShape，命中即返回
3. 否则调 originalGetTools（**未包装的原函数**）：
   - 抛错 → 'object'，不缓存，留一条面包屑
   - 用 tool.window === globalThis.window 过滤 same-document
   - **inputSchema === undefined 的样本不计入投票**（见下）
   - 过滤后无可用样本 → 用全量兜底；全量也无 → 'object'，不缓存，留面包屑
   - 任一 raw typeof inputSchema === 'string' → 'string'（确定结论，缓存）
   - 否则 → 'object'（确定结论，缓存）
```

**polyfill 短路必须先于传感器**（实施中发现并修掉的真 bug）：polyfill 5.1.0 的 `getTools()` 返回**对象** schema，但它的 `executeTool` 只吃字符串。若先读传感器，轴二观测到的 `'object'` 会让 polyfill 档全量报错。因此轴二在 polyfill 宿主上也**不写**传感器。

**`inputSchema === undefined` 的样本不得计入投票**：上游 IDL 是 `object inputSchema;` —— 既非 `required` 也无默认值，按 WebIDL dictionary 语义整键省略。无 schema 的工具对代际什么也证明不了；若计入投票，「本页只有无 schema 工具」会被误判成 object-era 并写进传感器，此后在 string-era 宿主上全量调用失败。

**传感器是 write-once 的**：命中即直接返回，**不存在「每次 patch 重探」**（本文早先版本这么写，是错的）。所以任何写入错误结论的路径都是永久性的 —— same-document 过滤、无 schema 不投票、兜底结论不缓存，这三条共同构成唯一防线。

**自指陷阱（必须避开）**：轴二会把 `getTools` 包装成永远返回 object schema。若探测调的是包装后的版本，它永远看到 object → 永久误判成 object-era → 轴一随之全错。因此 `originalGetTools` 必须在包装前用**闭包**捕获（不用 WeakMap、不用隐藏属性存函数），且 `resolveInputShape` 的签名显式收它。

同类错误的另一形态：`synthesizeDescriptorApiIfMissing` 的合成版 `getTools` 已用 `coerceInputSchema` 把 string 转成 object，形态信号同样被销毁 —— 由 §5.5 的守卫拦掉。

same-document 过滤是必需的：Chrome 154 的 cross-document 工具已先行对象化，混进来会把 string-era 宿主误判成 object-era。

**缓存窗口 bug 及其规避**：若探测正好发生在「本页还没有自己的工具」那一刻，全量里全是 cross-document 的对象 schema → 判成 object-era → 若缓存则此后自己注册的 same-document 工具执行时全量报 TypeError，**且不会自愈**。这是「判错会更糟」的唯一路径。规避规则：

- 缓存的是**在途 Promise**（避免并发首调重复探测）
- 只有 **same-document 命中**得出的结论才写入宿主级隐藏属性（永久缓存）
- 全量兜底 / 空列表 / `getTools()` reject 得出的结论**只用于本次调用，不写缓存**；在途 Promise 在这些情况下 resolve 后需清掉，让下次调用重探

**缓存放宿主对象而非模块级**：`clearRegistry()` 会重置 `modelContextPatched`，但不会重置新增的模块级形态缓存，跨测试用例会泄漏；测试假宿主每次都是新对象，天然隔离。

### 5.4 畸形 schema 的取舍（两处策略有意分歧）

- **归一层（轴二）**：字符串解析失败 → **保留原字符串透传**，让 relay warn + drop。理由：nexus 抢答会掩盖真实原因；降级成「零参数可调用工具」会让工具在缺参状态下有害地执行 —— `coerceInputSchema` 自己的注释就写着这「比丢弃它更危险」
- **`registry.ts` 既有合成面**（`synthesizeDescriptorApiIfMissing` 里的 `coerceInputSchema(...) ?? { type:'object', properties:{} }`）：**维持降级行为不改**。它服务 relay 2.x / 146–148 legacy 路径，超出本批范围

两处分歧是**有意的**，在此显式记录，不声称一致。

**告警文案必须与行为一致**（code review 发现）：轴二复用 `coerceInputSchema`，而它默认的文案是 `Tool "X" was skipped because its input schema is malformed.` —— 轴二**并不 skip**，是原样透传、丢弃权归 relay，文案说的和做的相反。两个后果：排障者会先去 SDK 层找「工具为什么被丢」而真相在 relay；且 relay 每 2 秒轮询一次 `getTools()`，一个畸形 schema 就能持续刷屏淹掉其它日志。

处置：`coerceInputSchema` 加一个 `silent` 参数（默认 `false`，既有 30 条测试与 widget 路径行为不变），轴二传 `true` 并自己出一条**文案准确、按工具名在闭包内去重**的 warn（`passing it through unchanged and leaving the drop decision to the consumer`）。用闭包内 `Set` 而非模块级：避免跨测试用例污染，且每次重新 patch 自然重置。

顺带补强风险 #4：polyfill 的 `getTools()` 在 schema 非 plain object 时**整个省略 `inputSchema` 键**，此时 relay 的 `e.inputSchema !== void 0` 为假 → 不丢工具 → 无参工具在 relay 6.x + polyfill 下正常。这也正是 §5.3「无 schema 样本不得计入投票」的另一个来源。

### 5.5 守卫：按方法分别打标记

原设计的三条守卫是**函数级**的（整个 `ensureHostShapeCompat` 直接 return），而每条的正当理由只够关掉**其中一轴**，于是每条都越权关掉了另一轴：

- 「合成版 executeTool 内部已归一」只说明入参归一不必装，与「宿主原生 `getTools` 返回什么形态」无关
- 「合成版 `getTools` 已 coerce、形态信号被销毁」只影响探测，不影响入参归一本身；而它声称覆盖的「有原生 executeTool 但无原生 getTools」组合，恰恰是轴一最需要包装的情形

今天这些组合都不可达（146–148 两者皆无；149+ 与 polyfill 都有原生 `executeTool`；`synthesizeExecuteToolIfMissing` 只在宿主缺 `executeTool` 时才合成），所以不是当下故障，但守卫语义边界是错的。

**修正：守卫粒度与理由粒度对齐，按方法分别打标记。**

| 标记 | 作用轴 | 语义 |
| --- | --- | --- |
| `__webmcpNexusExecuteToolSynthesized` | 轴一 | nexus 合成了 `executeTool`，内部已归一，跳过 |
| `__webmcpNexusGetToolsSynthesized`（**新增**） | 轴二 | nexus 合成了 `getTools`，已 coerce，形态信号不可信，跳过 |
| `__webmcpNexusExecuteToolWrapped` | 轴一 | 防重复包装 |
| `__webmcpNexusGetToolsWrapped` | 轴二 | 防重复包装 |

`__webmcpNexusSynthesized` 保持原用途（`isModernHost` 判据），**不参与**归一层决策。

```
ensureHostShapeCompat(mc):
  安装时用闭包捕获 originalExecuteTool / originalGetTools

  轴二：typeof mc.getTools === 'function'
        && mc.__webmcpNexusGetToolsSynthesized !== true
        && mc.__webmcpNexusGetToolsWrapped !== true
        → 包装，打 Wrapped 标记

  轴一：typeof mc.executeTool === 'function'
        && mc.__webmcpNexusExecuteToolSynthesized !== true
        && mc.__webmcpNexusExecuteToolWrapped !== true
        → 包装，打 Wrapped 标记
```

**防重复包装是硬要求，不是洁癖**：`modelContextPatched` 有两条复位路径 —— `clearRegistry()` 会把它置回 `false`，以及 **Vite HMR 换模块**（demo 开发态天天发生）—— 而宿主对象上的包装不会跟着消失。二次进入时若没有 `…Wrapped` 守卫就会再包一层，第二层闭包里的「原函数」其实是第一层的包装版 → 自指陷阱从第二条路重现。本项目已有 HMR 相关踩坑记录。

### 5.6 安装方式与已知偏差

复用现有 `defineHiddenProperty`（`enumerable: false`）。安装点：`patchModelContextEventSupport()` 的现代宿主分支与旧宿主分支，两处都在既有合成逻辑之后调 `ensureHostShapeCompat`。

- `Object.keys(mc)` 仍为 `[]`，nexus 明文维护的「实例无 own enumerable keys」不变量**保持**
- 但 polyfill 5.1.0 刻意把原型上的 `registerTool`/`getTools`/`executeTool`/`ontoolchange` 设为 `enumerable: true`（dist 里那段 `for (const member of [...])` 循环）。own 非枚举属性会遮蔽 inherited 枚举属性，导致 **`for...in` 不再产出 `executeTool`/`getTools`**（已用 Node 复刻验证）。`Object.keys`、spread、`instanceof` 均不受影响。二者不可兼得，选保 `Object.keys` 不变量 —— 全仓零处 `for...in` 遍历 ModelContext，`Object.getOwnPropertyNames` 仅一处且作用于组件 prototype
- `Object.getOwnPropertyNames(mc)` 会多出两个方法；包装函数 arity 与原生不同。relay 只判 `typeof === 'function'`，不看 arity；全仓仅两处 `.length` 断言且都是 `registerTool.length === 1`，无 `executeTool.length` 断言

### 5.7 归一函数语义

```
toArgsJson(input):   string 且非空 → 原样; '' / undefined / null → '{}';
                     非对象 / 数组 / 标量 / 函数 → TypeError（与 toArgsObject **对称**）;
                     否则 JSON.stringify(input)
toArgsObject(input): undefined / null → {}; '' → {};
                     非空 string → JSON.parse，结果非 plain object 抛 TypeError（畸形 JSON 让 SyntaxError 自然冒泡）;
                     plain object → 原样（同一引用）; 数组 / 其它类型 → TypeError
```

两处需注意的实现细节：

- `toArgsJson('')` 必须返回 `'{}'` 而非原样返回 `''` —— 空串会被 polyfill 硬 `JSON.parse` 抛 `SyntaxError`，而空串是合法的「无参」表达，不是畸形。且要与 `toArgsObject('') → {}` 保持一致
- `toArgsObject` 对畸形字符串**抛错而非降级成 `{}`**：静默降级会让工具在缺参状态下真的执行一遍，比直接失败危险得多
- **`toArgsJson` 必须与 `toArgsObject` 对称校验**（code review 发现的第三处不一致）：polyfill 5.1.0 的 `parseChromeToolInput` 明文接受数组（`Array.isArray(value) || isPlainObject(value)`），若 `toArgsJson` 对任何非字符串入参都直接 `JSON.stringify` 透传，`mc.executeTool(tool, [1,2])` 在 object 档会被响亮拒绝、在 string/polyfill 档却让工具体收到一个数组 —— 解构出的命名参数全是 `undefined`，破坏性工具就在缺参状态下真的执行一遍。附带：`JSON.stringify(() => {})` 返回 `undefined` 而非字符串，会违反 `: string` 的声明类型

`__isWebMCPPolyfill === true → 'string'` 这条短路**绑定 polyfill 5.x**（6.0.0 已改对象方向），实现处必须加版本前提注释，避免将来升 polyfill 时它变成静默错误源。

## 6. 宿主形态矩阵

| 档 | `getTools()` 的 raw `inputSchema` | `executeTool` 期望第二参 | 需要轴二 | 需要轴一 |
| --- | --- | --- | --- | --- |
| Chrome 155+ 原生 | object（实测 20/20） | **object**（实测） | 否（严格 no-op） | 否（透传）；仅「业务代码传字符串」时需要 |
| Chrome 149–154 原生 | **string**（上游类型声明背书，⚠️ 非本机实证） | **string**（⚠️ 非本机实证） | **是** | **是** |
| Chrome 146–148 原生 | nexus 合成版已 `coerceInputSchema` → object | 按名 + string | 否（已归一，守卫跳过） | 在合成函数内部做 |
| polyfill 5.1.0 自持 | object（dist 中 `JSON.parse(serialized)`） | **string**（`parseChromeToolInput` 硬 `JSON.parse`） | 否（严格 no-op） | **是** |

**只有原生 149–154 两轴都需要，且它是唯一无法本地实证的一档。**

必须显式承认：**轴二的全部价值押在这一档上。** 但仍值得做 —— 采用方案 A 后轴二在其余三档是**严格 no-op**（整批无字符串 schema → 返回原数组、原引用），做错的代价趋近于零；不做的代价是 149–154 上工具**静默消失**（比报错更难发现）。

polyfill 5.1.0 与 relay 6.x 已逐项核对，差异**只有本 spec 两条轴**：`getTools()` 返回 object schema（过 relay 的 malformed 守卫）、`name`/`title`/`description`/`annotations`/`window`/`origin` 齐备、`extends EventTarget` 且派发 `toolchange`、`executeTool` resolve 成字符串（匹配 relay 的 `normalizeSerializedToolResult`）。relay 不监听 `toolactivated`/`toolcancel`，polyfill 5.1.0 缺这两个事件不构成问题。

## 7. 改动清单

### 7.1 已落地（工作区未提交，零运行时风险）

- `apps/demo/index.html` —— embed `@5` → `@latest`，注释已改写（保留了「必须经典同步 script：embed.js 靠 `document.currentScript` 读 `data-*` 属性」「自托管需同目录提供 `widget.html`，否则 relay fails closed」两条仍成立的约束）
- `packages/webmcp-sdk/src/model-context.ts` —— `WebMcpHostContext.executeTool` 第二参 `string` → `object | string`；新增 `ExecuteToolInputShape` / `toArgsJson` / `toArgsObject` / `coerceExecuteToolInput` 与四个私有标记。**四个 helper 目前零调用点，是死代码**，由归一层接上

类型放宽是安全的：`@mcp-b/webmcp-types@5.1.0` 的 `ModelContext` **不含** `executeTool`（它在独立的 `ChromeModelContextExtensions` 里），而 `WebMcpHostContext` 只 `Omit<ModelContext, 'registerTool'>`，所以 nexus 这条声明是唯一来源，不会与上游类型形成重载交集。

### 7.2 提交划分

| 提交 | 内容 | 运行时风险 |
| --- | --- | --- |
| **提交 1** | §7.1 已落地的两处 | 零。类型放宽不改运行时；helper 仍是死代码 |
| **提交 2** | §7.3 全部 + §7.4 单测 + §7.5 文档 | `registry.ts` 与 `DebugPanel.tsx` **必须同批** |

**为什么不能拆**：调试面板不经 relay、直连宿主（`getModelContext()` 每次实时读 `document.modelContext`、无缓存），所以它传什么形态宿主就得收什么形态，与 embed 版本无关。若只改调试面板传对象而归一层未落地，polyfill 5.1.0 收到对象必抛（`parseChromeToolInput` 硬 `JSON.parse` → `"[object Object]"` → `createUnknownError`），146–148 档同样坏（合成版把对象原样透传给 testing 面），149–154 档按 §9 假设也坏。净效果是调试面板从「155 坏、三档好」变成「155 好、三档坏」。且调试面板的改动不在 `registry.ts` 里，`revert registry.ts` **撤不掉它** —— 回滚后三档停在报错态，比什么都不做更糟。

### 7.3 代码改动

**`packages/webmcp-sdk/src/model-context.ts`**

- `toArgsJson('')` → 返回 `'{}'`（当前原样返回 `''`）
- `__isWebMCPPolyfill` 短路处加 polyfill 5.x 版本前提注释
- 新增标记声明：`__webmcpNexusGetToolsSynthesized`、`__webmcpNexusGetToolsWrapped`（另两个已随 §7.1 落地）
- `coerceExecuteToolInput` 保留（轴一有两个调用点，语义命名有价值）

**`packages/webmcp-sdk/src/registry.ts`**

- 新增 `resolveInputShape(mc, originalGetTools)` / `wrapExecuteToolForInputShape` / `wrapGetToolsForSchemaShape` / `ensureHostShapeCompat`，结构见 §5.1–5.3、§5.5
- `synthesizeExecuteToolIfMissing`：入口收 `unknown`，转发给 testing 面前 `toArgsJson(inputArgs)`；真正定义合成函数时打 `__webmcpNexusExecuteToolSynthesized`
- `synthesizeDescriptorApiIfMissing`：真正定义合成 `getTools` 时打 `__webmcpNexusGetToolsSynthesized`；**既有的畸形 schema 降级行为不改**（§5.4）
- `patchModelContextEventSupport` 的现代宿主分支与旧宿主分支都接入 `ensureHostShapeCompat`

**`apps/demo/src/components/DebugPanel.tsx`**

- `buildArgs` 产出 `Record<string, unknown>` 而非 JSON 字符串
- `callTool` 第二参改对象，规范面分支直接传对象
- `modelContextTesting` 兜底分支（按名 + 字符串调用）**就地** `JSON.stringify(args)`，不 import helper —— helper 未在 `index.ts`/`testing.ts` 导出，而 DebugPanel 从 `webmcp-nexus-sdk/testing` 导入。该分支在 Chrome 155 上是死代码（testing 面已移除），但 146–148 档仍需要，保留

### 7.4 测试

**`packages/webmcp-sdk/src/__tests__/host-helpers.ts`** —— 新增 `makeObjectEraHost()` / `makeStringEraHost()` / `makePolyfillHost()`。现有 `makeModernHost` 的 `getTools` 返回 `[]` 且**无** `executeTool`，`makeLegacyHost` 只有 `registerTool`/`unregisterTool`，都不适用。假宿主必须返回带 `window: globalThis.window`、`origin: 'http://localhost:3000'` 的工具（四键保真断言需要）

**`packages/webmcp-sdk/src/__tests__/registerGlobalTools.test.ts`** —— 25 条用例：

*轴一*
1. object-era 原生透传 —— 宿主收到同一对象引用（`toBe`）
2. string-era 原生转字符串 —— 宿主收到 `JSON.stringify(args)`
3. polyfill 档转字符串且**不调 `getTools`** —— `toHaveBeenCalledTimes(0)`
4. 合成 `executeTool` 转字符串 —— testing 面收到 `(name, '{"a":1}')`
5. 字符串入参在 object-era 转对象 —— 宿主收到 `{a:1}`
6. 畸形字符串抛错而非降级 —— `'not json'` / `'[1,2]'` 分别 reject `SyntaxError` / `TypeError`，且宿主 `executeTool` **未被调用**（证明不会误执行工具）
7. 无参 —— `undefined` / `{}` / `''` 在 string-era 得 `'{}'`，object-era 得 `{}`

*轴二*
8. string-era 假宿主返回的工具经包装后，`window`/`origin`/`title`/`description`/`annotations` **全部保真**，且 `wrapped !== raw`（证明没有就地改写宿主对象）。⚠️ **不能用 `toBe` 断言「`executeTool` 收到的就是原对象」** —— 拷贝实现下必然失败
9. object schema 的工具透传**原引用**（`toBe`）
10. 畸形 schema（`coerceInputSchema` 返回 `null`）的工具**保留原字符串**、不被丢弃、不被降级
11. 包装后的 `getTools` 产物满足 relay 6.x 守卫形状（`inputSchema` 为非数组对象）
20. 混合列表 —— 同批里字符串 schema 与对象 schema 并存，只有字符串那些被拷贝改写，对象那些 `toBe` 原引用
21. 整批无字符串 schema → 返回**原数组引用**（`toBe`）
25. `getTools(options)` 透传 —— rest args 转发，断言原函数收到同一 options 对象

*判定、守卫与缓存*
12. `__webmcpNexusGetToolsSynthesized` 守卫 —— 有原生 `executeTool` 但 `getTools` 是合成版的宿主，轴二跳过、轴一**仍装上**
13. **自指陷阱回归** —— string-era 宿主上，断言包装后的 `mc.getTools()` 返回 object 的**同时**，`executeTool` 仍收到字符串
14. 判定结果缓存 —— 连续两次调用，`originalGetTools` **总共只调一次**
15. 空列表不缓存 —— 首次 `[]`、二次返回 string schema 工具 → 第二次按 string 转发
16. cross-document 不干扰 —— 混入 `window !== globalThis.window` 且 schema 为 object 的工具，同时有 same-document string schema → 判为 string-era
17. `getTools()` reject → 落 `'object'`、不缓存、不抛穿
18. 不变量 —— 包装后 `Object.keys(mc)` 仍为 `[]`
19. **防重复包装**（原设计此用例会假绿，因为 `patchModelContextEventSupport` 开头就 `if (modelContextPatched) return`，同一测试里连调两次第二次直接返回）—— 改为 `patch → clearRegistry() → 再 patch`，断言 `mc.executeTool` 引用与第一次**相同**
23. 传感器优先 —— 先调 `getTools()` 再调 `executeTool()`，断言 `originalGetTools` 总共只被调一次（轴二喂了传感器，轴一无需冷启动探测）
24. **缓存窗口回归** —— 首次 `getTools()` 只返回 cross-document 工具（`window !== globalThis.window`，schema 为对象），断言**不写缓存**；随后出现 same-document 字符串 schema 工具，断言轴一按 string 转发

*code review 补强（26–32）*

26. **无 `inputSchema` 的样本不参与投票** —— same-document 但整键省略 `inputSchema` 的工具，断言传感器**不被写成 `'object'`**（P1 缓存毒化的回归）
27. **轴一 rest args 透传 options** —— 断言 `mock.calls[0][2]` 是同一 options 引用。删掉 `...rest` 这条就会失败；本仓有过「包装器丢弃 signal 导致工具无法感知取消」的踩坑记录
28. **并发首调只探测一次** —— 三个并发 `executeTool`，断言 `originalGetTools` 只调一次、三次入参都正确转换、探测结束后在途 Promise 被清掉
29. **`null` 入参** —— 两档都归一为「无参」（`'{}'` / `{}`）
30. **数组入参两档都拒绝** —— `toArgsJson` 与 `toArgsObject` 校验对称（polyfill 明文接受数组，放行会让破坏性工具在缺参状态下执行）
31. **轴二畸形 schema 的告警文案准确且去重** —— 连调三次 `getTools()` 只出一条 warn，文案含 `passing it through unchanged`、**不含** `was skipped`
32. **判定退化留面包屑** —— `getTools()` reject 时出一条含 `NotAllowedError` 与 `assuming object input` 的 warn，每宿主至多一次，且落 `'object'`、不缓存的语义不变

**测试改名**（原 spec 指错了对象）：

- `registerGlobalTools.test.ts` 那个 describe「现代宿主零 patch」**仍然成立，不改名** —— `makeModernHost` 没有 `executeTool`，轴一守卫直接返回，该宿主改后真的仍是零 patch
- 真正变假的是 `polyfill.test.ts` 的「…`patchModelContextEventSupport` 不污染宿主实例」与其行内注释「nexus 在现代宿主上零 patch，所以实例仍无可枚举 own key」，以及 `webmcp-upgrade.test.tsx` 的「nexus 不污染宿主实例（polyfill 刻意维持 "ModelContext instance has no own keys"）」—— 这两处用**真实 polyfill**，有原生 `executeTool`，归一层会真的装上 own property。`Object.keys(...) === []` 断言仍会通过（own property 不可枚举），但名字与注释变假 → 改为「不写**可枚举** own key（归一层用不可枚举属性）」

### 7.5 文档

**README（中英同步）** —— 需改的行：`:244,252,259,288,383,385,388,390,418,423,481`，外加 `packages/webmcp-sdk/README.md:40` 与 `README.en.md:39`。

| 位置 | 现状 | 处理 |
| --- | --- | --- |
| `:244` | `npx -y …@5`；「`@mcp-b/webmcp-polyfill` 5.x（**本 SDK 已内置**）」 | 版本改 `@latest`；「已内置」是**错的**，见下 |
| `:252,259` | embed 钉 `@5` + 钉版理由 | 改 `@latest`，理由换成 §4.1 |
| `:288` | MCP 配置 `"args": ["-y", "…@5"]` | 改 `@latest` |
| `:383` | 「Chrome 150+ 档 **nexus 不改写宿主对象**」 | **唯一真正变假的普遍陈述** → 说明会装不可枚举的 `getTools`/`executeTool` 归一包装 |
| `:385` | 146–148 档「合成 getTools/executeTool 使 relay 5.x 可发现调用」 | 补 relay 6.x |
| `:388` | 「**relay 5.x 全档可用**」 | 改为 §4.3 的有条件表述，并注明 6.x 会丢弃字符串 schema 的工具 |
| `:390` | 「Chrome 149 起的 same-document 工具仍返回序列化字符串」 | 补 Chrome 155 起返回对象（实测 20/20），并引上游类型声明 |
| `:418` | 「relay 的 `embed.js` 需升到 **5.x**」 | 与 `@latest` 决策**直接冲突**，必改 |
| `:423` | 「Chrome 149+ 请升到 relay 5.x」+「nexus 属上游 Runtime Compatibility 第 3 条覆盖」 | 前半改 `@latest`；后半已被 relay README 的 object-input 限定**证伪** |
| `:481` | 「本机 Agent 桥接：`@mcp-b/webmcp-local-relay@5.1.0`」 | 改 `6.0.0` |
| SDK README `:40` / `:39` | 「内置的 / bundled」 | 同 `:244` |

「**本 SDK 已内置 polyfill**」这个错误共 4 处，已实证未内置：`packages/webmcp-sdk/package.json` 里是 `dependencies`，tsup 默认 externalize dependencies，产物确为外部导入（`dist/chunk-EBNDTL2D.js` 的 `import { initializeWebMCPPolyfill, … } from "@mcp-b/webmcp-polyfill"`、`dist/index.cjs`、`dist/testing.cjs`），且 `grep parseChromeToolInput dist/*` 零命中 → 确认未内联。改为「声明为依赖，由消费方打包器解析」。

**引用方式**：本文与后续修订一律用**符号引用**而非行号（`coerceInputSchema`、`isModernHost`、`getModelContextTesting` 的行号已因 diff 全部 drift）。上表的 README 行号是本次核对时的值，实施时以内容匹配为准。

**CHANGELOG.md**：**本批不写**。`scripts/changelog.mjs` 的 `upsertChangelog` 把新版本块插到**第一个 `## ` 标题之前**（`scripts/changelog.mjs:294-296`），若现在加 `## Unreleased`，下次发版的块会被插到它上面，产生「已发布版本排在 Unreleased 之上」的错序。本仓约定是发版时由脚本生成 auto 段、人工补该版本的 manual 段。

> **发版提醒**：切下一个版本时，需在该版本的 `<!-- manual:start -->` 段补三条契约变更 ——
> ① 对外类型契约：`WebMcpHostContext.executeTool` 第二参 `string` → `object | string`；
> ② 宿主对象行为：原生档开始写**不可枚举**的 `getTools`/`executeTool` 归一包装（`Object.keys` 仍为 `[]`，但 polyfill 档 `for...in` 不再产出这两个方法）；
> ③ relay 版本策略：demo 的 embed 从 `@5` 改为 `@latest`。

**不做**：`apps/demo/dist/index.html` 与 `dist-webpack/index.html` 各有一份 embed 拷贝，但两个目录**均未被 git 跟踪**（`git ls-files` 零命中），改它们不产生 diff。dev server 走源 `index.html`，不影响实测；只有直接 serve `dist/` 才会重现故障。

### 7.6 不动

`packages/webmcp-sdk/package.json`（polyfill `^5.1.0`、`@mcp-b/webmcp-types` `5.1.0` 均不变）、`polyfill.ts`、`callTool`/`listTools` 合成面（relay 2.x 路径）、`webmcp-core`、两个构建插件、`pushToolsToWidget`/`getToolsForWidget`（走 `mc.listTools()`，不碰这两个方法）。

## 8. 验证

### 8.1 门禁命令（已实测，勿用想当然的命令）

`pnpm -w typecheck` **跑不起来** —— 根 `package.json` 与五个子包都没有 `typecheck` script，实测报 `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "typecheck" not found`。`pnpm lint` 也不能当门禁 —— **基线已红**（`✖ 163 problems (161 errors, 2 warnings)`、exit 1，含与本改动无关的 `react-hooks/refs` 等）。

实测可用（均 exit 0）：

```bash
pnpm --filter webmcp-nexus-sdk  exec tsc --noEmit -p tsconfig.json
pnpm --filter webmcp-nexus-demo exec tsc -p tsconfig.app.json --noEmit
pnpm --filter webmcp-nexus-sdk  test        # 基线 149 用例全过
pnpm --filter webmcp-nexus-demo test        # 基线 13 用例全过
```

用 `tsc -p tsconfig.app.json --noEmit` 而非 `tsc -b --force` —— 后者是 build mode，会写 `.tsbuildinfo`。

### 8.2 既有回归点

两个 `vitest.config.ts` 都钉了 `environmentOptions.jsdom.url = 'http://localhost:3000/'`，原因写在配置注释里：polyfill 的 `validateExecutableOrigin` 拒绝 `'null'` origin，jsdom 默认的 `about:blank` 会让 `executeTool` 全抛 `NotSupportedError`。两处还都注明 polyfill 的安装门是 `isSecureContext === false` **严格相等**，jsdom 下为 `undefined` 故不 early-return。改动不得破坏这两点。

`apps/demo/src/__tests__/webmcp-upgrade.test.tsx` 有三处对**真实 polyfill 5.1.0** 传字符串 `'{}'` 调 `executeTool` —— 归一层装上后第 1 条判据（`__isWebMCPPolyfill`）短路到 `'string'`，`toArgsJson('{}') === '{}'`，应仍通过。这三条是防止归一层破坏 polyfill 档的关键回归。

### 8.3 浏览器实测（Chrome 155.0.8059.40 + localhost:5173，已执行）

页面内直调：

- 两个包装器均已安装（`__webmcpNexusGetToolsWrapped` / `__webmcpNexusExecuteToolWrapped` 为 `true`）
- 传感器判为 `'object'`；`__webmcpNexusShapeWarned` 未置位（说明判定成功、未走退化路径）
- `Object.keys(document.modelContext)` 仍为 `[]`
- 20 个工具，`inputSchema` 的 `typeof` 全为 `object`
- **对象入参与字符串入参都成功**返回 `{"success":true,"clearedCount":0}`
- **数组入参被拒绝**（`TypeError`）—— §5.7 对称校验的真机证据

调试面板（按钮文案是**「执行」**）：无参 `clearCanvas` → `{"success":true,"clearedCount":0}`；有参 `drawCircle(140,140,45)` → `{"id":"shape_mv6701fw_1"}`。

完整 MCP 链路（自建 MCP 客户端 → relay server 6.0.0 → WebSocket → embed.js`@latest` → 页面）：

- `initialize` 成功，`serverInfo.version === "6.0.0"`
- `tools/list` 返回 76 个工具，`schemaTypes` 只有 `["object"]`（轴二在 155 上是严格 no-op，符合预期）
- **红绿对照**：同一个 Chrome、同一个 relay、同名工具同样参数，`localhost:5173`（本次修复）✅ 返回 `{"shapeCount":0,"shapes":[]}`，而 `alibaba.github.io/webmcp-nexus/`（线上旧构建，embed 钉 `@5`、无归一层）❌ 返回 `invalid input object: value is not an object`。唯一差别是页面构建
- **带参链路**：`drawCircle(cx:200,cy:160,radius:55,color:'#2563eb',lineWidth:3)` → `{"id":"shape_mv68depg_1"}` → `getCanvasInfo` 确认 `shapeCount:1`、`type:"circle"` → `clearCanvas` → `shapeCount:0`，5 个参数全部正确落地、副作用真实发生、状态已还原
- 控制台无 `invalid input object`、无 `input schema is malformed`

### 8.4 无法本地验证

Chrome 149–154 的两条假设（§9 U2/U3）。U1（brand check）已在规范层关闭。判错后果见 §9。

## 9. 未实证假设与判错后果

| # | 未决问题 | 为什么没把握 | 影响 | 应对 |
| --- | --- | --- | --- | --- |
| ~~U1~~ | ~~原生 Chrome 149–154 的 WebIDL 绑定是否接受浅拷贝出来的对象作为 `executeTool` 第一参~~ | ✅ **已关闭（规范层证伪）**。上游草案 IDL 是 `dictionary RegisteredTool { required DOMString name; DOMString title; required DOMString description; object inputSchema; required Window window; required USVString origin; ToolAnnotations annotations; }` 且 `Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {})`。两条推论：① `RegisteredTool` 是 **dictionary 不是 interface**，WebIDL 的 dictionary→ECMAScript 转换用 CreateDataPropertyOrThrow 逐成员建 own + enumerable 数据属性，故 `{ ...tool }` 完整保留六键；② 第一参是 dictionary → 绑定层做的是「读属性做转换」，**WebIDL 无法对 dictionary 参数表达 brand check**，所以「原生拒绝浅拷贝」在规范层不成立 | 无。轴二的浅拷贝实现是规范正确的 | 无预案。原先写的「改为就地改写 `tool.inputSchema`」预案**已删除** —— 既无必要，又严格更差（污染宿主状态，且它自己的前提「原生 `getTools()` 每次返回新对象」同样无法验证）。同理不要为此加 WeakMap 把拷贝换回原对象那类机制 |
| U2 | 原生 149–154 的 `executeTool` 是否真的只收字符串 | 上游类型声明 `ChromeModelContextExtensions.executeTool(…, inputArguments: string, …)` 是**旁证**，非运行时实证 | 轴一在该档的转换方向 | 判错则退化为改动前行为（下表推演） |
| U3 | 原生 149–154 的 same-document `getTools()` 是否返回字符串 schema | 已从 nexus 自家 README 升级为**上游类型声明明文背书**（§1.5），但仍非本机实证 | 传感器判据 | 上游同段还要求消费方 branch on `typeof`，即方案 A 本身就是上游指定的容错方式，判错时退化面最小 |
| U4 | relay 7.x 是否引入第三条轴 | 无法预知 | `@latest` 策略 | 归一层只覆盖已知两轴；README 按 §4.3 做有条件表述，不做无条件承诺 |
| U5 | `data-webmcp-relay` 属性名是否长期稳定 | `registry.ts` 的 `pushToolsToWidget` 靠它排除 relay iframe；已核实 6.0.0 仍匹配 | 若上游改名，排除失效 → nexus 把自己的工具子集推给 relay widget 覆盖其快照 → 工具丢失 | 仅记录，不在本批处理 |
| U6 | 传感器与在途 Promise 缓存的清理在真实 HMR 下是否完备 | HMR 换模块后宿主对象上的隐藏属性仍在，但闭包与模块状态是新的 | 跨模块读到同一宿主属性，理论上仍是同一结论、无害，但未实证 HMR 场景 | 用例 19 覆盖「重复 patch 不重复包装」；HMR 实际行为留待 demo 开发态观察，若发现问题再加显式失效逻辑 |

**U2/U3 的判错后果推演**（四种组合都走过）：

| 149–154 的真实情况 | 探测结果 | 改后行为 | 对比改前 |
| --- | --- | --- | --- |
| schema 字符串 + 收字符串（本 spec 假设） | string | ✅ 全通 | 改前是工具静默消失 → **改善** |
| schema 对象 + 收对象 | object | ✅ 全通 | 改前 relay 6.x 已可用 → 持平 |
| schema 对象 + 收字符串 | object | ❌ 传对象给收字符串的宿主 | 改前 relay 6.x 同样传对象同样失败 → 持平（= 退化到改前） |
| schema 字符串 + 收对象 | string | ❌ 工具救回来了但调用失败 | 改前是「看不到工具」，改后是「看得到但报错」→ 按 §3 图例算**改善** |

四种组合里没有比改前更糟的 —— **前提是 §5.3 的缓存窗口规则落实到位**。

## 10. 风险

| # | 风险 | 状态 |
| --- | --- | --- |
| 1 | Chrome 149–154 的两条形态假设 | ⚠️ 未实证（§9 U2/U3）。判错则退化为改动前行为 |
| 2 | schema-shape 判据依赖上游滚动发布边界（上游自述「rolling out… cross-document first」，边界还在上移） | ⚠️ 脆弱点。**传感器是 write-once**（命中即返回，不会每次 patch 重探 —— 本文早先版本的这句缓解措辞是错的），所以判据必须一次判对；防线是 same-document 过滤 + 无 schema 样本不投票 + 兜底结论不缓存三条。上游再翻转时改动局限在 `resolveInputShape` 与轴二包装体两处 |
| 3 | `@latest` 下 relay 出 7.x 若引入第三条轴，会静默炸且无版本可 bisect | ⚠️ 有意取舍。缓解：双轴归一已覆盖当前全部已知轴；README 按 §4.3 做有条件表述；`data-webmcp-relay` 属性名是另一处版本敏感耦合（§9 U5），已核实 6.0.0 仍匹配 |
| 4 | polyfill 5.1.0 + relay 6.x 属上游明文不建议的跨大版本组合 | ⚠️ 已逐项核对，差异只有本文两条轴（§6 末段）。属时点结论，relay 6.x 后续小版本若改别的轴需重新核对 |
| 5 | `for...in` 不再产出 `executeTool`/`getTools`（polyfill 档） | ✅ 已实测确认，全仓零消费者，§5.6 如实记录 |
| 6 | `toArgsObject` 对畸形字符串抛错，原本静默成功的调用变成显式失败 | ✅ 有意为之，用例 6 锁定 |
| 7 | `@latest` 无 SRI，CDN 或上游被投毒即可在本源执行代码 | ⚠️ 已接受。与跟随最新版互斥；demo 页场景 |
| 8 | ~~原生 149–154 可能对 `executeTool` 第一参做 brand check，浅拷贝对象被拒~~ | ✅ **已关闭**（§9 U1）：`RegisteredTool` 在上游 IDL 里是 dictionary，WebIDL 无法对 dictionary 参数表达 brand check，且 dictionary→ECMAScript 转换建的是 own + enumerable 数据属性，`{...tool}` 六键完整。原「就地改写」预案已删除 |
| 9 | 判定退化（无探测源 / `getTools()` 抛错 / 无可用样本）时静默落 `'object'`，用户只看到宿主侧一条费解的 parse 错误 | ✅ 已修：三处各留一条按宿主去重的 `console.warn` 面包屑，带 `describeError(error)` 与「若在 Chrome 149–154 上失败请反馈」。落 `'object'` 与不缓存的语义不变 —— 与同文件 `handleRegistrationFailure` 按 `error.name` 分流成五种带修复指引 warn 的诊断标准对齐 |

## 11. 复用的既有实现

- `defineHiddenProperty`（`registry.ts`）—— 隐藏属性安装，勿新写
- `coerceInputSchema`（`model-context.ts`）—— 三形态归一，**轴二直接复用它**，勿另写 `JSON.parse`
- `getModelContextTesting`（`model-context.ts`）—— 合成 `executeTool` 的数据源
- `isModernHost`（`model-context.ts`）—— 分档判据，勿重复实现
- `installFakeHost` / `teardownHost` / `makeModernHost` / `makeLegacyHost`（`__tests__/host-helpers.ts`）—— 新假宿主构造器沿用同一风格

## 12. 关键文件

- `packages/webmcp-sdk/src/registry.ts` —— 归一层主体
- `packages/webmcp-sdk/src/model-context.ts` —— helper 修两处 + 标记声明
- `apps/demo/src/components/DebugPanel.tsx` —— 传对象
- `apps/demo/index.html` —— 已落地
- `packages/webmcp-sdk/src/__tests__/host-helpers.ts`、`registerGlobalTools.test.ts`、`polyfill.test.ts`
- `apps/demo/src/__tests__/webmcp-upgrade.test.tsx`
- `README.md` / `README.en.md` / `packages/webmcp-sdk/README.md` / `packages/webmcp-sdk/README.en.md`
- `CHANGELOG.md`

## 13. 证据锚点（复核时直接核对，勿只信本文转述）

- 已发布 relay 6.0.0 产物（两条轴的实际代码 + §1.3 的调用路径）：
  `~/.npm/_npx/894e1749ce338fed/node_modules/@mcp-b/webmcp-local-relay/dist/browser/embed.js`
- relay 5.x 产物（对照，容忍字符串 schema）：
  `https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-local-relay@5/dist/browser/embed.js`
- 上游仓库 `/Users/chaobin/opensource/mcp-b`（HEAD `c649d0bd`，relay 与 polyfill 本地均 6.0.0）。
  ⚠️ 本地 HEAD **领先于**已发布的 6.0.0：`embed.ts` 已重构为纯 iframe 注入，工具调用移到 `widgetRuntime.ts`。核对时须区分「已发布 6.0.0」与「本地 HEAD」
- 上游版本约束原文：`mcp-b/apps/documentation-website/how-to/connect-desktop-agents-with-local-relay.mdx:75-77`、`mcp-b/packages/webmcp-local-relay/README.md` 的 Runtime Compatibility 段
- polyfill 5.1.0 实体（nexus 实际依赖版本）：
  `node_modules/.pnpm/@mcp-b+webmcp-polyfill@5.1.0/node_modules/@mcp-b/webmcp-polyfill/dist/`
  关键：`schema.js` 的 `parseChromeToolInput`（硬 `JSON.parse`）、`index.js` 的 `getTools`、`executeTool` 四键校验、原型方法 enumerable 循环
- polyfill 6.0.0 源码：`mcp-b/packages/webmcp-polyfill/src/index.ts`（只导出 `installWebMCP`）、`src/upstream/index.ts`（early-return 判据与 `URL.parse`）、`CHANGELOG.md` 的 6.0.0 段。
  ⚠️ `mcp-b/packages/webmcp-polyfill/dist/` 是 6 月的陈旧 gitignored 构建，仍导出已删除的 `initializeWebMCPPolyfill`，**不可作为 6.0.0 的证据**
- 上游 schema 形态与滚动发布边界：`packages/webmcp-sdk/node_modules/@mcp-b/webmcp-types/dist/model-context.d.ts`（`RegisteredTool.inputSchema` 的文档注释与 `ChromeModelContextExtensions.executeTool` 签名）
- **上游草案 WebIDL**（U1 关闭与「无 schema 样本不投票」的规范依据）：<https://webmachinelearning.github.io/webmcp/> §4.2.6 `dictionary RegisteredTool`（注意 `object inputSchema;` 非 required 无默认值）与 `interface ModelContext` 的 `Promise<DOMString> executeTool(RegisteredTool tool, optional object inputObject, optional ModelContextExecuteToolOptions options = {})`

## 14. 评审历史

2026-10-13 经 double-check skill 完整档复核。2 条必须改全部采纳（提交划分、拷贝形状），11 条建议改采纳 10 条、部分采纳 1 条（版本策略：结论采纳、论据更换）。复核请求方选的「schema 归一写法」A/B 决策取 A，并增加「轴二顺带喂传感器」的增强。

**驳回复核报告一处事实错误**：报告称「已发布 embed.js 唯一动作是注入 widget iframe」。实测 `grep -c executeTool` → **1**，是完整调用路径（`getTools().find() → executeTool(r,t)`）；`grep -c WebSocket` → 0（这半句对）。即 6.0.0 的 embed.js 同时做两件事。此纠正影响一个真实的技术判断：调用发生在**顶层页面 realm**，归一层覆盖是确定的，不需要跨 realm 处理（§1.3）—— 报告的错误描述会把实施者引向一个不存在的风险。

---

2026-10-13 实施后经 code-review skill 深度审查（2 个子 agent 并行 + 高危复核护栏）。9 个问题：**1 条 P1 与 8 条 P2/P3 全部采纳并修完**，2 条低把握项跳过（见下）。

采纳并已修：

- **P1 缓存毒化** —— `scanInputShape` 把「样本存在但整键省略 `inputSchema`」当成 object-era 的确凿证据并写进 write-once 传感器。规范级依据：上游 IDL `object inputSchema;` 非 required 无默认值。修为不计入投票（§5.3、用例 26）
- **P2 陈旧注释** —— `patchModelContextEventSupport` 外层 docstring 仍写「现代宿主完全 no-op / 零 patch」，与同函数体内已改对的注释自相矛盾；`isModernHost`（`testing.ts` 对外导出）docstring 同样。两处均已改，`defineHiddenProperty` 的 docstring 也补了 for...in 偏差
- **P2 失实告警** —— 见 §5.4
- **P2 `toArgsJson` 校验不对称** —— 见 §5.7 第三条
- **P2 静默退化零诊断** —— 三处落 `'object'` 各加一条按宿主去重的面包屑（风险 #9）
- **P2 README 越界承诺** —— 中英 `:391` 都写下了 §4.3 明文禁止的无条件承诺，已改为有条件表述并标注 149–154 档基于推定
- **P3 类型声明失实** —— `__webmcpNexusInputShapeProbe` 声明为 `Promise<ExecuteToolInputShape>`，实际存 `Promise<{shape, definitive}>`；已抽出并导出 `InputShapeProbeResult`
- **P3 DebugPanel 注释理由失实** —— 兜底分支在**四档全是死代码**（`main.tsx` 模块顶层就调 `registerGlobalTools`，146–148 档 nexus 已合成 getTools/executeTool），不只是 Chrome 155；注释已改
- **P3 测试补强** —— 用例 26–32

**U1 由本轮审查关闭**（规范层证伪，两个 reviewer 独立用同一份草案 IDL 得出同一结论，我方已从一手规范复核）：`RegisteredTool` 是 dictionary 不是 interface，WebIDL 无法对 dictionary 参数表达 brand check，且 dictionary→ECMAScript 转换建的是 own + enumerable 数据属性，故 `{...tool}` 六键完整。原「就地改写 `tool.inputSchema`」预案已删除。

跳过（2 条低把握项，均已记录理由）：

- **`data-webmcp-relay` 选择器改显式 opt-in**（reviewer 把握 65，且自述「本地 npx 缓存只有 relay 5.1.0，无法核 6.0.0 的 `RELAY_IFRAME_SELECTOR` 字面量」）。**我方已核实 6.0.0 仍匹配**（published `embed.js` 里 `` f=`[data-webmcp-relay]` `` 与 `` setAttribute(`data-webmcp-relay`,`1`) ``），今天不构成故障；改 opt-in 是行为变更，超出本批范围。已记为 §9 U5
- **守卫标记被外力删除导致二次包装**（把握 60）。需要第三方主动 `delete` 或重新 `defineProperty` 宿主方法；现实复位路径（`clearRegistry` / HMR / 双 SDK 副本）都已被 `…Wrapped` 守卫防住且用例 19 锁定

审查同时认可了三处有意偏离（CHANGELOG 不改、测试放新文件、传感器读取顺序偏离 §5.3 原文），并明确「不建议动」三条，均已遵循：不加 WeakMap 换回原对象、不保留就地改写预案、不重新翻案 `@latest` + 无 SRI 的取舍。
