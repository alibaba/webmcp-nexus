/**
 * 将 TypeScript 类型信息转换为 JSON Schema。
 * 支持的映射规则见设计文档 3.2 节。
 */

export interface JsonSchema {
  type: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
}

export interface PropertyInfo {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  enumValues?: string[];
  itemType?: string;
  properties?: PropertyInfo[];
}

/**
 * 从提取到的属性信息生成 JSON Schema
 */
export function generateSchema(properties: PropertyInfo[], description?: string): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  if (description) {
    schema.description = description;
  }

  for (const prop of properties) {
    const propSchema = mapTypeToSchema(prop);
    schema.properties![prop.name] = propSchema;

    if (prop.required) {
      schema.required!.push(prop.name);
    }
  }

  if (schema.required!.length === 0) {
    delete schema.required;
  }

  return schema;
}

/**
 * 生成 __webmcpSchema 属性注入代码。
 *
 * 输出形如：
 * ```
 * target.__webmcpSchema = { description: "...", inputSchema: {...}, readOnly: false };
 * ```
 *
 * @param injectionTarget - 注入目标表达式（如 "searchInPanel" 或 "userApi.getUser"）
 * @param description - 工具描述
 * @param properties - 参数属性列表
 * @param readOnly - 是否只读
 * @returns 注入代码字符串
 */
export function generateSchemaInjectionCode(
  injectionTarget: string,
  description: string,
  properties: PropertyInfo[],
  readOnly: boolean,
): string {
  const inputSchema = generateSchema(properties);
  // 移除顶层的 description（inputSchema 不需要）
  delete inputSchema.description;

  const schemaObj = {
    description,
    inputSchema,
    readOnly,
  };

  return `${injectionTarget}.__webmcpSchema = ${JSON.stringify(schemaObj, null, 2)};`;
}

export function mapTypeToSchema(prop: PropertyInfo): JsonSchema {
  const schema: JsonSchema = { type: 'string' };

  if (prop.description) {
    schema.description = prop.description;
  }

  if (prop.enumValues && prop.enumValues.length > 0) {
    schema.type = 'string';
    schema.enum = prop.enumValues;
    return schema;
  }

  switch (prop.type) {
    case 'string':
      schema.type = 'string';
      break;
    case 'number':
      schema.type = 'number';
      break;
    case 'boolean':
      schema.type = 'boolean';
      break;
    case 'array':
      schema.type = 'array';
      if (prop.itemType) {
        schema.items = { type: prop.itemType };
      }
      break;
    case 'object':
      schema.type = 'object';
      if (prop.properties && prop.properties.length > 0) {
        schema.properties = {};
        const required: string[] = [];
        for (const subProp of prop.properties) {
          schema.properties[subProp.name] = mapTypeToSchema(subProp);
          if (subProp.required) required.push(subProp.name);
        }
        if (required.length > 0) schema.required = required;
      }
      break;
    default:
      schema.type = 'string';
  }

  return schema;
}
