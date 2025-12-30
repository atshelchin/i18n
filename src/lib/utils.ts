/**
 * @shelchin/i18n v2.0 Utility Functions
 */

import type {
	TranslationContent,
	LocaleData,
	FormatNumberOptions,
	FormatCurrencyOptions,
	FormatDateOptions,
	FormatTimeOptions,
	FormatDateTimeOptions,
	I18nFormatter
} from './types.js';

// ========================================
// Subscript digits for small number notation
// ========================================
const SUBSCRIPT_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/**
 * Convert a number to subscript notation
 * @example toSubscript(12) => '₁₂'
 */
function toSubscript(num: number): string {
	return String(num)
		.split('')
		.map((d) => SUBSCRIPT_DIGITS[parseInt(d, 10)])
		.join('');
}

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
 * Get nested array from object using dot notation (string[] only)
 * @example getNestedArray({ features: ['a', 'b', 'c'] }, 'features') => ['a', 'b', 'c']
 */
export function getNestedArray(
	obj: LocaleData | TranslationContent | undefined,
	path: string
): string[] | undefined {
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

	// Return array if it's an array of strings
	if (Array.isArray(current) && current.every((item) => typeof item === 'string')) {
		return current as string[];
	}

	return undefined;
}

/**
 * Get nested data from object using dot notation (generic version)
 * Returns any type of data: string, array, object, etc.
 * @example getNestedData({ faqs: [...] }, 'faqs') => [...]
 * @example getNestedData({ user: { name: 'foo' } }, 'user') => { name: 'foo' }
 */
export function getNestedData<T>(
	obj: LocaleData | TranslationContent | undefined,
	path: string
): T | undefined {
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

	return current as T;
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
 * Supports formats:
 * - {key} - plain value
 * - {key:number} - locale-formatted number
 * - {key:number:2} - number with 2 decimal places
 * - {key:currency:USD} - currency format
 * - {key:percent} - percentage format
 * - {key:scientific} - scientific notation
 * - {key:subscript} - subscript notation for small numbers
 * - {key:date} - date format
 * - {key:date:long} - date with style
 * - {key:time} - time format
 * - {key:datetime} - date and time
 */
export function interpolate(
	template: string,
	params: Record<string, string | number | Date> | undefined,
	locale: string
): string {
	if (!params) return template;

	// Match {key} or {key:format} or {key:format:arg}
	return template.replace(/\{(\w+)(?::(\w+)(?::(\w+))?)?\}/g, (match, paramKey, format, arg) => {
		const paramValue = params[paramKey];

		if (paramValue === undefined) {
			return match; // Keep original placeholder
		}

		// No format specified - return as string
		if (!format) {
			return String(paramValue);
		}

		// Handle Date values
		if (paramValue instanceof Date) {
			switch (format) {
				case 'date':
					return formatDate(
						paramValue,
						locale,
						arg ? { style: arg as 'short' | 'medium' | 'long' | 'full' } : undefined
					);
				case 'time':
					return formatTime(
						paramValue,
						locale,
						arg ? { style: arg as 'short' | 'medium' | 'long' | 'full' } : undefined
					);
				case 'datetime':
					return formatDateTime(paramValue, locale);
				default:
					return paramValue.toISOString();
			}
		}

		// Handle number values
		if (typeof paramValue === 'number') {
			switch (format) {
				case 'number': {
					const decimals = arg ? parseInt(arg, 10) : undefined;
					return formatNumber(
						paramValue,
						locale,
						decimals !== undefined ? { decimals } : undefined
					);
				}
				case 'currency': {
					const currency = arg || 'USD';
					return formatCurrency(paramValue, locale, currency);
				}
				case 'percent': {
					const decimals = arg ? parseInt(arg, 10) : undefined;
					return formatPercent(
						paramValue,
						locale,
						decimals !== undefined ? { decimals } : undefined
					);
				}
				case 'scientific': {
					const decimals = arg ? parseInt(arg, 10) : undefined;
					return formatScientific(
						paramValue,
						locale,
						decimals !== undefined ? { decimals } : undefined
					);
				}
				case 'subscript': {
					const decimals = arg ? parseInt(arg, 10) : undefined;
					return formatSubscript(
						paramValue,
						locale,
						decimals !== undefined ? { decimals } : undefined
					);
				}
				case 'date':
					return formatDate(
						new Date(paramValue),
						locale,
						arg ? { style: arg as 'short' | 'medium' | 'long' | 'full' } : undefined
					);
				case 'time':
					return formatTime(
						new Date(paramValue),
						locale,
						arg ? { style: arg as 'short' | 'medium' | 'long' | 'full' } : undefined
					);
				case 'datetime':
					return formatDateTime(new Date(paramValue), locale);
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
 *
 * Supports hierarchical namespace structure using slash notation:
 * - ./locales/en/common.json -> namespace: "common"
 * - ./locales/en/apps.json -> namespace: "apps"
 * - ./locales/en/apps/chain-tools.json -> namespace: "apps/chain-tools"
 * - ./locales/en/apps/chain-tools/tool.json -> namespace: "apps/chain-tools/tool"
 *
 * @example parseGlobImports(import.meta.glob('./locales/** /*.json'))
 */
export function parseGlobImports(
	modules: Record<string, () => Promise<unknown>>
): { locale: string; namespace: string; loader: () => Promise<unknown> }[] {
	const results: { locale: string; namespace: string; loader: () => Promise<unknown> }[] = [];

	for (const [path, loader] of Object.entries(modules)) {
		// Expected path format: ./locales/{locale}/{namespace}.json
		// or: ./locales/{locale}/{path/to/namespace}.json
		const match = path.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\/(.+)\.json$/i);
		if (match) {
			const [, locale, namespace] = match;
			results.push({ locale, namespace, loader });
		}
	}

	return results;
}

// ========================================
// Formatting Functions
// ========================================

/**
 * Default currency for each locale
 * Maps locale codes to their default currency
 */
const LOCALE_CURRENCY_MAP: Record<string, string> = {
	// Chinese
	zh: 'CNY',
	'zh-cn': 'CNY',
	'zh-tw': 'TWD',
	'zh-hk': 'HKD',
	// English
	en: 'USD',
	'en-us': 'USD',
	'en-gb': 'GBP',
	'en-au': 'AUD',
	'en-ca': 'CAD',
	// European
	de: 'EUR',
	'de-de': 'EUR',
	'de-at': 'EUR',
	'de-ch': 'CHF',
	fr: 'EUR',
	'fr-fr': 'EUR',
	'fr-ca': 'CAD',
	'fr-ch': 'CHF',
	es: 'EUR',
	'es-es': 'EUR',
	'es-mx': 'MXN',
	'es-ar': 'ARS',
	it: 'EUR',
	'it-it': 'EUR',
	nl: 'EUR',
	'nl-nl': 'EUR',
	pt: 'EUR',
	'pt-pt': 'EUR',
	'pt-br': 'BRL',
	// Asian
	ja: 'JPY',
	'ja-jp': 'JPY',
	ko: 'KRW',
	'ko-kr': 'KRW',
	// Others
	ru: 'RUB',
	'ru-ru': 'RUB',
	// Turkish
	tr: 'TRY',
	'tr-tr': 'TRY',
	// Vietnamese
	vi: 'VND',
	'vi-vn': 'VND',
	// Indonesian
	id: 'IDR',
	'id-id': 'IDR'
};

/**
 * Get the default currency for a locale
 * @example getLocaleCurrency('zh') => 'CNY'
 * @example getLocaleCurrency('en-US') => 'USD'
 */
export function getLocaleCurrency(locale: string): string {
	const normalized = locale.toLowerCase();
	// Try exact match first
	if (LOCALE_CURRENCY_MAP[normalized]) {
		return LOCALE_CURRENCY_MAP[normalized];
	}
	// Try language code only (e.g., 'en' from 'en-US')
	const lang = normalized.split('-')[0];
	return LOCALE_CURRENCY_MAP[lang] || 'USD';
}

/**
 * Format a number according to locale
 * @example formatNumber(1234.56, 'de-DE') => '1.234,56'
 * @example formatNumber(1234.56, 'en-US', { decimals: 2 }) => '1,234.56'
 */
export function formatNumber(value: number, locale: string, options?: FormatNumberOptions): string {
	const {
		decimals,
		minDecimals,
		maxDecimals,
		notation = 'standard',
		useGrouping = true
	} = options || {};

	// Handle subscript notation specially
	if (notation === 'subscript') {
		return formatSubscript(value, locale, options);
	}

	// Handle scientific notation
	if (notation === 'scientific' || notation === 'engineering') {
		return formatScientific(value, locale, options);
	}

	const intlOptions: Intl.NumberFormatOptions = {
		useGrouping,
		notation: notation === 'compact' ? 'compact' : 'standard'
	};

	if (decimals !== undefined) {
		intlOptions.minimumFractionDigits = decimals;
		intlOptions.maximumFractionDigits = decimals;
	} else {
		if (minDecimals !== undefined) intlOptions.minimumFractionDigits = minDecimals;
		if (maxDecimals !== undefined) intlOptions.maximumFractionDigits = maxDecimals;
	}

	return new Intl.NumberFormat(locale, intlOptions).format(value);
}

/**
 * Format a currency value
 * If currency is not provided, uses the locale's default currency
 * @example formatCurrency(99.99, 'en-US', 'USD') => '$99.99'
 * @example formatCurrency(99.99, 'de-DE', 'EUR') => '99,99 €'
 * @example formatCurrency(99.99, 'zh') => '¥99.99' (auto-detects CNY)
 */
export function formatCurrency(
	value: number,
	locale: string,
	currency?: string,
	options?: Omit<FormatCurrencyOptions, 'currency'>
): string {
	const actualCurrency = currency || getLocaleCurrency(locale);
	const intlOptions: Intl.NumberFormatOptions = {
		style: 'currency',
		currency: actualCurrency
	};

	if (options?.decimals !== undefined) {
		intlOptions.minimumFractionDigits = options.decimals;
		intlOptions.maximumFractionDigits = options.decimals;
	}

	return new Intl.NumberFormat(locale, intlOptions).format(value);
}

/**
 * Format a percentage value
 * @example formatPercent(0.75, 'en-US') => '75%'
 * @example formatPercent(0.75, 'de-DE') => '75 %'
 */
export function formatPercent(
	value: number,
	locale: string,
	options?: FormatNumberOptions
): string {
	const intlOptions: Intl.NumberFormatOptions = {
		style: 'percent'
	};

	if (options?.decimals !== undefined) {
		intlOptions.minimumFractionDigits = options.decimals;
		intlOptions.maximumFractionDigits = options.decimals;
	} else {
		if (options?.minDecimals !== undefined) intlOptions.minimumFractionDigits = options.minDecimals;
		if (options?.maxDecimals !== undefined) intlOptions.maximumFractionDigits = options.maxDecimals;
	}

	return new Intl.NumberFormat(locale, intlOptions).format(value);
}

/**
 * Format a date
 * @example formatDate(new Date(), 'en-US') => '12/24/2025'
 * @example formatDate(new Date(), 'de-DE', { style: 'long' }) => '24. Dezember 2025'
 */
export function formatDate(
	value: Date | number,
	locale: string,
	options?: FormatDateOptions
): string {
	const date = typeof value === 'number' ? new Date(value) : value;
	const style = options?.style || 'short';

	return new Intl.DateTimeFormat(locale, { dateStyle: style }).format(date);
}

/**
 * Format a time
 * @example formatTime(new Date(), 'en-US') => '2:30 PM'
 * @example formatTime(new Date(), 'de-DE') => '14:30'
 */
export function formatTime(
	value: Date | number,
	locale: string,
	options?: FormatTimeOptions
): string {
	const date = typeof value === 'number' ? new Date(value) : value;
	const style = options?.style || 'short';

	return new Intl.DateTimeFormat(locale, { timeStyle: style }).format(date);
}

/**
 * Format a date and time
 * @example formatDateTime(new Date(), 'en-US') => '12/24/2025, 2:30 PM'
 */
export function formatDateTime(
	value: Date | number,
	locale: string,
	options?: FormatDateTimeOptions
): string {
	const date = typeof value === 'number' ? new Date(value) : value;
	const dateStyle = options?.dateStyle || 'short';
	const timeStyle = options?.timeStyle || 'short';

	return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(date);
}

/**
 * Format a number in scientific notation
 * @example formatScientific(0.0000000000033, 'en-US') => '3.3E-12'
 */
export function formatScientific(
	value: number,
	locale: string,
	options?: FormatNumberOptions
): string {
	const notation = options?.notation === 'engineering' ? 'engineering' : 'scientific';

	const intlOptions: Intl.NumberFormatOptions = {
		notation
	};

	if (options?.decimals !== undefined) {
		intlOptions.minimumFractionDigits = options.decimals;
		intlOptions.maximumFractionDigits = options.decimals;
	} else if (options?.maxDecimals !== undefined) {
		intlOptions.maximumFractionDigits = options.maxDecimals;
	}

	return new Intl.NumberFormat(locale, intlOptions).format(value);
}

/**
 * Format a small number with subscript notation
 * Shows the count of leading zeros after decimal point as subscript
 * @example formatSubscript(0.0000000000033, 'en-US') => '0.0₁₂33'
 * @example formatSubscript(0.0000000000033, 'de-DE') => '0,0₁₂33'
 */
export function formatSubscript(
	value: number,
	locale: string,
	options?: FormatNumberOptions
): string {
	// Get locale's decimal separator
	const decimalSeparator = new Intl.NumberFormat(locale).format(1.1).charAt(1);

	// Handle non-small numbers (>= 0.1 or negative or zero)
	if (value === 0 || Math.abs(value) >= 0.1) {
		return formatNumber(value, locale, { ...options, notation: 'standard' });
	}

	// Convert to string to analyze
	const absValue = Math.abs(value);
	const str = absValue.toExponential();
	const match = str.match(/^(\d+\.?\d*)e([+-]?\d+)$/i);

	if (!match) {
		return formatNumber(value, locale, { ...options, notation: 'standard' });
	}

	const [, mantissa, expStr] = match;
	const exp = parseInt(expStr, 10);

	// Only use subscript for small numbers (negative exponent)
	if (exp >= -1) {
		return formatNumber(value, locale, { ...options, notation: 'standard' });
	}

	// Calculate zeros count: for 3.3e-12, we have 11 zeros (exponent - 1 for the digit before decimal)
	const zerosCount = Math.abs(exp) - 1;

	// Get significant digits from mantissa
	const significantDigits = mantissa.replace('.', '');

	// Apply decimal precision if specified
	let finalDigits = significantDigits;
	if (options?.decimals !== undefined && significantDigits.length > options.decimals) {
		finalDigits = significantDigits.slice(0, options.decimals);
	}

	// Format: 0.0₁₂33 means 0.0 followed by subscript count of additional zeros, then digits
	const prefix = value < 0 ? '-' : '';
	return `${prefix}0${decimalSeparator}0${toSubscript(zerosCount)}${finalDigits}`;
}

/**
 * Create a formatter object bound to a specific locale
 */
export function createFormatter(locale: string): I18nFormatter {
	return {
		number: (value, options) => formatNumber(value, locale, options),
		currency: (value, currency, options) => formatCurrency(value, locale, currency, options),
		percent: (value, options) => formatPercent(value, locale, options),
		date: (value, options) => formatDate(value, locale, options),
		time: (value, options) => formatTime(value, locale, options),
		datetime: (value, options) => formatDateTime(value, locale, options),
		scientific: (value, options) => formatScientific(value, locale, options),
		subscript: (value, options) => formatSubscript(value, locale, options)
	};
}
