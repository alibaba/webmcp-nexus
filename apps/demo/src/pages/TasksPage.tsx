import { useCallback, useMemo, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import TaskCard from '../components/TaskCard';
import TaskFormDialog from '../components/TaskFormDialog';
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  PRIORITY_ORDER,
  type Task,
  type TaskFilters,
  type TaskSort,
  type TaskSortDirection,
  type TaskSortField,
} from '../store/types';

const SORT_FIELDS: TaskSortField[] = ['default', 'priority', 'createdAt', 'dueDate', 'title'];
const SORT_FIELD_SHORT: Record<TaskSortField, string> = {
  default: '默认',
  priority: '优先级',
  createdAt: '创建时间',
  dueDate: '截止时间',
  title: '标题',
};

function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  if (sort.field === 'default') return tasks;
  const dir = sort.direction === 'desc' ? -1 : 1;
  const cmp = (a: Task, b: Task): number => {
    switch (sort.field) {
      case 'priority':
        return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
      case 'createdAt':
        return a.createdAt.localeCompare(b.createdAt) * dir;
      case 'dueDate': {
        const ad = a.dueDate ?? '￿';
        const bd = b.dueDate ?? '￿';
        return ad.localeCompare(bd) * dir;
      }
      case 'title':
        return a.title.localeCompare(b.title, 'zh-Hans-CN') * dir;
      default:
        return 0;
    }
  };
  return [...tasks].sort(cmp);
}

export default function TasksPage() {
  const {
    filterTasks,
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
  } = useTodoStore();
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<TaskSort>(DEFAULT_SORT);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const tasks = useMemo(() => sortTasks(filterTasks(filters), sort), [filterTasks, filters, sort]);

  /**
   * [作用域：任务列表页] 打开「新建任务」弹窗（让用户在弹窗里手动填写并提交）。
   */
  const openTaskCreator = useCallback(async () => {
    setCreating(true);
    return { opened: true };
  }, []);

  /**
   * [作用域：任务列表页] 关闭当前打开的新建 / 编辑任务弹窗。
   */
  const closeTaskDialog = useCallback(async () => {
    setCreating(false);
    setEditing(null);
    return { closed: true };
  }, []);

  /**
   * [作用域：任务列表页] 设置任务列表的排序规则（字段 + 升降序）。default = 优先级+截止时间。
   */
  const setTaskSort = useCallback(
    async (params: {
      /** 排序字段：default(默认) / priority / createdAt / dueDate / title */
      field: TaskSortField;
      /** 排序方向：asc 升序 / desc 降序（默认 asc） */
      direction?: TaskSortDirection;
    }) => {
      const next: TaskSort = { field: params.field, direction: params.direction ?? 'asc' };
      setSort(next);
      return { applied: next };
    },
    [],
  );

  /**
   * [作用域：任务列表页] 重置任务列表排序为默认（优先级 + 截止时间）。
   */
  const resetTaskSort = useCallback(async () => {
    setSort(DEFAULT_SORT);
    return { reset: true };
  }, []);

  useWebMcpTools({
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
    openTaskCreator,
    closeTaskDialog,
    setTaskSort,
    resetTaskSort,
  });

  return (
    <section className="page page--tasks">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">任务</p>
          <h1 className="page__title">所有任务</h1>
          <p className="page__subtitle">
            搜索 + 多条件过滤；当前命中 <strong>{tasks.length}</strong> 条。
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setCreating(true)}>
          + 新建任务
        </button>
      </header>

      <div className="tasks-layout">
        <div className="tasks-layout__main">
          <SearchBar
            value={filters.search}
            onChange={search => setFilters(prev => ({ ...prev, search }))}
          />
          <div className="tasks-sort-row" role="group" aria-label="任务排序">
            <span className="tasks-sort-row__label">排序</span>
            <div className="sort-chips">
              {SORT_FIELDS.map(f => {
                const isActive = sort.field === f;
                const isDefault = f === 'default';
                const handleClick = () => {
                  if (!isActive) {
                    setSort({ field: f, direction: 'asc' });
                  } else if (!isDefault) {
                    setSort(s => ({
                      ...s,
                      direction: s.direction === 'asc' ? 'desc' : 'asc',
                    }));
                  }
                };
                const title = isActive
                  ? isDefault
                    ? '当前为默认排序（优先级 + 截止时间）'
                    : `按${SORT_FIELD_SHORT[f]}排序，点击切换升降序（当前${
                        sort.direction === 'asc' ? '升序' : '降序'
                      }）`
                  : `按${SORT_FIELD_SHORT[f]}排序`;
                return (
                  <button
                    key={f}
                    type="button"
                    className={`sort-chip ${isActive ? 'is-active' : ''} ${
                      isDefault ? 'sort-chip--default' : ''
                    }`}
                    onClick={handleClick}
                    aria-pressed={isActive}
                    title={title}
                  >
                    <span>{SORT_FIELD_SHORT[f]}</span>
                    {isActive && !isDefault && (
                      <span className="sort-chip__dir" aria-hidden="true">
                        {sort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {sort.field !== 'default' && (
              <button
                type="button"
                className="link-btn tasks-sort-row__reset"
                onClick={() => setSort(DEFAULT_SORT)}
              >
                还原默认
              </button>
            )}
          </div>
          <div className="task-grid task-grid--list">
            {tasks.map(t => (
              <TaskCard key={t.id} task={t} onClick={setEditing} />
            ))}
            {tasks.length === 0 && (
              <p className="muted">
                没有匹配的任务。换一组过滤条件，或者直接 <em>新建</em> 一条。
              </p>
            )}
          </div>
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      <TaskFormDialog
        open={creating || !!editing}
        editingTask={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </section>
  );
}
