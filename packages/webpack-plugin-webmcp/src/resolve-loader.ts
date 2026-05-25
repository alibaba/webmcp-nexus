import path from 'node:path';

/** 解析 loader 的绝对路径，供 Plugin 注入 Webpack rule */
export function resolveLoaderPath(): string {
  // __dirname works in CJS natively and in ESM via tsup's shims
  return path.resolve(__dirname, 'loader.js');
}
