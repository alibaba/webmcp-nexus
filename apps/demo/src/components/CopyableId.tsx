import { useEffect, useRef, useState } from 'react';

interface Props {
  id: string;
  /** 用于 aria-label / tooltip 的语义前缀，例如 "Task ID" */
  label?: string;
}

export default function CopyableId({ id, label = 'ID' }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = id;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      className={`copy-id ${copied ? 'is-copied' : ''}`}
      onClick={copy}
      onMouseDown={e => e.stopPropagation()}
      title={`点击复制 ${label}：${id}`}
      aria-label={`${copied ? '已复制' : '复制'} ${label}：${id}`}
    >
      <span className="copy-id__text">{copied ? '已复制' : `#${id}`}</span>
      <span className="copy-id__icon" aria-hidden="true">
        {copied ? (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8.5l3.2 3.2L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <rect
              x="5"
              y="5"
              width="9"
              height="9"
              rx="1.6"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M11 5V3.3A1.3 1.3 0 0 0 9.7 2H3.3A1.3 1.3 0 0 0 2 3.3v6.4A1.3 1.3 0 0 0 3.3 11H5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
