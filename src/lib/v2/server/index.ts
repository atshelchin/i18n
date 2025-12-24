/**
 * @shelchin/i18n v2.0 Server Exports
 */

export {
	detectLocale,
	extractLocaleFromPathname,
	extractLocaleFromHeader,
	extractLocaleFromCookie,
	setLocaleCookie
} from './detect.js';

export type { DetectLocaleOptions } from './detect.js';
