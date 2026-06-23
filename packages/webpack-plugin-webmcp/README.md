<div align="center">

# webpack-plugin-webmcp-nexus

**WebMCP Nexus 的 Webpack 插件 —— 在 Webpack 构建过程中自动从 TypeScript 类型生成 JSON Schema 并注入到工具函数。**

[![npm version](https://img.shields.io/npm/v/webpack-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus)
[![npm downloads](https://img.shields.io/npm/dm/webpack-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus)
[![license](https://img.shields.io/npm/l/webpack-plugin-webmcp-nexus.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

简体中文 | [English](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webpack-plugin-webmcp/README.en.md)

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

`webpack-plugin-webmcp-nexus` 是 [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) 工具链的 **Webpack 构建插件**。它会自动向 Webpack 的 `module.rules` 注入一个 `enforce: 'pre'` 的 Loader，调用 [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core) 静态分析源码中的 WebMCP 工具函数，从 **TypeScript 类型 + JSDoc** 反推 JSON Schema，并将其作为 `__webmcpSchema` 字段注入到函数对象上。

配合 [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) 使用：在运行时，SDK 会读取该字段并向 `navigator.modelContext` 完成注册，让你的工具被 MCP 客户端直接调用。

## 核心特性

- 📦 **支持 Webpack 4+ / 5+** —— 通过 `compiler.options.module.rules` 自动注入 Loader，无需手动配置 `use`。
- 🔬 **类型即 Schema** —— 函数签名 + JSDoc 自动生成 JSON Schema，单一事实源。
- 🛠️ **Alias 自动合并** —— 自动读取 Webpack 的 `resolve.alias`（对象与数组形式皆可），并允许用户额外配置。
- 📂 **灵活的 include 配置** —— 可指定多个目录前缀，仅扫描你关心的源码。
- 🪶 **零运行时开销** —— 所有工作都在构建阶段完成，运行时无任何额外成本。
- 🔌 **预留全局协调钩子** —— 在 `compiler.hooks.done` 上预留扩展点，未来支持 manifest 生成、工具名冲突检测等。

## 优势

| 维度       | 业内常见做法                  | webpack-plugin-webmcp-nexus                              |
| ---------- | ----------------------------- | -------------------------------------------------------- |
| Schema 生成 | 手写 JSON Schema              | **TS 类型自动反推**，编辑器即时反馈                      |
| 函数侵入度 | 装饰器 / 包装函数             | **零侵入**——保持函数原样                                |
| Loader 配置 | 需手动配置 use 与顺序         | **自动注入**，无需修改现有 rules                          |
| 工具链耦合 | 通常与 SDK 强绑定             | 与 [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) 解耦，仅在产物注入数据 |

## 安装

```bash
# pnpm（推荐）
pnpm add -D webpack-plugin-webmcp-nexus

# npm
npm install --save-dev webpack-plugin-webmcp-nexus

# yarn
yarn add -D webpack-plugin-webmcp-nexus
```

> 同时需要安装运行时 SDK：
>
> ```bash
> pnpm add webmcp-nexus-sdk
> ```

## 使用示例

### 1. 配置 `webpack.config.ts`

```ts
import path from 'node:path';
import { WebMcpPlugin } from 'webpack-plugin-webmcp-nexus';
import type { Configuration } from 'webpack';

const config: Configuration = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new WebMcpPlugin({
      include: ['src'],
    }),
  ],
};

export default config;
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

启动开发服务器后，构建插件会自动从 `searchTasks` 的 TS 类型 + JSDoc 反推 JSON Schema，并通过 `__webmcpSchema` 字段注入函数对象；SDK 在浏览器中读取该字段完成注册。

## 配置选项

```ts
interface WebMcpPluginOptions {
  /** 文件匹配规则，默认 /\.[jt]sx?$/ */
  test?: RegExp;

  /** 包含的目录路径（相对于项目根目录或绝对路径），默认 ['src'] */
  include?: string[];

  /**
   * 额外的模块路径 alias（合并到 webpack 的 resolve.alias 之上）。
   * 用于解析 `import * as api from '@alias/xxx'` 形式的模块说明符。
   */
  alias?: Record<string, string>;
}
```

### 完整示例

```ts
new WebMcpPlugin({
  test: /\.tsx?$/,
  include: ['src/tools', 'src/pages'],
  alias: {
    '@tools': path.resolve(__dirname, 'src/tools'),
  },
});
```

> **注意**：Webpack 的 `RuleSetRule.include` 使用绝对路径前缀匹配，**不支持 glob**；相对路径会自动按 `compiler.context` 解析为绝对路径。

## 生态包

| 包                                                                                         | 用途                                                  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | 运行时 SDK，提供 `registerGlobalTools` / `useWebMcpTools` |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | 构建时核心：TS 类型抽取 + JSON Schema 生成           |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite 构建插件（如果你使用 Vite）                       |
| **`webpack-plugin-webmcp-nexus`** （本包）                                                  | Webpack 构建插件                                       |

## 相关链接

- 📦 **GitHub 主仓库**：[alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **完整文档**：[README](https://github.com/alibaba/webmcp-nexus#readme)
- 🎯 **示例应用**：[apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) —— Vite + Webpack 双构建完整示例
- 🌐 **WebMCP 标准**：[webmcp.org](https://webmcp.org)
- 🐛 **Issues**：[GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## 许可证

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
