import { useCallback, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useCanvasStore, type ReorderAction } from '../store/CanvasStore';
import type { ShapeType, TextAlign } from '../store/types';
import Toolbar from '../components/canvas/Toolbar';
import DrawingCanvas from '../components/canvas/DrawingCanvas';

export default function CanvasPage() {
  const {
    addShape,
    updateShape,
    removeShape,
    removeLastShape,
    clearShapes,
    getShapes,
    reorderShape: reorderShapeInStore,
    redo: redoInStore,
    canRedo,
  } = useCanvasStore();
  const [activeTool, setActiveTool] = useState<ShapeType>('freehand');
  const [activeColor, setActiveColor] = useState('#1a1a1a');
  const [lineWidth] = useState(2);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlign>('left');
  const [textFontSize, setTextFontSize] = useState(16);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
   * [作用域：画板页] 在画布上绘制一个椭圆。
   */
  const drawEllipse = useCallback(
    async (params: {
      /** 中心 X 坐标 */
      cx: number;
      /** 中心 Y 坐标 */
      cy: number;
      /** 水平半轴 */
      rx: number;
      /** 垂直半轴 */
      ry: number;
      /** 描边颜色（默认 #1a1a1a） */
      color?: string;
      /** 填充颜色（不传则不填充） */
      fill?: string;
      /** 线宽（默认 2） */
      lineWidth?: number;
    }) => {
      const shape = addShape({
        type: 'ellipse',
        color: params.color ?? '#1a1a1a',
        lineWidth: params.lineWidth ?? 2,
        cx: params.cx,
        cy: params.cy,
        rx: params.rx,
        ry: params.ry,
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
      /** 是否加粗（默认 false） */
      bold?: boolean;
      /** 是否斜体（默认 false） */
      italic?: boolean;
      /** 水平对齐（默认 left） */
      align?: TextAlign;
      /** 文字框宽度，超出自动换行（默认不限制，但设了 align 为中/右时建议传入） */
      width?: number;
    }) => {
      const shape = addShape({
        type: 'text',
        color: params.color ?? '#1a1a1a',
        lineWidth: 1,
        x: params.x,
        y: params.y,
        text: params.text,
        fontSize: params.fontSize ?? 16,
        bold: params.bold ?? false,
        italic: params.italic ?? false,
        align: params.align ?? 'left',
        width: params.width,
      });
      return { id: shape.id };
    },
    [addShape],
  );

  /**
   * [作用域：画板页] 撤销最后一个图形。被撤销的图形会进入重做栈，可通过 redo 恢复。
   */
  const undo = useCallback(async () => {
    const removed = removeLastShape();
    return { success: !!removed, removedId: removed?.id ?? null };
  }, [removeLastShape]);

  /**
   * [作用域：画板页] 重做上一次被撤销的图形（仅限 undo 后未发生其它修改时有效，任何新动作都会清空重做栈）。
   */
  const redo = useCallback(async () => {
    const restored = redoInStore();
    return { success: !!restored, restoredId: restored?.id ?? null };
  }, [redoInStore]);

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
   * [作用域：画板页] 修改画布上指定图形的样式（颜色、线宽、填充、字号、加粗/斜体/对齐）。不修改几何属性（坐标/尺寸）。
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
      /** 加粗（仅对 text 类型有效） */
      bold?: boolean;
      /** 斜体（仅对 text 类型有效） */
      italic?: boolean;
      /** 对齐方式（仅对 text 类型有效） */
      align?: TextAlign;
    }) => {
      const shape = getShapes().find(s => s.id === params.id);
      if (!shape) return { success: false, error: 'shape not found' };
      const patch: Record<string, unknown> = {};
      if (params.color !== undefined) patch.color = params.color;
      if (params.lineWidth !== undefined) patch.lineWidth = params.lineWidth;
      if (params.fill !== undefined) patch.fill = params.fill;
      if (shape.type === 'text') {
        if (params.fontSize !== undefined) patch.fontSize = params.fontSize;
        if (params.bold !== undefined) patch.bold = params.bold;
        if (params.italic !== undefined) patch.italic = params.italic;
        if (params.align !== undefined) patch.align = params.align;
      }
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
   * [作用域：画板页] 获取当前画布的位图快照（base64 dataURL），供多模态 Agent 视觉理解画布内容（含用户手绘）。
   * @readonly
   */
  const getCanvasSnapshot = useCallback(
    async (params: {
      /** 输出格式（默认 png） */
      format?: 'png' | 'jpeg';
      /** 输出最大宽度（像素），超过则等比缩放，默认 1024，避免 token 爆炸 */
      maxWidth?: number;
      /** jpeg 质量 0-1，默认 0.85，仅在 format=jpeg 时生效 */
      quality?: number;
    }) => {
      const sourceCanvas = document.querySelector('.drawing-canvas') as HTMLCanvasElement | null;
      if (!sourceCanvas) {
        return { dataUrl: null, width: 0, height: 0, format: params.format ?? 'png' };
      }
      const format = params.format ?? 'png';
      const maxWidth = params.maxWidth ?? 1024;
      const quality = params.quality ?? 0.85;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = sourceCanvas.width / dpr;
      const cssHeight = sourceCanvas.height / dpr;
      const scale = cssWidth > maxWidth ? maxWidth / cssWidth : 1;
      const targetW = Math.max(1, Math.round(cssWidth * scale));
      const targetH = Math.max(1, Math.round(cssHeight * scale));

      const off = document.createElement('canvas');
      off.width = targetW;
      off.height = targetH;
      const ctx = off.getContext('2d');
      if (!ctx) return { dataUrl: null, width: 0, height: 0, format };
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, targetW, targetH);

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = format === 'jpeg' ? off.toDataURL(mime, quality) : off.toDataURL(mime);
      return { dataUrl, width: targetW, height: targetH, format };
    },
    [],
  );

  /**
   * [作用域：画板页] 将当前画布导出为图片并触发浏览器下载到本地。默认使用原始分辨率（保留 dpr 倍图）。
   */
  const exportCanvas = useCallback(
    async (params: {
      /** 导出格式（默认 png） */
      format?: 'png' | 'jpeg';
      /** 下载文件名（不包含扩展名，默认 canvas-{时间戳}） */
      filename?: string;
      /** 输出最大宽度（像素），超过则等比缩放，不传则保留原始分辨率 */
      maxWidth?: number;
      /** jpeg 质量 0-1，默认 0.92，仅在 format=jpeg 时生效 */
      quality?: number;
    }) => {
      const sourceCanvas = document.querySelector('.drawing-canvas') as HTMLCanvasElement | null;
      if (!sourceCanvas) {
        return { success: false, error: 'canvas not found' };
      }
      const format = params.format ?? 'png';
      const quality = params.quality ?? 0.92;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = sourceCanvas.width / dpr;
      const scale = params.maxWidth && cssWidth > params.maxWidth ? params.maxWidth / cssWidth : 1;
      const targetW = Math.max(1, Math.round(sourceCanvas.width * scale));
      const targetH = Math.max(1, Math.round(sourceCanvas.height * scale));

      const off = document.createElement('canvas');
      off.width = targetW;
      off.height = targetH;
      const ctx = off.getContext('2d');
      if (!ctx) return { success: false, error: 'failed to get 2d context' };
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, targetW, targetH);

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = format === 'jpeg' ? off.toDataURL(mime, quality) : off.toDataURL(mime);

      const baseName = params.filename ?? `canvas-${Date.now()}`;
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const fullName = baseName.endsWith(`.${ext}`) ? baseName : `${baseName}.${ext}`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fullName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, filename: fullName, width: targetW, height: targetH, format };
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
        case 'circle': case 'ellipse':
          patch.cx = shape.cx! + params.dx; patch.cy = shape.cy! + params.dy;
          break;
      }
      updateShape(params.id, patch);
      return { success: true };
    },
    [getShapes, updateShape],
  );

  /**
   * [作用域：画板页] 调整画布上某个图形的图层顺序（置顶/置底/上移一层/下移一层）。
   */
  const reorderShape = useCallback(
    async (params: {
      /** 图形 ID */
      id: string;
      /** 动作：top=置顶，bottom=置底，forward=上移一层，backward=下移一层 */
      action: ReorderAction;
    }) => {
      const ok = reorderShapeInStore(params.id, params.action);
      return { success: ok, error: ok ? undefined : 'shape not found' };
    },
    [reorderShapeInStore],
  );

  useWebMcpTools({
    getCanvasInfo,
    getCanvasSize,
    getCanvasShapes,
    getCanvasSnapshot,
    drawFreehand,
    drawLine,
    drawRect,
    drawCircle,
    drawEllipse,
    drawText,
    moveShape,
    deleteShape,
    updateShapeStyle,
    updateText,
    reorderShape,
    undo,
    redo,
    clearCanvas,
    exportCanvas,
  });

  return (
    <section className="page page--canvas">
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onUndo={() => removeLastShape()}
        onRedo={() => { redoInStore(); }}
        canRedo={canRedo}
        onClear={() => clearShapes()}
        onExport={() => { void exportCanvas({}); }}
        textBold={textBold}
        textItalic={textItalic}
        textAlign={textAlign}
        textFontSize={textFontSize}
        onBoldChange={setTextBold}
        onItalicChange={setTextItalic}
        onTextAlignChange={setTextAlign}
        onTextFontSizeChange={setTextFontSize}
        canReorder={activeTool === 'select' && !!selectedId}
        onReorder={(action) => { if (selectedId) reorderShapeInStore(selectedId, action); }}
      />
      <DrawingCanvas
        activeTool={activeTool}
        activeColor={activeColor}
        lineWidth={lineWidth}
        textBold={textBold}
        textItalic={textItalic}
        textAlign={textAlign}
        textFontSize={textFontSize}
        onSelectionChange={setSelectedId}
      />
    </section>
  );
}
