<script lang="ts">
	import type { LayoutData } from './$types.js';
	import { createI18nStore, setI18nContext } from '$lib/svelte/index.js';
	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();
	console.log({ data });
	const i18nStore = createI18nStore({ initialLocale: data.locale });
	i18nStore.register('__default__', {
		en: {
			_meta: {
				code: 'en',
				name: 'English',
				englishName: 'English',
				direction: 'ltr',
				flag: '🇬🇧'
			},
			title: '@shelchin/i18n',
			subtitle: 'A lightweight i18n library for Svelte',
			greeting: 'Hello',
			welcome: 'Welcome to our demo',
			description:
				'This is a demonstration of the i18n library. It supports reactive state management, automatic persistence, and multi-package translation isolation.',
			features: {
				title: 'Features',
				reactive: 'Reactive State',
				reactiveDesc: 'Built with Svelte 5 runes, automatically updates UI when locale changes',
				persist: 'Auto Persistence',
				persistDesc: 'Supports localStorage and Cookie, preserves user language preference',
				typescript: 'Type Safe',
				typescriptDesc: 'Full TypeScript support with type inference',
				packages: 'Multi-Package',
				packagesDesc: 'Supports translation isolation for reusable component libraries'
			},
			demo: {
				title: 'Live Demo',
				currentLocale: 'Current Language',
				switchLanguage: 'Switch Language',
				nestedKeys: 'Nested Translation Keys',
				dynamicContent: 'Dynamic Content',
				timeNow: 'Current Time'
			},
			stats: {
				title: 'Library Stats',
				supportedLocales: 'Supported Languages',
				translations: 'Translation Keys',
				packages: 'Loaded Packages'
			},
			quickstart: {
				title: 'Quick Start',
				app: 'For App Developers',
				lib: 'For Library Developers',
				install: 'Install',
				setup: 'Setup in root layout',
				use: 'Use in components',
				createHook: 'Create custom hook',
				useInComponent: 'Use in your components'
			}
		},
		zh: {
			_meta: {
				code: 'zh',
				name: '中文',
				englishName: 'Chinese',
				direction: 'ltr',
				flag: '🇨🇳'
			},
			title: '@shelchin/i18n',
			subtitle: '轻量级的 Svelte 国际化库',
			greeting: '你好',
			welcome: '欢迎访问我们的演示',
			description: '这是 i18n 库的演示页面。它支持响应式状态管理、自动持久化以及多包翻译隔离。',
			features: {
				title: '特性',
				reactive: '响应式状态',
				reactiveDesc: '基于 Svelte 5 runes 构建，语言切换时自动更新 UI',
				persist: '自动持久化',
				persistDesc: '支持 localStorage 和 Cookie，保留用户语言偏好',
				typescript: '类型安全',
				typescriptDesc: '完整的 TypeScript 支持，带类型推导',
				packages: '多包支持',
				packagesDesc: '支持可复用组件库的翻译隔离'
			},
			demo: {
				title: '实时演示',
				currentLocale: '当前语言',
				switchLanguage: '切换语言',
				nestedKeys: '嵌套翻译键',
				dynamicContent: '动态内容',
				timeNow: '当前时间'
			},
			stats: {
				title: '库统计',
				supportedLocales: '支持的语言',
				translations: '翻译键数量',
				packages: '已加载包'
			},
			quickstart: {
				title: '快速上手',
				app: '应用开发者',
				lib: '库开发者',
				install: '安装',
				setup: '在根布局中设置',
				use: '在组件中使用',
				createHook: '创建自定义 hook',
				useInComponent: '在组件中使用'
			}
		},
		ja: {
			_meta: {
				code: 'ja',
				name: '日本語',
				englishName: 'Japanese',
				direction: 'ltr',
				flag: '🇯🇵'
			},
			title: '@shelchin/i18n',
			subtitle: '軽量な Svelte 国際化ライブラリ',
			greeting: 'こんにちは',
			welcome: 'デモへようこそ',
			description:
				'これは i18n ライブラリのデモページです。リアクティブな状態管理、自動永続化、マルチパッケージ翻訳分離をサポートしています。',
			features: {
				title: '機能',
				reactive: 'リアクティブステート',
				reactiveDesc: 'Svelte 5 runes で構築、言語切り替え時に UI が自動更新',
				persist: '自動永続化',
				persistDesc: 'localStorage と Cookie をサポート、ユーザーの言語設定を保持',
				typescript: '型安全',
				typescriptDesc: '完全な TypeScript サポート、型推論付き',
				packages: 'マルチパッケージ',
				packagesDesc: '再利用可能なコンポーネントライブラリの翻訳分離をサポート'
			},
			demo: {
				title: 'ライブデモ',
				currentLocale: '現在の言語',
				switchLanguage: '言語を切り替え',
				nestedKeys: 'ネストされた翻訳キー',
				dynamicContent: '動的コンテンツ',
				timeNow: '現在時刻'
			},
			stats: {
				title: 'ライブラリ統計',
				supportedLocales: 'サポート言語',
				translations: '翻訳キー数',
				packages: '読み込み済みパッケージ'
			},
			quickstart: {
				title: 'クイックスタート',
				app: 'アプリ開発者向け',
				lib: 'ライブラリ開発者向け',
				install: 'インストール',
				setup: 'ルートレイアウトでセットアップ',
				use: 'コンポーネントで使用',
				createHook: 'カスタムフックを作成',
				useInComponent: 'コンポーネントで使用'
			}
		}
	});
	setI18nContext(i18nStore);
</script>

<div class="app">
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: #333;
	}

	.app {
		min-height: 100vh;
		padding: 0.5rem;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
