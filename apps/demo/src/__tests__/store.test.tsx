import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TodoStoreProvider, useTodoStore } from '../store/TodoStore';
import { EMPTY_FILTERS } from '../store/types';

function wrapper({ children }: { children: ReactNode }) {
  return <TodoStoreProvider>{children}</TodoStoreProvider>;
}

describe('TodoStore', () => {
  it('exposes seeded mock data', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    expect(result.current.projects.length).toBeGreaterThan(0);
    expect(result.current.tags.length).toBeGreaterThan(0);
    expect(result.current.tasks.length).toBeGreaterThan(0);
    // 收件箱 始终存在
    expect(result.current.projects.find(p => p.id === 'p_inbox')).toBeTruthy();
  });

  it('creates, updates, and deletes a task', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });

    let createdId = '';
    act(() => {
      const t = result.current.createTask({ title: '试一下', priority: 'high' });
      createdId = t.id;
    });
    expect(result.current.tasks.find(t => t.id === createdId)?.title).toBe('试一下');

    act(() => {
      result.current.updateTask({ id: createdId, title: '改了标题', status: 'in_progress' });
    });
    const updated = result.current.tasks.find(t => t.id === createdId);
    expect(updated?.title).toBe('改了标题');
    expect(updated?.status).toBe('in_progress');

    act(() => {
      result.current.deleteTask({ id: createdId });
    });
    expect(result.current.tasks.find(t => t.id === createdId)).toBeUndefined();
  });

  it('filters tasks by search across title and description', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    const titleHits = result.current.filterTasks({ ...EMPTY_FILTERS, search: 'SSO' });
    expect(titleHits.length).toBeGreaterThan(0);
    expect(titleHits.every(t => /sso/i.test(t.title + t.description))).toBe(true);

    const descHits = result.current.filterTasks({ ...EMPTY_FILTERS, search: 'AARRR' });
    // 'AARRR' 只出现在项目描述里，不应命中任何任务标题/描述
    // 但 'A/B' 出现在 task_2 description — 用 A/B 验证 description 搜索
    const abHits = result.current.filterTasks({ ...EMPTY_FILTERS, search: 'A/B' });
    expect(abHits.some(t => t.id === 'task_2')).toBe(true);
    expect(descHits).toBeDefined();
  });

  it('filters by project, status, priority, assignee', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });

    const platform = result.current.filterTasks({ ...EMPTY_FILTERS, projectId: 'p_platform' });
    expect(platform.length).toBeGreaterThan(0);
    expect(platform.every(t => t.projectId === 'p_platform')).toBe(true);

    const done = result.current.filterTasks({ ...EMPTY_FILTERS, statuses: ['done'] });
    expect(done.length).toBeGreaterThan(0);
    expect(done.every(t => t.status === 'done')).toBe(true);

    const urgent = result.current.filterTasks({ ...EMPTY_FILTERS, priorities: ['urgent'] });
    expect(urgent.length).toBeGreaterThan(0);
    expect(urgent.every(t => t.priority === 'urgent')).toBe(true);

    const suwan = result.current.filterTasks({ ...EMPTY_FILTERS, assignee: '苏婉' });
    expect(suwan.length).toBeGreaterThan(0);
    expect(suwan.every(t => t.assignee === '苏婉')).toBe(true);
  });

  it('filters by tagIds with AND semantics (must contain all)', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    const bugUrgent = result.current.filterTasks({
      ...EMPTY_FILTERS,
      tagIds: ['t_bug', 't_urgent'],
    });
    expect(bugUrgent.length).toBeGreaterThan(0);
    expect(bugUrgent.every(t => t.tagIds.includes('t_bug') && t.tagIds.includes('t_urgent'))).toBe(
      true,
    );
  });

  it('filters by due-date range', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    const recent = result.current.filterTasks({
      ...EMPTY_FILTERS,
      dueFrom: '2026-05-21',
      dueTo: '2026-05-28',
    });
    expect(
      recent.every(t => {
        const day = t.dueDate?.slice(0, 10);
        return !!day && day >= '2026-05-21' && day <= '2026-05-28';
      }),
    ).toBe(true);
  });

  it('sorts by priority ascending then dueDate', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    const all = result.current.filterTasks(EMPTY_FILTERS);
    const order = ['urgent', 'high', 'medium', 'low'];
    let lastIdx = -1;
    for (const t of all) {
      const idx = order.indexOf(t.priority);
      expect(idx).toBeGreaterThanOrEqual(lastIdx);
      lastIdx = Math.max(lastIdx, idx);
    }
  });

  it('createTag + deleteTag also cleans up references on tasks', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });

    let tagId = '';
    act(() => {
      const t = result.current.createTag({ name: 'qa', color: '#000' });
      tagId = t.id;
    });
    expect(result.current.tags.some(t => t.id === tagId)).toBe(true);

    // attach to a task
    const targetTask = result.current.tasks[0];
    act(() => {
      result.current.updateTask({ id: targetTask.id, tagIds: [...targetTask.tagIds, tagId] });
    });
    expect(result.current.tasks.find(t => t.id === targetTask.id)?.tagIds).toContain(tagId);

    act(() => {
      result.current.deleteTag({ id: tagId });
    });
    expect(result.current.tags.some(t => t.id === tagId)).toBe(false);
    expect(result.current.tasks.find(t => t.id === targetTask.id)?.tagIds).not.toContain(tagId);
  });

  it('updateProject patches name/description/color but keeps id', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    act(() => {
      result.current.updateProject({ id: 'p_growth', name: '新增长', color: '#000000' });
    });
    const p = result.current.projects.find(p => p.id === 'p_growth');
    expect(p?.name).toBe('新增长');
    expect(p?.color).toBe('#000000');
    expect(p?.id).toBe('p_growth');
  });

  it('updateTag patches name/color but keeps id', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    act(() => {
      result.current.updateTag({ id: 't_bug', name: 'defect', color: '#ff00ff' });
    });
    const t = result.current.tags.find(t => t.id === 't_bug');
    expect(t?.name).toBe('defect');
    expect(t?.color).toBe('#ff00ff');
    expect(t?.id).toBe('t_bug');
  });

  it('getProjectById / getTagById / getTaskById return the matching record or null', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });
    expect(result.current.getProjectById({ id: 'p_inbox' })?.name).toBe('收件箱');
    expect(result.current.getProjectById({ id: 'zzz' })).toBeNull();
    expect(result.current.getTagById({ id: 't_bug' })?.name).toBe('bug');
    expect(result.current.getTagById({ id: 'zzz' })).toBeNull();
    expect(result.current.getTaskById({ id: 'task_1' })?.title).toContain('SSO');
    expect(result.current.getTaskById({ id: 'zzz' })).toBeNull();
  });

  it('deleteProject reassigns its tasks back to p_inbox; cannot delete p_inbox', () => {
    const { result } = renderHook(() => useTodoStore(), { wrapper });

    let pid = '';
    act(() => {
      const p = result.current.createProject({ name: '临时' });
      pid = p.id;
    });
    let taskId = '';
    act(() => {
      taskId = result.current.createTask({ title: '挂在临时项目下', projectId: pid }).id;
    });

    act(() => {
      result.current.deleteProject({ id: pid });
    });
    expect(result.current.projects.some(p => p.id === pid)).toBe(false);
    expect(result.current.tasks.find(t => t.id === taskId)?.projectId).toBe('p_inbox');

    act(() => {
      const ok = result.current.deleteProject({ id: 'p_inbox' });
      expect(ok).toBe(false);
    });
    expect(result.current.projects.find(p => p.id === 'p_inbox')).toBeTruthy();
  });
});
