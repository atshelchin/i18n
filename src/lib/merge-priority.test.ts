import { describe, it, expect } from 'vitest';
import { I18n } from './i18n.js';

describe('I18n merge priority with source parameter', () => {
	it('should preserve lib translations when app only partially overrides', () => {
		const i18n = new I18n('en');

		// 包内部注册完整翻译
		i18n.register('my-package', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				key1: 'Lib EN 1',
				key2: 'Lib EN 2'
			},
			zh: {
				_meta: {
					code: 'zh',
					name: '中文',
					englishName: 'Chinese',
					direction: 'ltr',
					flag: '🇨🇳'
				},
				key1: 'Lib ZH 1',
				key2: 'Lib ZH 2'
			}
		}, 'lib');

		// 应用中只补充英文的一个 key
		i18n.register('my-package', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				key1: 'App EN 1'
			}
		}, 'app');

		// 测试英文
		expect(i18n.t('key1', { package: 'my-package' })).toBe('App EN 1'); // app 覆盖
		expect(i18n.t('key2', { package: 'my-package' })).toBe('Lib EN 2'); // lib 保留

		// 测试中文（应用没有注册中文，应该保留 lib 的）
		i18n.setLocale('zh');
		expect(i18n.t('key1', { package: 'my-package' })).toBe('Lib ZH 1');
		expect(i18n.t('key2', { package: 'my-package' })).toBe('Lib ZH 2');
	});

	it('should prevent duplicate registration from same source', () => {
		const i18n = new I18n('en');

		// 第一次注册
		i18n.register('test-pkg', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				key: 'First'
			}
		}, 'lib');

		// 第二次用相同 source 注册（应该被忽略）
		i18n.register('test-pkg', {
			en: {
				_meta: {
					code: 'en',
					name: 'English',
					englishName: 'English',
					direction: 'ltr',
					flag: '🇬🇧'
				},
				key: 'Second'
			}
		}, 'lib');

		expect(i18n.t('key', { package: 'test-pkg' })).toBe('First');
	});
});
