import { extractToolsFromFile, type AliasMap } from './ts-extractor';
import { generateSchemaInjectionCode, generateFieldSchemasInjectionCode } from './schema-generator';

export interface TransformOptions {
  projectRoot?: string;
  /**
   * 构建工具的模块路径 alias 映射（已归一化为 prefix → 目标路径）。
   * 用于解析 `import * as api from '@alias/xxx'` 类形式的模块说明符。
   */
  alias?: AliasMap;
}

export interface TransformResult {
  code: string;
  transformed: boolean;
}

/**
 * 统一的 transform 入口函数。
 *
 * 检测源码中是否包含 registerGlobalTools / useWebMcpTools 调用，
 * 提取工具类型信息并生成 __webmcpSchema 注入代码。
 *
 * @param code - 源文件内容
 * @param filePath - 源文件绝对路径
 * @param _options - 可选配置
 * @returns 变换结果，包含处理后的代码和是否发生了变换
 */
const isDebug = () => (process.env.DEBUG ?? '').toLowerCase().includes('webmcp');

export function transformCode(
  code: string,
  filePath: string,
  options: TransformOptions = {},
): TransformResult {
  // 快速检测：文件中是否包含注册调用
  if (!code.includes('registerGlobalTools') && !code.includes('useWebMcpTools') && !code.includes('withWebMcpTools')) {
    return { code, transformed: false };
  }

  if (isDebug()) {
    console.log(
      `[webmcp] transformCode: ${filePath}, projectRoot=${options.projectRoot ?? '(none)'}`,
    );
  }

  // 提取工具信息
  const result = extractToolsFromFile(code, filePath, options.projectRoot, options.alias);
  if (!result || result.tools.length === 0) {
    return { code, transformed: false };
  }

  // 生成注入代码
  const injections: string[] = [];

  // 原型方法和普通函数：逐个注入 __webmcpSchema
  for (const tool of result.tools) {
    if (tool.memberType === 'field') continue; // field 类型单独处理
    const injectionCode = generateSchemaInjectionCode(
      tool.injectionTarget,
      tool.description,
      tool.properties,
      tool.readOnly,
    );
    injections.push(injectionCode);
  }

  // Class field 箭头函数：按 className 分组后聚合注入 __webmcpFieldSchemas
  const fieldToolsByClass = new Map<string, Array<{ name: string; description: string; properties: typeof result.tools[0]['properties']; readOnly: boolean }>>();
  for (const tool of result.tools) {
    if (tool.memberType !== 'field') continue;
    // injectionTarget 格式为 "ClassName.__webmcpFieldSchemas"
    const className = tool.injectionTarget.replace('.__webmcpFieldSchemas', '');
    if (!fieldToolsByClass.has(className)) {
      fieldToolsByClass.set(className, []);
    }
    fieldToolsByClass.get(className)!.push({
      name: tool.name,
      description: tool.description,
      properties: tool.properties,
      readOnly: tool.readOnly,
    });
  }
  for (const [className, fieldTools] of fieldToolsByClass) {
    injections.push(generateFieldSchemasInjectionCode(className, fieldTools));
  }

  if (injections.length === 0) {
    return { code, transformed: false };
  }

  // 将注入代码插入到第一个注册调用之前
  const firstCall = result.registrationCalls.sort((a, b) => a.start - b.start)[0];

  const injectionBlock =
    '\n// [webmcp-nexus-core] 构建时注入的 schema 元数据\n' + injections.join('\n') + '\n';

  const newCode = code.slice(0, firstCall.start) + injectionBlock + code.slice(firstCall.start);

  return { code: newCode, transformed: true };
}
