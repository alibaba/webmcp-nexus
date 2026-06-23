<div align="center">

# webpack-plugin-webmcp-nexus

**The Webpack plugin for WebMCP Nexus — generates JSON Schema from TypeScript types and injects it into tool functions during the Webpack build.**

[![npm version](https://img.shields.io/npm/v/webpack-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus)
[![npm downloads](https://img.shields.io/npm/dm/webpack-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus)
[![license](https://img.shields.io/npm/l/webpack-plugin-webmcp-nexus.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

[简体中文](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webpack-plugin-webmcp/README.md) | English

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Why Use It](#why-use-it)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Ecosystem](#ecosystem)
- [Links](#links)
- [License](#license)

## Introduction

`webpack-plugin-webmcp-nexus` is the **Webpack build plugin** for the [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) toolchain. It auto-injects an `enforce: 'pre'` Loader into `compiler.options.module.rules`, which calls [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core) to statically analyse WebMCP tool functions, infer JSON Schema from their **TypeScript types and JSDoc**, and inject that schema as a `__webmcpSchema` field on the function object.

Used together with [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk): at runtime the SDK reads that field and registers the tools with `navigator.modelContext`, so MCP clients can call them directly.

## Features

- 📦 **Webpack 4+ / 5+ support** — auto-injects the Loader into `compiler.options.module.rules`; no manual `use` configuration required.
- 🔬 **Types as schema** — function signatures + JSDoc are turned into JSON Schema; one source of truth.
- 🛠️ **Automatic alias merging** — picks up Webpack's `resolve.alias` (object or array form) and lets you extend it.
- 📂 **Flexible `include` configuration** — accept multiple directory prefixes to scope analysis.
- 🪶 **Zero runtime overhead** — all work happens at build time.
- 🔌 **Reserved global hook** — an extension point on `compiler.hooks.done` is reserved for future features (manifest generation, tool-name conflict detection, …).

## Why Use It

| Dimension          | Common practice                                    | webpack-plugin-webmcp-nexus                                              |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Schema generation  | Hand-written JSON Schema                           | **Automatically inferred from TS types**, with editor-time feedback     |
| Function intrusion | Decorators / wrapper functions                     | **Non-invasive** — functions are left untouched                          |
| Loader setup       | Manually configure `use` and ordering              | **Auto-injected**, no changes to your existing rules                     |
| Toolchain coupling | Tightly bound to a runtime SDK                     | Decoupled from [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk); only injects data into the bundle |

## Installation

```bash
# pnpm (recommended)
pnpm add -D webpack-plugin-webmcp-nexus

# npm
npm install --save-dev webpack-plugin-webmcp-nexus

# yarn
yarn add -D webpack-plugin-webmcp-nexus
```

> You also need the runtime SDK:
>
> ```bash
> pnpm add webmcp-nexus-sdk
> ```

## Usage

### 1. Configure `webpack.config.ts`

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

### 2. Write a plain TypeScript function

```ts
// src/tools/queries.ts

/**
 * Search tasks by keyword.
 * @readonly
 */
export async function searchTasks(params: {
  /** Search keyword */
  query: string;
  /** Maximum number of results (default 50) */
  limit?: number;
}): Promise<{ count: number; tasks: Task[] }> {
  // ... your original business logic
}
```

### 3. Register via the SDK

```ts
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

registerGlobalTools(queries);
```

Once the dev server starts, the plugin infers a JSON Schema from `searchTasks`'s TS types + JSDoc and injects it as `__webmcpSchema` on the function object; the SDK reads it in the browser to complete registration.

## Options

```ts
interface WebMcpPluginOptions {
  /** File-matching pattern. Default: /\.[jt]sx?$/ */
  test?: RegExp;

  /** Directory paths (relative to project root or absolute). Default: ['src'] */
  include?: string[];

  /**
   * Extra module path aliases (merged on top of webpack's resolve.alias).
   * Used to resolve module specifiers like `import * as api from '@alias/xxx'`.
   */
  alias?: Record<string, string>;
}
```

### Full example

```ts
new WebMcpPlugin({
  test: /\.tsx?$/,
  include: ['src/tools', 'src/pages'],
  alias: {
    '@tools': path.resolve(__dirname, 'src/tools'),
  },
});
```

> **Note**: Webpack's `RuleSetRule.include` uses absolute-path prefix matching and **does not support globs**; relative paths are automatically resolved against `compiler.context`.

## Ecosystem

| Package                                                                                    | Purpose                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | Runtime SDK exposing `registerGlobalTools` / `useWebMcpTools` |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | Build-time core: TS extraction + JSON Schema generation       |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite build plugin (if you're on Vite)                         |
| **`webpack-plugin-webmcp-nexus`** (this package)                                           | Webpack build plugin                                          |

## Links

- 📦 **Main repo on GitHub**: [alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **Full documentation**: [README](https://github.com/alibaba/webmcp-nexus#readme)
- 🎯 **Demo app**: [apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) — full Vite + Webpack dual-build example
- 🌐 **WebMCP standard**: [webmcp.org](https://webmcp.org)
- 🐛 **Issues**: [GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## License

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
