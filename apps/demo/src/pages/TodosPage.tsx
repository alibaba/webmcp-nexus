import { useCallback, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import type { TodoStatus } from '../store/types';
import { PRIORITY_LABEL } from '../store/types';

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

  const filteredTodos = filterTodos({ search });

  const toggleStatus = useCallback(
    (id: string, current: TodoStatus) => {
      const next: TodoStatus = current === 'done' ? 'todo' : 'done';
      setTodoStatus({ id, status: next });
    },
    [setTodoStatus],
  );

  /**
   * [作用域：待办页] 创建一条新待办。
   */
  const createTodoTool = useCallback(
    async (params: {
      /** 待办标题 */
      title: string;
      /** 待办描述 */
      description?: string;
      /** 优先级 */
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      /** 截止时间 YYYY-MM-DDTHH:mm */
      dueDate?: string;
    }) => {
      return createTodo(params);
    },
    [createTodo],
  );

  /**
   * [作用域：待办页] 更新一条待办的字段。
   */
  const updateTodoTool = useCallback(
    async (params: {
      /** 待办 ID */
      id: string;
      /** 新标题 */
      title?: string;
      /** 新描述 */
      description?: string;
      /** 新优先级 */
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      /** 新状态 */
      status?: 'todo' | 'in_progress' | 'done';
      /** 新截止时间 YYYY-MM-DDTHH:mm，传 null 清除 */
      dueDate?: string | null;
    }) => {
      return updateTodo(params);
    },
    [updateTodo],
  );

  /**
   * [作用域：待办页] 删除一条待办。
   */
  const deleteTodoTool = useCallback(
    async (params: { /** 待办 ID */ id: string }) => {
      return { success: deleteTodo(params) };
    },
    [deleteTodo],
  );

  /**
   * [作用域：待办页] 批量删除待办。
   */
  const deleteTodosTool = useCallback(
    async (params: { /** 待办 ID 列表 */ ids: string[] }) => {
      return deleteTodos(params);
    },
    [deleteTodos],
  );

  /**
   * [作用域：待办页] 设置待办状态。
   */
  const setTodoStatusTool = useCallback(
    async (params: { /** 待办 ID */ id: string; /** 新状态 */ status: 'todo' | 'in_progress' | 'done' }) => {
      return setTodoStatus(params);
    },
    [setTodoStatus],
  );

  /**
   * [作用域：待办页] 批量设置待办状态。
   */
  const bulkSetTodoStatusTool = useCallback(
    async (params: { /** 待办 ID 列表 */ ids: string[]; /** 新状态 */ status: 'todo' | 'in_progress' | 'done' }) => {
      return bulkSetTodoStatus(params);
    },
    [bulkSetTodoStatus],
  );

  /**
   * [作用域：待办页] 设置待办优先级。
   */
  const setTodoPriorityTool = useCallback(
    async (params: { /** 待办 ID */ id: string; /** 新优先级 */ priority: 'low' | 'medium' | 'high' | 'urgent' }) => {
      return setTodoPriority(params);
    },
    [setTodoPriority],
  );

  /**
   * [作用域：待办页] 设置待办截止时间。
   */
  const setTodoDueDateTool = useCallback(
    async (params: { /** 待办 ID */ id: string; /** 截止时间 YYYY-MM-DDTHH:mm 或 null */ dueDate: string | null }) => {
      return setTodoDueDate(params);
    },
    [setTodoDueDate],
  );

  /**
   * [作用域：待办页] 搜索过滤待办列表。
   * @readonly
   */
  const searchTodos = useCallback(
    async (params: {
      /** 搜索关键词 */
      search?: string;
      /** 优先级过滤 */
      priorities?: ('low' | 'medium' | 'high' | 'urgent')[];
      /** 状态过滤 */
      statuses?: ('todo' | 'in_progress' | 'done')[];
    }) => {
      return { todos: filterTodos(params) };
    },
    [filterTodos],
  );

  /**
   * [作用域：待办页] 获取单条待办详情。
   * @readonly
   */
  const getTodoByIdTool = useCallback(
    async (params: { /** 待办 ID */ id: string }) => {
      return getTodoById(params);
    },
    [getTodoById],
  );

  useWebMcpTools({
    createTodo: createTodoTool,
    updateTodo: updateTodoTool,
    deleteTodo: deleteTodoTool,
    deleteTodos: deleteTodosTool,
    setTodoStatus: setTodoStatusTool,
    bulkSetTodoStatus: bulkSetTodoStatusTool,
    setTodoPriority: setTodoPriorityTool,
    setTodoDueDate: setTodoDueDateTool,
    searchTodos,
    getTodoById: getTodoByIdTool,
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
        <button type="button" className="todos-add-btn">+ 新建</button>
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
            <div className="todo-card__body">
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
    </section>
  );
}
