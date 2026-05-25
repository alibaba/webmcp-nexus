import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import TaskCard from '../components/TaskCard';
import TaskFormDialog from '../components/TaskFormDialog';
import type { Task } from '../store/types';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    createTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    updateProject,
    deleteProject,
  } = useTodoStore();
  const project = projects.find(p => p.id === projectId);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  /**
   * [作用域：项目详情页] 在当前项目下打开「新建任务」弹窗。
   */
  const openTaskCreator = useCallback(async () => {
    setCreating(true);
    return { opened: true };
  }, []);

  /**
   * [作用域：项目详情页] 关闭当前打开的新建 / 编辑任务弹窗。
   */
  const closeTaskDialog = useCallback(async () => {
    setCreating(false);
    setEditing(null);
    return { closed: true };
  }, []);

  /**
   * [作用域：项目详情页] 返回到项目列表页。
   */
  const backToProjects = useCallback(async () => {
    navigate('/projects');
    return { navigated: '/projects' };
  }, [navigate]);

  useWebMcpTools({
    createTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    updateProject,
    deleteProject,
    openTaskCreator,
    closeTaskDialog,
    backToProjects,
  });

  if (!project) {
    return (
      <section className="page">
        <h1>项目不存在</h1>
        <button className="primary-btn" onClick={() => navigate('/projects')}>
          回到项目列表
        </button>
      </section>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id);

  return (
    <section className="page page--project-detail">
      <header className="page__head">
        <div>
          <p className="page__eyebrow">
            <button className="link-btn" onClick={() => navigate('/projects')}>
              ← 项目
            </button>
          </p>
          <h1 className="page__title" style={{ color: project.color }}>
            {project.name}
          </h1>
          <p className="page__subtitle">{project.description}</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setCreating(true)}>
          + 新建任务
        </button>
      </header>

      <div className="task-grid task-grid--list">
        {projectTasks.map(t => (
          <TaskCard key={t.id} task={t} onClick={setEditing} />
        ))}
        {projectTasks.length === 0 && <p className="muted">这个项目暂时没有任务。</p>}
      </div>

      <TaskFormDialog
        open={creating || !!editing}
        initialProjectId={project.id}
        editingTask={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </section>
  );
}
