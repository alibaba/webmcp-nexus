#!/usr/bin/env bash
# 一键发布所有 webmcp-nexus 包到公网 npm registry
# - 使用 pnpm publish -r 串行发布 packages/* 下所有 public 包
# - 设置 DRY_RUN=1 只 pack 不发布，用于预检
# - 设置 VERSION=patch|minor|major|x.y.z 控制版本递增（默认 patch）
#
# 版本号与 CHANGELOG 均由本脚本统一写入，不要手工预改 package.json：
# 否则版本真相源变成两个，且手工写了 1.0.0 而发布时忘传 VERSION 会被再 bump 成 2.0.0。
#
# 发布前请先 commit 本次版本的全部代码改动：CHANGELOG 靠 `<上一个 tag>..HEAD`
# 取提交范围，未提交的改动不会进入 CHANGELOG。本脚本会检查并告警。
#
# 本脚本刻意不自动 commit / tag / push（遵循仓库既有的人工 release commit 习惯）。
set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
VERSION="${VERSION:-patch}"

# ── npm 登录态校验 ─────────────────────────────────────────────
if [ "$DRY_RUN" != "1" ]; then
  echo "Checking npm login status..."
  if ! npm whoami --registry https://registry.npmjs.org 2>/dev/null; then
    echo "Error: npm 未登录，请先执行 npm login 登录后再发布"
    exit 1
  fi
  echo "Logged in as: $(npm whoami --registry https://registry.npmjs.org)"
fi

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

# ── 前置检查：CHANGELOG 依赖 git 提交范围 ────────────────────
# changelog.mjs 靠 `<上一个 tag>..HEAD` 取提交范围，所以本次版本的全部代码改动
# 必须**先 commit**。否则生成的 CHANGELOG 条目会是空的（"无变更记录"）。
# 不阻断：DRY_RUN 预检需要能在工作区不干净时运行。
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Warning: 当前目录不是 git 仓库，CHANGELOG 将只生成空条目"
elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo ""
  echo "⚠️  工作区存在未提交的改动："
  git status --porcelain | head -20 | sed 's/^/     /'
  echo "   CHANGELOG 靠 \"$(git describe --tags --abbrev=0 2>/dev/null || echo '<last-tag>')..HEAD\" 取提交范围，"
  echo "   未提交的改动不会进入 CHANGELOG。建议先 commit 再发布。"
  echo ""
fi

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

# ── 生成 CHANGELOG ─────────────────────────────────────────
# 幂等：同版本块的自动生成段（<!-- auto:start/end --> 之间）整段替换，
# 人工撰写段（<!-- manual:start/end --> 之间）永不覆盖。
# DRY_RUN 只预览不写入，便于先看分组结果。
echo ""
if [ "$DRY_RUN" = "1" ]; then
  echo "[DRY-RUN] CHANGELOG preview for ${NEW_VERSION}:"
  node scripts/changelog.mjs --version "$NEW_VERSION" | head -40
else
  node scripts/changelog.mjs --version "$NEW_VERSION" --write
fi

# ── 构建 ───────────────────────────────────────────────────
# 注意：rm -rf dist 在 DRY_RUN 下也会执行（DRY_RUN 需要重新构建才能 pack）。
# 若随后的 build 失败，set -e 会中断且 dist 不会恢复，依赖 workspace:* dist 的
# demo（pnpm dev）会跟着挂 —— 用 `pnpm build` 恢复即可。
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
  # 不让 set -e 直接中断：部分包已发布、部分失败时，需要打印清单与恢复指引，
  # 而不是留下"npm 上有 1.0.0 但仓库无 tag"的不一致状态而无任何提示。
  PUBLISH_FAILED=0
  pnpm -r --filter "./packages/*" publish --access public --no-git-checks || PUBLISH_FAILED=1

  if [ "$PUBLISH_FAILED" != "0" ]; then
    echo ""
    echo "❌ 发布过程中出现失败。请逐个核对 npm 上的实际状态："
    for name in "${PACKAGE_NAMES[@]}"; do
      published=$(npm view "${name}@${NEW_VERSION}" version 2>/dev/null || true)
      if [ -n "$published" ]; then
        echo "     已发布：${name}@${NEW_VERSION}"
      else
        echo "     未发布：${name}"
      fi
    done
    echo ""
    echo "   恢复指引："
    echo "     - 已发布的包同版本不可重发；若需作废用 npm deprecate <name>@${NEW_VERSION}"
    echo "     - 未发布的包可单独重发：cd packages/<dir> && pnpm publish --access public --no-git-checks"
    echo "     - 全部补齐后再打 tag（见下方指引）"
    exit 1
  fi

  echo ""
  echo "All packages published as v${NEW_VERSION}."
  echo ""
  echo "下一步（本脚本刻意不自动 commit / tag / push，遵循仓库既有的人工 release commit 习惯；"
  echo "自动打 tag 会指向版本号尚未提交的旧 HEAD）："
  echo ""
  echo "  git add -A && git commit -m \"chore: release v${NEW_VERSION}\""
  echo "  git tag -a \"v${NEW_VERSION}\" -m \"release v${NEW_VERSION}\""
  echo "  git push && git push --tags"
  echo ""
  echo "已变更的文件：CHANGELOG.md 与 ${#PACKAGES[@]} 个 package.json，请一并提交。"
fi
