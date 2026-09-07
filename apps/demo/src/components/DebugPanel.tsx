import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getActiveToolStates,
  getModelContext,
  getModelContextTesting,
  isModernHost,
  toWidgetToolDescriptor,
} from 'webmcp-nexus-sdk/testing';

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

/**
 * 中断形态归一：同一个"工具执行被卸载/导航中断"在两种宿主上表现不同——
 * Chrome 153+ 与 relay 返回 `null`，polyfill 5.1.0 抛 `UnknownError: Tool unregistered`。
 * 两种都要提示"副作用可能已完成"（polyfill 的 withAbortSignal 只 reject 外层 promise，
 * 内层 execute 会跑完）。
 */
const INTERRUPTED_MESSAGE = '(工具执行被卸载/导航中断——页面副作用可能已完成，但结果被丢弃)';

function isInterruptedError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return /Tool unregistered/i.test(text) || /interrupted by navigation/i.test(text);
}

/** 当前宿主面的徽章文案（升级后肉眼确认走的是规范入口） */
function describeHostSurface(): string {
  const mc = getModelContext();
  if (!mc) return '无 WebMCP 宿主';
  const viaDocument =
    typeof document !== 'undefined' && 'modelContext' in document && !!document.modelContext;
  const surface = viaDocument ? 'document.modelContext' : 'navigator.modelContext（已废弃）';
  const isPolyfill = (mc as { __isWebMCPPolyfill?: boolean }).__isWebMCPPolyfill === true;
  const generation = isModernHost(mc) ? '现代宿主' : '旧宿主';
  return `${surface} · ${generation}${isPolyfill ? ' · polyfill' : ' · 原生'}`;
}

/**
 * 读取工具列表。数据源降级链，每档独立 try/catch（整体一个 try 的话，
 * 前一档抛错后控制流已跳出，无法落到下一档）。
 */
async function readTools(): Promise<ToolInfo[]> {
  const mc = getModelContext();
  if (!mc) return [];

  // tier-1：规范面 getTools()（polyfill 5 / Chrome 149+）。relay 5.x 走的也是这一条
  if (typeof mc.getTools === 'function') {
    try {
      const registered = await mc.getTools();
      const out: ToolInfo[] = [];
      for (const tool of registered) {
        // 归一复用 SDK 的实现，不在 demo 里复制一份（两处会漂移）
        const descriptor = toWidgetToolDescriptor(tool);
        if (!descriptor) continue;
        out.push({
          name: descriptor.name,
          description: descriptor.description,
          inputSchema: descriptor.inputSchema as ToolInfo['inputSchema'],
        });
      }
      return out;
    } catch {
      // 宿主准入被拒（Permissions Policy / origin isolation）时落到下一档
    }
  }

  // tier-2：MCP-B 扩展面，或 nexus 在旧宿主档从 modelContextTesting 合成的 listTools
  if (typeof mc.listTools === 'function') {
    try {
      return (mc.listTools() ?? []).map(tool => ({
        name: tool.name,
        description: tool.description ?? '',
        inputSchema: parseSchema(tool.inputSchema),
      }));
    } catch {
      // 落到下一档
    }
  }

  // tier-3：已废弃的 testing 面。注意在原生 Chrome 150+ 不可达——polyfill 的三条早退
  // 都发生在装 shim 之前，实际兜底是空列表
  const testing = getModelContextTesting();
  if (testing && typeof testing.listTools === 'function') {
    try {
      return testing.listTools().map(tool => ({
        name: tool.name,
        description: tool.description ?? '',
        inputSchema: parseSchema(tool.inputSchema),
      }));
    } catch {
      // 落到空列表
    }
  }

  return [];
}

function parseSchema(raw: object | string | undefined): ToolInfo['inputSchema'] {
  if (typeof raw !== 'string') return (raw ?? undefined) as ToolInfo['inputSchema'];
  try {
    return JSON.parse(raw) as ToolInfo['inputSchema'];
  } catch {
    return undefined;
  }
}

/**
 * 读一份 SDK 所有权快照（name → scope）。
 *
 * 作为分类的权威来源：旧实现靠匹配 description 里的「[作用域：全局]」文本，全仓只有
 * 一个工具命中，任何 JSDoc 改写都会让分类静默变成 0/N。同步且廉价，在 useMemo 内调用。
 */
function readSdkScopes(): Map<string, string> {
  const map = new Map<string, string>();
  for (const state of getActiveToolStates()) {
    map.set(state.name, state.scope);
  }
  return map;
}

const GLOBAL_SCOPE_RE = /\[作用域[：:]\s*全局/;

/**
 * 作用域分类。
 *
 * 权威来源是 SDK 的所有权记录（getActiveToolStates）；旧实现靠匹配 description 里的
 * 「[作用域：全局]」文本，全仓只有一个工具命中，任何 JSDoc 改写都会让分类静默变成 0/N。
 * 正则仅作兜底，用于不在 SDK 镜像里的工具（polyfill 的 declarative forms、第三方直接注册）。
 */
function classifyScope(tool: ToolInfo, sdkScopes: Map<string, string>): ScopeGroup {
  const scope = sdkScopes.get(tool.name);
  if (scope) return scope === 'global' ? 'global' : 'local';
  return GLOBAL_SCOPE_RE.test(tool.description) ? 'global' : 'local';
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
  const mc = getModelContext();

  // 规范面：executeTool 要求实参必须是 getTools() 刚返回的真 RegisteredTool
  //（polyfill 会校验 name/description/window/origin 四键存在，且
  // tool.window === globalThis.window && tool.origin === 当前 origin）。
  // 绝不能复用 state 里的 ToolInfo —— 它没有 window/origin，会直接抛
  // TypeError: RegisteredTool.window is required。
  if (mc && typeof mc.getTools === 'function' && typeof mc.executeTool === 'function') {
    const registered = await mc.getTools();
    const tool = registered.find(candidate => candidate.name === name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    const result = await mc.executeTool(tool, argsJson);
    return result === null ? INTERRUPTED_MESSAGE : String(result);
  }

  // 已废弃的 testing 面：按**工具名**调用（与规范面的按**对象**调用是两种签名）
  const testing = getModelContextTesting();
  if (testing && typeof testing.executeTool === 'function') {
    const result = await testing.executeTool(name, argsJson);
    return result === null ? INTERRUPTED_MESSAGE : String(result);
  }

  throw new Error('当前宿主不支持工具执行（缺少 executeTool）');
}

export default function DebugPanel({ open, onToggle }: Props) {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeScope, setActiveScope] = useState<ScopeGroup>('global');
  const [query, setQuery] = useState('');
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({});
  const [invocations, setInvocations] = useState<Record<string, InvocationState>>({});
  const [toolchangeCount, setToolchangeCount] = useState(0);
  const pendingRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 并发守卫：readTools 现在是异步的（polyfill 的 getTools() 内部有 await setTimeout(0)），
  // 路由切换瞬间在途请求返回的旧列表会覆盖新列表，面板会短暂显示已卸载的工具
  const refreshSeqRef = useRef(0);

  const bumpToolchange = () => {
    pendingRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setToolchangeCount(pendingRef.current);
      pendingRef.current = 0;
    }, 300);
  };

  useEffect(() => {
    let disposed = false;

    const refresh = async () => {
      const seq = ++refreshSeqRef.current;
      const next = await readTools();
      // 丢弃过期结果；卸载后不再 setState
      if (disposed || seq !== refreshSeqRef.current) return;
      setTools(next);
    };

    void refresh();

    const mc = getModelContext();
    const onToolChange = () => {
      void refresh();
      bumpToolchange();
    };

    const canSubscribe = !!mc && typeof mc.addEventListener === 'function';
    if (mc && canSubscribe) {
      mc.addEventListener('toolchange', onToolChange);
    }

    // 轮询降级为"仅当事件不可用时启用"：toolchange 是权威信号，polyfill / Chrome / relay
    // 三面都支持（relay 自己还有 2000ms 轮询）。旧实现的 250ms 无条件轮询在异步化后
    // 会反复触发在途请求、放大竞态窗口。
    const timer = canSubscribe ? null : setInterval(() => void refresh(), 1000);

    return () => {
      disposed = true;
      if (mc && typeof mc.removeEventListener === 'function') {
        mc.removeEventListener('toolchange', onToolChange);
      }
      if (timer) clearInterval(timer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // 宿主面徽章：不用 useMemo（依赖 tools 会被 react-hooks/exhaustive-deps 判为多余依赖），
  // describeHostSurface 只是几次属性读取，每次渲染重算成本可忽略
  const hostSurface = describeHostSurface();

  const grouped = useMemo(() => {
    const sdkScopes = readSdkScopes();
    const lower = query.toLowerCase();
    const matches = (t: ToolInfo) =>
      !query || (t.name + ' ' + t.description).toLowerCase().includes(lower);

    const global: ToolInfo[] = [];
    const local: ToolInfo[] = [];
    for (const t of tools) {
      if (!matches(t)) continue;
      (classifyScope(t, sdkScopes) === 'global' ? global : local).push(t);
    }
    const sortByName = (a: ToolInfo, b: ToolInfo) => a.name.localeCompare(b.name);
    global.sort(sortByName);
    local.sort(sortByName);
    return { global, local };
  }, [tools, query]);

  const totals = useMemo(() => {
    const sdkScopes = readSdkScopes();
    let g = 0;
    let l = 0;
    for (const t of tools) {
      if (classifyScope(t, sdkScopes) === 'global') g++;
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
      // 中断形态归一：polyfill 5.1.0 抛 UnknownError: Tool unregistered，
      // Chrome 153+ / relay 返回 null（已在 callTool 里转为 INTERRUPTED_MESSAGE）。
      // 其余错误原样展示 name + message，便于区分幽灵工具（Tool not found）、
      // 误用（TypeError: RegisteredTool.window is required）与权限拒绝（NotAllowedError）。
      const text = isInterruptedError(e)
        ? INTERRUPTED_MESSAGE
        : e instanceof Error
          ? `${e.name}: ${e.message}`
          : String(e);
      setInvocations(prev => ({
        ...prev,
        [tool.name]: {
          running: false,
          result: isInterruptedError(e) ? text : null,
          error: isInterruptedError(e) ? null : text,
          ranAt: Date.now(),
        },
      }));
    }
  };

  const renderScope = (key: ScopeGroup, list: ToolInfo[]) => {
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
                <span className="debug-item__ts">{new Date(inv.ranAt).toLocaleTimeString()}</span>
              )}
            </div>
            {inv?.error && (
              <pre className="debug-item__result debug-item__result--error">{inv.error}</pre>
            )}
            {inv?.result && <pre className="debug-item__result">{inv.result}</pre>}
          </div>
        )}
      </li>
    );
  };

  const matchedCount = grouped.global.length + grouped.local.length;

  return (
    <aside
      className={`debug-panel ${open ? 'is-open' : ''}`}
      aria-hidden={!open}
      // 关闭态用 transform 移出视口，元素仍在 DOM 且可被 Tab 聚焦；
      // aria-hidden 不阻止聚焦，键盘用户会 Tab 进一个看不见的面板。inert 同时解决两者。
      {...(!open ? { inert: true } : {})}
    >
      <header className="debug-panel__head">
        <div>
          <h3>WebMCP 工具调试</h3>
          <p className="muted">
            当前可用 <strong>{tools.length}</strong> 个工具。
          </p>
          <div className="debug-events">
            {/* 宿主面徽章：放 .debug-events 而不是 .debug-panel__head 顶层——后者是
                justify-content: space-between 的两列 flex 布局假设，插第三个子元素会被
                顶到右上角并挤压 h3；.debug-events__item 已有 code/strong 子样式与 flex-wrap，
                零新增 CSS */}
            <span
              className="debug-events__item"
              title="当前 WebMCP 宿主面（规范入口为 document.modelContext）"
              data-testid="debug-host-surface"
            >
              宿主 <code>{hostSurface}</code>
            </span>
            <span className="debug-events__item" title="toolchange 事件（本次操作）">
              <code>toolchange</code> <strong>{toolchangeCount}</strong>
            </span>
          </div>
        </div>
        {/* onToggle 已在 Props 里声明但从未被解构使用，App.tsx 传进来的 toggleDebug 是白传；
            面板内部原本没有关闭按钮，只能靠 header 按钮或 Cmd/Ctrl + \ */}
        <button
          type="button"
          className="debug-panel__close"
          onClick={onToggle}
          aria-label="关闭调试面板"
          title="关闭（⌘ + \）"
        >
          ×
        </button>
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
          <p className="muted debug-panel__empty">没有匹配的工具。试试切换页面或挂载新组件。</p>
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
      : (schema.description ?? type);

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
