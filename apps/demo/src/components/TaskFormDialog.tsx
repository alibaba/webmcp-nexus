import { useEffect, useState } from 'react';
import { useTodoStore } from '../store/TodoStore';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Priority,
  type Task,
  type TaskStatus,
} from '../store/types';

interface Props {
  open: boolean;
  initialProjectId?: string;
  editingTask?: Task | null;
  onClose: () => void;
}

export default function TaskFormDialog({ open, initialProjectId, editingTask, onClose }: Props) {
  const store = useTodoStore();
  const { projects, tags, createTask, updateTask } = store;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId ?? 'p_inbox');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('刺秦');
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setProjectId(editingTask.projectId);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDueDate(editingTask.dueDate ?? '');
      setAssignee(editingTask.assignee);
      setTagIds(editingTask.tagIds);
    } else {
      setTitle('');
      setDescription('');
      setProjectId(initialProjectId ?? 'p_inbox');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
      setAssignee('刺秦');
      setTagIds([]);
    }
  }, [open, editingTask, initialProjectId]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      projectId,
      priority,
      status,
      dueDate: dueDate || null,
      assignee,
      tagIds,
    };
    if (editingTask) {
      updateTask({ id: editingTask.id, ...payload });
    } else {
      createTask(payload);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={e => e.stopPropagation()}
        onSubmit={submit}
        aria-label={editingTask ? '编辑任务' : '新建任务'}
      >
        <h2 className="modal__title">{editingTask ? '编辑任务' : '新建任务'}</h2>

        <label className="field">
          <span>标题</span>
          <input value={title} onChange={e => setTitle(e.target.value)} autoFocus required />
        </label>

        <label className="field">
          <span>描述</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </label>

        <div className="field-row">
          <label className="field">
            <span>项目</span>
            <select value={projectId} onChange={e => setProjectId(e.target.value)}>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>负责人</span>
            <input value={assignee} onChange={e => setAssignee(e.target.value)} />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>优先级</span>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>状态</span>
            <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
              {(['todo', 'in_progress', 'done', 'archived'] as TaskStatus[]).map(s => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>截止时间</span>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <div className="field">
          <span>标签</span>
          <div className="chip-row">
            {tags.map(t => (
              <button
                key={t.id}
                type="button"
                className={`chip ${tagIds.includes(t.id) ? 'is-active' : ''}`}
                onClick={() =>
                  setTagIds(prev =>
                    prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id],
                  )
                }
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="primary-btn">
            {editingTask ? '保存' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
}
