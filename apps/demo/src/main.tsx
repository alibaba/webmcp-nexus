import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as queries from './tools/queries';
import * as navigation from './tools/navigation';
import * as canvas from './tools/canvas';
import App from './App';
import './index.css';

registerGlobalTools(queries, navigation, canvas);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
