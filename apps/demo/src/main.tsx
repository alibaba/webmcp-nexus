import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerGlobalTools } from 'webmcp-nexus-sdk';
import * as navigation from './tools/navigation';
import App from './App';
import './index.css';

registerGlobalTools(navigation);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
