import { useState } from 'react';

const PRESET_COLORS = [
  '#1a1a1a', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#0ea5e9', '#7c3aed', '#db2777',
  '#64748b', '#8b5cf6', '#06b6d4', '#84cc16',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="color-picker">
      <button
        type="button"
        className="color-picker__trigger"
        style={{ backgroundColor: value }}
        onClick={() => setOpen(v => !v)}
        title="选择颜色"
      />
      {open && (
        <div className="color-picker__panel">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-picker__swatch ${color === value ? 'is-active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => { onChange(color); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
