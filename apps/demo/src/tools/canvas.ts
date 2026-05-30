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
