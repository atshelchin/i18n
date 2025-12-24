import type { LayoutServerLoad } from './$types.js';
import type { LocaleData } from '$lib/types.js';
import { createServerLoader } from '$lib/server.js';

// Auto-scan all locale files and create server loader
const { load: i18nLoad, localeMetas } = createServerLoader(
	import.meta.glob<{ default: LocaleData }>('../i18n/locales/**/*.json', { eager: true }),
	{
		defaultLocale: 'en',
		baseNamespaces: ['common'],
		homeNamespace: 'home'
	}
);

export const load = (async (event) => {
	const data = await i18nLoad(event);
	return {
		...data,
		localeMetas
	};
}) satisfies LayoutServerLoad;
