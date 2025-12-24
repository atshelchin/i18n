import type { LayoutServerLoad } from './$types.js';
import type { LocaleData, LocaleMeta } from '$lib/types.js';
import { extractLocaleFromPathname } from '$lib/utils/utils.js';

// Auto-scan all locale files using Vite glob import (works on server too!)
// Pattern: ../i18n/locales/{locale}/{namespace}.json
const localeModules = import.meta.glob<{ default: LocaleData }>('../i18n/locales/**/*.json', {
	eager: true
});

// Parse glob results into structured format: { locale: { namespace: data } }
function parseLocaleModules(): {
	locales: string[];
	localeMetas: LocaleMeta[];
	translations: Record<string, Record<string, LocaleData>>;
} {
	const translations: Record<string, Record<string, LocaleData>> = {};
	const localeSet = new Set<string>();
	const metaMap = new Map<string, LocaleMeta>();

	for (const [path, module] of Object.entries(localeModules)) {
		// Extract locale and namespace from path: ../i18n/locales/en/common.json -> en, common
		const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
		if (match) {
			const [, locale, namespace] = match;
			localeSet.add(locale);

			if (!translations[locale]) {
				translations[locale] = {};
			}
			translations[locale][namespace] = module.default;

			// Extract _meta from common.json (or any file that has it)
			if (module.default._meta && !metaMap.has(locale)) {
				metaMap.set(locale, module.default._meta);
			}
		}
	}

	// Build localeMetas array with all locales
	const localeMetas: LocaleMeta[] = Array.from(localeSet)
		.sort()
		.map((locale) => metaMap.get(locale) || { code: locale, name: locale, englishName: locale });

	return {
		locales: Array.from(localeSet).sort(),
		localeMetas,
		translations
	};
}

const {
	locales: SUPPORTED_LOCALES,
	localeMetas: LOCALE_METAS,
	translations: ALL_TRANSLATIONS
} = parseLocaleModules();

// Base namespaces to always preload
const BASE_NAMESPACES = ['common'];

// Get all available namespace names from translations
const AVAILABLE_NAMESPACES = new Set(
	Object.values(ALL_TRANSLATIONS).flatMap((localeData) => Object.keys(localeData))
);

/**
 * Auto-detect namespaces from URL path
 * Rules:
 * - "/" or "" -> "home"
 * - "/about" -> "about"
 * - "/foo/bar" -> "foo" (first segment)
 * - Only returns namespace if it exists in translations
 */
function getNamespacesForPath(pathname: string): string[] {
	const namespaces = [...BASE_NAMESPACES];

	// Remove locale prefix if present (e.g., /en/about -> /about)
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

	// Determine namespace from path
	let pageNamespace: string;
	if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
		pageNamespace = 'home';
	} else {
		// Extract first path segment: /about/team -> about, /foo/bar/baz -> foo
		const firstSegment = pathWithoutLocale.split('/').filter(Boolean)[0];
		pageNamespace = firstSegment || 'home';
	}

	// Only add if namespace exists in translations
	if (pageNamespace && AVAILABLE_NAMESPACES.has(pageNamespace) && !namespaces.includes(pageNamespace)) {
		namespaces.push(pageNamespace);
	}

	return namespaces;
}

export const load = (async ({ url, cookies }) => {
	// Extract locale from URL pathname
	let locale = extractLocaleFromPathname(url.pathname);

	// Validate locale, fallback to cookie or default
	if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
		locale = cookies.get('i18n-locale') || 'en';
	}

	// Get translations for current locale
	const allLocaleTranslations = ALL_TRANSLATIONS[locale] || ALL_TRANSLATIONS['en'] || {};

	// Determine which namespaces to preload based on the current path
	const namespacesToPreload = getNamespacesForPath(url.pathname);

	// Filter to only include namespaces needed for this page
	const localeTranslations: Record<string, LocaleData> = {};
	for (const ns of namespacesToPreload) {
		if (allLocaleTranslations[ns]) {
			localeTranslations[ns] = allLocaleTranslations[ns];
		}
	}

	const preloadedTranslations: Record<string, Record<string, LocaleData>> = {
		[locale]: localeTranslations
	};

	return {
		locale,
		supportedLocales: SUPPORTED_LOCALES,
		localeMetas: LOCALE_METAS,
		preloadedTranslations
	};
}) satisfies LayoutServerLoad;
