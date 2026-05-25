import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { TodoStoreProvider } from '../store/TodoStore';
import TasksPage from '../pages/TasksPage';

function renderTasksPage() {
  return render(
    <TodoStoreProvider>
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    </TodoStoreProvider>,
  );
}

describe('TasksPage filtering', () => {
  it('renders every task title from mock data on initial load', () => {
    renderTasksPage();
    expect(screen.getByText('修复登录页 SSO 跳转死循环')).toBeInTheDocument();
    expect(screen.getByText('完成新版定价页 A/B 实验')).toBeInTheDocument();
    expect(screen.getByText('官网首页 hero 视觉重做')).toBeInTheDocument();
  });

  it('narrows results by search keyword (title + description)', async () => {
    renderTasksPage();
    const user = userEvent.setup();

    const search = screen.getByLabelText('搜索');
    await user.type(search, 'SSO');

    expect(screen.getByText('修复登录页 SSO 跳转死循环')).toBeInTheDocument();
    expect(screen.queryByText('官网首页 hero 视觉重做')).not.toBeInTheDocument();
  });

  it('filters by priority chip', async () => {
    renderTasksPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '紧急' }));

    // task_1 (urgent) shows; task_3 (medium) does not
    expect(screen.getByText('修复登录页 SSO 跳转死循环')).toBeInTheDocument();
    expect(screen.queryByText('官网首页 hero 视觉重做')).not.toBeInTheDocument();
  });

  it('combines search and project filter', async () => {
    const { container } = renderTasksPage();
    const user = userEvent.setup();

    // Scope to the FilterPanel <aside>; its first <select> is the project picker.
    const panel = container.querySelector('.filter-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    const projectSelect = within(panel).getAllByRole('combobox')[0];
    await user.selectOptions(projectSelect, '增长实验');

    expect(screen.getByText('完成新版定价页 A/B 实验')).toBeInTheDocument();
    expect(screen.queryByText('修复登录页 SSO 跳转死循环')).not.toBeInTheDocument();
  });

  it('resets filters via the 重置 button', async () => {
    renderTasksPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '紧急' }));
    expect(screen.queryByText('官网首页 hero 视觉重做')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '重置' }));
    expect(screen.getByText('官网首页 hero 视觉重做')).toBeInTheDocument();
  });

  it('shows the empty-state hint when nothing matches', async () => {
    renderTasksPage();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('搜索'), 'zzz-no-such-thing-zzz');
    expect(screen.getByText(/没有匹配的任务/)).toBeInTheDocument();
  });
});
