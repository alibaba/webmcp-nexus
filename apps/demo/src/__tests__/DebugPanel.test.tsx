import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from '../tools/queries';
import * as navigation from '../tools/navigation';
import DebugPanel from '../components/DebugPanel';
import { TodoStoreProvider } from '../store/TodoStore';
import TasksPage from '../pages/TasksPage';
import TagsPage from '../pages/TagsPage';

let globalsRegistered = false;
beforeEach(() => {
  if (!globalsRegistered) {
    registerGlobalTools(queries, navigation);
    globalsRegistered = true;
  }
});

function flush() {
  return new Promise<void>(resolve => setTimeout(resolve, 300));
}

describe('DebugPanel', () => {
  it('lists every global query + navigate tool inside the global scope group', async () => {
    render(<DebugPanel open onToggle={() => undefined} />);
    await act(async () => { await flush(); });

    // Global queries + navigate are exposed under their real method names.
    expect(screen.getByText('listTasks')).toBeInTheDocument();
    expect(screen.getByText('searchTasks')).toBeInTheDocument();
    expect(screen.getByText('listProjects')).toBeInTheDocument();
    expect(screen.getByText('listTags')).toBeInTheDocument();
    expect(screen.getByText('getStats')).toBeInTheDocument();
    expect(screen.getByText('navigate')).toBeInTheDocument();

    // They all live in the global-scope group section.
    const globalList = screen.getByTestId('debug-tool-list-global');
    const globalNames = Array.from(
      globalList.querySelectorAll('code.debug-item__name'),
    ).map(n => n.textContent ?? '');
    expect(globalNames).toEqual(expect.arrayContaining([
      'listTasks',
      'searchTasks',
      'navigate',
      'getStats',
    ]));

    // Old prefixed names are gone for good.
    expect(screen.queryByText('global_create_task')).not.toBeInTheDocument();
    expect(screen.queryByText('global_search_tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('global_navigate')).not.toBeInTheDocument();
  });

  it('reacts to page + component tool changes when the route mounts', async () => {
    function Harness({ path }: { path: string }) {
      return (
        <>
          <TodoStoreProvider>
            <MemoryRouter key={path} initialEntries={[path]}>
              <Routes>
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tags" element={<TagsPage />} />
              </Routes>
            </MemoryRouter>
          </TodoStoreProvider>
          <DebugPanel open onToggle={() => undefined} />
        </>
      );
    }

    const { rerender } = render(<Harness path="/tasks" />);
    await act(async () => { await flush(); });

    // Tasks page exposes its own mutation surface + UI tools by their real names.
    expect(screen.getByText('createTask')).toBeInTheDocument();
    expect(screen.getByText('updateTask')).toBeInTheDocument();
    expect(screen.getByText('deleteTask')).toBeInTheDocument();
    expect(screen.getByText('openTaskCreator')).toBeInTheDocument();
    // The new sort tool is registered alongside the rest of the tasks-page surface.
    expect(screen.getByText('setTaskSort')).toBeInTheDocument();
    expect(screen.getByText('resetTaskSort')).toBeInTheDocument();
    // SearchBar + FilterPanel components mount inside the page and contribute their tools.
    expect(screen.getByText('setSearchQuery')).toBeInTheDocument();
    expect(screen.getByText('applyFilters')).toBeInTheDocument();
    // Tag mutations only belong to the tags page.
    expect(screen.queryByText('createTag')).not.toBeInTheDocument();

    rerender(<Harness path="/tags" />);
    await act(async () => { await flush(); });

    expect(screen.getByText('createTag')).toBeInTheDocument();
    expect(screen.getByText('updateTag')).toBeInTheDocument();
    expect(screen.getByText('deleteTag')).toBeInTheDocument();
    // Tasks-page-only tools must disappear after navigating away.
    expect(screen.queryByText('updateTask')).not.toBeInTheDocument();
    expect(screen.queryByText('setSearchQuery')).not.toBeInTheDocument();
    expect(screen.queryByText('applyFilters')).not.toBeInTheDocument();
    expect(screen.queryByText('setTaskSort')).not.toBeInTheDocument();
  });

  it('splits tools into two collapsible scope groups with per-group counts', async () => {
    render(
      <>
        <TodoStoreProvider>
          <MemoryRouter initialEntries={['/tasks']}>
            <Routes>
              <Route path="/tasks" element={<TasksPage />} />
            </Routes>
          </MemoryRouter>
        </TodoStoreProvider>
        <DebugPanel open onToggle={() => undefined} />
      </>,
    );

    await act(async () => { await flush(); });

    const globalGroup = screen.getByTestId('debug-group-global');
    const localGroup = screen.getByTestId('debug-group-local');
    expect(globalGroup).toBeInTheDocument();
    expect(localGroup).toBeInTheDocument();

    const globalNames = Array.from(
      screen.getByTestId('debug-tool-list-global').querySelectorAll('code.debug-item__name'),
    ).map(n => n.textContent ?? '');
    const localNames = Array.from(
      screen.getByTestId('debug-tool-list-local').querySelectorAll('code.debug-item__name'),
    ).map(n => n.textContent ?? '');

    // Global section holds the always-on read-only queries + navigate.
    expect(globalNames).toEqual(expect.arrayContaining(['listTasks', 'navigate', 'searchTasks']));
    // Local section holds the page + component tools.
    expect(localNames).toEqual(expect.arrayContaining([
      'createTask',
      'setSearchQuery',
      'applyFilters',
      'setTaskSort',
    ]));

    // Local tools never leak into the global section and vice versa.
    expect(globalNames).not.toContain('createTask');
    expect(globalNames).not.toContain('applyFilters');
    expect(localNames).not.toContain('navigate');
    expect(localNames).not.toContain('listTasks');

    // Per-group counters reflect the size of each group.
    const globalCount = Number(
      screen.getByTestId('debug-group-count-global').textContent ?? '0',
    );
    const localCount = Number(
      screen.getByTestId('debug-group-count-local').textContent ?? '0',
    );
    expect(globalCount).toBe(globalNames.length);
    expect(localCount).toBe(localNames.length);
  });
});
