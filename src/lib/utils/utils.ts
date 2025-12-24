/**
 * Advanced utility functions for i18n
 * URL localization, language search, and server-side detection
 */

import type { LocaleMeta } from '../types.js';
import { languages } from '../constants/languages.js';

// Re-export core utilities from main utils
export { getNestedValue, deepMerge, isObject, isPlainObject } from '../utils.js';

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
			(lang.englishName && lang.englishName.toLowerCase().includes(lowerQuery))
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
 * @example deLocalizeUrl(new URL('https://example.com/zh/about')) => URL with pathname '/about'
 */
export function deLocalizeUrl(url: URL): URL {
	const newUrl = new URL(url.toString());
	const pathname = newUrl.pathname;

	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return newUrl;
	}

	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		segments.shift();
		newUrl.pathname = '/' + segments.join('/');
		if (newUrl.pathname === '') {
			newUrl.pathname = '/';
		}
	}

	return newUrl;
}

/**
 * Extract language code from pathname if valid
 * @example extractLocaleFromPathname('/zh/about') => 'zh'
 */
export function extractLocaleFromPathname(pathname: string): string | null {
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return null;
	}

	const firstSegment = segments[0];
	if (isValidLanguageCode(firstSegment)) {
		return firstSegment;
	}

	return null;
}

/**
 * Extract locale from cookie
 */
export function extractLocaleFromCookie(
	cookies: { get: (name: string) => string | undefined },
	cookieName = 'i18n-locale'
): string | null {
	return cookies.get(cookieName) || null;
}

/**
 * Extract locale from Accept-Language header
 */
export function extractLocaleFromHeader(acceptLanguage: string | null): string | null {
	if (!acceptLanguage) return null;

	const langs = acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim().split('-')[0]);

	return langs[0] || null;
}
