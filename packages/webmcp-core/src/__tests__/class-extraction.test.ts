import { describe, it, expect, vi } from 'vitest';
import { transformCode } from '../transform';

describe('withWebMcpTools class extraction', () => {
  it('自动提取带 JSDoc 的原型方法', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 搜索数据 @readonly */
  searchData(params: { query: string }) {
    return [];
  }

  /** 无参方法不应被提取 */
  noParamMethod() {
    return 'hello';
  }

  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    expect(result.code).toContain('MyPanel.prototype.searchData.__webmcpSchema');
    expect(result.code).toContain('"搜索数据"');
    expect(result.code).toContain('"readOnly": true');
    // render 不应出现
    expect(result.code).not.toContain('prototype.render');
    // noParamMethod 有 JSDoc 但无对象参数，properties 为空但仍会被提取
    // （它有 JSDoc 描述所以自动模式会选它）
  });

  it('自动提取 class field 箭头函数', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 设置筛选条件 */
  setFilter = (params: { keyword: string }) => {
    this.setState({ filter: params.keyword });
  };

  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    expect(result.code).toContain('__webmcpFieldSchemas');
    expect(result.code).toContain('"setFilter"');
    expect(result.code).toContain('"设置筛选条件"');
    expect(result.code).toContain('"keyword"');
  });

  it('同时提取原型方法和 class field', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 搜索 @readonly */
  search(params: { query: string }) { return []; }

  /** 清除 */
  clear = (params: { confirm?: boolean }) => {};

  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    // 原型方法
    expect(result.code).toContain('MyPanel.prototype.search.__webmcpSchema');
    // class field
    expect(result.code).toContain('MyPanel.__webmcpFieldSchemas');
    expect(result.code).toContain('"clear"');
  });

  it('显式方法列表仅提取指定方法', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 方法A */
  methodA(params: { x: string }) { return params.x; }

  /** 方法B */
  methodB(params: { y: number }) { return params.y; }

  render() { return null; }
}

export default withWebMcpTools(MyPanel, ['methodA']);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    expect(result.code).toContain('prototype.methodA');
    expect(result.code).not.toContain('prototype.methodB');
  });

  it('排除 constructor 和 React 生命周期方法', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 初始化 */
  constructor(props: any) { super(props); }

  /** 挂载 */
  componentDidMount() {}

  /** 工具方法 */
  myTool(params: { id: string }) { return params.id; }

  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    expect(result.code).toContain('prototype.myTool');
    expect(result.code).not.toContain('prototype.constructor');
    expect(result.code).not.toContain('prototype.componentDidMount');
    expect(result.code).not.toContain('prototype.render');
  });

  it('无 JSDoc 的方法在自动模式下被跳过', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  noDocMethod(params: { x: string }) { return params.x; }

  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    // 没有可提取的工具
    expect(result.transformed).toBe(false);
  });

  it('注入代码位于 withWebMcpTools 调用之前', () => {
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

class MyPanel extends React.Component {
  /** 搜索 */
  search(params: { q: string }) { return []; }
  render() { return null; }
}

export default withWebMcpTools(MyPanel);
`;
    const result = transformCode(code, '/test/MyPanel.tsx');
    expect(result.transformed).toBe(true);
    const schemaPos = result.code.indexOf('__webmcpSchema');
    const callPos = result.code.indexOf('withWebMcpTools(MyPanel)');
    expect(schemaPos).toBeLessThan(callPos);
  });

  it('匿名 class 不报错但不提取', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const code = `
import { withWebMcpTools } from 'webmcp-nexus-sdk';

const wrapped = withWebMcpTools(someVar);
`;
    const result = transformCode(code, '/test/anon.tsx');
    // someVar 不是 class 声明，不应报错
    expect(result.transformed).toBe(false);
    warnSpy.mockRestore();
  });
});
