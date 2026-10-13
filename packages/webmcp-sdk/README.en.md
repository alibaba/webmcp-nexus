<div align="center">

# webmcp-nexus-sdk

**The runtime SDK of WebMCP Nexus — turn any React app into a target MCP clients can drive directly, in five minutes.**

[![npm version](https://img.shields.io/npm/v/webmcp-nexus-sdk.svg)](https://www.npmjs.com/package/webmcp-nexus-sdk)
[![npm downloads](https://img.shields.io/npm/dm/webmcp-nexus-sdk.svg)](https://www.npmjs.com/package/webmcp-nexus-sdk)
[![license](https://img.shields.io/npm/l/webmcp-nexus-sdk.svg)](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE)

[简体中文](https://github.com/alibaba/webmcp-nexus/blob/main/packages/webmcp-sdk/README.md) | English

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Why Use It](#why-use-it)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Ecosystem](#ecosystem)
- [Links](#links)
- [License](#license)

## Introduction

`webmcp-nexus-sdk` is the runtime SDK of [WebMCP Nexus](https://github.com/alibaba/webmcp-nexus) — a production-ready React integration kit for the [W3C WebMCP standard proposal](https://webmcp.org).

It exposes only two APIs — `registerGlobalTools` and `useWebMcpTools` — that together cover **global**, **route**, and **component** lifecycles, letting any plain TypeScript function become callable by MCP clients (Claude Desktop, Cursor, VS Code, etc.) without any wrapping.

## Features

- 🪶 **Minimal API** — just two functions cover every registration case.
- 🧩 **Three-tier scoping** — global, route-level, and component-level tools follow lifecycles automatically.
- 🌐 **Cross-browser support** — Chrome 149+ uses the native `document.modelContext` (146–149 are entry-bridged by the polyfill); everywhere else, [`@mcp-b/webmcp-polyfill@5.1.0`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill) is auto-enabled on first registration (declared as a `dependencies` entry and resolved by your bundler, **not inlined into the published output**), transparent to your code. The SDK installs **non-enumerable** shape-normalization wrappers on the host's `getTools` / `executeTool` to absorb Chrome 155's input-shape change; `Object.keys(document.modelContext)` stays `[]`, preserving the polyfill's "no own enumerable keys" WebIDL fidelity invariant. `registerTool` is never wrapped.
- 🔁 **HMR-friendly** — change a tool signature during development and its schema re-registers automatically.
- 🛡️ **Collision-aware** — built-in scope ownership registry: duplicate names produce a warning instead of a crash, and teardown is strictly scoped.
- 🤝 **First-class desktop agents** — paired with [`@mcp-b/webmcp-local-relay`](https://www.npmjs.com/package/@mcp-b/webmcp-local-relay), local MCP clients can drive your running web app directly.

## Why Use It

| Dimension          | Common practice                                       | webmcp-nexus-sdk                                                          |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| API surface        | Decorators, wrapper functions, explicit schema config | **Two APIs** cover every case                                             |
| Function intrusion | `defineApi` / `createTool` wrappers                   | **Non-invasive** — the function stays exactly as it was                   |
| Lifecycle          | Global registration only, manually managed            | **Three-tier scoping** with automatic deregistration on unmount           |
| Browser support    | Each call site handles availability checks            | SDK ships with a **lazily loaded polyfill**                               |
| Type contract      | Hand-written JSON Schema + TS types kept in sync      | With the build plugin, schema is **inferred from TS types** at build time |

## Installation

```bash
# pnpm (recommended)
pnpm add webmcp-nexus-sdk

# npm
npm install webmcp-nexus-sdk

# yarn
yarn add webmcp-nexus-sdk
```

> **Pick one build plugin**: the SDK is typically used together with [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus) or [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus), which generate JSON Schema from TypeScript types + JSDoc at build time.

```bash
pnpm add -D vite-plugin-webmcp-nexus       # for Vite projects
# or
pnpm add -D webpack-plugin-webmcp-nexus    # for Webpack projects
```

## Quick Start

### 1. Write a plain TypeScript function

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
  // ... your original business logic — no wrapping required
}
```

### 2. Global registration (app entry)

```ts
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';

registerGlobalTools(queries);
```

The build plugin extracts a JSON Schema from each function's TS types + JSDoc and attaches it to the function object as `__webmcpSchema`; at runtime the SDK reads that field and registers the tools with `document.modelContext`.

### 3. Route-level / component-level registration

```tsx
import { useWebMcpTools } from 'webmcp-nexus-sdk';

export default function TasksPage() {
  const { createTask, updateTask, deleteTask } = useTodoStore();

  // Registered on mount, automatically deregistered on unmount
  useWebMcpTools({ createTask, updateTask, deleteTask });

  return /* … */;
}
```

Tools are deregistered when the component unmounts, **preventing the agent from invoking tools belonging to a page it isn't on**.

## API Overview

### `registerGlobalTools(tools)`

Call once at application startup to register a set of tools that live for the lifetime of the app.

```ts
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';
import * as navigation from './tools/navigation';

registerGlobalTools(queries);
registerGlobalTools(navigation);
```

### `useWebMcpTools(tools)`

A React Hook that binds a set of tools to the component lifecycle — registered on mount, deregistered on unmount.

```tsx
import { useWebMcpTools } from 'webmcp-nexus-sdk';

function MyDialog() {
  useWebMcpTools({ submitForm, cancelForm });
  return <Dialog />;
}
```

> Full API reference and best practices: see the [main repository README](https://github.com/alibaba/webmcp-nexus#readme).

## Browser Compatibility

The host surface moved from `navigator.modelContext` to the canonical `document.modelContext` (WebMCP draft of 2026-05-27; Chrome 150 deprecated the former). The SDK is **document-first with a navigator fallback** throughout, transparently to your code.

| Environment                    | Behaviour                                                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome 155+                    | Native `document.modelContext`. `executeTool` takes an **object** as its second argument, same-document `inputSchema` is an **object**, and `navigator.modelContextTesting` is gone                                                          |
| Chrome 150–154                 | Native `document.modelContext`. `executeTool` still takes a **JSON string**, and same-document `inputSchema` still returns the **serialized string**                                                                                         |
| Chrome 149                     | First Origin Trial release; still `navigator.modelContext`, and polyfill 5.1.0 performs entry bridging automatically                                                                                                                         |
| Chrome 146–148                 | Flag-only. The SDK keeps the full compatibility layer on this tier (EventTarget backfill, `listTools`/`callTool`/`getTools`/`executeTool` synthesis, `toolchange` bridging); 146–147 additionally use the `unregisterTool` teardown fallback |
| Chrome <146 / Firefox / Safari | `@mcp-b/webmcp-polyfill@5.1.0` is installed automatically on first registration                                                                                                                                                              |

> On native tiers the SDK installs **non-enumerable** two-axis shape-normalization wrappers on `getTools` / `executeTool`, absorbing Chrome 155's input-shape change and relay 6.x's intolerance of string `inputSchema`. `Object.keys(document.modelContext)` stays `[]`, and `registerTool` is never wrapped (the protocol puts `toolchange` dispatch responsibility on the host, so the SDK does not dispatch on its behalf).

For the full host matrix, the host admission requirements (origin isolation / Permissions Policy `tools`), the three-shape `inputSchema` compatibility notes, and the coexistence constraints with `@mcp-b/global` and `@mcp-b/webmcp-local-relay`, see the repository [README](https://github.com/alibaba/webmcp-nexus#browser-compatibility) and [CHANGELOG](https://github.com/alibaba/webmcp-nexus/blob/main/CHANGELOG.md).

> **Note**: `@mcp-b/global` must not be loaded alongside this SDK — it replaces both the `document` and `navigator` surfaces using value descriptors.

## Ecosystem

WebMCP Nexus is a monorepo. The packages published to npm:

| Package                                                                                    | Purpose                                            |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **`webmcp-nexus-sdk`** (this package)                                                      | Runtime SDK with two core APIs                     |
| [`webmcp-nexus-core`](https://www.npmjs.com/package/webmcp-nexus-core)                     | Build-time core: TS extraction + Schema generation |
| [`vite-plugin-webmcp-nexus`](https://www.npmjs.com/package/vite-plugin-webmcp-nexus)       | Vite build plugin                                  |
| [`webpack-plugin-webmcp-nexus`](https://www.npmjs.com/package/webpack-plugin-webmcp-nexus) | Webpack build plugin                               |

## Links

- 📦 **Main repo on GitHub**: [alibaba/webmcp-nexus](https://github.com/alibaba/webmcp-nexus)
- 📖 **Full documentation**: [README](https://github.com/alibaba/webmcp-nexus#readme)
- 🧠 **AI coding Skill**: [skill/SKILL.md](https://github.com/alibaba/webmcp-nexus/blob/main/skill/SKILL.md) — reduce "convert this function into a WebMCP tool" to a single instruction.
- 🎯 **Demo app**: [apps/demo](https://github.com/alibaba/webmcp-nexus/tree/main/apps/demo) — full Todo app with Vite + Webpack dual build.
- 🌐 **WebMCP standard**: [webmcp.org](https://webmcp.org)
- 🐛 **Issues**: [GitHub Issues](https://github.com/alibaba/webmcp-nexus/issues)

## License

[MIT](https://github.com/alibaba/webmcp-nexus/blob/main/LICENSE) © Alibaba
