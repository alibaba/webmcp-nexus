<div align="center">

# webmcp-nexus-core

**WebMCP Nexus 的构建时核心 —— 基于 `ts-morph` 的 TypeScript 类型抽取与 JSON Schema 生成引擎。**

[![npm version](https://img.shields.io/npm/v/webmcp-nexus-core.svg)](https://www.npmjs.com/package/webmcp-nexus-core)
[![npm downloads](https://img.shields.io/npm/dm/webmcp-nexus-core.svg)](https://www.npmjs.com/package/webmcp-nexus-core)
[![license](https://img.shields.io/npm/l/webmcp-nexus-core.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

简体中文 | [English](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/README.en.md)

</div>

---

## 目录

- [简介](#简介)
- [核心特性](#核心特性)
- [优势](#优势)
- [安装](#安装)
- [使用示例](#使用示例)
- [API 概览](#api-概览)
- [生态包](#生态包)
- [相关链接](#相关链接)
- [许可证](#许可证)

## 简介

`webmcp-nexus-core` 是 [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) 工具链的**构建时核心包**，负责：

1. 使用 [`ts-morph`](https://ts-morph.com/) 静态分析源码中标记为 WebMCP 工具的函数；
2. 从函数的 **TypeScript 类型 + JSDoc** 反推出符合 [JSON Schema](https://json-schema.org/) 的工具描述；
3. 生成注入代码，在每个工具函数对象上挂载 `__webmcpSchema` 字段，供运行时 SDK 读取并注册到 `navigator.modelContext`。

它本身**不是给最终用户直接使用的包**，而是被 [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) 与 [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) 共享的底层引擎。如果你正在编写**自定义的构建工具集成**（如 Rspack、Rollup、esbuild 插件），可以直接复用这个包。

## 核心特性

- 🔬 **基于 `ts-morph` 的静态类型分析** —— 函数签名 = JSON Schema，单一事实源。
- 🪶 **零运行时开销** —— 所有 schema 在构建时生成，运行时无任何反射 / 解析成本。
- 📦 **独立可复用** —— 与具体打包器解耦，提供纯函数式 `transformCode(code, filePath, options?)` 接口。
- 🔁 **逆向追踪** —— 从 `registerGlobalTools` / `useWebMcpTools` 的调用点向上追溯到函数定义，工具函数本身不需要任何标记。
- 🧩 **支持丰富的 TypeScript 类型** —— 基础类型、字面量联合（→ `enum`）、可选属性、嵌套对象（递归 ≤3 层）等。
- 🛠️ **Alias 解析** —— 支持 `import * as api from '@alias/xxx'` 形式的模块说明符解析（兼容 webpack `$` 精确匹配语法）。

## 优势

| 维度       | 业内常见做法                  | webmcp-nexus-core                         |
| ---------- | ----------------------------- | ----------------------------------------- |
| Schema 来源 | 手写 JSON Schema 与 TS 类型双源维护 | **基于 TS 类型自动反推**，单一事实源     |
| 运行时成本 | 装饰器 / 反射 / 包装函数      | **零运行时开销**——所有 schema 构建期注入 |
| 生态绑定   | 通常与某一打包器深度耦合      | **打包器无关**——核心算法纯函数式可复用 |
| 类型变更同步 | 需手动维护类型与 schema 一致 | TS 类型即权威源，编辑器即时反馈        |

## 安装

```bash
# pnpm（推荐）
pnpm add webmcp-nexus-core

# npm
npm install webmcp-nexus-core

# yarn
yarn add webmcp-nexus-core
```

> 大多数用户**不需要**直接安装这个包；安装 [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) 或 [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) 时它会作为依赖自动引入。

## 使用示例

### 在自定义构建工具中调用

> **重要**：`transformCode` 仅会处理**包含 `registerGlobalTools` / `useWebMcpTools` 调用**的源文件，并从这些调用向上追溯到工具函数定义。注入代码会插入在第一个注册调用之前，而不是工具函数定义文件中。

```ts
import { transformCode } from 'webmcp-nexus-core';

// 假设这是项目入口文件 src/main.ts 的内容
const code = `
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

registerGlobalTools(queries);
`;

const result = transformCode(code, '/abs/path/to/project/src/main.ts', {
  projectRoot: '/abs/path/to/project',
  alias: { '@': '/abs/path/to/project/src' },
});

if (result.transformed) {
  // result.code 在 registerGlobalTools 调用之前注入了 queries.* 各函数的 __webmcpSchema
  console.log(result.code);
}
```

注入产物（示意，来自 [`generateSchemaInjectionCode`](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/src/schema-generator.ts)）：

```ts
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

// [webmcp-nexus-core] 构建时注入的 schema 元数据
queries.searchTasks.__webmcpSchema = {
  "description": "根据关键词搜索任务。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "搜索关键词" },
      "limit": { "type": "number", "description": "返回数量上限（默认 50）" }
    },
    "required": ["query"]
  },
  "readOnly": true
};

registerGlobalTools(queries);
```

> 注入的 schema 仅含 `description` / `inputSchema` / `readOnly` 三个字段。运行时由 [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) 读取并转换为 `navigator.modelContext.registerTool()` 所需的格式（如 `readOnly` → `annotations.readOnlyHint`）。

## API 概览

```ts
// 高层 API：一次性完成提取 + 注入
export function transformCode(
  code: string,
  filePath: string,
  options?: TransformOptions
): TransformResult;

// 底层 API（高级用户）
export function extractToolsFromFile(
  fileContent: string,
  filePath: string,
  projectRoot?: string,
  alias?: AliasMap
): ExtractionResult | null;

export function generateSchema(
  properties: PropertyInfo[],
  description?: string
): JsonSchema;

export function generateSchemaInjectionCode(
  injectionTarget: string,
  description: string,
  properties: PropertyInfo[],
  readOnly: boolean
): string;
```

详见 [packages/webmcp-core/src/index.ts](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/src/index.ts)。

## 生态包

`webmcp-nexus-core` 是 WebMCP Nexus 工具链的一部分。完整的发布包列表：

| 包                                                                                         | 用途                                                  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | 运行时 SDK，提供 `registerGlobalTools` / `useWebMcpTools` |
| **`webmcp-nexus-core`** （本包）                                                            | 构建时核心：TS 类型抽取 + JSON Schema 生成              |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite 构建插件（基于本包）                              |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack 构建插件（基于本包）                           |

## 相关链接

- 📦 **GitHub 主仓库**：[alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **完整文档**：[README](https://github.com/alibaba/webmcp-nexus#readme)
- 🌐 **WebMCP 标准**：[webmcp.org](https://webmcp.org)
- 🐛 **Issues**：[GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## 许可证

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
