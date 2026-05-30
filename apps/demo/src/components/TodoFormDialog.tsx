import { useState } from 'react';
import { useTodoStore } from '../store/TodoStore';
import type { Priority, Todo, TodoStatus } from '../store/types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../store/types';

interface Props {
  todo?: Todo | null;
  onClose: () => void;
}

export default function TodoFormDialog({ todo, onClose }: Props) {
  const { createTodo, updateTodo } = useTodoStore();
  const isEdit = !!todo;

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? 'medium');
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? 'todo');
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEdit && todo) {
      updateTodo({
        id: todo.id,
        title: title.trim(),
        description,
        priority,
        status,
        dueDate: dueDate || null,
      });
    } else {
      createTodo({
        title: title.trim(),
        description,
        priority,
        status,
        dueDate: dueDate || null,
      });
    }
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <form
        className="dialog-card"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="dialog-card__title">{isEdit ? '编辑待办' : '新建待办'}</h3>

        <label className="form-field">
          <span className="form-field__label">标题</span>
          <input
            type="text"
            className="form-field__input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入待办标题..."
            autoFocus
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">描述</span>
          <textarea
            className="form-field__input form-field__textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="添加描述..."
            rows={3}
          />
        </label>

        <div className="form-row">
          <label className="form-field">
            <span className="form-field__label">优先级</span>
            <select
              className="form-field__input"
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
            >
              {(Object.entries(PRIORITY_LABEL) as [Priority, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">状态</span>
            <select
              className="form-field__input"
              value={status}
              onChange={e => setStatus(e.target.value as TodoStatus)}
            >
              {(Object.entries(STATUS_LABEL) as [TodoStatus, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span className="form-field__label">截止时间</span>
          <input
            type="datetime-local"
            className="form-field__input"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </label>

        <div className="dialog-card__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
            {isEdit ? '保存' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );
}
