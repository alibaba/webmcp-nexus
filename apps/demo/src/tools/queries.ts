import { getStoreRef } from '../store/TodoStore';
import type { Priority, Task, TaskStatus } from '../store/types';

interface TaskDTO {
  id: string;
  title: string;
  description: string;
  projectId: string;
  tagIds: string[];
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  assignee: string;
  createdAt: string;
}

function toDTO(t: Task): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    projectId: t.projectId,
    tagIds: [...t.tagIds],
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    assignee: t.assignee,
    createdAt: t.createdAt,
  };
}

/**
 * [作用域：全局] 列出全部任务（不过滤，可指定数量上限）。
 * @readonly
 */
export async function listTasks(params: {
  /** 返回数量上限（默认 200） */
  limit?: number;
}): Promise<{ count: number; tasks: TaskDTO[] }> {
  const all = getStoreRef().tasks.map(toDTO);
  const limit = params.limit ?? 200;
  return { count: all.length, tasks: all.slice(0, limit) };
}

/**
 * [作用域：全局] 根据 ID 读取单条任务详情。
 * @readonly
 */
export async function getTask(params: {
  /** 任务 ID */
  id: string;
}): Promise<{ task: TaskDTO | null }> {
  const t = getStoreRef().getTaskById({ id: params.id });
  return { task: t ? toDTO(t) : null };
}

/**
 * [作用域：全局] 跨页面搜索任务（关键词匹配标题与描述，可叠加项目/标签/优先级/状态/负责人/截止日期范围等过滤）。
 * @readonly
 */
export async function searchTasks(params: {
  /** 关键词（匹配标题与描述） */
  query?: string;
  /** 项目 ID 过滤 */
  projectId?: string;
  /** 标签 ID 列表过滤（必须全部包含） */
  tagIds?: string[];
  /** 优先级过滤 */
  priorities?: Priority[];
  /** 状态过滤 */
  statuses?: TaskStatus[];
  /** 负责人过滤 */
  assignee?: string;
  /** 截止日期起 YYYY-MM-DD */
  dueFrom?: string;
  /** 截止日期止 YYYY-MM-DD */
  dueTo?: string;
  /** 返回数量上限（默认 50） */
  limit?: number;
}): Promise<{
  count: number;
  results: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    projectId: string;
    assignee: string;
    dueDate: string | null;
  }>;
}> {
  const store = getStoreRef();
  const tasks = store.filterTasks({
    search: params.query ?? '',
    projectId: params.projectId ?? null,
    tagIds: params.tagIds ?? [],
    priorities: params.priorities ?? [],
    statuses: params.statuses ?? [],
    assignee: params.assignee ?? null,
    dueFrom: params.dueFrom ?? null,
    dueTo: params.dueTo ?? null,
  });
  const limit = params.limit ?? 50;
  return {
    count: tasks.length,
    results: tasks.slice(0, limit).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      projectId: t.projectId,
      assignee: t.assignee,
      dueDate: t.dueDate,
    })),
  };
}

/**
 * [作用域：全局] 列出所有项目（含每个项目的任务数）。
 * @readonly
 */
export async function listProjects(_params: Record<string, never>): Promise<{
  projects: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    taskCount: number;
  }>;
}> {
  const store = getStoreRef();
  return {
    projects: store.projects.map(p => ({
      ...p,
      taskCount: store.tasks.filter(t => t.projectId === p.id).length,
    })),
  };
}

/**
 * [作用域：全局] 读取单个项目详情（含任务数）。
 * @readonly
 */
export async function getProject(params: {
  /** 项目 ID */
  id: string;
}): Promise<{
  project: { id: string; name: string; description: string; color: string } | null;
  taskCount: number;
}> {
  const store = getStoreRef();
  const p = store.getProjectById({ id: params.id });
  if (!p) return { project: null, taskCount: 0 };
  const taskCount = store.tasks.filter(t => t.projectId === p.id).length;
  return { project: { ...p }, taskCount };
}

/**
 * [作用域：全局] 列出所有标签（含每个标签关联的任务数）。
 * @readonly
 */
export async function listTags(_params: Record<string, never>): Promise<{
  tags: Array<{ id: string; name: string; color: string; taskCount: number }>;
}> {
  const store = getStoreRef();
  return {
    tags: store.tags.map(t => ({
      ...t,
      taskCount: store.tasks.filter(x => x.tagIds.includes(t.id)).length,
    })),
  };
}

/**
 * [作用域：全局] 读取单个标签详情（含任务数）。
 * @readonly
 */
export async function getTag(params: {
  /** 标签 ID */
  id: string;
}): Promise<{
  tag: { id: string; name: string; color: string } | null;
  taskCount: number;
}> {
  const store = getStoreRef();
  const t = store.getTagById({ id: params.id });
  if (!t) return { tag: null, taskCount: 0 };
  const taskCount = store.tasks.filter(x => x.tagIds.includes(t.id)).length;
  return { tag: { ...t }, taskCount };
}

/**
 * [作用域：全局] 列出所有出现过的负责人（用于过滤、分配）。
 * @readonly
 */
export async function listAssignees(_params: Record<string, never>): Promise<{
  assignees: Array<{ name: string; taskCount: number }>;
}> {
  const tasks = getStoreRef().tasks;
  const map = new Map<string, number>();
  for (const t of tasks) {
    map.set(t.assignee, (map.get(t.assignee) ?? 0) + 1);
  }
  return {
    assignees: Array.from(map.entries()).map(([name, taskCount]) => ({ name, taskCount })),
  };
}

/**
 * [作用域：全局] 读取当前应用的整体统计（任务总数 / 各状态数 / 逾期数）。
 * @readonly
 */
export async function getStats(_params: Record<string, never>): Promise<{
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  archived: number;
  overdue: number;
}> {
  const tasks = getStoreRef().tasks;
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    archived: tasks.filter(t => t.status === 'archived').length,
    overdue: tasks.filter(
      t => t.dueDate && t.dueDate < today && t.status !== 'done' && t.status !== 'archived',
    ).length,
  };
}
