import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { extractProperties } from '../ts-extractor';

/**
 * 从 interface 声明创建 ts-morph Type 对象
 */
function getObjectType(interfaceStr: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('test.ts', `${interfaceStr}\ntype T = Params;`);
  const typeAlias = sourceFile.getTypeAliasOrThrow('T');
  return typeAlias.getType();
}

describe('extractProperties', () => {
  it('简单对象 — 正确提取属性名、类型、required', () => {
    const type = getObjectType('interface Params { name: string; age: number }');
    const props = extractProperties(type);

    expect(props).toHaveLength(2);

    const nameProp = props.find(p => p.name === 'name')!;
    expect(nameProp.type).toBe('string');
    expect(nameProp.required).toBe(true);

    const ageProp = props.find(p => p.name === 'age')!;
    expect(ageProp.type).toBe('number');
    expect(ageProp.required).toBe(true);
  });

  it('可选属性 — age? 的 required 为 false', () => {
    const type = getObjectType('interface Params { name: string; age?: number }');
    const props = extractProperties(type);

    expect(props).toHaveLength(2);

    const nameProp = props.find(p => p.name === 'name')!;
    expect(nameProp.required).toBe(true);

    const ageProp = props.find(p => p.name === 'age')!;
    expect(ageProp.required).toBe(false);
    expect(ageProp.type).toBe('number');
  });

  it('枚举属性 — 提取 enumValues', () => {
    const type = getObjectType(`interface Params { role: 'admin' | 'user' }`);
    const props = extractProperties(type);

    expect(props).toHaveLength(1);
    const roleProp = props[0];
    expect(roleProp.name).toBe('role');
    expect(roleProp.type).toBe('string');
    expect(roleProp.enumValues).toEqual(['admin', 'user']);
  });

  it('嵌套对象 — 递归提取 properties', () => {
    const type = getObjectType('interface Params { filter: { min: number; max: number } }');
    const props = extractProperties(type);

    expect(props).toHaveLength(1);
    const filterProp = props[0];
    expect(filterProp.name).toBe('filter');
    expect(filterProp.type).toBe('object');
    expect(filterProp.properties).toBeDefined();
    expect(filterProp.properties).toHaveLength(2);

    const minProp = filterProp.properties!.find(p => p.name === 'min')!;
    expect(minProp.type).toBe('number');

    const maxProp = filterProp.properties!.find(p => p.name === 'max')!;
    expect(maxProp.type).toBe('number');
  });

  it('数组属性 — type 为 array, itemType 为 string', () => {
    const type = getObjectType('interface Params { tags: string[] }');
    const props = extractProperties(type);

    expect(props).toHaveLength(1);
    const tagsProp = props[0];
    expect(tagsProp.name).toBe('tags');
    expect(tagsProp.type).toBe('array');
    expect(tagsProp.itemType).toBe('string');
  });
});
