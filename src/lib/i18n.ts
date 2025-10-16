import type { PackageRegistry, PackageLocales, LocaleMeta } from './types.js';
import { deepMerge, getNestedValue } from './utils/utils.js';

export class I18n {
	private _locale: string;
	private registry: PackageRegistry = {};
	private registrations: Array<{ pkg: string; locales: PackageLocales; source: 'lib' | 'app' }> =
		[];
	private registered = new Set<string>();
	private compiled = false;

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
	register(
		packageName: string,
		packageLocales: PackageLocales,
		source: 'lib' | 'app' = 'lib'
	): void {
		const key = `${packageName}:${source}`;

		// 去重：同一个 package + source 只记录一次
		if (this.registered.has(key)) {
			return;
		}

		this.registered.add(key);
		this.registrations.push({ pkg: packageName, locales: packageLocales, source });
		this.compiled = false;
	}

	// API 4: Translate
	t(key: string, options?: { package?: string }): string {
		this.compile();
		const pkg = options?.package || '__default__';
		const data = this.registry[pkg]?.[this._locale];
		const value = getNestedValue(data, key);

		return value ?? key;
	}
	// API 5: Get current language metadata
	getMeta(packageName?: string): LocaleMeta | undefined {
		this.compile();
		const pkg = packageName || '__default__';
		return this.registry[pkg]?.[this._locale]?._meta;
	}

	// API 6: Get all supported languages
	getSupportedLocales(packageName?: string): LocaleMeta[] {
		this.compile();
		const pkg = packageName || '__default__';
		const locales = this.registry[pkg] || {};

		return Object.values(locales)
			.map((data) => data._meta)
			.filter((meta): meta is LocaleMeta => meta !== undefined);
	}

	private compile(): void {
		if (this.compiled) return;

		this.registry = {};

		// 先处理所有 lib，再处理所有 app（保证 app 覆盖 lib）
		const libRegs = this.registrations.filter((r) => r.source === 'lib');
		const appRegs = this.registrations.filter((r) => r.source === 'app');

		for (const { pkg, locales } of [...libRegs, ...appRegs]) {
			this.registry[pkg] = deepMerge(this.registry[pkg] || {}, locales);
		}

		this.compiled = true;
	}
}
