import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { initialProjects, initialTags, initialTasks } from './mockData';
import {
  PRIORITY_ORDER,
  type Priority,
  type Project,
  type Tag,
  type Task,
  type TaskStatus,
} from './types';

export interface CreateTaskInput {
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description?: string;
  /** 所属项目 ID（默认 p_inbox 收件箱） */
  projectId?: string;
  /** 标签 ID 列表 */
  tagIds?: string[];
  /** 优先级 */
  priority?: Priority;
  /** 初始状态 */
  status?: TaskStatus;
  /** 截止时间 YYYY-MM-DDTHH:mm（也兼容纯日期 YYYY-MM-DD） */
  dueDate?: string | null;
  /** 负责人 */
  assignee?: string;
}

export interface UpdateTaskInput {
  /** 任务 ID */
  id: string;
  /** 新标题 */
  title?: string;
  /** 新描述 */
  description?: string;
  /** 新所属项目 ID */
  projectId?: string;
  /** 新优先级 */
  priority?: Priority;
  /** 新状态 */
  status?: TaskStatus;
  /** 新截止时间 YYYY-MM-DDTHH:mm（或纯日期 YYYY-MM-DD），传 null 清除 */
  dueDate?: string | null;
  /** 新负责人 */
  assignee?: string;
  /** 标签 ID 列表（整体替换） */
  tagIds?: string[];
}

export interface DeleteTaskInput {
  /** 任务 ID */
  id: string;
}

export interface DeleteTasksInput {
  /** 任务 ID 列表 */
  ids: string[];
}

export interface SetTaskStatusInput {
  /** 任务 ID */
  id: string;
  /** 新状态 */
  status: TaskStatus;
}

export interface BulkSetTaskStatusInput {
  /** 任务 ID 列表 */
  ids: string[];
  /** 新状态 */
  status: TaskStatus;
}

export interface SetTaskPriorityInput {
  /** 任务 ID */
  id: string;
  /** 新优先级 */
  priority: Priority;
}

export interface SetTaskDueDateInput {
  /** 任务 ID */
  id: string;
  /** 截止时间 YYYY-MM-DDTHH:mm（或纯日期 YYYY-MM-DD），或 null 清除 */
  dueDate: string | null;
}

export interface SetTaskAssigneeInput {
  /** 任务 ID */
  id: string;
  /** 负责人名称 */
  assignee: string;
}

export interface MoveTaskToProjectInput {
  /** 任务 ID */
  id: string;
  /** 目标项目 ID */
  projectId: string;
}

export interface AddTaskTagInput {
  /** 任务 ID */
  taskId: string;
  /** 标签 ID */
  tagId: string;
}

export interface RemoveTaskTagInput {
  /** 任务 ID */
  taskId: string;
  /** 标签 ID */
  tagId: string;
}

export interface CreateProjectInput {
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description?: string;
  /** 项目代表色 (#rrggbb) */
  color?: string;
}

export interface UpdateProjectInput {
  /** 项目 ID */
  id: string;
  /** 新名称 */
  name?: string;
  /** 新描述 */
  description?: string;
  /** 新颜色 (#rrggbb) */
  color?: string;
}

export interface DeleteProjectInput {
  /** 项目 ID */
  id: string;
}

export interface CreateTagInput {
  /** 标签名 */
  name: string;
  /** 标签颜色 (#rrggbb) */
  color?: string;
}

export interface UpdateTagInput {
  /** 标签 ID */
  id: string;
  /** 新名称 */
  name?: string;
  /** 新颜色 (#rrggbb) */
  color?: string;
}

export interface DeleteTagInput {
  /** 标签 ID */
  id: string;
}

export interface GetTaskByIdInput {
  /** 任务 ID */
  id: string;
}

export interface GetProjectByIdInput {
  /** 项目 ID */
  id: string;
}

export interface GetTagByIdInput {
  /** 标签 ID */
  id: string;
}

export interface FilterTasksInput {
  /** 关键词（匹配标题与描述） */
  search: string;
  /** 项目 ID 过滤；null 表示全部 */
  projectId: string | null;
  /** 标签 ID 列表过滤（必须全部包含） */
  tagIds: string[];
  /** 优先级过滤 */
  priorities: Priority[];
  /** 状态过滤 */
  statuses: TaskStatus[];
  /** 负责人过滤；null 表示全部 */
  assignee: string | null;
  /** 截止日期起 YYYY-MM-DD；null 表示不限 */
  dueFrom: string | null;
  /** 截止日期止 YYYY-MM-DD；null 表示不限 */
  dueTo: string | null;
}

export interface TodoStoreValue {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  /** 新建任务（写入全局任务列表） */
  createTask: (input: CreateTaskInput) => Task;
  /** 部分更新一条任务的字段 */
  updateTask: (input: UpdateTaskInput) => Task | null;
  /** 删除一条任务 */
  deleteTask: (input: DeleteTaskInput) => boolean;
  /** 批量删除任务（一次传多个 ID） */
  deleteTasks: (input: DeleteTasksInput) => { deleted: number };
  /** 切换任务状态（todo / in_progress / done / archived） */
  setTaskStatus: (input: SetTaskStatusInput) => Task | null;
  /** 批量切换任务状态 */
  bulkSetTaskStatus: (input: BulkSetTaskStatusInput) => { updated: number };
  /** 设置任务优先级 */
  setTaskPriority: (input: SetTaskPriorityInput) => Task | null;
  /** 设置任务截止时间，传 null 清除 */
  setTaskDueDate: (input: SetTaskDueDateInput) => Task | null;
  /** 设置任务负责人 */
  setTaskAssignee: (input: SetTaskAssigneeInput) => Task | null;
  /** 把任务移动到另一个项目 */
  moveTaskToProject: (input: MoveTaskToProjectInput) => Task | null;
  /** 给任务追加一个标签（已有则忽略） */
  addTaskTag: (input: AddTaskTagInput) => Task | null;
  /** 从任务移除一个标签 */
  removeTaskTag: (input: RemoveTaskTagInput) => Task | null;
  /** 新建一个项目 */
  createProject: (input: CreateProjectInput) => Project;
  /** 修改项目（名称 / 描述 / 颜色，部分更新） */
  updateProject: (input: UpdateProjectInput) => Project | null;
  /** 删除项目（p_inbox 不可删；原任务会被移回收件箱） */
  deleteProject: (input: DeleteProjectInput) => boolean;
  /** 新建一个标签 */
  createTag: (input: CreateTagInput) => Tag;
  /** 修改标签（名称 / 颜色，部分更新） */
  updateTag: (input: UpdateTagInput) => Tag | null;
  /** 删除一个标签（同时从所有任务上移除该标签引用） */
  deleteTag: (input: DeleteTagInput) => boolean;
  /** 按多条件过滤并按优先级 + 截止日期排序后返回任务列表 */
  filterTasks: (input: FilterTasksInput) => Task[];
  /** 根据 ID 获取单条任务 */
  getTaskById: (input: GetTaskByIdInput) => Task | null;
  /** 根据 ID 获取单个项目 */
  getProjectById: (input: GetProjectByIdInput) => Project | null;
  /** 根据 ID 获取单个标签 */
  getTagById: (input: GetTagByIdInput) => Tag | null;
}

const TodoStoreContext = createContext<TodoStoreValue | null>(null);

interface ProviderProps {
  children: ReactNode;
  seed?: { tasks?: Task[]; projects?: Project[]; tags?: Tag[] };
}

export function TodoStoreProvider({ children, seed }: ProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(seed?.tasks ?? initialTasks);
  const [projects, setProjects] = useState<Project[]>(seed?.projects ?? initialProjects);
  const [tags, setTags] = useState<Tag[]>(seed?.tags ?? initialTags);

  const idCounter = useRef(1);
  const nextId = (prefix: string): string => {
    const n = idCounter.current++;
    return `${prefix}_${Date.now().toString(36)}_${n}`;
  };

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建任务（写入全局任务列表）。
   */
  const createTask = useCallback((input: CreateTaskInput): Task => {
    const task: Task = {
      id: nextId('task'),
      title: input.title.trim() || '未命名任务',
      description: input.description ?? '',
      projectId: input.projectId ?? 'p_inbox',
      tagIds: input.tagIds ?? [],
      priority: input.priority ?? 'medium',
      status: input.status ?? 'todo',
      dueDate: input.dueDate ?? null,
      assignee: input.assignee ?? '刺秦',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 部分更新一条任务的字段（除 id / createdAt 外都可更新）。
   */
  const updateTask = useCallback((input: UpdateTaskInput): Task | null => {
    const { id, ...patch } = input;
    let updated: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        updated = { ...t, ...patch, id: t.id, createdAt: t.createdAt };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除一条任务。
   */
  const deleteTask = useCallback((input: DeleteTaskInput): boolean => {
    let existed = false;
    setTasks(prev => {
      existed = prev.some(t => t.id === input.id);
      return prev.filter(t => t.id !== input.id);
    });
    return existed;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 批量删除任务（一次传多个 ID）。
   */
  const deleteTasks = useCallback((input: DeleteTasksInput): { deleted: number } => {
    const idSet = new Set(input.ids);
    let count = 0;
    setTasks(prev => {
      const next = prev.filter(t => !idSet.has(t.id));
      count = prev.length - next.length;
      return next;
    });
    return { deleted: count };
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 切换任务状态（todo / in_progress / done / archived）。
   */
  const setTaskStatus = useCallback(
    (input: SetTaskStatusInput): Task | null => updateTask({ id: input.id, status: input.status }),
    [updateTask],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 批量切换任务状态。
   */
  const bulkSetTaskStatus = useCallback(
    (input: BulkSetTaskStatusInput): { updated: number } => {
      const idSet = new Set(input.ids);
      let count = 0;
      setTasks(prev => {
        let local = 0;
        const next = prev.map(t => {
          if (!idSet.has(t.id)) return t;
          local++;
          return { ...t, status: input.status };
        });
        count = local;
        return next;
      });
      return { updated: count };
    },
    [],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务优先级。
   */
  const setTaskPriority = useCallback(
    (input: SetTaskPriorityInput): Task | null =>
      updateTask({ id: input.id, priority: input.priority }),
    [updateTask],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务截止时间，传 null 清除。
   */
  const setTaskDueDate = useCallback(
    (input: SetTaskDueDateInput): Task | null =>
      updateTask({ id: input.id, dueDate: input.dueDate }),
    [updateTask],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务负责人。
   */
  const setTaskAssignee = useCallback(
    (input: SetTaskAssigneeInput): Task | null =>
      updateTask({ id: input.id, assignee: input.assignee }),
    [updateTask],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 把任务移动到另一个项目。
   */
  const moveTaskToProject = useCallback(
    (input: MoveTaskToProjectInput): Task | null =>
      updateTask({ id: input.id, projectId: input.projectId }),
    [updateTask],
  );

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 给任务追加一个标签（已有则忽略）。
   */
  const addTaskTag = useCallback((input: AddTaskTagInput): Task | null => {
    let updated: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== input.taskId) return t;
        if (t.tagIds.includes(input.tagId)) {
          updated = t;
          return t;
        }
        updated = { ...t, tagIds: [...t.tagIds, input.tagId] };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 从任务移除一个标签。
   */
  const removeTaskTag = useCallback((input: RemoveTaskTagInput): Task | null => {
    let updated: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== input.taskId) return t;
        if (!t.tagIds.includes(input.tagId)) {
          updated = t;
          return t;
        }
        updated = { ...t, tagIds: t.tagIds.filter(x => x !== input.tagId) };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建一个项目。
   */
  const createProject = useCallback((input: CreateProjectInput): Project => {
    const project: Project = {
      id: nextId('p'),
      name: input.name.trim() || '未命名项目',
      description: input.description ?? '',
      color: input.color ?? '#94a3b8',
    };
    setProjects(prev => [...prev, project]);
    return project;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 修改项目（名称 / 描述 / 颜色，部分更新）。
   */
  const updateProject = useCallback((input: UpdateProjectInput): Project | null => {
    const { id, ...patch } = input;
    let updated: Project | null = null;
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, id: p.id };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除项目（p_inbox 不可删；原任务会被移回收件箱）。
   */
  const deleteProject = useCallback((input: DeleteProjectInput): boolean => {
    if (input.id === 'p_inbox') return false;
    let existed = false;
    setProjects(prev => {
      existed = prev.some(p => p.id === input.id);
      return prev.filter(p => p.id !== input.id);
    });
    setTasks(prev =>
      prev.map(t => (t.projectId === input.id ? { ...t, projectId: 'p_inbox' } : t)),
    );
    return existed;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建一个标签。
   */
  const createTag = useCallback((input: CreateTagInput): Tag => {
    const tag: Tag = {
      id: nextId('t'),
      name: input.name.trim() || 'tag',
      color: input.color ?? '#64748b',
    };
    setTags(prev => [...prev, tag]);
    return tag;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 修改标签（名称 / 颜色，部分更新）。
   */
  const updateTag = useCallback((input: UpdateTagInput): Tag | null => {
    const { id, ...patch } = input;
    let updated: Tag | null = null;
    setTags(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        updated = { ...t, ...patch, id: t.id };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除一个标签（同时从所有任务上移除该标签引用）。
   */
  const deleteTag = useCallback((input: DeleteTagInput): boolean => {
    let existed = false;
    setTags(prev => {
      existed = prev.some(t => t.id === input.id);
      return prev.filter(t => t.id !== input.id);
    });
    setTasks(prev =>
      prev.map(t =>
        t.tagIds.includes(input.id)
          ? { ...t, tagIds: t.tagIds.filter(x => x !== input.id) }
          : t,
      ),
    );
    return existed;
  }, []);

  /**
   * 按多条件过滤并按优先级 + 截止日期排序后返回任务列表。
   * @readonly
   */
  const filterTasks = useCallback(
    (input: FilterTasksInput): Task[] => {
      const q = input.search.trim().toLowerCase();
      return tasks
        .filter(t => {
          if (q) {
            const hay = (t.title + ' ' + t.description).toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (input.projectId && t.projectId !== input.projectId) return false;
          if (input.tagIds.length > 0) {
            const ok = input.tagIds.every(tid => t.tagIds.includes(tid));
            if (!ok) return false;
          }
          if (input.priorities.length > 0 && !input.priorities.includes(t.priority)) {
            return false;
          }
          if (input.statuses.length > 0 && !input.statuses.includes(t.status)) {
            return false;
          }
          if (input.assignee && t.assignee !== input.assignee) return false;
          if (input.dueFrom) {
            const day = t.dueDate?.slice(0, 10);
            if (!day || day < input.dueFrom) return false;
          }
          if (input.dueTo) {
            const day = t.dueDate?.slice(0, 10);
            if (!day || day > input.dueTo) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const ap = PRIORITY_ORDER[a.priority];
          const bp = PRIORITY_ORDER[b.priority];
          if (ap !== bp) return ap - bp;
          const ad = a.dueDate ?? '9999-99-99';
          const bd = b.dueDate ?? '9999-99-99';
          return ad.localeCompare(bd);
        });
    },
    [tasks],
  );

  /**
   * 根据 ID 获取单条任务。
   * @readonly
   */
  const getTaskById = useCallback(
    (input: GetTaskByIdInput): Task | null => tasks.find(t => t.id === input.id) ?? null,
    [tasks],
  );

  /**
   * 根据 ID 获取单个项目。
   * @readonly
   */
  const getProjectById = useCallback(
    (input: GetProjectByIdInput): Project | null =>
      projects.find(p => p.id === input.id) ?? null,
    [projects],
  );

  /**
   * 根据 ID 获取单个标签。
   * @readonly
   */
  const getTagById = useCallback(
    (input: GetTagByIdInput): Tag | null => tags.find(t => t.id === input.id) ?? null,
    [tags],
  );

  const value = useMemo<TodoStoreValue>(
    () => ({
      tasks,
      projects,
      tags,
      createTask,
      updateTask,
      deleteTask,
      deleteTasks,
      setTaskStatus,
      bulkSetTaskStatus,
      setTaskPriority,
      setTaskDueDate,
      setTaskAssignee,
      moveTaskToProject,
      addTaskTag,
      removeTaskTag,
      createProject,
      updateProject,
      deleteProject,
      createTag,
      updateTag,
      deleteTag,
      filterTasks,
      getTaskById,
      getProjectById,
      getTagById,
    }),
    [
      tasks,
      projects,
      tags,
      createTask,
      updateTask,
      deleteTask,
      deleteTasks,
      setTaskStatus,
      bulkSetTaskStatus,
      setTaskPriority,
      setTaskDueDate,
      setTaskAssignee,
      moveTaskToProject,
      addTaskTag,
      removeTaskTag,
      createProject,
      updateProject,
      deleteProject,
      createTag,
      updateTag,
      deleteTag,
      filterTasks,
      getTaskById,
      getProjectById,
      getTagById,
    ],
  );

  useEffect(() => {
    __publishStoreRef(value);
    return () => {
      __publishStoreRef(null);
    };
  }, [value]);

  return <TodoStoreContext.Provider value={value}>{children}</TodoStoreContext.Provider>;
}

export function useTodoStore(): TodoStoreValue {
  const value = useContext(TodoStoreContext);
  if (!value) {
    throw new Error('useTodoStore must be used within <TodoStoreProvider>');
  }
  return value;
}

let storeRef: TodoStoreValue | null = null;

/** Internal: published by the provider so global tools can access the live store from outside React. */
export function __publishStoreRef(value: TodoStoreValue | null): void {
  storeRef = value;
}

/** Used by global tools (registered via registerGlobalTools) — they live outside the React tree. */
export function getStoreRef(): TodoStoreValue {
  if (!storeRef) {
    throw new Error('TodoStore is not yet initialized');
  }
  return storeRef;
}
