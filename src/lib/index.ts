// Core i18n class
export { I18n } from './i18n.js';

// Type definitions (users need these for type hints)
export type { LocaleMeta, LocaleData, PackageLocales, TranslationContent } from './types.js';

// Svelte-specific reactive store and context
export { createI18nStore, setI18nContext, useI18n } from './svelte/i18n.svelte.js';

// Type definitions for Svelte store
export type { I18nStore, CreateI18nStoreOptions } from './svelte/i18n.svelte.js';

// Optional utilities for advanced use cases

// URL localization utilities (for SvelteKit routing)
export {
	deLocalizeUrl,
	extractLocaleFromPathname,
	extractLocaleFromCookie,
	extractLocaleFromHeader
} from './utils/utils.js';

// Language search and validation utilities
export {
	getLanguageInfo,
	fuzzySearchLanguages,
	getAllLanguages,
	isValidLanguageCode
} from './utils/utils.js';
