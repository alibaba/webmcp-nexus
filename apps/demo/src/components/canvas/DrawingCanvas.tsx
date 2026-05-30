import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../store/CanvasStore';
import type { Shape, ShapeType } from '../../store/types';

interface Props {
  activeTool: ShapeType;
  activeColor: string;
  lineWidth: number;
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
      const fontSize = shape.fontSize || 16;
      const lineHeight = fontSize * 1.4;
      ctx.font = `${fontSize}px Inter, -apple-system, "PingFang SC", system-ui, sans-serif`;
      ctx.fillStyle = shape.color;
      ctx.textBaseline = 'top';
      const lines = (shape.text || '').split('\n');
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], shape.x!, shape.y! + i * lineHeight);
      }
      break;
    }
  }
}

const HIT_TOLERANCE = 8;

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function hitTest(shape: Shape, px: number, py: number): boolean {
  switch (shape.type) {
    case 'rect':
      return px >= shape.x! && px <= shape.x! + shape.width! && py >= shape.y! && py <= shape.y! + shape.height!;
    case 'circle':
      return Math.hypot(px - shape.cx!, py - shape.cy!) <= shape.radius! + HIT_TOLERANCE;
    case 'line':
      return distToSegment(px, py, shape.x1!, shape.y1!, shape.x2!, shape.y2!) < HIT_TOLERANCE;
    case 'text': {
      const lines = (shape.text || '').split('\n');
      const maxLen = Math.max(...lines.map(l => l.length));
      const w = maxLen * (shape.fontSize ?? 16) * 0.6;
      const h = lines.length * (shape.fontSize ?? 16) * 1.4;
      return px >= shape.x! && px <= shape.x! + w && py >= shape.y! && py <= shape.y! + h;
    }
    case 'freehand': {
      if (!shape.points || shape.points.length < 2) return false;
      for (let i = 1; i < shape.points.length; i++) {
        if (distToSegment(px, py, shape.points[i - 1].x, shape.points[i - 1].y, shape.points[i].x, shape.points[i].y) < HIT_TOLERANCE) {
          return true;
        }
      }
      return false;
    }
    default:
      return false;
  }
}

function moveShape(shape: Shape, dx: number, dy: number): Partial<Omit<Shape, 'id' | 'type'>> {
  switch (shape.type) {
    case 'freehand':
      return { points: shape.points!.map(p => ({ x: p.x + dx, y: p.y + dy })) };
    case 'line':
      return { x1: shape.x1! + dx, y1: shape.y1! + dy, x2: shape.x2! + dx, y2: shape.y2! + dy };
    case 'rect':
    case 'text':
      return { x: shape.x! + dx, y: shape.y! + dy };
    case 'circle':
      return { cx: shape.cx! + dx, cy: shape.cy! + dy };
    default:
      return {};
  }
}

export default function DrawingCanvas({ activeTool, activeColor, lineWidth }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shapes, addShape, updateShape } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

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
      const isDragging = shape.id === selectedId && (dragOffset.dx !== 0 || dragOffset.dy !== 0);
      if (isDragging) {
        ctx.save();
        ctx.translate(dragOffset.dx, dragOffset.dy);
        renderShape(ctx, shape);
        ctx.restore();
      } else {
        renderShape(ctx, shape);
      }
      if (shape.id === selectedId && activeTool === 'select') {
        ctx.save();
        ctx.strokeStyle = '#2f6f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        if (isDragging) ctx.translate(dragOffset.dx, dragOffset.dy);
        switch (shape.type) {
          case 'rect':
            ctx.strokeRect(shape.x! - 4, shape.y! - 4, shape.width! + 8, shape.height! + 8);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(shape.cx!, shape.cy!, shape.radius! + 4, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'line':
            ctx.strokeRect(
              Math.min(shape.x1!, shape.x2!) - 4, Math.min(shape.y1!, shape.y2!) - 4,
              Math.abs(shape.x2! - shape.x1!) + 8, Math.abs(shape.y2! - shape.y1!) + 8,
            );
            break;
          case 'text': {
            const lines = (shape.text || '').split('\n');
            const maxLen = Math.max(...lines.map(l => l.length));
            const w = maxLen * (shape.fontSize ?? 16) * 0.6;
            const h = lines.length * (shape.fontSize ?? 16) * 1.4;
            ctx.strokeRect(shape.x! - 4, shape.y! - 4, w + 8, h + 8);
            break;
          }
          case 'freehand': {
            if (shape.points && shape.points.length > 0) {
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              for (const p of shape.points) {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
              }
              ctx.strokeRect(minX - 4, minY - 4, maxX - minX + 8, maxY - minY + 8);
            }
            break;
          }
        }
        ctx.restore();
      }
    }
  }, [shapes, selectedId, activeTool, dragOffset]);

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
    } else if (activeTool === 'text' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      const x = Math.min(startPoint.x, end.x);
      const y = Math.min(startPoint.y, end.y);
      const w = Math.abs(end.x - startPoint.x);
      const h = Math.abs(end.y - startPoint.y);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#2f6f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }, [isDrawing, currentPoints, startPoint, activeTool, activeColor, lineWidth, shapes]);

  const TEXT_FONT_SIZE = 16;
  const TEXT_PADDING = 4;

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (textInput && text.trim()) {
        addShape({ type: 'text', color: activeColor, lineWidth: 1, x: textInput.x + TEXT_PADDING, y: textInput.y + TEXT_PADDING, text, fontSize: TEXT_FONT_SIZE });
      }
      setTextInput(null);
    },
    [textInput, activeColor, addShape],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);

      if (activeTool === 'select') {
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (hitTest(shapes[i], point.x, point.y)) {
            setSelectedId(shapes[i].id);
            setDragStart(point);
            setDragOffset({ dx: 0, dy: 0 });
            return;
          }
        }
        setSelectedId(null);
        return;
      }

      if (activeTool === 'text') {
        setIsDrawing(true);
        setStartPoint(point);
        setCurrentPoints([point]);
        return;
      }

      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoints([point]);
    },
    [activeTool, getCanvasPoint, shapes],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);

      if (activeTool === 'select' && dragStart && selectedId) {
        setDragOffset({ dx: point.x - dragStart.x, dy: point.y - dragStart.y });
        return;
      }

      if (!isDrawing) return;
      setCurrentPoints(prev => [...prev, point]);
    },
    [activeTool, dragStart, selectedId, isDrawing, getCanvasPoint],
  );

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'select') {
      if (selectedId && (dragOffset.dx !== 0 || dragOffset.dy !== 0)) {
        const shape = shapes.find(s => s.id === selectedId);
        if (shape) {
          updateShape(selectedId, moveShape(shape, dragOffset.dx, dragOffset.dy));
        }
      }
      setDragStart(null);
      setDragOffset({ dx: 0, dy: 0 });
      return;
    }

    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    if (activeTool === 'text') {
      const end = currentPoints[currentPoints.length - 1];
      if (end) {
        const x = Math.min(startPoint.x, end.x);
        const y = Math.min(startPoint.y, end.y);
        const w = Math.abs(end.x - startPoint.x);
        const h = Math.abs(end.y - startPoint.y);
        if (w > 10 && h > 10) {
          setTextInput({ x, y, width: w, height: h });
        }
      }
      setCurrentPoints([]);
      setStartPoint(null);
      return;
    }

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
  }, [activeTool, selectedId, dragOffset, shapes, updateShape, isDrawing, startPoint, activeColor, lineWidth, currentPoints, addShape]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        style={{ cursor: activeTool === 'select' ? (dragStart ? 'grabbing' : 'default') : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {textInput && (
        <div className="text-input-overlay" style={{ left: textInput.x, top: textInput.y, width: textInput.width, height: textInput.height }}>
          <textarea
            autoFocus
            className="text-input-field"
            placeholder="输入文字..."
            style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              padding: `${TEXT_PADDING}px`,
              fontSize: `${TEXT_FONT_SIZE}px`,
              lineHeight: 1.4,
              color: activeColor,
              fontFamily: 'Inter, -apple-system, "PingFang SC", system-ui, sans-serif',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit((e.target as HTMLTextAreaElement).value);
              }
              if (e.key === 'Escape') setTextInput(null);
            }}
            onBlur={e => handleTextSubmit(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
