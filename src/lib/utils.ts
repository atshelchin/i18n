/**
 * @shelchin/i18n v2.0 Utility Functions
 */

import type { TranslationContent, LocaleData } from './types.js';

/**
 * Get nested value from object using dot notation
 * @example getNestedValue({ a: { b: 'hello' } }, 'a.b') => 'hello'
 */
export function getNestedValue(
	obj: LocaleData | TranslationContent | undefined,
	path: string
): string | undefined {
	if (!obj) return undefined;

	const keys = path.split('.');
	let current: unknown = obj;

	for (const key of keys) {
		// Skip _meta
		if (key === '_meta') return undefined;

		if (!isObject(current) || !(key in current)) {
			return undefined;
		}

		current = (current as Record<string, unknown>)[key];
	}

	return typeof current === 'string' ? current : undefined;
}

/**
 * Check if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: T): T {
	if (!source) return target;
	if (!target) return source;

	const result = { ...target };

	for (const key in source) {
		if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

		const sourceValue = source[key];
		const targetValue = result[key];

		if (key === '_meta') {
			(result as Record<string, unknown>)[key] = sourceValue;
			continue;
		}

		if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
			(result as Record<string, unknown>)[key] = deepMerge(
				targetValue as Record<string, unknown>,
				sourceValue as Record<string, unknown>
			);
		} else {
			(result as Record<string, unknown>)[key] = sourceValue;
		}
	}

	return result;
}

/**
 * Check if value is a plain object
 */
export function isPlainObject(value: unknown): boolean {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extract namespace from translation key
 * @example extractNamespace('home.title') => 'home'
 * @example extractNamespace('dashboard.stats.users') => 'dashboard'
 */
export function extractNamespace(key: string): string {
	const dotIndex = key.indexOf('.');
	return dotIndex > 0 ? key.substring(0, dotIndex) : key;
}

/**
 * Extract the key path without namespace
 * @example extractKeyPath('home.title') => 'title'
 * @example extractKeyPath('dashboard.stats.users') => 'stats.users'
 */
export function extractKeyPath(key: string): string {
	const dotIndex = key.indexOf('.');
	return dotIndex > 0 ? key.substring(dotIndex + 1) : key;
}

/**
 * Interpolate parameters into translation string
 * Supports: {key}, {key:number}, {key:currency}, {key:percent}
 */
export function interpolate(
	template: string,
	params: Record<string, string | number> | undefined,
	locale: string
): string {
	if (!params) return template;

	return template.replace(/\{(\w+)(?::(\w+))?\}/g, (match, paramKey, format) => {
		const paramValue = params[paramKey];

		if (paramValue === undefined) {
			return match; // Keep original placeholder
		}

		// Apply formatting if specified
		if (format && typeof paramValue === 'number') {
			switch (format) {
				case 'number':
					return paramValue.toLocaleString(locale);
				case 'currency':
					return new Intl.NumberFormat(locale, {
						style: 'currency',
						currency: 'USD'
					}).format(paramValue);
				case 'percent':
					return new Intl.NumberFormat(locale, {
						style: 'percent'
					}).format(paramValue);
				default:
					return String(paramValue);
			}
		}

		return String(paramValue);
	});
}

/**
 * Get plural form key based on count
 * Supports: _zero, _one, _two, _few, _many, _other
 */
export function getPluralKey(baseKey: string, count: number): string {
	if (count === 0) return `${baseKey}_zero`;
	if (count === 1) return `${baseKey}_one`;
	// if (count === 2) return `${baseKey}_two`;
	return `${baseKey}_other`;
}

/**
 * Parse Vite glob import modules to locale loaders
 * @example parseGlobImports(import.meta.glob('./locales/** /*.json'))
 */
export function parseGlobImports(
	modules: Record<string, () => Promise<unknown>>
): { locale: string; namespace: string; loader: () => Promise<unknown> }[] {
	const results: { locale: string; namespace: string; loader: () => Promise<unknown> }[] = [];

	for (const [path, loader] of Object.entries(modules)) {
		// Expected path format: ./locales/{locale}/{namespace}.json
		// or: /src/locales/{locale}/{namespace}.json
		const match = path.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\/([^/]+)\.json$/);
		if (match) {
			const [, locale, namespace] = match;
			results.push({ locale, namespace, loader });
		}
	}

	return results;
}
