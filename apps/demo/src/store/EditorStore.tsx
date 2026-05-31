import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface EditorDocument {
  id: string;
  title: string;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EditorStoreValue {
  document: EditorDocument;
  setTitle: (title: string) => void;
  setContent: (content: Record<string, unknown>) => void;
  resetDocument: () => void;
}

const INITIAL_CONTENT: Record<string, unknown> = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'WebMCP Nexus 富文本编辑器' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '这是一个' },
        { type: 'text', marks: [{ type: 'bold' }], text: '富文本编辑器' },
        { type: 'text', text: ' Demo，展示 AI Agent 如何通过 ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'WebMCP' },
        { type: 'text', text: ' 工具驱动内容创作。' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '功能演示' }],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持标题、段落、引用、代码块等块级元素' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持加粗、斜体、下划线、删除线等行内格式' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持有序列表和无序列表' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持超链接和文本对齐' }] }] },
      ],
    },
    {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '人类通过工具栏编辑，AI Agent 通过 MCP 工具调用编辑——两者功能完全对等。' }] },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'useWebMcpTools({\n  insertHeading,\n  toggleFormat,\n  getDocumentContent,\n  // ...更多工具\n});' }],
    },
  ],
};

function createInitialDocument(): EditorDocument {
  return {
    id: `doc_${Date.now().toString(36)}`,
    title: '未命名文档',
    content: INITIAL_CONTENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const EditorStoreContext = createContext<EditorStoreValue | null>(null);

export function EditorStoreProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState<EditorDocument>(createInitialDocument);

  const setTitle = useCallback((title: string) => {
    setDocument(prev => ({ ...prev, title, updatedAt: new Date().toISOString() }));
  }, []);

  const setContent = useCallback((content: Record<string, unknown>) => {
    setDocument(prev => ({ ...prev, content, updatedAt: new Date().toISOString() }));
  }, []);

  const resetDocument = useCallback(() => {
    setDocument(createInitialDocument());
  }, []);

  const value = useMemo<EditorStoreValue>(
    () => ({ document, setTitle, setContent, resetDocument }),
    [document, setTitle, setContent, resetDocument],
  );

  return (
    <EditorStoreContext.Provider value={value}>
      {children}
    </EditorStoreContext.Provider>
  );
}

export function useEditorStore(): EditorStoreValue {
  const value = useContext(EditorStoreContext);
  if (!value) throw new Error('useEditorStore must be used within <EditorStoreProvider>');
  return value;
}
