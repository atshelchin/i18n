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
export type NamespaceState = 'idle' | 'loading' | 'loaded' | 'error' | 'missing';

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

	/** All supported locales with metadata (for SSR) */
	localeMetas?: LocaleMeta[];

	/** Custom loaders (if not using auto-scan) */
	loaders?: LocaleLoaders;

	/** Dev mode (shows keys instead of fallback in dev) */
	devMode?: boolean;

	/** Persist locale to cookie/localStorage */
	persist?:
		| boolean
		| {
				cookie?: boolean;
				cookieName?: string;
				localStorage?: boolean;
				localStorageKey?: string;
		  };
}

/**
 * Translation keys interface - augmented by generated types
 * @example
 * declare module '@shelchin/i18n' {
 *   interface TranslationKeys {
 *     'home.title': string;
 *     'common.ok': string;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TranslationKeys {}

/** Translation key type - uses generated keys if available, falls back to string */
export type TranslationKey = keyof TranslationKeys extends never ? string : keyof TranslationKeys;

/** Translation return type - string by default, or string[] when specified */
export type TranslationResult<T = string> = T extends string[] ? string[] : string;

/** I18n store interface */
export interface I18nInstance {
	/** Current locale (reactive) */
	readonly locale: string;

	/** Supported locales with metadata */
	readonly locales: LocaleMeta[];

	/** Formatter bound to current locale */
	readonly format: I18nFormatter;

	/**
	 * Translation function with optional generic type
	 * Supports formatting in params: {key:number}, {key:currency:USD}, {key:date}, etc.
	 * @example t('home.title') // string
	 * @example t<string[]>('home.features') // string[]
	 * @example t('price', { amount: 1234.56 }) // with {amount:number} in template
	 */
	t<T = string>(
		key: TranslationKey,
		params?: Record<string, string | number | Date>
	): TranslationResult<T>;

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

// ========================================
// Formatting Types
// ========================================

/** Number format notation types */
export type NumberNotation = 'standard' | 'scientific' | 'engineering' | 'compact' | 'subscript';

/** Number format options */
export interface FormatNumberOptions {
	/** Number of decimal places (exact) */
	decimals?: number;
	/** Minimum decimal places */
	minDecimals?: number;
	/** Maximum decimal places */
	maxDecimals?: number;
	/** Display notation */
	notation?: NumberNotation;
	/** Use grouping separators (thousands) */
	useGrouping?: boolean;
}

/** Currency format options */
export interface FormatCurrencyOptions {
	/** Currency code (e.g., 'USD', 'EUR', 'CNY') */
	currency: string;
	/** Number of decimal places */
	decimals?: number;
}

/** Date/time format style */
export type DateTimeStyle = 'short' | 'medium' | 'long' | 'full';

/** Date format options */
export interface FormatDateOptions {
	/** Date style */
	style?: DateTimeStyle;
}

/** Time format options */
export interface FormatTimeOptions {
	/** Time style */
	style?: DateTimeStyle;
}

/** DateTime format options */
export interface FormatDateTimeOptions {
	/** Date style */
	dateStyle?: DateTimeStyle;
	/** Time style */
	timeStyle?: DateTimeStyle;
}

/** Combined format options for interpolation */
export interface FormatOptions {
	number?: FormatNumberOptions;
	currency?: FormatCurrencyOptions;
	date?: FormatDateOptions;
	time?: FormatTimeOptions;
	datetime?: FormatDateTimeOptions;
}

/** Formatter interface for i18n instance */
export interface I18nFormatter {
	/** Format a number according to locale */
	number(value: number, options?: FormatNumberOptions): string;
	/** Format a currency value (currency defaults to locale's default currency) */
	currency(
		value: number,
		currency?: string,
		options?: Omit<FormatCurrencyOptions, 'currency'>
	): string;
	/** Format a percentage */
	percent(value: number, options?: FormatNumberOptions): string;
	/** Format a date */
	date(value: Date | number, options?: FormatDateOptions): string;
	/** Format a time */
	time(value: Date | number, options?: FormatTimeOptions): string;
	/** Format a date and time */
	datetime(value: Date | number, options?: FormatDateTimeOptions): string;
	/** Format a number in scientific notation */
	scientific(value: number, options?: FormatNumberOptions): string;
	/** Format a small number with subscript notation (e.g., 0.0₁₂33) */
	subscript(value: number, options?: FormatNumberOptions): string;
}
