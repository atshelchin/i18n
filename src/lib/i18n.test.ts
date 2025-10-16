import { describe, it, expect } from 'vitest';
import type { LocaleData } from './types.ts';
import { I18n } from './i18n.js';

describe('Type System', () => {
	it('should allow valid LocaleData', () => {
		const valid: LocaleData = {
			_meta: {
				code: 'en',
				name: 'English',
				englishName: 'English',
				direction: 'ltr',
				flag: '🇬🇧'
			},
			welcome: 'Welcome',
			nested: {
				key: 'value'
			}
		};

		expect(valid._meta.code).toBe('en');
	});
});

describe('I18n.setLocale', () => {
	it('should set locale on initialization', () => {
		const i18n = new I18n('zh');
		expect(i18n.locale).toBe('zh');
	});

	it('should default to "en" when no locale provided', () => {
		const i18n = new I18n();
		expect(i18n.locale).toBe('en');
	});

	it('should change locale using setLocale', () => {
		const i18n = new I18n('en');
		expect(i18n.locale).toBe('en');

		i18n.setLocale('zh');
		expect(i18n.locale).toBe('zh');

		i18n.setLocale('ja');
		expect(i18n.locale).toBe('ja');
	});

	it('should affect translation output after locale change', () => {
		const i18n = new I18n('en');

		// Register translations for multiple locales
		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				greeting: 'Hello'
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				},
				greeting: '你好'
			}
		});

		// Test English translation
		expect(i18n.t('greeting')).toBe('Hello');

		// Change locale to Chinese
		i18n.setLocale('zh');
		expect(i18n.t('greeting')).toBe('你好');

		// Change back to English
		i18n.setLocale('en');
		expect(i18n.t('greeting')).toBe('Hello');
	});

	it('should return key when translation not found in new locale', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				greeting: 'Hello'
			}
		});

		expect(i18n.t('greeting')).toBe('Hello');

		// Switch to a locale that doesn't exist
		i18n.setLocale('fr');
		expect(i18n.t('greeting')).toBe('greeting'); // Should return key
	});

	it('should update getMeta result after locale change', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				}
			}
		});

		expect(i18n.getMeta()?.code).toBe('en');
		expect(i18n.getMeta()?.name).toBe('English');

		i18n.setLocale('zh');
		expect(i18n.getMeta()?.code).toBe('zh');
		expect(i18n.getMeta()?.name).toBe('中文');
	});
});

describe('I18n.t', () => {
	it('should translate simple key', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				hello: 'Hello',
				welcome: 'Welcome to our app'
			}
		});

		expect(i18n.t('hello')).toBe('Hello');
		expect(i18n.t('welcome')).toBe('Welcome to our app');
	});

	it('should translate nested key', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				user: {
					profile: {
						name: 'Name',
						email: 'Email'
					}
				}
			}
		});

		expect(i18n.t('user.profile.name')).toBe('Name');
		expect(i18n.t('user.profile.email')).toBe('Email');
	});

	it('should return key when translation not found', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				hello: 'Hello'
			}
		});

		expect(i18n.t('notfound')).toBe('notfound');
		expect(i18n.t('nested.key.missing')).toBe('nested.key.missing');
	});

	it('should translate from specific package', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				greeting: 'Hello from default'
			}
		});

		i18n.register('myapp', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				greeting: 'Hello from myapp'
			}
		});

		expect(i18n.t('greeting')).toBe('Hello from default');
		expect(i18n.t('greeting', { package: 'myapp' })).toBe('Hello from myapp');
	});

	it('should handle multiple locales', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				greeting: 'Hello'
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				},
				greeting: '你好'
			},
			ja: {
				_meta: {
					code: 'ja',
					name: '日本語',
					englishName: 'Japanese',
					direction: 'ltr',
					flag: '🇯🇵'
				},
				greeting: 'こんにちは'
			}
		});

		expect(i18n.t('greeting')).toBe('Hello');

		i18n.setLocale('zh');
		expect(i18n.t('greeting')).toBe('你好');

		i18n.setLocale('ja');
		expect(i18n.t('greeting')).toBe('こんにちは');
	});
});

describe('I18n.getSupportedLocales', () => {
	it('should return empty array when no locales registered', () => {
		const i18n = new I18n('en');
		expect(i18n.getSupportedLocales()).toEqual([]);
	});

	it('should return all registered locales for default package', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				}
			},
			ja: {
				_meta: {
					code: 'ja',
					name: '日本語',
					englishName: 'Japanese',
					direction: 'ltr',
					flag: '🇯🇵'
				}
			}
		});

		const locales = i18n.getSupportedLocales();
		expect(locales).toHaveLength(3);
		expect(locales.map((l) => l.code).sort()).toEqual(['en', 'ja', 'zh']);
	});

	it('should return locales for specific package', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				}
			}
		});

		i18n.register('myapp', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			},
			fr: {
				_meta: {
					code: 'fr',
					name: 'Français',
					englishName: 'French',
					direction: 'ltr',
					flag: '🇫🇷'
				}
			}
		});

		const defaultLocales = i18n.getSupportedLocales();
		expect(defaultLocales).toHaveLength(2);
		expect(defaultLocales.map((l) => l.code).sort()).toEqual(['en', 'zh']);

		const myappLocales = i18n.getSupportedLocales('myapp');
		expect(myappLocales).toHaveLength(2);
		expect(myappLocales.map((l) => l.code).sort()).toEqual(['en', 'fr']);
	});

	it('should include locale metadata', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			},
			ar: {
				_meta: {
					code: 'ar',
					name: 'العربية',
					englishName: 'Arabic',
					direction: 'rtl',
					flag: '🇸🇦'
				}
			}
		});

		const locales = i18n.getSupportedLocales();
		const enMeta = locales.find((l) => l.code === 'en');
		const arMeta = locales.find((l) => l.code === 'ar');

		expect(enMeta).toEqual({
			code: 'en',
			name: 'English',
			englishName: 'English',
			direction: 'ltr',
			flag: '🇬🇧'
		});

		expect(arMeta).toEqual({
			code: 'ar',
			name: 'العربية',
			englishName: 'Arabic',
			direction: 'rtl',
			flag: '🇸🇦'
		});
	});

	it('should return empty array for non-existent package', () => {
		const i18n = new I18n('en');

		i18n.register('__default__', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				}
			}
		});

		expect(i18n.getSupportedLocales('nonexistent')).toEqual([]);
	});
});
