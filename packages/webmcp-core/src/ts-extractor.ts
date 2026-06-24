/**
 * TypeScript 类型提取器（v2 — 逆向追踪机制）。
 *
 * 从 registerGlobalTools() / useWebMcpTools() 调用向上追踪到函数定义，
 * 使用 ts-morph 解析参数类型 + JSDoc 注释，提取工具元数据。
 *
 * 支持两种参数形式：
 * 1. 对象字面量：{ fn1, fn2 } → 从 key 追踪到函数定义
 * 2. Namespace import：import * as api from './module' → 解析源模块所有导出函数
 */

import nodePath from 'node:path';
import {
  Project,
  SyntaxKind,
  type SourceFile,
  type CallExpression,
  type Type,
  type Symbol as MorphSymbol,
  type Node,
  type FunctionDeclaration,
  type ArrowFunction,
  type FunctionExpression,
  type MethodDeclaration,
} from 'ts-morph';
import type { PropertyInfo } from './schema-generator';

/** 提取出的工具元数据 */
export interface ExtractedTool {
  /** 工具名（对象 key 或导出函数名） */
  name: string;
  /** JSDoc 描述 */
  description: string;
  /** 参数属性列表 */
  properties: PropertyInfo[];
  /** 是否为只读工具（@readonly 标签） */
  readOnly: boolean;
  /** 来源文件路径（用于调试） */
  sourceFile: string;
  /**
   * 注入目标表达式。
   * 对于对象字面量参数中的本地变量：变量名，如 "searchInPanel"
   * 对于 namespace import：namespace.exportName，如 "userApi.getUser"
   * 对于 class 原型方法："ClassName.prototype.methodName"
   */
  injectionTarget: string;
  /**
   * class 成员类型。仅在 withWebMcpTools 场景下有值。
   * - 'prototype'：原型方法（MethodDeclaration）
   * - 'field'：class field 箭头函数（PropertyDeclaration）
   */
  memberType?: 'prototype' | 'field';
}

/** 注册调用的提取结果 */
export interface ExtractionResult {
  /** 提取到的工具列表 */
  tools: ExtractedTool[];
  /** 注册调用的位置信息（用于在调用前注入代码） */
  registrationCalls: {
    /** 调用类型 */
    type: 'registerGlobalTools' | 'useWebMcpTools' | 'withWebMcpTools';
    /** 调用在源码中的起始位置（字符偏移量） */
    start: number;
  }[];
}

/**
 * 模块路径别名映射（兼容 webpack / vite 的 alias 配置）。
 * key 为别名前缀（可用 `$` 后缀表示精确匹配），value 为目标绝对路径或相对 projectRoot 的路径。
 */
export type AliasMap = Record<string, string>;

// 需要追踪的注册函数名
const REGISTRATION_FUNCTIONS = ['registerGlobalTools', 'useWebMcpTools', 'withWebMcpTools'] as const;

const isDebug = () => (process.env.DEBUG ?? '').toLowerCase().includes('webmcp');

/**
 * 根据 alias 映射解析模块说明符。
 * 支持 webpack 风格：
 *   - 精确匹配：key 以 `$` 结尾（如 `xyz$`），仅在 spec 完全等于 `xyz` 时命中
 *   - 前缀匹配：spec 等于 key 或以 `key + '/'` 开头
 * 最长前缀优先。命中时返回替换后的路径，未命中返回 null。
 */
export function resolveWithAlias(spec: string, alias?: AliasMap): string | null {
  if (!alias) return null;
  const keys = Object.keys(alias).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const target = alias[key];
    if (typeof target !== 'string') continue;
    if (key.endsWith('$')) {
      if (spec === key.slice(0, -1)) return target;
      continue;
    }
    if (spec === key) return target;
    if (spec.startsWith(key + '/')) {
      return nodePath.join(target, spec.slice(key.length + 1));
    }
  }
  return null;
}

/**
 * 将 ts-morph Type 映射为简化的类型字符串（JSON Schema type）
 */
export function mapType(type: Type): string {
  if (type.isString() || type.isStringLiteral()) return 'string';
  if (type.isNumber() || type.isNumberLiteral()) return 'number';
  if (type.isBoolean() || type.isBooleanLiteral()) return 'boolean';
  if (type.isArray()) return 'array';

  // 联合类型 — 先剥离 undefined/null，再判断实际类型
  if (type.isUnion()) {
    const filtered = type.getUnionTypes().filter(t => !t.isUndefined() && !t.isNull());
    if (filtered.length === 0) return 'string';
    if (filtered.length === 1) return mapType(filtered[0]); // T | undefined → T
    if (filtered.every(t => t.isStringLiteral())) return 'string';
    if (filtered.every(t => t.isNumberLiteral())) return 'number';
    if (filtered.every(t => t.isBooleanLiteral())) return 'boolean';
    return 'string'; // 混合联合降级
  }

  // 对象类型（排除数组，数组已在上面处理）
  if (type.isObject() && !type.isArray()) return 'object';

  // null/undefined/any/unknown 显式处理
  if (type.isNull() || type.isUndefined()) return 'string';
  if (type.isAny() || type.isUnknown()) return 'string';

  return 'string'; // 默认降级
}

/** 获取数组的元素类型 */
function getArrayItemType(type: Type): string | undefined {
  if (!type.isArray()) return undefined;
  const typeArgs = type.getTypeArguments();
  if (typeArgs.length > 0) {
    return mapType(typeArgs[0]);
  }
  return 'string';
}

/** 提取字面量联合类型的 enum 值 */
function extractEnumValues(type: Type): string[] | undefined {
  if (!type.isUnion()) return undefined;
  const unionTypes = type.getUnionTypes().filter(t => !t.isUndefined() && !t.isNull());
  if (unionTypes.length === 0) return undefined;
  if (unionTypes.every(t => t.isStringLiteral())) {
    return unionTypes.map(t => t.getLiteralValue() as string);
  }
  return undefined;
}

/** 从类型的属性 Symbol 中获取 JSDoc 描述 */
function getPropertyDescription(symbol: MorphSymbol): string | undefined {
  const declarations = symbol.getDeclarations();
  for (const decl of declarations) {
    // 尝试从属性签名或属性声明获取 JSDoc
    const jsDocs = (decl as any).getJsDocs?.();
    if (jsDocs && jsDocs.length > 0) {
      const comment = jsDocs[0].getDescription?.();
      if (comment) return comment.trim();
    }

    // 回退：检查行内注释
    const fullText = decl.getFullText();
    const match = fullText.match(/\/\*\*\s*(.*?)\s*\*\//s);
    if (match) {
      const raw = match[1]
        .split('\n')
        .map((line: string) => line.replace(/^\s*\*\s?/, '').trim())
        .filter(Boolean)
        .join(' ');
      if (raw) return raw;
    }
  }
  return undefined;
}

/** 从一个 Type 提取所有属性信息 */
export function extractProperties(type: Type, depth: number = 0): PropertyInfo[] {
  const properties: PropertyInfo[] = [];
  for (const prop of type.getProperties()) {
    const propType = prop.getValueDeclaration()
      ? prop.getTypeAtLocation(prop.getValueDeclaration()!)
      : prop.getDeclaredType();

    const isOptional = prop.isOptional();
    const enumValues = extractEnumValues(propType);
    const mappedType = mapType(propType);

    let nestedProperties: PropertyInfo[] | undefined;
    if (mappedType === 'object' && depth < 3) {
      nestedProperties = extractProperties(propType, depth + 1);
    }

    properties.push({
      name: prop.getName(),
      type: mappedType,
      description: getPropertyDescription(prop),
      required: !isOptional,
      enumValues,
      itemType: getArrayItemType(propType),
      properties: nestedProperties,
    });
  }
  return properties;
}

/**
 * 从函数节点提取元数据：JSDoc 描述、@readonly 标签、参数类型
 */
function extractFunctionMetadata(
  node: FunctionDeclaration | ArrowFunction | FunctionExpression | Node,
  _sourceFile: SourceFile,
): { description: string; readOnly: boolean; properties: PropertyInfo[] } {
  let description = '';
  let readOnly = false;
  let properties: PropertyInfo[] = [];

  // --- 提取 JSDoc ---

  // 场景 1：函数声明（export async function xxx）
  if (node.getKind() === SyntaxKind.FunctionDeclaration) {
    const funcDecl = node as FunctionDeclaration;
    const jsDocs = funcDecl.getJsDocs();
    if (jsDocs.length > 0) {
      description = jsDocs[0].getDescription()?.trim() ?? '';
      // 检查 @readonly 标签
      const tags = jsDocs[0].getTags();
      readOnly = tags.some(tag => tag.getTagName() === 'readonly');
    }

    // 提取第一个参数的类型
    const params = funcDecl.getParameters();
    if (params.length > 0) {
      const paramType = params[0].getType();
      properties = extractProperties(paramType);
    }

    return { description, readOnly, properties };
  }

  // 场景 2：class 方法声明（class Foo { method(params) { ... } }）
  if (node.getKind() === SyntaxKind.MethodDeclaration) {
    const methodDecl = node as MethodDeclaration;
    const jsDocs = methodDecl.getJsDocs();
    if (jsDocs.length > 0) {
      description = jsDocs[0].getDescription()?.trim() ?? '';
      const tags = jsDocs[0].getTags();
      readOnly = tags.some(tag => tag.getTagName() === 'readonly');
    }

    const params = methodDecl.getParameters();
    if (params.length > 0) {
      const paramType = params[0].getType();
      properties = extractProperties(paramType);
    }

    return { description, readOnly, properties };
  }

  // 场景 3：箭头函数或函数表达式（const xxx = async (...) => { ... }）
  // 此时 JSDoc 在变量声明语句上
  if (
    node.getKind() === SyntaxKind.ArrowFunction ||
    node.getKind() === SyntaxKind.FunctionExpression
  ) {
    const funcNode = node as ArrowFunction | FunctionExpression;

    // 向上查找变量声明语句获取 JSDoc
    const parent = funcNode.getParent();
    if (parent) {
      // 可能被 useCallback 包裹：useCallback(async (...) => {...}, [])
      // 此时 parent 是 CallExpression，再向上才是变量声明
      let varStatement: Node | undefined;
      if (parent.getKind() === SyntaxKind.VariableDeclaration) {
        varStatement = parent.getParent()?.getParent(); // VariableDeclaration → VariableDeclarationList → VariableStatement
      } else if (parent.getKind() === SyntaxKind.CallExpression) {
        // useCallback(fn, deps) 情况
        const callParent = parent.getParent(); // VariableDeclaration
        if (callParent?.getKind() === SyntaxKind.VariableDeclaration) {
          varStatement = callParent.getParent()?.getParent();
        }
      }

      if (varStatement) {
        const jsDocs = (varStatement as any).getJsDocs?.();
        if (jsDocs && jsDocs.length > 0) {
          description = jsDocs[0].getDescription?.()?.trim() ?? '';
          const tags = jsDocs[0].getTags?.() ?? [];
          readOnly = tags.some((tag: any) => tag.getTagName() === 'readonly');
        }
      }
    }

    // 提取第一个参数的类型
    const params = funcNode.getParameters();
    if (params.length > 0) {
      const paramType = params[0].getType();
      properties = extractProperties(paramType);
    }

    return { description, readOnly, properties };
  }

  return { description, readOnly, properties };
}

/**
 * 从 BindingElement 提取工具元数据。
 *
 * 适用场景：`const { fn } = obj` 形式的解构。这种形式下函数体的 AST 节点不可达
 * （它定义在 obj 的源文件 / hook 内部）。改为通过类型系统：
 *   1. 用 BindingElement 的类型获取调用签名 → 第一个参数类型 → extractProperties
 *   2. 沿父链 BindingElement → ObjectBindingPattern → VariableDeclaration → initializer
 *      上去拿初始化表达式的类型，再用属性名查到属性 symbol，从其声明里读 JSDoc
 */
function extractToolFromBindingElement(
  bindingElement: Node,
  toolName: string,
  relPath: string,
): ExtractedTool | null {
  const be = bindingElement as any;
  const nameNode = be.getNameNode?.();
  if (!nameNode) return null;

  // 1) 通过 BindingElement 的类型拿到调用签名 → 第一个参数 → extractProperties
  const bindingType = nameNode.getType();
  const callSignatures = bindingType.getCallSignatures();
  if (callSignatures.length === 0) return null;

  let properties: PropertyInfo[] = [];
  const sig = callSignatures[0];
  const sigParams = sig.getParameters();
  if (sigParams.length > 0) {
    const paramSym = sigParams[0];
    const paramDecls = paramSym.getDeclarations();
    if (paramDecls.length > 0) {
      const paramType = paramSym.getTypeAtLocation(paramDecls[0]);
      properties = extractProperties(paramType);
    }
  }

  // 2) 走到初始化表达式，按属性名查 JSDoc
  // 处理 { foo: bar } 重命名形式：JSDoc 应当来自源属性（foo）而不是绑定名（bar）
  const propertyNameNode = be.getPropertyNameNode?.();
  const propertyName: string = propertyNameNode ? propertyNameNode.getText() : toolName;

  let description = '';
  let readOnly = false;
  const objectBindingPattern = bindingElement.getParent();
  const variableDecl = objectBindingPattern?.getParent();
  if (variableDecl && variableDecl.getKind() === SyntaxKind.VariableDeclaration) {
    const initializer = (variableDecl as any).getInitializer?.();
    if (initializer) {
      const initType = initializer.getType();
      let propSym = initType.getProperty(propertyName);
      // 联合类型（如 Foo | null）需要在每个非空成员上查
      if (!propSym && initType.isUnion?.()) {
        for (const t of initType.getUnionTypes()) {
          if (t.isNull?.() || t.isUndefined?.()) continue;
          propSym = t.getProperty(propertyName);
          if (propSym) break;
        }
      }
      if (propSym) {
        const propDecls = propSym.getDeclarations();
        for (const pdecl of propDecls) {
          const jsDocs = (pdecl as any).getJsDocs?.();
          if (jsDocs && jsDocs.length > 0) {
            description = jsDocs[0].getDescription?.()?.trim() ?? '';
            const tags = jsDocs[0].getTags?.() ?? [];
            readOnly = tags.some((t: any) => t.getTagName() === 'readonly');
            break;
          }
          // 回退：解析行内 /** */ 注释
          const fullText = pdecl.getFullText();
          const m = fullText.match(/\/\*\*\s*([\s\S]*?)\s*\*\//);
          if (m) {
            const raw = m[1]
              .split('\n')
              .map((line: string) => line.replace(/^\s*\*\s?/, '').trim())
              .filter(Boolean)
              .join(' ');
            if (raw) {
              description = raw;
              if (/@readonly\b/.test(m[1])) readOnly = true;
              break;
            }
          }
        }
      }
    }
  }

  return {
    name: toolName,
    description,
    properties,
    readOnly,
    sourceFile: relPath,
    injectionTarget: toolName,
  };
}

/**
 * 处理对象字面量参数：{ fn1, fn2 }
 * 从 shorthand property 追踪到函数定义并提取元数据
 */
function resolveObjectLiteralArg(
  arg: Node,
  sourceFile: SourceFile,
  project: Project,
  projectRoot?: string,
): ExtractedTool[] {
  const tools: ExtractedTool[] = [];

  if (arg.getKind() !== SyntaxKind.ObjectLiteralExpression) return tools;

  const objLiteral = arg as any; // ObjectLiteralExpression
  const filePath = sourceFile.getFilePath();
  const baseDir = projectRoot ?? process.cwd();
  const relPath = './' + nodePath.relative(baseDir, filePath).replace(/\.tsx?$/, '');

  for (const prop of objLiteral.getProperties()) {
    // 处理 shorthand property：{ searchInPanel } 等价于 { searchInPanel: searchInPanel }
    // 也处理 property assignment：{ customName: originalFn }
    let toolName: string;
    let valueNode: Node | undefined;

    if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
      toolName = prop.getName();
      // 追踪到变量定义
      // 注意：ShorthandPropertyAssignment 的 getSymbol() 返回属性自身的 symbol，
      // 而非引用的变量。需要使用 TypeScript 编译器 API 获取值 symbol。
      const tc = project.getTypeChecker().compilerObject;
      const valueSym = tc.getShorthandAssignmentValueSymbol(prop.compilerNode as any);
      if (!valueSym || !valueSym.declarations || valueSym.declarations.length === 0) continue;
      // 将 TS compiler node 转换为 ts-morph node
      const decl = (sourceFile as any)._getNodeFromCompilerNode(valueSym.declarations[0]) as Node;

      // 获取初始化表达式（变量赋值的右侧）
      if (decl.getKind() === SyntaxKind.VariableDeclaration) {
        valueNode = (decl as any).getInitializer?.();
      } else if (decl.getKind() === SyntaxKind.FunctionDeclaration) {
        valueNode = decl;
      } else if (decl.getKind() === SyntaxKind.Parameter) {
        // 函数参数场景，跳过
        continue;
      } else if (decl.getKind() === SyntaxKind.BindingElement) {
        // 解构形式 const { fn } = obj —— 函数节点不可达，直接通过类型系统提取
        const tool = extractToolFromBindingElement(decl, toolName, relPath);
        if (tool) tools.push(tool);
        continue;
      }
    } else if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      toolName = prop.getName();
      valueNode = (prop as any).getInitializer?.();
    } else {
      continue;
    }

    if (!valueNode) continue;

    // 如果 valueNode 是 useCallback 调用，取第一个参数（实际的函数）
    let funcNode = valueNode;
    if (valueNode.getKind() === SyntaxKind.CallExpression) {
      const callExpr = valueNode as any;
      const callName = callExpr.getExpression().getText();
      if (callName === 'useCallback') {
        const args = callExpr.getArguments();
        if (args.length > 0) {
          funcNode = args[0];
        }
      }
    }

    // 如果 funcNode 是标识符（引用了 import 的函数），追踪到定义
    if (funcNode.getKind() === SyntaxKind.Identifier) {
      const symbol = funcNode.getSymbol();
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations.length > 0) {
          const decl = declarations[0];
          if (decl.getKind() === SyntaxKind.FunctionDeclaration) {
            funcNode = decl;
          } else if (decl.getKind() === SyntaxKind.VariableDeclaration) {
            const init = (decl as any).getInitializer?.();
            if (init) funcNode = init;
          }
        }
      }
    }

    const metadata = extractFunctionMetadata(funcNode, sourceFile);

    // 确定 injectionTarget：必须是运行时作用域中可赋值的表达式
    let injectionTarget = toolName;
    if (prop.getKind() === SyntaxKind.PropertyAssignment) {
      const valueKind = valueNode.getKind();
      if (
        valueKind === SyntaxKind.Identifier ||
        valueKind === SyntaxKind.PropertyAccessExpression
      ) {
        injectionTarget = valueNode.getText();
      } else {
        // 非简单表达式（inline 函数、类型断言、调用表达式等）无法安全注入，跳过
        continue;
      }
    }

    tools.push({
      name: toolName,
      description: metadata.description,
      properties: metadata.properties,
      readOnly: metadata.readOnly,
      sourceFile: relPath,
      injectionTarget,
    });
  }

  return tools;
}

/**
 * 处理 namespace import 参数：import * as api from './module'
 * 解析源模块的所有导出函数并提取元数据
 */
function resolveNamespaceImportArg(
  arg: Node,
  sourceFile: SourceFile,
  project: Project,
  projectRoot?: string,
  alias?: AliasMap,
): ExtractedTool[] {
  const tools: ExtractedTool[] = [];

  if (arg.getKind() !== SyntaxKind.Identifier) return tools;

  const identifier = arg as any;
  const symbol = identifier.getSymbol();
  if (!symbol) return tools;

  // 检查是否是 namespace import（import * as xxx from '...'）
  const declarations = symbol.getDeclarations();
  if (declarations.length === 0) return tools;

  const decl = declarations[0];
  if (decl.getKind() !== SyntaxKind.NamespaceImport) return tools;

  // 获取 import 声明
  const importDecl = decl.getParent()?.getParent(); // NamespaceImport → ImportClause → ImportDeclaration
  if (!importDecl) return tools;

  const moduleSpecifier = (importDecl as any).getModuleSpecifierValue?.();
  if (!moduleSpecifier) return tools;

  // 解析模块路径：优先尝试 alias，其次相对路径，其它 bare specifier 视为无法解析
  const currentDir = nodePath.dirname(sourceFile.getFilePath());
  const aliasResolved = resolveWithAlias(moduleSpecifier, alias);
  let resolvedPath: string | null = null;

  if (aliasResolved) {
    resolvedPath = nodePath.isAbsolute(aliasResolved)
      ? aliasResolved
      : nodePath.resolve(projectRoot ?? currentDir, aliasResolved);
  } else if (moduleSpecifier.startsWith('.') || nodePath.isAbsolute(moduleSpecifier)) {
    resolvedPath = nodePath.resolve(currentDir, moduleSpecifier);
  }

  if (!resolvedPath) {
    if (isDebug()) {
      console.warn(
        `[webmcp] skip bare module specifier "${moduleSpecifier}" in ${sourceFile.getFilePath()} (no alias match)`,
      );
    }
    return tools;
  }

  // 尝试添加 .ts 扩展名
  const possibleExtensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
  let targetFile: SourceFile | undefined;

  for (const ext of possibleExtensions) {
    const tryPath = resolvedPath + ext;
    targetFile = project.getSourceFile(tryPath);
    if (targetFile) break;
  }

  // 如果项目中没有该文件，尝试添加到项目
  if (!targetFile) {
    for (const ext of possibleExtensions) {
      const tryPath = resolvedPath + ext;
      try {
        targetFile = project.addSourceFileAtPath(tryPath);
        if (targetFile) break;
      } catch (err) {
        // 文件不存在，继续尝试
        if (isDebug()) {
          console.warn(`[webmcp] failed to add source file: ${tryPath}`, err);
        }
      }
    }
  }

  if (!targetFile) {
    console.warn(
      `[webmcp] cannot resolve module "${moduleSpecifier}" from ${sourceFile.getFilePath()}. ` +
        `Tried extensions: ${possibleExtensions.join(', ')}. Resolved base: ${resolvedPath}`,
    );
    return tools;
  }

  const namespaceName = identifier.getText();
  const baseDir = projectRoot ?? process.cwd();
  const relPath =
    './' + nodePath.relative(baseDir, targetFile.getFilePath()).replace(/\.tsx?$/, '');

  // 遍历源模块的所有导出声明
  for (const exportedDecl of targetFile.getExportedDeclarations()) {
    const [exportName, declarations] = exportedDecl;
    if (declarations.length === 0) continue;

    const exportNode = declarations[0];

    // 只处理函数声明和箭头函数变量
    let funcNode: Node | undefined;

    if (exportNode.getKind() === SyntaxKind.FunctionDeclaration) {
      funcNode = exportNode;
    } else if (exportNode.getKind() === SyntaxKind.VariableDeclaration) {
      const init = (exportNode as any).getInitializer?.();
      if (
        init &&
        (init.getKind() === SyntaxKind.ArrowFunction ||
          init.getKind() === SyntaxKind.FunctionExpression)
      ) {
        funcNode = init;
      }
    }

    if (!funcNode) continue;

    const metadata = extractFunctionMetadata(funcNode, targetFile);

    tools.push({
      name: exportName,
      description: metadata.description,
      properties: metadata.properties,
      readOnly: metadata.readOnly,
      sourceFile: relPath,
      injectionTarget: `${namespaceName}.${exportName}`,
    });
  }

  return tools;
}

// React 生命周期方法黑名单，不应被注册为工具
const REACT_LIFECYCLE_METHODS = new Set([
  'constructor', 'render',
  'componentDidMount', 'componentDidUpdate', 'componentWillUnmount',
  'shouldComponentUpdate', 'getSnapshotBeforeUpdate',
  'componentDidCatch', 'getDerivedStateFromProps', 'getDerivedStateFromError',
  'UNSAFE_componentWillMount', 'UNSAFE_componentWillReceiveProps', 'UNSAFE_componentWillUpdate',
]);

/**
 * 解析 withWebMcpTools(MyClass) / withWebMcpTools(MyClass, ['method1']) 调用参数。
 * 从 class 声明中提取原型方法和 class field 箭头函数的工具元数据。
 */
function resolveClassComponentArg(
  args: Node[],
  sourceFile: SourceFile,
  _project: Project,
  projectRoot?: string,
): ExtractedTool[] {
  const tools: ExtractedTool[] = [];
  if (args.length === 0) return tools;

  const firstArg = args[0];
  if (firstArg.getKind() !== SyntaxKind.Identifier) return tools;

  // 解析第一个参数到 class 声明
  const symbol = firstArg.getSymbol();
  if (!symbol) return tools;

  const declarations = symbol.getDeclarations();
  if (declarations.length === 0) return tools;

  let classDecl: Node | undefined;
  for (const decl of declarations) {
    if (decl.getKind() === SyntaxKind.ClassDeclaration) {
      classDecl = decl;
      break;
    }
    // const Foo = class { } 形式
    if (decl.getKind() === SyntaxKind.VariableDeclaration) {
      const init = (decl as any).getInitializer?.();
      if (init && init.getKind() === SyntaxKind.ClassExpression) {
        classDecl = init;
        break;
      }
    }
  }

  if (!classDecl) return tools;

  // 获取 class 名称
  const className = firstArg.getText();
  if (!className) {
    console.warn(`[webmcp] withWebMcpTools: anonymous class is not supported, skipping.`);
    return tools;
  }

  // 解析第二个参数（可选）：显式方法名列表
  let explicitMethods: Set<string> | null = null;
  if (args.length > 1 && args[1].getKind() === SyntaxKind.ArrayLiteralExpression) {
    explicitMethods = new Set<string>();
    const arrayLiteral = args[1] as any;
    for (const element of arrayLiteral.getElements()) {
      if (element.getKind() === SyntaxKind.StringLiteral) {
        explicitMethods.add(element.getLiteralValue());
      }
    }
  }

  const filePath = sourceFile.getFilePath();
  const baseDir = projectRoot ?? process.cwd();
  const relPath = './' + nodePath.relative(baseDir, filePath).replace(/\.tsx?$/, '');

  // 遍历 class 成员
  const members = (classDecl as any).getMembers?.() ?? [];
  for (const member of members) {
    const memberKind = member.getKind();

    // --- 原型方法 (MethodDeclaration) ---
    if (memberKind === SyntaxKind.MethodDeclaration) {
      const name = member.getName?.();
      if (!name || REACT_LIFECYCLE_METHODS.has(name)) continue;
      if (explicitMethods && !explicitMethods.has(name)) continue;

      const metadata = extractFunctionMetadata(member, sourceFile);
      // 自动模式：仅提取带 JSDoc 的方法
      if (!explicitMethods && !metadata.description) continue;

      tools.push({
        name,
        description: metadata.description,
        properties: metadata.properties,
        readOnly: metadata.readOnly,
        sourceFile: relPath,
        injectionTarget: `${className}.prototype.${name}`,
        memberType: 'prototype',
      });
    }

    // --- Class Field 箭头函数 (PropertyDeclaration) ---
    if (memberKind === SyntaxKind.PropertyDeclaration) {
      const name = member.getName?.();
      if (!name || REACT_LIFECYCLE_METHODS.has(name)) continue;
      if (explicitMethods && !explicitMethods.has(name)) continue;

      // 检查 initializer 是否为 ArrowFunction 或 FunctionExpression
      const initializer = member.getInitializer?.();
      if (!initializer) continue;
      const initKind = initializer.getKind();
      if (initKind !== SyntaxKind.ArrowFunction && initKind !== SyntaxKind.FunctionExpression) continue;

      // JSDoc 从 PropertyDeclaration 节点直接提取
      let description = '';
      let readOnly = false;
      const jsDocs = member.getJsDocs?.();
      if (jsDocs && jsDocs.length > 0) {
        description = jsDocs[0].getDescription?.()?.trim() ?? '';
        const tags = jsDocs[0].getTags?.() ?? [];
        readOnly = tags.some((tag: any) => tag.getTagName() === 'readonly');
      }

      // 自动模式：仅提取带 JSDoc 的方法
      if (!explicitMethods && !description) continue;

      // 从 ArrowFunction 提取参数类型
      let properties: PropertyInfo[] = [];
      const funcNode = initializer as any;
      const params = funcNode.getParameters?.();
      if (params && params.length > 0) {
        const paramType = params[0].getType();
        properties = extractProperties(paramType);
      }

      tools.push({
        name,
        description,
        properties,
        readOnly,
        sourceFile: relPath,
        injectionTarget: `${className}.__webmcpFieldSchemas`,
        memberType: 'field',
      });
    }
  }

  return tools;
}

/**
 * 从源文件中提取所有 registerGlobalTools / useWebMcpTools / withWebMcpTools 调用引用的工具
 *
 * @param fileContent - 源文件内容
 * @param filePath - 源文件绝对路径
 * @returns 提取结果，包含工具列表和注册调用位置信息
 */
export function extractToolsFromFile(
  fileContent: string,
  filePath: string,
  projectRoot?: string,
  alias?: AliasMap,
): ExtractionResult | null {
  // 快速检测：文件中是否包含注册调用
  const hasRegistration = REGISTRATION_FUNCTIONS.some(fn => fileContent.includes(fn));
  if (!hasRegistration) return null;

  if (isDebug()) {
    console.log(
      `[webmcp] extractToolsFromFile: ${filePath}, projectRoot=${projectRoot ?? '(none)'}`,
    );
  }

  try {
    const project = new Project({
      compilerOptions: {
        strict: true,
        target: 99, // ESNext
        module: 99, // ESNext
        jsx: 4, // ReactJSX
        moduleResolution: 100, // Bundler
        esModuleInterop: true,
        ...(projectRoot ? { rootDir: projectRoot, baseUrl: projectRoot } : {}),
      },
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: false,
    });

    const sourceFile = project.createSourceFile(filePath, fileContent, {
      overwrite: true,
    });

    const result: ExtractionResult = {
      tools: [],
      registrationCalls: [],
    };

    // 遍历所有调用表达式，查找注册函数调用
    sourceFile.forEachDescendant(node => {
      if (node.getKind() !== SyntaxKind.CallExpression) return;

      const callExpr = node as CallExpression;
      const exprText = callExpr.getExpression().getText();

      // 检查是否为目标注册函数
      if (!REGISTRATION_FUNCTIONS.includes(exprText as any)) return;

      // 记录调用位置
      result.registrationCalls.push({
        type: exprText as (typeof REGISTRATION_FUNCTIONS)[number],
        start: callExpr.getStart(),
      });

      // 解析每个参数
      const args = callExpr.getArguments();

      // withWebMcpTools 的参数是 class 引用，需用专门的解析逻辑
      if (exprText === 'withWebMcpTools') {
        const tools = resolveClassComponentArg(args, sourceFile, project, projectRoot);
        result.tools.push(...tools);
        return;
      }

      for (const arg of args) {
        if (arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
          // 对象字面量：{ fn1, fn2 }
          const tools = resolveObjectLiteralArg(arg, sourceFile, project, projectRoot);
          result.tools.push(...tools);
        } else if (arg.getKind() === SyntaxKind.Identifier) {
          // 可能是 namespace import：import * as api from './module'
          const tools = resolveNamespaceImportArg(arg, sourceFile, project, projectRoot, alias);
          result.tools.push(...tools);
        }
      }
    });

    if (result.tools.length === 0) {
      if (isDebug()) {
        console.warn(`[webmcp] no tools extracted from ${filePath}`);
      }
      return null;
    }

    return result;
  } catch (err) {
    console.warn(
      `[webmcp] extractToolsFromFile failed for ${filePath}:`,
      err instanceof Error ? err.message : err,
    );
    if (isDebug()) {
      console.warn(`[webmcp] full error:`, err);
    }
    return null;
  }
}
