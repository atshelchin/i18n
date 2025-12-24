/**
 * @shelchin/i18n v2.0 Server Detection Tests
 */

import { describe, it, expect } from 'vitest';
import {
	detectLocale,
	extractLocaleFromPathname,
	extractLocaleFromHeader,
	extractLocaleFromCookie
} from './detect.js';

describe('extractLocaleFromPathname', () => {
	it('should extract locale from simple path', () => {
		expect(extractLocaleFromPathname('/zh/about')).toBe('zh');
		expect(extractLocaleFromPathname('/en/products')).toBe('en');
	});

	it('should extract locale with region code', () => {
		expect(extractLocaleFromPathname('/en-US/about')).toBe('en-us');
		expect(extractLocaleFromPathname('/zh-CN/products')).toBe('zh-cn');
	});

	it('should return null for no locale', () => {
		expect(extractLocaleFromPathname('/about')).toBeNull();
		expect(extractLocaleFromPathname('/products/123')).toBeNull();
	});

	it('should return null for empty path', () => {
		expect(extractLocaleFromPathname('/')).toBeNull();
		expect(extractLocaleFromPathname('')).toBeNull();
	});

	it('should return null for non-locale first segment', () => {
		expect(extractLocaleFromPathname('/notlang/about')).toBeNull();
		expect(extractLocaleFromPathname('/api/users')).toBeNull();
	});
});

describe('extractLocaleFromHeader', () => {
	it('should extract first language from Accept-Language', () => {
		expect(extractLocaleFromHeader('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
		expect(extractLocaleFromHeader('en-US,en;q=0.9')).toBe('en');
	});

	it('should handle simple Accept-Language', () => {
		expect(extractLocaleFromHeader('zh')).toBe('zh');
		expect(extractLocaleFromHeader('en')).toBe('en');
	});

	it('should return null for null/empty header', () => {
		expect(extractLocaleFromHeader(null)).toBeNull();
		expect(extractLocaleFromHeader('')).toBeNull();
	});
});

describe('extractLocaleFromCookie', () => {
	it('should extract locale from cookie', () => {
		const cookies = {
			get: (name: string) => (name === 'i18n-locale' ? 'zh' : undefined)
		};
		expect(extractLocaleFromCookie(cookies)).toBe('zh');
	});

	it('should return null if cookie not found', () => {
		const cookies = {
			get: () => undefined
		};
		expect(extractLocaleFromCookie(cookies)).toBeNull();
	});

	it('should use custom cookie name', () => {
		const cookies = {
			get: (name: string) => (name === 'custom-locale' ? 'en' : undefined)
		};
		expect(extractLocaleFromCookie(cookies, 'custom-locale')).toBe('en');
	});
});

describe('detectLocale', () => {
	it('should use pathname locale first', () => {
		const result = detectLocale({
			pathname: '/zh/about',
			cookies: { get: () => 'en' },
			request: new Request('http://example.com', {
				headers: { 'Accept-Language': 'ja' }
			}),
			defaultLocale: 'en'
		});
		expect(result).toBe('zh');
	});

	it('should use cookie if no pathname locale', () => {
		const result = detectLocale({
			pathname: '/about',
			cookies: { get: (name: string) => (name === 'i18n-locale' ? 'zh' : undefined) },
			defaultLocale: 'en'
		});
		expect(result).toBe('zh');
	});

	it('should use Accept-Language if no cookie', () => {
		const result = detectLocale({
			pathname: '/about',
			cookies: { get: () => undefined },
			request: new Request('http://example.com', {
				headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' }
			}),
			defaultLocale: 'en'
		});
		expect(result).toBe('zh');
	});

	it('should use default locale as fallback', () => {
		const result = detectLocale({
			pathname: '/about',
			cookies: { get: () => undefined },
			defaultLocale: 'en'
		});
		expect(result).toBe('en');
	});

	it('should validate against supported locales', () => {
		const result = detectLocale({
			pathname: '/fr/about',
			supportedLocales: ['en', 'zh'],
			defaultLocale: 'en'
		});
		// fr is not supported, should fallback to default
		expect(result).toBe('en');
	});

	it('should use valid locale from supported list', () => {
		const result = detectLocale({
			pathname: '/zh/about',
			supportedLocales: ['en', 'zh'],
			defaultLocale: 'en'
		});
		expect(result).toBe('zh');
	});
});
