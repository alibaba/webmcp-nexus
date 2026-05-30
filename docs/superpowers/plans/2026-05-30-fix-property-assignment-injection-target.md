# Fix PropertyAssignment injectionTarget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix `__webmcpSchema` injection to target the value expression (not the key name) for non-shorthand PropertyAssignment in `useWebMcpTools` / `registerGlobalTools` object literals.

**Architecture:** Single-line fix in `ts-extractor.ts` that changes `injectionTarget` from `toolName` (key) to `prop.getInitializer().getText()` (value expression). Add test cases to verify the fix and prevent regression.

**Tech Stack:** TypeScript, ts-morph, Vitest

---

## File Structure

- **Modify:** `packages/webmcp-core/src/ts-extractor.ts:478` — change `injectionTarget` for PropertyAssignment
- **Modify:** `packages/webmcp-core/src/__tests__/transform.test.ts` — add 3 test cases

---

### Task 1: Add failing tests for PropertyAssignment injectionTarget

**Files:**
- Modify: `packages/webmcp-core/src/__tests__/transform.test.ts`

- [ ] **Step 1: Write failing test — Identifier value**

Add at the end of the `describe('transformCode', ...)` block:

```typescript
it('PropertyAssignment with Identifier value → injects on value variable', () => {
  const code = `
/** 列出待办 */
function listTodosTool(params: { limit?: number }) {
  return [];
}

useWebMcpTools({ listTodos: listTodosTool });
`;
  const filePath = path.join(tmpDir, 'prop-assign-identifier.tsx');
  fs.writeFileSync(filePath, code);

  const result = transformCode(code, filePath);

  expect(result.transformed).toBe(true);
  expect(result.code).toContain('listTodosTool.__webmcpSchema');
  expect(result.code).not.toContain('listTodos.__webmcpSchema');
});
```

- [ ] **Step 2: Write failing test — MemberExpression value**

```typescript
it('PropertyAssignment with MemberExpression value → injects on member expression', () => {
  // 创建源模块文件
  const moduleContent = `
/** 搜索用户 */
export function searchUser(params: { query: string }) {
  return [];
}
`;
  const modulePath = path.join(tmpDir, 'user-api.ts');
  fs.writeFileSync(modulePath, moduleContent);

  const code = `
import * as userApi from './user-api';

useWebMcpTools({ search: userApi.searchUser });
`;
  const filePath = path.join(tmpDir, 'prop-assign-member.tsx');
  fs.writeFileSync(filePath, code);

  const result = transformCode(code, filePath);

  expect(result.transformed).toBe(true);
  expect(result.code).toContain('userApi.searchUser.__webmcpSchema');
  expect(result.code).not.toContain('search.__webmcpSchema');
});
```

- [ ] **Step 3: Write failing test — mixed shorthand and non-shorthand**

```typescript
it('Mixed shorthand + PropertyAssignment → each injects on correct target', () => {
  const code = `
/** 创建待办 */
function createTodo(params: { title: string }) {
  return { id: '1', title: params.title };
}

/** 列出待办 */
function listTodosTool(params: { limit?: number }) {
  return [];
}

useWebMcpTools({ createTodo, listTodos: listTodosTool });
`;
  const filePath = path.join(tmpDir, 'prop-assign-mixed.tsx');
  fs.writeFileSync(filePath, code);

  const result = transformCode(code, filePath);

  expect(result.transformed).toBe(true);
  // shorthand: key = variable name
  expect(result.code).toContain('createTodo.__webmcpSchema');
  // non-shorthand: value expression
  expect(result.code).toContain('listTodosTool.__webmcpSchema');
  expect(result.code).not.toContain('listTodos.__webmcpSchema');
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd packages/webmcp-core && pnpm test -- --run`

Expected: 3 new tests FAIL — they assert `listTodosTool.__webmcpSchema` but current code generates `listTodos.__webmcpSchema`.

- [ ] **Step 5: Commit failing tests**

```bash
git add packages/webmcp-core/src/__tests__/transform.test.ts
git commit -m "test: add failing tests for PropertyAssignment injectionTarget bug"
```

---

### Task 2: Fix injectionTarget for PropertyAssignment

**Files:**
- Modify: `packages/webmcp-core/src/ts-extractor.ts:478`

- [ ] **Step 1: Apply the fix**

In `packages/webmcp-core/src/ts-extractor.ts`, locate line 478 inside the `resolveObjectLiteralArg` function. Change:

```typescript
      injectionTarget: toolName,
```

to:

```typescript
      injectionTarget: (prop as any).getInitializer().getText(),
```

This is within the `tools.push({...})` call at the end of the PropertyAssignment handling block (~line 472-479).

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd packages/webmcp-core && pnpm test -- --run`

Expected: All tests PASS, including the 3 new tests from Task 1 and all pre-existing tests.

- [ ] **Step 3: Commit the fix**

```bash
git add packages/webmcp-core/src/ts-extractor.ts
git commit -m "fix(core): use value expression as injectionTarget for PropertyAssignment

Previously, non-shorthand properties like { listTodos: listTodosTool }
generated listTodos.__webmcpSchema which caused ReferenceError because
listTodos is not a variable in scope. Now correctly generates
listTodosTool.__webmcpSchema targeting the actual function reference."
```

---

### Task 3: Verify end-to-end in demo app

**Files:**
- No file changes — verification only

- [ ] **Step 1: Run the full test suite from project root**

Run: `pnpm test -- --run`

Expected: All packages pass.

- [ ] **Step 2: Build the demo app to verify no runtime errors**

Run: `cd apps/demo && pnpm build`

Expected: Build succeeds with no errors. If the demo currently uses shorthand-only patterns, this confirms no regression. If it uses non-shorthand patterns, the build will now succeed where it previously would have produced broken code.
