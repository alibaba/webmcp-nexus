// 统一变换入口
export { transformCode } from './transform';
export type { TransformOptions, TransformResult } from './transform';

// 底层 API（供高级用户或测试使用）
export { extractToolsFromFile, mapType, extractProperties, resolveWithAlias } from './ts-extractor';
export type { ExtractedTool, ExtractionResult, AliasMap } from './ts-extractor';

export { generateSchema, generateSchemaInjectionCode, mapTypeToSchema } from './schema-generator';
export type { JsonSchema, PropertyInfo } from './schema-generator';
