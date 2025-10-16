export interface LocaleMeta {
	code: string;
	name: string;
	englishName: string;
	direction: 'ltr' | 'rtl';
	flag: string;
}

export interface TranslationContent {
	[key: string]: string | TranslationContent;
}

export type LocaleData = {
	_meta: LocaleMeta;
} & TranslationContent;

export interface PackageLocales {
	[locale: string]: LocaleData;
}

export interface PackageRegistry {
	[packageName: string]: PackageLocales;
}
