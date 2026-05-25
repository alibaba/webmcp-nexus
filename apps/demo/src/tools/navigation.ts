import { navigateRef } from './navigation-bridge';

/**
 * [作用域：全局] 在应用内跳转路由（如 /tasks /projects /projects/:id /tags）。
 */
export async function navigate(params: {
  /** 目标路径，例如 /tasks */
  to: string;
}): Promise<{ navigated: boolean }> {
  if (!navigateRef) return { navigated: false };
  navigateRef(params.to);
  return { navigated: true };
}
