<div align="center">

# vite-plugin-webmcp-nexus

**The Vite plugin for WebMCP Nexus — generates JSON Schema from TypeScript types and injects it into tool functions during the Vite build.**

[![npm version](https://img.shields.io/npm/v/vite-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)
[![npm downloads](https://img.shields.io/npm/dm/vite-plugin-webmcp-nexus.svg)](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)
[![license](https://img.shields.io/npm/l/vite-plugin-webmcp-nexus.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

[简体中文](https://github.com/alibaba/webmcp-nexus/blob/main/packages/vite-plugin-webmcp/README.md) | English

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

`vite-plugin-webmcp-nexus` is the **Vite build plugin** for the [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) toolchain. It hooks into Vite's `transform` lifecycle and delegates to [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core) to statically analyse WebMCP tool functions, infer JSON Schema from their **TypeScript types and JSDoc**, and inject that schema as a `__webmcpSchema` field on the function object.

Used together with [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk): at runtime the SDK reads that field and registers the tools with `navigator.modelContext`, so MCP clients can call them directly.

## Features

- ⚡ **First-class Vite integration** — hooks into the standard `transform` lifecycle; non-invasive and zero extra config.
- 🔬 **Types as schema** — function signatures + JSDoc are turned into JSON Schema; one source of truth.
- 🔁 **HMR-friendly** — change a function signature and the tool schema rebuilds automatically.
- 🛠️ **Automatic alias merging** — Vite's `resolve.alias` is picked up automatically; you can also extend it.
- 📂 **Flexible `include` matching** — glob patterns scope analysis to the directories you care about.
- 🪶 **Zero runtime overhead** — all work happens at build time.

## Why Use It

| Dimension          | Common practice                            | vite-plugin-webmcp-nexus                                                |
| ------------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| Schema generation  | Hand-written JSON Schema                   | **Automatically inferred from TS types**, with editor-time feedback    |
| Function intrusion | Decorators / wrapper functions             | **Non-invasive** — functions are left untouched                         |
| Dev experience     | Manual sync between types and schema      | **HMR rebuilds the schema automatically**                              |
| Toolchain coupling | Tightly bound to a runtime SDK             | Decoupled from [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk); only injects data into the bundle |

## Installation

```bash
# pnpm (recommended)
pnpm add -D vite-plugin-webmcp-nexus

# npm
npm install --save-dev vite-plugin-webmcp-nexus

# yarn
yarn add -D vite-plugin-webmcp-nexus
```

> You also need the runtime SDK:
>
> ```bash
> pnpm add webmcp-nexus-sdk
> ```

## Usage

### 1. Configure `vite.config.ts`

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

Run `pnpm dev` and the plugin infers a JSON Schema from `searchTasks`'s TS types + JSDoc and injects it as `__webmcpSchema` on the function object; the SDK reads it in the browser to complete registration.

## Options

```ts
interface WebMcpPluginOptions {
  /** Glob patterns to scan. Default: ['src/**/*.ts', 'src/**/*.tsx'] */
  include?: string[];

  /**
   * Extra module path aliases (merged on top of Vite's resolve.alias).
   * Used to resolve module specifiers like `import * as api from '@alias/xxx'`.
   */
  alias?: Record<string, string>;
}
```

### Full example

```ts
vitePluginWebMcp({
  include: ['src/tools/**/*.ts', 'src/pages/**/tools.ts'],
  alias: {
    '@tools': '/abs/path/to/src/tools',
  },
});
```

> Debug mode: set `DEBUG=webmcp` to see transform logs in the console.

## Ecosystem

| Package                                                                                    | Purpose                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | Runtime SDK exposing `registerGlobalTools` / `useWebMcpTools` |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | Build-time core: TS extraction + JSON Schema generation       |
| **`vite-plugin-webmcp-nexus`** (this package)                                              | Vite build plugin                                             |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack build plugin (if you're on Webpack)                   |

## Links

- 📦 **Main repo on GitHub**: [alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **Full documentation**: [README](https://github.com/alibaba/webmcp-nexus#readme)
- 🎯 **Demo app**: [apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) — full Vite example
- 🌐 **WebMCP standard**: [webmcp.org](https://webmcp.org)
- 🐛 **Issues**: [GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## License

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
