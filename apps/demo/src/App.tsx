import { NavLink, Route, Routes } from 'react-router-dom';
import { DebugPanel } from 'webmcp-nexus-sdk';
import { CanvasStoreProvider } from './store/CanvasStore';
import { TodoStoreProvider } from './store/TodoStore';
import CanvasPage from './pages/CanvasPage';
import TodosPage from './pages/TodosPage';

export default function App() {
  return (
    <CanvasStoreProvider>
      <TodoStoreProvider>
        <div className="app">
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
          <DebugPanel />
        </div>
      </TodoStoreProvider>
    </CanvasStoreProvider>
  );
}
