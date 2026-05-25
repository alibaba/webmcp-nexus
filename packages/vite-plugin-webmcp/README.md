<div align="center">

# vite-plugin-webmcp-nexus

**WebMCP Nexus 的 Vite 插件 —— 在 Vite 构建过程中自动从 TypeScript 类型生成 JSON Schema 并注入到工具函数。**

[![npm version](https://img.shields.io/npm/v/vite-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)
[![license](https://img.shields.io/npm/l/vite-plugin-webmcp-nexus.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

简体中文 | [English](https://github.com/alibaba/webmcp-nexus/blob/main/packages/vite-plugin-webmcp/README.en.md)

</div>

---

## 目录

- [简介](#简介)
- [核心特性](#核心特性)
- [优势](#优势)
- [安装](#安装)
- [使用示例](#使用示例)
- [配置选项](#配置选项)
- [生态包](#生态包)
- [相关链接](#相关链接)
- [许可证](#许可证)

## 简介

`vite-plugin-webmcp-nexus` 是 [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) 工具链的 **Vite 构建插件**。它利用 Vite 的 `transform` 钩子，调用 [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core) 静态分析源码中的 WebMCP 工具函数，从 **TypeScript 类型 + JSDoc** 反推 JSON Schema，并将其作为 `__webmcpSchema` 字段注入到函数对象上。

配合 [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) 使用：在运行时，SDK 会读取该字段并向 `navigator.modelContext` 完成注册，让你的工具被 MCP 客户端直接调用。

## 核心特性

- ⚡ **Vite 原生集成** —— 通过标准 `transform` 钩子接入，无侵入、无额外配置。
- 🔬 **类型即 Schema** —— 函数签名 + JSDoc 自动生成 JSON Schema，单一事实源。
- 🔁 **HMR 友好** —— 修改函数签名后，工具 schema 自动重建，开发体验流畅。
- 🛠️ **Alias 自动合并** —— 自动读取 Vite 的 `resolve.alias`，并允许用户额外配置。
- 📂 **灵活的 include 匹配** —— 支持 glob 模式，仅扫描指定目录，构建性能可控。
- 🪶 **零运行时开销** —— 所有工作都在构建阶段完成，运行时无任何额外成本。

## 优势

| 维度       | 业内常见做法                  | vite-plugin-webmcp-nexus                                |
| ---------- | ----------------------------- | ------------------------------------------------------- |
| Schema 生成 | 手写 JSON Schema              | **TS 类型自动反推**，编辑器即时反馈                     |
| 函数侵入度 | 装饰器 / 包装函数             | **零侵入**——保持函数原样                               |
| 开发体验   | 修改类型后需手动同步 schema | **HMR 自动重建**                                        |
| 工具链耦合 | 通常与 SDK 强绑定             | 与 [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) 解耦，仅在产物注入数据 |

## 安装

```bash
# pnpm（推荐）
pnpm add -D vite-plugin-webmcp-nexus

# npm
npm install --save-dev vite-plugin-webmcp-nexus

# yarn
yarn add -D vite-plugin-webmcp-nexus
```

> 同时需要安装运行时 SDK：
>
> ```bash
> pnpm add webmcp-nexus-sdk
> ```

## 使用示例

### 1. 配置 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginWebMcp } from 'vite-plugin-webmcp-nexus';

export default defineConfig({
  plugins: [
    react(),
    vitePluginWebMcp({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
});
```

### 2. 编写一个普通的 TS 函数

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
  // ... 你原本的业务实现
}
```

### 3. 注册到 SDK

```ts
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

registerGlobalTools(queries);
```

启动 `pnpm dev` 后，构建插件会自动从 `searchTasks` 的 TS 类型 + JSDoc 反推 JSON Schema，并通过 `__webmcpSchema` 字段注入函数对象；SDK 在浏览器中读取该字段完成注册。

## 配置选项

```ts
interface WebMcpPluginOptions {
  /** 扫描范围（glob patterns），默认 ['src/**/*.ts', 'src/**/*.tsx'] */
  include?: string[];

  /**
   * 额外的模块路径 alias（合并到 vite 的 resolve.alias 之上）。
   * 用于解析 `import * as api from '@alias/xxx'` 形式的模块说明符。
   */
  alias?: Record<string, string>;
}
```

### 完整示例

```ts
vitePluginWebMcp({
  include: ['src/tools/**/*.ts', 'src/pages/**/tools.ts'],
  alias: {
    '@tools': '/abs/path/to/src/tools',
  },
});
```

> 调试模式：设置环境变量 `DEBUG=webmcp` 即可在控制台查看 transform 处理日志。

## 生态包

| 包                                                                                         | 用途                                           |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | 运行时 SDK，提供 `registerGlobalTools` / `useWebMcpTools` |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | 构建时核心：TS 类型抽取 + JSON Schema 生成     |
| **`vite-plugin-webmcp-nexus`** （本包）                                                     | Vite 构建插件                                  |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack 构建插件（如果你使用 Webpack）          |

## 相关链接

- 📦 **GitHub 主仓库**：[alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **完整文档**：[README](https://github.com/alibaba/webmcp-nexus#readme)
- 🎯 **示例应用**：[apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) —— Vite 完整示例
- 🌐 **WebMCP 标准**：[webmcp.org](https://webmcp.org)
- 🐛 **Issues**：[GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## 许可证

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
