// packages/webmcp-sdk/src/withWebMcpTools.tsx
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useWebMcpTools } from './useWebMcpTools';
import type { WebMcpAnnotatedFn } from './types';

/** React 生命周期方法黑名单 */
const LIFECYCLE_METHODS = new Set([
  'constructor',
  'render',
  'componentDidMount',
  'componentDidUpdate',
  'componentWillUnmount',
  'shouldComponentUpdate',
  'getSnapshotBeforeUpdate',
  'componentDidCatch',
]);

/**
 * 高阶组件：将 class 组件的方法注册为 WebMCP 工具。
 * mount 时注册，unmount 时自动注销。
 *
 * 支持两种方法形式：
 * - 原型方法：`methodName(params: T) { ... }` — schema 挂在 prototype 上
 * - Class field 箭头函数：`methodName = (params: T) => { ... }` — schema 挂在静态属性上
 *
 * @param WrappedComponent - React class 组件
 * @param methodNames - 可选，显式指定要注册的方法名列表
 *
 * @example
 * class MyPanel extends React.Component {
 *   /\** 搜索面板 @readonly *\/
 *   searchInPanel(params: { query: string }) { ... }
 *
 *   /\** 清除搜索 *\/
 *   clearSearch = (params: { confirm?: boolean }) => { ... };
 *
 *   render() { return <div />; }
 * }
 * export default withWebMcpTools(MyPanel);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withWebMcpTools<P extends Record<string, any>>(
  WrappedComponent: React.ComponentClass<P>,
  methodNames?: string[],
): React.ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WebMcpToolsWrapper(props: P) {
    const instanceRef = useRef<InstanceType<typeof WrappedComponent> | null>(null);

    // HMR 版本追踪：schema 更新时重建 toolMap
    const [hmrVersion, setHmrVersion] = useState(0);
    useEffect(() => {
      const hot = typeof import.meta !== 'undefined' ? import.meta.hot : undefined;
      if (hot && typeof hot.on === 'function') {
        const handler = () => setHmrVersion(v => v + 1);
        hot.on('vite:afterUpdate', handler);
        return () => {
          if (typeof hot.off === 'function') {
            hot.off('vite:afterUpdate', handler);
          }
        };
      }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolMap = useMemo((): Record<string, any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map: Record<string, any> = {};
      const candidates = methodNames ? new Set(methodNames) : null;
      const proto = WrappedComponent.prototype;

      // 来源 1：原型方法（__webmcpSchema 挂在 prototype 方法上）
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (LIFECYCLE_METHODS.has(name)) continue;
        if (candidates && !candidates.has(name)) continue;
        const method = proto[name];
        if (typeof method !== 'function') continue;
        const schema = (method as WebMcpAnnotatedFn).__webmcpSchema;
        if (!schema) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wrapper: any = (input: unknown) => (instanceRef.current as any)?.[name](input);
        wrapper.__webmcpSchema = schema;
        map[name] = wrapper;
      }

      // 来源 2：class field 箭头函数（schema 挂在静态属性 __webmcpFieldSchemas 上）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldSchemas = (WrappedComponent as any).__webmcpFieldSchemas as
        | Record<string, { description: string; inputSchema: object; readOnly?: boolean }>
        | undefined;
      if (fieldSchemas) {
        for (const [name, schema] of Object.entries(fieldSchemas)) {
          if (candidates && !candidates.has(name)) continue;
          if (map[name]) continue; // 原型方法优先

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wrapper: any = (input: unknown) => (instanceRef.current as any)?.[name](input);
          wrapper.__webmcpSchema = schema;
          map[name] = wrapper;
        }
      }

      return map;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hmrVersion]);

    useWebMcpTools(toolMap);

    return <WrappedComponent ref={instanceRef} {...props} />;
  }

  WebMcpToolsWrapper.displayName = `withWebMcpTools(${displayName})`;
  return WebMcpToolsWrapper;
}
