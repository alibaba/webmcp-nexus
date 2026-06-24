import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import { withWebMcpTools } from '../withWebMcpTools';
import { clearRegistry, getActiveToolNames } from '../registry';

describe('withWebMcpTools', () => {
  const mockRegisterTool = vi.fn();
  const mockUnregisterTool = vi.fn();
  let originalNavigator: any;

  beforeEach(() => {
    originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        modelContext: {
          registerTool: mockRegisterTool,
          unregisterTool: mockUnregisterTool,
        },
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    clearRegistry();
    mockRegisterTool.mockClear();
    mockUnregisterTool.mockClear();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  // --- 辅助 class 组件 ---

  class PanelWithPrototype extends React.Component<{ value?: string }> {
    state = { data: ['a', 'b', 'c'] };
    render() {
      return <div />;
    }
  }
  // 模拟构建插件注入 prototype schema
  (PanelWithPrototype.prototype as any).searchData = function (input: any) {
    return this.state.data.filter((d: string) => d.includes(input.query));
  };
  ((PanelWithPrototype.prototype as any).searchData as any).__webmcpSchema = {
    description: '搜索数据',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    readOnly: true,
  };

  class PanelWithField extends React.Component {
    state = { filter: '' };
    render() {
      return <div />;
    }
  }
  // 模拟构建插件注入 __webmcpFieldSchemas
  (PanelWithField as any).__webmcpFieldSchemas = {
    setFilter: {
      description: '设置筛选条件',
      inputSchema: { type: 'object', properties: { keyword: { type: 'string' } }, required: ['keyword'] },
      readOnly: false,
    },
  };
  // 实例上的箭头函数
  const originalComponentDidMount = PanelWithField.prototype.componentDidMount;
  PanelWithField.prototype.componentDidMount = function () {
    (this as any).setFilter = (input: any) => {
      this.setState({ filter: input.keyword });
      return { applied: true };
    };
    originalComponentDidMount?.call(this);
  };

  class PanelWithBoth extends React.Component {
    state = { items: [] as string[] };
    render() {
      return <div />;
    }
  }
  (PanelWithBoth.prototype as any).searchItems = function (input: any) {
    return this.state.items;
  };
  ((PanelWithBoth.prototype as any).searchItems as any).__webmcpSchema = {
    description: '搜索项目',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
    readOnly: true,
  };
  (PanelWithBoth as any).__webmcpFieldSchemas = {
    addItem: {
      description: '添加项目',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      readOnly: false,
    },
  };

  // --- 测试用例 ---

  it('原型方法 mount 后注册，unmount 后注销', () => {
    const Wrapped = withWebMcpTools(PanelWithPrototype);
    const { unmount } = render(<Wrapped />);

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'searchData' }),
      expect.any(Object),
    );
    expect(getActiveToolNames()).toContain('searchData');

    unmount();
    expect(getActiveToolNames()).not.toContain('searchData');
  });

  it('class field 箭头函数被正确注册', () => {
    const Wrapped = withWebMcpTools(PanelWithField);
    const { unmount } = render(<Wrapped />);

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'setFilter' }),
      expect.any(Object),
    );
    expect(getActiveToolNames()).toContain('setFilter');

    unmount();
    expect(getActiveToolNames()).not.toContain('setFilter');
  });

  it('同时支持原型方法和 class field', () => {
    const Wrapped = withWebMcpTools(PanelWithBoth);
    render(<Wrapped />);

    expect(mockRegisterTool).toHaveBeenCalledTimes(2);
    expect(getActiveToolNames()).toContain('searchItems');
    expect(getActiveToolNames()).toContain('addItem');
  });

  it('显式方法列表过滤', () => {
    const Wrapped = withWebMcpTools(PanelWithBoth, ['searchItems']);
    render(<Wrapped />);

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toContain('searchItems');
    expect(getActiveToolNames()).not.toContain('addItem');
  });

  it('生命周期方法不被注册', () => {
    class WithLifecycle extends React.Component {
      render() {
        return <div />;
      }
    }
    // 即使给 render 加了 schema 也不该注册
    (WithLifecycle.prototype.render as any).__webmcpSchema = {
      description: 'should not register',
      inputSchema: { type: 'object', properties: {} },
    };
    const Wrapped = withWebMcpTools(WithLifecycle);
    render(<Wrapped />);
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('无 schema 的方法被跳过', () => {
    class NoSchema extends React.Component {
      someMethod() {
        return 'hello';
      }
      render() {
        return <div />;
      }
    }
    const Wrapped = withWebMcpTools(NoSchema);
    render(<Wrapped />);
    expect(mockRegisterTool).not.toHaveBeenCalled();
  });

  it('工具调用时访问最新 this.state', async () => {
    const Wrapped = withWebMcpTools(PanelWithPrototype);
    render(<Wrapped />);

    // 获取注册时传入的 execute 函数
    const registeredConfig = mockRegisterTool.mock.calls[0][0];
    const result = await registeredConfig.execute({ query: 'a' });
    expect(result).toEqual(['a']);
  });

  it('多实例各有独立 scope', () => {
    const Wrapped = withWebMcpTools(PanelWithPrototype);
    const { unmount: unmount1 } = render(<Wrapped />);
    const { unmount: unmount2 } = render(<Wrapped />);

    // 两次注册（第二次走 owners 聚合，不重复原生注册）
    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(getActiveToolNames()).toContain('searchData');

    // 卸载第一个实例，工具仍在（还有第二个 owner）
    unmount1();
    expect(getActiveToolNames()).toContain('searchData');

    // 卸载第二个实例，工具注销
    unmount2();
    expect(getActiveToolNames()).not.toContain('searchData');
  });
});
