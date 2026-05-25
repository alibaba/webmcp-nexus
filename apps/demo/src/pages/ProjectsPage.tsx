import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import CopyableId from '../components/CopyableId';

export default function ProjectsPage() {
  const { projects, tasks, createProject, updateProject, deleteProject } = useTodoStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2f6f5e');

  /**
   * [作用域：项目列表页] 跳转到指定项目的详情页。
   */
  const openProject = useCallback(
    async (params: {
      /** 项目 ID */
      projectId: string;
    }) => {
      navigate(`/projects/${params.projectId}`);
      return { navigated: params.projectId };
    },
    [navigate],
  );

  useWebMcpTools({ createProject, updateProject, deleteProject, openProject });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject({ name, description, color });
    setName('');
    setDescription('');
    setColor('#2f6f5e');
  };

  return (
    <section className="page page--projects">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">项目</p>
          <h1 className="page__title">项目管理</h1>
          <p className="page__subtitle">点击任一项目卡片进入详情；当前共 {projects.length} 个项目。</p>
        </div>
      </header>

      <div className="project-grid">
        {projects.map(p => {
          const ts = tasks.filter(t => t.projectId === p.id);
          const done = ts.filter(t => t.status === 'done').length;
          const pct = ts.length === 0 ? 0 : Math.round((done / ts.length) * 100);
          return (
            <article
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div className="project-card__head">
                <span className="dot dot--lg" style={{ background: p.color }} />
                <h3>{p.name}</h3>
                <CopyableId id={p.id} label="Project ID" />
              </div>
              <p className="project-card__desc">{p.description}</p>
              <div className="project-card__bar">
                <div
                  className="project-card__bar-fill"
                  style={{ width: `${pct}%`, background: p.color }}
                />
              </div>
              <div className="project-card__meta">
                <span>{ts.length} 个任务</span>
                <span>{pct}% 完成</span>
              </div>
            </article>
          );
        })}
      </div>

      <form className="inline-form" onSubmit={submit}>
        <h3>新建项目</h3>
        <div className="field-row">
          <label className="field">
            <span>名称</span>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label className="field">
            <span>颜色</span>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>描述</span>
          <input value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <button type="submit" className="primary-btn">
          创建项目
        </button>
      </form>
    </section>
  );
}
