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
- [内置工具：webmcpCallTool](#内置工具webmcpcalltool)
- [生态包](#生态包)
- [相关链接](#相关链接)
- [许可证](#许可证)

## 简介

`webmcp-nexus-sdk` 是 [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) 项目的运行时 SDK，围绕 [W3C WebMCP 标准提案](https://webmcp.org) 提供生产可用的 React 集成方案。

它只导出三个注册 API —— `registerGlobalTools`、`useWebMcpTools` 和 `withWebMcpTools` —— 即可覆盖**全局**、**路由**、**组件**三种生命周期，让任何普通的 TypeScript 函数无需包装即可被 MCP 客户端（Claude Desktop、Cursor、VS Code 等）直接调用。

SDK 还会自动注册一个内置工具 [`webmcpCallTool`](#内置工具webmcpcalltool)，用来兜住「MCP 客户端不刷新工具列表、调不到会话中途才出现的工具」这个客户端侧缺口。它默认开启，可用 `configureBuiltinTools({ callTool: false })` 关闭。

## 核心特性

- 🪶 **极简 API** —— 仅 3 个函数即可完成所有注册场景。
- 🧩 **三级作用域** —— 全局工具、路由级工具、组件级工具自动随生命周期挂载 / 注销。
- 🏛️ **Class 组件支持** —— `withWebMcpTools` HOC 让 class 组件方法与函数组件 Hook 享受同等的自动注册体验。
- 🔧 **内置代调工具** —— 自动注册 `webmcpCallTool`，让不响应 `tools/list_changed` 的客户端也能按名调到当前页的任意工具；未命中时返回当前页工具目录，Agent 可自我纠正。见[内置工具](#内置工具webmcpcalltool)。
- 🌐 **跨浏览器兼容** —— Chrome 149+ 使用原生 `document.modelContext`（146–149 由 polyfill 做入口桥接）；其他环境在首次注册时自动启用 [`@mcp-b/webmcp-polyfill@5.1.0`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill)（本包声明为 `dependencies`、由你的打包器解析，**未内联进产物**），业务代码完全无感。SDK 会在宿主的 `getTools` / `executeTool` 上装**不可枚举**的形态归一包装以吸收 Chrome 155 的入参变更，`Object.keys(document.modelContext)` 仍为 `[]`，polyfill 的「实例无 own enumerable keys」WebIDL 保真不变量保持；`registerTool` 一律不包装。
- 🔁 **HMR 友好** —— 开发阶段修改函数签名后，工具 schema 会自动重新注册。
- 🛡️ **冲突感知** —— 内置 scope ownership registry，多个 scope 注册同名工具时仅警告不阻断，注销严格隔离。
- 🤝 **桌面 Agent 直连** —— 配合 [`@mcp-b/webmcp-local-relay`](https://www.npmjs.com/package/@mcp-b/webmcp-local-relay)，桌面端 MCP 客户端可直接调用浏览器中正在运行的 Web 应用。

## 优势

| 维度       | 业内常见做法                         | webmcp-nexus-sdk                                    |
| ---------- | ------------------------------------ | --------------------------------------------------- |
| API 表面   | 装饰器 / 包装函数 / 显式 schema 配置 | **3 个 API** 覆盖全部场景                           |
| 函数侵入度 | `defineApi` / `createTool` 等包装    | **零侵入**——函数保持原样，原有调用方完全无感        |
| 生命周期   | 仅支持全局注册，需手动维护           | 全局 / 路由 / 组件 **三级作用域**，组件卸载自动注销 |
| 浏览器兼容 | 调用方自行判断 + 兜底                | SDK 声明依赖 + **惰性安装** polyfill                |
| 类型契约   | 手写 JSON Schema 与 TS 类型双源维护  | 配合构建插件 **从 TS 类型反推**，单一事实源         |

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

构建插件会自动从函数的 TS 类型 + JSDoc 反推 JSON Schema，并通过 `__webmcpSchema` 字段注入到函数对象上；SDK 在运行时读取该字段向 `document.modelContext` 完成注册。

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

### 4. Class 组件注册

```tsx
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 在面板中搜索 @readonly */
  searchInPanel(params: { query: string }) {
    /* ... */
  }

  /** 清除搜索 */
  clearSearch = (params: { confirm?: boolean }) => {
    /* ... */
  };

  render() {
    return <div />;
  }
}

export default withWebMcpTools(MyPanel);
// 或仅注册指定方法：withWebMcpTools(MyPanel, ['searchInPanel'])
```

`withWebMcpTools` 必须作为最内层 HOC 直接包裹 class 组件。

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

### `withWebMcpTools(Component, methodNames?)`

高阶组件，将 class 组件的方法注册为 WebMCP 工具 —— mount 时注册、unmount 时注销。

```tsx
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class OrderPanel extends React.Component {
  /** 搜索订单 @readonly */
  searchOrders(params: { keyword: string }) {
    /* ... */
  }

  /** 导出订单 */
  exportOrders = (params: { format: 'csv' | 'json' }) => {
    /* ... */
  };

  render() {
    return <div />;
  }
}

export default withWebMcpTools(OrderPanel);
```

> **约束**：`withWebMcpTools` 必须作为最内层 HOC 直接包裹 class 组件。

> 完整 API 文档与最佳实践参见 [仓库 README](https://github.com/alibaba/webmcp-nexus#readme)。

### `configureBuiltinTools(options)`

开关 SDK 的内置工具。目前只有一个：全局代调工具 `webmcpCallTool`（默认开启）。

```ts
import { configureBuiltinTools } from 'webmcp-nexus-sdk';

// 关掉内置代调工具。与调用顺序无关：已注册时会就地反注册。
configureBuiltinTools({ callTool: false });
```

## 内置工具：webmcpCallTool

SDK 会自动注册一个内置全局工具 `webmcpCallTool`，**不需要你写任何代码**：`registerGlobalTools`、`useWebMcpTools`、`withWebMcpTools` 三个入口都会在注册你自己的工具之前先把它注册好（幂等，重复调用不会重复注册）。

### 它解决什么问题

nexus 的路由级 / 组件级工具随页面 mount/unmount 增删。工具列表变化会通过 `tools/list_changed` 通知 MCP 客户端，但该通知在规范里只是 **SHOULD**，客户端可以缓存工具列表——**实测 Qoder 的会话工具索引就是启动快照，完全不响应 `list_changed`**。结果是：会话开始之后才出现的工具，Agent 永远调不到。

relay 侧是实时准确的，缺口在客户端。客户端改不了，所以 SDK 在**页面侧**补一个逃生口：`webmcpCallTool` 启动时就注册，因此必然在客户端的快照里；它接受一个工具名，在页面内实时查 `document.modelContext.getTools()` 并代调。

```jsonc
// Agent 调用示例
{ "name": "listTodos", "arguments": { "limit": 3 } }
```

这是 relay 已删除的 `webmcp_call_tool`（随 `@mcp-b/webmcp-local-relay` 5.0.0 移除）的页面侧等价物，入参形状与错误行为都对齐旧版。

### 前提：客户端快照里必须已经有它

顺序必须是「**起 relay → 打开页面并确认已连上 → 再开（或重开）客户端会话**」。如果页面是在会话开始之后才打开的，连这个逃生口本身都不在快照里，也就无从调用。

### `name` 要传页面原始名

relay 会改写工具名：`sanitizeName` 把 `[^a-zA-Z0-9_]` 替换成 `_`，多标签页同名工具还会追加 `_<4 位 tabId>` 后缀。**`webmcpCallTool` 的 `name` 要传改写之前的页面原始名**，也就是 relay `webmcp_list_tools` 返回的 `originalName` 字段，不是客户端工具列表里看到的那个名字。

nexus 建议工具名只用 camelCase（见 [`skill/SKILL.md`](https://github.com/alibaba/webmcp-nexus/blob/main/skill/SKILL.md)），这种情况下两者本来就一致。

### 与 relay 的 `webmcp_list_tools` 配合

本 SDK **不提供**配套的列表工具——relay 内置的 `webmcp_list_tools` 已经实时给出全部工具及其 `originalName` / `description` / `inputSchema`。推荐流程：

1. Agent 调 relay 的 `webmcp_list_tools`，拿到实时的 `originalName` 与 `inputSchema`；
2. 用 `webmcpCallTool({ name: <originalName>, arguments: {...} })` 执行。

即使跳过了第 1 步也能自愈：**未命中或 `name` 为空时，`webmcpCallTool` 返回 `isError` 结果并附上当前页的工具目录**（`name` / `description` / `inputSchema` 三键），Agent 一次调用即可改对名字重试。目录是实时按页取的，路由切走之后旧工具不会残留在里面。

### 什么时候关掉它

默认开启。关掉的理由通常是：不想让 Agent 绕开客户端自己的工具确认流程去调破坏性工具——代调时客户端看到的是 `webmcpCallTool` 自己的 annotations（三个 hint 全 false，即"透明代理，只管执行"），而不是目标工具的。

```ts
configureBuiltinTools({ callTool: false });
```

### 其他约束

- `webmcpCallTool` 是**保留名**：你自己的工具若同名会被内置版覆盖（控制台有 `already registered` 告警）。
- 目录只反映**当前这一个标签页**。多标签页时客户端看到的是带后缀的 `webmcpCallTool_<tabId>`，每个标签页的 dispatcher 与目录彼此独立，relay 负责路由。
- **代调结果与直调结果一致**：dispatcher 只把宿主 `executeTool` 返回的 JSON 字符串 parse 开，**不做二次归一**，内层工具的返回值原样上交，由消费方（relay 的 `normalizeToolResponse`）用它那层更宽的规则收尾。所以 `isError`、`structuredContent`、以及 `resource_link` / `audio` 等 content 类型都不会被抹平或降级——目标工具失败时 Agent 看到的就是失败。
- 它只能调**本页**工具，且由页面内的 SDK 提供——不是 relay 的静态工具，别和 `webmcp_list_tools` / `webmcp_list_sources` / `webmcp_open_page` 混为一谈。

## 浏览器兼容

宿主面已从 `navigator.modelContext` 迁移到规范入口 `document.modelContext`（WebMCP 2026-05-27 草案，Chrome 150 已废弃前者）。SDK 全链路 **document 优先、navigator 兜底**，业务代码无感。

| 环境                           | 行为                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome 155+                    | 原生 `document.modelContext`。`executeTool` 第二参改为**对象**、same-document `inputSchema` 改为**对象**、`navigator.modelContextTesting` 已移除                             |
| Chrome 150–154                 | 原生 `document.modelContext`。`executeTool` 第二参仍是 **JSON 字符串**、same-document `inputSchema` 仍返回**序列化字符串**                                                   |
| Chrome 149                     | Origin Trial 起始版；仍是 `navigator.modelContext`，polyfill 5.1.0 自动做入口桥接                                                                                            |
| Chrome 146–148                 | flag-only。SDK 在这一档保留全套兼容层（补齐 EventTarget、合成 `listTools`/`callTool`/`getTools`/`executeTool`、桥接 `toolchange`）；146–147 额外走 `unregisterTool` 注销兜底 |
| Chrome <146 / Firefox / Safari | 首次注册时自动安装 `@mcp-b/webmcp-polyfill@5.1.0`                                                                                                                            |

> 原生档 SDK 会在 `getTools` / `executeTool` 上装**不可枚举**的双轴形态归一包装，吸收 Chrome 155 的入参变更与 relay 6.x 对字符串 `inputSchema` 的不容忍；`Object.keys(document.modelContext)` 仍为 `[]`，`registerTool` 一律不包装（协议规定 `toolchange` 派发责任在宿主，SDK 不代为派发）。

完整的四档矩阵、宿主准入要求（origin isolation / Permissions Policy `tools`）、`inputSchema` 三形态兼容说明、以及与 `@mcp-b/global`、`@mcp-b/webmcp-local-relay` 的共存约束，见仓库根的 [README](https://github.com/alibaba/webmcp-nexus#浏览器兼容) 与 [CHANGELOG](https://github.com/alibaba/webmcp-nexus/blob/main/CHANGELOG.md)。

> **注意**：`@mcp-b/global` 不可与本 SDK 同时引入（它会用 value 描述符替换 `document` / `navigator` 两个面）。

## 生态包

WebMCP Nexus 是一个 monorepo 工程化方案，下表是发布到 npm 的所有公开包：

| 包                                                                                         | 用途                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| **`webmcp-nexus-sdk`** （本包）                                                            | 运行时 SDK，提供 3 个核心注册 API + 内置代调工具      |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | 构建时核心：TS 类型抽取 + JSON Schema 生成 |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite 构建插件                              |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack 构建插件                           |

## 相关链接

- 📦 **GitHub 主仓库**：[alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **完整文档**：[README](https://github.com/alibaba/webmcp-nexus#readme)
- 🧠 **AI 编码 Skill**：[skill/SKILL.md](https://github.com/alibaba/webmcp-nexus/blob/main/skill/SKILL.md) —— 把"为函数生成 WebMCP 工具"变成一句话指令。
- 🎯 **示例应用**：[apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) —— Vite + Webpack 双构建的完整 Todo 应用。
- 🌐 **WebMCP 标准**：[webmcp.org](https://webmcp.org)
- 🐛 **Issues**：[GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## 许可证

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
