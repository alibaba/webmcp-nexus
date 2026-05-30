import { useCallback, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useCanvasStore } from '../store/CanvasStore';
import type { ShapeType } from '../store/types';
import Toolbar from '../components/canvas/Toolbar';
import DrawingCanvas from '../components/canvas/DrawingCanvas';

export default function CanvasPage() {
  const { addShape, updateShape, removeShape, removeLastShape, clearShapes, getShapes } = useCanvasStore();
  const [activeTool, setActiveTool] = useState<ShapeType>('freehand');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [lineWidth] = useState(2);

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

  /**
   * [作用域：画板页] 获取当前画布尺寸信息和图形数量（用于 Agent 了解画布状态）。
   * @readonly
   */
  const getCanvasInfo = useCallback(
    async (_params: Record<string, never>) => {
      const allShapes = getShapes();
      return {
        shapeCount: allShapes.length,
        shapes: allShapes.map(s => ({ id: s.id, type: s.type })),
      };
    },
    [getShapes],
  );

  /**
   * [作用域：画板页] 删除画布上指定 ID 的图形。
   */
  const deleteShape = useCallback(
    async (params: {
      /** 要删除的图形 ID */
      id: string;
    }) => {
      const removed = removeShape(params.id);
      return { success: !!removed, removedId: removed?.id ?? null };
    },
    [removeShape],
  );

  /**
   * [作用域：画板页] 修改画布上指定图形的样式（颜色、线宽、填充、字号）。
   */
  const updateShapeStyle = useCallback(
    async (params: {
      /** 图形 ID */
      id: string;
      /** 描边/文字颜色 */
      color?: string;
      /** 线宽 */
      lineWidth?: number;
      /** 填充颜色（传 null 清除填充） */
      fill?: string | null;
      /** 字号（仅对 text 类型有效） */
      fontSize?: number;
    }) => {
      const shape = getShapes().find(s => s.id === params.id);
      if (!shape) return { success: false, error: 'shape not found' };
      const patch: Record<string, unknown> = {};
      if (params.color !== undefined) patch.color = params.color;
      if (params.lineWidth !== undefined) patch.lineWidth = params.lineWidth;
      if (params.fill !== undefined) patch.fill = params.fill;
      if (params.fontSize !== undefined && shape.type === 'text') patch.fontSize = params.fontSize;
      updateShape(params.id, patch);
      return { success: true };
    },
    [getShapes, updateShape],
  );

  /**
   * [作用域：画板页] 修改画布上已有文字图形的文本内容。
   */
  const updateText = useCallback(
    async (params: {
      /** 文字图形 ID */
      id: string;
      /** 新文本内容 */
      text: string;
    }) => {
      const shape = getShapes().find(s => s.id === params.id);
      if (!shape) return { success: false, error: 'shape not found' };
      if (shape.type !== 'text') return { success: false, error: 'shape is not a text element' };
      updateShape(params.id, { text: params.text });
      return { success: true };
    },
    [getShapes, updateShape],
  );

  /**
   * [作用域：画板页] 获取当前画布的像素尺寸（宽×高），Agent 可据此计算合理坐标。
   * @readonly
   */
  const getCanvasSize = useCallback(
    async (_params: Record<string, never>) => {
      const container = document.querySelector('.canvas-container');
      if (!container) return { width: 0, height: 0 };
      return { width: container.clientWidth, height: container.clientHeight };
    },
    [],
  );

  /**
   * [作用域：画板页] 移动画布上的一个图形。
   */
  const moveShape = useCallback(
    async (params: {
      /** 图形 ID */
      id: string;
      /** X 方向偏移量 */
      dx: number;
      /** Y 方向偏移量 */
      dy: number;
    }) => {
      const shape = getShapes().find(s => s.id === params.id);
      if (!shape) return { success: false, error: 'shape not found' };
      const patch: Record<string, unknown> = {};
      switch (shape.type) {
        case 'freehand':
          patch.points = shape.points!.map(p => ({ x: p.x + params.dx, y: p.y + params.dy }));
          break;
        case 'line':
          patch.x1 = shape.x1! + params.dx; patch.y1 = shape.y1! + params.dy;
          patch.x2 = shape.x2! + params.dx; patch.y2 = shape.y2! + params.dy;
          break;
        case 'rect': case 'text':
          patch.x = shape.x! + params.dx; patch.y = shape.y! + params.dy;
          break;
        case 'circle':
          patch.cx = shape.cx! + params.dx; patch.cy = shape.cy! + params.dy;
          break;
      }
      updateShape(params.id, patch);
      return { success: true };
    },
    [getShapes, updateShape],
  );

  useWebMcpTools({
    getCanvasInfo,
    getCanvasSize,
    getCanvasShapes,
    drawFreehand,
    drawLine,
    drawRect,
    drawCircle,
    drawText,
    moveShape,
    deleteShape,
    updateShapeStyle,
    updateText,
    undo,
    clearCanvas,
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
      />
    </section>
  );
}
