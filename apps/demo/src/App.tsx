import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router';
import { CanvasStoreProvider } from './store/CanvasStore';
import { TodoStoreProvider } from './store/TodoStore';
import { EditorStoreProvider } from './store/EditorStore';
import { publishNavigate } from './tools/navigation-bridge';
import CanvasPage from './pages/CanvasPage';
import TodosPage from './pages/TodosPage';
import EditorPage from './pages/EditorPage';
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
  const [debugOpen, setDebugOpen] = useState(true);
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
        <EditorStoreProvider>
        <div className={`app ${debugOpen ? 'debug-shifted' : ''}`}>
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
              <NavLink to="/editor" className={({ isActive }) => `tab-btn ${isActive ? 'is-active' : ''}`}>
                编辑器
              </NavLink>
            </nav>
            <button
              type="button"
              className={`debug-toggle-btn ${debugOpen ? 'is-active' : ''}`}
              onClick={toggleDebug}
              aria-label={debugOpen ? '关闭调试面板' : '打开调试面板'}
              title="⌘ + \"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
            </button>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<CanvasPage />} />
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/editor" element={<EditorPage />} />
            </Routes>
          </main>
          <DebugPanel open={debugOpen} onToggle={toggleDebug} />
        </div>
        </EditorStoreProvider>
      </TodoStoreProvider>
    </CanvasStoreProvider>
  );
}

// Vite 注入 import.meta.env.BASE_URL；Webpack 通过 DefinePlugin 注入 process.env.DEMO_BASE
const rawBase: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env?.DEMO_BASE) ||
  '/';
const basename = rawBase.replace(/\/+$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Shell />
    </BrowserRouter>
  );
}
