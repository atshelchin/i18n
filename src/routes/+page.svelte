<script lang="ts">
	import { useI18n } from '$lib/svelte/index.js';
	import { onMount } from 'svelte';

	const i18n = useI18n();
	const { setLocale } = i18n;

	let currentTime = $state(new Date().toLocaleTimeString());

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toLocaleTimeString();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="container">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<h1 class="title">{i18n.t('title')}</h1>
			<p class="subtitle">{i18n.t('subtitle')}</p>

			<!-- Language Switcher -->
			<div class="language-switcher">
				{#each i18n.supportedLocales as locale (locale.code)}
					<button
						class="lang-button"
						class:active={i18n.locale === locale.code}
						onclick={() => setLocale(locale.code)}
					>
						<span class="flag">{locale.flag}</span>
						<span class="lang-name">{locale.name}</span>
					</button>
				{/each}
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main">
		<!-- Greeting Card -->
		<div class="card greeting-card">
			<div class="greeting-emoji">👋</div>
			<h2 class="greeting">{i18n.t('greeting')}</h2>
			<p class="welcome">{i18n.t('welcome')}</p>
		</div>

		<!-- Description -->
		<div class="card description-card">
			<p class="description">{i18n.t('description')}</p>
		</div>

		<!-- Features Grid -->
		<div class="features-section">
			<h3 class="section-title">{i18n.t('features.title')}</h3>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h4 class="feature-title">{i18n.t('features.reactive')}</h4>
					<p class="feature-desc">{i18n.t('features.reactiveDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">💾</div>
					<h4 class="feature-title">{i18n.t('features.persist')}</h4>
					<p class="feature-desc">{i18n.t('features.persistDesc')}</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">📦</div>
					<h4 class="feature-title">{i18n.t('features.packages')}</h4>
					<p class="feature-desc">{i18n.t('features.packagesDesc')}</p>
				</div>
			</div>
		</div>

		<!-- Live Demo Section -->
		<div class="demo-section">
			<h3 class="section-title">{i18n.t('demo.title')}</h3>
			<div class="demo-cards">
				<div class="demo-card">
					<div class="demo-label">{i18n.t('demo.currentLocale')}</div>
					<div class="demo-value">
						{i18n.currentMeta?.flag}
						{i18n.currentMeta?.name}
						<code>({i18n.locale})</code>
					</div>
				</div>

				<div class="demo-card">
					<div class="demo-label">{i18n.t('demo.nestedKeys')}</div>
					<div class="demo-value">
						<code>features.reactive</code> → {i18n.t('features.reactive')}
					</div>
				</div>

				<div class="demo-card">
					<div class="demo-label">{i18n.t('demo.dynamicContent')}</div>
					<div class="demo-value">
						{i18n.t('demo.timeNow')}: <strong>{currentTime}</strong>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Start Guide -->
		<div class="quickstart-section">
			<h3 class="section-title">{i18n.t('quickstart.title')}</h3>
			<div class="quickstart-tabs">
				<div class="quickstart-card app-dev">
					<div class="quickstart-header">
						<div class="quickstart-icon">🚀</div>
						<h4 class="quickstart-title">{i18n.t('quickstart.app')}</h4>
					</div>
					<div class="quickstart-steps">
						<div class="step">
							<div class="step-number">1</div>
							<div class="step-content">
								<div class="step-title">{i18n.t('quickstart.install')}</div>
								<pre><code>pnpm add @shelchin/i18n</code></pre>
							</div>
						</div>
						<div class="step">
							<div class="step-number">2</div>
							<div class="step-content">
								<div class="step-title">{i18n.t('quickstart.setup')}</div>
								<pre><code
										>&lt;script&gt;
import &#123; createI18nStore &#125; from '@shelchin/i18n/svelte';
import &#123; setI18nContext &#125; from '@shelchin/i18n/svelte';

const i18n = createI18nStore();
i18n.register('__default__', &#123; en: &#123;...&#125;, zh: &#123;...&#125; &#125;);
setI18nContext(i18n);
&lt;/script&gt;</code
									></pre>
							</div>
						</div>
						<div class="step">
							<div class="step-number">3</div>
							<div class="step-content">
								<div class="step-title">{i18n.t('quickstart.use')}</div>
								<pre><code
										>&lt;script&gt;
  import &#123; useI18n &#125; from '@shelchin/i18n/svelte';
  const i18n = useI18n();
&lt;/script&gt;

&#123;i18n.t('greeting')&#125;</code
									></pre>
							</div>
						</div>
					</div>
				</div>

				<div class="quickstart-card lib-dev">
					<div class="quickstart-header">
						<div class="quickstart-icon">📦</div>
						<h4 class="quickstart-title">{i18n.t('quickstart.lib')}</h4>
					</div>
					<div class="quickstart-steps">
						<div class="step">
							<div class="step-number">1</div>
							<div class="step-content">
								<div class="step-title">{i18n.t('quickstart.createHook')}</div>
								<pre><code
										>// lib/i18n/index.ts
import &#123; useI18n as base &#125; from '@shelchin/i18n/svelte';
import en from './en.json';

export const useI18n = () =&gt; &#123;
  const i18n = base();
  i18n.register('my-lib', &#123; en &#125;);
  return i18n;
&#125;;</code
									></pre>
							</div>
						</div>
						<div class="step">
							<div class="step-number">2</div>
							<div class="step-content">
								<div class="step-title">{i18n.t('quickstart.useInComponent')}</div>
								<pre><code
										>&lt;script&gt;
  import &#123; useI18n &#125; from './i18n';
  const i18n = useI18n();
&lt;/script&gt;

&#123;i18n.t('button', &#123; package: 'my-lib' &#125;)&#125;</code
									></pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="footer">
		<p>
			<a
				href="https://github.com/atshelchin/i18n"
				target="_blank"
				rel="noopener noreferrer"
				class="footer-link"
			>
				GitHub
			</a>
			·
			<a
				href="https://www.npmjs.com/package/@shelchin/i18n"
				target="_blank"
				rel="noopener noreferrer"
				class="footer-link"
			>
				npm
			</a>
		</p>
	</footer>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Header */
	.header {
		text-align: center;
		margin-bottom: 3rem;
		animation: fadeInDown 0.6s ease-out;
	}

	.header-content {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 3rem 2rem;
		border-radius: 20px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}

	.title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #666;
		margin: 0 0 2rem 0;
	}

	/* Language Switcher */
	.language-switcher {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.lang-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: 2px solid #e0e0e0;
		border-radius: 50px;
		background: white;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
	}

	.lang-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: #667eea;
	}

	.lang-button.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: transparent;
		box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
	}

	.flag {
		font-size: 1.5rem;
	}

	/* Main Content */
	.main {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		animation: fadeInUp 0.6s ease-out;
	}

	.card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	/* Greeting Card */
	.greeting-card {
		text-align: center;
		padding: 3rem 2rem;
	}

	.greeting-emoji {
		font-size: 4rem;
		margin-bottom: 1rem;
		animation: wave 1s ease-in-out infinite;
	}

	.greeting {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #333;
	}

	.welcome {
		font-size: 1.25rem;
		color: #666;
		margin: 0;
	}

	/* Description */
	.description-card {
		text-align: center;
	}

	.description {
		font-size: 1.125rem;
		line-height: 1.7;
		color: #555;
		margin: 0;
	}

	/* Features Section */
	.features-section {
		margin: 2rem 0;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 2rem 0;
		text-align: center;
		color: white;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.feature-desc {
		font-size: 0.95rem;
		line-height: 1.6;
		color: #666;
		margin: 0;
	}

	/* Demo Section */
	.demo-section {
		margin: 2rem 0;
	}

	.demo-cards {
		display: grid;
		gap: 1rem;
	}

	.demo-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		border-left: 4px solid #667eea;
	}

	.demo-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #667eea;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.demo-value {
		font-size: 1.125rem;
		color: #333;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.demo-value code {
		background: #f5f5f5;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		color: #764ba2;
	}

	/* Stats Section */
	.stats-section {
		margin: 2rem 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.stat-number {
		font-size: 3rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 1rem;
		color: #666;
	}

	/* Footer */
	.footer {
		text-align: center;
		margin-top: 4rem;
		padding: 2rem;
		color: white;
		animation: fadeIn 1s ease-out;
	}

	.footer-link {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
		padding: 0 0.5rem;
	}

	.footer-link:hover {
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}

	/* Animations */
	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes wave {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-10deg);
		}
		75% {
			transform: rotate(10deg);
		}
	}

	/* Quick Start Section */
	.quickstart-section {
		margin: 2rem 0;
	}

	.quickstart-tabs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.quickstart-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		overflow-x: auto;
	}

	.quickstart-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
		text-align: center;
		color: white;
	}

	.lib-dev .quickstart-header {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.quickstart-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.quickstart-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.quickstart-steps {
		padding: 2rem;
	}

	.step {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.step:last-child {
		margin-bottom: 0;
	}

	.step-number {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.lib-dev .step-number {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.step-content {
		flex: 1;
	}

	.step-title {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
	}

	.step-content pre {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 0;
	}

	.step-content code {
		font-family: 'Courier New', Monaco, monospace;
		font-size: 0.85rem;
		line-height: 1.6;
		color: #333;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.greeting {
			font-size: 2rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.quickstart-tabs {
			grid-template-columns: 1fr;
		}
	}
</style>
