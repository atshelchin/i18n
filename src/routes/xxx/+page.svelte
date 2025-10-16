<script lang="ts">
	import { useI18n } from '$lib/i18n.svelte.js';

	// ✅ 正确：不要解构响应式属性
	const i18n = useI18n();

	// ✅ 方法可以解构（它们不是响应式的）
	const { setLocale, register, t } = i18n;

	register('xxx', {
		en: {
			_meta: {
				code: 'en',
				name: 'English',
				englishName: 'English',
				direction: 'ltr',
				flag: '🇬🇧'
			},
			bb: 'Hello sb'
		},
		zh: {
			_meta: {
				code: 'zh',
				name: '中文',
				englishName: 'Chinese',
				direction: 'ltr',
				flag: '🇨🇳'
			},
			bb: '你傻逼好'
		}
	});
</script>

{i18n.locale}
{t('bb', { package: 'xxx' })}

<button onclick={() => setLocale('zh')}>switch to zh</button>
<button onclick={() => setLocale('en')}>switch to en</button>
