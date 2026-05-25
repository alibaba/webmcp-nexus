# Open-source Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 monorepo 中所有 `@ali/*` 包重命名为公开 npm 包（去掉 `@ali/` scope），切除阿里内网/tnpm 依赖，改用纯 pnpm + 公网 npm registry，并验证 build/test/dev 全链路正常。

**Architecture:**

- 4 个发布包重命名为无 scope 名（`webmcp-nexus-core`, `webmcp-nexus-sdk`, `vite-plugin-webmcp-nexus`, `webpack-plugin-webmcp-nexus`），保留语义一致性。
- 所有源码、测试、配置文件中的 `@ali/...` import 字符串同步替换。
- `scripts/publish.sh` 改写为基于 `pnpm publish -r --access public` 的极简版本，删掉 tnpm + tgz workaround。
- 各包 `package.json` 移除 `publishConfig.registry`（默认指向公网 registry），README/Skill 文档同步更新。
- 验证：`pnpm install` → `pnpm build` → `pnpm test` → `pnpm dev` 全部通过。

**Tech Stack:** pnpm 10 workspace、TypeScript、tsup、vitest、Vite 8、Webpack 5、React 19。

---

## 命名映射表

| 旧包名 (@ali/)                  | 新包名 (公网)                | 路径                              |
| ------------------------------- | ---------------------------- | --------------------------------- |
| `@ali/webmcp-nexus-core`        | `webmcp-nexus-core`          | `packages/webmcp-core`            |
| `@ali/webmcp-nexus-sdk`         | `webmcp-nexus-sdk`           | `packages/webmcp-sdk`             |
| `@ali/vite-plugin-webmcp-nexus` | `vite-plugin-webmcp-nexus`   | `packages/vite-plugin-webmcp`     |
| `@ali/webpack-plugin-webmcp-nexus` | `webpack-plugin-webmcp-nexus` | `packages/webpack-plugin-webmcp` |

---

## 待修改文件清单

**Modify (package.json — 改 name + 删 publishConfig + 改依赖名):**
- `packages/webmcp-core/package.json`
- `packages/webmcp-sdk/package.json`
- `packages/vite-plugin-webmcp/package.json`
- `packages/webpack-plugin-webmcp/package.json`
- `apps/demo/package.json`
- `package.json` (root)

**Modify (源代码 import 替换):**
- `packages/vite-plugin-webmcp/src/index.ts`
- `packages/vite-plugin-webmcp/tsup.config.ts`
- `packages/webpack-plugin-webmcp/src/loader.ts`
- `packages/webpack-plugin-webmcp/src/__tests__/loader.test.ts`
- `packages/webpack-plugin-webmcp/tsup.config.ts`
- `apps/demo/src/main.tsx`
- `apps/demo/src/components/SearchBar.tsx`
- `apps/demo/src/components/FilterPanel.tsx`
- `apps/demo/src/components/TaskFormDialog.tsx`
- `apps/demo/src/pages/DashboardPage.tsx`
- `apps/demo/src/pages/ProjectDetailPage.tsx`
- `apps/demo/src/pages/ProjectsPage.tsx`
- `apps/demo/src/pages/TasksPage.tsx`
- `apps/demo/src/pages/TagsPage.tsx`
- `apps/demo/src/__tests__/DebugPanel.test.tsx`
- `apps/demo/src/__tests__/tools.scope.test.tsx`
- `apps/demo/vite.config.ts`
- `apps/demo/vitest.config.ts`
- `apps/demo/webpack.config.ts`

**Modify (脚本与文档):**
- `scripts/publish.sh` — 重写为 `pnpm publish -r --access public`
- `README.md` — 改包名、移除阿里/tnpm 段落
- `skill/SKILL.md` — 改包名、改安装命令

---

### Task 1: 重命名 4 个发布包的 package.json

**Files:**
- Modify: `packages/webmcp-core/package.json`
- Modify: `packages/webmcp-sdk/package.json`
- Modify: `packages/vite-plugin-webmcp/package.json`
- Modify: `packages/webpack-plugin-webmcp/package.json`

变更要点：
1. `name` 去掉 `@ali/` 前缀
2. 删除 `publishConfig.registry`（让它默认走公网 registry）
3. `dependencies` 中对内部 workspace 包的引用改成新名

- [ ] **Step 1: 改 `packages/webmcp-core/package.json`**

把 `"name": "@ali/webmcp-nexus-core"` 改为 `"name": "webmcp-nexus-core"`，并删除整段：
```json
  "publishConfig": {
    "registry": "https://registry.npm.alibaba-inc.com"
  },
```

- [ ] **Step 2: 改 `packages/webmcp-sdk/package.json`**

把 `"name": "@ali/webmcp-nexus-sdk"` 改为 `"name": "webmcp-nexus-sdk"`，并删除 `publishConfig` 块。

- [ ] **Step 3: 改 `packages/vite-plugin-webmcp/package.json`**

- `"name": "@ali/vite-plugin-webmcp-nexus"` → `"name": "vite-plugin-webmcp-nexus"`
- 删除 `publishConfig` 块
- 依赖中：
  - `"@ali/webmcp-nexus-core": "workspace:*"` → `"webmcp-nexus-core": "workspace:*"`
  - `"@ali/webmcp-nexus-sdk": "workspace:*"` → `"webmcp-nexus-sdk": "workspace:*"`

- [ ] **Step 4: 改 `packages/webpack-plugin-webmcp/package.json`**

- `"name": "@ali/webpack-plugin-webmcp-nexus"` → `"name": "webpack-plugin-webmcp-nexus"`
- 删除 `publishConfig` 块
- 依赖：`"@ali/webmcp-nexus-core": "workspace:*"` → `"webmcp-nexus-core": "workspace:*"`

- [ ] **Step 5: 校验**

Run: `node -e "['packages/webmcp-core','packages/webmcp-sdk','packages/vite-plugin-webmcp','packages/webpack-plugin-webmcp'].forEach(p=>{const j=require('./'+p+'/package.json');console.log(p,j.name,j.publishConfig||'no-publishConfig')})"`

Expected: 4 个新包名（无 @ali/ 前缀）+ 全部 `no-publishConfig`。

---

### Task 2: 更新 demo 应用的 package.json

**Files:**
- Modify: `apps/demo/package.json`

- [ ] **Step 1: 替换 demo 内部依赖名**

把：
- `"@ali/webmcp-nexus-sdk": "workspace:*"` → `"webmcp-nexus-sdk": "workspace:*"`
- `"@ali/vite-plugin-webmcp-nexus": "workspace:*"` → `"vite-plugin-webmcp-nexus": "workspace:*"`
- `"@ali/webpack-plugin-webmcp-nexus": "workspace:*"` → `"webpack-plugin-webmcp-nexus": "workspace:*"`

- [ ] **Step 2: 校验**

Run: `node -e "const j=require('./apps/demo/package.json');console.log(JSON.stringify({deps:j.dependencies,devDeps:j.devDependencies},null,2))" | grep -E 'webmcp|@ali'`

Expected: 出现 3 个新名字，无 `@ali/` 残留。

---

### Task 3: 更新根 package.json 中的 filter 名

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 替换 scripts 中的 filter 名**

- `pnpm --filter @ali/webmcp-nexus-sdk build` → `pnpm --filter webmcp-nexus-sdk build`
- `pnpm --filter @ali/vite-plugin-webmcp-nexus build` → `pnpm --filter vite-plugin-webmcp-nexus build`

- [ ] **Step 2: 校验**

Run: `grep '@ali/' package.json || echo "clean"`

Expected: `clean`

---

### Task 4: 替换源代码中的 import 字符串

**Files:**
- Modify: `packages/vite-plugin-webmcp/src/index.ts`
- Modify: `packages/vite-plugin-webmcp/tsup.config.ts`
- Modify: `packages/webpack-plugin-webmcp/src/loader.ts`
- Modify: `packages/webpack-plugin-webmcp/src/__tests__/loader.test.ts`
- Modify: `packages/webpack-plugin-webmcp/tsup.config.ts`

- [ ] **Step 1: 用 sed 一次性替换 packages/ 下的 @ali/ 前缀**

Run:
```bash
LC_ALL=C find packages -type f \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/node_modules/*' -not -path '*/dist/*' -print0 \
  | xargs -0 sed -i '' \
    -e 's|@ali/webmcp-nexus-core|webmcp-nexus-core|g' \
    -e 's|@ali/webmcp-nexus-sdk|webmcp-nexus-sdk|g' \
    -e 's|@ali/vite-plugin-webmcp-nexus|vite-plugin-webmcp-nexus|g' \
    -e 's|@ali/webpack-plugin-webmcp-nexus|webpack-plugin-webmcp-nexus|g'
```

- [ ] **Step 2: 校验**

Run: `grep -rn '@ali/' packages/ --include='*.ts' --include='*.tsx' || echo "clean"`

Expected: `clean`

---

### Task 5: 替换 demo 应用源代码的 import 字符串

**Files:**
- Modify: `apps/demo/src/**/*.{ts,tsx}`
- Modify: `apps/demo/vite.config.ts`
- Modify: `apps/demo/vitest.config.ts`
- Modify: `apps/demo/webpack.config.ts`

- [ ] **Step 1: 用 sed 替换 apps/demo 下所有 ts/tsx 中的 @ali/ 前缀**

Run:
```bash
LC_ALL=C find apps/demo -type f \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/node_modules/*' -not -path '*/dist/*' -print0 \
  | xargs -0 sed -i '' \
    -e 's|@ali/webmcp-nexus-core|webmcp-nexus-core|g' \
    -e 's|@ali/webmcp-nexus-sdk|webmcp-nexus-sdk|g' \
    -e 's|@ali/vite-plugin-webmcp-nexus|vite-plugin-webmcp-nexus|g' \
    -e 's|@ali/webpack-plugin-webmcp-nexus|webpack-plugin-webmcp-nexus|g'
```

- [ ] **Step 2: 全仓再扫一次**

Run: `grep -rn '@ali/' --include='*.ts' --include='*.tsx' --include='*.json' --include='*.js' . | grep -v node_modules | grep -v dist | grep -v pnpm-lock.yaml || echo "clean"`

Expected: `clean`（README/SKILL/publish.sh 还没改，会有匹配，下面任务处理；如果只剩这些就继续）

---

### Task 6: 重写 scripts/publish.sh

**Files:**
- Modify: `scripts/publish.sh`

新脚本目标：用 `pnpm publish -r --access public` 一条命令完成所有 packages 发布；保留 `DRY_RUN` 与 `VERSION` 两个环境变量；移除 tnpm、tgz workaround、强制覆盖发布逻辑（公网 npm 不允许同版本覆盖，统一通过 bump 解决）。

- [ ] **Step 1: 全文替换为下面内容**

```bash
#!/usr/bin/env bash
# 一键发布所有 webmcp-nexus 包到公网 npm registry
# - 使用 pnpm publish -r 串行发布 packages/* 下所有 public 包
# - 设置 DRY_RUN=1 只 pack 不发布，用于预检
# - 设置 VERSION=patch|minor|major|x.y.z 控制版本递增（默认 patch）
set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
VERSION="${VERSION:-patch}"

PACKAGES=(
  "packages/webmcp-core"
  "packages/webmcp-sdk"
  "packages/vite-plugin-webmcp"
  "packages/webpack-plugin-webmcp"
)

PACKAGE_NAMES=(
  "webmcp-nexus-core"
  "webmcp-nexus-sdk"
  "vite-plugin-webmcp-nexus"
  "webpack-plugin-webmcp-nexus"
)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── 版本号计算 ──────────────────────────────────────────────
CURRENT_VERSION=$(node -e "console.log(require('./${PACKAGES[0]}/package.json').version)")

NEW_VERSION=$(node -e "
const cur = '${CURRENT_VERSION}';
const arg = '${VERSION}';
if (!/^\d+\.\d+\.\d+$/.test(cur)) {
  console.error('Invalid current version: ' + cur);
  process.exit(1);
}
const parts = cur.split('.').map(Number);
if (/^\d+\.\d+\.\d+$/.test(arg)) {
  console.log(arg);
} else if (arg === 'major') {
  console.log((parts[0] + 1) + '.0.0');
} else if (arg === 'minor') {
  console.log(parts[0] + '.' + (parts[1] + 1) + '.0');
} else if (arg === 'patch') {
  console.log(parts[0] + '.' + parts[1] + '.' + (parts[2] + 1));
} else {
  console.error('Invalid VERSION: ' + arg);
  process.exit(1);
}
")

echo "Version bump: ${CURRENT_VERSION} -> ${NEW_VERSION}"
[ "$DRY_RUN" = "1" ] && echo "DRY RUN: 只构建 + pack，不发布"

if [ "$DRY_RUN" != "1" ]; then
  echo "Packages to publish:"
  for name in "${PACKAGE_NAMES[@]}"; do echo "  - $name"; done
  printf "Continue? (y/N) "
  read -r CONFIRM
  if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled"
    exit 1
  fi
fi

# ── 更新版本号（仅非 DRY_RUN） ──────────────────────────────
if [ "$DRY_RUN" != "1" ]; then
  for pkg in "${PACKAGES[@]}"; do
    node -e "
const fs = require('fs');
const path = '${ROOT_DIR}/${pkg}/package.json';
const json = JSON.parse(fs.readFileSync(path, 'utf8'));
json.version = '${NEW_VERSION}';
fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
"
    echo "  ${pkg}/package.json -> ${NEW_VERSION}"
  done
fi

# ── 构建 ───────────────────────────────────────────────────
echo ""
echo "Building all packages..."
pnpm -r --filter "./packages/*" exec rm -rf dist
pnpm -r --filter "./packages/*" run build

# ── 发布 ───────────────────────────────────────────────────
if [ "$DRY_RUN" = "1" ]; then
  echo ""
  echo "[DRY-RUN] pnpm pack each package to preview tgz contents:"
  for pkg in "${PACKAGES[@]}"; do
    (cd "$ROOT_DIR/$pkg" && rm -f ./*.tgz && pnpm pack >/dev/null && \
      tgz=$(ls ./*.tgz | head -n1) && \
      echo "--- $pkg ($tgz) ---" && \
      tar -xzOf "$tgz" package/package.json | grep -E '"(name|version|webmcp)' && \
      rm -f ./*.tgz)
  done
  echo ""
  echo "DRY RUN done. Run without DRY_RUN=1 to publish for real."
else
  echo ""
  echo "Publishing via pnpm publish -r --access public..."
  pnpm -r --filter "./packages/*" publish --access public --no-git-checks
  echo ""
  echo "All packages published as v${NEW_VERSION}."
fi
```

- [ ] **Step 2: 校验脚本语法**

Run: `bash -n scripts/publish.sh && echo OK`

Expected: `OK`

---

### Task 7: 重写 README.md

**Files:**
- Modify: `README.md`

需要改的段落：
- 「发布到阿里内网 registry 的包名」→ 「发布到 npm 的包名」并改 4 个包名
- 所有 `@ali/...` 导入示例 → 去掉 scope
- 「## 发布」整节改成基于公网 npm 的简单流程，删掉所有 tnpm、`registry.npm.alibaba-inc.com`、`--force-publish-registry` 内容

- [ ] **Step 1: 用 sed 批量替换 README 内 4 个包名**

Run:
```bash
sed -i '' \
  -e 's|@ali/webmcp-nexus-core|webmcp-nexus-core|g' \
  -e 's|@ali/webmcp-nexus-sdk|webmcp-nexus-sdk|g' \
  -e 's|@ali/vite-plugin-webmcp-nexus|vite-plugin-webmcp-nexus|g' \
  -e 's|@ali/webpack-plugin-webmcp-nexus|webpack-plugin-webmcp-nexus|g' \
  README.md
```

- [ ] **Step 2: 重写「## 发布」整节**

将 README 中从 `## 发布` 到末尾「## 许可证」之前的所有内容替换为：

```markdown
## 发布

所有包发布到公网 npm registry。

### 一键发布

```bash
pnpm release
```

`scripts/publish.sh` 流程：

1. 计算新版本号（默认 `patch` 递增，可用 `VERSION=minor` / `VERSION=major` / `VERSION=1.2.3` 覆盖）
2. 同步更新所有包的 `version`
3. `pnpm -r --filter "./packages/*" run build` 构建
4. `pnpm publish -r --access public --no-git-checks` 串行发布到 npm

### 预检（DRY RUN）

```bash
DRY_RUN=1 pnpm release
```

只构建 + 打 tgz，不真的发版，可以预览每个包内 `package.json` 的依赖版本替换效果。

### 发布前置条件

- 已 `npm login`（`npm whoami` 能看到账号）
- 各包的 `version` 已 bump（脚本会自动 bump，`DRY_RUN=1` 不修改）
- 包名在 npm 上未被占用（首次发布时确认）

### 关键细节

- **`workspace:*` 替换**：pnpm 的 `pnpm publish` 会自动把内部依赖的 `workspace:*` 替换成发布时的真实版本号（如 `^0.1.0`），下游安装不会引用到本地 workspace。
- **版本统一策略**：当前 4 个包使用 fixed versioning，任何一个改动都建议同步 bump 全部包，避免版本号散落。脚本默认行为就是同步 bump。
- **`--no-git-checks`**：跳过 pnpm 默认的 git working tree 干净检查，便于在 CI/手动流程中直接发版。
```

- [ ] **Step 3: 校验 README 不再含 ali/tnpm**

Run: `grep -nE 'ali|alibaba|tnpm' README.md || echo "clean"`

Expected: `clean`

---

### Task 8: 更新 skill/SKILL.md

**Files:**
- Modify: `skill/SKILL.md`

- [ ] **Step 1: 用 sed 批量替换包名**

Run:
```bash
sed -i '' \
  -e 's|@ali/webmcp-nexus-core|webmcp-nexus-core|g' \
  -e 's|@ali/webmcp-nexus-sdk|webmcp-nexus-sdk|g' \
  -e 's|@ali/vite-plugin-webmcp-nexus|vite-plugin-webmcp-nexus|g' \
  -e 's|@ali/webpack-plugin-webmcp-nexus|webpack-plugin-webmcp-nexus|g' \
  skill/SKILL.md
```

- [ ] **Step 2: 重写「私有包/tnpm 安装」段落**

定位 `skill/SKILL.md` 中提到 tnpm 与阿里内网 registry 的段落（约 65-72 行附近，包含 `tnpm install` 与 `registry.anpm.alibaba-inc.com`），替换成：

```markdown
推荐使用 **pnpm**（项目本身基于 pnpm workspace），也可使用 npm / yarn：

```bash
pnpm add webmcp-nexus-sdk
# 或
npm install webmcp-nexus-sdk
```
```

并把构建插件的安装命令同样改为：

```bash
pnpm add -D vite-plugin-webmcp-nexus
# 或
pnpm add -D webpack-plugin-webmcp-nexus
```

- [ ] **Step 3: 修正 grep 命令示例**

把 `grep -r "from ['\"]@ali/webmcp-nexus-sdk['\"]" src/` 改为 `grep -r "from ['\"]webmcp-nexus-sdk['\"]" src/`。

- [ ] **Step 4: 校验**

Run: `grep -nE 'ali|alibaba|tnpm' skill/SKILL.md || echo "clean"`

Expected: `clean`

---

### Task 9: 重新安装依赖 + 校验 lockfile

**Files:** 无（运行时）

- [ ] **Step 1: 删除老 lockfile 与 node_modules**

Run: `rm -rf pnpm-lock.yaml node_modules apps/*/node_modules packages/*/node_modules`

理由：包名变了，老 lockfile 的 importer 引用全是 `@ali/...`，强行复用会卡 resolution。

- [ ] **Step 2: 重新安装**

Run: `pnpm install`

Expected: 安装成功，无 `ERR_PNPM_*`、无 `WORKSPACE_PKG_NOT_FOUND` 类错误。

- [ ] **Step 3: 校验 workspace 链接**

Run: `pnpm -r ls --depth -1 2>&1 | grep -E 'webmcp|nexus' | head -20`

Expected: 看到 4 个新名字 + workspace 软链。

---

### Task 10: 全量构建

**Files:** 无（运行时）

- [ ] **Step 1: 清干净 dist**

Run: `pnpm -r --filter "./packages/*" exec rm -rf dist`

- [ ] **Step 2: 构建所有 packages**

Run: `pnpm -r --filter "./packages/*" run build`

Expected: 4 个包全部构建成功，每个包 `dist/` 下有 `index.js`、`index.cjs`、`index.d.ts`（webpack 插件还多一个 `loader.*`）。

- [ ] **Step 3: 构建 demo（vite）**

Run: `pnpm --filter webmcp-nexus-demo build`

Expected: tsc 类型检查通过 + vite 构建产物落到 `apps/demo/dist`。

- [ ] **Step 4: 构建 demo（webpack）**

Run: `pnpm --filter webmcp-nexus-demo build:webpack`

Expected: webpack 构建完成，无 `Module not found: @ali/...` 报错。

---

### Task 11: 跑全量测试

**Files:** 无（运行时）

- [ ] **Step 1: 跑 monorepo 全量测试**

Run: `pnpm -r run test`

Expected: webmcp-core / webmcp-sdk / vite-plugin / webpack-plugin / demo 全部测试通过。

- [ ] **Step 2: 若有失败，逐包定位**

如果某包失败，逐包 `pnpm --filter <pkgName> run test --reporter verbose` 看错误。常见的失败模式：

- `Cannot find module '@ali/...'`：说明仍有源码漏改，回到 Task 4/5 排查
- `vi.mock('@ali/...')`：测试里的 mock 路径没改

---

### Task 12: 启动 dev server 跑通 demo

**Files:** 无（运行时）

- [ ] **Step 1: 启动 vite dev server（后台）**

Run: `pnpm dev`（后台运行，约 5 秒后用 curl 验证）

Expected: 监听 5173（或 vite 默认端口）。

- [ ] **Step 2: HTTP 探活**

Run: `curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:5173/`

Expected: `200`

- [ ] **Step 3: 验证关键 API 在浏览器里能注册**

启动浏览器（agent-browser 或 webapp-testing skill）打开 `http://localhost:5173/`，在 console 里跑：

```js
// 等 SDK polyfill 加载完成后
await new Promise(r => setTimeout(r, 500));
console.log('navigator.modelContext exists:', !!navigator.modelContext);
console.log('tools:', (await navigator.modelContext.getTools?.()) ?? '(use polyfill API)');
```

Expected: `navigator.modelContext exists: true`，并能看到 demo 注册的若干工具。

- [ ] **Step 4: 关闭 dev server**

停掉后台 task。

---

### Task 13: 提交 + 写一笔总结

**Files:** 无（git 操作）

- [ ] **Step 1: git status 看修改**

Run: `git status`

Expected: 看到 `packages/*/package.json`、`apps/demo/...`、`scripts/publish.sh`、`README.md`、`skill/SKILL.md`、`pnpm-lock.yaml` 等修改/新增。

- [ ] **Step 2: 留给用户决定是否提交**

按用户指示决定是否 `git add` + `git commit`。**不要主动 commit**——让用户先 `git diff` review。

---

## Self-Review Notes

- ✅ 4 个 package rename 都列出（Task 1）
- ✅ 内部依赖引用同步（Task 1 step 3-4 + Task 2）
- ✅ 根 package.json filter 名（Task 3）
- ✅ packages/ 与 apps/ 源码 import 全替换（Task 4-5）
- ✅ publish.sh 重写（Task 6）—— 用 pnpm publish 替代 tnpm
- ✅ README + skill 文档（Task 7-8）
- ✅ 重装依赖（Task 9）—— 必须删 lockfile，否则解析失败
- ✅ build / test / dev 三类验证（Task 10-12）
- 个人信息：git remote 指向 gitlab.alibaba-inc.com，但属于本地 git config 不在仓库内文件里，**不在本计划范围**，留作用户手动改 origin。
