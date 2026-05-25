import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginWebMcp } from 'vite-plugin-webmcp-nexus';

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  plugins: [
    react(),
    vitePluginWebMcp({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
  build: {
    minify: false,
  },
});
