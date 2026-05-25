import { describe, it, expect } from 'vitest';
import {
  mapTypeToSchema,
  generateSchemaInjectionCode,
  generateSchema,
  type PropertyInfo,
} from '../schema-generator';

describe('mapTypeToSchema', () => {
  it('string 属性 → { type: "string" }', () => {
    const prop: PropertyInfo = { name: 'title', type: 'string', required: true };
    const schema = mapTypeToSchema(prop);
    expect(schema).toEqual({ type: 'string' });
  });

  it('number 属性 → { type: "number" }', () => {
    const prop: PropertyInfo = { name: 'count', type: 'number', required: true };
    const schema = mapTypeToSchema(prop);
    expect(schema).toEqual({ type: 'number' });
  });

  it('boolean 属性 → { type: "boolean" }', () => {
    const prop: PropertyInfo = { name: 'active', type: 'boolean', required: true };
    const schema = mapTypeToSchema(prop);
    expect(schema).toEqual({ type: 'boolean' });
  });

  it('带 description → 包含 description 字段', () => {
    const prop: PropertyInfo = {
      name: 'name',
      type: 'string',
      required: true,
      description: 'The user name',
    };
    const schema = mapTypeToSchema(prop);
    expect(schema.description).toBe('The user name');
    expect(schema.type).toBe('string');
  });

  it('带 enumValues → 包含 enum 字段', () => {
    const prop: PropertyInfo = {
      name: 'role',
      type: 'string',
      required: true,
      enumValues: ['admin', 'user'],
    };
    const schema = mapTypeToSchema(prop);
    expect(schema.type).toBe('string');
    expect(schema.enum).toEqual(['admin', 'user']);
  });

  it('array 属性 → { type: "array", items: { type: "string" } }', () => {
    const prop: PropertyInfo = {
      name: 'tags',
      type: 'array',
      required: true,
      itemType: 'string',
    };
    const schema = mapTypeToSchema(prop);
    expect(schema.type).toBe('array');
    expect(schema.items).toEqual({ type: 'string' });
  });

  it('object 属性（带 properties）→ 嵌套 schema', () => {
    const prop: PropertyInfo = {
      name: 'filter',
      type: 'object',
      required: true,
      properties: [
        { name: 'min', type: 'number', required: true },
        { name: 'max', type: 'number', required: false },
      ],
    };
    const schema = mapTypeToSchema(prop);
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.properties!.min).toEqual({ type: 'number' });
    expect(schema.properties!.max).toEqual({ type: 'number' });
    expect(schema.required).toEqual(['min']);
  });
});

describe('generateSchema', () => {
  it('required 字段正确性 — 只包含必填属性', () => {
    const props: PropertyInfo[] = [
      { name: 'name', type: 'string', required: true },
      { name: 'age', type: 'number', required: false },
    ];
    const schema = generateSchema(props);
    expect(schema.required).toEqual(['name']);
  });

  it('全部可选 — 无 required 字段', () => {
    const props: PropertyInfo[] = [{ name: 'name', type: 'string', required: false }];
    const schema = generateSchema(props);
    expect(schema.required).toBeUndefined();
  });

  it('带 description → schema 包含 description', () => {
    const schema = generateSchema([], 'A test tool');
    expect(schema.description).toBe('A test tool');
  });
});

describe('generateSchemaInjectionCode', () => {
  it('生成的代码包含 __webmcpSchema', () => {
    const code = generateSchemaInjectionCode('myFunc', 'test tool', [], false);
    expect(code).toContain('__webmcpSchema');
    expect(code).toContain('myFunc.__webmcpSchema');
  });

  it('包含正确的 description', () => {
    const code = generateSchemaInjectionCode('fn', 'Search users', [], false);
    expect(code).toContain('"Search users"');
  });

  it('包含正确的 readOnly 值', () => {
    const codeReadOnly = generateSchemaInjectionCode('fn', 'desc', [], true);
    expect(codeReadOnly).toContain('"readOnly": true');

    const codeNotReadOnly = generateSchemaInjectionCode('fn', 'desc', [], false);
    expect(codeNotReadOnly).toContain('"readOnly": false');
  });

  it('生成的 JSON 可以被解析', () => {
    const props: PropertyInfo[] = [
      { name: 'query', type: 'string', required: true, description: 'search term' },
    ];
    const code = generateSchemaInjectionCode('searchFn', 'Search', props, false);

    // 提取 JSON 部分（= 后面到 ; 之前）
    const jsonStr = code.replace(/^[^=]+=\s*/, '').replace(/;\s*$/, '');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.description).toBe('Search');
    expect(parsed.readOnly).toBe(false);
    expect(parsed.inputSchema).toBeDefined();
    expect(parsed.inputSchema.type).toBe('object');
    expect(parsed.inputSchema.properties.query.type).toBe('string');
  });
});
