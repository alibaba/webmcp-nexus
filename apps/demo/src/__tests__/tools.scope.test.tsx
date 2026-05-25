import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from '../tools/queries';
import * as navigation from '../tools/navigation';
import { TodoStoreProvider } from '../store/TodoStore';
import TasksPage from '../pages/TasksPage';
import DashboardPage from '../pages/DashboardPage';
import TagsPage from '../pages/TagsPage';

interface ToolDescriptor {
  name: string;
}

function listToolNames(): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mc = (navigator as any).modelContext;
  if (!mc?.listTools) return [];
  return (mc.listTools() as ToolDescriptor[]).map(t => t.name);
}

function flush() {
  // Allow microtask + the SDK's 100ms debounced widget push to settle.
  return new Promise<void>(resolve => setTimeout(resolve, 120));
}

let globalsRegistered = false;
function ensureGlobalsRegistered() {
  if (globalsRegistered) return;
  registerGlobalTools(queries, navigation);
  globalsRegistered = true;
}

beforeEach(() => {
  ensureGlobalsRegistered();
});

afterEach(() => {
  // nothing — react cleanup happens in setup.ts
});

describe('Tool registration scopes', () => {
  it('registers only generic queries + navigate at startup, and they remain available regardless of page', async () => {
    const names = listToolNames();
    // Only read-only queries + navigation belong in the always-on (global) set.
    expect(names).toEqual(expect.arrayContaining([
      'listTasks',
      'getTask',
      'searchTasks',
      'listProjects',
      'getProject',
      'listTags',
      'getTag',
      'listAssignees',
      'getStats',
      'navigate',
    ]));
    // No business mutations are registered as global anymore.
    expect(names).not.toContain('createTask');
    expect(names).not.toContain('updateTask');
    expect(names).not.toContain('deleteTask');
    expect(names).not.toContain('createProject');
    expect(names).not.toContain('deleteProject');
    expect(names).not.toContain('createTag');
    expect(names).not.toContain('deleteTag');
  });

  it('mounts page + component tools on route enter and unregisters on route leave', async () => {
    function App({ path }: { path: string }) {
      return (
        <TodoStoreProvider>
          <MemoryRouter key={path} initialEntries={[path]}>
            <Routes>
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tags" element={<TagsPage />} />
            </Routes>
          </MemoryRouter>
        </TodoStoreProvider>
      );
    }

    const { unmount, rerender } = render(<App path="/tasks" />);

    await act(async () => { await flush(); });
    let names = listToolNames();
    // TasksPage's own task-mutation + UI tools
    expect(names).toEqual(expect.arrayContaining([
      'createTask',
      'updateTask',
      'deleteTask',
      'setTaskStatus',
      'setTaskPriority',
      'moveTaskToProject',
      'addTaskTag',
      'removeTaskTag',
      'openTaskCreator',
      'closeTaskDialog',
    ]));
    // The SearchBar + FilterPanel components also register their own tools here
    expect(names).toEqual(expect.arrayContaining([
      'setSearchQuery',
      'clearSearchQuery',
      'applyFilters',
      'resetFilters',
    ]));
    // Tag mutations only belong to the tags page
    expect(names).not.toContain('createTag');
    expect(names).not.toContain('deleteTag');

    rerender(<App path="/tags" />);
    await act(async () => { await flush(); });

    names = listToolNames();
    expect(names).toEqual(expect.arrayContaining([
      'createTag',
      'updateTag',
      'deleteTag',
    ]));
    // Tasks-page tools must be gone now
    expect(names).not.toContain('updateTask');
    expect(names).not.toContain('moveTaskToProject');
    expect(names).not.toContain('setSearchQuery');
    expect(names).not.toContain('applyFilters');

    unmount();
    await act(async () => { await flush(); });

    const after = listToolNames();
    expect(after).not.toContain('createTag');
    expect(after).not.toContain('deleteTag');

    // Global queries + navigate are still available after every unmount.
    expect(after).toEqual(expect.arrayContaining(['searchTasks', 'listTasks', 'navigate']));
  });

  it('Dashboard page only registers a small set of dashboard-relevant tools', async () => {
    const { unmount } = render(
      <TodoStoreProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </TodoStoreProvider>,
    );
    await act(async () => { await flush(); });

    const names = listToolNames();
    // Dashboard exposes quick-create + status-toggle + dialog UI; not the full mutation surface.
    expect(names).toEqual(expect.arrayContaining([
      'createTask',
      'setTaskStatus',
      'openTaskCreator',
      'closeTaskDialog',
    ]));
    // Heavier task-mutation surface lives in the dedicated tasks page only.
    expect(names).not.toContain('moveTaskToProject');
    expect(names).not.toContain('addTaskTag');
    expect(names).not.toContain('deleteTasks');

    unmount();
  });
});
