import { useCallback, useRef, useState } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';
import { useEditorStore } from '../store/EditorStore';
import type { Editor } from '@tiptap/react';
import EditorToolbar from '../components/editor/EditorToolbar';
import RichTextEditor from '../components/editor/RichTextEditor';

export default function EditorPage() {
  const { document, setTitle, setContent } = useEditorStore();
  const editorRef = useRef<Editor | null>(null);
  const [editorReady, setEditorReady] = useState(false);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  }, []);

  // ---- Query Tools ----

  /**
   * [作用域：编辑器页] 获取当前文档内容。
   * @readonly
   */
  const getDocumentContent = useCallback(
    async (params: {
      /** 输出格式：json | html | text（默认 json） */
      format?: 'json' | 'html' | 'text';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const format = params.format ?? 'json';
      switch (format) {
        case 'html':
          return { format: 'html', content: editor.getHTML() };
        case 'text':
          return { format: 'text', content: editor.getText() };
        default:
          return { format: 'json', content: editor.getJSON() };
      }
    },
    [],
  );

  /**
   * [作用域：编辑器页] 获取文档统计信息（字数、字符数等）。
   * @readonly
   */
  const getDocumentStats = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const text = editor.getText();
      const characterCount = text.length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const json = editor.getJSON();
      const paragraphCount = (json.content ?? []).filter(
        (n: Record<string, unknown>) => n.type === 'paragraph',
      ).length;
      return { characterCount, wordCount, paragraphCount, title: document.title };
    },
    [document.title],
  );

  /**
   * [作用域：编辑器页] 获取文档标题大纲（所有标题列表）。
   * @readonly
   */
  const getDocumentOutline = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const json = editor.getJSON();
      const headings: { level: number; text: string }[] = [];
      for (const node of (json.content ?? []) as Record<string, unknown>[]) {
        if (node.type === 'heading') {
          const attrs = node.attrs as { level: number } | undefined;
          const content = node.content as { type: string; text?: string }[] | undefined;
          const text = content?.map(c => c.text ?? '').join('') ?? '';
          headings.push({ level: attrs?.level ?? 1, text });
        }
      }
      return { headings };
    },
    [],
  );

  // ---- Insertion Tools ----

  /**
   * [作用域：编辑器页] 在文档末尾插入纯文本。
   */
  const insertText = useCallback(
    async (params: {
      /** 要插入的文本内容 */
      text: string;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor.chain().focus('end').insertContent(params.text).run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个标题。
   */
  const insertHeading = useCallback(
    async (params: {
      /** 标题文本 */
      text: string;
      /** 标题级别 1-6（默认 2） */
      level?: number;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const level = Math.max(1, Math.min(6, params.level ?? 2));
      editor
        .chain()
        .focus('end')
        .insertContent({
          type: 'heading',
          attrs: { level },
          content: [{ type: 'text', text: params.text }],
        })
        .run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个段落。
   */
  const insertParagraph = useCallback(
    async (params: {
      /** 段落文本 */
      text: string;
      /** 对齐方式（默认 left） */
      alignment?: 'left' | 'center' | 'right';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const attrs: Record<string, unknown> = {};
      if (params.alignment) attrs.textAlign = params.alignment;
      editor
        .chain()
        .focus('end')
        .insertContent({
          type: 'paragraph',
          attrs,
          content: [{ type: 'text', text: params.text }],
        })
        .run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个代码块。
   */
  const insertCodeBlock = useCallback(
    async (params: {
      /** 代码内容 */
      code: string;
      /** 编程语言（如 typescript、python） */
      language?: string;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor
        .chain()
        .focus('end')
        .insertContent({
          type: 'codeBlock',
          attrs: { language: params.language ?? null },
          content: [{ type: 'text', text: params.code }],
        })
        .run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个引用块。
   */
  const insertBlockquote = useCallback(
    async (params: {
      /** 引用文本 */
      text: string;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor
        .chain()
        .focus('end')
        .insertContent({
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: params.text }] },
          ],
        })
        .run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个列表。
   */
  const insertList = useCallback(
    async (params: {
      /** 列表项内容数组 */
      items: string[];
      /** 列表类型：bullet 无序 / ordered 有序（默认 bullet） */
      type?: 'bullet' | 'ordered';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const listType = params.type === 'ordered' ? 'orderedList' : 'bulletList';
      const listItems = params.items.map(text => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      }));
      editor
        .chain()
        .focus('end')
        .insertContent({ type: listType, content: listItems })
        .run();
      return { success: true, itemCount: params.items.length };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一条水平分割线。
   */
  const insertHorizontalRule = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor.chain().focus('end').setHorizontalRule().run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 在文档末尾插入一个超链接。
   */
  const insertLink = useCallback(
    async (params: {
      /** 链接显示文本 */
      text: string;
      /** 链接 URL */
      href: string;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor
        .chain()
        .focus('end')
        .insertContent({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: params.href } }],
          text: params.text,
        })
        .run();
      return { success: true };
    },
    [],
  );

  // ---- Formatting Tools ----

  /**
   * [作用域：编辑器页] 对当前选中文本切换格式（加粗/斜体/下划线/删除线/代码）。
   */
  const toggleFormat = useCallback(
    async (params: {
      /** 格式类型 */
      format: 'bold' | 'italic' | 'underline' | 'strike' | 'code';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      switch (params.format) {
        case 'bold':
          editor.chain().focus().toggleBold().run();
          break;
        case 'italic':
          editor.chain().focus().toggleItalic().run();
          break;
        case 'underline':
          editor.chain().focus().toggleUnderline().run();
          break;
        case 'strike':
          editor.chain().focus().toggleStrike().run();
          break;
        case 'code':
          editor.chain().focus().toggleCode().run();
          break;
      }
      return { success: true, active: editor.isActive(params.format) };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 设置当前块的文本对齐方式。
   */
  const setTextAlign = useCallback(
    async (params: {
      /** 对齐方式 */
      alignment: 'left' | 'center' | 'right';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor.chain().focus().setTextAlign(params.alignment).run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 将当前块转换为指定标题级别。
   */
  const setHeadingLevel = useCallback(
    async (params: {
      /** 标题级别 1-6，传 0 则转回普通段落 */
      level: number;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      if (params.level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        const level = Math.max(1, Math.min(6, params.level)) as 1 | 2 | 3 | 4 | 5 | 6;
        editor.chain().focus().toggleHeading({ level }).run();
      }
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 将当前块转换为指定类型（段落/引用/代码块）。
   */
  const setBlockType = useCallback(
    async (params: {
      /** 块类型 */
      type: 'paragraph' | 'blockquote' | 'codeBlock';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      switch (params.type) {
        case 'paragraph':
          editor.chain().focus().setParagraph().run();
          break;
        case 'blockquote':
          editor.chain().focus().toggleBlockquote().run();
          break;
        case 'codeBlock':
          editor.chain().focus().toggleCodeBlock().run();
          break;
      }
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 移除当前选中文本或光标所在位置的链接。
   */
  const removeLink = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor.chain().focus().unsetLink().run();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 将当前块切换为列表（无序或有序），再次调用可取消列表。
   */
  const toggleList = useCallback(
    async (params: {
      /** 列表类型：bullet 无序 / ordered 有序 */
      type: 'bullet' | 'ordered';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      if (params.type === 'ordered') {
        editor.chain().focus().toggleOrderedList().run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
      return { success: true };
    },
    [],
  );

  // ---- Edit Tools ----

  /**
   * [作用域：编辑器页] 查找并替换文档中的文本。
   */
  const replaceText = useCallback(
    async (params: {
      /** 要查找的文本 */
      search: string;
      /** 替换为的文本 */
      replace: string;
      /** 是否替换全部（默认只替换第一个） */
      replaceAll?: boolean;
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const html = editor.getHTML();
      let count = 0;
      let newHtml: string;
      if (params.replaceAll) {
        const parts = html.split(params.search);
        count = parts.length - 1;
        newHtml = parts.join(params.replace);
      } else {
        const idx = html.indexOf(params.search);
        if (idx !== -1) {
          newHtml = html.slice(0, idx) + params.replace + html.slice(idx + params.search.length);
          count = 1;
        } else {
          newHtml = html;
        }
      }
      if (count > 0) {
        editor.commands.setContent(newHtml);
      }
      return { success: true, replacedCount: count };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 清空文档内容。
   */
  const clearDocument = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      editor.commands.clearContent();
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 用 HTML 或 JSON 内容替换整个文档。
   */
  const setDocumentContent = useCallback(
    async (params: {
      /** 文档内容 */
      content: string;
      /** 内容格式：html 或 json（默认 html） */
      format?: 'html' | 'json';
    }) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      if (params.format === 'json') {
        editor.commands.setContent(JSON.parse(params.content));
      } else {
        editor.commands.setContent(params.content);
      }
      return { success: true };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 撤销上一步操作。
   */
  const undo = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const result = editor.commands.undo();
      return { success: result };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 重做上一步撤销的操作。
   */
  const redo = useCallback(
    async (_params: Record<string, never>) => {
      const editor = editorRef.current;
      if (!editor) return { success: false, error: 'editor not ready' };
      const result = editor.commands.redo();
      return { success: result };
    },
    [],
  );

  /**
   * [作用域：编辑器页] 设置文档标题。
   */
  const setDocumentTitle = useCallback(
    async (params: {
      /** 新标题 */
      title: string;
    }) => {
      setTitle(params.title);
      return { success: true };
    },
    [setTitle],
  );

  useWebMcpTools({
    getDocumentContent,
    getDocumentStats,
    getDocumentOutline,
    insertText,
    insertHeading,
    insertParagraph,
    insertCodeBlock,
    insertBlockquote,
    insertList,
    insertHorizontalRule,
    insertLink,
    removeLink,
    toggleFormat,
    setTextAlign,
    setHeadingLevel,
    setBlockType,
    toggleList,
    replaceText,
    clearDocument,
    setDocumentContent,
    undo,
    redo,
    setDocumentTitle,
  });

  return (
    <section className="page page--editor">
      <EditorToolbar editor={editorReady ? editorRef.current : null} />
      <RichTextEditor
        initialContent={document.content}
        onUpdate={setContent}
        onEditorReady={handleEditorReady}
      />
    </section>
  );
}
