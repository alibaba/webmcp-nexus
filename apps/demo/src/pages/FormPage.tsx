import React from 'react';
import { withWebMcpTools } from 'webmcp-nexus-sdk';

interface FormEntry {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
}

interface FormPageState {
  name: string;
  email: string;
  message: string;
  submissions: FormEntry[];
}

class FormPageClass extends React.Component<Record<string, never>, FormPageState> {
  state: FormPageState = {
    name: '',
    email: '',
    message: '',
    submissions: [],
  };

  // ===== 原型方法（构建时注入到 prototype.__webmcpSchema）=====

  /**
   * [作用域：表单页] 获取当前表单各字段的值。
   * @readonly
   */
  getFormData(_params: Record<string, never>) {
    const { name, email, message } = this.state;
    return { name, email, message };
  }

  /**
   * [作用域：表单页] 获取已提交的历史记录列表。
   * @readonly
   */
  getSubmissions(params: {
    /** 返回数量上限（默认 50） */
    limit?: number;
  }) {
    const limit = params.limit ?? 50;
    const { submissions } = this.state;
    return {
      count: submissions.length,
      submissions: submissions.slice(0, limit),
    };
  }

  // ===== Class field 箭头函数（构建时注入到 __webmcpFieldSchemas）=====

  /**
   * [作用域：表单页] 填充表单字段。
   */
  fillForm = (params: {
    /** 姓名 */
    name?: string;
    /** 邮箱 */
    email?: string;
    /** 留言内容 */
    message?: string;
  }) => {
    this.setState(prev => ({
      name: params.name ?? prev.name,
      email: params.email ?? prev.email,
      message: params.message ?? prev.message,
    }));
    return { filled: true };
  };

  /**
   * [作用域：表单页] 提交当前表单内容到历史记录。
   */
  submitForm = (_params: Record<string, never>) => {
    const { name, email, message } = this.state;
    if (!name && !email && !message) {
      return { submitted: false, error: '表单为空，无法提交' };
    }
    const entry: FormEntry = {
      id: `entry-${Date.now()}`,
      name,
      email,
      message,
      submittedAt: new Date().toISOString(),
    };
    this.setState(prev => ({
      name: '',
      email: '',
      message: '',
      submissions: [entry, ...prev.submissions],
    }));
    return { submitted: true, entry };
  };

  /**
   * [作用域：表单页] 清空表单所有字段。
   */
  clearForm = (_params: Record<string, never>) => {
    this.setState({ name: '', email: '', message: '' });
    return { cleared: true };
  };

  // ===== UI 渲染 =====

  render() {
    const { name, email, message, submissions } = this.state;

    return (
      <div style={{ display: 'flex', gap: '2rem', padding: '1.5rem', height: '100%' }}>
        {/* 左侧：表单 */}
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            反馈表单
          </h2>
          <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.875rem' }}>
            此页面使用 class 组件 + withWebMcpTools HOC 注册工具。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>姓名</span>
              <input
                type="text"
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
                placeholder="输入姓名"
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>邮箱</span>
              <input
                type="email"
                value={email}
                onChange={e => this.setState({ email: e.target.value })}
                placeholder="输入邮箱"
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>留言</span>
              <textarea
                value={message}
                onChange={e => this.setState({ message: e.target.value })}
                placeholder="输入留言内容"
                rows={4}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => this.submitForm({} as Record<string, never>)}
                style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                提交
              </button>
              <button
                type="button"
                onClick={() => this.clearForm({} as Record<string, never>)}
                style={{ padding: '0.5rem 1rem', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
              >
                清空
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：提交历史 */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            提交历史 ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.875rem' }}>暂无提交记录</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {submissions.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{entry.name || '(未填姓名)'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{entry.email || '(未填邮箱)'}</div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>{entry.message || '(无留言)'}</div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#999' }}>
                    {new Date(entry.submittedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withWebMcpTools(FormPageClass);
