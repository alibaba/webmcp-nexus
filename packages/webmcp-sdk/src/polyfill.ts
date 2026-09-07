// packages/webmcp-sdk/src/polyfill.ts
import { initializeWebMCPPolyfill, cleanupWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';

let attempted = false;

/**
 * 惰性、幂等地确保 document.modelContext 存在。
 *
 * polyfill 5.x 的 `initializeWebMCPPolyfill()` 自身幂等且非破坏性，因此这里**无条件调用**，
 * 不再用 `'modelContext' in navigator` 提前返回。三条路径：
 *
 * - 浏览器原生已有 `document.modelContext`（Chrome 150+）：polyfill 直接 no-op
 * - 浏览器只有原生 `navigator.modelContext`（Chrome 146–149）：polyfill 做**入口桥接**，
 *   把同一实例搬到 `document.modelContext` 上，不替换、不包装原生实现
 * - 都没有（Chrome <146 / Firefox / Safari）：polyfill 自持一个严格 W3C 核心 context，
 *   装 `window.ModelContext`、`document.modelContext`、`navigator.modelContext` 已废弃别名、
 *   `SubmitEvent.agentInvoked`/`respondWith()` 与 declarative forms 支持
 *
 * 必须无条件调用的原因：若沿用旧的 `'modelContext' in navigator` 提前返回，Chrome 146–149
 * 就永远拿不到规范入口，而 relay 5.x 的 embed.js 只读 `document.modelContext`。
 *
 * `installTestingShim: true` 的适用范围**仅在 polyfill 自持 context 时**（第三条路径）：
 * polyfill 的两条早退都发生在装 shim 之前，所以原生 Chrome 下 `navigator.modelContextTesting`
 * 不会被安装。保留它的唯一用途是让 relay 2.x 的 embed.js 能走
 * `modelContextTesting.listTools/executeTool` 这条路径——即 relay 2.x 只在
 * Chrome <146 / Firefox / Safari 下可用，Chrome 149+ 必须升到 relay 5.x。
 *
 * 非浏览器环境（SSR）直接返回。整体包 try/catch，polyfill 加载或初始化失败不向调用方
 * 传播异常——SDK 后续逻辑会按"无 modelContext"路径继续 no-op。
 *
 * 注意：polyfill 在 `globalThis.isSecureContext === false` 时早退（严格等值判定）。
 * jsdom 下 `isSecureContext` 是 `undefined`，故不早退、能正常安装——单测依赖这一点，
 * 不要把它改成 `!isSecureContext`，否则所有测试会静默跳过安装。
 */
export function ensureModelContextPolyfill(): void {
  if (attempted) return;
  attempted = true;
  if (
    typeof document === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof window === 'undefined'
  ) {
    return;
  }
  try {
    initializeWebMCPPolyfill({ installTestingShim: true });
  } catch {
    // polyfill 初始化失败兜底
  }
}

/**
 * 仅供单元测试使用：重置模块级 attempted 标志并卸载 polyfill。
 * 生产代码不应调用本函数。
 */
export function __resetPolyfillStateForTest(): void {
  attempted = false;
  try {
    cleanupWebMCPPolyfill();
  } catch {
    // cleanup 失败兜底
  }
}

/**
 * 仅供单元测试使用：只卸载 polyfill，**不**重置 attempted 标志。
 *
 * 用于验证"多次调用幂等"这一契约：polyfill 5.x 把 `modelContext` 定义在
 * `Document.prototype` 上（WebIDL 的 `[SameObject] readonly attribute` 要求），
 * 所以 `delete document.modelContext` 对原型链无效、`'modelContext' in document` 恒为 true，
 * 必须通过本钩子显式移除 accessor 才能观测到"卸载后不再重装"的行为。
 */
export function __cleanupPolyfillOnlyForTest(): void {
  try {
    cleanupWebMCPPolyfill();
  } catch {
    // cleanup 失败兜底
  }
}
