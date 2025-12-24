<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { useI18n } from '$lib/index.js';

	// Type for FAQ items
	interface FAQ {
		question: string;
		answer: string;
	}

	const i18n = useI18n();

	let count = $state(1);
	let name = $state('World');

	const GITHUB_URL = 'https://github.com/atshelchin/i18n';

	function switchLocale(locale: string) {
		const currentPath = page.url.pathname;
		// Replace locale prefix or add it
		const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(?=\/|$)/, '');
		const newPath = `/${locale}${pathWithoutLocale || '/'}`;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- dynamic locale URL
		goto(newPath);
	}
</script>

<div class="demo-page">
	<!-- GitHub Banner -->
	<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" class="github-banner">
		<svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
			<path
				d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
			/>
		</svg>
		<span>{i18n.t('common.github.star')}</span>
		<span class="star-icon">⭐</span>
	</a>

	<!-- Language Switcher -->
	<section class="card locale-switcher">
		<div class="locale-header">
			<span class="label">{i18n.t('common.currentLocale')}:</span>
			<span class="current-locale">{i18n.locale.toUpperCase()}</span>
		</div>
		<div class="locale-buttons">
			{#each i18n.locales as loc (loc.code)}
				<button
					onclick={() => switchLocale(loc.code)}
					class:active={i18n.locale === loc.code}
					disabled={i18n.locale === loc.code}
				>
					<span class="flag">{loc.flag}</span>
					<span class="name">{loc.name}</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Features -->
	<section class="card features-card">
		<h2>{i18n.t('common.sections.features')}</h2>
		<div class="features-grid">
			<div class="feature-item">
				<span class="feature-icon">📁</span>
				<span>{i18n.t('common.features.autoScan')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">⚡</span>
				<span>{i18n.t('common.features.lazyLoad')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🖥️</span>
				<span>{i18n.t('common.features.ssr')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🔒</span>
				<span>{i18n.t('common.features.typeSafe')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">✨</span>
				<span>{i18n.t('common.features.minimal')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🔮</span>
				<span>{i18n.t('common.features.svelte5')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🌐</span>
				<span>{i18n.t('common.features.formatting')}</span>
			</div>
			<div class="feature-item">
				<span class="feature-icon">🪶</span>
				<span>{i18n.t('common.features.zeroDeps')}</span>
			</div>
		</div>
	</section>

	<!-- Quick Start -->
	<section class="card quickstart-card">
		<h2>{i18n.t('common.sections.quickStart')}</h2>

		<div class="step">
			<h3>{i18n.t('common.quickStart.step1')}</h3>
			<pre class="code-block"><code><span class="hl-cmd">npm</span> install @shelchin/i18n</code
				></pre>
		</div>

		<div class="step">
			<h3>{i18n.t('common.quickStart.step2')}</h3>
			<pre class="code-block"><code
					><span class="hl-comment">// locales/en/common.json</span>
{'{'}<br />  <span class="hl-key">"_meta"</span>: {'{'} <span class="hl-key">"code"</span>: <span
						class="hl-string">"en"</span
					>, <span class="hl-key">"name"</span>: <span class="hl-string">"English"</span>, <span
						class="hl-key">"flag"</span
					>: <span class="hl-string">"🇬🇧"</span> },<br />  <span class="hl-key">"hello"</span
					>: <span class="hl-string">"Hello"</span>,<br />  <span class="hl-key">"greeting"</span
					>: <span class="hl-string">"Hello, {'{'}<span class="hl-param">name</span>}!"</span><br
					/>}

<span class="hl-comment">// locales/zh/common.json</span>
{'{'}<br />  <span class="hl-key">"_meta"</span>: {'{'} <span class="hl-key">"code"</span>: <span
						class="hl-string">"zh"</span
					>, <span class="hl-key">"name"</span>: <span class="hl-string">"中文"</span>, <span
						class="hl-key">"flag"</span
					>: <span class="hl-string">"🇨🇳"</span> },<br />  <span class="hl-key">"hello"</span
					>: <span class="hl-string">"你好"</span>,<br />  <span class="hl-key">"greeting"</span
					>: <span class="hl-string">"你好，{'{'}<span class="hl-param">name</span>}！"</span><br
					/>}</code
				></pre>
		</div>

		<div class="step">
			<h3>{i18n.t('common.quickStart.step3')}</h3>
			<pre class="code-block"><code
					><span class="hl-comment">// +layout.svelte</span>
<span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-keyword">import</span> {'{'} initI18n, setI18nContext, registerGlobLoaders } <span
						class="hl-keyword">from</span
					> <span class="hl-string">'@shelchin/i18n'</span>;

  <span class="hl-keyword">const</span> i18n = <span class="hl-func">initI18n</span
					>({'{'} locale: <span class="hl-string">'en'</span>, defaultLocale: <span
						class="hl-string">'en'</span
					> });

  <span class="hl-comment">// Auto-scan all locale files</span>
  <span class="hl-func">registerGlobLoaders</span>(<span class="hl-keyword">import</span>.meta.<span
						class="hl-func">glob</span
					>(<span class="hl-string">'./locales/**/*.json'</span>), i18n);

  <span class="hl-func">setI18nContext</span>(i18n);
<span class="hl-tag">&lt;/script&gt;</span></code
				></pre>
		</div>

		<div class="step">
			<h3>{i18n.t('common.quickStart.step4')}</h3>
			<pre class="code-block"><code
					><span class="hl-comment">// +page.svelte</span>
<span class="hl-tag">&lt;script&gt;</span>
  <span class="hl-keyword">import</span> {'{'} useI18n } <span class="hl-keyword">from</span> <span
						class="hl-string">'@shelchin/i18n'</span
					>;
  <span class="hl-keyword">const</span> i18n = <span class="hl-func">useI18n</span>();
<span class="hl-tag">&lt;/script&gt;</span>

<span class="hl-tag">&lt;p&gt;</span>{'{'}i18n.<span class="hl-func">t</span>(<span
						class="hl-string">'common.hello'</span
					>)}<span class="hl-tag">&lt;/p&gt;</span>
<span class="hl-tag">&lt;p&gt;</span>{'{'}i18n.<span class="hl-func">t</span>(<span
						class="hl-string">'common.greeting'</span
					>, {'{'} name: <span class="hl-string">'World'</span> })}<span class="hl-tag"
						>&lt;/p&gt;</span
					>

<span class="hl-tag">&lt;button</span> <span class="hl-attr">onclick</span>={'{'}() => i18n.<span
						class="hl-func">setLocale</span
					>(<span class="hl-string">'zh'</span>)}<span class="hl-tag">&gt;</span>
  Switch to Chinese
<span class="hl-tag">&lt;/button&gt;</span></code
				></pre>
		</div>
	</section>

	<!-- Basic Translation -->
	<section class="card usage-card">
		<h2>{i18n.t('common.sections.basic')}</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						>i18n.<span class="hl-func">t</span>(<span class="hl-string">'home.title'</span>)
i18n.<span class="hl-func">t</span>(<span class="hl-string">'common.ok'</span>)</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="translation-item">
					<code>home.title</code>
					<span class="arrow">→</span>
					<span class="value">{i18n.t('home.title')}</span>
				</div>
				<div class="translation-item">
					<code>home.description</code>
					<span class="arrow">→</span>
					<span class="value">{i18n.t('home.description')}</span>
				</div>
				<div class="translation-item">
					<code>common.ok</code>
					<span class="arrow">→</span>
					<span class="value">{i18n.t('common.ok')}</span>
				</div>
				<div class="translation-item">
					<code>common.cancel</code>
					<span class="arrow">→</span>
					<span class="value">{i18n.t('common.cancel')}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Interpolation -->
	<section class="card usage-card">
		<h2>{i18n.t('common.sections.interpolation')}</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment"
							>// JSON: "greeting": "Hello, {'{'}<span class="hl-param">name</span>}!"</span
						>
i18n.<span class="hl-func">t</span>(<span class="hl-string">'home.greeting'</span
						>, {'{'} name: <span class="hl-string">'{name}'</span> })</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="input-group">
					<label>
						<span>{i18n.t('common.labels.name')}:</span>
						<input type="text" bind:value={name} placeholder="Enter name..." />
					</label>
				</div>
				<div class="result">
					<code>home.greeting</code>
					<span class="arrow">→</span>
					<span class="value highlight">{i18n.t('home.greeting', { name })}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Pluralization -->
	<section class="card usage-card">
		<h2>{i18n.t('common.sections.pluralization')}</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// JSON: "items_zero": "No items"</span>
<span class="hl-comment"
							>//       "items_one": "{'{'}<span class="hl-param">count</span>} item"</span
						>
<span class="hl-comment"
							>//       "items_other": "{'{'}<span class="hl-param">count</span>} items"</span
						>
i18n.<span class="hl-func">t</span>(<span class="hl-string">'home.items'</span>, {'{'} count: <span
							class="hl-number">{count}</span
						> })</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="input-group">
					<label>
						<span>{i18n.t('common.labels.count')}:</span>
						<input type="number" bind:value={count} min="0" max="999" />
					</label>
				</div>
				<div class="count-buttons">
					<button onclick={() => (count = 0)}>0</button>
					<button onclick={() => (count = 1)}>1</button>
					<button onclick={() => (count = 2)}>2</button>
					<button onclick={() => (count = 5)}>5</button>
					<button onclick={() => (count = 100)}>100</button>
				</div>
				<div class="result">
					<code>home.items</code>
					<span class="arrow">→</span>
					<span class="value highlight">{i18n.t('home.items', { count })}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Array Access -->
	<section class="card usage-card">
		<h2>Array Access</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// JSON: "features": ["Feature 1", "Feature 2", ...]</span>
<span class="hl-comment">// Access by index</span>
i18n.<span class="hl-func">t</span>(<span class="hl-string">'home.features.0'</span>) <span
							class="hl-comment">// First item</span
						>
i18n.<span class="hl-func">t</span>(<span class="hl-string">'home.features.1'</span>) <span
							class="hl-comment">// Second item</span
						>

<span class="hl-comment">// Get full array (client &amp; server)</span>
i18n.<span class="hl-func">t</span>&lt;string[]&gt;(<span class="hl-string">'home.features'</span
						>) <span class="hl-comment">// string[]</span></code
					></pre>
			</div>
			<div class="usage-demo">
				<p class="array-label">i18n.t&lt;string[]&gt;('home.features'):</p>
				<ul class="features-list">
					{#each i18n.t<string[]>('home.features') as feature, i (i)}
						<li>{feature}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- Object Array Access (NEW!) -->
	<section class="card usage-card">
		<h2>Object Array Access (NEW!)</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// JSON:</span>
<span class="hl-comment">// "faqs": [</span>
<span class="hl-comment">//   {'{'} "question": "...", "answer": "..." },</span>
<span class="hl-comment">//   {'{'} "question": "...", "answer": "..." }</span>
<span class="hl-comment">// ]</span>

<span class="hl-comment">// Define your type</span>
<span class="hl-keyword">interface</span> FAQ {'{'}
  question: <span class="hl-keyword">string</span>;
  answer: <span class="hl-keyword">string</span>;
}

<span class="hl-comment">// Get typed array</span>
i18n.<span class="hl-func">t</span>&lt;FAQ[]&gt;(<span class="hl-string">'home.faqs'</span
						>) <span class="hl-comment">// FAQ[]</span></code
					></pre>
			</div>
			<div class="usage-demo">
				<p class="array-label">i18n.t&lt;FAQ[]&gt;('home.faqs'):</p>
				<div class="faq-list">
					{#each i18n.t<FAQ[]>('home.faqs') as faq, i (i)}
						<div class="faq-item">
							<div class="faq-question">Q: {faq.question}</div>
							<div class="faq-answer">A: {faq.answer}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Number & Date Formatting -->
	<section class="card usage-card">
		<h2>Number & Date Formatting</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// Template interpolation</span>
&#123;amount:number&#125; <span class="hl-comment">// locale number</span>
&#123;price:currency:USD&#125; <span class="hl-comment">// currency</span>
&#123;val:percent&#125; <span class="hl-comment">// percentage</span>
&#123;d:date&#125; <span class="hl-comment">// short date</span>
&#123;d:date:long&#125; <span class="hl-comment">// long date</span>
&#123;num:scientific&#125; <span class="hl-comment">// 1.23E9</span>
&#123;num:subscript&#125; <span class="hl-comment">// 0.0₁₂33</span>

<span class="hl-comment">// Direct format API</span>
i18n.format.<span class="hl-func">number</span>(1234.56)
i18n.format.<span class="hl-func">currency</span>(99.99, <span class="hl-string">'USD'</span>)
i18n.format.<span class="hl-func">date</span>(<span class="hl-keyword">new</span> Date())</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="format-demo">
					<div class="format-item">
						<span class="format-label">number:</span>
						<span class="format-value">{i18n.format.number(1234567.89)}</span>
					</div>
					<div class="format-item">
						<span class="format-label">currency:</span>
						<span class="format-value">{i18n.format.currency(99.99)}</span>
					</div>
					<div class="format-item">
						<span class="format-label">percent:</span>
						<span class="format-value">{i18n.format.percent(0.75)}</span>
					</div>
					<div class="format-item">
						<span class="format-label">date:</span>
						<span class="format-value">{i18n.format.date(new Date())}</span>
					</div>
					<div class="format-item">
						<span class="format-label">scientific:</span>
						<span class="format-value">{i18n.format.scientific(0.0000000033)}</span>
					</div>
					<div class="format-item">
						<span class="format-label">subscript:</span>
						<span class="format-value">{i18n.format.subscript(0.0000000000033)}</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- SSR Preloading with createServerLoader -->
	<section class="card usage-card">
		<h2>SSR Preloading</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// +layout.server.ts</span>
<span class="hl-keyword">import</span> {'{'} createServerLoader }
  <span class="hl-keyword">from</span> <span class="hl-string">'@shelchin/i18n'</span>;

<span class="hl-keyword">const</span> {'{'} load: i18nLoad, localeMetas } =
  <span class="hl-func">createServerLoader</span>(
    <span class="hl-keyword">import</span>.meta.<span class="hl-func">glob</span>(<span
							class="hl-string">'./locales/**/*.json'</span
						>, {'{'} eager: <span class="hl-keyword">true</span> }),
    {'{'}
      defaultLocale: <span class="hl-string">'en'</span>,
      baseNamespaces: [<span class="hl-string">'common'</span>],
      homeNamespace: <span class="hl-string">'home'</span>
    }
  );

<span class="hl-keyword">export const</span> load = <span class="hl-keyword">async</span
						> (event) => {'{'}
  <span class="hl-keyword">const</span> data = <span class="hl-keyword">await</span> <span
							class="hl-func">i18nLoad</span
						>(event);
  <span class="hl-keyword">return</span> {'{'} ...data, localeMetas };
};</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="ssr-info">
					<div class="ssr-item">
						<span class="ssr-label">baseNamespaces</span>
						<span class="ssr-desc">Always preload these</span>
					</div>
					<div class="ssr-item">
						<span class="ssr-label">homeNamespace</span>
						<span class="ssr-desc">Namespace for "/" route</span>
					</div>
					<div class="ssr-item">
						<span class="ssr-label">Auto-detect</span>
						<span class="ssr-desc">/about → preloads "about" ns</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Server-Side Translation (SSR) -->
	<section class="card usage-card">
		<h2>Server-Side Translation</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						><span class="hl-comment">// +page.server.ts</span>
<span class="hl-keyword">import</span> {'{'} createServerT, parseLocaleModules }
  <span class="hl-keyword">from</span> <span class="hl-string">'@shelchin/i18n'</span>;

<span class="hl-keyword">const</span> parsed = <span class="hl-func">parseLocaleModules</span>(
  <span class="hl-keyword">import</span>.meta.<span class="hl-func">glob</span>(<span
							class="hl-string">'./locales/**/*.json'</span
						>, {'{'} eager: <span class="hl-keyword">true</span> })
);

<span class="hl-keyword">export const</span> load = <span class="hl-keyword">async</span
						> (event) => {'{'}
  <span class="hl-keyword">const</span> t = <span class="hl-func">createServerT</span
						>(parsed.translations, {'{'}
    event,
    defaultLocale: <span class="hl-string">'en'</span>
  });

  <span class="hl-keyword">return</span> {'{'}
    seoTitle: t(<span class="hl-string">'home.title'</span>),
    features: t&lt;string[]&gt;(<span class="hl-string">'home.features'</span>)
  };
};</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="ssr-info">
					<div class="ssr-item">
						<span class="ssr-label">t(key)</span>
						<span class="ssr-desc">Returns string</span>
					</div>
					<div class="ssr-item">
						<span class="ssr-label">t&lt;string[]&gt;(key)</span>
						<span class="ssr-desc">Returns string[]</span>
					</div>
					<div class="ssr-item">
						<span class="ssr-label">event</span>
						<span class="ssr-desc">Auto-detect locale from URL/cookies</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Loaded Namespaces -->
	<section class="card usage-card">
		<h2>{i18n.t('common.sections.namespaces')}</h2>
		<div class="usage-content">
			<div class="usage-code">
				<pre class="code-block-small"><code
						>i18n.<span class="hl-func">getLoadedNamespaces</span>()
i18n.<span class="hl-func">isLoaded</span>(<span class="hl-string">'common'</span>)</code
					></pre>
			</div>
			<div class="usage-demo">
				<div class="namespace-list">
					{#each i18n.getLoadedNamespaces() as ns (ns)}
						<span class="namespace-tag">{ns}</span>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Test Lazy Loading Navigation -->
	<section class="card test-nav">
		<h2>Test Lazy Loading</h2>
		<p>
			Click the link below to navigate to the About page. The 'about' namespace will be lazy loaded.
		</p>
		<a href={resolve('/about')} class="test-link">Go to About Page →</a>
	</section>

	<!-- Footer CTA -->
	<footer class="footer-cta">
		<p>{i18n.t('common.github.description')}</p>
		<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" class="github-btn">
			<svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
			{i18n.t('common.github.star')}
		</a>
	</footer>
</div>

<style>
	/* GitHub-style Design System */
	.demo-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card {
		background: #ffffff;
		border-radius: 6px;
		padding: 1.25rem;
		border: 1px solid #d0d7de;
		overflow: hidden;
	}

	.card h2 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #1f2328;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #d0d7de;
	}

	/* GitHub Banner */
	.github-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		background: #f6f8fa;
		color: #1f2328;
		border-radius: 6px;
		border: 1px solid #d0d7de;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.github-banner:hover {
		background: #f3f4f6;
		border-color: #1f2328;
	}

	.github-icon {
		width: 18px;
		height: 18px;
	}

	.star-icon {
		font-size: 1rem;
	}

	/* Locale Switcher - GitHub style */
	.locale-switcher {
		background: #f6f8fa;
		border: 1px solid #d0d7de;
	}

	.locale-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.locale-header .label {
		font-size: 0.875rem;
		color: #656d76;
	}

	.locale-header .current-locale {
		font-weight: 600;
		font-size: 0.875rem;
		color: #1f2328;
		background: #ffffff;
		padding: 0.25rem 0.5rem;
		border-radius: 6px;
		border: 1px solid #d0d7de;
	}

	.locale-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.locale-buttons button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		background: #ffffff;
		color: #1f2328;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.locale-buttons button:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #1f2328;
	}

	.locale-buttons button.active {
		background: #0969da;
		color: white;
		border-color: #0969da;
		cursor: default;
	}

	.locale-buttons button .flag {
		font-size: 1.1rem;
	}

	/* Features - GitHub style */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #1f2328;
	}

	.feature-icon {
		font-size: 1.1rem;
	}

	/* Quick Start - GitHub code block style */
	.quickstart-card {
		background: #ffffff;
		border: 1px solid #d0d7de;
	}

	.quickstart-card h2 {
		color: #1f2328;
		font-size: 1rem;
		border-bottom: 1px solid #d0d7de;
	}

	.step {
		margin-bottom: 1.25rem;
	}

	.step:last-child {
		margin-bottom: 0;
	}

	.step h3 {
		color: #656d76;
		font-size: 0.875rem;
		font-weight: 500;
		margin: 0 0 0.5rem 0;
	}

	.code-block {
		background: #f6f8fa;
		border-radius: 6px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0;
		border: 1px solid #d0d7de;
	}

	.code-block code {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		color: #1f2328;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Syntax Highlighting - GitHub style */
	.hl-comment {
		color: #6e7781;
		font-style: italic;
	}

	.hl-keyword {
		color: #cf222e;
		font-weight: 500;
	}

	.hl-string {
		color: #0a3069;
	}

	.hl-func {
		color: #8250df;
	}

	.hl-tag {
		color: #116329;
	}

	.hl-attr {
		color: #0550ae;
	}

	.hl-key {
		color: #0550ae;
	}

	.hl-param {
		color: #953800;
	}

	.hl-cmd {
		color: #0550ae;
		font-weight: 600;
	}

	.hl-number {
		color: #0550ae;
	}

	/* Usage Cards - Full Width with Code + Demo Layout */
	.usage-card {
		width: 100%;
		max-width: 100%;
	}

	.usage-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: start;
		min-width: 0;
	}

	.usage-code {
		background: #f6f8fa;
		border-radius: 6px;
		padding: 0.75rem;
		border: 1px solid #d0d7de;
		height: 100%;
		display: flex;
		align-items: center;
		overflow-x: auto;
		min-width: 0;
	}

	.code-block-small {
		margin: 0;
		background: transparent;
		overflow-x: auto;
		max-width: 100%;
	}

	.code-block-small code {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		color: #1f2328;
		white-space: pre;
		display: block;
	}

	.usage-demo {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.translation-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.translation-item code {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.75rem;
		color: #0550ae;
		background: #ddf4ff;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.arrow {
		color: #656d76;
		font-size: 0.875rem;
	}

	.value {
		color: #1f2328;
		font-weight: 500;
	}

	.value.highlight {
		color: #1a7f37;
		font-size: 1rem;
	}

	/* Input Groups - GitHub form style */
	.input-group {
		margin-bottom: 0.75rem;
	}

	.input-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.input-group span {
		font-size: 0.875rem;
		color: #656d76;
		min-width: 50px;
	}

	.input-group input {
		flex: 1;
		padding: 0.375rem 0.75rem;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #ffffff;
		color: #1f2328;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.input-group input:focus {
		outline: none;
		border-color: #0969da;
		box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
	}

	.result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: #dafbe1;
		border-radius: 6px;
		border: 1px solid #aceebb;
	}

	/* Count Buttons - GitHub button group style */
	.count-buttons {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.count-buttons button {
		padding: 0.25rem 0.625rem;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		background: #f6f8fa;
		font-size: 0.8125rem;
		color: #1f2328;
		cursor: pointer;
		transition: all 0.15s;
	}

	.count-buttons button:hover {
		background: #f3f4f6;
		border-color: #1f2328;
	}

	/* Namespace Tags - GitHub label style */
	.namespace-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.namespace-tag {
		padding: 0.25rem 0.625rem;
		background: #ddf4ff;
		color: #0550ae;
		border-radius: 20px;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1px solid #54aeff66;
	}

	/* SSR Info - Server-Side Translation */
	.ssr-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ssr-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
	}

	.ssr-label {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #8250df;
		background: #fbefff;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		border: 1px solid #d8b4fe;
	}

	.ssr-desc {
		font-size: 0.875rem;
		color: #656d76;
	}

	/* Format Demo */
	.format-demo {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.format-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
	}

	.format-label {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		color: #0969da;
		min-width: 70px;
	}

	.format-value {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		color: #1a7f37;
		font-weight: 500;
	}

	/* Features List */
	.array-label {
		margin: 0 0 0.5rem 0;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		color: #656d76;
	}

	.features-list {
		margin: 0;
		padding-left: 1.25rem;
		color: #1f2328;
	}

	.features-list li {
		padding: 0.25rem 0;
		font-size: 0.875rem;
	}

	/* FAQ List */
	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.faq-item {
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
		padding: 0.625rem 0.75rem;
	}

	.faq-question {
		font-weight: 600;
		color: #0550ae;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.faq-answer {
		color: #1f2328;
		font-size: 0.8125rem;
	}

	/* Test Navigation */
	.test-nav {
		text-align: center;
	}

	.test-nav p {
		color: #57606a;
		margin: 0.5rem 0 1rem;
	}

	.test-link {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #1f883d;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
	}

	.test-link:hover {
		background: #1a7f37;
	}

	/* Footer CTA - GitHub style */
	.footer-cta {
		text-align: center;
		padding: 1.5rem;
		background: #f6f8fa;
		border-radius: 6px;
		border: 1px solid #d0d7de;
	}

	.footer-cta p {
		margin: 0 0 0.75rem 0;
		color: #656d76;
		font-size: 0.875rem;
	}

	.github-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: #1f2328;
		color: white;
		border-radius: 6px;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		transition: background-color 0.15s;
	}

	.github-btn:hover {
		background: #32383f;
	}

	.github-btn .github-icon {
		width: 16px;
		height: 16px;
	}

	/* Responsive - Tablet */
	@media (max-width: 768px) {
		.usage-content {
			grid-template-columns: 1fr;
		}

		.usage-code {
			order: 2;
		}

		.usage-demo {
			order: 1;
		}

		.features-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Responsive - Mobile */
	@media (max-width: 640px) {
		.demo-page {
			gap: 0.5rem;
		}

		.card {
			padding: 0.75rem;
			border-radius: 4px;
		}

		.card h2 {
			font-size: 0.875rem;
			margin-bottom: 0.5rem;
			padding-bottom: 0.375rem;
		}

		.locale-switcher {
			padding: 0.625rem;
		}

		.locale-header {
			margin-bottom: 0.5rem;
		}

		.locale-buttons {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 0.375rem;
		}

		.locale-buttons button {
			justify-content: center;
			padding: 0.25rem 0.5rem;
			font-size: 0.8125rem;
		}

		.locale-buttons button .flag {
			font-size: 1rem;
		}

		.features-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.375rem;
		}

		.feature-item {
			font-size: 0.75rem;
			padding: 0.375rem 0.5rem;
		}

		.feature-icon {
			font-size: 0.9rem;
		}

		.github-banner {
			font-size: 0.75rem;
			padding: 0.375rem 0.5rem;
		}

		.step {
			margin-bottom: 0.75rem;
		}

		.step h3 {
			font-size: 0.75rem;
		}

		.code-block {
			padding: 0.5rem;
		}

		.code-block code {
			font-size: 0.6875rem;
		}

		.usage-content {
			gap: 0.5rem;
		}

		.usage-code {
			padding: 0.375rem;
		}

		.code-block-small code {
			font-size: 0.6875rem;
		}

		.translation-item {
			flex-wrap: wrap;
			gap: 0.25rem;
			padding: 0.25rem 0.375rem;
		}

		.translation-item code {
			font-size: 0.625rem;
		}

		.input-group {
			margin-bottom: 0.5rem;
		}

		.input-group label {
			flex-wrap: wrap;
		}

		.input-group span {
			min-width: auto;
			width: 100%;
			margin-bottom: 0.125rem;
			font-size: 0.75rem;
		}

		.input-group input {
			padding: 0.25rem 0.5rem;
			font-size: 0.8125rem;
		}

		.count-buttons {
			flex-wrap: wrap;
			gap: 0.25rem;
			margin-bottom: 0.5rem;
		}

		.count-buttons button {
			flex: 1;
			min-width: 36px;
			padding: 0.1875rem 0.375rem;
			font-size: 0.75rem;
		}

		.result {
			flex-wrap: wrap;
			padding: 0.375rem 0.5rem;
		}

		.result code {
			font-size: 0.625rem;
		}

		.value.highlight {
			font-size: 0.875rem;
		}

		.namespace-tag {
			font-size: 0.75rem;
			padding: 0.1875rem 0.5rem;
		}

		.footer-cta {
			padding: 0.75rem;
		}

		.footer-cta p {
			font-size: 0.75rem;
			margin-bottom: 0.5rem;
		}

		.github-btn {
			font-size: 0.8125rem;
			padding: 0.375rem 0.75rem;
		}
	}

	/* Responsive - Small Mobile */
	@media (max-width: 380px) {
		.locale-buttons {
			grid-template-columns: repeat(2, 1fr);
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.feature-item {
			padding: 0.25rem 0.375rem;
			font-size: 0.6875rem;
		}

		.code-block code,
		.code-block-small code {
			font-size: 0.625rem;
		}
	}
</style>
