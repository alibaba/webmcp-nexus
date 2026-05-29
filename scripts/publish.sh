#!/usr/bin/env bash
# 一键发布所有 webmcp-nexus 包到公网 npm registry
# - 使用 pnpm publish -r 串行发布 packages/* 下所有 public 包
# - 设置 DRY_RUN=1 只 pack 不发布，用于预检
# - 设置 VERSION=patch|minor|major|x.y.z 控制版本递增（默认 patch）
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
