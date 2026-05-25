import { useTodoStore } from '../store/TodoStore';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Priority,
  type Task,
  type TaskStatus,
} from '../store/types';
import Badge from './Badge';
import CopyableId from './CopyableId';

const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: '#dc2626',
  high: '#c2410c',
  medium: '#2f6f5e',
  low: '#64748b',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: '#64748b',
  in_progress: '#0ea5e9',
  done: '#16a34a',
  archived: '#94a3b8',
};

interface Props {
  task: Task;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const { projects, tags, setTaskStatus, deleteTask } = useTodoStore();
  const project = projects.find(p => p.id === task.projectId);
  const taskTags = tags.filter(t => task.tagIds.includes(t.id));

  const overdue =
    task.dueDate && task.status !== 'done' && task.status !== 'archived'
      ? task.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10)
      : false;

  const dueLabel = task.dueDate
    ? task.dueDate.length >= 16
      ? `${task.dueDate.slice(0, 10)} ${task.dueDate.slice(11, 16)}`
      : task.dueDate
    : '无截止';

  return (
    <article
      className={`task-card task-card--${task.status} ${overdue ? 'task-card--overdue' : ''}`}
      onClick={() => onClick?.(task)}
    >
      <header className="task-card__head">
        <div className="task-card__title-wrap">
          <h3 className="task-card__title">{task.title}</h3>
          <CopyableId id={task.id} label="Task ID" />
        </div>
        <div className="task-card__badges">
          <Badge color={PRIORITY_COLOR[task.priority]} tone="soft">
            {PRIORITY_LABEL[task.priority]}
          </Badge>
          <Badge color={STATUS_COLOR[task.status]} tone="outline">
            {STATUS_LABEL[task.status]}
          </Badge>
        </div>
      </header>

      {task.description && <p className="task-card__desc">{task.description}</p>}

      <footer className="task-card__foot">
        <div className="task-card__meta">
          {project && (
            <span className="task-card__project" title={project.description}>
              <span className="dot" style={{ background: project.color }} /> {project.name}
            </span>
          )}
          {taskTags.length > 0 && (
            <span className="task-card__tags">
              {taskTags.map(t => (
                <Badge key={t.id} color={t.color} tone="soft">
                  #{t.name}
                </Badge>
              ))}
            </span>
          )}
        </div>
        <div className="task-card__side">
          <span className={`task-card__due ${overdue ? 'is-overdue' : ''}`}>
            {dueLabel}
          </span>
          <span className="task-card__assignee">{task.assignee}</span>
        </div>
      </footer>

      <div className="task-card__actions">
        <select
          value={task.status}
          onChange={e => {
            e.stopPropagation();
            setTaskStatus({ id: task.id, status: e.target.value as TaskStatus });
          }}
          onClick={e => e.stopPropagation()}
          aria-label="状态"
        >
          <option value="todo">待办</option>
          <option value="in_progress">进行中</option>
          <option value="done">已完成</option>
          <option value="archived">已归档</option>
        </select>
        <button
          type="button"
          className="ghost-btn"
          onClick={e => {
            e.stopPropagation();
            deleteTask({ id: task.id });
          }}
        >
          删除
        </button>
      </div>
    </article>
  );
}
