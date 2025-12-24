/**
 * @shelchin/i18n v2.0 Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
	getNestedValue,
	getNestedArray,
	extractNamespace,
	extractKeyPath,
	interpolate,
	getPluralKey,
	parseGlobImports,
	deepMerge,
	getLocaleCurrency,
	formatNumber,
	formatCurrency,
	formatPercent,
	formatDate,
	formatTime,
	formatDateTime,
	formatScientific,
	formatSubscript,
	createFormatter
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

describe('getNestedArray', () => {
	it('should get simple array', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const obj = { features: ['a', 'b', 'c'] } as any;
		expect(getNestedArray(obj, 'features')).toEqual(['a', 'b', 'c']);
	});

	it('should get nested array', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const obj = { home: { features: ['x', 'y', 'z'] } } as any;
		expect(getNestedArray(obj, 'home.features')).toEqual(['x', 'y', 'z']);
	});

	it('should return undefined for missing key', () => {
		const obj = { title: 'Hello' };
		expect(getNestedArray(obj, 'missing')).toBeUndefined();
	});

	it('should return undefined for non-array values', () => {
		const obj = { title: 'Hello' };
		expect(getNestedArray(obj, 'title')).toBeUndefined();
	});

	it('should return undefined for arrays with non-string items', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const obj = { items: [1, 2, 3] } as any;
		expect(getNestedArray(obj, 'items')).toBeUndefined();
	});

	it('should handle undefined input', () => {
		expect(getNestedArray(undefined, 'key')).toBeUndefined();
	});
});

// ========================================
// Formatting Tests
// ========================================

describe('getLocaleCurrency', () => {
	it('should return correct currency for language codes', () => {
		expect(getLocaleCurrency('zh')).toBe('CNY');
		expect(getLocaleCurrency('en')).toBe('USD');
		expect(getLocaleCurrency('de')).toBe('EUR');
		expect(getLocaleCurrency('ja')).toBe('JPY');
		expect(getLocaleCurrency('pt')).toBe('EUR');
	});

	it('should return correct currency for locale with region', () => {
		expect(getLocaleCurrency('en-US')).toBe('USD');
		expect(getLocaleCurrency('en-GB')).toBe('GBP');
		expect(getLocaleCurrency('zh-TW')).toBe('TWD');
		expect(getLocaleCurrency('pt-BR')).toBe('BRL');
		expect(getLocaleCurrency('de-CH')).toBe('CHF');
	});

	it('should fall back to language code when region not found', () => {
		// en-XX not in map, falls back to 'en' -> USD
		expect(getLocaleCurrency('en-XX')).toBe('USD');
	});

	it('should default to USD for unknown locales', () => {
		expect(getLocaleCurrency('xx')).toBe('USD');
		expect(getLocaleCurrency('unknown')).toBe('USD');
	});
});

describe('formatNumber', () => {
	it('should format number with locale-specific separators', () => {
		// English uses comma for thousands
		expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56');
		// German uses period for thousands and comma for decimal
		expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56');
	});

	it('should respect decimals option', () => {
		expect(formatNumber(1234.5, 'en-US', { decimals: 2 })).toBe('1,234.50');
		expect(formatNumber(1234.567, 'en-US', { decimals: 2 })).toBe('1,234.57');
	});

	it('should respect useGrouping option', () => {
		expect(formatNumber(1234567, 'en-US', { useGrouping: false })).toBe('1234567');
	});

	it('should handle compact notation', () => {
		const result = formatNumber(1234567, 'en-US', { notation: 'compact' });
		expect(result).toContain('M'); // 1.2M
	});
});

describe('formatCurrency', () => {
	it('should format USD correctly', () => {
		const result = formatCurrency(99.99, 'en-US', 'USD');
		expect(result).toContain('$');
		expect(result).toContain('99.99');
	});

	it('should format EUR in German locale', () => {
		const result = formatCurrency(99.99, 'de-DE', 'EUR');
		expect(result).toContain('€');
		expect(result).toContain('99,99');
	});

	it('should format CNY in Chinese locale', () => {
		const result = formatCurrency(99.99, 'zh-CN', 'CNY');
		expect(result).toContain('¥');
	});

	it('should auto-detect currency from locale when not provided', () => {
		// Chinese -> CNY (uses ¥)
		expect(formatCurrency(99.99, 'zh')).toMatch(/¥|￥/);
		// English -> USD
		expect(formatCurrency(99.99, 'en')).toContain('$');
		// German -> EUR
		expect(formatCurrency(99.99, 'de')).toContain('€');
		// Japanese -> JPY (uses ￥ full-width yen)
		expect(formatCurrency(99, 'ja')).toMatch(/¥|￥/);
	});

	it('should handle locale with region code', () => {
		// en-GB -> GBP
		expect(formatCurrency(99.99, 'en-GB')).toContain('£');
		// pt-BR -> BRL
		const brResult = formatCurrency(99.99, 'pt-BR');
		expect(brResult).toContain('R$');
	});
});

describe('formatPercent', () => {
	it('should format percentage correctly', () => {
		expect(formatPercent(0.75, 'en-US')).toBe('75%');
	});

	it('should respect decimals option', () => {
		const result = formatPercent(0.7555, 'en-US', { decimals: 1 });
		expect(result).toBe('75.6%');
	});

	it('should use locale-specific formatting', () => {
		// German uses space before %
		const result = formatPercent(0.75, 'de-DE');
		expect(result).toContain('75');
		expect(result).toContain('%');
	});
});

describe('formatDate', () => {
	const testDate = new Date('2025-12-24T14:30:00');

	it('should format date with short style', () => {
		const result = formatDate(testDate, 'en-US');
		expect(result).toContain('12');
		expect(result).toContain('24');
		// Short format may use 2-digit year (25) or 4-digit year (2025)
		expect(result).toMatch(/25|2025/);
	});

	it('should format date with long style', () => {
		const result = formatDate(testDate, 'en-US', { style: 'long' });
		expect(result).toContain('December');
		expect(result).toContain('24');
		expect(result).toContain('2025');
	});

	it('should use locale-specific formatting', () => {
		// German format: day.month.year
		const result = formatDate(testDate, 'de-DE');
		expect(result).toContain('24');
		expect(result).toContain('12');
	});

	it('should accept timestamp', () => {
		const timestamp = testDate.getTime();
		const result = formatDate(timestamp, 'en-US');
		expect(result).toContain('12');
		expect(result).toContain('24');
	});
});

describe('formatTime', () => {
	const testDate = new Date('2025-12-24T14:30:00');

	it('should format time with short style', () => {
		const result = formatTime(testDate, 'en-US');
		// US uses 12-hour format
		expect(result).toMatch(/2:30|14:30/);
	});

	it('should use locale-specific formatting', () => {
		// German uses 24-hour format
		const result = formatTime(testDate, 'de-DE');
		expect(result).toContain('14:30');
	});
});

describe('formatDateTime', () => {
	const testDate = new Date('2025-12-24T14:30:00');

	it('should format both date and time', () => {
		const result = formatDateTime(testDate, 'en-US');
		expect(result).toContain('12');
		expect(result).toContain('24');
		expect(result).toMatch(/2:30|14:30/);
	});
});

describe('formatScientific', () => {
	it('should format large numbers in scientific notation', () => {
		const result = formatScientific(1234567890, 'en-US');
		expect(result).toMatch(/1\.23.*E9|1\.23.*e\+?9/i);
	});

	it('should format small numbers in scientific notation', () => {
		const result = formatScientific(0.0000000033, 'en-US');
		expect(result).toMatch(/3\.3.*E-9|3\.3.*e-9/i);
	});

	it('should respect decimals option', () => {
		const result = formatScientific(1234567890, 'en-US', { decimals: 1 });
		expect(result).toMatch(/1\.2.*E9|1\.2.*e\+?9/i);
	});
});

describe('formatSubscript', () => {
	it('should format very small numbers with subscript notation', () => {
		// 0.0000000000033 = 3.3e-12, should become 0.0₁₁33
		const result = formatSubscript(0.0000000000033, 'en-US');
		expect(result).toContain('0.0');
		expect(result).toContain('₁');
		expect(result).toContain('33');
	});

	it('should use locale decimal separator', () => {
		const result = formatSubscript(0.0000000000033, 'de-DE');
		expect(result).toContain('0,0'); // German uses comma
		expect(result).toContain('₁');
	});

	it('should fall back to standard format for larger numbers', () => {
		const result = formatSubscript(0.5, 'en-US');
		expect(result).toBe('0.5');
	});

	it('should handle negative small numbers', () => {
		const result = formatSubscript(-0.0000000000033, 'en-US');
		expect(result).toContain('-');
		expect(result).toContain('0.0');
	});
});

describe('createFormatter', () => {
	it('should create a formatter bound to locale', () => {
		const formatter = createFormatter('en-US');

		expect(formatter.number(1234.56)).toBe('1,234.56');
		expect(formatter.currency(99.99, 'USD')).toContain('$');
		expect(formatter.percent(0.75)).toBe('75%');
	});

	it('should work with different locales', () => {
		const deFormatter = createFormatter('de-DE');

		expect(deFormatter.number(1234.56)).toBe('1.234,56');
		expect(deFormatter.currency(99.99, 'EUR')).toContain('€');
	});
});

describe('interpolate with formatting', () => {
	it('should format number with :number', () => {
		const result = interpolate('Total: {amount:number}', { amount: 1234.56 }, 'en-US');
		expect(result).toBe('Total: 1,234.56');
	});

	it('should format number with decimals :number:2', () => {
		const result = interpolate('Price: {price:number:2}', { price: 99.9 }, 'en-US');
		expect(result).toBe('Price: 99.90');
	});

	it('should format currency with :currency:USD', () => {
		const result = interpolate('Cost: {amount:currency:USD}', { amount: 99.99 }, 'en-US');
		expect(result).toContain('$');
		expect(result).toContain('99.99');
	});

	it('should format percent with :percent', () => {
		const result = interpolate('Progress: {value:percent}', { value: 0.75 }, 'en-US');
		expect(result).toBe('Progress: 75%');
	});

	it('should format scientific with :scientific', () => {
		const result = interpolate('Value: {num:scientific}', { num: 1234567890 }, 'en-US');
		expect(result).toMatch(/Value:.*E.*9/i);
	});

	it('should format subscript with :subscript', () => {
		const result = interpolate('Tiny: {num:subscript}', { num: 0.0000000000033 }, 'en-US');
		expect(result).toContain('Tiny:');
		expect(result).toContain('₁');
	});

	it('should format date with :date', () => {
		const testDate = new Date('2025-12-24');
		const result = interpolate('Date: {d:date}', { d: testDate }, 'en-US');
		expect(result).toContain('12');
		expect(result).toContain('24');
	});

	it('should format date with :date:long', () => {
		const testDate = new Date('2025-12-24');
		const result = interpolate('Date: {d:date:long}', { d: testDate }, 'en-US');
		expect(result).toContain('December');
	});

	it('should format timestamp as date', () => {
		const timestamp = new Date('2025-12-24').getTime();
		const result = interpolate('Date: {d:date}', { d: timestamp }, 'en-US');
		expect(result).toContain('12');
		expect(result).toContain('24');
	});

	it('should work with German locale', () => {
		const result = interpolate('Preis: {amount:number}', { amount: 1234.56 }, 'de-DE');
		expect(result).toBe('Preis: 1.234,56');
	});
});
