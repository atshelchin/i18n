/**
 * @shelchin/i18n Server-side utilities
 *
 * Helper functions for SSR preloading with automatic namespace detection
 */

import type { LocaleData, LocaleMeta, PreloadedTranslations } from './types.js';

/** Parsed locale data from glob imports */
export interface ParsedLocaleData {
	/** All supported locale codes */
	locales: string[];
	/** Locale metadata */
	localeMetas: LocaleMeta[];
	/** All translations: { locale: { namespace: data } } */
	translations: Record<string, Record<string, LocaleData>>;
	/** All available namespace names */
	namespaces: Set<string>;
}

/** Options for getPreloadedTranslations */
export interface PreloadOptions {
	/** Current locale */
	locale: string;
	/** URL pathname for auto-detecting namespaces */
	pathname: string;
	/** Base namespaces to always include (default: ['common']) */
	baseNamespaces?: string[];
	/** Home namespace name (default: 'home') */
	homeNamespace?: string;
}

/**
 * Parse Vite glob import results into structured locale data
 *
 * Supports nested directory structures - only the filename is used as namespace:
 * - locales/en/common.json -> namespace: "common"
 * - locales/en/routes/about.json -> namespace: "about" (directory is ignored)
 *
 * @example
 * const modules = import.meta.glob('../locales/** /*.json', { eager: true });
 * const { locales, localeMetas, translations } = parseLocaleModules(modules);
 */
export function parseLocaleModules(
	modules: Record<string, { default: LocaleData }>
): ParsedLocaleData {
	const translations: Record<string, Record<string, LocaleData>> = {};
	const localeSet = new Set<string>();
	const namespaceSet = new Set<string>();
	const metaMap = new Map<string, LocaleMeta>();

	for (const [path, module] of Object.entries(modules)) {
		// Extract locale and namespace from path
		// Supports: ../locales/en/common.json -> en, common
		// Supports: ../locales/en/routes/about.json -> en, about (subdirs are for organization only)
		const match = path.match(/\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)\/(?:.*\/)?([^/]+)\.json$/i);
		if (match) {
			const [, locale, namespace] = match;
			const normalizedLocale = locale.toLowerCase();

			localeSet.add(normalizedLocale);
			namespaceSet.add(namespace);

			if (!translations[normalizedLocale]) {
				translations[normalizedLocale] = {};
			}
			translations[normalizedLocale][namespace] = module.default;

			// Extract _meta from any file that has it
			if (module.default._meta && !metaMap.has(normalizedLocale)) {
				metaMap.set(normalizedLocale, module.default._meta);
			}
		}
	}

	// Build localeMetas array
	const localeMetas: LocaleMeta[] = Array.from(localeSet)
		.sort()
		.map((locale) => metaMap.get(locale) || { code: locale, name: locale, englishName: locale });

	return {
		locales: Array.from(localeSet).sort(),
		localeMetas,
		translations,
		namespaces: namespaceSet
	};
}

/**
 * Extract namespace name from URL pathname
 *
 * Rules:
 * - "/" or "" -> homeNamespace (default: "home")
 * - "/about" -> "about"
 * - "/foo/bar/baz" -> "foo" (first segment only)
 * - Locale prefixes are stripped: "/en/about" -> "about"
 */
export function getNamespaceFromPath(
	pathname: string,
	options?: { homeNamespace?: string }
): string {
	const homeNamespace = options?.homeNamespace ?? 'home';

	// Remove locale prefix if present (e.g., /en/about -> /about, /zh-CN/about -> /about)
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';

	// Root path
	if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
		return homeNamespace;
	}

	// Extract first path segment only
	const firstSegment = pathWithoutLocale.split('/').filter(Boolean)[0];
	return firstSegment || homeNamespace;
}

/**
 * Get namespaces to preload for a given pathname
 *
 * @returns Array of namespace names that exist in translations
 */
export function getNamespacesForPath(
	pathname: string,
	availableNamespaces: Set<string>,
	options?: {
		baseNamespaces?: string[];
		homeNamespace?: string;
	}
): string[] {
	const baseNamespaces = options?.baseNamespaces ?? ['common'];
	const namespaces = [...baseNamespaces];

	const pageNamespace = getNamespaceFromPath(pathname, options);

	// Only add if namespace exists and not already in list
	if (
		pageNamespace &&
		availableNamespaces.has(pageNamespace) &&
		!namespaces.includes(pageNamespace)
	) {
		namespaces.push(pageNamespace);
	}

	return namespaces;
}

/**
 * Get preloaded translations for SSR
 *
 * Automatically detects which namespace to load based on URL pathname.
 *
 * @example
 * // In +layout.server.ts
 * const parsed = parseLocaleModules(import.meta.glob('../locales/** /*.json', { eager: true }));
 *
 * export const load = async ({ url, cookies }) => {
 *   const locale = extractLocaleFromPathname(url.pathname) || 'en';
 *   const preloadedTranslations = getPreloadedTranslations(parsed, {
 *     locale,
 *     pathname: url.pathname
 *   });
 *   return { locale, preloadedTranslations, ... };
 * };
 */
export function getPreloadedTranslations(
	data: ParsedLocaleData,
	options: PreloadOptions
): PreloadedTranslations {
	const { locale, pathname, baseNamespaces, homeNamespace } = options;

	// Get translations for locale (fallback to first available)
	const localeTranslations = data.translations[locale] || data.translations[data.locales[0]] || {};

	// Get namespaces to preload
	const namespacesToPreload = getNamespacesForPath(pathname, data.namespaces, {
		baseNamespaces,
		homeNamespace
	});

	// Filter translations
	const filteredTranslations: Record<string, LocaleData> = {};
	for (const ns of namespacesToPreload) {
		if (localeTranslations[ns]) {
			filteredTranslations[ns] = localeTranslations[ns];
		}
	}

	return {
		[locale]: filteredTranslations
	};
}

/**
 * Create a complete SSR load helper
 *
 * @example
 * // In +layout.server.ts
 * import { createServerLoader } from '@shelchin/i18n/server';
 *
 * const modules = import.meta.glob('../locales/** /*.json', { eager: true });
 * const { load } = createServerLoader(modules);
 *
 * export { load };
 */
export function createServerLoader(
	modules: Record<string, { default: LocaleData }>,
	options?: {
		defaultLocale?: string;
		baseNamespaces?: string[];
		homeNamespace?: string;
		cookieName?: string;
		extractLocale?: (pathname: string) => string | null;
	}
) {
	const parsed = parseLocaleModules(modules);
	const defaultLocale = options?.defaultLocale ?? 'en';
	const cookieName = options?.cookieName ?? 'i18n-locale';

	// Default locale extractor: /en/... -> en
	const extractLocale =
		options?.extractLocale ??
		((pathname: string) => {
			const match = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
			return match ? match[1].toLowerCase() : null;
		});

	return {
		...parsed,

		load: async ({
			url,
			cookies
		}: {
			url: URL;
			cookies: { get: (name: string) => string | undefined };
		}) => {
			// Extract locale from URL
			let locale = extractLocale(url.pathname);

			// Validate and fallback
			if (!locale || !parsed.locales.includes(locale)) {
				locale = cookies.get(cookieName) || defaultLocale;
			}

			// Get preloaded translations
			const preloadedTranslations = getPreloadedTranslations(parsed, {
				locale,
				pathname: url.pathname,
				baseNamespaces: options?.baseNamespaces,
				homeNamespace: options?.homeNamespace
			});

			return {
				locale,
				supportedLocales: parsed.locales,
				localeMetas: parsed.localeMetas,
				preloadedTranslations
			};
		}
	};
}
