import { useCallback, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import type { Todo, TodoStatus } from '../store/types';
import { PRIORITY_LABEL } from '../store/types';
import TodoFormDialog from '../components/TodoFormDialog';

export default function TodosPage() {
  const {
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
  } = useTodoStore();
  const [search, setSearch] = useState('');
  const [dialogTodo, setDialogTodo] = useState<Todo | null | undefined>(undefined);

  const filteredTodos = filterTodos({ search });

  const toggleStatus = useCallback(
    (id: string, current: TodoStatus) => {
      const next: TodoStatus = current === 'done' ? 'todo' : 'done';
      setTodoStatus({ id, status: next });
    },
    [setTodoStatus],
  );

  /**
   * [作用域：待办页] 列出全部待办（不过滤，可指定数量上限）。
   * @readonly
   */
  const listTodosImpl = useCallback(
    async (params: {
      /** 返回数量上限（默认 200） */
      limit?: number;
    }) => {
      const limit = params.limit ?? 200;
      return { count: todos.length, todos: todos.slice(0, limit) };
    },
    [todos],
  );

  /**
   * [作用域：待办页] 根据 ID 读取单条待办详情。
   * @readonly
   */
  const getTodo = useCallback(
    async (params: { /** 待办 ID */ id: string }) => {
      return { todo: getTodoById(params) };
    },
    [getTodoById],
  );

  /**
   * [作用域：待办页] 搜索待办（关键词匹配标题与描述，可叠加优先级/状态过滤）。
   * @readonly
   */
  const searchTodos = useCallback(
    async (params: {
      /** 关键词（匹配标题与描述） */
      query?: string;
      /** 优先级过滤 */
      priorities?: ('low' | 'medium' | 'high' | 'urgent')[];
      /** 状态过滤 */
      statuses?: ('todo' | 'in_progress' | 'done')[];
      /** 返回数量上限（默认 50） */
      limit?: number;
    }) => {
      const results = filterTodos({
        search: params.query,
        priorities: params.priorities,
        statuses: params.statuses,
      });
      const limit = params.limit ?? 50;
      return {
        count: results.length,
        results: results.slice(0, limit).map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
        })),
      };
    },
    [filterTodos],
  );

  /**
   * [作用域：待办页] 读取待办统计（总数/各状态数/逾期数）。
   * @readonly
   */
  const getTodoStats = useCallback(
    async (_params: Record<string, never>) => {
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
    },
    [todos],
  );

  useWebMcpTools({
    listTodos: listTodosImpl,
    getTodo,
    searchTodos,
    getTodoStats,
    createTodo,
    updateTodo,
    deleteTodo,
    deleteTodos,
    setTodoStatus,
    bulkSetTodoStatus,
    setTodoPriority,
    setTodoDueDate,
  });

  const formatDueDate = (d: string | null) => {
    if (!d) return null;
    return d.replace('T', ' ');
  };

  return (
    <section className="page page--todos">
      <div className="todos-header">
        <div>
          <h2 className="todos-title">待办事项</h2>
          <p className="todos-count">共 {todos.length} 项</p>
        </div>
        <button type="button" className="todos-add-btn" onClick={() => setDialogTodo(null)}>+ 新建</button>
      </div>

      <div className="todos-search">
        <input
          type="text"
          className="todos-search__input"
          placeholder="搜索待办..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="todos-list">
        {filteredTodos.map(todo => (
          <div key={todo.id} className={`todo-card ${todo.status === 'done' ? 'is-done' : ''}`}>
            <button
              type="button"
              className={`todo-card__checkbox ${todo.status === 'done' ? 'is-checked' : ''}`}
              onClick={() => toggleStatus(todo.id, todo.status)}
            />
            <div className="todo-card__body" onClick={() => setDialogTodo(todo)} style={{ cursor: 'pointer' }}>
              <div className="todo-card__title">{todo.title}</div>
              {todo.dueDate && (
                <div className="todo-card__due">截止 {formatDueDate(todo.dueDate)}</div>
              )}
            </div>
            <span className={`todo-card__priority priority--${todo.priority}`}>
              {PRIORITY_LABEL[todo.priority]}
            </span>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <div className="todos-empty">暂无待办</div>
        )}
      </div>
      {dialogTodo !== undefined && (
        <TodoFormDialog todo={dialogTodo} onClose={() => setDialogTodo(undefined)} />
      )}
    </section>
  );
}
