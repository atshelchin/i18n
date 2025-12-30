import type { LayoutServerLoad } from './$types.js';
import type { LocaleData } from '$lib/types.js';
import { createServerLoader } from '$lib/server.js';
import pkg from '../../package.json' with { type: 'json' };
const { version } = pkg;

// Auto-scan all locale files and create server loader
// Route translations are under routes/ directory (e.g., routes/home.json, routes/about.json)
const { load: i18nLoad, localeMetas } = createServerLoader(
	import.meta.glob<{ default: LocaleData }>('../i18n/locales/**/*.json', { eager: true }),
	{
		defaultLocale: 'en',
		baseNamespaces: ['common'],
		homeNamespace: 'routes/home', // Home page namespace
		namespacePrefix: 'routes' // URL /about -> namespace routes/about
	}
);

export const load = (async (event) => {
	const data = await i18nLoad(event);
	return {
		...data,
		localeMetas,
		version
	};
}) satisfies LayoutServerLoad;
