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

	// API 4: Translate with interpolation and pluralization support
	// Supports:
	// 1. Simple interpolation: t('hello', { name: 'World' }) -> "Hello, World!"
	// 2. Pluralization: t('items', { count: 1 }) -> uses 'items_one', t('items', { count: 5 }) -> uses 'items_other'
	// 3. Package option: t('key', { package: 'myapp', name: 'value' })
	// 4. Multiple parameters: t('msg', { user: 'Bob', count: 3, item: 'apple' })
	t(key: string, params?: Record<string, string | number>): string;
	t(key: string, options?: { package?: string } & Record<string, string | number>): string;
	t(
		key: string,
		paramsOrOptions?:
			| Record<string, string | number>
			| ({ package?: string } & Record<string, string | number>)
	): string {
		this.compile();
		const pkg = (paramsOrOptions as { package?: string })?.package || '__default__';
		const data = this.registry[pkg]?.[this._locale];
		let value = getNestedValue(data, key);

		if (paramsOrOptions) {
			// 检查是否有 count 参数，用于单复数处理
			const count = paramsOrOptions['count'];
			if (typeof count === 'number') {
				// 根据 count 值选择合适的复数形式
				// 支持：_zero (count === 0), _one (count === 1), _two (count === 2), _few, _many, _other
				let pluralKey: string | undefined;

				if (count === 0) {
					pluralKey = `${key}_zero`;
				} else if (count === 1) {
					pluralKey = `${key}_one`;
				} else if (count === 2) {
					pluralKey = `${key}_two`;
				} else {
					// 默认使用 _other 作为复数形式
					pluralKey = `${key}_other`;
				}

				const pluralValue = getNestedValue(data, pluralKey);
				if (pluralValue) {
					value = pluralValue;
				}
			}

			// 替换占位符 {key} 为对应的参数值（如果找到了翻译值）
			// 支持基本的格式化：{key}, {key:number}, {key:date} 等
			if (value) {
				value = value.replace(/\{(\w+)(?::(\w+))?\}/g, (match, paramKey, format) => {
					const paramValue = paramsOrOptions[paramKey];

					if (paramValue === undefined) {
						return match; // 保持原占位符
					}

					// 应用格式化（如果指定）
					if (format) {
						switch (format) {
							case 'number':
								return typeof paramValue === 'number'
									? paramValue.toLocaleString(this._locale)
									: String(paramValue);
							case 'currency':
								return typeof paramValue === 'number'
									? new Intl.NumberFormat(this._locale, {
											style: 'currency',
											currency: 'USD'
										}).format(paramValue)
									: String(paramValue);
							case 'percent':
								return typeof paramValue === 'number'
									? new Intl.NumberFormat(this._locale, {
											style: 'percent'
										}).format(paramValue)
									: String(paramValue);
							default:
								return String(paramValue);
						}
					}

					return String(paramValue);
				});
			}
		}

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
