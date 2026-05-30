import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router';
import { CanvasStoreProvider } from './store/CanvasStore';
import { TodoStoreProvider } from './store/TodoStore';
import { publishNavigate } from './tools/navigation-bridge';
import CanvasPage from './pages/CanvasPage';
import TodosPage from './pages/TodosPage';
import DebugPanel from './components/DebugPanel';

function NavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    publishNavigate(navigate);
    return () => publishNavigate(null);
  }, [navigate]);
  return null;
}

function Shell() {
  const [debugOpen, setDebugOpen] = useState(false);
  const toggleDebug = useCallback(() => setDebugOpen(v => !v), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleDebug();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleDebug]);

  return (
    <CanvasStoreProvider>
      <TodoStoreProvider>
        <div className="app">
          <NavigateBridge />
          <header className="top-nav">
            <div className="top-nav__brand">◐ Nexus Demo</div>
            <nav className="top-nav__tabs">
              <NavLink to="/" end className={({ isActive }) => `tab-btn ${isActive ? 'is-active' : ''}`}>
                画板
              </NavLink>
              <NavLink to="/todos" className={({ isActive }) => `tab-btn ${isActive ? 'is-active' : ''}`}>
                待办
              </NavLink>
            </nav>
            <div className="top-nav__hint">⌘ + \ 调试面板</div>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<CanvasPage />} />
              <Route path="/todos" element={<TodosPage />} />
            </Routes>
          </main>
          <DebugPanel open={debugOpen} onToggle={toggleDebug} />
        </div>
      </TodoStoreProvider>
    </CanvasStoreProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
