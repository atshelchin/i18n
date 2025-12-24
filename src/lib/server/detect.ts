/**
 * @shelchin/i18n v2.0 Server-side utilities
 *
 * Language detection for SSR (SvelteKit)
 */

export interface DetectLocaleOptions {
	/** Cookie getter (from SvelteKit's cookies) */
	cookies?: { get: (name: string) => string | undefined };

	/** Request object (from SvelteKit's load function) */
	request?: Request;

	/** Default locale if none detected */
	defaultLocale?: string;

	/** Supported locales (for validation) */
	supportedLocales?: string[];

	/** Cookie name for locale preference */
	cookieName?: string;

	/** URL pathname (for URL-based locale) */
	pathname?: string;
}

/**
 * Detect user's preferred locale from various sources
 *
 * Priority:
 * 1. URL pathname (e.g., /zh/about -> zh)
 * 2. Cookie (user's previous choice)
 * 3. Accept-Language header
 * 4. Default locale
 *
 * @example
 * // In +layout.server.ts
 * import { detectLocale } from '@shelchin/i18n/server';
 *
 * export async function load({ cookies, request, url }) {
 *   const locale = detectLocale({
 *     cookies,
 *     request,
 *     pathname: url.pathname,
 *     defaultLocale: 'en',
 *     supportedLocales: ['en', 'zh', 'ja']
 *   });
 *   return { locale };
 * }
 */
export function detectLocale(options: DetectLocaleOptions = {}): string {
	const {
		cookies,
		request,
		defaultLocale = 'en',
		supportedLocales,
		cookieName = 'i18n-locale',
		pathname
	} = options;

	// Helper to validate locale
	const isValidLocale = (locale: string | null | undefined): locale is string => {
		if (!locale) return false;
		if (!supportedLocales) return true;
		return supportedLocales.includes(locale);
	};

	// 1. Try URL pathname
	if (pathname) {
		const pathLocale = extractLocaleFromPathname(pathname);
		if (isValidLocale(pathLocale)) {
			return pathLocale;
		}
	}

	// 2. Try cookie
	if (cookies) {
		const cookieLocale = cookies.get(cookieName);
		if (isValidLocale(cookieLocale)) {
			return cookieLocale;
		}
	}

	// 3. Try Accept-Language header
	if (request) {
		const acceptLanguage = request.headers.get('Accept-Language');
		const headerLocale = extractLocaleFromHeader(acceptLanguage);
		if (isValidLocale(headerLocale)) {
			return headerLocale;
		}
	}

	// 4. Default
	return defaultLocale;
}

/**
 * Extract locale from URL pathname
 * @example extractLocaleFromPathname('/zh/about') => 'zh'
 */
export function extractLocaleFromPathname(pathname: string): string | null {
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return null;
	}

	// First segment might be a locale code
	const firstSegment = segments[0];

	// Match common locale patterns: en, zh, en-US, zh-CN, etc.
	if (/^[a-z]{2}(-[A-Z]{2})?$/i.test(firstSegment)) {
		return firstSegment.toLowerCase();
	}

	return null;
}

/**
 * Extract preferred locale from Accept-Language header
 * @example extractLocaleFromHeader('zh-CN,zh;q=0.9,en;q=0.8') => 'zh'
 */
export function extractLocaleFromHeader(acceptLanguage: string | null): string | null {
	if (!acceptLanguage) return null;

	// Parse Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
	const languages = acceptLanguage
		.split(',')
		.map((lang) => {
			const [code, qValue] = lang.trim().split(';q=');
			return {
				code: code.split('-')[0].toLowerCase(), // zh-CN -> zh
				q: qValue ? parseFloat(qValue) : 1.0
			};
		})
		.sort((a, b) => b.q - a.q);

	return languages[0]?.code || null;
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
 * Set locale cookie (for use in server actions or endpoints)
 */
export function setLocaleCookie(
	cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void },
	locale: string,
	options: {
		cookieName?: string;
		maxAge?: number;
		path?: string;
	} = {}
): void {
	const { cookieName = 'i18n-locale', maxAge = 365 * 24 * 60 * 60, path = '/' } = options;

	cookies.set(cookieName, locale, {
		maxAge,
		path,
		sameSite: 'lax',
		httpOnly: false // Allow client-side access
	});
}
