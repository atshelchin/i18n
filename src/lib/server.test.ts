/**
 * @shelchin/i18n Server-side utilities tests
 */

import { describe, it, expect } from 'vitest';
import {
	createServerT,
	parseLocaleModules,
	getNamespaceFromPath,
	getNamespacesForPath
} from './server.js';

// Type for FAQ items
interface FAQ {
	question: string;
	answer: string;
}

// Type for Step items
interface Step {
	title: string;
	description: string;
	icon?: string;
}

// Mock translations data (uses any to bypass TranslationKeys type checking)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTranslations: any = {
	en: {
		home: {
			title: 'Welcome',
			description: 'Welcome to our site',
			greeting: 'Hello, {name}!',
			items_zero: 'No items',
			items_one: '{count} item',
			items_other: '{count} items',
			features: ['Feature 1', 'Feature 2', 'Feature 3']
		},
		common: {
			ok: 'OK',
			cancel: 'Cancel'
		},
		page: {
			faqs: [
				{ question: 'What is this?', answer: 'This is a test.' },
				{ question: 'How to use?', answer: 'Just call t().' }
			],
			steps: [
				{ title: 'Step 1', description: 'First step', icon: 'icon-1' },
				{ title: 'Step 2', description: 'Second step' }
			]
		}
	},
	zh: {
		home: {
			title: '欢迎',
			greeting: '你好，{name}！'
		},
		common: {
			ok: '确定'
		},
		page: {
			faqs: [
				{ question: '这是什么？', answer: '这是一个测试。' },
				{ question: '如何使用？', answer: '调用 t() 即可。' }
			]
		}
	}
};

describe('createServerT', () => {
	describe('basic translation', () => {
		it('should translate simple key', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.title')).toBe('Welcome');
		});

		it('should translate with parameters', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.greeting', { name: 'World' })).toBe('Hello, World!');
		});

		it('should return key if not found', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.missing' as never)).toBe('home.missing');
		});
	});

	describe('fallback', () => {
		it('should fallback to default locale', () => {
			const t = createServerT(mockTranslations, { locale: 'zh', defaultLocale: 'en' });
			expect(t('home.description' as never)).toBe('Welcome to our site');
		});

		it('should use current locale when available', () => {
			const t = createServerT(mockTranslations, { locale: 'zh', defaultLocale: 'en' });
			expect(t('home.title')).toBe('欢迎');
		});

		it('should fallback with parameters', () => {
			const t = createServerT(mockTranslations, { locale: 'fr', defaultLocale: 'en' });
			expect(t('home.greeting', { name: 'Test' })).toBe('Hello, Test!');
		});
	});

	describe('pluralization', () => {
		it('should handle zero count', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.items', { count: 0 })).toBe('No items');
		});

		it('should handle one count', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.items', { count: 1 })).toBe('1 item');
		});

		it('should handle other count', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t('home.items', { count: 5 })).toBe('5 items');
		});

		it('should fallback plural from default locale', () => {
			const t = createServerT(mockTranslations, { locale: 'zh', defaultLocale: 'en' });
			expect(t('home.items', { count: 3 })).toBe('3 items');
		});
	});

	describe('t<string[]>()', () => {
		it('should return array of strings', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t<string[]>('home.features')).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
		});

		it('should return key if not found', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t<string[]>('home.missing' as never)).toBe('home.missing');
		});

		it('should fallback array from default locale', () => {
			const t = createServerT(mockTranslations, { locale: 'zh', defaultLocale: 'en' });
			expect(t<string[]>('home.features')).toEqual(['Feature 1', 'Feature 2', 'Feature 3']);
		});
	});

	describe('t<T[]>() - object arrays', () => {
		it('should return array of FAQ objects', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			const faqs = t<FAQ[]>('page.faqs' as never);

			expect(faqs).toHaveLength(2);
			expect(faqs[0].question).toBe('What is this?');
			expect(faqs[0].answer).toBe('This is a test.');
			expect(faqs[1].question).toBe('How to use?');
		});

		it('should return array of Step objects', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			const steps = t<Step[]>('page.steps' as never);

			expect(steps).toHaveLength(2);
			expect(steps[0].title).toBe('Step 1');
			expect(steps[0].icon).toBe('icon-1');
			expect(steps[1].icon).toBeUndefined();
		});

		it('should return localized FAQ objects', () => {
			const t = createServerT(mockTranslations, { locale: 'zh' });
			const faqs = t<FAQ[]>('page.faqs' as never);

			expect(faqs).toHaveLength(2);
			expect(faqs[0].question).toBe('这是什么？');
			expect(faqs[0].answer).toBe('这是一个测试。');
		});

		it('should fallback object array from default locale', () => {
			const t = createServerT(mockTranslations, { locale: 'zh', defaultLocale: 'en' });
			const steps = t<Step[]>('page.steps' as never);

			expect(steps).toHaveLength(2);
			expect(steps[0].title).toBe('Step 1');
		});

		it('should return key if object array not found', () => {
			const t = createServerT(mockTranslations, { locale: 'en' });
			expect(t<FAQ[]>('page.missing' as never)).toBe('page.missing');
		});
	});
});

describe('parseLocaleModules', () => {
	it('should parse modules correctly', () => {
		const modules = {
			'./locales/en/common.json': {
				default: { _meta: { code: 'en', name: 'English' }, ok: 'OK' }
			},
			'./locales/en/home.json': { default: { title: 'Welcome' } },
			'./locales/zh/common.json': {
				default: { _meta: { code: 'zh', name: '中文' }, ok: '确定' }
			}
		};

		const result = parseLocaleModules(modules);

		expect(result.locales).toContain('en');
		expect(result.locales).toContain('zh');
		expect(result.namespaces.has('common')).toBe(true);
		expect(result.namespaces.has('home')).toBe(true);
		expect(result.translations.en.common.ok).toBe('OK');
	});

	it('should handle nested directories', () => {
		const modules = {
			'./locales/en/routes/about.json': { default: { title: 'About' } }
		};

		const result = parseLocaleModules(modules);

		expect(result.namespaces.has('about')).toBe(true);
		expect(result.translations.en.about.title).toBe('About');
	});
});

describe('getNamespaceFromPath', () => {
	it('should return home for root path', () => {
		expect(getNamespaceFromPath('/')).toEqual(['home']);
	});

	it('should extract single segment', () => {
		expect(getNamespaceFromPath('/about')).toEqual(['about']);
	});

	it('should extract multiple segments', () => {
		expect(getNamespaceFromPath('/foo/bar/baz')).toEqual(['foo', 'bar', 'baz']);
	});

	it('should strip locale prefix', () => {
		expect(getNamespaceFromPath('/en/about')).toEqual(['about']);
		expect(getNamespaceFromPath('/zh-CN/foo/bar')).toEqual(['foo', 'bar']);
	});
});

describe('getNamespacesForPath', () => {
	const available = new Set(['common', 'home', 'about', 'products']);

	it('should include base namespaces', () => {
		const result = getNamespacesForPath('/', available);
		expect(result).toContain('common');
	});

	it('should include home namespace for root', () => {
		const result = getNamespacesForPath('/', available);
		expect(result).toContain('home');
	});

	it('should include path segment namespace', () => {
		const result = getNamespacesForPath('/about', available);
		expect(result).toContain('about');
	});

	it('should only include available namespaces', () => {
		const result = getNamespacesForPath('/unknown', available);
		expect(result).not.toContain('unknown');
	});
});
