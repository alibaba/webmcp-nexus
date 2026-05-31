import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import type { Editor } from '@tiptap/react';

interface RichTextEditorProps {
  initialContent: Record<string, unknown>;
  onUpdate: (content: Record<string, unknown>) => void;
  onEditorReady: (editor: Editor) => void;
}

export default function RichTextEditor({ initialContent, onUpdate, onEditorReady }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '开始输入内容...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (editor) onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return <EditorContent editor={editor} className="editor-content" />;
}
