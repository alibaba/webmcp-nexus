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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      renderShape(ctx, shape);
    }
  }, [shapes]);

  useEffect(() => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const shape of shapes) {
      renderShape(ctx, shape);
    }
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
