import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  color?: string;
  tone?: 'solid' | 'soft' | 'outline';
  children: ReactNode;
  title?: string;
}

export default function Badge({ color = '#64748b', tone = 'soft', children, title }: BadgeProps) {
  const style: CSSProperties =
    tone === 'soft'
      ? { color, background: hexAlpha(color, 0.12), borderColor: 'transparent' }
      : tone === 'outline'
        ? { color, background: 'transparent', borderColor: hexAlpha(color, 0.3) }
        : { color: '#fff', background: color, borderColor: color };
  return (
    <span className="badge" style={style} title={title}>
      {children}
    </span>
  );
}

function hexAlpha(hex: string, a: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
