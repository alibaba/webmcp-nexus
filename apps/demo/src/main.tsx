import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';
import * as navigation from './tools/navigation';
import App from './App';
import './index.css';

// 应用启动时注册「全局只保留的通用查询 + 路由跳转」工具。
// 业务的增 / 改 / 删等操作工具，由各页面 / 组件在挂载时按作用域局部注册。
registerGlobalTools(queries, navigation);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
