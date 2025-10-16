<script lang="ts">
	import { useI18n } from '../../examples/i18n.svelte.js';
	const i18n = useI18n();
</script>

{i18n.locale}
{i18n.t('welcome')}
{i18n.t('connect')}
{i18n.t('greeting')}
{i18n.t('bb')}

<button onclick={() => i18n.setLocale('zh')}>switch to zh</button>
<button onclick={() => i18n.setLocale('en')}>switch to en</button>
