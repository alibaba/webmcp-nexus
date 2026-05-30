# Fix: PropertyAssignment injectionTarget should use value expression

## Problem

`vite-plugin-webmcp` / `webpack-plugin-webmcp` 在构建时通过 `webmcp-nexus-core` 的 `transformCode` 为工具函数注入 `__webmcpSchema` 属性。当前实现中，对于对象字面量参数中的 `PropertyAssignment`（非 shorthand 写法），`injectionTarget` 被错误地设为对象的 **key 名**，而非 **value 表达式**。

```tsx
// 用户代码
useWebMcpTools({ listTodos: listTodosTool });

// 当前注入（错误）— listTodos 不是作用域中的变量，运行时 ReferenceError
listTodos.__webmcpSchema = {...};

// 期望注入（正确）— listTodosTool 是作用域中的变量
listTodosTool.__webmcpSchema = {...};
```

运行时 SDK 通过 `Object.entries(toolMap)` 迭代，从 value（`fn`）上读取 `fn.__webmcpSchema`，因此 schema 必须挂在 value 表达式引用的函数对象上。

## Solution

在 `packages/webmcp-core/src/ts-extractor.ts` 的 `resolveObjectLiteralArg` 函数中，`PropertyAssignment` 分支构建 `ExtractedTool` 时，将 `injectionTarget` 从 `toolName`（key 名）改为 `prop.getInitializer().getText()`（value 表达式文本）。

### Before

```ts
// ts-extractor.ts ~line 473
tools.push({
  name: toolName,
  description: metadata.description,
  properties: metadata.properties,
  readOnly: metadata.readOnly,
  sourceFile: relPath,
  injectionTarget: toolName,  // BUG: key name, not value expression
});
```

### After

```ts
tools.push({
  name: toolName,
  description: metadata.description,
  properties: metadata.properties,
  readOnly: metadata.readOnly,
  sourceFile: relPath,
  injectionTarget: (prop as any).getInitializer().getText(),  // FIX: value expression
});
```

## Transform Output Examples

### Case 1: Identifier value

```tsx
// Input
useWebMcpTools({ listTodos: listTodosTool });

// Output (injected before call)
listTodosTool.__webmcpSchema = { description: "...", inputSchema: {...}, readOnly: false };
useWebMcpTools({ listTodos: listTodosTool });
```

### Case 2: MemberExpression value

```tsx
// Input
useWebMcpTools({ search: api.search });

// Output
api.search.__webmcpSchema = { description: "...", inputSchema: {...}, readOnly: true };
useWebMcpTools({ search: api.search });
```

### Case 3: Mixed shorthand + non-shorthand

```tsx
// Input
useWebMcpTools({ listTodos: listTodosTool, createTodo });

// Output
listTodosTool.__webmcpSchema = { description: "...", inputSchema: {...}, readOnly: false };
createTodo.__webmcpSchema = { description: "...", inputSchema: {...}, readOnly: false };
useWebMcpTools({ listTodos: listTodosTool, createTodo });
```

## Backward Compatibility

This change is fully backward compatible:

| Pattern | Before | After |
|---------|--------|-------|
| `{ fn }` (shorthand) | Works | Unchanged (different code path) |
| `{ fn: fn }` (key = value) | Works | Same result (`getText()` = `"fn"`) |
| `registerGlobalTools(ns)` (namespace) | Works | Unchanged (different code path) |
| `{ listTodos: listTodosTool }` (non-shorthand) | ReferenceError | Fixed |

## Scope

### Modified files

- `packages/webmcp-core/src/ts-extractor.ts` — 1-line core logic change in `resolveObjectLiteralArg`

### Not modified

- `packages/webmcp-core/src/schema-generator.ts` — only concatenates `injectionTarget`, no logic change needed
- `packages/webmcp-core/src/transform.ts` — orchestration layer, no change needed
- `packages/webmcp-sdk/src/registerGlobalTools.ts` — runtime reads from `fn.__webmcpSchema`, unchanged
- `packages/webmcp-sdk/src/useWebMcpTools.ts` — same as above
- `packages/vite-plugin-webmcp/` — thin wrapper, delegates to core
- `packages/webpack-plugin-webmcp/` — thin wrapper, delegates to core

## Test Plan

Add test cases in `packages/webmcp-core/src/__tests__/transform.test.ts`:

1. **PropertyAssignment + Identifier value**: `{ listTodos: listTodosTool }` → assert output contains `listTodosTool.__webmcpSchema` and does NOT contain `listTodos.__webmcpSchema`
2. **PropertyAssignment + MemberExpression value**: `{ listTodos: api.listTodos }` → assert output contains `api.listTodos.__webmcpSchema`
3. **Mixed shorthand + non-shorthand**: `{ createTodo, listTodos: listTodosTool }` → assert both `createTodo.__webmcpSchema` and `listTodosTool.__webmcpSchema` present

## Unsupported Patterns

Inline CallExpression as value (e.g., `{ listTodos: useCallback(fn, deps) }`) is not supported. This pattern violates React's Rules of Hooks and cannot appear in valid code. The extractor will either skip it (no metadata extractable) or produce incorrect injection targeting a transient value. No action needed.
