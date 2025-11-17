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

	it('should interpolate simple parameters', () => {
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
				welcome: 'Hello, {name}!',
				account_count: 'You have {count} accounts'
			}
		});

		expect(i18n.t('welcome', { name: 'Alice' })).toBe('Hello, Alice!');
		expect(i18n.t('account_count', { count: 5 })).toBe('You have 5 accounts');
	});

	it('should interpolate multiple parameters', () => {
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
				message: '{user} sent {count} messages to {recipient}'
			}
		});

		expect(i18n.t('message', { user: 'Bob', count: 3, recipient: 'Alice' })).toBe(
			'Bob sent 3 messages to Alice'
		);
	});

	it('should keep unreplaced placeholders when parameter is missing', () => {
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
				message: 'Hello, {name}! You have {count} items.'
			}
		});

		expect(i18n.t('message', { name: 'Alice' })).toBe('Hello, Alice! You have {count} items.');
	});

	it('should work with package option and parameters', () => {
		const i18n = new I18n('en');

		i18n.register('wallet', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				account_count: 'Wallet has {count} accounts'
			}
		});

		expect(i18n.t('account_count', { package: 'wallet', count: 10 })).toBe(
			'Wallet has 10 accounts'
		);
	});

	it('should handle numeric parameters', () => {
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
				price: 'Price: ${amount}'
			}
		});

		expect(i18n.t('price', { amount: 99.99 })).toBe('Price: $99.99');
	});

	it('should handle plural forms with _one and _other suffixes', () => {
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
				account_zero: '{count} accounts',
				account_one: '{count} account',
				account_two: '{count} accounts',
				account_other: '{count} accounts'
			}
		});

		expect(i18n.t('account', { count: 1 })).toBe('1 account');
		expect(i18n.t('account', { count: 0 })).toBe('0 accounts');
		expect(i18n.t('account', { count: 2 })).toBe('2 accounts');
		expect(i18n.t('account', { count: 10 })).toBe('10 accounts');
	});

	it('should fallback to base key when plural forms not defined', () => {
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
				item: '{count} items'
			}
		});

		// 没有定义 item_one 和 item_other，应该使用基础的 item
		expect(i18n.t('item', { count: 1 })).toBe('1 items');
		expect(i18n.t('item', { count: 5 })).toBe('5 items');
	});

	it('should work without count parameter', () => {
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
				message: 'Hello, {name}!',
				message_one: 'One message',
				message_other: 'Many messages'
			}
		});

		// 不传 count，应该使用基础 key
		expect(i18n.t('message', { name: 'World' })).toBe('Hello, World!');
		// 传 count，应该使用复数形式
		expect(i18n.t('message', { count: 1 })).toBe('One message');
		expect(i18n.t('message', { count: 5 })).toBe('Many messages');
	});

	it('should handle zero count with _zero suffix', () => {
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
				item_zero: 'No items',
				item_one: 'One item',
				item_other: '{count} items'
			}
		});

		expect(i18n.t('item', { count: 0 })).toBe('No items');
		expect(i18n.t('item', { count: 1 })).toBe('One item');
		expect(i18n.t('item', { count: 5 })).toBe('5 items');
	});

	it('should handle two count with _two suffix', () => {
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
				person_one: 'One person',
				person_two: 'A pair of people',
				person_other: '{count} people'
			}
		});

		expect(i18n.t('person', { count: 1 })).toBe('One person');
		expect(i18n.t('person', { count: 2 })).toBe('A pair of people');
		expect(i18n.t('person', { count: 3 })).toBe('3 people');
	});

	it('should format numbers with :number formatter', () => {
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
				users: '{count:number} users'
			}
		});

		expect(i18n.t('users', { count: 1000 })).toBe('1,000 users');
		expect(i18n.t('users', { count: 1000000 })).toBe('1,000,000 users');
	});

	it('should format currency with :currency formatter', () => {
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
				price: 'Total: {amount:currency}'
			}
		});

		const result = i18n.t('price', { amount: 99.99 });
		// Currency formatting may vary, just check it contains the number
		expect(result).toContain('99.99');
	});

	it('should format percentage with :percent formatter', () => {
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
				progress: 'Progress: {value:percent}'
			}
		});

		const result = i18n.t('progress', { value: 0.75 });
		// Percent formatting: 0.75 -> 75%
		expect(result).toContain('75');
	});

	it('should handle mixed interpolation and pluralization', () => {
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
				notification_one: '{user} sent you {count} message',
				notification_other: '{user} sent you {count} messages'
			}
		});

		expect(i18n.t('notification', { user: 'Alice', count: 1 })).toBe('Alice sent you 1 message');
		expect(i18n.t('notification', { user: 'Bob', count: 5 })).toBe('Bob sent you 5 messages');
	});

	it('should keep unknown formatters as-is', () => {
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
				message: 'Value: {amount:unknown}'
			}
		});

		expect(i18n.t('message', { amount: 42 })).toBe('Value: 42');
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
