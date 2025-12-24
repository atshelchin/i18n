/**
 * @shelchin/i18n v2.0 Type Definitions
 */

/** Language metadata */
export interface LocaleMeta {
	code: string;
	name: string;
	englishName?: string;
	direction?: 'ltr' | 'rtl';
	flag?: string;
}

/** Translation content (nested object) */
export interface TranslationContent {
	[key: string]: string | TranslationContent;
}

/** Locale data with optional metadata */
export type LocaleData = {
	_meta?: LocaleMeta;
} & TranslationContent;

/** Namespace registry: namespace -> translations */
export interface NamespaceRegistry {
	[namespace: string]: TranslationContent;
}

/** Loader function type */
export type LocaleLoader = () => Promise<{ default: LocaleData } | LocaleData>;

/** Namespace loaders: namespace -> loader function */
export interface NamespaceLoaders {
	[namespace: string]: LocaleLoader;
}

/** All loaders: locale -> namespace loaders */
export interface LocaleLoaders {
	[locale: string]: NamespaceLoaders;
}

/** Namespace loading state */
export type NamespaceState = 'idle' | 'loading' | 'loaded' | 'error';

/** Namespace states: namespace -> state */
export interface NamespaceStates {
	[namespace: string]: NamespaceState;
}

/** Preloaded translations for SSR */
export interface PreloadedTranslations {
	[locale: string]: {
		[namespace: string]: LocaleData;
	};
}

/** Init options for v2 */
export interface InitI18nOptions {
	/** Initial locale */
	locale: string;

	/** Default locale for fallback */
	defaultLocale?: string;

	/** Preloaded translations for SSR (synchronous) */
	preloadedTranslations?: PreloadedTranslations;

	/** Custom loaders (if not using auto-scan) */
	loaders?: LocaleLoaders;

	/** Dev mode (shows keys instead of fallback in dev) */
	devMode?: boolean;

	/** Persist locale to cookie/localStorage */
	persist?: boolean | {
		cookie?: boolean;
		cookieName?: string;
		localStorage?: boolean;
		localStorageKey?: string;
	};
}

/** I18n store interface */
export interface I18nInstance {
	/** Current locale (reactive) */
	readonly locale: string;

	/** Supported locales with metadata */
	readonly locales: LocaleMeta[];

	/** Translation function */
	t(key: string, params?: Record<string, string | number>): string;

	/** Switch locale (async, loads translations) */
	setLocale(locale: string): Promise<void>;

	/** Preload namespaces (for SSR) */
	preload(namespaces: string[]): Promise<void>;

	/** Check if namespace is loaded */
	isLoaded(namespace: string): boolean;

	/** Get all loaded namespaces */
	getLoadedNamespaces(): string[];

	// Internal methods for advanced use
	_registerLoader(locale: string, namespace: string, loader: LocaleLoader): void;
	_getRegistry(): NamespaceRegistry;
	_updateLocale(locale: string, preloadedTranslations?: PreloadedTranslations): void;
}

/** Module-level exports interface */
export interface I18nModule {
	t: I18nInstance['t'];
	setLocale: I18nInstance['setLocale'];
	locale: string;
	locales: LocaleMeta[];
}
