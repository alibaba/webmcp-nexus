import { type ReactNode, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  SquareCode,
  Minus,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Unlink,
  Undo2,
  Redo2,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <span className="tooltip-bubble">{label}</span>}
    </span>
  );
}

function ToolbarBtn({
  icon,
  tooltip,
  isActive,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  tooltip: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip label={tooltip}>
      <button
        type="button"
        className={`editor-toolbar__btn ${isActive ? 'is-active' : ''}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={tooltip}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

const ICON_PROPS = { size: 18, strokeWidth: 1.75 } as const;

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<Bold {...ICON_PROPS} />} tooltip="加粗" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarBtn icon={<Italic {...ICON_PROPS} />} tooltip="斜体" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarBtn icon={<Underline {...ICON_PROPS} />} tooltip="下划线" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarBtn icon={<Strikethrough {...ICON_PROPS} />} tooltip="删除线" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarBtn icon={<Code {...ICON_PROPS} />} tooltip="行内代码" isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<Heading1 {...ICON_PROPS} />} tooltip="标题 1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolbarBtn icon={<Heading2 {...ICON_PROPS} />} tooltip="标题 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarBtn icon={<Heading3 {...ICON_PROPS} />} tooltip="标题 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <ToolbarBtn icon={<Pilcrow {...ICON_PROPS} />} tooltip="正文" isActive={editor.isActive('paragraph') && !editor.isActive('heading')} onClick={() => editor.chain().focus().setParagraph().run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<Quote {...ICON_PROPS} />} tooltip="引用" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarBtn icon={<SquareCode {...ICON_PROPS} />} tooltip="代码块" isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <ToolbarBtn icon={<Minus {...ICON_PROPS} />} tooltip="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<List {...ICON_PROPS} />} tooltip="无序列表" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarBtn icon={<ListOrdered {...ICON_PROPS} />} tooltip="有序列表" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<AlignLeft {...ICON_PROPS} />} tooltip="左对齐" isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarBtn icon={<AlignCenter {...ICON_PROPS} />} tooltip="居中对齐" isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarBtn icon={<AlignRight {...ICON_PROPS} />} tooltip="右对齐" isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn
          icon={<Link {...ICON_PROPS} />}
          tooltip="插入链接"
          isActive={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('输入链接 URL：');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        />
        <ToolbarBtn icon={<Unlink {...ICON_PROPS} />} tooltip="移除链接" onClick={() => editor.chain().focus().unsetLink().run()} />
      </div>

      <div className="editor-toolbar__divider" />

      <div className="editor-toolbar__group">
        <ToolbarBtn icon={<Undo2 {...ICON_PROPS} />} tooltip="撤销" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarBtn icon={<Redo2 {...ICON_PROPS} />} tooltip="重做" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
    </div>
  );
}
