import { getStoreRef } from '../store/TodoStore';
import type { Priority, Todo, TodoStatus } from '../store/types';

/**
 * [作用域：全局] 列出全部待办（不过滤，可指定数量上限）。
 * @readonly
 */
export async function listTodos(params: {
  /** 返回数量上限（默认 200） */
  limit?: number;
}): Promise<{ count: number; todos: Todo[] }> {
  const all = getStoreRef().todos;
  const limit = params.limit ?? 200;
  return { count: all.length, todos: all.slice(0, limit) };
}

/**
 * [作用域：全局] 根据 ID 读取单条待办详情。
 * @readonly
 */
export async function getTodo(params: {
  /** 待办 ID */
  id: string;
}): Promise<{ todo: Todo | null }> {
  return { todo: getStoreRef().getTodoById({ id: params.id }) };
}

/**
 * [作用域：全局] 搜索待办（关键词匹配标题与描述，可叠加优先级/状态过滤）。
 * @readonly
 */
export async function searchTodos(params: {
  /** 关键词（匹配标题与描述） */
  query?: string;
  /** 优先级过滤 */
  priorities?: Priority[];
  /** 状态过滤 */
  statuses?: TodoStatus[];
  /** 返回数量上限（默认 50） */
  limit?: number;
}): Promise<{
  count: number;
  results: Array<{
    id: string;
    title: string;
    status: TodoStatus;
    priority: Priority;
    dueDate: string | null;
  }>;
}> {
  const todos = getStoreRef().filterTodos({
    search: params.query,
    priorities: params.priorities,
    statuses: params.statuses,
  });
  const limit = params.limit ?? 50;
  return {
    count: todos.length,
    results: todos.slice(0, limit).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
  };
}

/**
 * [作用域：全局] 读取待办统计（总数/各状态数/逾期数）。
 * @readonly
 */
export async function getTodoStats(_params: Record<string, never>): Promise<{
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  overdue: number;
}> {
  const todos = getStoreRef().todos;
  const today = new Date().toISOString().slice(0, 16);
  return {
    total: todos.length,
    todo: todos.filter(t => t.status === 'todo').length,
    in_progress: todos.filter(t => t.status === 'in_progress').length,
    done: todos.filter(t => t.status === 'done').length,
    overdue: todos.filter(
      t => t.dueDate && t.dueDate < today && t.status !== 'done',
    ).length,
  };
}
