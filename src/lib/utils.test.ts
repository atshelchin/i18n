/**
 * @shelchin/i18n v2.0 Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
	getNestedValue,
	extractNamespace,
	extractKeyPath,
	interpolate,
	getPluralKey,
	parseGlobImports,
	deepMerge
} from './utils.js';

describe('getNestedValue', () => {
	it('should get simple value', () => {
		const obj = { title: 'Hello' };
		expect(getNestedValue(obj, 'title')).toBe('Hello');
	});

	it('should get nested value', () => {
		const obj = { home: { title: 'Welcome' } };
		expect(getNestedValue(obj, 'home.title')).toBe('Welcome');
	});

	it('should get deeply nested value', () => {
		const obj = { dashboard: { stats: { users: 'Total Users' } } };
		expect(getNestedValue(obj, 'dashboard.stats.users')).toBe('Total Users');
	});

	it('should return undefined for missing key', () => {
		const obj = { title: 'Hello' };
		expect(getNestedValue(obj, 'missing')).toBeUndefined();
	});

	it('should return undefined for _meta key', () => {
		const obj = { _meta: { code: 'en' }, title: 'Hello' };
		expect(getNestedValue(obj, '_meta')).toBeUndefined();
	});

	it('should return undefined for non-string values', () => {
		const obj = { nested: { child: { value: 'test' } } };
		expect(getNestedValue(obj, 'nested.child')).toBeUndefined();
	});

	it('should handle undefined input', () => {
		expect(getNestedValue(undefined, 'key')).toBeUndefined();
	});
});

describe('extractNamespace', () => {
	it('should extract namespace from key', () => {
		expect(extractNamespace('home.title')).toBe('home');
	});

	it('should extract namespace from nested key', () => {
		expect(extractNamespace('dashboard.stats.users')).toBe('dashboard');
	});

	it('should return whole key if no dot', () => {
		expect(extractNamespace('title')).toBe('title');
	});
});

describe('extractKeyPath', () => {
	it('should extract key path from key', () => {
		expect(extractKeyPath('home.title')).toBe('title');
	});

	it('should extract key path from nested key', () => {
		expect(extractKeyPath('dashboard.stats.users')).toBe('stats.users');
	});

	it('should return whole key if no dot', () => {
		expect(extractKeyPath('title')).toBe('title');
	});
});

describe('interpolate', () => {
	it('should interpolate simple parameter', () => {
		expect(interpolate('Hello, {name}!', { name: 'World' }, 'en')).toBe('Hello, World!');
	});

	it('should interpolate multiple parameters', () => {
		expect(interpolate('{greeting}, {name}!', { greeting: 'Hello', name: 'World' }, 'en')).toBe(
			'Hello, World!'
		);
	});

	it('should keep placeholder if param missing', () => {
		expect(interpolate('Hello, {name}!', {}, 'en')).toBe('Hello, {name}!');
	});

	it('should handle undefined params', () => {
		expect(interpolate('Hello, World!', undefined, 'en')).toBe('Hello, World!');
	});

	it('should format number with :number', () => {
		const result = interpolate('{count:number} items', { count: 1234 }, 'en');
		expect(result).toContain('1');
		expect(result).toContain('234');
	});

	it('should format currency with :currency', () => {
		const result = interpolate('Price: {amount:currency}', { amount: 99.99 }, 'en');
		expect(result).toContain('99');
	});

	it('should format percent with :percent', () => {
		const result = interpolate('Progress: {value:percent}', { value: 0.75 }, 'en');
		expect(result).toContain('75');
	});
});

describe('getPluralKey', () => {
	it('should return _zero for count 0', () => {
		expect(getPluralKey('items', 0)).toBe('items_zero');
	});

	it('should return _one for count 1', () => {
		expect(getPluralKey('items', 1)).toBe('items_one');
	});

	it('should return _other for count >= 2', () => {
		expect(getPluralKey('items', 2)).toBe('items_other');
		expect(getPluralKey('items', 5)).toBe('items_other');
		expect(getPluralKey('items', 100)).toBe('items_other');
	});
});

describe('parseGlobImports', () => {
	it('should parse locale and namespace from glob paths', () => {
		const modules = {
			'./locales/en/common.json': () => Promise.resolve({}),
			'./locales/en/home.json': () => Promise.resolve({}),
			'./locales/zh/common.json': () => Promise.resolve({})
		};

		const result = parseGlobImports(modules);

		expect(result).toHaveLength(3);
		expect(result).toContainEqual(expect.objectContaining({ locale: 'en', namespace: 'common' }));
		expect(result).toContainEqual(expect.objectContaining({ locale: 'en', namespace: 'home' }));
		expect(result).toContainEqual(expect.objectContaining({ locale: 'zh', namespace: 'common' }));
	});

	it('should handle paths with full src prefix', () => {
		const modules = {
			'/src/locales/en/common.json': () => Promise.resolve({})
		};

		const result = parseGlobImports(modules);

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ locale: 'en', namespace: 'common' });
	});
});

describe('deepMerge', () => {
	it('should merge two simple objects', () => {
		const target = { a: 1, b: 0 };
		const source = { a: 1, b: 2 };
		expect(deepMerge(target, source)).toEqual({ a: 1, b: 2 });
	});

	it('should merge nested objects', () => {
		const target = { a: { b: 1, c: 0 } };
		const source = { a: { b: 1, c: 2 } };
		expect(deepMerge(target, source)).toEqual({ a: { b: 1, c: 2 } });
	});

	it('should override _meta entirely', () => {
		const target = { _meta: { code: 'en', name: '' } };
		const source = { _meta: { code: 'zh', name: '中文' } };
		expect(deepMerge(target, source)).toEqual({ _meta: { code: 'zh', name: '中文' } });
	});

	it('should handle null/undefined inputs', () => {
		expect(deepMerge(null as unknown as Record<string, unknown>, { a: 1 })).toEqual({ a: 1 });
		expect(deepMerge({ a: 1 }, null as unknown as Record<string, unknown>)).toEqual({ a: 1 });
	});
});
