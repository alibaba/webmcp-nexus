import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router';
import { TodoStoreProvider } from './store/TodoStore';
import { publishNavigate } from './tools/navigation-bridge';
import DebugPanel from './components/DebugPanel';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TagsPage from './pages/TagsPage';

function NavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    publishNavigate(navigate);
    return () => publishNavigate(null);
  }, [navigate]);
  return null;
}

function Shell() {
  const [debugOpen, setDebugOpen] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setDebugOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app-shell ${debugOpen ? 'shell--debug-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="brand__mark">◐</span>
          <span className="brand__name">Nexus Todo</span>
        </div>
        <nav className="sidebar__nav">
          <NavLink to="/" end>
            <span className="nav__icon">◇</span> 概览
          </NavLink>
          <NavLink to="/tasks">
            <span className="nav__icon">▤</span> 任务
          </NavLink>
          <NavLink to="/projects">
            <span className="nav__icon">⊞</span> 项目
          </NavLink>
          <NavLink to="/tags">
            <span className="nav__icon">⌗</span> 标签
          </NavLink>
        </nav>
        <div className="sidebar__hint">
          <kbd>⌘</kbd> + <kbd>\</kbd> 切换调试面板
        </div>
      </aside>

      <main className="main">
        <NavigateBridge />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
        </Routes>
      </main>

      <DebugPanel open={debugOpen} onToggle={() => setDebugOpen(v => !v)} />
    </div>
  );
}

export default function App() {
  return (
    <TodoStoreProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </TodoStoreProvider>
  );
}
