import { useEffect, useMemo, useRef, useState } from 'react';

interface ToolInfo {
  name: string;
  description: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, JsonSchemaProperty>;
    required?: string[];
  };
}

interface JsonSchemaProperty {
  type?: string | string[];
  description?: string;
  enum?: unknown[];
  default?: unknown;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
}

interface Props {
  open: boolean;
  onToggle: () => void;
}

interface InvocationState {
  running: boolean;
  result: string | null;
  error: string | null;
  ranAt: number | null;
}

type ScopeGroup = 'global' | 'local';

const GLOBAL_SCOPE_RE = /\[作用域[：:]\s*全局/;

function classifyScope(tool: ToolInfo): ScopeGroup {
  return GLOBAL_SCOPE_RE.test(tool.description) ? 'global' : 'local';
}

function readTools(): ToolInfo[] {
  if (typeof navigator === 'undefined' || !('modelContext' in navigator)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mc = (navigator as any).modelContext;
  if (!mc || typeof mc.listTools !== 'function') return [];
  try {
    const raw = mc.listTools() ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return raw.map((t: any) => ({
      name: t.name,
      description: t.description ?? '',
      inputSchema:
        typeof t.inputSchema === 'string'
          ? safeParse(t.inputSchema)
          : (t.inputSchema ?? undefined),
    }));
  } catch {
    return [];
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

function getPropType(p: JsonSchemaProperty): string {
  if (Array.isArray(p.type)) {
    return p.type.find(t => t !== 'null') ?? 'string';
  }
  return p.type ?? 'string';
}

function defaultValueForProp(p: JsonSchemaProperty): string {
  if (p.default !== undefined) {
    return typeof p.default === 'string' ? p.default : JSON.stringify(p.default);
  }
  return '';
}

async function callTool(name: string, argsJson: string): Promise<string> {
  if (typeof navigator === 'undefined') throw new Error('navigator 不可用');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mct = (navigator as any).modelContextTesting;
  if (!mct || typeof mct.executeTool !== 'function') {
    throw new Error('navigator.modelContextTesting.executeTool 不可用');
  }
  const result = await mct.executeTool(name, argsJson);
  if (result === null) return '(工具触发了页面跳转)';
  return String(result);
}

export default function DebugPanel({ open }: Props) {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeScope, setActiveScope] = useState<ScopeGroup>('global');
  const [query, setQuery] = useState('');
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [invocations, setInvocations] = useState<Record<string, InvocationState>>({});
  const [toolchangeCount, setToolchangeCount] = useState(0);
  const pendingRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpToolchange = () => {
    pendingRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setToolchangeCount(pendingRef.current);
      pendingRef.current = 0;
    }, 300);
  };

  useEffect(() => {
    const refresh = () => setTools(readTools());
    refresh();
    const mc = typeof navigator !== 'undefined' && 'modelContext' in navigator
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (navigator as any).modelContext : null;

    const onToolChange = () => { refresh(); bumpToolchange(); };

    if (mc && typeof mc.addEventListener === 'function') {
      mc.addEventListener('toolchange', onToolChange);
    }

    const timer = setInterval(refresh, 250);
    return () => {
      if (mc && typeof mc.removeEventListener === 'function') {
        mc.removeEventListener('toolchange', onToolChange);
      }
      clearInterval(timer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const grouped = useMemo(() => {
    const lower = query.toLowerCase();
    const matches = (t: ToolInfo) =>
      !query || (t.name + ' ' + t.description).toLowerCase().includes(lower);

    const global: ToolInfo[] = [];
    const local: ToolInfo[] = [];
    for (const t of tools) {
      if (!matches(t)) continue;
      (classifyScope(t) === 'global' ? global : local).push(t);
    }
    const sortByName = (a: ToolInfo, b: ToolInfo) => a.name.localeCompare(b.name);
    global.sort(sortByName);
    local.sort(sortByName);
    return { global, local };
  }, [tools, query]);

  const totals = useMemo(() => {
    let g = 0;
    let l = 0;
    for (const t of tools) {
      if (classifyScope(t) === 'global') g++;
      else l++;
    }
    return { global: g, local: l };
  }, [tools]);

  const setFieldValue = (toolName: string, field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [toolName]: { ...(prev[toolName] ?? {}), [field]: value },
    }));
  };

  const buildArgs = (tool: ToolInfo): { json: string; error?: string } => {
    const props = tool.inputSchema?.properties ?? {};
    const required = new Set(tool.inputSchema?.required ?? []);
    const values = formValues[tool.name] ?? {};
    const out: Record<string, unknown> = {};
    for (const [key, schema] of Object.entries(props)) {
      const raw = values[key];
      if (raw === undefined || raw === '') {
        if (required.has(key)) return { json: '', error: `字段 "${key}" 是必填项` };
        continue;
      }
      const type = getPropType(schema);
      try {
        if (type === 'number' || type === 'integer') {
          const n = Number(raw);
          if (Number.isNaN(n)) return { json: '', error: `"${key}" 不是合法数字` };
          out[key] = type === 'integer' ? Math.trunc(n) : n;
        } else if (type === 'boolean') {
          out[key] = raw === 'true';
        } else if (type === 'array' || type === 'object') {
          out[key] = JSON.parse(raw);
        } else {
          out[key] = raw;
        }
      } catch (e) {
        return { json: '', error: `"${key}" JSON 解析失败：${(e as Error).message}` };
      }
    }
    return { json: JSON.stringify(out) };
  };

  const execute = async (tool: ToolInfo) => {
    const { json, error } = buildArgs(tool);
    if (error) {
      setInvocations(prev => ({
        ...prev,
        [tool.name]: { running: false, result: null, error, ranAt: Date.now() },
      }));
      return;
    }
    setInvocations(prev => ({
      ...prev,
      [tool.name]: { running: true, result: null, error: null, ranAt: null },
    }));
    try {
      const result = await callTool(tool.name, json);
      setInvocations(prev => ({
        ...prev,
        [tool.name]: { running: false, result, error: null, ranAt: Date.now() },
      }));
    } catch (e) {
      setInvocations(prev => ({
        ...prev,
        [tool.name]: {
          running: false,
          result: null,
          error: (e as Error).message,
          ranAt: Date.now(),
        },
      }));
    }
  };

  const renderScope = (
    key: ScopeGroup,
    list: ToolInfo[],
  ) => {
    const isActive = activeScope === key;
    return (
      <section
        className={`debug-scope debug-scope--${key} ${isActive ? 'is-active' : ''}`}
        data-testid={`debug-group-${key}`}
        aria-hidden={!isActive}
      >
        <ul className="debug-list" data-testid={`debug-tool-list-${key}`}>
          {list.map(t => renderToolItem(t))}
        </ul>
        {list.length === 0 && (
          <p className="muted debug-scope__empty">
            {query ? '没有匹配的工具。' : '当前作用域下暂无工具。'}
          </p>
        )}
      </section>
    );
  };

  const renderTab = (key: ScopeGroup, label: string) => {
    const matched = key === 'global' ? grouped.global.length : grouped.local.length;
    const total = key === 'global' ? totals.global : totals.local;
    const showFraction = !!query && matched !== total;
    const isActive = activeScope === key;
    return (
      <button
        key={key}
        type="button"
        className={`debug-tab debug-tab--${key} ${isActive ? 'is-active' : ''}`}
        onClick={() => setActiveScope(key)}
        aria-pressed={isActive}
        aria-controls={`debug-tool-list-${key}`}
      >
        <span className="debug-tab__label">{label}</span>
        <span
          className="debug-tab__count"
          data-testid={`debug-group-count-${key}`}
          title={showFraction ? `匹配 ${matched} / 全部 ${total}` : `共 ${total} 个`}
        >
          {showFraction ? `${matched}/${total}` : total}
        </span>
      </button>
    );
  };

  const renderToolItem = (t: ToolInfo) => {
    const isOpen = !!expanded[t.name];
    const inv = invocations[t.name];
    const props = t.inputSchema?.properties ?? {};
    const required = new Set(t.inputSchema?.required ?? []);
    const values = formValues[t.name] ?? {};
    return (
      <li key={t.name} className="debug-item">
        <button
          type="button"
          className="debug-item__head"
          onClick={() => setExpanded(s => ({ ...s, [t.name]: !s[t.name] }))}
        >
          <code className="debug-item__name">{t.name}</code>
          <span className="debug-item__chev">{isOpen ? '−' : '+'}</span>
        </button>
        {t.description && <p className="debug-item__desc">{t.description}</p>}
        {isOpen && (
          <div className="debug-item__body">
            <div className="debug-item__form">
              {Object.keys(props).length === 0 ? (
                <p className="debug-item__noargs">无入参</p>
              ) : (
                Object.entries(props).map(([key, schema]) => (
                  <SchemaField
                    key={key}
                    fieldKey={key}
                    schema={schema}
                    required={required.has(key)}
                    value={values[key] ?? defaultValueForProp(schema)}
                    onChange={v => setFieldValue(t.name, key, v)}
                  />
                ))
              )}
            </div>
            <div className="debug-item__exec-row">
              <button
                type="button"
                className="primary-btn debug-item__exec"
                onClick={() => execute(t)}
                disabled={inv?.running}
              >
                {inv?.running ? '执行中…' : '执行'}
              </button>
              {inv?.ranAt && !inv.running && (
                <span className="debug-item__ts">
                  {new Date(inv.ranAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            {inv?.error && (
              <pre className="debug-item__result debug-item__result--error">
                {inv.error}
              </pre>
            )}
            {inv?.result && <pre className="debug-item__result">{inv.result}</pre>}
          </div>
        )}
      </li>
    );
  };

  const matchedCount = grouped.global.length + grouped.local.length;

  return (
    <aside className={`debug-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <header className="debug-panel__head">
        <div>
          <h3>WebMCP 工具调试</h3>
          <p className="muted">
            当前可用 <strong>{tools.length}</strong> 个工具。
          </p>
          <div className="debug-events">
            <span className="debug-events__item" title="toolchange 事件（本次操作）">
              <code>toolchange</code> <strong>{toolchangeCount}</strong>
            </span>
          </div>
        </div>
      </header>

        <div className="debug-panel__search">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="过滤工具名 / 描述…"
            aria-label="过滤调试工具列表"
          />
        </div>

        <div className="debug-tabs" role="tablist" aria-label="工具作用域">
          {renderTab('global', '全局')}
          {renderTab('local', '页面 / 组件')}
        </div>

        <div className="debug-panel__body" data-testid="debug-tool-list">
          {renderScope('global', grouped.global)}
          {renderScope('local', grouped.local)}

          {matchedCount === 0 && (
            <p className="muted debug-panel__empty">
              没有匹配的工具。试试切换页面或挂载新组件。
            </p>
          )}
        </div>
    </aside>
  );
}

interface SchemaFieldProps {
  fieldKey: string;
  schema: JsonSchemaProperty;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
}

function SchemaField({ fieldKey, schema, required, value, onChange }: SchemaFieldProps) {
  const type = getPropType(schema);
  const id = `dbg-${fieldKey}`;
  const placeholder =
    type === 'array' || type === 'object'
      ? `${type === 'array' ? '[…]' : '{…}'} JSON`
      : schema.description ?? type;

  let control: React.ReactNode;
  if (schema.enum && schema.enum.length > 0) {
    control = (
      <select id={id} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— 选择 —</option>
        {schema.enum.map(opt => {
          const s = String(opt);
          return (
            <option key={s} value={s}>
              {s}
            </option>
          );
        })}
      </select>
    );
  } else if (type === 'boolean') {
    control = (
      <select id={id} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— 选择 —</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  } else if (type === 'number' || type === 'integer') {
    control = (
      <input
        id={id}
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    );
  } else if (type === 'array' || type === 'object') {
    control = (
      <textarea
        id={id}
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    );
  } else {
    control = (
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <label className="debug-field" htmlFor={id}>
      <span className="debug-field__label">
        {fieldKey}
        {required && <em className="debug-field__req">*</em>}
        <span className="debug-field__type">{type}</span>
      </span>
      {control}
      {schema.description && !placeholder.startsWith(schema.description) && (
        <span className="debug-field__desc">{schema.description}</span>
      )}
    </label>
  );
}
