# WebMCP Nexus

WebMCP 前端最佳实践集成方案 — 零侵入、最小 API 表面。

[WebMCP](https://webmcp.org) 是 W3C 浏览器标准提案（Google/Microsoft 联合推动），允许网页通过 `navigator.modelContext.registerTool()` 将功能暴露为 AI Agent 可调用的工具。本项目提供一套零侵入的 WebMCP 集成方案，SDK 仅导出 2 个 API，配合 Vite 插件在构建时自动提取类型生成 JSON Schema。

## Monorepo 结构

```
webmcp-nexus/
├── apps/demo/                       # 最佳实践示例应用（Vite + Webpack 双构建）
├── packages/
│   ├── webmcp-core/                 # 构建时核心（类型提取 + JSON Schema 生成）
│   ├── webmcp-sdk/                  # 运行时 SDK（2 个 API）
│   ├── vite-plugin-webmcp/          # Vite 插件
│   └── webpack-plugin-webmcp/       # Webpack 插件
├── scripts/publish.sh               # 一键发布脚本
└── docs/                            # 设计文档
```

已发布到 npm 公网 registry（统一版本管理）：

- [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)
- [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)
- [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)
- [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus)

## 快速开始

前置条件：Node.js 18+、pnpm

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动 demo 开发服务器
pnpm build      # 构建所有包
pnpm test       # 运行测试
```

## 浏览器兼容

Chrome 146+ 走原生 `navigator.modelContext`；其他环境（Chrome <146、Firefox、Safari、低版本 Edge）由 SDK 入口惰性自动加载内置的 [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill)，业务代码零感知，详见 [2026-05-15 spec](./docs/superpowers/specs/2026-05-15-webmcp-polyfill-integration-design.md)。

## 核心概念 — 三级注册策略

工具按作用域分为三级，使用两个 API 覆盖所有场景：

| 级别 | API                     | 生命周期               | 适用场景               |
| ---- | ----------------------- | ---------------------- | ---------------------- |
| 全局 | `registerGlobalTools()` | 应用启动时注册，不注销 | 通用 API（认证、CRUD） |
| 路由 | `useWebMcpTools()`      | 页面 mount/unmount     | 页面专属 API           |
| 组件 | `useWebMcpTools()`      | 组件 mount/unmount     | 操作组件内部状态       |

**全局注册**（main.tsx）：

```typescript
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as userApi from './api/user';
registerGlobalTools(userApi);
```

**路由/组件注册**：

```typescript
import { useWebMcpTools } from 'webmcp-nexus-sdk';
useWebMcpTools({ setUserFilter });
```

## 零侵入设计

API 函数是纯 TypeScript 函数，无需任何包装（如 `defineApi`）。开发者只需：

- 用 TypeScript 类型定义参数和返回值
- 用 JSDoc 描述函数用途
- 用 `@readonly` JSDoc 标签标记只读 API

Vite 插件在构建时从 `registerGlobalTools()` / `useWebMcpTools()` 调用**逆向追踪**到函数定义，自动提取类型信息并注入 JSON Schema。函数本身的定义和调用方式完全不受影响。

## 工具名冲突注意事项

SDK 内部维护 scope ownership registry，记录每个工具名的注册来源（scope + scopeId）。当同名工具已被其他 scope 注册时，控制台输出警告但仍允许注册。注销时只注销自己 scope 的工具，不影响其他作用域的同名工具。

> **建议**：使用有意义的唯一工具名避免冲突，不同层级避免同名注册。

## 类型支持范围

**已稳定支持**：

- 基础类型（string / number / boolean）
- 字面量联合（`'a' | 'b' | 'c'` → enum）
- 可选属性（`prop?` → 不加入 required）
- 嵌套对象（最多 3 层）

**不建议依赖**：

- 泛型（Record、Partial、Pick 等）
- 映射类型、条件类型
- 超过 3 层的深层嵌套、对象数组中的对象元素 schema

## 技术栈

- React 19 + TypeScript + Vite 8
- pnpm workspace monorepo
- vitest 测试框架

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

## 许可证

MIT
