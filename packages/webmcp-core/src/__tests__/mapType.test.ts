import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { mapType } from '../ts-extractor';

/**
 * 从类型字符串创建 ts-morph Type 对象
 */
function getTypeFromSource(typeStr: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('test.ts', `type T = ${typeStr};`);
  const typeAlias = sourceFile.getTypeAliasOrThrow('T');
  return typeAlias.getType();
}

describe('mapType', () => {
  describe('基础类型', () => {
    it('string → "string"', () => {
      expect(mapType(getTypeFromSource('string'))).toBe('string');
    });

    it('number → "number"', () => {
      expect(mapType(getTypeFromSource('number'))).toBe('number');
    });

    it('boolean → "boolean"', () => {
      expect(mapType(getTypeFromSource('boolean'))).toBe('boolean');
    });
  });

  describe('字面量类型', () => {
    it('"hello" → "string"', () => {
      expect(mapType(getTypeFromSource('"hello"'))).toBe('string');
    });

    it('42 → "number"', () => {
      expect(mapType(getTypeFromSource('42'))).toBe('number');
    });

    it('true → "boolean"', () => {
      expect(mapType(getTypeFromSource('true'))).toBe('boolean');
    });
  });

  describe('数组类型', () => {
    it('string[] → "array"', () => {
      expect(mapType(getTypeFromSource('string[]'))).toBe('array');
    });

    it('number[] → "array"', () => {
      expect(mapType(getTypeFromSource('number[]'))).toBe('array');
    });
  });

  describe('联合类型', () => {
    it('"a" | "b" → "string"（字面量联合）', () => {
      expect(mapType(getTypeFromSource('"a" | "b"'))).toBe('string');
    });

    it('1 | 2 → "number"（数字字面量联合）', () => {
      expect(mapType(getTypeFromSource('1 | 2'))).toBe('number');
    });

    it('number | undefined → "number"（可选联合，剥离 undefined）', () => {
      expect(mapType(getTypeFromSource('number | undefined'))).toBe('number');
    });

    it('string | null → "string"（剥离 null）', () => {
      expect(mapType(getTypeFromSource('string | null'))).toBe('string');
    });
  });

  describe('对象类型', () => {
    it('{ foo: string } → "object"', () => {
      expect(mapType(getTypeFromSource('{ foo: string }'))).toBe('object');
    });
  });

  describe('特殊类型', () => {
    it('null → "string"（降级）', () => {
      expect(mapType(getTypeFromSource('null'))).toBe('string');
    });

    it('undefined → "string"（降级）', () => {
      expect(mapType(getTypeFromSource('undefined'))).toBe('string');
    });

    it('any → "string"（降级）', () => {
      expect(mapType(getTypeFromSource('any'))).toBe('string');
    });

    it('unknown → "string"（降级）', () => {
      expect(mapType(getTypeFromSource('unknown'))).toBe('string');
    });
  });
});
