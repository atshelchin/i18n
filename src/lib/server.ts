/**
 * @shelchin/i18n Server-side utilities
 *
 * Helper functions for SSR preloading with automatic namespace detection
 */

import type {
	LocaleData,
	LocaleMeta,
	PreloadedTranslations,
	TranslationKey,
	I18nFormatter
} from './types.js';
import {
	getNestedValue,
	getNestedData,
	extractNamespace,
	extractKeyPath,
	interpolate,
	getPluralKey,
	createFormatter
} from './utils.js';

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
	/** Prefix to add to namespace paths (e.g., 'routes' -> URL /apps maps to routes/apps) */
	namespacePrefix?: string;
}

/**
 * Parse Vite glob import results into structured locale data
 *
 * Supports hierarchical namespace structure using slash notation:
 * - locales/en/common.json -> namespace: "common"
 * - locales/en/apps.json -> namespace: "apps"
 * - locales/en/apps/chain-tools.json -> namespace: "apps/chain-tools"
 * - locales/en/apps/chain-tools/tool.json -> namespace: "apps/chain-tools/tool"
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
		// Extract locale and full namespace path from path
		// Supports: ../locales/en/common.json -> en, common
		// Supports: ../locales/en/apps/chain-tools.json -> en, apps/chain-tools
		const match = path.match(/\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)\/(.+)\.json$/i);
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
 * Extract hierarchical namespace paths from URL pathname
 *
 * Returns an array of cumulative slash-separated namespace paths:
 * - "/" or "" -> [homeNamespace] (default: "home")
 * - "/about" -> ["about"]
 * - "/apps/chain-tools/tool/uniswap" -> ["apps", "apps/chain-tools", "apps/chain-tools/tool", "apps/chain-tools/tool/uniswap"]
 * - Locale prefixes are stripped: "/en/about" -> ["about"]
 *                                 "/zh/apps/foo" -> ["apps", "apps/foo"]
 *
 * With namespacePrefix option (e.g., 'routes'):
 * - "/" -> ["routes/home"]
 * - "/about" -> ["routes/about"]
 * - "/apps/chain-tools" -> ["routes/apps", "routes/apps/chain-tools"]
 */
export function getNamespaceFromPath(
	pathname: string,
	options?: { homeNamespace?: string; namespacePrefix?: string }
): string[] {
	const homeNamespace = options?.homeNamespace ?? 'home';
	const prefix = options?.namespacePrefix;

	// Remove locale prefix if present (e.g., /en/about -> /about, /zh-CN/about -> /about)
	// Supports formats like: en, en-US, zh-CN, etc.
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/|$)/i, '') || '/';

	// Helper to add prefix
	const addPrefix = (ns: string) => (prefix ? `${prefix}/${ns}` : ns);

	// Root path
	if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
		return [addPrefix(homeNamespace)];
	}

	// Split and filter out empty segments
	const segments = pathWithoutLocale.split('/').filter(Boolean);

	// If after stripping there's still nothing, fall back to home
	if (segments.length === 0) {
		return [addPrefix(homeNamespace)];
	}

	// Build cumulative namespace paths: ["apps", "apps/chain-tools", "apps/chain-tools/tool", ...]
	const namespacePaths: string[] = [];
	for (let i = 0; i < segments.length; i++) {
		const path = segments.slice(0, i + 1).join('/');
		namespacePaths.push(addPrefix(path));
	}

	return namespacePaths;
}

/**
 * Get namespaces to preload for a given pathname
 *
 * Rules:
 * - Always include baseNamespaces (e.g., ['common'])
 * - For each hierarchical path prefix, add the corresponding namespace if it exists
 *   e.g., /apps/chain-tools/tool -> try adding: 'apps', 'apps/chain-tools', 'apps/chain-tools/tool'
 * - Only add if namespace exists in availableNamespaces
 *
 * @example
 * // URL: /zh/apps/chain-tools/tool/uniswap
 * // Available: ['common', 'apps', 'apps/chain-tools', 'apps/chain-tools/tool']
 * // Result: ['common', 'apps', 'apps/chain-tools', 'apps/chain-tools/tool']
 *
 * @example
 * // With namespacePrefix: 'routes'
 * // URL: /zh/apps/chain-tools
 * // Available: ['common', 'routes/home', 'routes/apps', 'routes/apps/chain-tools']
 * // Result: ['common', 'routes/apps', 'routes/apps/chain-tools']
 *
 * @returns Array of namespace names that exist in translations
 */
export function getNamespacesForPath(
	pathname: string,
	availableNamespaces: Set<string>,
	options?: {
		baseNamespaces?: string[];
		homeNamespace?: string;
		namespacePrefix?: string;
	}
): string[] {
	const baseNamespaces = options?.baseNamespaces ?? ['common'];
	const homeNamespace = options?.homeNamespace ?? 'home';
	const namespacePrefix = options?.namespacePrefix;

	const namespaces = new Set<string>(baseNamespaces);

	// Get hierarchical namespace paths from the URL
	const namespacePaths = getNamespaceFromPath(pathname, { homeNamespace, namespacePrefix });

	// Determine the effective home namespace (with prefix if applicable)
	const effectiveHomeNs = namespacePrefix ? `${namespacePrefix}/${homeNamespace}` : homeNamespace;

	// If it's the home path, try adding the homeNamespace if it exists
	if (namespacePaths.length === 1 && namespacePaths[0] === effectiveHomeNs) {
		if (availableNamespaces.has(effectiveHomeNs)) {
			namespaces.add(effectiveHomeNs);
		}
		return Array.from(namespaces);
	}

	// Add each hierarchical namespace path that exists
	for (const nsPath of namespacePaths) {
		if (availableNamespaces.has(nsPath)) {
			namespaces.add(nsPath);
		}
	}

	return Array.from(namespaces);
}

/**
 * Get preloaded translations for SSR
 *
 * Automatically detects which namespace to load based on URL pathname.
 * Also preloads default locale translations for fallback support.
 *
 * @example
 * // In +layout.server.ts
 * const parsed = parseLocaleModules(import.meta.glob('../locales/** /*.json', { eager: true }));
 *
 * export const load = async ({ url, cookies }) => {
 *   const locale = extractLocaleFromPathname(url.pathname) || 'en';
 *   const preloadedTranslations = getPreloadedTranslations(parsed, {
 *     locale,
 *     pathname: url.pathname,
 *     defaultLocale: 'en'
 *   });
 *   return { locale, preloadedTranslations, ... };
 * };
 */
export function getPreloadedTranslations(
	data: ParsedLocaleData,
	options: PreloadOptions & { defaultLocale?: string }
): PreloadedTranslations {
	const {
		locale,
		pathname,
		baseNamespaces,
		homeNamespace,
		namespacePrefix,
		defaultLocale = 'en'
	} = options;

	// Get namespaces to preload
	const namespacesToPreload = getNamespacesForPath(pathname, data.namespaces, {
		baseNamespaces,
		homeNamespace,
		namespacePrefix
	});

	const result: PreloadedTranslations = {};

	// Get translations for current locale
	const localeTranslations = data.translations[locale] || {};
	const filteredTranslations: Record<string, LocaleData> = {};
	for (const ns of namespacesToPreload) {
		if (localeTranslations[ns]) {
			filteredTranslations[ns] = localeTranslations[ns];
		}
	}
	if (Object.keys(filteredTranslations).length > 0) {
		result[locale] = filteredTranslations;
	}

	// Also preload default locale for fallback (if different from current locale)
	if (locale !== defaultLocale && data.translations[defaultLocale]) {
		const defaultTranslations = data.translations[defaultLocale];
		const defaultFiltered: Record<string, LocaleData> = {};
		for (const ns of namespacesToPreload) {
			if (defaultTranslations[ns]) {
				defaultFiltered[ns] = defaultTranslations[ns];
			}
		}
		if (Object.keys(defaultFiltered).length > 0) {
			result[defaultLocale] = defaultFiltered;
		}
	}

	return result;
}

/** Translation return type - string by default, or T when specified */
export type ServerTranslationResult<T = string> = T extends string ? string : T;

/** Server-side translation function interface */
export interface ServerTranslator {
	/**
	 * Translate a key with optional parameters
	 * Supports formatting in params: {key:number}, {key:currency:USD}, {key:date}, etc.
	 * @example t('home.title') // string
	 * @example t<string[]>('home.features') // string[]
	 * @example t<FAQ[]>('page.faqs') // FAQ[] - any array/object type
	 * @example t('common.greeting', { name: 'World' }) // "Hello, World!"
	 * @example t('price', { amount: 1234.56 }) // with {amount:number} in template
	 */
	<T = string>(
		key: TranslationKey,
		params?: Record<string, string | number | Date>
	): ServerTranslationResult<T>;

	/** Formatter bound to the current locale */
	format: I18nFormatter;
}

/** SvelteKit event-like object for locale detection */
export interface ServerEvent {
	url: URL;
	cookies: { get: (name: string) => string | undefined };
}

/** Options for createServerT */
export interface ServerTOptions {
	/** Current locale (if known) */
	locale?: string;
	/** Default locale for fallback */
	defaultLocale?: string;
	/** SvelteKit event for auto-detecting locale from URL/cookies */
	event?: ServerEvent;
	/** Cookie name for locale (default: 'i18n-locale') */
	cookieName?: string;
	/** List of supported locales (for validation) */
	supportedLocales?: string[];
	/** Custom locale extractor from pathname */
	extractLocale?: (pathname: string) => string | null;
}

/**
 * Create a server-side translation function
 *
 * This is a pure function that works without any global state,
 * perfect for SSR in +layout.server.ts or +page.server.ts
 *
 * @example
 * // Option 1: Pass locale directly
 * const t = createServerT(translations, { locale: 'en' });
 *
 * @example
 * // Option 2: Auto-detect from SvelteKit event
 * export const load = async (event) => {
 *   const t = createServerT(translations, { event, defaultLocale: 'en' });
 *   return { seoTitle: t('home.title') };
 * };
 *
 * @example
 * // Option 3: With supported locales validation
 * const t = createServerT(translations, {
 *   event,
 *   defaultLocale: 'en',
 *   supportedLocales: ['en', 'zh', 'ja']
 * });
 */
export function createServerT(
	translations: Record<string, Record<string, LocaleData>>,
	options: ServerTOptions
): ServerTranslator {
	const {
		defaultLocale = 'en',
		event,
		cookieName = 'i18n-locale',
		supportedLocales,
		extractLocale: customExtractLocale
	} = options;

	// Determine locale
	let locale = options.locale;

	if (!locale && event) {
		// Default locale extractor: /en/... -> en
		const extractLocale =
			customExtractLocale ??
			((pathname: string) => {
				const match = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
				return match ? match[1].toLowerCase() : null;
			});

		// Try URL first
		locale = extractLocale(event.url.pathname) ?? undefined;

		// Validate against supported locales
		if (locale && supportedLocales && !supportedLocales.includes(locale)) {
			locale = undefined;
		}

		// Fallback to cookie
		if (!locale) {
			const cookieLocale = event.cookies.get(cookieName);
			if (cookieLocale && (!supportedLocales || supportedLocales.includes(cookieLocale))) {
				locale = cookieLocale;
			}
		}

		// Fallback to default
		if (!locale) {
			locale = defaultLocale;
		}
	}

	// Final fallback
	if (!locale) {
		locale = defaultLocale;
	}

	const translate = <T = string>(
		key: TranslationKey,
		params?: Record<string, string | number | Date>
	): ServerTranslationResult<T> => {
		const namespace = extractNamespace(key as string);
		const keyPath = extractKeyPath(key as string);

		// Try current locale first
		const localeTranslations = translations[locale]?.[namespace];

		// Get raw data first
		const rawData = getNestedData<unknown>(localeTranslations, keyPath);

		// If it's not a string, return directly (array, object, etc.) - no interpolation
		if (rawData !== undefined && typeof rawData !== 'string') {
			return rawData as ServerTranslationResult<T>;
		}

		// Get as string for interpolation
		let value = rawData as string | undefined;

		// Handle pluralization
		if (params && typeof params['count'] === 'number') {
			const pluralKey = getPluralKey(keyPath, params['count']);
			const pluralValue = getNestedValue(localeTranslations, pluralKey);
			if (pluralValue) {
				value = pluralValue;
			}
		}

		// Fallback to default locale
		if (value === undefined && locale !== defaultLocale) {
			const defaultTranslations = translations[defaultLocale]?.[namespace];

			// Get raw data from fallback
			const defaultRawData = getNestedData<unknown>(defaultTranslations, keyPath);

			// If it's not a string, return directly
			if (defaultRawData !== undefined && typeof defaultRawData !== 'string') {
				return defaultRawData as ServerTranslationResult<T>;
			}

			value = defaultRawData as string | undefined;

			// Handle pluralization for fallback
			if (params && typeof params['count'] === 'number') {
				const pluralKey = getPluralKey(keyPath, params['count']);
				const pluralValue = getNestedValue(defaultTranslations, pluralKey);
				if (pluralValue) {
					value = pluralValue;
				}
			}
		}

		// Return key if not found
		if (value === undefined) {
			return key as string as ServerTranslationResult<T>;
		}

		return interpolate(value, params, locale) as ServerTranslationResult<T>;
	};

	// Create the translator with format property
	const translator = translate as ServerTranslator;
	translator.format = createFormatter(locale);

	return translator;
}

/**
 * Create a complete SSR load helper
 *
 * For server-side translations (SEO, meta tags), use `createServerT` separately.
 *
 * @example
 * // In +layout.server.ts
 * import { createServerLoader, createServerT } from '@shelchin/i18n/server';
 *
 * const { load: i18nLoad, translations, localeMetas } = createServerLoader(
 *   import.meta.glob('./locales/** /*.json', { eager: true }),
 *   { defaultLocale: 'en' }
 * );
 *
 * export const load = async (event) => {
 *   const data = await i18nLoad(event);
 *
 *   // Use createServerT for server-side translations
 *   const t = createServerT(translations, { locale: data.locale });
 *
 *   return {
 *     ...data,
 *     localeMetas,
 *     // SEO metadata
 *     seoTitle: t('home.title'),
 *     features: t<string[]>('home.features')
 *   };
 * };
 */
export function createServerLoader(
	modules: Record<string, { default: LocaleData }>,
	options?: {
		defaultLocale?: string;
		baseNamespaces?: string[];
		homeNamespace?: string;
		/** Prefix for route namespaces (e.g., 'routes' -> URL /apps maps to routes/apps) */
		namespacePrefix?: string;
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

			// Get preloaded translations (includes default locale for fallback)
			const preloadedTranslations = getPreloadedTranslations(parsed, {
				locale,
				pathname: url.pathname,
				baseNamespaces: options?.baseNamespaces,
				homeNamespace: options?.homeNamespace,
				namespacePrefix: options?.namespacePrefix,
				defaultLocale
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
