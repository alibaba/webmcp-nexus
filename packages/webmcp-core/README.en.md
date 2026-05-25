<div align="center">

# webmcp-nexus-core

**The build-time core of WebMCP Nexus — a `ts-morph`-powered engine for TypeScript type extraction and JSON Schema generation.**

[![npm version](https://img.shields.io/npm/v/webmcp-nexus-core.svg)](https://www.npmjs.com/package/webmcp-nexus-core)
[![npm downloads](https://img.shields.io/npm/dm/webmcp-nexus-core.svg)](https://www.npmjs.com/package/webmcp-nexus-core)
[![license](https://img.shields.io/npm/l/webmcp-nexus-core.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

[简体中文](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/README.md) | English

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Why Use It](#why-use-it)
- [Installation](#installation)
- [Usage](#usage)
- [API Overview](#api-overview)
- [Ecosystem](#ecosystem)
- [Links](#links)
- [License](#license)

## Introduction

`webmcp-nexus-core` is the **build-time core** of the [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) toolchain. It is responsible for:

1. Statically analysing source code via [`ts-morph`](https://ts-morph.com/) to find functions intended as WebMCP tools;
2. Inferring [JSON Schema](https://json-schema.org/)-compliant tool descriptions from each function's **TypeScript types and JSDoc**;
3. Generating injection code that attaches a `__webmcpSchema` field to each tool function — at runtime the SDK reads that field and registers the tools with `navigator.modelContext`.

This package is **not intended to be consumed directly by application authors**. It is the shared engine behind [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) and [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus). If you are building a **custom build-tool integration** (Rspack, Rollup, esbuild, …) you can reuse this package directly.

## Features

- 🔬 **`ts-morph`-driven static type analysis** — function signature *is* the JSON Schema; one source of truth.
- 🪶 **Zero runtime overhead** — schemas are generated at build time; no reflection or parsing at runtime.
- 📦 **Bundler-agnostic and reusable** — exposes a pure functional `transformCode(code, filePath, options?)` interface.
- 🔁 **Reverse tracing** — traces back from `registerGlobalTools` / `useWebMcpTools` call sites to the function definitions; tool functions themselves require no markers.
- 🧩 **Rich TypeScript support** — primitives, literal unions (→ `enum`), optional properties, nested objects (recursion ≤ 3 levels), and more.
- 🛠️ **Alias resolution** — handles `import * as api from '@alias/xxx'` style module specifiers (compatible with webpack `$` exact-match syntax).

## Why Use It

| Dimension              | Common practice                                | webmcp-nexus-core                                                  |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Schema source          | Hand-written JSON Schema + TS types in sync   | **Inferred from TS types automatically** — one source of truth    |
| Runtime cost           | Decorators / reflection / wrappers            | **Zero runtime cost** — all schemas are injected at build time    |
| Bundler coupling       | Tightly coupled to a specific bundler         | **Bundler-agnostic** — pure-functional core, reusable across tools |
| Type drift             | Manual sync between TS types and JSON Schema  | TS types are authoritative; the editor catches drift in real time |

## Installation

```bash
# pnpm (recommended)
pnpm add webmcp-nexus-core

# npm
npm install webmcp-nexus-core

# yarn
yarn add webmcp-nexus-core
```

> Most users **don't** need to install this package directly; it is pulled in automatically as a dependency of [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) and [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus).

## Usage

### Calling from a custom build tool

> **Important**: `transformCode` only processes source files that **contain a `registerGlobalTools` / `useWebMcpTools` call** — it traces back from those calls to the tool function definitions. The injected code is inserted before the first registration call, not into the tool function's own file.

```ts
import { transformCode } from 'webmcp-nexus-core';

// Example: contents of an entry file like src/main.ts
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
  // result.code now has __webmcpSchema injected for each queries.* tool, before the registerGlobalTools call
  console.log(result.code);
}
```

Sample injection output (from [`generateSchemaInjectionCode`](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/src/schema-generator.ts)):

```ts
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

// [webmcp-nexus-core] build-time injected schema metadata
queries.searchTasks.__webmcpSchema = {
  "description": "Search tasks by keyword.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search keyword" },
      "limit": { "type": "number", "description": "Maximum number of results (default 50)" }
    },
    "required": ["query"]
  },
  "readOnly": true
};

registerGlobalTools(queries);
```

> The injected schema contains only three fields: `description`, `inputSchema`, and `readOnly`. At runtime, [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk) reads it and translates it into the format expected by `navigator.modelContext.registerTool()` (e.g. `readOnly` → `annotations.readOnlyHint`).

## API Overview

```ts
// High-level API: extract + inject in one call
export function transformCode(
  code: string,
  filePath: string,
  options?: TransformOptions
): TransformResult;

// Low-level API (advanced users)
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

See [packages/webmcp-core/src/index.ts](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-core/src/index.ts) for the full surface.

## Ecosystem

`webmcp-nexus-core` is part of the WebMCP Nexus toolchain. The full set of published packages:

| Package                                                                                    | Purpose                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [`webmcp-nexus-sdk`](https://www.npmjs.com/package/webmcp-nexus-sdk)                       | Runtime SDK exposing `registerGlobalTools` / `useWebMcpTools` |
| **`webmcp-nexus-core`** (this package)                                                     | Build-time core: TS extraction + JSON Schema generation       |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite build plugin (built on this package)                     |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack build plugin (built on this package)                  |

## Links

- 📦 **Main repo on GitHub**: [alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **Full documentation**: [README](https://github.com/alibaba/webmcp-nexus#readme)
- 🌐 **WebMCP standard**: [webmcp.org](https://webmcp.org)
- 🐛 **Issues**: [GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## License

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
