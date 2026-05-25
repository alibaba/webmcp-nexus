import { useCallback } from 'react';
import { useWebMcpTools } from 'webmcp-nexus-sdk';

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

/**
 * 搜索框组件 — 仅在它挂载的页面期间注册自身的工具。
 */
export default function SearchBar({ value, onChange, placeholder }: Props) {
  /**
   * [作用域：搜索框组件] 设置当前搜索框的关键词并立即应用过滤。
   */
  const setSearchQuery = useCallback(
    async (params: {
      /** 搜索关键词 */
      query: string;
    }) => {
      onChange(params.query);
      return { applied: params.query };
    },
    [onChange],
  );

  /**
   * [作用域：搜索框组件] 清空当前搜索框。
   */
  const clearSearchQuery = useCallback(async () => {
    onChange('');
    return { cleared: true };
  }, [onChange]);

  useWebMcpTools({ setSearchQuery, clearSearchQuery });

  return (
    <div className="search-bar">
      <span className="search-bar__icon">⌕</span>
      <input
        type="search"
        className="search-bar__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? '搜索任务标题或描述…'}
        aria-label="搜索"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="清空搜索"
        >
          ×
        </button>
      )}
    </div>
  );
}
