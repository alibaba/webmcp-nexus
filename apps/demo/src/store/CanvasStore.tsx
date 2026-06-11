import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Shape } from './types';

export type ReorderAction = 'top' | 'bottom' | 'forward' | 'backward';

export interface CanvasStoreValue {
  shapes: Shape[];
  addShape: (shape: Omit<Shape, 'id'>) => Shape;
  updateShape: (id: string, patch: Partial<Omit<Shape, 'id' | 'type'>>) => void;
  removeShape: (id: string) => Shape | null;
  removeLastShape: () => Shape | null;
  clearShapes: () => number;
  getShapes: () => Shape[];
  reorderShape: (id: string, action: ReorderAction) => boolean;
  redo: () => Shape | null;
  canRedo: boolean;
}

const CanvasStoreContext = createContext<CanvasStoreValue | null>(null);

export function CanvasStoreProvider({ children }: { children: ReactNode }) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const idCounter = useRef(1);

  const nextId = (): string => {
    const n = idCounter.current++;
    return `shape_${Date.now().toString(36)}_${n}`;
  };

  const addShape = useCallback((shape: Omit<Shape, 'id'>): Shape => {
    const newShape: Shape = { ...shape, id: nextId() };
    setShapes(prev => [...prev, newShape]);
    setRedoStack([]);
    return newShape;
  }, []);

  const updateShape = useCallback((id: string, patch: Partial<Omit<Shape, 'id' | 'type'>>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setRedoStack([]);
  }, []);

  const removeShape = useCallback((id: string): Shape | null => {
    let removed: Shape | null = null;
    setShapes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      removed = prev[idx];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    setRedoStack([]);
    return removed;
  }, []);

  const removeLastShape = useCallback((): Shape | null => {
    let removed: Shape | null = null;
    setShapes(prev => {
      if (prev.length === 0) return prev;
      removed = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    if (removed) setRedoStack(prev => [...prev, removed!]);
    return removed;
  }, []);

  const redo = useCallback((): Shape | null => {
    let restored: Shape | null = null;
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      restored = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    if (restored) {
      setShapes(prev => [...prev, restored!]);
    }
    return restored;
  }, []);

  const clearShapes = useCallback((): number => {
    let count = 0;
    setShapes(prev => {
      count = prev.length;
      return [];
    });
    setRedoStack([]);
    return count;
  }, []);

  const getShapes = useCallback((): Shape[] => {
    return shapes;
  }, [shapes]);

  const reorderShape = useCallback((id: string, action: ReorderAction): boolean => {
    let ok = false;
    setShapes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const next = prev.slice();
      const [item] = next.splice(idx, 1);
      let target: number;
      switch (action) {
        case 'top':
          target = next.length;
          break;
        case 'bottom':
          target = 0;
          break;
        case 'forward':
          target = Math.min(idx + 1, next.length);
          break;
        case 'backward':
          target = Math.max(idx - 1, 0);
          break;
        default:
          return prev;
      }
      next.splice(target, 0, item);
      ok = true;
      return next;
    });
    if (ok) setRedoStack([]);
    return ok;
  }, []);

  const value = useMemo<CanvasStoreValue>(
    () => ({
      shapes,
      addShape,
      updateShape,
      removeShape,
      removeLastShape,
      clearShapes,
      getShapes,
      reorderShape,
      redo,
      canRedo: redoStack.length > 0,
    }),
    [
      shapes,
      addShape,
      updateShape,
      removeShape,
      removeLastShape,
      clearShapes,
      getShapes,
      reorderShape,
      redo,
      redoStack,
    ],
  );

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
