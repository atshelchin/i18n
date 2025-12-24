<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { initI18n, setI18nContext, registerGlobLoaders } from '$lib/index.js';

	let { data, children } = $props();

	// Initialize i18n with preloaded translations from SSR
	const i18n = initI18n({
		locale: data.locale,
		defaultLocale: 'en',
		devMode: true,
		preloadedTranslations: data.preloadedTranslations
	});

	// Register all locale files using Vite glob import (for client-side lazy loading)
	const modules = import.meta.glob('./locales/**/*.json');
	registerGlobLoaders(modules, i18n);

	// Set context for child components
	setI18nContext(i18n);

	// Watch for locale changes from navigation and update i18n
	$effect(() => {
		if (data.locale !== i18n.locale) {
			// Update locale with new translations when navigating to a different locale
			i18n._updateLocale(data.locale, data.preloadedTranslations);
		}
	});

	// Override setLocale to use URL-based navigation
	i18n.setLocale = async (locale: string) => {
		// Navigate to the new locale URL
		const currentPath = page.url.pathname;
		const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(?=\/|$)/, '');
		const newPath = `/${locale}${pathWithoutLocale || '/'}`;
		await goto(newPath);
	};
</script>

<div class="demo-container">
	<header class="demo-header">
		<h1>@shelchin/i18n v2.0</h1>
	</header>
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #ffffff;
	}

	:global(*) {
		box-sizing: border-box;
	}

	/* GitHub-style Design System */
	.demo-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1.5rem;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			'Noto Sans',
			Helvetica,
			Arial,
			sans-serif;
		font-size: 14px;
		line-height: 1.5;
		color: #1f2328;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #d0d7de;
	}

	.demo-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		background: linear-gradient(90deg, #1f2328 0%, #1f2328 60%, #8b949e 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 0.375rem 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: #57606a;
		font-size: 0.9375rem;
		margin: 0;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.demo-container {
			padding: 0.5rem;
		}

		.demo-header {
			margin-bottom: 0.75rem;
			padding-bottom: 0.5rem;
		}

		.demo-header h1 {
			font-size: 1.125rem;
		}

		.subtitle {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 380px) {
		.demo-container {
			padding: 0.375rem;
		}

		.demo-header h1 {
			font-size: 1rem;
		}
	}
</style>
