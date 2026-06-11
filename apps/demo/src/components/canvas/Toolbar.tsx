import type { ShapeType, TextAlign } from '../../store/types';
import type { ReorderAction } from '../../store/CanvasStore';
import ColorPicker from './ColorPicker';

interface Props {
  activeTool: ShapeType;
  onToolChange: (tool: ShapeType) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canRedo: boolean;
  onClear: () => void;
  onExport: () => void;
  textBold: boolean;
  textItalic: boolean;
  textAlign: TextAlign;
  textFontSize: number;
  onBoldChange: (v: boolean) => void;
  onItalicChange: (v: boolean) => void;
  onTextAlignChange: (v: TextAlign) => void;
  onTextFontSizeChange: (v: number) => void;
  canReorder: boolean;
  onReorder: (action: ReorderAction) => void;
}

const TOOLS: { type: ShapeType; label: string }[] = [
  { type: 'select', label: '选择' },
  { type: 'freehand', label: '画笔' },
  { type: 'line', label: '直线' },
  { type: 'rect', label: '矩形' },
  { type: 'circle', label: '圆形' },
  { type: 'ellipse', label: '椭圆' },
  { type: 'text', label: '文字' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32, 48];

export default function Toolbar({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  onUndo,
  onRedo,
  canRedo,
  onClear,
  onExport,
  textBold,
  textItalic,
  textAlign,
  textFontSize,
  onBoldChange,
  onItalicChange,
  onTextAlignChange,
  onTextFontSizeChange,
  canReorder,
  onReorder,
}: Props) {
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
              {tool.type === 'select' && <path d="M4 4l7 18 2.5-7.5L21 12z" fill="currentColor" stroke="none" />}
              {tool.type === 'freehand' && <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" stroke="none" />}
              {tool.type === 'line' && <line x1="4" y1="20" x2="20" y2="4" />}
              {tool.type === 'rect' && <rect x="3" y="3" width="18" height="18" />}
              {tool.type === 'circle' && <circle cx="12" cy="12" r="10" />}
              {tool.type === 'ellipse' && <ellipse cx="12" cy="12" rx="10" ry="6" />}
              {tool.type === 'text' && <path d="M5 4v3h5.5v12h3V7H19V4z" fill="currentColor" stroke="none" />}
            </svg>
          </button>
        ))}
      </div>

      {activeTool === 'text' && (
        <>
          <div className="canvas-toolbar__divider" />
          <div className="canvas-toolbar__group">
            <button
              type="button"
              className={`canvas-toolbar__btn ${textBold ? 'is-active' : ''}`}
              onClick={() => onBoldChange(!textBold)}
              title="加粗"
              style={{ fontWeight: 'bold', fontFamily: 'serif', fontSize: '17px', lineHeight: 1 }}
            >
              B
            </button>
            <button
              type="button"
              className={`canvas-toolbar__btn ${textItalic ? 'is-active' : ''}`}
              onClick={() => onItalicChange(!textItalic)}
              title="斜体"
              style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: '17px', lineHeight: 1 }}
            >
              I
            </button>
            <select
              className="canvas-toolbar__select"
              value={textFontSize}
              onChange={e => onTextFontSizeChange(Number(e.target.value))}
              title="字号"
              style={{ marginRight: 8 }}
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              className={`canvas-toolbar__btn ${textAlign === 'left' ? 'is-active' : ''}`}
              onClick={() => onTextAlignChange('left')}
              title="左对齐"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={`canvas-toolbar__btn ${textAlign === 'center' ? 'is-active' : ''}`}
              onClick={() => onTextAlignChange('center')}
              title="居中"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <button
              type="button"
              className={`canvas-toolbar__btn ${textAlign === 'right' ? 'is-active' : ''}`}
              onClick={() => onTextAlignChange('right')}
              title="右对齐"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="9" y1="12" x2="21" y2="12" />
                <line x1="6" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </>
      )}

      {canReorder && (
        <>
          <div className="canvas-toolbar__divider" />
          <div className="canvas-toolbar__group">
            <button type="button" className="canvas-toolbar__btn" onClick={() => onReorder('bottom')} title="置底">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="3" width="12" height="9" />
                <path d="M3 17h18M3 21h18" opacity="0.5" />
              </svg>
            </button>
            <button type="button" className="canvas-toolbar__btn" onClick={() => onReorder('backward')} title="下移一层">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="9" width="12" height="12" />
                <rect x="9" y="3" width="12" height="12" opacity="0.5" />
              </svg>
            </button>
            <button type="button" className="canvas-toolbar__btn" onClick={() => onReorder('forward')} title="上移一层">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="9" width="12" height="12" opacity="0.5" />
                <rect x="9" y="3" width="12" height="12" />
              </svg>
            </button>
            <button type="button" className="canvas-toolbar__btn" onClick={() => onReorder('top')} title="置顶">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18M3 7h18" opacity="0.5" />
                <rect x="6" y="12" width="12" height="9" />
              </svg>
            </button>
          </div>
        </>
      )}

      <div className="canvas-toolbar__divider" />

      <div className="canvas-toolbar__group">
        <ColorPicker value={activeColor} onChange={onColorChange} />
        <button type="button" className="canvas-toolbar__btn" onClick={onUndo} title="撤销">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8" />
            <path d="M7 14l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          className="canvas-toolbar__btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="重做"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10H11a5 5 0 00-5 5v0a5 5 0 005 5h5" />
            <path d="M17 14l4-4-4-4" />
          </svg>
        </button>
        <button type="button" className="canvas-toolbar__btn" onClick={onClear} title="清空">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" />
          </svg>
        </button>
        <button type="button" className="canvas-toolbar__btn" onClick={onExport} title="导出为图片">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
