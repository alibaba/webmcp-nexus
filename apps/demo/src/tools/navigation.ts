import { navigateRef } from './navigation-bridge';

/**
 * [作用域：全局] 在应用内跳转路由（/ 画板页，/todos 待办页，/editor 编辑器页）。
 */
export async function navigate(params: {
  /** 目标路径：/ 或 /todos 或 /editor */
  to: string;
}): Promise<{ navigated: boolean }> {
  if (!navigateRef) return { navigated: false };
  navigateRef(params.to);
  return { navigated: true };
}
