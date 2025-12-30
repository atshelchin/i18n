<script lang="ts">
	import { resolve } from '$app/paths';
	import { useI18n } from '$lib/index.js';

	const i18n = useI18n();
</script>

<div class="about-page">
	<h1>{i18n.t('routes/about.title')}</h1>
	<p class="description">{i18n.t('routes/about.description')}</p>
	<p class="content">{i18n.t('routes/about.content')}</p>

	<div class="namespace-info">
		<h3>Loaded Namespaces:</h3>
		<div class="namespace-list">
			{#each i18n.getLoadedNamespaces() as ns (ns)}
				<span class="namespace-tag">{ns}</span>
			{/each}
		</div>
	</div>

	<a href={resolve('/')} class="back-link">{i18n.t('routes/about.backHome')}</a>
</div>

<style>
	.about-page {
		padding: 1rem;
	}

	h1 {
		color: #1f2328;
		margin-bottom: 1rem;
	}

	.description,
	.content {
		color: #57606a;
		margin-bottom: 1rem;
	}

	.namespace-info {
		margin: 2rem 0;
		padding: 1rem;
		background: #f6f8fa;
		border: 1px solid #d0d7de;
		border-radius: 6px;
	}

	.namespace-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		color: #1f2328;
	}

	.namespace-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.namespace-tag {
		padding: 0.25rem 0.75rem;
		background: #ddf4ff;
		color: #0550ae;
		border-radius: 20px;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1px solid #54aeff66;
	}

	.back-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: #1f883d;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
	}

	.back-link:hover {
		background: #1a7f37;
	}
</style>
