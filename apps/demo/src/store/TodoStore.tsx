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
import { initialTodos } from './mockData';
import { PRIORITY_ORDER, type Priority, type Todo, type TodoStatus } from './types';

export interface CreateTodoInput {
  /** 待办标题 */
  title: string;
  /** 待办描述 */
  description?: string;
  /** 优先级 */
  priority?: Priority;
  /** 初始状态 */
  status?: TodoStatus;
  /** 截止时间 YYYY-MM-DDTHH:mm */
  dueDate?: string | null;
}

export interface UpdateTodoInput {
  /** 待办 ID */
  id: string;
  /** 新标题 */
  title?: string;
  /** 新描述 */
  description?: string;
  /** 新优先级 */
  priority?: Priority;
  /** 新状态 */
  status?: TodoStatus;
  /** 新截止时间 YYYY-MM-DDTHH:mm，传 null 清除 */
  dueDate?: string | null;
}

export interface DeleteTodoInput {
  /** 待办 ID */
  id: string;
}

export interface DeleteTodosInput {
  /** 待办 ID 列表 */
  ids: string[];
}

export interface SetTodoStatusInput {
  /** 待办 ID */
  id: string;
  /** 新状态 */
  status: TodoStatus;
}

export interface BulkSetTodoStatusInput {
  /** 待办 ID 列表 */
  ids: string[];
  /** 新状态 */
  status: TodoStatus;
}

export interface SetTodoPriorityInput {
  /** 待办 ID */
  id: string;
  /** 新优先级 */
  priority: Priority;
}

export interface SetTodoDueDateInput {
  /** 待办 ID */
  id: string;
  /** 截止时间 YYYY-MM-DDTHH:mm，或 null 清除 */
  dueDate: string | null;
}

export interface GetTodoByIdInput {
  /** 待办 ID */
  id: string;
}

export interface FilterTodosInput {
  /** 关键词（匹配标题与描述） */
  search?: string;
  /** 优先级过滤 */
  priorities?: Priority[];
  /** 状态过滤 */
  statuses?: TodoStatus[];
}

export interface TodoStoreValue {
  todos: Todo[];
  createTodo: (input: CreateTodoInput) => Todo;
  updateTodo: (input: UpdateTodoInput) => Todo | null;
  deleteTodo: (input: DeleteTodoInput) => boolean;
  deleteTodos: (input: DeleteTodosInput) => { deleted: number };
  setTodoStatus: (input: SetTodoStatusInput) => Todo | null;
  bulkSetTodoStatus: (input: BulkSetTodoStatusInput) => { updated: number };
  setTodoPriority: (input: SetTodoPriorityInput) => Todo | null;
  setTodoDueDate: (input: SetTodoDueDateInput) => Todo | null;
  filterTodos: (input: FilterTodosInput) => Todo[];
  getTodoById: (input: GetTodoByIdInput) => Todo | null;
}

const TodoStoreContext = createContext<TodoStoreValue | null>(null);

interface ProviderProps {
  children: ReactNode;
  seed?: { todos?: Todo[] };
}

export function TodoStoreProvider({ children, seed }: ProviderProps) {
  const [todos, setTodos] = useState<Todo[]>(seed?.todos ?? initialTodos);

  const idCounter = useRef(1);
  const nextId = (): string => {
    const n = idCounter.current++;
    return `todo_${Date.now().toString(36)}_${n}`;
  };

  const createTodo = useCallback((input: CreateTodoInput): Todo => {
    const todo: Todo = {
      id: nextId(),
      title: input.title.trim() || '未命名待办',
      description: input.description ?? '',
      priority: input.priority ?? 'medium',
      status: input.status ?? 'todo',
      dueDate: input.dueDate ?? null,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [todo, ...prev]);
    return todo;
  }, []);

  const updateTodo = useCallback((input: UpdateTodoInput): Todo | null => {
    const { id, ...patch } = input;
    let updated: Todo | null = null;
    setTodos(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        updated = { ...t, ...patch, id: t.id, createdAt: t.createdAt };
        return updated;
      }),
    );
    return updated;
  }, []);

  const deleteTodo = useCallback((input: DeleteTodoInput): boolean => {
    let existed = false;
    setTodos(prev => {
      existed = prev.some(t => t.id === input.id);
      return prev.filter(t => t.id !== input.id);
    });
    return existed;
  }, []);

  const deleteTodos = useCallback((input: DeleteTodosInput): { deleted: number } => {
    const idSet = new Set(input.ids);
    let count = 0;
    setTodos(prev => {
      const next = prev.filter(t => !idSet.has(t.id));
      count = prev.length - next.length;
      return next;
    });
    return { deleted: count };
  }, []);

  const setTodoStatus = useCallback(
    (input: SetTodoStatusInput): Todo | null => updateTodo({ id: input.id, status: input.status }),
    [updateTodo],
  );

  const bulkSetTodoStatus = useCallback(
    (input: BulkSetTodoStatusInput): { updated: number } => {
      const idSet = new Set(input.ids);
      let count = 0;
      setTodos(prev => {
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

  const setTodoPriority = useCallback(
    (input: SetTodoPriorityInput): Todo | null =>
      updateTodo({ id: input.id, priority: input.priority }),
    [updateTodo],
  );

  const setTodoDueDate = useCallback(
    (input: SetTodoDueDateInput): Todo | null =>
      updateTodo({ id: input.id, dueDate: input.dueDate }),
    [updateTodo],
  );

  const filterTodos = useCallback(
    (input: FilterTodosInput): Todo[] => {
      const q = (input.search ?? '').trim().toLowerCase();
      return todos
        .filter(t => {
          if (q) {
            const hay = (t.title + ' ' + t.description).toLowerCase();
            if (!hay.includes(q)) return false;
          }
          if (input.priorities && input.priorities.length > 0 && !input.priorities.includes(t.priority)) {
            return false;
          }
          if (input.statuses && input.statuses.length > 0 && !input.statuses.includes(t.status)) {
            return false;
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
    [todos],
  );

  const getTodoById = useCallback(
    (input: GetTodoByIdInput): Todo | null => todos.find(t => t.id === input.id) ?? null,
    [todos],
  );

  const value = useMemo<TodoStoreValue>(
    () => ({
      todos,
      createTodo,
      updateTodo,
      deleteTodo,
      deleteTodos,
      setTodoStatus,
      bulkSetTodoStatus,
      setTodoPriority,
      setTodoDueDate,
      filterTodos,
      getTodoById,
    }),
    [
      todos,
      createTodo,
      updateTodo,
      deleteTodo,
      deleteTodos,
      setTodoStatus,
      bulkSetTodoStatus,
      setTodoPriority,
      setTodoDueDate,
      filterTodos,
      getTodoById,
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
    throw new Error('useTodoStore must be used within TodoStoreProvider');
  }
  return value;
}

let storeRef: TodoStoreValue | null = null;

export function __publishStoreRef(value: TodoStoreValue | null): void {
  storeRef = value;
}

export function getStoreRef(): TodoStoreValue {
  if (!storeRef) {
    throw new Error('TodoStore is not yet initialized');
  }
  return storeRef;
}
