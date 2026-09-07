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
 * 构建期注入的 __webmcpSchema 载荷。
 * 可选字段仅在有值时写入，避免产物膨胀。
 */
export interface WebMcpSchemaPayload {
  description: string;
  inputSchema: JsonSchema;
  readOnly: boolean;
  title?: string;
  untrustedContent?: boolean;
  consequential?: boolean;
}

/**
 * WebMCP 工具名约束（与 polyfill 5.x 的 VALID_TOOL_NAME_RE、WebMCP §4.2 一致）。
 * polyfill 2.x 不校验名称，5.x 起不合法会抛 InvalidStateError；relay 5.x 还会把
 * 工具列表校验失败升级为 `socket.close(1008, 'Invalid tool list')`，直接切断整个
 * tab 的连接。因此校验必须左移到构建期。
 */
export const WEBMCP_TOOL_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/u;

/**
 * 校验工具名，不合法时**构建报错**（而非静默跳过）。
 *
 * 静默跳过会让开发者在运行时才发现工具根本没注册；而这类名字在 WebMCP 下永远
 * 不可能注册成功，越早失败越好。
 */
export function assertValidToolName(name: string, injectionTarget: string): void {
  if (!WEBMCP_TOOL_NAME_PATTERN.test(name)) {
    throw new Error(
      `[webmcp] Invalid tool name "${name}" (at ${injectionTarget}). ` +
        `WebMCP tool names must be 1-128 characters and contain only ASCII letters, ` +
        `digits, underscore, hyphen, or period. Rename the function to fix the build.`,
    );
  }
}

/**
 * 空描述兜底：polyfill 5.x / Chrome 对空 description 抛 InvalidStateError（2.x 不校验）。
 *
 * `ts-extractor` 的 `if (!explicitMethods && !description) continue` 在**显式列名**时
 * 会短路不跳过，所以 `withWebMcpTools(Cls, ['m'])` 且方法无 JSDoc 就会产出空描述。
 * 构建期兜底让"产物即合法"，SDK 侧的同名兜底退化为二重保险。
 */
export function resolveToolDescription(
  description: string,
  toolName: string,
  injectionTarget: string,
): string {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  console.warn(
    `[webmcp] Tool "${toolName}" (at ${injectionTarget}) has no JSDoc description; ` +
      `falling back to the tool name. WebMCP requires a non-empty description — ` +
      `add one so agents can tell what the tool does.`,
  );
  return toolName;
}

function buildSchemaPayload(
  toolName: string,
  injectionTarget: string,
  description: string,
  properties: PropertyInfo[],
  readOnly: boolean,
  extras?: ToolSchemaExtras,
): WebMcpSchemaPayload {
  assertValidToolName(toolName, injectionTarget);

  const inputSchema = generateSchema(properties);
  // 移除顶层的 description（inputSchema 不需要）
  delete inputSchema.description;

  const title = extras?.title?.trim();
  return {
    description: resolveToolDescription(description, toolName, injectionTarget),
    inputSchema,
    readOnly,
    ...(title ? { title } : {}),
    ...(extras?.untrustedContent ? { untrustedContent: true } : {}),
    ...(extras?.consequential ? { consequential: true } : {}),
  };
}

/** 来自 JSDoc 标签的可选协议字段（@title / @untrusted / @consequential） */
export interface ToolSchemaExtras {
  title?: string;
  untrustedContent?: boolean;
  consequential?: boolean;
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
 * @param extras - 可选：工具名（用于校验与空描述兜底）与 JSDoc 标签派生的协议字段
 * @returns 注入代码字符串
 */
export function generateSchemaInjectionCode(
  injectionTarget: string,
  description: string,
  properties: PropertyInfo[],
  readOnly: boolean,
  extras?: ToolSchemaExtras & { toolName?: string },
): string {
  // 未传 toolName 时从注入目标推导（取最后一段，兼容 "ns.fn" 与 "Cls.prototype.fn"）
  const toolName = extras?.toolName ?? injectionTarget.split('.').pop() ?? injectionTarget;
  const schemaObj = buildSchemaPayload(
    toolName,
    injectionTarget,
    description,
    properties,
    readOnly,
    extras,
  );

  return `${injectionTarget}.__webmcpSchema = ${JSON.stringify(schemaObj, null, 2)};`;
}

/**
 * 为 class field 箭头函数生成聚合的静态属性注入代码。
 *
 * 输出形如：
 * ```
 * ClassName.__webmcpFieldSchemas = { "method1": {...}, "method2": {...} };
 * ```
 *
 * @param className - class 名称
 * @param fieldTools - class field 工具元数据列表
 * @returns 注入代码字符串
 */
export function generateFieldSchemasInjectionCode(
  className: string,
  fieldTools: Array<
    {
      name: string;
      description: string;
      properties: PropertyInfo[];
      readOnly: boolean;
    } & ToolSchemaExtras
  >,
): string {
  const schemas: Record<string, WebMcpSchemaPayload> = {};
  for (const tool of fieldTools) {
    schemas[tool.name] = buildSchemaPayload(
      tool.name,
      `${className}.__webmcpFieldSchemas`,
      tool.description,
      tool.properties,
      tool.readOnly,
      tool,
    );
  }
  return `${className}.__webmcpFieldSchemas = ${JSON.stringify(schemas, null, 2)};`;
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
