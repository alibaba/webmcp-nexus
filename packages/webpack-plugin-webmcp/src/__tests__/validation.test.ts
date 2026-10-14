import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import webmcpLoader from '../loader';

const source = `
/** Search the catalog. */
function 搜索() { return []; }
registerGlobalTools({ 搜索 });
`;

let root: string;
let filePath: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-webpack-validation-'));
  filePath = path.join(root, 'tools.ts');
  fs.writeFileSync(filePath, source);
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('tool name validation', () => {
  it.each([4, 5])('propagates invalid tool names with a webpack %i context', version => {
    const options = { projectRoot: root };
    const emitWarning = vi.fn();
    const context = {
      resourcePath: filePath,
      emitWarning,
      ...(version === 5 ? { getOptions: () => options } : { query: options }),
    } as unknown as ThisParameterType<typeof webmcpLoader>;

    expect(() => webmcpLoader.call(context, source)).toThrow(/Invalid tool name "搜索"/);
    expect(emitWarning).not.toHaveBeenCalled();
  });
});
