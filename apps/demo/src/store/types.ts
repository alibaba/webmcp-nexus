export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoStatus = 'todo' | 'in_progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  dueDate: string | null;
  createdAt: string;
}

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

export const STATUS_LABEL: Record<TodoStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
};

// Canvas types
export type ShapeType = 'freehand' | 'line' | 'rect' | 'circle' | 'text';

export interface Shape {
  id: string;
  type: ShapeType;
  color: string;
  lineWidth: number;
  points?: { x: number; y: number }[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fill?: string | null;
}
