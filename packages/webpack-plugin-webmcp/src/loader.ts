import type { LoaderContext } from 'webpack';
import { transformCode, type AliasMap } from 'webmcp-nexus-core';

interface WebMcpLoaderOptions {
  projectRoot?: string;
  alias?: AliasMap;
}

const isDebug = () => (process.env.DEBUG ?? '').toLowerCase().includes('webmcp');

export default function webmcpLoader(
  this: LoaderContext<WebMcpLoaderOptions>,
  source: string,
): string {
  const filePath = this.resourcePath;
  const options = this.getOptions() ?? {};

  if (isDebug()) {
    console.log(`[webmcp] loader processing: ${filePath}`);
  }

  try {
    const result = transformCode(source, filePath, {
      projectRoot: options.projectRoot,
      alias: options.alias,
    });

    if (result.transformed) {
      if (isDebug()) {
        console.log(`[webmcp] transformed: ${filePath}`);
      }
      return result.code;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    this.emitWarning(new Error(`[webmcp] transform failed for ${filePath}: ${message}`));
    if (isDebug()) {
      console.warn(`[webmcp] transform error:`, err);
    }
  }

  return source;
}
