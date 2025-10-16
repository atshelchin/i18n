import { getContext, setContext } from 'svelte';
import { I18n } from '$lib/i18n.js';
import type { PackageLocales, LocaleMeta } from '$lib/types.js';

const I18N_KEY = Symbol('I18N_KEY');

export interface I18nStore {
	// Reactive state
	readonly locale: string;
	readonly supportedLocales: LocaleMeta[];
	readonly currentMeta: LocaleMeta | undefined;

	// Methods
	setLocale: (locale: string) => void;
	register: (packageName: string, packageLocales: PackageLocales) => void;
	t: (key: string, options?: { package?: string }) => string;
	getMeta: (packageName?: string) => LocaleMeta | undefined;
	getSupportedLocales: (packageName?: string) => LocaleMeta[];
}

export interface CreateI18nStoreOptions {
	initialLocale?: string;
	defaultPackage?: string;
	persistKey?: string; // localStorage key, default: 'i18n-locale'
	enablePersist?: boolean; // Enable localStorage persistence, default: true
	enableCookie?: boolean; // Enable cookie persistence, default: false
	cookieName?: string; // Cookie name, default: 'i18n-locale'
	cookieOptions?: {
		maxAge?: number; // in seconds, default: 1 year
		path?: string; // default: '/'
		domain?: string;
		sameSite?: 'strict' | 'lax' | 'none';
		secure?: boolean;
	};
}

export function createI18nStore(options: CreateI18nStoreOptions = {}): I18nStore {
	const {
		initialLocale = 'en',
		defaultPackage = '__default__',
		persistKey = 'i18n-locale',
		enablePersist = true,
		enableCookie = true,
		cookieName = 'i18n-locale',
		cookieOptions = {}
	} = options;

	// Helper: Get locale from storage (priority: localStorage > cookie > initialLocale)
	function getStoredLocale(): string {
		// // 1. Try cookie
		// if (enableCookie && typeof document !== 'undefined') {
		// 	const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${cookieName}=`));
		// 	if (cookie) return cookie.split('=')[1];
		// }

		// // 2. Try localStorage first
		// if (enablePersist && typeof localStorage !== 'undefined') {
		// 	const stored = localStorage.getItem(persistKey);
		// 	if (stored) return stored;
		// }

		// 3. Fallback to initialLocale
		return initialLocale;
	}

	// Helper: Save locale to storage
	function saveLocale(locale: string) {
		// Save to localStorage
		if (enablePersist && typeof localStorage !== 'undefined') {
			localStorage.setItem(persistKey, locale);
		}

		// Save to cookie
		if (enableCookie && typeof document !== 'undefined') {
			const {
				maxAge = 365 * 24 * 60 * 60, // 1 year
				path = '/',
				domain,
				sameSite = 'lax',
				secure
			} = cookieOptions;

			let cookieStr = `${cookieName}=${locale}; max-age=${maxAge}; path=${path}; SameSite=${sameSite}`;

			if (domain) cookieStr += `; domain=${domain}`;
			if (secure) cookieStr += '; Secure';

			document.cookie = cookieStr;
		}
	}

	// Core I18n instance with stored locale
	const storedLocale = getStoredLocale();
	const i18n = new I18n(storedLocale);

	// Reactive state using Svelte 5 runes
	let locale = $state(i18n.locale);
	let supportedLocales = $state<LocaleMeta[]>(i18n.getSupportedLocales(defaultPackage));
	let currentMeta = $state<LocaleMeta | undefined>(i18n.getMeta(defaultPackage));

	// Update reactive state when locale changes
	function updateReactiveState() {
		locale = i18n.locale;
		supportedLocales = i18n.getSupportedLocales(defaultPackage);
		currentMeta = i18n.getMeta(defaultPackage);
	}

	// Wrap methods to maintain reactivity
	function setLocale(newLocale: string) {
		i18n.setLocale(newLocale);
		saveLocale(newLocale); // Persist the locale
		updateReactiveState();
	}

	function register(packageName: string, packageLocales: PackageLocales) {
		i18n.register(packageName, packageLocales);
		updateReactiveState();
	}

	function t(key: string, options?: { package?: string }): string {
		// Access locale to create reactive dependency
		void locale;
		return i18n.t(key, options);
	}

	function getMeta(packageName?: string): LocaleMeta | undefined {
		void locale;
		return i18n.getMeta(packageName);
	}

	function getSupportedLocales(packageName?: string): LocaleMeta[] {
		void locale;
		return i18n.getSupportedLocales(packageName);
	}

	return {
		// Reactive getters
		get locale() {
			return locale;
		},
		get supportedLocales() {
			return supportedLocales;
		},
		get currentMeta() {
			return currentMeta;
		},

		// Methods
		setLocale,
		register,
		t,
		getMeta,
		getSupportedLocales
	};
}

export function setI18nContext(store: I18nStore) {
	setContext(I18N_KEY, store);
}

export function useI18n(): I18nStore {
	const store = getContext<I18nStore | undefined>(I18N_KEY);
	if (!store) {
		throw new Error('useI18n() must be called within a component that has I18n context');
	}
	return store;
}
