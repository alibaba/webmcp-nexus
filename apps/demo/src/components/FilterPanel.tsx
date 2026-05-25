import { useCallback } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import {
  EMPTY_FILTERS,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Priority,
  type TaskFilters,
  type TaskStatus,
} from '../store/types';

interface Props {
  filters: TaskFilters;
  onChange: (next: TaskFilters) => void;
}

const ALL_PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];
const ALL_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'archived'];

/**
 * 多条件过滤面板 — 仅在它挂载的页面期间注册自身的工具。
 */
export default function FilterPanel({ filters, onChange }: Props) {
  const { projects, tags } = useTodoStore();

  const set = useCallback(
    (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter(x => x !== p)
      : [...filters.priorities, p];
    set({ priorities: next });
  };
  const toggleStatus = (s: TaskStatus) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter(x => x !== s)
      : [...filters.statuses, s];
    set({ statuses: next });
  };
  const toggleTag = (id: string) => {
    const next = filters.tagIds.includes(id)
      ? filters.tagIds.filter(x => x !== id)
      : [...filters.tagIds, id];
    set({ tagIds: next });
  };

  /**
   * [作用域：过滤面板组件] 批量应用过滤条件（已设字段会覆盖，未设字段保持当前）。
   */
  const applyFilters = useCallback(
    async (params: {
      /** 项目 ID（传 null 清除） */
      projectId?: string | null;
      /** 标签 ID 列表（整体替换） */
      tagIds?: string[];
      /** 优先级列表 */
      priorities?: Priority[];
      /** 状态列表 */
      statuses?: TaskStatus[];
      /** 负责人（传 null 清除） */
      assignee?: string | null;
      /** 截止日期起 YYYY-MM-DD */
      dueFrom?: string | null;
      /** 截止日期止 YYYY-MM-DD */
      dueTo?: string | null;
    }) => {
      const patch: Partial<TaskFilters> = {};
      if (params.projectId !== undefined) patch.projectId = params.projectId;
      if (params.tagIds !== undefined) patch.tagIds = params.tagIds;
      if (params.priorities !== undefined) patch.priorities = params.priorities;
      if (params.statuses !== undefined) patch.statuses = params.statuses;
      if (params.assignee !== undefined) patch.assignee = params.assignee;
      if (params.dueFrom !== undefined) patch.dueFrom = params.dueFrom;
      if (params.dueTo !== undefined) patch.dueTo = params.dueTo;
      onChange({ ...filters, ...patch });
      return { applied: true };
    },
    [filters, onChange],
  );

  /**
   * [作用域：过滤面板组件] 重置过滤面板为初始状态（保留搜索关键词）。
   */
  const resetFilters = useCallback(async () => {
    onChange({ ...EMPTY_FILTERS, search: filters.search });
    return { reset: true };
  }, [filters.search, onChange]);

  useWebMcpTools({ applyFilters, resetFilters });

  const assignees = Array.from(new Set(useTodoStore().tasks.map(t => t.assignee)));

  return (
    <aside className="filter-panel">
      <div className="filter-panel__head">
        <h4>过滤</h4>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => onChange({ ...EMPTY_FILTERS, search: filters.search })}
        >
          重置
        </button>
      </div>

      <section className="filter-panel__group">
        <label>项目</label>
        <select
          value={filters.projectId ?? ''}
          onChange={e => set({ projectId: e.target.value || null })}
        >
          <option value="">全部项目</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </section>

      <section className="filter-panel__group">
        <label>优先级</label>
        <div className="chip-row">
          {ALL_PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              className={`chip ${filters.priorities.includes(p) ? 'is-active' : ''}`}
              onClick={() => togglePriority(p)}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-panel__group">
        <label>状态</label>
        <div className="chip-row">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              type="button"
              className={`chip ${filters.statuses.includes(s) ? 'is-active' : ''}`}
              onClick={() => toggleStatus(s)}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-panel__group">
        <label>标签</label>
        <div className="chip-row">
          {tags.map(t => (
            <button
              key={t.id}
              type="button"
              className={`chip ${filters.tagIds.includes(t.id) ? 'is-active' : ''}`}
              style={
                filters.tagIds.includes(t.id)
                  ? { borderColor: t.color, color: t.color }
                  : undefined
              }
              onClick={() => toggleTag(t.id)}
            >
              #{t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="filter-panel__group">
        <label>负责人</label>
        <select
          value={filters.assignee ?? ''}
          onChange={e => set({ assignee: e.target.value || null })}
        >
          <option value="">全部成员</option>
          {assignees.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </section>

      <section className="filter-panel__group">
        <label>截止日期范围</label>
        <div className="filter-panel__range">
          <div className="filter-panel__range-row">
            <span className="filter-panel__range-tag">起</span>
            <input
              type="date"
              value={filters.dueFrom ?? ''}
              onChange={e => set({ dueFrom: e.target.value || null })}
              aria-label="起始日期"
            />
          </div>
          <div className="filter-panel__range-row">
            <span className="filter-panel__range-tag">止</span>
            <input
              type="date"
              value={filters.dueTo ?? ''}
              onChange={e => set({ dueTo: e.target.value || null })}
              aria-label="结束日期"
            />
          </div>
        </div>
      </section>
    </aside>
  );
}
