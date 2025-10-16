import type { PackageRegistry, PackageLocales, LocaleMeta } from './types.js';
import { deepMerge, getNestedValue } from './utils/utils.js';

export class I18n {
	private _locale: string;
	private registry: PackageRegistry = {};

	constructor(locale: string = 'en') {
		this._locale = locale;
	}

	// API 1: Get current language
	get locale(): string {
		return this._locale;
	}

	// API 2: Switch language
	setLocale(locale: string): void {
		this._locale = locale;
	}

	// API 3: Register translations
	register(packageName: string, packageLocales: PackageLocales): void {
		this.registry[packageName] = deepMerge(this.registry[packageName] || {}, packageLocales);
	}

	// API 4: Translate
	t(key: string, options?: { package?: string }): string {
		const pkg = options?.package || '__default__';
		const data = this.registry[pkg]?.[this._locale];
		const value = getNestedValue(data, key);

		return value ?? key;
	}
	// API 5: Get current language metadata
	getMeta(packageName?: string): LocaleMeta | undefined {
		const pkg = packageName || '__default__';
		return this.registry[pkg]?.[this._locale]?._meta;
	}

	// API 6: Get all supported languages
	getSupportedLocales(packageName?: string): LocaleMeta[] {
		const pkg = packageName || '__default__';
		const locales = this.registry[pkg] || {};

		return Object.values(locales)
			.map((data) => data._meta)
			.filter((meta): meta is LocaleMeta => meta !== undefined);
	}
}
