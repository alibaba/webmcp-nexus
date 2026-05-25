export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  tagIds: string[];
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  assignee: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TaskFilters {
  search: string;
  projectId: string | null;
  tagIds: string[];
  priorities: Priority[];
  statuses: TaskStatus[];
  assignee: string | null;
  dueFrom: string | null;
  dueTo: string | null;
}

export const EMPTY_FILTERS: TaskFilters = {
  search: '',
  projectId: null,
  tagIds: [],
  priorities: [],
  statuses: [],
  assignee: null,
  dueFrom: null,
  dueTo: null,
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
  archived: '已归档',
};

export type TaskSortField = 'default' | 'priority' | 'createdAt' | 'dueDate' | 'title';
export type TaskSortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: TaskSortDirection;
}

export const DEFAULT_SORT: TaskSort = { field: 'default', direction: 'asc' };

export const SORT_FIELD_LABEL: Record<TaskSortField, string> = {
  default: '默认（优先级 + 截止时间）',
  priority: '优先级',
  createdAt: '创建时间',
  dueDate: '截止时间',
  title: '标题',
};
