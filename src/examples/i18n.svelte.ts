import { useI18n as useI18n_ } from '$lib/i18n.svelte.js';
import type { PackageLocales } from '$lib/types.js';
import en from './locales/en.json' with { type: 'json' };
import zh from './locales/zh.json' with { type: 'json' };

export const PACKAGE_NAME = '@shelchin/connectkit';
export const locales = {
	en,
	zh
} as PackageLocales;

export const useI18n = () => {
	const i18n = useI18n_();
	i18n.register(PACKAGE_NAME, locales);
	const t = i18n.t;
	i18n.t = (key) => {
		return t(key, { package: PACKAGE_NAME });
	};
	return i18n;
};
