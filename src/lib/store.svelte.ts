/**
 * @shelchin/i18n v2.0 Core Store
 *
 * Svelte 5 reactive i18n store with automatic lazy loading
 */

import { getContext, setContext, untrack } from 'svelte';
import type {
	InitI18nOptions,
	I18nInstance,
	LocaleMeta,
	LocaleLoader,
	LocaleLoaders,
	LocaleData,
	NamespaceRegistry,
	NamespaceStates,
	TranslationContent,
	PreloadedTranslations,
	TranslationKey
} from './types.js';
import {
	getNestedValue,
	extractNamespace,
	extractKeyPath,
	interpolate,
	getPluralKey,
	deepMerge
} from './utils.js';

const I18N_CONTEXT_KEY = Symbol('i18n-v2');

// Module-level singleton for direct imports
let _instance: I18nStore | null = null;

/**
 * Internal I18n Store class
 */
class I18nStore implements I18nInstance {
	// Reactive state
	private _locale = $state<string>('en');
	private _locales = $state<LocaleMeta[]>([]);
	private _registry = $state<NamespaceRegistry>({});
	private _namespaceStates = $state<NamespaceStates>({});
	private _version = $state<number>(0); // Version counter for reactivity
	private _loaders: LocaleLoaders = {};
	private _defaultLocale: string;
	private _devMode: boolean;
	private _pendingLoads = new Map<string, Promise<void>>();

	constructor(options: InitI18nOptions) {
		this._locale = options.locale;
		this._defaultLocale = options.defaultLocale ?? 'en';
		this._devMode = options.devMode ?? false;

		// Initialize locales from SSR-provided metadata first
		if (options.localeMetas) {
			this._locales = options.localeMetas;
		}

		if (options.loaders) {
			this._loaders = options.loaders;
			this._extractLocales();
		}

		// Hydrate preloaded translations for SSR (synchronous)
		if (options.preloadedTranslations) {
			this._hydrateTranslations(options.preloadedTranslations);
		}

		// Handle persistence
		if (options.persist) {
			this._setupPersistence(options.persist);
		}
	}

	// ========================================
	// Public API
	// ========================================

	get locale(): string {
		return this._locale;
	}

	get locales(): LocaleMeta[] {
		return this._locales;
	}

	/**
	 * Translate a key with optional parameters
	 * Automatically triggers lazy loading if namespace not loaded
	 */
	t(key: string, params?: Record<string, string | number>): string {
		// Access reactive state to create dependency for Svelte reactivity
		void this._version;
		void this._locale;

		const namespace = extractNamespace(key);
		const keyPath = extractKeyPath(key);

		// Trigger lazy load if not loaded
		if (!this._isNamespaceLoaded(namespace)) {
			this._triggerLazyLoad(namespace);
			return this._getFallback(key, params);
		}

		// Get translation from registry - use locale:namespace as key
		const registryKey = `${this._locale}:${namespace}`;
		const namespaceData = this._registry[registryKey];
		let value = getNestedValue(namespaceData, keyPath);

		// Handle pluralization
		if (params && typeof params['count'] === 'number') {
			const pluralKey = getPluralKey(keyPath, params['count']);
			const pluralValue = getNestedValue(namespaceData, pluralKey);
			if (pluralValue) {
				value = pluralValue;
			}
		}

		// If not found, try fallback
		if (value === undefined) {
			return this._getFallback(key, params);
		}

		// Interpolate parameters
		return interpolate(value, params, this._locale);
	}

	/**
	 * Switch to a new locale
	 * Automatically loads all previously loaded namespaces for the new locale
	 */
	async setLocale(locale: string): Promise<void> {
		if (locale === this._locale) return;

		// Get list of loaded namespaces for current locale, extract just the namespace part
		const loadedKeys = this.getLoadedNamespaces();
		const namespaces = loadedKeys
			.filter((key) => key.startsWith(`${this._locale}:`))
			.map((key) => key.split(':')[1]);

		// Load all namespaces for new locale in parallel
		await Promise.all(namespaces.map((ns) => this._loadNamespace(locale, ns)));

		// Update locale
		this._locale = locale;

		// Persist
		this._persistLocale(locale);
	}

	/**
	 * Preload specific namespaces (useful for SSR)
	 */
	async preload(namespaces: string[]): Promise<void> {
		await Promise.all(namespaces.map((ns) => this._loadNamespace(this._locale, ns)));
	}

	/**
	 * Check if a namespace is loaded for current locale
	 */
	isLoaded(namespace: string): boolean {
		return this._isNamespaceLoaded(namespace);
	}

	/**
	 * Get all loaded namespaces
	 */
	getLoadedNamespaces(): string[] {
		return Object.entries(this._namespaceStates)
			.filter(([, state]) => state === 'loaded')
			.map(([ns]) => ns);
	}

	/**
	 * Register a loader for a specific locale/namespace
	 */
	_registerLoader(locale: string, namespace: string, loader: LocaleLoader): void {
		if (!this._loaders[locale]) {
			this._loaders[locale] = {};
		}
		this._loaders[locale][namespace] = loader;
		this._extractLocales();
	}

	/**
	 * Get the internal registry (for debugging)
	 */
	_getRegistry(): NamespaceRegistry {
		return this._registry;
	}

	/**
	 * Update locale with preloaded translations (for client-side navigation)
	 * This is used when SvelteKit navigates to a new locale URL
	 */
	_updateLocale(locale: string, preloadedTranslations?: PreloadedTranslations): void {
		if (preloadedTranslations) {
			this._hydrateTranslations(preloadedTranslations);
		}
		this._locale = locale;
		this._persistLocale(locale);
	}

	// ========================================
	// Internal Methods
	// ========================================

	/**
	 * Hydrate translations synchronously for SSR
	 * This populates the registry immediately without async loading
	 */
	private _hydrateTranslations(preloaded: PreloadedTranslations): void {
		for (const [locale, namespaces] of Object.entries(preloaded)) {
			for (const [namespace, data] of Object.entries(namespaces)) {
				const key = `${locale}:${namespace}`;

				// Extract metadata if present
				if (data._meta) {
					this._updateLocaleMeta(locale, data._meta);
				}

				// Store in registry
				this._registry[key] = data as TranslationContent;

				// Mark as loaded
				this._namespaceStates[key] = 'loaded';
			}
		}

		// Bump version to ensure reactivity
		this._version++;
	}

	private _isNamespaceLoaded(namespace: string): boolean {
		const key = `${this._locale}:${namespace}`;
		return this._namespaceStates[key] === 'loaded';
	}

	private _triggerLazyLoad(namespace: string): void {
		const key = `${this._locale}:${namespace}`;

		// Already loading or loaded
		if (
			this._namespaceStates[key] === 'loading' ||
			this._namespaceStates[key] === 'loaded' ||
			this._pendingLoads.has(key)
		) {
			return;
		}

		// Capture locale to avoid closure issues
		const locale = this._locale;

		// Start loading immediately - the async nature means state updates
		// will happen after the current render cycle anyway
		this._loadNamespace(locale, namespace).catch((err) => {
			console.error(`[i18n] Failed to load namespace "${namespace}":`, err);
		});
	}

	private async _loadNamespace(locale: string, namespace: string): Promise<void> {
		const key = `${locale}:${namespace}`;

		// Return existing promise if already loading
		if (this._pendingLoads.has(key)) {
			return this._pendingLoads.get(key);
		}

		// Already loaded or missing
		if (this._namespaceStates[key] === 'loaded' || this._namespaceStates[key] === 'missing') {
			return;
		}

		const loader = this._loaders[locale]?.[namespace];
		if (!loader) {
			// Mark as missing so we don't keep trying
			untrack(() => {
				this._namespaceStates[key] = 'missing';
			});

			if (this._devMode) {
				console.warn(`[i18n] No loader found for ${locale}/${namespace}`);
			}

			// In production, try to load the default locale as fallback
			if (!this._devMode && locale !== this._defaultLocale) {
				this._triggerDefaultLocaleLoad(namespace);
			}
			return;
		}

		// Mark as loading - use untrack to avoid state_unsafe_mutation during render
		untrack(() => {
			this._namespaceStates[key] = 'loading';
		});

		const loadPromise = (async () => {
			try {
				const module = await loader();
				const data = ('default' in module ? module.default : module) as LocaleData;

				// Extract metadata if present
				if (data._meta) {
					this._updateLocaleMeta(locale, data._meta);
				}

				// Merge into registry - use locale:namespace as key to support multiple locales
				const registryKey = `${locale}:${namespace}`;
				if (!this._registry[registryKey]) {
					this._registry[registryKey] = {};
				}
				this._registry[registryKey] = deepMerge(
					this._registry[registryKey] as TranslationContent,
					data as TranslationContent
				);

				console.log(`[i18n] Loaded ${registryKey}:`, Object.keys(data));

				// Mark as loaded and bump version to trigger reactivity
				// No need for untrack here - this runs after await, outside render context
				this._namespaceStates[key] = 'loaded';
				this._version++;
			} catch (error) {
				this._namespaceStates[key] = 'error';
				throw error;
			} finally {
				this._pendingLoads.delete(key);
			}
		})();

		this._pendingLoads.set(key, loadPromise);
		return loadPromise;
	}

	private _getFallback(key: string, params?: Record<string, string | number>): string {
		const namespace = extractNamespace(key);
		const keyPath = extractKeyPath(key);

		// Try default locale fallback (both dev and production)
		if (this._locale !== this._defaultLocale) {
			const defaultKey = `${this._defaultLocale}:${namespace}`;

			// If default locale namespace is loaded, try to get translation
			if (this._namespaceStates[defaultKey] === 'loaded') {
				const namespaceData = this._registry[defaultKey];
				let value = getNestedValue(namespaceData, keyPath);

				if (params && typeof params['count'] === 'number') {
					const pluralKey = getPluralKey(keyPath, params['count']);
					const pluralValue = getNestedValue(namespaceData, pluralKey);
					if (pluralValue) {
						value = pluralValue;
					}
				}

				if (value !== undefined) {
					// In dev mode, warn about fallback usage
					if (this._devMode) {
						console.warn(
							`[i18n] Missing translation: "${key}" for locale "${this._locale}", using fallback from "${this._defaultLocale}"`
						);
					}
					return interpolate(value, params, this._defaultLocale);
				}
			} else if (!this._namespaceStates[defaultKey]) {
				// Default locale namespace not loaded yet - trigger lazy load for future fallbacks
				this._triggerDefaultLocaleLoad(namespace);
			}
		}

		// Final fallback: return key
		if (this._devMode) {
			console.warn(
				`[i18n] Missing translation: "${key}" for locale "${this._locale}" (no fallback available)`
			);
		}
		return key;
	}

	/**
	 * Trigger lazy load for default locale namespace (for production fallback)
	 */
	private _triggerDefaultLocaleLoad(namespace: string): void {
		const key = `${this._defaultLocale}:${namespace}`;

		// Already loading or loaded
		if (
			this._namespaceStates[key] === 'loading' ||
			this._namespaceStates[key] === 'loaded' ||
			this._pendingLoads.has(key)
		) {
			return;
		}

		// Start loading default locale namespace in background
		this._loadNamespace(this._defaultLocale, namespace).catch((err) => {
			console.error(
				`[i18n] Failed to load default locale fallback "${this._defaultLocale}/${namespace}":`,
				err
			);
		});
	}

	private _extractLocales(): void {
		// Build a map of existing locales (preserve meta from preloaded translations)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive, just a temp helper
		const existingMeta = new Map<string, LocaleMeta>();
		for (const loc of this._locales) {
			existingMeta.set(loc.code, loc);
		}

		// Add any new locales from loaders
		for (const locale of Object.keys(this._loaders)) {
			if (!existingMeta.has(locale)) {
				// Only add default meta if not already present
				existingMeta.set(locale, {
					code: locale,
					name: locale,
					englishName: locale
				});
			}
		}

		this._locales = Array.from(existingMeta.values());
	}

	private _updateLocaleMeta(locale: string, meta: LocaleMeta): void {
		const idx = this._locales.findIndex((l) => l.code === locale);
		if (idx >= 0) {
			this._locales[idx] = meta;
		} else {
			this._locales = [...this._locales, meta];
		}
	}

	private _setupPersistence(persist: InitI18nOptions['persist']): void {
		// Persistence setup - will read from storage on init
		if (typeof persist === 'boolean' && persist) {
			// Default: cookie + localStorage
			const stored = this._readStoredLocale();
			if (stored) {
				this._locale = stored;
			}
		} else if (typeof persist === 'object') {
			const stored = this._readStoredLocale(persist);
			if (stored) {
				this._locale = stored;
			}
		}
	}

	private _readStoredLocale(options?: {
		cookie?: boolean;
		cookieName?: string;
		localStorage?: boolean;
		localStorageKey?: string;
	}): string | null {
		const cookieName = options?.cookieName ?? 'i18n-locale';
		const localStorageKey = options?.localStorageKey ?? 'i18n-locale';

		// Try localStorage first
		if (options?.localStorage !== false && typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem(localStorageKey);
			if (stored) return stored;
		}

		// Try cookie
		if (options?.cookie !== false && typeof document !== 'undefined') {
			const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${cookieName}=`));
			if (cookie) return cookie.split('=')[1];
		}

		return null;
	}

	private _persistLocale(locale: string): void {
		// Save to localStorage
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('i18n-locale', locale);
		}

		// Save to cookie
		if (typeof document !== 'undefined') {
			document.cookie = `i18n-locale=${locale}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=lax`;
		}
	}
}

// ========================================
// Public API Functions
// ========================================

/**
 * Initialize i18n with options
 * Call once in your root layout
 */
export function initI18n(options: InitI18nOptions): I18nInstance {
	const store = new I18nStore(options);
	_instance = store;
	return store;
}

/**
 * Set i18n context for component tree
 */
export function setI18nContext(instance: I18nInstance): void {
	setContext(I18N_CONTEXT_KEY, instance);
}

/**
 * Get i18n instance from context
 */
export function useI18n(): I18nInstance {
	const instance = getContext<I18nInstance | undefined>(I18N_CONTEXT_KEY);
	if (!instance) {
		throw new Error(
			'useI18n() must be called within a component that has I18n context. Did you forget to call initI18n() and setI18nContext()?'
		);
	}
	return instance;
}

/**
 * Get the module-level singleton instance
 * Use this for direct imports: import { t } from '@shelchin/i18n'
 */
export function getInstance(): I18nInstance {
	if (!_instance) {
		throw new Error('i18n not initialized. Call initI18n() first.');
	}
	return _instance;
}

// ========================================
// Direct Module Exports (convenience)
// ========================================

/**
 * Translate function - direct import version
 * @example import { t } from '@shelchin/i18n'
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
	return getInstance().t(key, params);
}

/**
 * Set locale - direct import version
 * @example import { setLocale } from '@shelchin/i18n'
 */
export function setLocale(locale: string): Promise<void> {
	return getInstance().setLocale(locale);
}

/**
 * Current locale getter - returns the current locale string
 * For reactive usage in Svelte, use useI18n().locale instead
 */
export function getLocale(): string {
	return getInstance().locale;
}

/**
 * Get all supported locales
 * For reactive usage in Svelte, use useI18n().locales instead
 */
export function getLocales(): LocaleMeta[] {
	return getInstance().locales;
}

// ========================================
// Auto-scan Helper
// ========================================

/**
 * Register loaders from Vite glob import
 *
 * Supports nested directory structures - subdirectories are for organization only:
 * - ./locales/en/common.json -> namespace: "common"
 * - ./locales/en/routes/about.json -> namespace: "about"
 *
 * @example
 * registerGlobLoaders(import.meta.glob('./locales/** /*.json'))
 */
export function registerGlobLoaders(
	modules: Record<string, () => Promise<unknown>>,
	instance?: I18nInstance
): void {
	const store = instance ?? getInstance();

	for (const [path, loader] of Object.entries(modules)) {
		// Expected path format: ./locales/{locale}/[subdir/]{namespace}.json
		// Match locale codes like: en, zh, en-US, zh-CN (case insensitive)
		// Subdirectories are ignored - only filename is used as namespace
		const match = path.match(/\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)\/(?:.*\/)?([^/]+)\.json$/i);
		if (match) {
			const [, locale, namespace] = match;
			store._registerLoader(locale.toLowerCase(), namespace, loader as LocaleLoader);
		} else {
			console.warn(`[i18n] Could not parse locale/namespace from path: ${path}`);
		}
	}
}
