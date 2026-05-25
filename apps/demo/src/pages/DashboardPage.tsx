import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import TaskCard from '../components/TaskCard';
import TaskFormDialog from '../components/TaskFormDialog';
import type { Task } from '../store/types';

export default function DashboardPage() {
  const { tasks, projects, createTask, setTaskStatus } = useTodoStore();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  /**
   * [作用域：工作台页] 打开新建任务弹窗（让用户在弹窗里继续手动填写）。
   */
  const openTaskCreator = useCallback(async () => {
    setCreating(true);
    return { opened: true };
  }, []);

  /**
   * [作用域：工作台页] 关闭当前打开的新建 / 编辑任务弹窗。
   */
  const closeTaskDialog = useCallback(async () => {
    setCreating(false);
    setEditing(null);
    return { closed: true };
  }, []);

  useWebMcpTools({ createTask, setTaskStatus, openTaskCreator, closeTaskDialog });

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(
        t =>
          t.dueDate &&
          t.dueDate < today &&
          t.status !== 'done' &&
          t.status !== 'archived',
      ).length,
    };
  }, [tasks]);

  const dueSoon = useMemo(
    () =>
      tasks
        .filter(t => t.status !== 'done' && t.status !== 'archived' && t.dueDate)
        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
        .slice(0, 5),
    [tasks],
  );

  return (
    <section className="page page--dashboard">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">2026 · 05 · 21</p>
          <h1 className="page__title">今天的工作台</h1>
          <p className="page__subtitle">
            把当下最值得做的事放在最前面，剩下的交给 WebMCP 工具自动协作。
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setCreating(true)}>
          + 新建任务
        </button>
      </header>

      <div className="stat-grid">
        <StatCard label="任务总数" value={stats.total} accent="#2f6f5e" />
        <StatCard label="待办" value={stats.todo} accent="#64748b" />
        <StatCard label="进行中" value={stats.inProgress} accent="#0ea5e9" />
        <StatCard label="已完成" value={stats.done} accent="#16a34a" />
        <StatCard label="逾期" value={stats.overdue} accent="#dc2626" />
      </div>

      <div className="dashboard__cols">
        <section className="dashboard__col">
          <header className="dashboard__col-head">
            <h2>即将到期</h2>
            <button type="button" className="ghost-btn" onClick={() => navigate('/tasks')}>
              查看所有任务 →
            </button>
          </header>
          <div className="task-grid">
            {dueSoon.map(t => (
              <TaskCard key={t.id} task={t} onClick={setEditing} />
            ))}
            {dueSoon.length === 0 && <p className="muted">没有即将到期的任务，干得漂亮 ✦</p>}
          </div>
        </section>

        <section className="dashboard__col dashboard__col--side">
          <header className="dashboard__col-head">
            <h2>项目</h2>
            <button type="button" className="ghost-btn" onClick={() => navigate('/projects')}>
              全部项目 →
            </button>
          </header>
          <ul className="project-pill-list">
            {projects.map(p => {
              const count = tasks.filter(t => t.projectId === p.id).length;
              return (
                <li
                  key={p.id}
                  className="project-pill"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <span className="dot" style={{ background: p.color }} />
                  <span className="project-pill__name">{p.name}</span>
                  <span className="project-pill__count">{count}</span>
                </li>
              );
            })}
          </ul>
        </section>
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

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
