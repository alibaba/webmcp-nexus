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
- [Built-in Tool: webmcpCallTool](#built-in-tool-webmcpcalltool)
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
- 🔧 **Built-in dispatch tool** — `webmcpCallTool` is registered automatically so that clients which ignore `tools/list_changed` can still call tools that appeared mid-session, by name. On a miss it returns the current page's tool directory so the agent can self-correct. See [Built-in Tool](#built-in-tool-webmcpcalltool).
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

### `configureBuiltinTools(options)`

Toggles the SDK's built-in tools. There is currently one: the global dispatch tool `webmcpCallTool` (enabled by default).

```ts
import { configureBuiltinTools } from 'webmcp-nexus-sdk';

// Disable the built-in dispatch tool. Order-independent: if it is already
// registered, it is deregistered on the spot.
configureBuiltinTools({ callTool: false });
```

## Built-in Tool: webmcpCallTool

The SDK automatically registers one built-in global tool, `webmcpCallTool`. **You don't write any code for it**: all three entry points — `registerGlobalTools`, `useWebMcpTools`, and `withWebMcpTools` — register it before registering your own tools (idempotent; repeated calls don't re-register).

### What problem it solves

Route-level and component-level tools come and go as pages mount and unmount. Tool list changes are announced via `tools/list_changed`, but that notification is only a **SHOULD** in the spec and clients are allowed to cache the list — **Qoder's session tool index is a startup snapshot and ignores `list_changed` entirely** in our testing. The result: tools that appear after the session started can never be called.

The relay side is accurate in real time; the gap is on the client. Since we can't fix the client, the SDK adds an escape hatch on the **page side**: `webmcpCallTool` is registered at startup, so it is guaranteed to be in the client's snapshot. It takes a tool name, looks the target up live via `document.modelContext.getTools()`, and dispatches to it.

```jsonc
// Example agent call
{ "name": "listTodos", "arguments": { "limit": 3 } }
```

This is the page-side equivalent of the relay's removed `webmcp_call_tool` (dropped in `@mcp-b/webmcp-local-relay` 5.0.0); the input shape and error behaviour match the old tool.

### Prerequisite: it must already be in the client's snapshot

The order has to be: **start the relay → open the page and confirm it connected → then start (or restart) the client session**. If the page is opened after the session started, the escape hatch itself isn't in the snapshot either, and there is nothing to call.

### `name` must be the page-side original name

The relay rewrites tool names: `sanitizeName` replaces `[^a-zA-Z0-9_]` with `_`, and tools published by multiple tabs get a `_<4-char tabId>` suffix. **`webmcpCallTool`'s `name` must be the pre-rewrite page-side name** — the `originalName` field returned by the relay's `webmcp_list_tools`, not the name your MCP client displays.

Nexus recommends camelCase-only tool names (see [`skill/SKILL.md`](https://github.com/alibaba/webmcp-nexus/blob/main/skill/SKILL.md)), in which case the two are identical anyway.

### Pairing with the relay's `webmcp_list_tools`

This SDK deliberately ships **no** companion listing tool — the relay's built-in `webmcp_list_tools` already reports every tool in real time with its `originalName` / `description` / `inputSchema`. Recommended flow:

1. The agent calls the relay's `webmcp_list_tools` to get live `originalName` and `inputSchema` values;
2. It then runs `webmcpCallTool({ name: <originalName>, arguments: {...} })`.

Skipping step 1 still self-heals: **on a miss, or when `name` is empty, `webmcpCallTool` returns an `isError` result carrying the current page's tool directory** (`name` / `description` / `inputSchema`), so the agent can correct the name in a single round trip. The directory is read live per page — tools from a route you navigated away from don't linger in it.

### When to turn it off

It is on by default. The usual reason to turn it off: you don't want agents bypassing your client's own tool-confirmation flow to reach destructive tools — when dispatching, the client sees `webmcpCallTool`'s own annotations (all three hints false, i.e. "transparent proxy, execution only"), not the target tool's.

```ts
configureBuiltinTools({ callTool: false });
```

### Other constraints

- `webmcpCallTool` is a **reserved name**: a tool of yours with the same name is shadowed by the built-in one (with an `already registered` warning in the console).
- The directory reflects **the current tab only**. With multiple tabs the client sees suffixed `webmcpCallTool_<tabId>` entries; each tab's dispatcher and directory are independent, and the relay handles routing.
- **Dispatched results are identical to direct calls**: the dispatcher only parses the JSON string returned by the host's `executeTool` and **does not re-normalize** it. The inner tool's value is handed back untouched so the consumer (the relay's `normalizeToolResponse`) finishes the job with its own, wider rules. Therefore `isError`, `structuredContent`, and content types like `resource_link` / `audio` are neither flattened nor downgraded — when the target tool fails, the agent sees a failure.
- It can only call **this page's** tools and is provided by the in-page SDK — it is not one of the relay's static tools. Don't confuse it with `webmcp_list_tools` / `webmcp_list_sources` / `webmcp_open_page`.

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
