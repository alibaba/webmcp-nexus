// packages/webmcp-sdk/src/polyfill.ts
import { initializeWebMCPPolyfill, cleanupWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';

let attempted = false;

/**
 * 惰性、幂等地确保 navigator.modelContext 存在。
 *
 * - 原生（Chrome 146+）/ 已被其他 polyfill 安装：直接返回，不动 navigator
 * - 非浏览器环境（SSR）：直接返回
 * - 缺失 modelContext：调 initializeWebMCPPolyfill 装上严格 W3C 核心 + modelContextTesting shim
 *
 * 调用方应在判定 'modelContext' in navigator 之前调用本函数。整体包 try/catch，
 * polyfill 加载或初始化失败不向调用方传播异常——SDK 后续逻辑会按"无 modelContext"路径继续 no-op。
 */
export function ensureModelContextPolyfill(): void {
  if (attempted) return;
  attempted = true;
  if (typeof navigator === 'undefined') return;
  if ('modelContext' in navigator) return;
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
