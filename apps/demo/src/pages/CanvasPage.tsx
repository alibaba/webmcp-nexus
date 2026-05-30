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
