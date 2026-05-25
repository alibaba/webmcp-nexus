<div align="center">

# webmcp-nexus-sdk

**WebMCP Nexus 的运行时 SDK —— 让 React 应用在 5 分钟内成为 MCP 客户端可直接驱动的对象。**

[![npm version](https://img.shields.io/npm/v/webmcp-nexus-sdk.svg)](https://www.npmjs.com/package/webmcp-nexus-sdk)
[![npm downloads](https://img.shields.io/npm/dm/webmcp-nexus-sdk.svg)](https://www.npmjs.com/package/webmcp-nexus-sdk)
[![license](https://img.shields.io/npm/l/webmcp-nexus-sdk.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

简体中文 | [English](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-sdk/README.en.md)

</div>

---

## 目录

- [简介](#简介)
- [核心特性](#核心特性)
- [优势](#优势)
- [安装](#安装)
- [快速上手](#快速上手)
- [API 速览](#api-速览)
- [生态包](#生态包)
- [相关链接](#相关链接)
- [许可证](#许可证)

## 简介

`webmcp-nexus-sdk` 是 [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) 项目的运行时 SDK，围绕 [W3C WebMCP 标准提案](https://webmcp.org) 提供生产可用的 React 集成方案。

它只导出两个 API —— `registerGlobalTools` 和 `useWebMcpTools` —— 即可覆盖**全局**、**路由**、**组件**三种生命周期，让任何普通的 TypeScript 函数无需包装即可被 MCP 客户端（Claude Desktop、Cursor、VS Code 等）直接调用。

## 核心特性

- 🪶 **极简 API** —— 仅 2 个函数即可完成所有注册场景。
- 🧩 **三级作用域** —— 全局工具、路由级工具、组件级工具自动随生命周期挂载 / 注销。
- 🌐 **跨浏览器兼容** —— Chrome 146+ 使用原生 `navigator.modelContext`；其他环境在首次注册时自动启用内置的 [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill)，业务代码完全无感。
- 🔁 **HMR 友好** —— 开发阶段修改函数签名后，工具 schema 会自动重新注册。
- 🛡️ **冲突感知** —— 内置 scope ownership registry，多个 scope 注册同名工具时仅警告不阻断，注销严格隔离。
- 🤝 **桌面 Agent 直连** —— 配合 [`@mcp-b/webmcp-local-relay`](https://www.npmjs.com/package/@mcp-b/webmcp-local-relay)，桌面端 MCP 客户端可直接调用浏览器中正在运行的 Web 应用。

## 优势

| 维度       | 业内常见做法                         | webmcp-nexus-sdk                                     |
| ---------- | ------------------------------------ | ---------------------------------------------------- |
| API 表面   | 装饰器 / 包装函数 / 显式 schema 配置 | **2 个 API** 覆盖全部场景                            |
| 函数侵入度 | `defineApi` / `createTool` 等包装    | **零侵入**——函数保持原样，原有调用方完全无感        |
| 生命周期   | 仅支持全局注册，需手动维护           | 全局 / 路由 / 组件 **三级作用域**，组件卸载自动注销 |
| 浏览器兼容 | 调用方自行判断 + 兜底                | SDK 内置 polyfill **惰性加载**                       |
| 类型契约   | 手写 JSON Schema 与 TS 类型双源维护  | 配合构建插件 **从 TS 类型反推**，单一事实源          |

## 安装

```bash
# pnpm（推荐）
pnpm add webmcp-nexus-sdk

# npm
npm install webmcp-nexus-sdk

# yarn
yarn add webmcp-nexus-sdk
```

> **构建插件二选一**：SDK 通常需要配合 [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) 或 [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) 使用，构建插件会从 TypeScript 类型 + JSDoc 自动生成 JSON Schema。

```bash
pnpm add -D vite-plugin-webmcp-nexus       # Vite 项目
# 或
pnpm add -D webpack-plugin-webmcp-nexus    # Webpack 项目
```

## 快速上手

### 1. 编写一个普通的 TypeScript 函数

```ts
// src/tools/queries.ts

/**
 * 根据关键词搜索任务。
 * @readonly
 */
export async function searchTasks(params: {
  /** 搜索关键词 */
  query: string;
  /** 返回数量上限（默认 50） */
  limit?: number;
}): Promise<{ count: number; tasks: Task[] }> {
  // ... 你原本的业务实现，无需任何包装
}
```

### 2. 全局注册（应用入口）

```ts
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

registerGlobalTools(queries);
```

构建插件会自动从函数的 TS 类型 + JSDoc 反推 JSON Schema，并通过 `__webmcpSchema` 字段注入到函数对象上；SDK 在运行时读取该字段向 `navigator.modelContext` 完成注册。

### 3. 路由级 / 组件级注册

```tsx
import { useWebMcpTools } from 'webmcp-nexus-sdk';

export default function TasksPage() {
  const { createTask, updateTask, deleteTask } = useTodoStore();

  // 当前页面挂载时注册，卸载时自动注销
  useWebMcpTools({ createTask, updateTask, deleteTask });

  return /* … */;
}
```

组件卸载时同名工具会自动从 `modelContext` 注销，**避免 Agent 在错误的页面调用错误的工具**。

## API 速览

### `registerGlobalTools(tools)`

应用启动时调用，注册一组永不注销的全局工具。

```ts
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';
import * as navigation from './tools/navigation';

registerGlobalTools(queries);
registerGlobalTools(navigation);
```

### `useWebMcpTools(tools)`

React Hook，把传入的工具集与组件生命周期绑定 —— mount 时注册、unmount 时注销。

```tsx
import { useWebMcpTools } from 'webmcp-nexus-sdk';

function MyDialog() {
  useWebMcpTools({ submitForm, cancelForm });
  return <Dialog />;
}
```

> 完整 API 文档与最佳实践参见 [仓库 README](https://github.com/alibaba/webmcp-nexus#readme)。

## 生态包

WebMCP Nexus 是一个 monorepo 工程化方案，下表是发布到 npm 的所有公开包：

| 包                                                                                         | 用途                                          |
| ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **`webmcp-nexus-sdk`** （本包）                                                             | 运行时 SDK，提供 2 个核心 API                  |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | 构建时核心：TS 类型抽取 + JSON Schema 生成    |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite 构建插件                                  |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack 构建插件                               |

## 相关链接

- 📦 **GitHub 主仓库**：[alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **完整文档**：[README](https://github.com/alibaba/webmcp-nexus#readme)
- 🧠 **AI 编码 Skill**：[skill/SKILL.md](https://github.com/alibaba/webmcp-nexus/blob/main/skill/SKILL.md) —— 把"为函数生成 WebMCP 工具"变成一句话指令。
- 🎯 **示例应用**：[apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) —— Vite + Webpack 双构建的完整 Todo 应用。
- 🌐 **WebMCP 标准**：[webmcp.org](https://webmcp.org)
- 🐛 **Issues**：[GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## 许可证

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
