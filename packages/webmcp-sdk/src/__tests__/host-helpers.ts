// packages/webmcp-sdk/src/__tests__/host-helpers.ts
//
// 共享的假宿主注入 / 清理助手。
//
// 注入面定死为「document 与 navigator 同注入**同一对象引用**」：
// - 只注入 document 会让「已废弃别名仍返回同一实例」这类用例失去被测对象
// - 只注入 navigator 时，polyfill 的入口桥接（把 navigator 面搬到 document）只在
//   `initializeWebMCPPolyfill()` 真正执行的那一次发生；后续用例里 `attempted` 已为 true，
//   桥接不会重跑，`getModelContext()` 会命中上一个用例残留在 Document.prototype 上的
//   accessor，测到的是错误的宿主对象
// - 同引用注入还能顺带验证 getModelContext() 的 document 优先级
import { vi, type Mock } from 'vitest';
import { __resetPolyfillStateForTest } from '../polyfill';
import { clearRegistry } from '../registry';

/** 在 document 与 navigator 上同注入同一个假宿主对象 */
export function installFakeHost(mc: object): void {
  Object.defineProperty(document, 'modelContext', {
    value: mc,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, 'modelContext', {
    value: mc,
    configurable: true,
    writable: true,
  });
}

/** 仅在 navigator 上注入（模拟 Chrome 146–149 原生形态：只有已废弃别名） */
export function installNavigatorOnlyHost(mc: object): void {
  Object.defineProperty(navigator, 'modelContext', {
    value: mc,
    configurable: true,
    writable: true,
  });
}

/** 仅在 document 上注入（模拟 Chrome 150+ 原生形态：只有规范入口） */
export function installDocumentOnlyHost(mc: object): void {
  Object.defineProperty(document, 'modelContext', {
    value: mc,
    configurable: true,
    writable: true,
  });
}

/** 移除注入的 own property（polyfill 装在 Document.prototype 上的 accessor 由 cleanup 还原） */
export function uninstallFakeHost(): void {
  try {
    delete (document as unknown as Record<string, unknown>).modelContext;
  } catch {
    // 忽略
  }
  try {
    delete (navigator as unknown as Record<string, unknown>).modelContext;
  } catch {
    // 忽略
  }
}

/**
 * 每个用例后统一清理：假宿主 own property + polyfill 全局状态 + SDK 注册表 + console spy。
 *
 * `__resetPolyfillStateForTest()` 会调 `cleanupWebMCPPolyfill()`，还原
 * `Document.prototype.modelContext` accessor、navigator 已废弃别名与 testing shim，
 * 并重置 SDK 的 `attempted` 标志 —— 少了它，polyfill 状态会跨用例泄漏。
 *
 * `vi.restoreAllMocks()` 必须在这里做：`vi.spyOn(console, 'warn')` 对同一属性重复调用
 * 会返回**同一个** spy，不还原的话告警计数会跨用例累积。
 */
export function teardownHost(): void {
  uninstallFakeHost();
  __resetPolyfillStateForTest();
  clearRegistry();
  vi.restoreAllMocks();
}

/**
 * 让 `document.modelContext` 跟随 `navigator.modelContext`。
 *
 * 既有用例都往 `globalThis.navigator` 上注入假宿主（polyfill 2.x 时代的写法），而
 * `getModelContext()` 现在是 document 优先。装一个委托 getter 后，这些用例走的就是
 * 主路径（规范入口）而不是 navigator 回退路径，无需逐处改写注入点。
 *
 * getter 是惰性的，所以在 describe 级 beforeEach 里替换整个 navigator 也能拿到新假宿主。
 */
export function mirrorNavigatorHostToDocument(): void {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: () => (navigator as any)?.modelContext,
  });
}

/** 移除委托 getter */
export function stopMirroringNavigatorHost(): void {
  try {
    delete (document as unknown as Record<string, unknown>).modelContext;
  } catch {
    // 忽略
  }
}

/** 现代宿主形状的假对象（显式标注返回类型：否则 declaration emit 会引用不可移植的 vitest 内部类型） */
export interface FakeModernHost {
  registerTool: Mock;
  getTools: Mock;
  addEventListener: Mock;
  removeEventListener: Mock;
  dispatchEvent: Mock;
  [key: string]: unknown;
}

/** 旧宿主形状的假对象 */
export interface FakeLegacyHost {
  registerTool: Mock;
  unregisterTool: Mock;
  [key: string]: unknown;
}

/** 构造一个「现代宿主」形状的假对象（有 getTools → nexus 不做任何 patch） */
export function makeModernHost(overrides: Record<string, unknown> = {}): FakeModernHost {
  return {
    registerTool: vi.fn(async () => {}),
    getTools: vi.fn(async () => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    ...overrides,
  };
}

/** 构造一个「旧宿主」形状的假对象（无 getTools → nexus 保留全套 patch） */
export function makeLegacyHost(overrides: Record<string, unknown> = {}): FakeLegacyHost {
  return {
    registerTool: vi.fn(),
    unregisterTool: vi.fn(),
    ...overrides,
  };
}
