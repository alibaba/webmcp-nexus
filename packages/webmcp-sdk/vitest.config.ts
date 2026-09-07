import { defineConfig } from 'vitest/config';

export default defineConfig({
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
