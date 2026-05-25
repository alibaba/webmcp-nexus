import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/loader.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  shims: true,
  external: ['webpack', 'webmcp-nexus-core'],
});
