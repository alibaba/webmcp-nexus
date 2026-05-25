import { useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import Badge from '../components/Badge';
import CopyableId from '../components/CopyableId';

export default function TagsPage() {
  const { tags, tasks, createTag, updateTag, deleteTag } = useTodoStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7c3aed');

  useWebMcpTools({ createTag, updateTag, deleteTag });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTag({ name, color });
    setName('');
  };

  return (
    <section className="page page--tags">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">标签</p>
          <h1 className="page__title">标签系统</h1>
          <p className="page__subtitle">用标签贯穿不同项目，便于横向切分任务。</p>
        </div>
      </header>

      <ul className="tag-list">
        {tags.map(t => {
          const count = tasks.filter(x => x.tagIds.includes(t.id)).length;
          return (
            <li key={t.id} className="tag-list__item">
              <Badge color={t.color} tone="soft">
                #{t.name}
              </Badge>
              <CopyableId id={t.id} label="Tag ID" />
              <span className="tag-list__count">{count} 个任务</span>
              <button type="button" className="ghost-btn" onClick={() => deleteTag({ id: t.id })}>
                删除
              </button>
            </li>
          );
        })}
      </ul>

      <form className="inline-form" onSubmit={submit}>
        <h3>新建标签</h3>
        <div className="field-row">
          <label className="field">
            <span>标签名</span>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label className="field">
            <span>颜色</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </label>
        </div>
        <button type="submit" className="primary-btn">
          创建标签
        </button>
      </form>
    </section>
  );
}
