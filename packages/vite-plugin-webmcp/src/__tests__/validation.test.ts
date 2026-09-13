import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ResolvedConfig } from 'vite';
import { vitePluginWebMcp } from '../index';

const source = `
/** Search the catalog. */
function 搜索() { return []; }
registerGlobalTools({ 搜索 });
`;

let root: string;
let filePath: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'webmcp-vite-validation-'));
  fs.mkdirSync(path.join(root, 'src'));
  filePath = path.join(root, 'src', 'tools.ts');
  fs.writeFileSync(filePath, source);
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('tool name validation', () => {
  it('propagates invalid tool names from the real core transform', () => {
    const plugin = vitePluginWebMcp();
    const configure = plugin.configResolved as (config: ResolvedConfig) => void;
    configure({ root, resolve: { alias: [] } } as unknown as ResolvedConfig);
    const transform = plugin.transform as (
      this: { warn(message: string): void },
      code: string,
      id: string,
    ) => unknown;
    const warn = vi.fn();

    expect(() => transform.call({ warn }, source, filePath)).toThrow(/Invalid tool name "搜索"/);
    expect(warn).not.toHaveBeenCalled();
  });
});
