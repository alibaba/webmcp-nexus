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
import type { Shape } from './types';

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
