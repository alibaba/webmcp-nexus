// packages/webmcp-sdk/src/useWebMcpTools.ts
import { useEffect, useRef, useState } from 'react';
import {
  registerScopedTool,
  unregisterScopedTool,
  notifyToolsChanged,
  patchModelContextEventSupport,
} from './registry';
import { ensureModelContextPolyfill } from './polyfill';
import type { WebMcpAnnotatedFn } from './types';

let scopeCounter = 0;
function generateScopeId(): string {
  return `component-${++scopeCounter}`;
}

// HMR support: track a global version counter that increments on hot updates.
// Function body updates are already handled via toolsRef.current indirect calls.
// This counter ensures schema changes (__webmcpSchema) trigger re-registration.
let hmrVersion = 0;
const hmrHot = typeof import.meta !== 'undefined' ? import.meta.hot : undefined;
if (hmrHot && typeof hmrHot.on === 'function') {
  hmrHot.on('vite:afterUpdate', () => {
    hmrVersion++;
  });
}

/**
 * React Hook：将函数注册为 WebMCP 工具，绑定组件生命周期。
 * mount 时注册，unmount 时自动注销。
 *
 * 使用 useRef 持有最新函数引用，避免闭包陷阱。
 * 使用 toolKeys（工具名集合的字符串）作为 useEffect 依赖，
 * 当工具集合变化时重新注册，函数体变化不触发重新注册。
 *
 * @param toolMaps - 一个或多个 Record<string, Function> 对象
 *
 * @example
 * // 组件级注册
 * useWebMcpTools({ searchInPanel, clearSearch });
 *
 * @example
 * // 路由级注册（配合 React Router 使用）
 * useWebMcpTools({ setUserFilter });
 */
export function useWebMcpTools(...toolMaps: Record<string, Function>[]): void {
  // 合并所有 toolMap 为一个对象
  const merged: Record<string, Function> = {};
  for (const toolMap of toolMaps) {
    for (const [name, fn] of Object.entries(toolMap)) {
      if (typeof fn === 'function') {
        merged[name] = fn;
      }
    }
  }

  // 用 ref 持有最新的函数引用，避免闭包陷阱
  const toolsRef = useRef(merged);
  toolsRef.current = merged;

  // 生成唯一 scopeId，确保同一组件实例的 scopeId 一致
  const scopeIdRef = useRef<string>('');
  if (!scopeIdRef.current) {
    scopeIdRef.current = generateScopeId();
  }

  // 工具名集合作为依赖 — 工具集合变化时重新注册
  const toolKeys = Object.keys(merged).sort().join(',');

  // DEV: listen for HMR updates to force re-registration when schema changes
  const [localHmrVersion, setLocalHmrVersion] = useState(hmrVersion);
  useEffect(() => {
    const hot = typeof import.meta !== 'undefined' ? import.meta.hot : undefined;
    if (hot && typeof hot.on === 'function') {
      const handler = () => setLocalHmrVersion(v => v + 1);
      hot.on('vite:afterUpdate', handler);
      return () => {
        if (typeof hot.off === 'function') {
          hot.off('vite:afterUpdate', handler);
        }
      };
    }
  }, []);

  useEffect(() => {
    ensureModelContextPolyfill();
    if (typeof navigator === 'undefined' || !('modelContext' in navigator)) {
      return;
    }

    patchModelContextEventSupport();

    const registeredNames: string[] = [];

    for (const [name, fn] of Object.entries(toolsRef.current)) {
      const schema = (fn as WebMcpAnnotatedFn).__webmcpSchema;
      if (!schema) continue;

      registerScopedTool(
        {
          name,
          description: schema.description,
          inputSchema: schema.inputSchema,
          // 通过 ref 间接调用，保证始终执行最新版本的函数
          execute: async (input: unknown) => toolsRef.current[name](input),
          annotations: { readOnlyHint: schema.readOnly ?? false },
        },
        { scope: 'component', scopeId: scopeIdRef.current },
      );

      registeredNames.push(name);
    }

    if (registeredNames.length > 0) {
      notifyToolsChanged();
    }

    // 组件卸载时释放 owner；最后一个 owner 才会触发原生 abort。
    return () => {
      let unregisteredAny = false;
      for (const name of registeredNames) {
        const shouldUnregister = unregisterScopedTool(name, {
          scope: 'component',
          scopeId: scopeIdRef.current,
        });
        if (shouldUnregister) {
          unregisteredAny = true;
        }
      }
      if (unregisteredAny) {
        notifyToolsChanged();
      }
    };
  }, [toolKeys, localHmrVersion]); // 工具集合变化或 HMR 更新时重新注册
}
