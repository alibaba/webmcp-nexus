// packages/webmcp-sdk/src/registry.ts
import type { WebMcpToolConfig } from './types';

let modelContextPatched = false;

/**
 * 在 dispatchEvent 层面合并 toolchange 事件。
 * 无论来源（SDK 包装器、polyfill 内部、第三方代码），同一微任务内只触发 1 次。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function patchDispatchEventForCoalescing(mc: any): void {
  if (mc.__toolchangeCoalesced) return;
  const originalDispatch: (event: Event) => boolean =
    mc.dispatchEvent.bind(mc);
  let pending = false;
  mc.dispatchEvent = (event: Event): boolean => {
    if (event.type === 'toolchange') {
      if (!pending) {
        pending = true;
        queueMicrotask(() => {
          originalDispatch(new Event('toolchange'));
          pending = false;
        });
      }
      return true;
    }
    return originalDispatch(event);
  };
  mc.__toolchangeCoalesced = true;
}

/**
 * Patches navigator.modelContext to ensure embed.js can discover tools.
 *
 * Handles three scenarios:
 * 1. Chrome 146+ native / @mcp-b/webmcp-polyfill: modelContext lacks
 *    listTools/callTool/EventTarget; modelContextTesting shim provides
 *    listTools/executeTool
 *    → Bridge listTools/callTool from modelContextTesting, add EventTarget,
 *      wrap registerTool/unregisterTool to fire toolchange
 * 2. Older polyfills (e.g. @mcp-b/global before EventTarget support):
 *    modelContext has listTools/callTool but lacks EventTarget
 *    → Add EventTarget, wrap registerTool/unregisterTool to fire toolchange
 * 3. Full MCP-B environment: modelContext has everything → skip
 */
export function patchModelContextEventSupport(): void {
  if (modelContextPatched) {
    return;
  }
  if (
    typeof navigator === 'undefined' ||
    !('modelContext' in navigator) ||
    !navigator.modelContext
  ) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mc = navigator.modelContext as any;
  const hasEventTarget = typeof mc.addEventListener === 'function';
  const hasListTools = typeof mc.listTools === 'function';
  const hasCallTool = typeof mc.callTool === 'function';

  // Scenario 3: fully featured — only apply toolchange coalescing
  if (hasEventTarget && hasListTools && hasCallTool) {
    patchDispatchEventForCoalescing(mc);
    modelContextPatched = true;
    return;
  }

  // Add EventTarget support if missing (Chrome native & polyfill)
  if (!hasEventTarget) {
    const listeners = new Map<string, Set<EventListener>>();

    mc.addEventListener = (type: string, callback: EventListener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(callback);
    };

    mc.removeEventListener = (type: string, callback: EventListener) => {
      listeners.get(type)?.delete(callback);
    };

    mc.dispatchEvent = (event: Event): boolean => {
      const set = listeners.get(event.type);
      if (set) {
        set.forEach(fn => {
          try {
            fn.call(mc, event);
          } catch {
            // Ignore listener errors
          }
        });
      }
      return true;
    };
  }

  // Bridge listTools/callTool from modelContextTesting if missing (Chrome native)
  // Chrome 146+ has these methods on modelContextTesting but not on modelContext.
  // embed.js requires them on modelContext for getExtendedModelContext() to succeed.
  if (!hasListTools || !hasCallTool) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testing = (navigator as any).modelContextTesting;
    if (testing) {
      if (
        typeof testing.listTools === 'function' &&
        !testing.__webmcpNexusListToolsPatched
      ) {
        const originalTestingListTools = testing.listTools.bind(testing);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testing.listTools = (...args: any[]) => {
          const nativeTools = originalTestingListTools(...args);
          return Array.isArray(nativeTools)
            ? nativeTools.filter((tool: any) => {
                if (!managedToolNames.has(tool.name)) return true;
                return activeTools.has(tool.name);
              })
            : nativeTools;
        };
        testing.__webmcpNexusListToolsPatched = true;
      }
      if (!hasListTools && typeof testing.listTools === 'function') {
        // Convert testing format (inputSchema as JSON string) to extended format (inputSchema as object)
        mc.listTools = () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return testing.listTools().map((t: any) => ({
              name: t.name,
              description: t.description || '',
              inputSchema:
                typeof t.inputSchema === 'string' && t.inputSchema.length > 0
                  ? JSON.parse(t.inputSchema)
                  : { type: 'object', properties: {} },
            }));
          } catch {
            return [];
          }
        };
      }
      if (!hasCallTool && typeof testing.executeTool === 'function') {
        mc.callTool = async (params: { name: string; arguments?: Record<string, unknown> }) => {
          const result = await testing.executeTool(
            params.name,
            JSON.stringify(params.arguments || {}),
          );
          if (result === null) {
            return {
              isError: true,
              content: [{ type: 'text', text: 'Tool execution interrupted by navigation' }],
            };
          }
          try {
            return JSON.parse(result);
          } catch {
            throw new Error(`Tool returned invalid JSON: ${String(result).slice(0, 200)}`);
          }
        };
      }
    }
  }

  // Wrap registerTool/unregisterTool to auto-fire 'toolchange'
  // For Chrome native: registerTool fires toolchange on modelContextTesting (not modelContext),
  //   but embed.js subscribes on modelContext after our patch — so we need to bridge the event.
  // For polyfill: BrowserMcpServer doesn't fire any events, so wrapping is required.
  if (typeof mc.registerTool === 'function') {
    const originalRegisterTool = mc.registerTool.bind(mc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mc.registerTool = (tool: any, options?: any) => {
      let registrationError: unknown;
      try {
        originalRegisterTool(tool, options);
      } catch (error) {
        registrationError = error;
      }
      try {
        mc.dispatchEvent(new Event('toolchange'));
      } catch {
        // Ignore dispatch errors
      }
      if (registrationError) {
        throw registrationError;
      }
    };
  }

  if (typeof mc.unregisterTool === 'function') {
    const originalUnregisterTool = mc.unregisterTool.bind(mc);
    mc.unregisterTool = (name: string) => {
      try {
        originalUnregisterTool(name);
      } catch {
        // Swallow unregister errors
      }
      try {
        mc.dispatchEvent(new Event('toolchange'));
      } catch {
        // Ignore dispatch errors
      }
    };
  }

  patchDispatchEventForCoalescing(mc);
  modelContextPatched = true;
}

type ToolScope = 'global' | 'route' | 'component';

interface ToolEntry {
  name: string;
  scope: ToolScope;
  scopeId: string;
}

interface ToolOwner {
  scope: ToolScope;
  scopeId: string;
}

interface ActiveToolRecord {
  name: string;
  config: WebMcpToolConfig;
  configs: Map<string, WebMcpToolConfig>;
  controller: AbortController;
  owners: Map<string, ToolOwner>;
  nativeRegistered: boolean;
}

const registry = new Map<string, ToolEntry[]>();
const activeTools = new Map<string, ActiveToolRecord>();
const managedToolNames = new Set<string>();
let hasManagedTools = false;

function getOwnerKey(owner: ToolOwner): string {
  return `${owner.scope}:${owner.scopeId}`;
}

/** 获取当前活跃工具名列表（仅用于测试和内部同步） */
export function getActiveToolNames(): string[] {
  return Array.from(activeTools.keys());
}

/** 获取当前活跃工具配置列表（供 pushToolsToWidget 在 listTools 缺失时兜底） */
export function getActiveToolConfigs(): Array<{
  name: string;
  description: string;
  inputSchema: object;
}> {
  return Array.from(activeTools.values()).map(record => ({
    name: record.name,
    description: record.config.description,
    inputSchema: record.config.inputSchema || { type: 'object', properties: {} },
  }));
}

/**
 * 在内部注册表中记录工具的所有权信息。
 * 如果同名工具已被其他 scope 注册，输出警告但仍允许注册。
 */
export function registerEntry(name: string, scope: ToolScope, scopeId: string): void {
  const entries = registry.get(name) || [];
  if (entries.length > 0) {
    const isSameScopeAndId = entries.some(e => e.scope === scope && e.scopeId === scopeId);
    if (!isSameScopeAndId) {
      const existing = entries[0];
      console.warn(
        `[webmcp] Tool "${name}" is already registered by scope "${existing.scope}:${existing.scopeId}". ` +
          `Re-registering from "${scope}:${scopeId}". This may cause unexpected behavior.`,
      );
    }
  }
  entries.push({ name, scope, scopeId });
  registry.set(name, entries);
}

/**
 * 从内部注册表中移除指定 scope 的工具所有权记录。
 * @returns true 表示可以安全调用 unregisterTool（最后一个持有者已移除）；
 *          false 表示还有其他 scope 持有该工具，不应注销。
 */
export function unregisterEntry(name: string, scope: ToolScope, scopeId: string): boolean {
  const entries = registry.get(name);
  if (!entries) return false;
  const idx = entries.findIndex(e => e.scope === scope && e.scopeId === scopeId);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  if (entries.length === 0) {
    registry.delete(name);
    return true; // 可以安全注销
  }
  return false; // 其他 scope 仍持有该工具
}

/**
 * 清空注册表（仅用于测试）
 */
export function clearRegistry(): void {
  registry.clear();
  activeTools.clear();
  managedToolNames.clear();
  hasManagedTools = false;
  modelContextPatched = false;
  if (pushToolsTimer) {
    clearTimeout(pushToolsTimer);
    pushToolsTimer = null;
  }
}

/**
 * 注册带 owner 的工具。
 * 同名工具只会原生注册一次；多个组件/作用域通过 owners 聚合生命周期。
 */
export function registerScopedTool(toolConfig: WebMcpToolConfig, owner: ToolOwner): void {
  try {
    const ownerKey = getOwnerKey(owner);
    hasManagedTools = true;
    managedToolNames.add(toolConfig.name);
    const existing = activeTools.get(toolConfig.name);
    if (existing) {
      existing.owners.set(ownerKey, owner);
      existing.configs.set(ownerKey, toolConfig);
      return;
    }

    const controller = new AbortController();
    const owners = new Map<string, ToolOwner>([[ownerKey, owner]]);
    const record: ActiveToolRecord = {
      name: toolConfig.name,
      config: toolConfig,
      configs: new Map([[ownerKey, toolConfig]]),
      controller,
      owners,
      nativeRegistered: false,
    };

    activeTools.set(toolConfig.name, record);

    const mc =
      typeof navigator !== 'undefined'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (navigator.modelContext as any)
        : undefined;

    controller.signal.addEventListener(
      'abort',
      () => {
        try {
          // L2 fallback: 仅当 modelContext 不是带原生 signal 处理的实现时才调用 unregisterTool。
          // - Chrome 148+ 原生：移除了 unregisterTool，typeof === 'function' 为 false，自动跳过
          // - Chrome 146/147 原生：registerTool 不识别 signal，必须靠 unregisterTool 注销
          // - @mcp-b/webmcp-polyfill 2.x：registerTool 内部已 hook signal abort 自动删除 tool，
          //   再调 unregisterTool 既是双重操作，又会触发 polyfill 的 deprecation 警告。
          //   通过 __isWebMCPPolyfill 标记跳过这条路径。
          if (
            mc &&
            typeof mc.unregisterTool === 'function' &&
            !mc.__isWebMCPPolyfill
          ) {
            mc.unregisterTool(toolConfig.name);
          }
        } catch {
          // Ignore legacy fallback errors
        }
        try {
          activeTools.delete(toolConfig.name);
          notifyToolsChanged();
        } catch {
          // Ignore notification errors
        }
      },
      { once: true },
    );

    if (mc && typeof mc.registerTool === 'function') {
      const nativeToolConfig = {
        ...toolConfig,
        execute: async (input: Record<string, unknown>) => {
          const latestRecord = activeTools.get(toolConfig.name);
          return latestRecord?.config.execute(input);
        },
      };
      try {
        mc.registerTool(nativeToolConfig, { signal: controller.signal });
        record.nativeRegistered = true;
      } catch {
        try {
          if (typeof mc.unregisterTool === 'function') {
            mc.unregisterTool(toolConfig.name);
            mc.registerTool(nativeToolConfig, { signal: controller.signal });
            record.nativeRegistered = true;
          }
        } catch {
          // Keep the internal mirror so widget fallback still reflects SDK ownership.
        }
      }
    }
  } catch {
    // SDK public paths should never surface browser API errors.
  }
}

/**
 * 移除工具 owner。只有最后一个 owner 移除时才 abort 原生注册。
 * @returns true 表示工具列表发生了实际注销；false 表示仍有其他 owner。
 */
export function unregisterScopedTool(name: string, owner: ToolOwner): boolean {
  try {
    const record = activeTools.get(name);
    if (!record) {
      return false;
    }

    const ownerKey = getOwnerKey(owner);
    const removedConfig = record.configs.get(ownerKey);
    record.owners.delete(ownerKey);
    record.configs.delete(ownerKey);
    if (removedConfig && record.config === removedConfig) {
      const nextConfig = record.configs.values().next().value as WebMcpToolConfig | undefined;
      if (nextConfig) {
        record.config = nextConfig;
      }
    }
    if (record.owners.size > 0) return false;

    if (!record.controller.signal.aborted) {
      record.controller.abort();
    } else {
      activeTools.delete(name);
      notifyToolsChanged();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce timer for pushing tools to widget iframe.
 */
let pushToolsTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Directly push the current tool list to any widget iframes via postMessage.
 * This bypasses Chrome's registerToolsChangedCallback mechanism which doesn't
 * fire on unregisterTool, ensuring the relay always has the correct tool list.
 */
function pushToolsToWidget(): void {
  try {
    if (typeof document === 'undefined') return;

    const iframes = document.querySelectorAll('iframe');
    if (iframes.length === 0) return;

    const tools = getToolsForWidget();

    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      // embed.js（@mcp-b/webmcp-local-relay）已通过 toolchange 监听自行推送
      // relay iframe，跳过以避免重复 webmcp.tools.changed 消息
      if (iframe.hasAttribute('data-webmcp-relay')) continue;
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'webmcp.tools.changed',
              tools,
            },
            '*',
          );
        }
      } catch {
        // Cross-origin or other iframe access error, skip
      }
    }
  } catch {
    // Ignore errors
  }
}

function getToolsForWidget(): Array<{ name: string; description: string; inputSchema: object }> {
  if (hasManagedTools) {
    return getActiveToolConfigs();
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mc = typeof navigator !== 'undefined' ? (navigator.modelContext as any) : undefined;
    if (mc && typeof mc.listTools === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tools = mc.listTools().map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema:
          typeof tool.inputSchema === 'string' && tool.inputSchema.length > 0
            ? safeJsonParse(tool.inputSchema)
            : tool.inputSchema || { type: 'object', properties: {} },
      }));
      return tools;
    }
  } catch {
    // Fall through to activeTools mirror
  }
  return getActiveToolConfigs();
}

function safeJsonParse(value: string): object {
  try {
    return JSON.parse(value);
  } catch {
    return { type: 'object', properties: {} };
  }
}

/**
 * Schedule a debounced push of tools to widget iframes.
 * Uses 100ms delay to coalesce rapid register/unregister cycles
 * (e.g., during SPA navigation when old component unmounts and new one mounts).
 */
function schedulePushToolsToWidget(): void {
  if (pushToolsTimer) {
    clearTimeout(pushToolsTimer);
  }
  pushToolsTimer = setTimeout(() => {
    pushToolsTimer = null;
    pushToolsToWidget();
  }, 100);
}

/**
 * 通知工具列表已变化，发射标准 toolchange 事件并推送至 widget iframe。
 */
export function notifyToolsChanged(): void {
  if (typeof navigator === 'undefined' || !('modelContext' in navigator)) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator.modelContext as any).dispatchEvent(new Event('toolchange'));
  } catch {
    // Ignore dispatch errors
  }

  schedulePushToolsToWidget();
}

/**
 * 安全注册工具，处理重复名称的情况。
 * 如果 registerTool 因重复名称抛错，则先 unregister 再重试。
 */
export function safeRegisterTool(toolConfig: WebMcpToolConfig): void {
  registerScopedTool(toolConfig, { scope: 'global', scopeId: 'safe-register' });
}
