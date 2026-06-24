---
name: webmcp-nexus
description: 当接入 webmcp-nexus-sdk 的项目中需要新增 WebMCP 工具函数、将现有业务方法改造为 WebMCP 工具函数，或配置 vite-plugin-webmcp-nexus / webpack-plugin-webmcp-nexus 时使用本技能。本技能约束工具函数的签名、JSDoc、TS 类型写法，并提供零风险的改造流程（仅改签名与注释，不动原方法业务逻辑）。触发示例："新增一个 WebMCP 工具"、"把这个函数改造成能被 AI Agent 调用的工具"、"让 xxx 函数接入 WebMCP"、"配置 webmcp 构建插件"。
---

# webmcp-nexus-skill

本技能用于指导 AI 编码 Agent（Cursor / Claude Code / Qoder / Continue 等）在**已接入或即将接入 `webmcp-nexus-sdk` 的业务项目**中进行以下四类工作：

1. **约束开发规范** —— 工具函数的签名、JSDoc、TS 类型写法。
2. **生成新工具函数** —— 按规范从零写一个符合 WebMCP schema 抽取要求的函数。
3. **改造现有方法为工具函数（核心）** —— 把项目里已有的业务函数（可能是位置参数、缺 JSDoc、参数类型是 `any` 等）改造成合规工具函数。**红线：只改签名与注释，绝不修改原方法的功能与业务逻辑**。
4. **SDK / 构建插件接入引导** —— `webmcp-nexus-sdk`、`vite-plugin-webmcp-nexus`、`webpack-plugin-webmcp-nexus` 的安装与配置。

本技能**不关心**项目的代码风格（分号、引号、缩进、Prettier 配置）、ESLint 规则、tsconfig 其他选项——这些不影响 WebMCP 工具的提取与注册。

---

## 0. 三级约束（TL;DR）

WebMCP 构建插件（Vite/Webpack plugin）通过 ts-morph 从 `registerGlobalTools(...)` / `useWebMcpTools(...)` / `withWebMcpTools(...)` 的调用位置**向上追踪**工具函数的定义，提取 JSDoc 与参数类型，在构建阶段把 `__webmcpSchema`（description / inputSchema / annotations）注入到每个函数对象上。SDK 在运行时读取该字段向 `navigator.modelContext` 注册。

约束严重度分三级，递减：

### MUST —— 违反将导致函数无法注册，或 schema 被污染而无法被 LLM 调用

| #   | 约束                                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | 工具函数必须**可被追踪**。三种可追踪形式：① 作为对象字面量属性传入 `registerGlobalTools({ fn })` / `useWebMcpTools({ fn })`；② 在 `import * as api from './module'` 的 `./module` 里作为**具名导出**（避免 `export default`，否则工具名会被解析成字符串 `"default"`）；③ 作为 class 组件内带 JSDoc 的方法，通过 `withWebMcpTools(MyClass)` 注册 |
| M2  | 工具函数必须**接受单一对象类型**参数（命名 interface / type alias / 内联对象字面量）。原始类型 / 数组 / `any` / 泛型会让 ts-morph 吐出原型链上的一堆属性（`length`、`charAt`…），schema 被污染，LLM 调用必失败                                                        |

### SHOULD —— 违反不阻止注册，但 schema 质量差，LLM 难以理解

| #   | 约束                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------- |
| S1  | 工具函数本身有 `/** 一行描述 */` JSDoc。缺失时 description 为空字符串，LLM 不知道工具用途            |
| S2  | 参数类型每个字段有 `/** 描述 */` JSDoc。缺失时字段仍进 schema，只是没 description，LLM 不知字段含义  |
| S3  | 只读工具（查询 / 搜索 / 不改状态）在函数 JSDoc 追加 `@readonly`，宿主 Agent 据此判断是否需要用户确认 |

### MAY —— 风格建议，不影响功能

| #   | 约束                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------- |
| A1  | 工具函数写成 `async` 或返回 `Promise<T>`。SDK 外层永远会 `async` 包装，同步函数也能工作，但 `async` 更直观 |
| A2  | 使用命名导出。仅在对象字面量 `{ fn }` 场景下**不约束**——工具名永远来自字面量 key，与导出方式无关           |

**关键结论：只要满足 M1 + M2，函数一定能注册**。其余是质量与风格。

---

## 1. 接入引导

### 1.1 检查接入状态（Agent 必做的第一步）

写任何工具函数前，先 `grep` 一下项目里是否存在 `registerGlobalTools` 或 `useWebMcpTools` 的导入：

```bash
grep -r "from ['\"]webmcp-nexus-sdk['\"]" src/
```

若都不存在，说明项目未接入。此时**不要**按本技能生成工具函数，先告知用户完成以下接入步骤。

### 1.2 安装 SDK

包发布在公网 npm registry，推荐使用 **pnpm**（项目本身基于 pnpm workspace），也可使用 npm / yarn：

```bash
pnpm add webmcp-nexus-sdk
# 或
npm install webmcp-nexus-sdk
```

### 1.3 配置构建插件

**Vite 项目**：

```bash
pnpm add -D vite-plugin-webmcp-nexus
# 或
npm install -D vite-plugin-webmcp-nexus
```

**ESM 配置（`vite.config.ts`，推荐）**：

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webmcp from 'vite-plugin-webmcp-nexus';

export default defineConfig({
  plugins: [
    webmcp(), // 必须放在 react 之前或之后均可，但必须在 TS transform 之前生效
    react(),
  ],
});
```

**CJS 配置（`vite.config.js` / `vite.config.cjs`）**：

```js
// vite.config.cjs
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const webmcp = require('vite-plugin-webmcp-nexus').default;

module.exports = defineConfig({
  plugins: [webmcp(), react()],
});
```

**Webpack 项目**：

```bash
pnpm add -D webpack-plugin-webmcp-nexus
# 或
npm install -D webpack-plugin-webmcp-nexus
```

**ESM 配置（`webpack.config.ts` / `webpack.config.mjs`）**：

```ts
// webpack.config.ts
import { WebMcpPlugin } from 'webpack-plugin-webmcp-nexus';

export default {
  // ...
  plugins: [new WebMcpPlugin()],
};
```

**CJS 配置（`webpack.config.js`，最常见）**：

```js
// webpack.config.js
const { WebMcpPlugin } = require('webpack-plugin-webmcp-nexus');

module.exports = {
  // ...
  plugins: [
    new WebMcpPlugin(),
    // ...
  ],
};
```

> 注：Webpack 插件是**具名导出** `WebMcpPlugin`（类），导入时必须用解构 `{ WebMcpPlugin }` 或 `import { WebMcpPlugin }`，**不要写成默认导入**。

插件无需配置选项即可工作。它会：

- 扫描包含 `registerGlobalTools(...)` / `useWebMcpTools(...)` 调用的源文件
- 向上追踪工具函数定义，提取 JSDoc 与 TS 类型
- 在函数对象上注入 `__webmcpSchema` 字段

### 1.4 注册入口

应用入口文件（`main.ts` / `main.tsx`）调用一次 `registerGlobalTools`：

```tsx
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as userApi from './api/user';
import * as productApi from './api/product';

registerGlobalTools(userApi, productApi);
```

组件 / 路由级工具则在对应组件内调用 `useWebMcpTools`（见 §5.2），class 组件使用 `withWebMcpTools`（见 §5.3）。

---

## 2. 工具函数规范

### 2.1 签名模板

**模板 A：API 层 / 模块级工具函数（配合 `registerGlobalTools`）**

```ts
export interface MyToolParams {
  /** 字段 1 的含义 */
  field1: string;
  /** 字段 2 的含义（可选） */
  field2?: number;
  /** 枚举字段 */
  field3?: 'a' | 'b' | 'c';
}

/**
 * 工具的一句话描述（用于 LLM 判断何时调用）
 * @readonly
 */
export async function myTool(params: MyToolParams): Promise<MyToolResult> {
  // 实现
}
```

**模板 B：React 组件内工具函数（配合 `useWebMcpTools`）**

```tsx
/**
 * 工具的一句话描述
 * @readonly
 */
const myTool = useCallback(
  async (params: {
    /** 字段 1 的含义 */
    field1: string;
    /** 字段 2 的含义 */
    field2?: number;
  }) => {
    return { ok: true };
  },
  [
    /* 依赖 */
  ],
);
```

**模板 C：Class 组件工具方法（配合 `withWebMcpTools`）**

```tsx
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyComponent extends React.Component {
  /**
   * 工具的一句话描述
   * @readonly
   */
  myTool(params: {
    /** 字段 1 的含义 */
    field1: string;
    /** 字段 2 的含义 */
    field2?: number;
  }) {
    return this.state.data.filter(/* ... */);
  }

  /** 另一个工具（class field 形式） */
  anotherTool = (params: {
    /** 字段说明 */
    name: string;
  }) => {
    this.setState({ name: params.name });
    return { ok: true };
  };

  render() { return <div />; }
}

export default withWebMcpTools(MyComponent);
```

### 2.2 参数类型支持矩阵

| TS 类型                         | 支持 | 生成的 JSON Schema 字段类型                               |
| ------------------------------- | ---- | --------------------------------------------------------- |
| `string` / `number` / `boolean` | ✅   | `string` / `number` / `boolean`                           |
| 字面量联合 `'a' \| 'b' \| 'c'`  | ✅   | `string` + `enum`                                         |
| 可选字段 `field?: T`            | ✅   | 不出现在 `required` 中                                    |
| 数组 `T[]` / `Array<T>`         | ✅   | `array` + `items`                                         |
| 嵌套对象 interface              | ✅   | `object` + `properties`（最深 3 层）                      |
| `Date`                          | ⚠️   | 当前按 `string` 处理；建议传 ISO 字符串并在字段注释里说明 |
| 泛型参数 `<T>(p: T)`            | ❌   | 不支持，请具化类型                                        |
| `any` / `unknown`               | ❌   | 会降级为 `string`，字段含义丢失                           |
| 交叉类型 `A & B`                | ⚠️   | 尽量避免；必须用时拆成扁平 interface                      |
| `enum`                          | ❌   | 请改用字面量联合                                          |

### 2.3 JSDoc 规则

**只有 `/** _/` 块注释会被提取为 description**。`//`行注释和`/_ \*/`（单星号）块注释**都不会**被识别。规则来自 TypeScript/ts-morph 的 JSDoc 定义。

```ts
export interface Params {
  /** ✅ 上方形式，有效 */
  field1: string;
  /** ✅ 同行前置形式，有效 */ field2: string;
  field3: string; // ❌ 行尾 // 注释，不会被提取
  // ❌ 上方 // 行注释，不会被提取
  field4: string;
  /* ❌ 单星号块注释，不会被提取 */
  field5: string;
}
```

函数体内、模块头、TODO、实现细节等**非描述性注释位置**，想用 `//` 还是 `/* */` 完全自由，插件不看这些位置。

### 2.4 `@readonly` 判定

| 类型                    | 加 `@readonly`？ |
| ----------------------- | ---------------- |
| 查询 / 搜索 / 列表 / 读 | ✅ 加            |
| 新建 / 修改 / 删 / 写   | ❌ 不加          |
| 触发副作用的动作        | ❌ 不加          |

---

## 3. 生成新工具函数（工作流）

用户说「新增一个 WebMCP 工具」或「加一个 AI 能调用的 xxx 方法」时，按下列顺序：

1. **确认接入状态**（§1.1）。未接入则停止。
2. **判断工具作用域**：
   - 全站可用 → 新建 / 编辑 `src/api/*.ts`，用 `export async function`，并确认入口已覆盖导入。
   - 仅某页面可用 → 在页面组件内用 `useCallback` + `useWebMcpTools`。
   - 仅某组件可用 → 同上，在该组件内。
3. **按 §2 的签名模板撰写**：
   - MUST：单一对象参数、命名导出或对象字面量 key。
   - SHOULD：函数 JSDoc、字段 JSDoc、按语义决定 `@readonly`。
4. **不要修改**项目的 Prettier / ESLint / tsconfig 配置（除非用户明确要求）。
5. **自检**：把生成的代码对照 §0 的 MUST 两条和 §2.3 的 JSDoc 规则快速过一遍。

---

## 4. 【核心】将现有方法改造为工具函数

> **这是本技能最重要的章节。**改造现有方法是高频需求，而且最容易出事故——Agent 很容易顺手"优化"掉原方法的逻辑。

### 4.1 改造红线（Agent 必读）

- ✅ **可以改**：函数签名（参数从位置参数合并为对象参数）、参数/返回值的 TS 类型声明、添加 JSDoc、把 `export default` 改为命名导出。
- ❌ **绝对不要改**：函数体内的任何业务逻辑、控制流、错误处理、返回值结构、外部副作用、调用的第三方 API、变量命名（除非是参数名变化必须同步）。
- ❌ **绝对不要"顺手优化"**：不要重构、不要"简化"、不要补 try/catch、不要删"看起来没用的"代码、不要改 lint 风格。
- ❌ **不要引入新依赖**：JSDoc 里不要编造原函数没做的事情，描述必须基于**对现有行为的观察**。

**改造后的 diff 应当满足**：去掉 JSDoc 注释、参数解构语法差异后，函数体字节级别与原版一致。

### 4.2 改造决策流程

对任一待改造函数 `f`，按此流程判定：

```
1. f 的参数是不是单一对象类型？
   ├─ 是 → 跳到第 2 步
   └─ 否 →
       ├─ 多个位置参数：合并为 { a, b, c }，函数体内部引用保持 a/b/c 不变（用对象解构）
       ├─ 单个原始类型（如 string/number）：包一层 { id: string }
       ├─ 参数是 any/unknown：具化为 interface
       └─ 泛型参数：具化（如果业务只用一种类型），否则不适合改造为 WebMCP 工具

2. f 的导出方式？
   ├─ 命名导出（export function / export const） → OK
   ├─ 对象字面量场景注册（registerGlobalTools({ f })） → 任何导出方式都 OK
   └─ export default + 准备用 import * as 注册 → 改为命名导出

3. 补 JSDoc：
   ├─ 函数：一句话描述（基于现有行为总结，不编造）
   ├─ 字段：每个参数字段一句话描述
   └─ 只读语义 → 加 @readonly

4. 检查 call site：
   └─ 如果第 1 步把位置参数合并成了对象参数，必须 grep 所有调用点同步修改
```

### 4.3 常见改造场景

#### 场景 1：位置参数 → 对象参数

```ts
// 原函数（不改）
export async function searchUsers(keyword, pageSize = 20, role) {
  const params = new URLSearchParams({ keyword, pageSize: String(pageSize) });
  if (role) params.set('role', role);
  const res = await fetch(`/api/users?${params}`);
  return res.json();
}
```

改造后：

```ts
export interface SearchUsersParams {
  /** 搜索关键词 */
  keyword: string;
  /** 每页数量 */
  pageSize?: number;
  /** 用户角色筛选 */
  role?: 'admin' | 'user' | 'guest';
}

/**
 * 搜索用户列表
 * @readonly
 */
export async function searchUsers({
  keyword,
  pageSize = 20,
  role,
}: SearchUsersParams): Promise<User[]> {
  // ⬇ 函数体与原版完全一致，未做任何修改
  const params = new URLSearchParams({ keyword, pageSize: String(pageSize) });
  if (role) params.set('role', role);
  const res = await fetch(`/api/users?${params}`);
  return res.json();
}
```

**Call site 同步**：

```ts
// 原调用
searchUsers('alice', 50, 'admin');
// 改后
searchUsers({ keyword: 'alice', pageSize: 50, role: 'admin' });
```

Agent 必须 `grep -rn "searchUsers(" src/` 找出所有调用点同步修改。

#### 场景 2：原始类型参数 → 对象参数

```ts
// 原函数
export async function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

改造后：

```ts
export interface GetUserParams {
  /** 用户 ID */
  id: string;
}

/**
 * 根据 ID 获取用户详情
 * @readonly
 */
export async function getUser({ id }: GetUserParams): Promise<User> {
  // ⬇ 函数体字节级别与原版一致
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

#### 场景 3：`any` / 缺类型 → 具化类型

```ts
// 原函数
export async function createOrder(params: any) {
  return request.post('/api/orders', params);
}
```

改造后（**只补类型与注释，不动实现**）：

```ts
export interface CreateOrderParams {
  /** 商品 ID */
  productId: string;
  /** 数量 */
  quantity: number;
  /** 收货地址 */
  address: string;
}

/** 创建订单 */
export async function createOrder(params: CreateOrderParams) {
  // ⬇ 函数体与原版一致
  return request.post('/api/orders', params);
}
```

**注意**：具化类型时，若不确定原函数实际支持哪些字段，**先查 call site 或询问用户**，不要臆测。

#### 场景 4：`export default` → 命名导出（仅 `import *` 注册场景需要）

```ts
// 原写法
export default async function fetchDashboard() {
  /* ... */
}
```

改造：

```ts
// 改为命名导出
export async function fetchDashboard() {
  /* 函数体不变 */
}
```

同步所有 `import fetchDashboard from ...` → `import { fetchDashboard } from ...`。

**若项目用的是对象字面量形式 `registerGlobalTools({ fetchDashboard })`，可以保留 `export default`，不改**。

#### 场景 5：补 JSDoc（最简单，零风险）

```ts
// 原函数：签名已合规，只是缺注释
export async function listProducts(params: ListProductsParams): Promise<Product[]> {
  /* ... */
}
export interface ListProductsParams {
  category: string;
  pageSize: number;
}
```

改造：

```ts
export interface ListProductsParams {
  /** 产品分类 */
  category: string;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 获取产品列表
 * @readonly
 */
export async function listProducts(params: ListProductsParams): Promise<Product[]> {
  /* 不动 */
}
```

### 4.4 改造后验证步骤

1. **Diff 审查**：`git diff` 后，函数体（除参数解构的引入外）应当和原版完全一致。
2. **Call site 审查**：如果改了参数形式，`grep` 确保所有调用点都已更新；`tsc --noEmit` 无新增类型错误。
3. **Schema 审查**（有构建产物时）：`grep "__webmcpSchema" dist/` 确认目标函数的 schema 已注入，`inputSchema.properties` 里没有 `length` / `charAt` 等原型链污染。
4. **行为回归**：如果项目有单测，跑一遍确保没动功能；若无单测，至少在本地把涉及的页面点一遍。

### 4.5 改造禁忌清单

| 禁忌                                               | 原因                                         |
| -------------------------------------------------- | -------------------------------------------- |
| 把 `fetch` 换成 `axios`（或反之）                  | 改变了运行时行为                             |
| 给原来没 try/catch 的函数加 try/catch              | 改变了异常传播                               |
| 把原来返回 `data.list` 改成 `data.items`           | 改变了返回结构                               |
| 合并参数时顺手改了默认值（`pageSize = 20` → `10`） | 改变了行为                                   |
| 把原来同步函数"升级"为 `async`                     | 除非调用方全部同步改，否则破坏现有 call site |
| 删掉原函数里的 `console.log` / 注释                | 超出改造范围                                 |
| 把参数字段名从 `userId` 改成 `id`（符合规范命名）  | 改变了外部契约，需用户确认                   |
| 给函数加 `@readonly` 但函数内部有写操作            | 语义错误                                     |

---

## 5. 注册 API 用法

SDK 暴露三个 API，用途严格区分。

| API                   | 生命周期         | 调用位置                                 |
| --------------------- | ---------------- | ---------------------------------------- |
| `registerGlobalTools` | 应用级，全程存在 | 应用入口文件，整个应用只调用一次         |
| `useWebMcpTools`      | 组件 / 路由级    | React 函数组件内作为 Hook 调用，自动注销 |
| `withWebMcpTools`     | 组件级           | React class 组件 `export default` 包裹  |

### 5.1 `registerGlobalTools`（应用启动注册）

**签名**：

```ts
function registerGlobalTools(...toolMaps: Record<string, Function>[]): void;
```

**形态 A：`import * as` 批量导入（推荐）**

```tsx
// src/main.tsx
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as userApi from './api/user';
import * as productApi from './api/product';

// SDK 会自动跳过非函数值（interface / type 在运行时不存在，不会误注册）
registerGlobalTools(userApi, productApi);
```

**形态 B：手动挑选**

```ts
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import { getUser, searchUsers } from './api/user';
import { searchProducts } from './api/product';

registerGlobalTools({ getUser, searchUsers }, { searchProducts });
```

**要点**：

- 没有 `__webmcpSchema` 字段的函数会被**静默跳过**。排查时先 `grep "__webmcpSchema" dist/`。
- 仅在浏览器环境且 `navigator.modelContext` 存在时才真正注册；SSR / 无宿主 Agent 环境自动 no-op。

### 5.2 `useWebMcpTools`（组件 / 路由级注册）

**签名**：

```ts
function useWebMcpTools(...toolMaps: Record<string, Function>[]): void;
```

**生命周期**：组件挂载注册，卸载自动注销；多实例通过内部 `scopeId` 区分不会互相覆盖。

**形态 A：路由级**

```tsx
// src/pages/UsersPage.tsx
import { useState, useCallback } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { searchUsers } from '../api/user';

export default function UsersPage() {
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'guest'>();
  const [users, setUsers] = useState<User[]>([]);

  /** 设置用户搜索筛选条件并刷新列表 */
  const setUserFilter = useCallback(
    async (params: {
      /** 搜索关键词 */
      keyword?: string;
      /** 用户角色 */
      role?: 'admin' | 'user' | 'guest';
    }) => {
      const nextKeyword = params.keyword ?? keyword;
      const nextRole = params.role ?? role;
      if (params.keyword !== undefined) setKeyword(nextKeyword);
      if (params.role !== undefined) setRole(nextRole);
      const result = await searchUsers({ keyword: nextKeyword, role: nextRole });
      setUsers(result);
      return { applied: true, count: result.length };
    },
    [keyword, role],
  );

  useWebMcpTools({ setUserFilter });

  return <div>{/* ... */}</div>;
}
```

**形态 B：组件级多工具一次注册**

```tsx
useWebMcpTools({ searchInPanel, clearSearch });
```

**形态 C：条件注册**

```tsx
// 多个 toolMap 自动合并；同名后者覆盖前者
useWebMcpTools({ searchInPanel }, isAdmin ? { clearAll } : {});
```

**要点**：

- 推荐用 `useCallback` 固化引用，避免 HMR 下重注册抖动。
- 不要在条件、循环、嵌套函数里调用 `useWebMcpTools`（React Hook 规则）。
- 工具函数内部引用的 state / props 由 SDK 内部通过 `useRef` 解决闭包陷阱，**直接写即可**。

### 5.3 `withWebMcpTools`（class 组件注册）

**签名**：

```ts
function withWebMcpTools<P>(
  Component: React.ComponentClass<P>,
  methodNames?: string[],
): React.ComponentType<P>;
```

**生命周期**：同 `useWebMcpTools` —— 组件挂载注册，卸载自动注销。

**支持的方法形式**：
- 原型方法：`methodName(params: T) { ... }`
- Class field 箭头函数：`methodName = (params: T) => { ... }`

**示例**：

```tsx
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class OrderPanel extends React.Component {
  /** 搜索订单 @readonly */
  searchOrders(params: { keyword: string; status?: 'pending' | 'done' }) {
    return this.state.orders.filter(o => o.name.includes(params.keyword));
  }

  /** 导出当前订单列表 */
  exportOrders = (params: { format: 'csv' | 'json' }) => {
    // 访问 this.state / this.props 始终为最新值
    return download(this.state.orders, params.format);
  };

  render() { return <div />; }
}

export default withWebMcpTools(OrderPanel);
// 或显式指定：withWebMcpTools(OrderPanel, ['searchOrders'])
```

**约束**：
- 必须作为最内层 HOC（`connect(withWebMcpTools(Comp))` ✅ / `withWebMcpTools(connect(Comp))` ❌）
- 不支持匿名内联 class（`withWebMcpTools(class extends Component {...})` ❌）
- 方法规范同 §2（单一对象参数 + JSDoc）

---

## 6. 正误对照（自检清单）

| 级别    | 问题                                   | 错误写法                                     | 修复后                                                          |
| ------- | -------------------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| MUST    | 位置参数                               | `async function getUser(id: string)`         | `async function getUser(params: { /** 用户 ID */ id: string })` |
| MUST    | 参数类型是 `any` / `unknown`           | `async function run(params: any)`            | 定义具名 `RunParams` interface                                  |
| MUST    | 参数是原始类型 / 数组                  | `async function get(ids: string[])`          | `async function get(params: { /** ID 列表 */ ids: string[] })`  |
| MUST \* | `export default`（仅 `import *` 场景） | `export default async function search(p: P)` | `export async function search(p: P)`                            |
| SHOULD  | 字段缺 JSDoc                           | `interface P { keyword: string }`            | `interface P { /** 搜索关键词 */ keyword: string }`             |
| SHOULD  | 函数缺 JSDoc                           | `export async function search(params: P)`    | 在函数上方加 `/** 搜索 */`                                      |
| SHOULD  | 用 `//` 代替 `/** */`                  | `// 搜索关键词\nkeyword: string`             | `/** 搜索关键词 */\nkeyword: string`                            |
| SHOULD  | 枚举用 `enum`                          | `enum Role { Admin, User }`                  | `type Role = 'admin' \| 'user'`（参数里直接用字面量联合）       |
| SHOULD  | 只读工具忘标 `@readonly`               | `/** 搜索 */` + 只读语义                     | `/** 搜索\n * @readonly */`                                     |
| SHOULD  | 写操作错加 `@readonly`                 | `/** 创建 @readonly */`                      | 删掉 `@readonly`                                                |

\* **MUST\*** 仅在「`import * as api from './mod'` + `registerGlobalTools(api)`」场景下适用；对象字面量形式 `registerGlobalTools({ fn })` 不受此约束。

---

## 7. FAQ

**Q1：工具写完后，LLM 调用失败或看不到工具，怎么排查？**

按优先级检查：

1. `navigator.modelContext` 是否存在（需要宿主环境支持）。
2. 构建产物里该函数是否带 `__webmcpSchema`。没有 → 检查 §0 MUST 两条。
3. `__webmcpSchema.inputSchema.properties` 里是否有 `length` / `charAt` 等垃圾字段 → 违反 M2，参数被写成了原始类型 / 数组。
4. `__webmcpSchema.description` 为空 → 违反 S1，补函数 JSDoc。
5. 入口是否调用了 `registerGlobalTools`；组件是否调用了 `useWebMcpTools`。
6. 浏览器控制台是否有 WebMCP warning。

**Q2：必须用 `useCallback` 吗？**

技术上不必须，但强烈推荐。`useCallback` 固化函数引用，避免 HMR 或父组件重渲染时不必要的重注册抖动。

**Q3：工具可以抛异常吗？**

可以。异常会被 `navigator.modelContext` 转成工具执行失败反馈给 LLM。但推荐用返回对象 `{ ok: false, error: '...' }` 形式，LLM 更容易理解。

**Q4：返回值有类型约束吗？**

必须 **JSON 可序列化**（纯对象、数组、原始值）。不能返回 `Map`、`Set`、`Date`（建议转 ISO 字符串）、DOM 节点、函数。

**Q5：参数类型可以从其他文件 `import` 过来吗？**

可以。插件会跟随 `import` 做类型逆向追踪。但**不支持**来自 `node_modules` 的第三方类型，以及含泛型的类型。抽取失败时把参数类型改为**同文件定义**。

**Q6：工具函数必须是 `async` 吗？**

**不必须**。SDK 外层永远 `async (input) => fn(input)`，同步函数也能工作。但写 `async` 更直观也更符合约定。

**Q7：`export default` 到底能不能用？**

分场景：

- `registerGlobalTools({ fn })` 对象字面量：**可以**，工具名来自 key。
- `registerGlobalTools(api)` + `import * as api`：**不要用**，default 导出工具名会被解析成字符串 `"default"`，几乎一定不是你想要的。

**Q8：改造现有方法时，Agent 能不能顺便把代码重构一下？**

**不能。**改造的唯一产出物是：函数签名 + JSDoc + TS 类型声明。函数体字节级别应与原版一致。任何重构、优化、风格调整都要先跟用户确认。红线详见 §4.1 和 §4.5。
