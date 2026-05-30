# Demo 重构实现计划：Canvas 画板 + 简化待办

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构 apps/demo，变为 Canvas 画板（默认首页）+ 简化待办 两个 demo，展示 WebMCP 低成本接入能力。

**Architecture:** 顶部 Tab 导航（画板 | 待办），Canvas 使用图形对象列表模式管理状态（React Context），用户手绘和 Agent WebMCP 调用走统一数据路径。待办列表精简为仅保留标题/描述/优先级/状态/截止日期。

**Tech Stack:** React 19, React Router 7, Canvas 2D API, webmcp-nexus-sdk, Vite 8, 纯 CSS

---

## 文件结构总览

### 新建文件

| 文件 | 职责 |
|------|------|
| `src/store/CanvasStore.tsx` | Canvas 状态管理（shapes 列表 + CRUD 方法 + Context） |
| `src/pages/CanvasPage.tsx` | 画板页面主组件，注册 WebMCP 工具 |
| `src/components/canvas/Toolbar.tsx` | 浮动工具栏（工具选择 + 颜色 + 撤销/清空） |
| `src/components/canvas/DrawingCanvas.tsx` | 画布渲染 + 鼠标事件处理 |
| `src/components/canvas/ColorPicker.tsx` | 预设颜色选择器弹出面板 |
| `src/tools/canvas.ts` | Canvas 全局只读 WebMCP 工具（getCanvasState） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 去掉侧边栏，改顶部 Tab；路由改为 `/` (Canvas) + `/todos` |
| `src/index.css` | 删除侧边栏样式，新增顶部栏 + Canvas + 简化待办样式 |
| `src/main.tsx` | 注册 canvas 全局工具 |
| `src/store/types.ts` | 简化：移除 Project/Tag 类型，新增 Shape 类型 |
| `src/store/TodoStore.tsx` | 精简：移除 Project/Tag 相关方法 |
| `src/store/mockData.ts` | 精简模拟数据 |
| `src/pages/TasksPage.tsx` | 重命名为 TodosPage，简化 |
| `src/components/TaskCard.tsx` | 简化为行式卡片 |
| `src/components/TaskFormDialog.tsx` | 简化字段，截止日期加时分 |
| `src/tools/queries.ts` | 移除 Project/Tag 查询 |
| `src/tools/navigation.ts` | 路由路径更新 |

### 删除文件

- `src/pages/DashboardPage.tsx`
- `src/pages/ProjectsPage.tsx`
- `src/pages/ProjectDetailPage.tsx`
- `src/pages/TagsPage.tsx`
- `src/components/FilterPanel.tsx`
- `src/components/Badge.tsx`

---

## Task 1: 类型定义与 Canvas 状态管理

**Files:**
- Modify: `src/store/types.ts`
- Create: `src/store/CanvasStore.tsx`

- [ ] **Step 1: 更新 types.ts — 新增 Shape 类型，精简 Task 类型**

```ts
// src/store/types.ts — 完整替换内容

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
```

- [ ] **Step 2: 创建 CanvasStore.tsx**

```tsx
// src/store/CanvasStore.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Shape, ShapeType } from './types';

export interface CanvasStoreValue {
  shapes: Shape[];
  addShape: (shape: Omit<Shape, 'id'>) => Shape;
  removeLastShape: () => Shape | null;
  clearShapes: () => number;
  getShapes: () => Shape[];
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null);

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const idCounter = useRef(1);

  const nextId = (): string => {
    const n = idCounter.current++;
    return `shape_${Date.now().toString(36)}_${n}`;
  };

  const addShape = useCallback((shape: Omit<Shape, 'id'>): Shape => {
    const newShape: Shape = { ...shape, id: nextId() };
    setShapes(prev => [...prev, newShape]);
    return newShape;
  }, []);

  const removeLastShape = useCallback((): Shape | null => {
    let removed: Shape | null = null;
    setShapes(prev => {
      if (prev.length === 0) return prev;
      removed = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return removed;
  }, []);

  const clearShapes = useCallback((): number => {
    let count = 0;
    setShapes(prev => {
      count = prev.length;
      return [];
    });
    return count;
  }, []);

  const getShapes = useCallback((): Shape[] => {
    return shapes;
  }, [shapes]);

  const value = useMemo<CanvasStoreValue>(
    () => ({ shapes, addShape, removeLastShape, clearShapes, getShapes }),
    [shapes, addShape, removeLastShape, clearShapes, getShapes],
  );

  useEffect(() => {
    __publishCanvasRef(value);
    return () => { __publishCanvasRef(null); };
  }, [value]);

  return (
    <CanvasStoreContext.Provider value={value}>
      {children}
    </CanvasStoreContext.Provider>
  );
}

export function useCanvasStore(): CanvasStoreValue {
  const value = useContext(CanvasStoreContext);
  if (!value) throw new Error('useCanvasStore must be used within <CanvasStoreProvider>');
  return value;
}

let canvasRef: CanvasStoreValue | null = null;

export function __publishCanvasRef(value: CanvasStoreValue | null): void {
  canvasRef = value;
}

export function getCanvasRef(): CanvasStoreValue {
  if (!canvasRef) throw new Error('CanvasStore is not yet initialized');
  return canvasRef;
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `cd /Users/chaobin/opensource/webmcp-nexus/apps/demo && npx tsc --noEmit --strict src/store/CanvasStore.tsx src/store/types.ts 2>&1 | head -20`

注：此时 TodoStore 会因类型变更而报错，这是预期的，后续 Task 修复。

- [ ] **Step 4: Commit**

```bash
git add src/store/types.ts src/store/CanvasStore.tsx
git commit -m "feat(demo): add Shape types and CanvasStore state management"
```

---

## Task 2: Canvas 绘制组件（DrawingCanvas）

**Files:**
- Create: `src/components/canvas/DrawingCanvas.tsx`

- [ ] **Step 1: 创建 DrawingCanvas 组件**

该组件负责：渲染所有图形 + 处理鼠标事件生成新图形。

```tsx
// src/components/canvas/DrawingCanvas.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../store/CanvasStore';
import type { Shape, ShapeType } from '../../store/types';

interface Props {
  activeTool: ShapeType;
  activeColor: string;
  lineWidth: number;
  onTextInput: (x: number, y: number) => void;
}

function renderShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.fill || 'transparent';
  ctx.lineWidth = shape.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (shape.type) {
    case 'freehand': {
      if (!shape.points || shape.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(shape.x1!, shape.y1!);
      ctx.lineTo(shape.x2!, shape.y2!);
      ctx.stroke();
      break;
    }
    case 'rect': {
      if (shape.fill) {
        ctx.fillRect(shape.x!, shape.y!, shape.width!, shape.height!);
      }
      ctx.strokeRect(shape.x!, shape.y!, shape.width!, shape.height!);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(shape.cx!, shape.cy!, shape.radius!, 0, Math.PI * 2);
      if (shape.fill) ctx.fill();
      ctx.stroke();
      break;
    }
    case 'text': {
      ctx.font = `${shape.fontSize || 16}px Inter, sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.fillText(shape.text || '', shape.x!, shape.y!);
      break;
    }
  }
}

export default function DrawingCanvas({ activeTool, activeColor, lineWidth, onTextInput }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shapes, addShape } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    });
    observer.observe(container);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    return () => observer.disconnect();
  }, []);

  // Redraw all shapes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      renderShape(ctx, shape);
    }
  }, [shapes]);

  // Draw preview (current drawing in progress)
  useEffect(() => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Redraw existing shapes first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      renderShape(ctx, shape);
    }

    // Draw preview
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'freehand' && currentPoints.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      ctx.stroke();
    } else if (activeTool === 'line' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (activeTool === 'rect' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      const x = Math.min(startPoint.x, end.x);
      const y = Math.min(startPoint.y, end.y);
      const w = Math.abs(end.x - startPoint.x);
      const h = Math.abs(end.y - startPoint.y);
      ctx.strokeRect(x, y, w, h);
    } else if (activeTool === 'circle' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      const radius = Math.sqrt(
        Math.pow(end.x - startPoint.x, 2) + Math.pow(end.y - startPoint.y, 2),
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [isDrawing, currentPoints, startPoint, activeTool, activeColor, lineWidth, shapes]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeTool === 'text') {
        const point = getCanvasPoint(e);
        onTextInput(point.x, point.y);
        return;
      }
      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoints([point]);
    },
    [activeTool, getCanvasPoint, onTextInput],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      setCurrentPoints(prev => [...prev, point]);
    },
    [isDrawing, getCanvasPoint],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    if (activeTool === 'freehand') {
      if (currentPoints.length >= 2) {
        addShape({ type: 'freehand', color: activeColor, lineWidth, points: currentPoints });
      }
    } else if (activeTool === 'line') {
      const end = currentPoints[currentPoints.length - 1];
      if (end) {
        addShape({ type: 'line', color: activeColor, lineWidth, x1: startPoint.x, y1: startPoint.y, x2: end.x, y2: end.y });
      }
    } else if (activeTool === 'rect') {
      const end = currentPoints[currentPoints.length - 1];
      if (end) {
        const x = Math.min(startPoint.x, end.x);
        const y = Math.min(startPoint.y, end.y);
        const w = Math.abs(end.x - startPoint.x);
        const h = Math.abs(end.y - startPoint.y);
        if (w > 1 && h > 1) {
          addShape({ type: 'rect', color: activeColor, lineWidth, x, y, width: w, height: h });
        }
      }
    } else if (activeTool === 'circle') {
      const end = currentPoints[currentPoints.length - 1];
      if (end) {
        const radius = Math.sqrt(
          Math.pow(end.x - startPoint.x, 2) + Math.pow(end.y - startPoint.y, 2),
        );
        if (radius > 1) {
          addShape({ type: 'circle', color: activeColor, lineWidth, cx: startPoint.x, cy: startPoint.y, radius });
        }
      }
    }

    setCurrentPoints([]);
    setStartPoint(null);
  }, [isDrawing, startPoint, activeTool, activeColor, lineWidth, currentPoints, addShape]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/canvas/DrawingCanvas.tsx
git commit -m "feat(demo): add DrawingCanvas component with freehand/line/rect/circle/text"
```

---

## Task 3: 工具栏与颜色选择器

**Files:**
- Create: `src/components/canvas/Toolbar.tsx`
- Create: `src/components/canvas/ColorPicker.tsx`

- [ ] **Step 1: 创建 ColorPicker 组件**

```tsx
// src/components/canvas/ColorPicker.tsx
import { useState } from 'react';

const PRESET_COLORS = [
  '#1a1a1a', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#0ea5e9', '#7c3aed', '#db2777',
  '#64748b', '#8b5cf6', '#06b6d4', '#84cc16',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="color-picker">
      <button
        type="button"
        className="color-picker__trigger"
        style={{ backgroundColor: value }}
        onClick={() => setOpen(v => !v)}
        title="选择颜色"
      />
      {open && (
        <div className="color-picker__panel">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-picker__swatch ${color === value ? 'is-active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => { onChange(color); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 Toolbar 组件**

```tsx
// src/components/canvas/Toolbar.tsx
import type { ShapeType } from '../../store/types';
import ColorPicker from './ColorPicker';

interface Props {
  activeTool: ShapeType;
  onToolChange: (tool: ShapeType) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
}

const TOOLS: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'freehand', label: '画笔', icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' },
  { type: 'line', label: '直线', icon: 'M4 20L20 4' },
  { type: 'rect', label: '矩形', icon: 'M3 3h18v18H3z' },
  { type: 'circle', label: '圆形', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z' },
  { type: 'text', label: '文字', icon: 'M5 4v3h5.5v12h3V7H19V4z' },
];

export default function Toolbar({ activeTool, onToolChange, activeColor, onColorChange, onUndo, onClear }: Props) {
  return (
    <div className="canvas-toolbar">
      <div className="canvas-toolbar__group">
        {TOOLS.map(tool => (
          <button
            key={tool.type}
            type="button"
            className={`canvas-toolbar__btn ${activeTool === tool.type ? 'is-active' : ''}`}
            onClick={() => onToolChange(tool.type)}
            title={tool.label}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {tool.type === 'line' ? (
                <path d={tool.icon} />
              ) : tool.type === 'rect' ? (
                <rect x="3" y="3" width="18" height="18" rx="2" fill="none" />
              ) : tool.type === 'circle' ? (
                <circle cx="12" cy="12" r="10" fill="none" />
              ) : (
                <path d={tool.icon} fill="currentColor" stroke="none" />
              )}
            </svg>
          </button>
        ))}
      </div>

      <div className="canvas-toolbar__divider" />

      <div className="canvas-toolbar__group">
        <button type="button" className="canvas-toolbar__btn" onClick={onUndo} title="撤销">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8" />
            <path d="M7 14l-4-4 4-4" />
          </svg>
        </button>
        <button type="button" className="canvas-toolbar__btn" onClick={onClear} title="清空">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" />
          </svg>
        </button>
      </div>

      <div className="canvas-toolbar__divider" />

      <ColorPicker value={activeColor} onChange={onColorChange} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/Toolbar.tsx src/components/canvas/ColorPicker.tsx
git commit -m "feat(demo): add canvas Toolbar and ColorPicker components"
```

---

## Task 4: Canvas 页面组件 + WebMCP 工具注册

**Files:**
- Create: `src/pages/CanvasPage.tsx`
- Create: `src/tools/canvas.ts`

- [ ] **Step 1: 创建 CanvasPage**

```tsx
// src/pages/CanvasPage.tsx
import { useCallback, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useCanvasStore } from '../store/CanvasStore';
import type { ShapeType } from '../store/types';
import Toolbar from '../components/canvas/Toolbar';
import DrawingCanvas from '../components/canvas/DrawingCanvas';

export default function CanvasPage() {
  const { addShape, removeLastShape, clearShapes, getShapes } = useCanvasStore();
  const [activeTool, setActiveTool] = useState<ShapeType>('freehand');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [lineWidth] = useState(2);
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);

  const handleTextInput = useCallback((x: number, y: number) => {
    setTextInput({ x, y });
  }, []);

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (textInput && text.trim()) {
        addShape({ type: 'text', color: activeColor, lineWidth: 1, x: textInput.x, y: textInput.y, text, fontSize: 16 });
      }
      setTextInput(null);
    },
    [textInput, activeColor, addShape],
  );

  /**
   * [作用域：画板页] 在画布上绘制一条自由线条。
   */
  const drawFreehand = useCallback(
    async (params: {
      /** 点坐标数组 [{x, y}, ...] */
      points: { x: number; y: number }[];
      /** 颜色（默认 #1a1a1a） */
      color?: string;
      /** 线宽（默认 2） */
      lineWidth?: number;
    }) => {
      const shape = addShape({
        type: 'freehand',
        color: params.color ?? '#1a1a1a',
        lineWidth: params.lineWidth ?? 2,
        points: params.points,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 在画布上绘制一条直线。
   */
  const drawLine = useCallback(
    async (params: {
      /** 起点 X 坐标 */
      x1: number;
      /** 起点 Y 坐标 */
      y1: number;
      /** 终点 X 坐标 */
      x2: number;
      /** 终点 Y 坐标 */
      y2: number;
      /** 颜色（默认 #1a1a1a） */
      color?: string;
      /** 线宽（默认 2） */
      lineWidth?: number;
    }) => {
      const shape = addShape({
        type: 'line',
        color: params.color ?? '#1a1a1a',
        lineWidth: params.lineWidth ?? 2,
        x1: params.x1,
        y1: params.y1,
        x2: params.x2,
        y2: params.y2,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 在画布上绘制一个矩形。
   */
  const drawRect = useCallback(
    async (params: {
      /** 左上角 X 坐标 */
      x: number;
      /** 左上角 Y 坐标 */
      y: number;
      /** 宽度 */
      width: number;
      /** 高度 */
      height: number;
      /** 描边颜色（默认 #1a1a1a） */
      color?: string;
      /** 填充颜色（不传则不填充） */
      fill?: string;
      /** 线宽（默认 2） */
      lineWidth?: number;
    }) => {
      const shape = addShape({
        type: 'rect',
        color: params.color ?? '#1a1a1a',
        lineWidth: params.lineWidth ?? 2,
        x: params.x,
        y: params.y,
        width: params.width,
        height: params.height,
        fill: params.fill ?? null,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 在画布上绘制一个圆形。
   */
  const drawCircle = useCallback(
    async (params: {
      /** 圆心 X 坐标 */
      cx: number;
      /** 圆心 Y 坐标 */
      cy: number;
      /** 半径 */
      radius: number;
      /** 描边颜色（默认 #1a1a1a） */
      color?: string;
      /** 填充颜色（不传则不填充） */
      fill?: string;
      /** 线宽（默认 2） */
      lineWidth?: number;
    }) => {
      const shape = addShape({
        type: 'circle',
        color: params.color ?? '#1a1a1a',
        lineWidth: params.lineWidth ?? 2,
        cx: params.cx,
        cy: params.cy,
        radius: params.radius,
        fill: params.fill ?? null,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 在画布上绘制文字。
   */
  const drawText = useCallback(
    async (params: {
      /** 文字左下角 X 坐标 */
      x: number;
      /** 文字左下角 Y 坐标 */
      y: number;
      /** 文字内容 */
      text: string;
      /** 颜色（默认 #1a1a1a） */
      color?: string;
      /** 字号（默认 16） */
      fontSize?: number;
    }) => {
      const shape = addShape({
        type: 'text',
        color: params.color ?? '#1a1a1a',
        lineWidth: 1,
        x: params.x,
        y: params.y,
        text: params.text,
        fontSize: params.fontSize ?? 16,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 撤销最后一个图形。
   */
  const undo = useCallback(async () => {
    const removed = removeLastShape();
    return { success: !!removed, removedId: removed?.id ?? null };
  }, [removeLastShape]);

  /**
   * [作用域：画板页] 清空画布上所有图形。
   */
  const clearCanvas = useCallback(async () => {
    const count = clearShapes();
    return { success: true, clearedCount: count };
  }, [clearShapes]);

  /**
   * [作用域：画板页] 获取当前画布上的所有图形列表。
   * @readonly
   */
  const getCanvasShapes = useCallback(async () => {
    return { shapes: getShapes() };
  }, [getShapes]);

  useWebMcpTools({
    drawFreehand,
    drawLine,
    drawRect,
    drawCircle,
    drawText,
    undo,
    clearCanvas,
    getCanvasShapes,
  });

  return (
    <section className="page page--canvas">
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onUndo={() => removeLastShape()}
        onClear={() => clearShapes()}
      />
      <DrawingCanvas
        activeTool={activeTool}
        activeColor={activeColor}
        lineWidth={lineWidth}
        onTextInput={handleTextInput}
      />
      {textInput && (
        <div className="text-input-overlay" style={{ left: textInput.x, top: textInput.y }}>
          <input
            autoFocus
            className="text-input-field"
            placeholder="输入文字..."
            onKeyDown={e => {
              if (e.key === 'Enter') handleTextSubmit((e.target as HTMLInputElement).value);
              if (e.key === 'Escape') setTextInput(null);
            }}
            onBlur={e => handleTextSubmit(e.target.value)}
          />
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: 创建全局 canvas 工具（只读查询）**

```ts
// src/tools/canvas.ts
import { getCanvasRef } from '../store/CanvasStore';

/**
 * [作用域：全局] 获取当前画布尺寸信息和图形数量（用于 Agent 了解画布状态）。
 * @readonly
 */
export async function getCanvasInfo(_params: Record<string, never>): Promise<{
  shapeCount: number;
  shapes: Array<{ id: string; type: string }>;
}> {
  const store = getCanvasRef();
  const shapes = store.getShapes();
  return {
    shapeCount: shapes.length,
    shapes: shapes.map(s => ({ id: s.id, type: s.type })),
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CanvasPage.tsx src/tools/canvas.ts
git commit -m "feat(demo): add CanvasPage with WebMCP tools (draw/undo/clear/query)"
```

---

## Task 5: 简化 TodoStore 和待办页面

**Files:**
- Modify: `src/store/TodoStore.tsx`
- Modify: `src/store/mockData.ts`
- Modify: `src/pages/TasksPage.tsx` → 重命名为概念上的 TodosPage

- [ ] **Step 1: 精简 mockData.ts**

```ts
// src/store/mockData.ts — 完整替换
import type { Todo } from './types';

export const initialTodos: Todo[] = [
  {
    id: 'todo_1',
    title: '完成 Canvas 画板 WebMCP 集成',
    description: '实现基础绘制工具并通过 WebMCP 暴露给 AI Agent',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-06-05T18:00',
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'todo_2',
    title: '优化移动端响应式布局',
    description: '确保画板和待办列表在手机上可用',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-06-10T12:00',
    createdAt: '2026-05-28T11:00:00Z',
  },
  {
    id: 'todo_3',
    title: '编写单元测试',
    description: 'Canvas 状态管理的核心方法单测',
    priority: 'medium',
    status: 'done',
    dueDate: '2026-05-30T17:00',
    createdAt: '2026-05-25T09:00:00Z',
  },
  {
    id: 'todo_4',
    title: '更新项目文档',
    description: '补充 WebMCP 工具列表和使用说明',
    priority: 'low',
    status: 'todo',
    dueDate: null,
    createdAt: '2026-05-29T14:00:00Z',
  },
  {
    id: 'todo_5',
    title: '部署到测试环境',
    description: '验证构建产物和 WebMCP schema 注入',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-06-02T10:00',
    createdAt: '2026-05-30T08:00:00Z',
  },
];
```

- [ ] **Step 2: 重写 TodoStore（精简版）**

```tsx
// src/store/TodoStore.tsx — 完整替换
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { initialTodos } from './mockData';
import type { Priority, Todo, TodoStatus } from './types';
import { PRIORITY_ORDER } from './types';

export interface CreateTodoInput {
  /** 待办标题 */
  title: string;
  /** 待办描述 */
  description?: string;
  /** 优先级 */
  priority?: Priority;
  /** 初始状态 */
  status?: TodoStatus;
  /** 截止时间 YYYY-MM-DDTHH:mm */
  dueDate?: string | null;
}

export interface UpdateTodoInput {
  /** 待办 ID */
  id: string;
  /** 新标题 */
  title?: string;
  /** 新描述 */
  description?: string;
  /** 新优先级 */
  priority?: Priority;
  /** 新状态 */
  status?: TodoStatus;
  /** 新截止时间 YYYY-MM-DDTHH:mm，传 null 清除 */
  dueDate?: string | null;
}

export interface TodoStoreValue {
  todos: Todo[];
  createTodo: (input: CreateTodoInput) => Todo;
  updateTodo: (input: UpdateTodoInput) => Todo | null;
  deleteTodo: (input: { id: string }) => boolean;
  setTodoStatus: (input: { id: string; status: TodoStatus }) => Todo | null;
  setTodoPriority: (input: { id: string; priority: Priority }) => Todo | null;
  setTodoDueDate: (input: { id: string; dueDate: string | null }) => Todo | null;
  filterTodos: (input: { search: string }) => Todo[];
  getTodoById: (input: { id: string }) => Todo | null;
}

const TodoStoreContext = createContext<TodoStoreValue | null>(null);

export function TodoStoreProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const idCounter = useRef(100);

  const nextId = (): string => {
    const n = idCounter.current++;
    return `todo_${Date.now().toString(36)}_${n}`;
  };

  /**
   * [作用域：待办页] 新建待办事项。
   */
  const createTodo = useCallback((input: CreateTodoInput): Todo => {
    const todo: Todo = {
      id: nextId(),
      title: input.title.trim() || '未命名待办',
      description: input.description ?? '',
      priority: input.priority ?? 'medium',
      status: input.status ?? 'todo',
      dueDate: input.dueDate ?? null,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [todo, ...prev]);
    return todo;
  }, []);

  /**
   * [作用域：待办页] 更新待办事项。
   */
  const updateTodo = useCallback((input: UpdateTodoInput): Todo | null => {
    const { id, ...patch } = input;
    let updated: Todo | null = null;
    setTodos(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        updated = { ...t, ...patch, id: t.id, createdAt: t.createdAt };
        return updated;
      }),
    );
    return updated;
  }, []);

  /**
   * [作用域：待办页] 删除待办事项。
   */
  const deleteTodo = useCallback((input: { id: string }): boolean => {
    let existed = false;
    setTodos(prev => {
      existed = prev.some(t => t.id === input.id);
      return prev.filter(t => t.id !== input.id);
    });
    return existed;
  }, []);

  /**
   * [作用域：待办页] 设置待办状态。
   */
  const setTodoStatus = useCallback(
    (input: { id: string; status: TodoStatus }): Todo | null =>
      updateTodo({ id: input.id, status: input.status }),
    [updateTodo],
  );

  /**
   * [作用域：待办页] 设置待办优先级。
   */
  const setTodoPriority = useCallback(
    (input: { id: string; priority: Priority }): Todo | null =>
      updateTodo({ id: input.id, priority: input.priority }),
    [updateTodo],
  );

  /**
   * [作用域：待办页] 设置截止时间。
   */
  const setTodoDueDate = useCallback(
    (input: { id: string; dueDate: string | null }): Todo | null =>
      updateTodo({ id: input.id, dueDate: input.dueDate }),
    [updateTodo],
  );

  const filterTodos = useCallback(
    (input: { search: string }): Todo[] => {
      const q = input.search.trim().toLowerCase();
      return todos
        .filter(t => {
          if (q) {
            const hay = (t.title + ' ' + t.description).toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const ap = PRIORITY_ORDER[a.priority];
          const bp = PRIORITY_ORDER[b.priority];
          if (ap !== bp) return ap - bp;
          const ad = a.dueDate ?? '9999-99-99';
          const bd = b.dueDate ?? '9999-99-99';
          return ad.localeCompare(bd);
        });
    },
    [todos],
  );

  const getTodoById = useCallback(
    (input: { id: string }): Todo | null => todos.find(t => t.id === input.id) ?? null,
    [todos],
  );

  const value = useMemo<TodoStoreValue>(
    () => ({ todos, createTodo, updateTodo, deleteTodo, setTodoStatus, setTodoPriority, setTodoDueDate, filterTodos, getTodoById }),
    [todos, createTodo, updateTodo, deleteTodo, setTodoStatus, setTodoPriority, setTodoDueDate, filterTodos, getTodoById],
  );

  useEffect(() => {
    __publishStoreRef(value);
    return () => { __publishStoreRef(null); };
  }, [value]);

  return <TodoStoreContext.Provider value={value}>{children}</TodoStoreContext.Provider>;
}

export function useTodoStore(): TodoStoreValue {
  const value = useContext(TodoStoreContext);
  if (!value) throw new Error('useTodoStore must be used within <TodoStoreProvider>');
  return value;
}

let storeRef: TodoStoreValue | null = null;

export function __publishStoreRef(value: TodoStoreValue | null): void {
  storeRef = value;
}

export function getStoreRef(): TodoStoreValue {
  if (!storeRef) throw new Error('TodoStore is not yet initialized');
  return storeRef;
}
```

- [ ] **Step 3: 重写 TodosPage（原 TasksPage）**

```tsx
// src/pages/TodosPage.tsx（新文件，后续删除 TasksPage.tsx）
import { useCallback, useMemo, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useTodoStore } from '../store/TodoStore';
import type { Todo } from '../store/types';
import { PRIORITY_LABEL, STATUS_LABEL } from '../store/types';
import SearchBar from '../components/SearchBar';
import TodoFormDialog from '../components/TodoFormDialog';

export default function TodosPage() {
  const { filterTodos, createTodo, updateTodo, deleteTodo, setTodoStatus, setTodoPriority, setTodoDueDate } = useTodoStore();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);

  const todos = useMemo(() => filterTodos({ search }), [filterTodos, search]);

  /**
   * [作用域：待办页] 打开新建待办弹窗。
   */
  const openTodoCreator = useCallback(async () => {
    setCreating(true);
    return { opened: true };
  }, []);

  /**
   * [作用域：待办页] 关闭待办弹窗。
   */
  const closeTodoDialog = useCallback(async () => {
    setCreating(false);
    setEditing(null);
    return { closed: true };
  }, []);

  useWebMcpTools({
    createTodo,
    updateTodo,
    deleteTodo,
    setTodoStatus,
    setTodoPriority,
    setTodoDueDate,
    openTodoCreator,
    closeTodoDialog,
  });

  const toggleStatus = (todo: Todo) => {
    const next = todo.status === 'done' ? 'todo' : 'done';
    setTodoStatus({ id: todo.id, status: next });
  };

  const formatDueDate = (d: string | null) => {
    if (!d) return null;
    return d.replace('T', ' ');
  };

  return (
    <section className="page page--todos">
      <header className="page__head">
        <div>
          <h1 className="page__title">待办事项</h1>
          <p className="page__subtitle">共 {todos.length} 项</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setCreating(true)}>
          + 新建
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.status === 'done' ? 'is-done' : ''}`} onClick={() => setEditing(todo)}>
            <button
              type="button"
              className={`todo-item__checkbox ${todo.status === 'done' ? 'is-checked' : ''}`}
              onClick={e => { e.stopPropagation(); toggleStatus(todo); }}
            />
            <div className="todo-item__content">
              <span className="todo-item__title">{todo.title}</span>
              {todo.dueDate && (
                <span className="todo-item__due">{formatDueDate(todo.dueDate)}</span>
              )}
            </div>
            <span className={`todo-item__priority priority--${todo.priority}`}>
              {PRIORITY_LABEL[todo.priority]}
            </span>
          </div>
        ))}
        {todos.length === 0 && (
          <p className="todo-list__empty">没有待办事项。点击「+ 新建」添加一条。</p>
        )}
      </div>

      <TodoFormDialog
        open={creating || !!editing}
        editingTodo={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/store/mockData.ts src/store/TodoStore.tsx src/pages/TodosPage.tsx
git commit -m "feat(demo): simplify TodoStore and create TodosPage (remove projects/tags)"
```

---

## Task 6: 简化 TodoFormDialog 组件

**Files:**
- Create: `src/components/TodoFormDialog.tsx`（替换现有 TaskFormDialog）

- [ ] **Step 1: 创建简化版 TodoFormDialog**

```tsx
// src/components/TodoFormDialog.tsx
import { useEffect, useState } from 'react';
import { useTodoStore } from '../store/TodoStore';
import type { Priority, Todo, TodoStatus } from '../store/types';

interface Props {
  open: boolean;
  editingTodo: Todo | null;
  onClose: () => void;
}

export default function TodoFormDialog({ open, editingTodo, onClose }: Props) {
  const { createTodo, updateTodo, deleteTodo } = useTodoStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setPriority(editingTodo.priority);
      setStatus(editingTodo.status);
      setDueDate(editingTodo.dueDate ?? '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
    }
  }, [editingTodo, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTodo) {
      updateTodo({ id: editingTodo.id, title, description, priority, status, dueDate: dueDate || null });
    } else {
      createTodo({ title, description, priority, status, dueDate: dueDate || null });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingTodo) {
      deleteTodo({ id: editingTodo.id });
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <form className="dialog" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="dialog__title">{editingTodo ? '编辑待办' : '新建待办'}</h2>

        <label className="field">
          <span className="field__label">标题</span>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="待办标题" required />
        </label>

        <label className="field">
          <span className="field__label">描述</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="详细描述（可选）" rows={3} />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">优先级</span>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">状态</span>
            <select value={status} onChange={e => setStatus(e.target.value as TodoStatus)}>
              <option value="todo">待办</option>
              <option value="in_progress">进行中</option>
              <option value="done">已完成</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">截止时间</span>
          <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </label>

        <div className="dialog__actions">
          {editingTodo && (
            <button type="button" className="danger-btn" onClick={handleDelete}>删除</button>
          )}
          <div className="dialog__actions-right">
            <button type="button" className="secondary-btn" onClick={onClose}>取消</button>
            <button type="submit" className="primary-btn">{editingTodo ? '保存' : '创建'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TodoFormDialog.tsx
git commit -m "feat(demo): add simplified TodoFormDialog with datetime-local picker"
```

---

## Task 7: 重写 App.tsx（顶部 Tab + 新路由）

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 重写 App.tsx**

```tsx
// src/App.tsx — 完整替换
import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router';
import { TodoStoreProvider } from './store/TodoStore';
import { CanvasStoreProvider } from './store/CanvasStore';
import { publishNavigate } from './tools/navigation-bridge';
import DebugPanel from './components/DebugPanel';
import CanvasPage from './pages/CanvasPage';
import TodosPage from './pages/TodosPage';

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
      <header className="topbar">
        <div className="topbar__brand">
          <span className="brand__mark">◐</span>
          <span className="brand__name">Nexus Demo</span>
        </div>
        <nav className="topbar__nav">
          <NavLink to="/" end className={({ isActive }) => `topbar__tab ${isActive ? 'is-active' : ''}`}>
            画板
          </NavLink>
          <NavLink to="/todos" className={({ isActive }) => `topbar__tab ${isActive ? 'is-active' : ''}`}>
            待办
          </NavLink>
        </nav>
        <div className="topbar__hint">
          <kbd>⌘</kbd> + <kbd>\</kbd> 调试面板
        </div>
      </header>

      <main className="main">
        <NavigateBridge />
        <Routes>
          <Route path="/" element={<CanvasPage />} />
          <Route path="/todos" element={<TodosPage />} />
        </Routes>
      </main>

      <DebugPanel open={debugOpen} onToggle={() => setDebugOpen(v => !v)} />
    </div>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return (
    <TodoStoreProvider>
      <CanvasStoreProvider>
        <BrowserRouter basename={basename}>
          <Shell />
        </BrowserRouter>
      </CanvasStoreProvider>
    </TodoStoreProvider>
  );
}
```

- [ ] **Step 2: 更新 main.tsx 注册 canvas 全局工具**

```tsx
// src/main.tsx — 完整替换
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';
import * as navigation from './tools/navigation';
import * as canvas from './tools/canvas';
import App from './App';
import './index.css';

registerGlobalTools(queries, navigation, canvas);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat(demo): rewrite App with top tab nav (canvas + todos) and register canvas tools"
```

---

## Task 8: 精简全局查询工具

**Files:**
- Modify: `src/tools/queries.ts`
- Modify: `src/tools/navigation.ts`

- [ ] **Step 1: 重写 queries.ts（移除 project/tag 查询）**

```ts
// src/tools/queries.ts — 完整替换
import { getStoreRef } from '../store/TodoStore';
import type { Priority, Todo, TodoStatus } from '../store/types';

interface TodoDTO {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  dueDate: string | null;
  createdAt: string;
}

function toDTO(t: Todo): TodoDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    createdAt: t.createdAt,
  };
}

/**
 * [作用域：全局] 列出全部待办事项。
 * @readonly
 */
export async function listTodos(params: {
  /** 返回数量上限（默认 200） */
  limit?: number;
}): Promise<{ count: number; todos: TodoDTO[] }> {
  const all = getStoreRef().todos.map(toDTO);
  const limit = params.limit ?? 200;
  return { count: all.length, todos: all.slice(0, limit) };
}

/**
 * [作用域：全局] 根据 ID 读取单条待办详情。
 * @readonly
 */
export async function getTodo(params: {
  /** 待办 ID */
  id: string;
}): Promise<{ todo: TodoDTO | null }> {
  const t = getStoreRef().getTodoById({ id: params.id });
  return { todo: t ? toDTO(t) : null };
}

/**
 * [作用域：全局] 搜索待办事项（关键词匹配标题与描述，可叠加优先级/状态过滤）。
 * @readonly
 */
export async function searchTodos(params: {
  /** 关键词（匹配标题与描述） */
  query?: string;
  /** 优先级过滤 */
  priorities?: Priority[];
  /** 状态过滤 */
  statuses?: TodoStatus[];
  /** 返回数量上限（默认 50） */
  limit?: number;
}): Promise<{
  count: number;
  results: Array<{
    id: string;
    title: string;
    status: TodoStatus;
    priority: Priority;
    dueDate: string | null;
  }>;
}> {
  const store = getStoreRef();
  let todos = store.filterTodos({ search: params.query ?? '' });

  if (params.priorities && params.priorities.length > 0) {
    todos = todos.filter(t => params.priorities!.includes(t.priority));
  }
  if (params.statuses && params.statuses.length > 0) {
    todos = todos.filter(t => params.statuses!.includes(t.status));
  }

  const limit = params.limit ?? 50;
  return {
    count: todos.length,
    results: todos.slice(0, limit).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
  };
}
```

- [ ] **Step 2: 更新 navigation.ts 路由路径**

```ts
// src/tools/navigation.ts — 完整替换
import { navigateRef } from './navigation-bridge';

/**
 * [作用域：全局] 在应用内跳转路由（/ 画板，/todos 待办）。
 */
export async function navigate(params: {
  /** 目标路径：/ 或 /todos */
  to: string;
}): Promise<{ navigated: boolean }> {
  if (!navigateRef) return { navigated: false };
  navigateRef(params.to);
  return { navigated: true };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/tools/queries.ts src/tools/navigation.ts
git commit -m "refactor(demo): simplify global query tools (remove project/tag queries)"
```

---

## Task 9: 更新 CSS 样式

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 重写 index.css**

保留现有的 CSS 变量和基础样式，替换布局部分（删除侧边栏，新增顶部栏 + Canvas + 待办列表样式）。

具体内容较长，核心变更：
- 删除 `.sidebar` 相关所有样式
- 删除 `.page--tasks` 中排序、FilterPanel 相关样式
- 新增 `.topbar` 顶部导航栏样式
- 新增 `.page--canvas`、`.canvas-container`、`.drawing-canvas`、`.canvas-toolbar` 样式
- 新增 `.todo-list`、`.todo-item` 行式卡片样式
- 新增 `.color-picker` 弹出面板样式
- 新增 `.dialog-overlay`、`.dialog` 弹窗样式
- 修改 `.app-shell` 从 grid 三列（sidebar + main + debug）改为 两列（main + debug），顶部栏独立

关键样式片段：

```css
/* Layout — 去掉侧边栏 */
.app-shell {
  display: grid;
  grid-template-columns: 1fr 0;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  transition: grid-template-columns 240ms cubic-bezier(.32,.72,0,1);
}
.app-shell.shell--debug-open {
  grid-template-columns: 1fr 360px;
}

/* Top bar */
.topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  padding: 10px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  gap: 24px;
}
.topbar__brand { display: flex; align-items: center; gap: 10px; }
.topbar__nav { display: flex; gap: 4px; }
.topbar__tab {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-soft);
  text-decoration: none;
  transition: background 120ms, color 120ms;
}
.topbar__tab:hover { background: var(--surface-2); color: var(--text); }
.topbar__tab.is-active { background: var(--accent); color: white; }
.topbar__hint { margin-left: auto; font-size: 12px; color: var(--text-muted); }
.topbar__hint kbd {
  padding: 2px 5px; border-radius: 4px; background: var(--surface-2);
  border: 1px solid var(--border); font-size: 11px;
}

/* Canvas page */
.page--canvas { position: relative; height: 100%; display: flex; flex-direction: column; }
.canvas-container { flex: 1; margin: 12px; border-radius: var(--radius); background: white; border: 1px solid var(--border); overflow: hidden; position: relative; }
.drawing-canvas { display: block; width: 100%; height: 100%; cursor: crosshair; }

/* Canvas toolbar */
.canvas-toolbar {
  position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 2px;
  background: white; border-radius: var(--radius); padding: 6px 8px;
  box-shadow: var(--shadow-md); border: 1px solid var(--border); z-index: 10;
}
.canvas-toolbar__group { display: flex; gap: 2px; }
.canvas-toolbar__divider { width: 1px; height: 24px; background: var(--border); margin: 0 6px; }
.canvas-toolbar__btn {
  width: 34px; height: 34px; border-radius: 7px; border: none; background: transparent;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: var(--text-soft); transition: background 120ms, color 120ms;
}
.canvas-toolbar__btn:hover { background: var(--surface-2); color: var(--text); }
.canvas-toolbar__btn.is-active { background: var(--accent); color: white; }

/* Color picker */
.color-picker { position: relative; }
.color-picker__trigger {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border);
  cursor: pointer; transition: border-color 120ms;
}
.color-picker__trigger:hover { border-color: var(--accent); }
.color-picker__panel {
  position: absolute; top: 42px; right: 0; background: white;
  border-radius: var(--radius); padding: 8px; box-shadow: var(--shadow-md);
  border: 1px solid var(--border); display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
  z-index: 20;
}
.color-picker__swatch {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer;
}
.color-picker__swatch.is-active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }

/* Text input overlay */
.text-input-overlay { position: absolute; z-index: 15; }
.text-input-field {
  border: 2px solid var(--accent); border-radius: var(--radius-sm);
  padding: 4px 8px; font-size: 16px; min-width: 120px; outline: none;
}

/* Todo list page */
.page--todos { padding: 32px 48px; max-width: 720px; margin: 0 auto; }
.page__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page__title { font-size: 20px; font-weight: 600; }
.page__subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.todo-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.todo-item {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);
  cursor: pointer; transition: border-color 120ms, box-shadow 120ms;
}
.todo-item:hover { border-color: var(--accent); box-shadow: var(--shadow-xs); }
.todo-item.is-done { opacity: 0.6; }
.todo-item__checkbox {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-strong);
  background: transparent; cursor: pointer; flex-shrink: 0; position: relative;
}
.todo-item__checkbox.is-checked { border-color: var(--success); }
.todo-item__checkbox.is-checked::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 8px; height: 8px; background: var(--success); border-radius: 50%;
}
.todo-item__content { flex: 1; min-width: 0; }
.todo-item__title { font-size: 14px; font-weight: 500; display: block; }
.is-done .todo-item__title { text-decoration: line-through; color: var(--text-muted); }
.todo-item__due { font-size: 12px; color: var(--text-muted); margin-top: 2px; display: block; }
.todo-item__priority {
  padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; flex-shrink: 0;
}
.priority--urgent { background: #fee2e2; color: #dc2626; }
.priority--high { background: #fef3c7; color: #c2410c; }
.priority--medium { background: #e0f2fe; color: #0369a1; }
.priority--low { background: #f1f5f9; color: #64748b; }
.todo-list__empty { text-align: center; color: var(--text-muted); padding: 40px 0; }

/* Dialog */
.dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex;
  align-items: center; justify-content: center; z-index: 100;
}
.dialog {
  background: white; border-radius: var(--radius-lg); padding: 28px;
  width: 440px; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow-md);
}
.dialog__title { font-size: 18px; margin-bottom: 20px; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.field__label { font-size: 12px; font-weight: 500; color: var(--text-soft); }
.field-row { display: flex; gap: 12px; }
.field-row .field { flex: 1; }
.dialog__actions { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
.dialog__actions-right { display: flex; gap: 8px; margin-left: auto; }

/* Buttons */
.primary-btn {
  padding: 8px 16px; background: var(--accent); color: white; border: none;
  border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer;
}
.primary-btn:hover { background: var(--accent-strong); }
.secondary-btn {
  padding: 8px 16px; background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
  border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer;
}
.danger-btn {
  padding: 8px 16px; background: #fee2e2; color: var(--danger); border: none;
  border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "style(demo): rewrite CSS for top-tab layout, canvas, and simplified todos"
```

---

## Task 10: 删除旧文件 + 清理

**Files:**
- Delete: `src/pages/DashboardPage.tsx`
- Delete: `src/pages/ProjectsPage.tsx`
- Delete: `src/pages/ProjectDetailPage.tsx`
- Delete: `src/pages/TagsPage.tsx`
- Delete: `src/pages/TasksPage.tsx`
- Delete: `src/components/FilterPanel.tsx`
- Delete: `src/components/Badge.tsx`
- Delete: `src/components/TaskCard.tsx`
- Delete: `src/components/TaskFormDialog.tsx`

- [ ] **Step 1: 删除旧页面和组件**

```bash
rm src/pages/DashboardPage.tsx src/pages/ProjectsPage.tsx src/pages/ProjectDetailPage.tsx src/pages/TagsPage.tsx src/pages/TasksPage.tsx
rm src/components/FilterPanel.tsx src/components/Badge.tsx src/components/TaskCard.tsx src/components/TaskFormDialog.tsx
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 验证 Vite dev server 启动**

Run: `npx vite --port 3000` (手动检查 http://localhost:3000 加载正常)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(demo): remove old pages and components (dashboard/projects/tags/filter)"
```

---

## Task 11: 验证 WebMCP 工具注册 + 构建检查

**Files:** 无新建/修改

- [ ] **Step 1: 运行 Vite 构建**

Run: `npx vite build`
Expected: 构建成功，无错误

- [ ] **Step 2: 检查 WebMCP schema 注入**

Run: `grep -c "__webmcpSchema" dist/assets/*.js`
Expected: 输出非零数字（表明 schema 被注入到构建产物中）

- [ ] **Step 3: 运行 dev server 并在浏览器中验证**

Run: `npx vite --port 3000`

手动验证：
1. 打开 http://localhost:3000 → 看到画板页面，工具栏可见
2. 用画笔工具画几笔 → 线条正常渲染
3. 点击矩形/圆形工具并拖拽 → 图形正确绘制
4. 撤销按钮可工作
5. 切换到「待办」tab → 看到待办列表
6. 新建一个待办 → 弹窗正常，截止日期可选时分
7. 按 ⌘+\ → 调试面板打开，能看到已注册的 WebMCP 工具列表

- [ ] **Step 4: 最终 commit（如有修复）**

```bash
git add -A
git commit -m "fix(demo): address any issues found during verification"
```

---

## Task 12: UI 优化（使用 /frontend-design 技能）

**Files:** 可能涉及 `src/index.css`、各组件文件

- [ ] **Step 1: 调用 /frontend-design 技能对整体 UI 进行优化**

重点关注：
- 工具栏 SVG 图标视觉一致性（线宽、圆角、尺寸统一）
- 页面过渡动画
- 响应式适配（画布在小屏幕上的表现）
- 颜色选择器的视觉效果
- 待办列表的悬浮、聚焦状态
- 整体排版间距微调

- [ ] **Step 2: Commit UI 优化**

```bash
git add -A
git commit -m "style(demo): polish UI with frontend-design refinements"
```
