import type { LocaleMeta, TranslationContent, LocaleData } from './types.ts';
import { languages } from './constants/languages.js';

export function getNestedValue(
	obj: LocaleData | TranslationContent,
	path: string
): string | undefined {
	const keys = path.split('.');
	let current: unknown = obj;

	for (const key of keys) {
		if (key === '_meta') return undefined;

		if (!isObject(current) || !(key in current)) {
			return undefined;
		}

		current = (current as Record<string, unknown>)[key];
	}

	return typeof current === 'string' ? current : undefined;
}

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

export function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isPlainObject(value: unknown): boolean {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Search for languages by query string
 * Matches against code, native name, or English name
 */
export function fuzzySearchLanguages(query: string): LocaleMeta[] {
	if (!query) return [];

	const lowerQuery = query.toLowerCase();
	return languages.filter(
		(lang) =>
			lang.code.toLowerCase().includes(lowerQuery) ||
			lang.name.toLowerCase().includes(lowerQuery) ||
			lang.englishName.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: string): LocaleMeta | undefined {
	if (!code || typeof code !== 'string') {
		return undefined;
	}
	return languages.find((lang) => lang.code.toLowerCase() === code.toLowerCase());
}

/**
 * Get all supported languages
 */
export function getAllLanguages(): LocaleMeta[] {
	return [...languages];
}

/**
 * Check if a language code is valid
 */
export function isValidLanguageCode(code: string): boolean {
	if (!code || typeof code !== 'string') {
		return false;
	}
	return languages.some((lang) => lang.code.toLowerCase() === code.toLowerCase());
}

/**
 * Remove locale code from URL pathname if it exists
 * Automatically detects and removes any valid locale code from the pathname
 * Uses the comprehensive language list from language-search.ts
 * @param url - The URL to process
 * @returns New URL with locale code removed from pathname if found
 *
 * @example
 * deLocalizeUrl(new URL('https://example.com/zh/about'))
 * // Returns: new URL('https://example.com/about')
 *
 * deLocalizeUrl(new URL('https://example.com/en-US/products'))
 * // Returns: new URL('https://example.com/products')
 *
 * deLocalizeUrl(new URL('https://example.com/notlang/about'))
 * // Returns: new URL('https://example.com/notlang/about') (unchanged)
 */
export function deLocalizeUrl(url: URL): URL {
	const newUrl = new URL(url.toString());
	const pathname = newUrl.pathname;

	// Split pathname into segments
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return newUrl;
	}

	// Check if first segment is a valid locale code using the single source of truth
	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		// Remove the locale segment
		segments.shift();
		// Reconstruct pathname, ensuring at least a single slash
		newUrl.pathname = '/' + segments.join('/');
		// Handle empty pathname case
		if (newUrl.pathname === '') {
			newUrl.pathname = '/';
		}
	}

	return newUrl;
}

/**
 * Extract language code from pathname if it exists and is valid
 * @param pathname - The URL pathname (e.g., '/zh/about' or '/en-US/products')
 * @returns The language code if found and valid, null otherwise
 *
 * @example
 * extractLocaleFromPathname('/zh/about') // 'zh'
 * extractLocaleFromPathname('/en-US/products') // 'en-US'
 * extractLocaleFromPathname('/notlang/about') // null
 * extractLocaleFromPathname('/about') // null
 */
export function extractLocaleFromPathname(pathname: string): string | null {
	// Split pathname into segments and filter out empty strings
	const segments = pathname.split('/').filter(Boolean);

	// If no segments, no locale
	if (segments.length === 0) {
		return null;
	}

	// Check if first segment is a valid language code
	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		return firstSegment;
	}

	return null;
}

/**
 * 从 Cookie 中提取语言
 */
export function extractLocaleFromCookie(
	cookies: { get: (name: string) => string | undefined },
	cookieName = 'i18n-locale'
): string | null {
	return cookies.get(cookieName) || null;
}

/**
 * 从 Accept-Language header 提取语言
 */
export function extractLocaleFromHeader(acceptLanguage: string | null): string | null {
	if (!acceptLanguage) return null;

	// Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
	const languages = acceptLanguage
		.split(',')
		.map((lang) => lang.split(';')[0].trim().split('-')[0]);

	return languages[0] || null;
}
