import type { LayoutServerLoad } from './$types.js';
import type { LocaleData, LocaleMeta } from '$lib/types.js';
import { extractLocaleFromPathname } from '$lib/utils/utils.js';

// Auto-scan all locale files using Vite glob import (works on server too!)
// Pattern: ./locales/{locale}/{namespace}.json
const localeModules = import.meta.glob<{ default: LocaleData }>('./locales/**/*.json', {
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
		// Extract locale and namespace from path: ./locales/en/common.json -> en, common
		const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
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

const { locales: SUPPORTED_LOCALES, localeMetas: LOCALE_METAS, translations: ALL_TRANSLATIONS } =
	parseLocaleModules();

export const load = (async ({ url, cookies }) => {
	// Extract locale from URL pathname
	let locale = extractLocaleFromPathname(url.pathname);

	// Validate locale, fallback to cookie or default
	if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
		locale = cookies.get('i18n-locale') || 'en';
	}

	// Get translations for current locale (already loaded via eager import)
	const localeTranslations = ALL_TRANSLATIONS[locale] || ALL_TRANSLATIONS['en'] || {};

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
