// Example: Server-side translation with createServerT
import { createServerT, parseLocaleModules } from '$lib/index.js';

// Use correct path to locales directory
const parsed = parseLocaleModules(
	import.meta.glob('../../i18n/locales/**/*.json', { eager: true })
);

console.log({ parsed });

interface FAQ {
	question: string;
	answer: string;
}

export const load = async (event) => {
	const t = createServerT(parsed.translations, {
		event,
		defaultLocale: 'en'
	});
	console.log('Server t():', t('routes/home.title')); // "Welcome to @shelchin/i18n"
	console.log('Server t<string[]>():', t<string[]>('routes/home.features')); // ["...", "...", "..."]
	console.log('Server t<FAQ[]>():', t<FAQ[]>('routes/home.faqs')); // ["...", "...", "..."]

	return {};
};
