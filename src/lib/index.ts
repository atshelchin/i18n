/**
 * @shelchin/i18n v2.0
 *
 * Modern i18n library for Svelte 5 with automatic lazy loading
 *
 * @example
 * // Initialize (once in +layout.svelte)
 * import { initI18n, setI18nContext, registerGlobLoaders } from '@shelchin/i18n';
 *
 * const i18n = initI18n({ locale: data.locale });
 * registerGlobLoaders(import.meta.glob('./locales/** /*.json'));
 * setI18nContext(i18n);
 *
 * @example
 * // Use in any component
 * import { t, setLocale, useI18n } from '@shelchin/i18n';
 *
 * // Direct function call
 * t('home.title')
 * await setLocale('zh')
 *
 * // Or via hook for reactive access
 * const i18n = useI18n();
 * i18n.locale // reactive
 * i18n.locales // reactive
 */

// ========================================
// Core Store & Functions
// ========================================
export {
	// Initialization
	initI18n,
	setI18nContext,
	useI18n,
	getInstance,

	// Direct module exports
	t,
	setLocale,
	getLocale,
	getLocales,

	// Auto-scan helper
	registerGlobLoaders
} from './store.svelte.js';

// ========================================
// Types
// ========================================
export type {
	// Configuration
	InitI18nOptions,
	I18nInstance,

	// Data types
	LocaleMeta,
	LocaleData,
	TranslationContent,

	// Loader types
	LocaleLoader,
	LocaleLoaders,
	NamespaceLoaders,

	// Type-safe keys (augmentable)
	TranslationKeys,
	TranslationKey
} from './types.js';

// ========================================
// Utilities
// ========================================
export { extractNamespace, extractKeyPath, parseGlobImports } from './utils.js';

// ========================================
// Server-side utilities
// ========================================
export {
	parseLocaleModules,
	getNamespaceFromPath,
	getNamespacesForPath,
	getPreloadedTranslations,
	createServerLoader
} from './server.js';

export type { ParsedLocaleData, PreloadOptions } from './server.js';
