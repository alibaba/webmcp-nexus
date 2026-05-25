import { describe, it, expect, vi } from 'vitest';
import { transformCode } from 'webmcp-nexus-core';
import webmcpLoader from '../loader';

vi.mock('webmcp-nexus-core', () => ({
  transformCode: vi.fn(),
}));

const mockedTransformCode = vi.mocked(transformCode);

function createLoaderContext(resourcePath: string, options: Record<string, unknown> = {}) {
  return {
    resourcePath,
    getOptions: () => options,
    emitWarning: vi.fn(),
  } as any;
}

describe('webmcpLoader', () => {
  it('should return original source when transformCode returns transformed: false', () => {
    const source = 'const foo = 1;';
    mockedTransformCode.mockReturnValue({ code: source, transformed: false });

    const context = createLoaderContext('/project/src/foo.ts');
    const result = webmcpLoader.call(context, source);

    expect(mockedTransformCode).toHaveBeenCalledWith(source, '/project/src/foo.ts', {
      projectRoot: undefined,
    });
    expect(result).toBe(source);
  });

  it('should return transformed code when source contains registerGlobalTools', () => {
    const source = 'registerGlobalTools({ search: searchTool });';
    const transformed = '// injected schema\nregisterGlobalTools({ search: searchTool });';
    mockedTransformCode.mockReturnValue({
      code: transformed,
      transformed: true,
    });

    const context = createLoaderContext('/project/src/tools.ts');
    const result = webmcpLoader.call(context, source);

    expect(mockedTransformCode).toHaveBeenCalledWith(source, '/project/src/tools.ts', {
      projectRoot: undefined,
    });
    expect(result).toBe(transformed);
  });

  it('should pass resourcePath as filePath to transformCode', () => {
    const source = 'some code';
    mockedTransformCode.mockReturnValue({ code: source, transformed: false });

    const context = createLoaderContext('/my/project/src/app.tsx');
    webmcpLoader.call(context, source);

    expect(mockedTransformCode).toHaveBeenCalledWith(source, '/my/project/src/app.tsx', {
      projectRoot: undefined,
    });
  });
});
