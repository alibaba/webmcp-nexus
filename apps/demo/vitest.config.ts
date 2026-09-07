import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vitePluginWebMcp } from 'vite-plugin-webmcp-nexus';

export default defineConfig({
  plugins: [
    react(),
    vitePluginWebMcp({
      // 刻意排除 src/__tests__：demo 测试用手工标注的 __webmcpSchema fixture 验证
      // SDK ↔ polyfill ↔ 宿主 的运行时契约，需要确定性；构建插件的抽取与字段传播
      // 由 webmcp-nexus-core 自己的测试套件覆盖（含 @title/@untrusted/@consequential）。
      // 另外构建期新增的工具名校验会 throw，测试里的非法名 fixture 必须绕开插件。
      include: [
        'src/tools/**/*.ts',
        'src/store/**/*.tsx',
        'src/pages/**/*.tsx',
        'src/components/**/*.tsx',
        'src/App.tsx',
        'src/main.tsx',
      ],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    // 必须钉住可信 origin：polyfill 5.x 的 validateExecutableOrigin 拒绝 'null' origin，
    // jsdom 默认的 about:blank 会让 executeTool 全部抛 NotSupportedError。
    // 另外 polyfill 的安装门槛是 `isSecureContext === false`（严格等值），jsdom 返回
    // undefined 故不早退——不要把它理解成 !isSecureContext。
    environmentOptions: { jsdom: { url: 'http://localhost:3000/' } },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
