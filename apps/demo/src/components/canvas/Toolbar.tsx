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

const TOOLS: { type: ShapeType; label: string }[] = [
  { type: 'freehand', label: '画笔' },
  { type: 'line', label: '直线' },
  { type: 'rect', label: '矩形' },
  { type: 'circle', label: '圆形' },
  { type: 'text', label: '文字' },
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
              {tool.type === 'freehand' && <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" stroke="none" />}
              {tool.type === 'line' && <line x1="4" y1="20" x2="20" y2="4" />}
              {tool.type === 'rect' && <rect x="3" y="3" width="18" height="18" rx="2" />}
              {tool.type === 'circle' && <circle cx="12" cy="12" r="10" />}
              {tool.type === 'text' && <path d="M5 4v3h5.5v12h3V7H19V4z" fill="currentColor" stroke="none" />}
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
