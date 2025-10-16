// Optional utilities for advanced use cases

// URL localization utilities (for SvelteKit routing)
export {
	deLocalizeUrl,
	extractLocaleFromPathname,
	extractLocaleFromCookie,
	extractLocaleFromHeader
} from './utils.js';

// Language search and validation utilities
export {
	getLanguageInfo,
	fuzzySearchLanguages,
	getAllLanguages,
	isValidLanguageCode
} from './utils.js';

// Re-export LocaleMeta type for convenience
export type { LocaleMeta } from '../types.js';
