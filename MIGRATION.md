# Migration Guide

- [v0.x to v2.0](#migration-from-v0x-to-v20)
- [v2.0.x to v2.1.0](#migration-from-v20x-to-v210)

---

# Migration from v2.0.x to v2.1.0

v2.1.0 is fully backward compatible with v2.0.x. No breaking changes.

## New Features

### 1. Nested Directory Support

You can now organize locale files in subdirectories for better file management:

```
locales/
├── en/
│   ├── common.json        # namespace: "common"
│   ├── home.json          # namespace: "home"
│   └── routes/            # subdirectory (ignored in namespace)
│       ├── about.json     # namespace: "about"
│       └── products.json  # namespace: "products"
└── zh/
    ├── common.json
    └── routes/
        └── about.json
```

**Key points:**

- Subdirectories are for organization only
- Namespace = filename (without `.json`)
- `zh/routes/about.json` → namespace: `about`, keys: `about.title`, `about.description`
- No code changes required

### 2. `createServerLoader` Helper

New one-line SSR setup:

```typescript
// +layout.server.ts
import { createServerLoader } from '@shelchin/i18n';

const { load: i18nLoad, localeMetas } = createServerLoader(
	import.meta.glob('./locales/**/*.json', { eager: true }),
	{
		defaultLocale: 'en',
		baseNamespaces: ['common'],
		homeNamespace: 'home'
	}
);

export const load = async (event) => {
	const data = await i18nLoad(event);
	return { ...data, localeMetas };
};
```

### 3. Automatic Namespace Detection

Server loader automatically detects which namespace to preload based on URL:

| URL Path         | Namespaces Loaded     |
| ---------------- | --------------------- |
| `/`              | `common` + `home`     |
| `/about`         | `common` + `about`    |
| `/products/list` | `common` + `products` |
| `/en/about`      | `common` + `about`    |

### 4. New Server Utility Functions

| Function                     | Description                   |
| ---------------------------- | ----------------------------- |
| `createServerLoader()`       | One-line SSR setup            |
| `parseLocaleModules()`       | Parse glob imports            |
| `getPreloadedTranslations()` | Filter translations for SSR   |
| `getNamespaceFromPath()`     | Extract namespace from URL    |
| `getNamespacesForPath()`     | Get all namespaces for a path |

## Upgrade Steps

1. Update package: `pnpm update @shelchin/i18n`
2. (Optional) Reorganize locale files into subdirectories
3. (Optional) Simplify `+layout.server.ts` using `createServerLoader`
4. Regenerate types: `npx @shelchin/i18n generate-types --dir src/locales`

---

# Migration from v0.x to v2.0

This guide helps you migrate from `@shelchin/i18n` v0.x to v2.0.

## Breaking Changes

### 1. Import Path Changes

**Before (v0.x):**

```typescript
import { createI18nStore, setI18nContext, useI18n } from '@shelchin/i18n/svelte';
```

**After (v2.0):**

```typescript
import { initI18n, setI18nContext, useI18n } from '@shelchin/i18n';
```

### 2. Store Creation

**Before (v0.x):**

```typescript
const i18n = createI18nStore({
	initialLocale: 'en',
	enablePersist: true
});

i18n.register('__default__', {
	en: { greeting: 'Hello' },
	zh: { greeting: '你好' }
});
```

**After (v2.0):**

```typescript
const i18n = initI18n({
	locale: 'en', // renamed from initialLocale
	defaultLocale: 'en', // fallback locale
	devMode: true, // shows missing keys in dev
	preloadedTranslations: data.preloadedTranslations // SSR support
});

// Use Vite glob import for auto-scanning
registerGlobLoaders(import.meta.glob('./locales/**/*.json'), i18n);
```

### 3. Translation File Structure

**Before (v0.x):** All translations in one object

```typescript
i18n.register('__default__', {
	en: {
		_meta: { code: 'en', name: 'English' },
		greeting: 'Hello',
		user: { profile: 'Profile' }
	},
	zh: {
		_meta: { code: 'zh', name: '中文' },
		greeting: '你好',
		user: { profile: '个人资料' }
	}
});
```

**After (v2.0):** Organized by namespace files

```
src/routes/locales/
├── en/
│   ├── common.json
│   └── home.json
└── zh/
    ├── common.json
    └── home.json
```

Each JSON file:

```json
// locales/en/common.json
{
	"_meta": {
		"code": "en",
		"name": "English",
		"flag": "🇬🇧"
	},
	"greeting": "Hello",
	"ok": "OK"
}
```

### 4. Translation Key Format

**Before (v0.x):**

```typescript
i18n.t('greeting');
i18n.t('user.profile');
```

**After (v2.0):** Keys include namespace prefix

```typescript
i18n.t('common.greeting'); // namespace.key
i18n.t('home.title');
i18n.t('common.user.profile'); // namespace.nested.key
```

### 5. Locale Switching

**Before (v0.x):**

```typescript
i18n.setLocale('zh'); // synchronous
```

**After (v2.0):**

```typescript
await i18n.setLocale('zh'); // async - loads translations
```

For URL-based locale switching (recommended for SEO):

```typescript
// Override setLocale to use navigation
i18n.setLocale = async (locale: string) => {
	const newPath = `/${locale}${pathWithoutLocale}`;
	await goto(newPath);
};
```

### 6. SSR Support

**Before (v0.x):** No built-in SSR support

**After (v2.0):** Full SSR with preloaded translations

```typescript
// +layout.server.ts
export const load = async ({ url, cookies }) => {
	const locale = extractLocaleFromPathname(url.pathname) || 'en';

	// Preload translations on server
	const translations = await import(`./locales/${locale}/common.json`);

	return {
		locale,
		preloadedTranslations: { [locale]: { common: translations.default } }
	};
};

// +layout.svelte
const i18n = initI18n({
	locale: data.locale,
	preloadedTranslations: data.preloadedTranslations
});
```

### 7. Reactive Properties

**Before (v0.x):**

```typescript
i18n.locale; // reactive
i18n.supportedLocales; // array of LocaleMeta
i18n.currentMeta; // current locale metadata
```

**After (v2.0):**

```typescript
i18n.locale; // reactive
i18n.locales; // array of LocaleMeta (renamed)
// currentMeta removed - use i18n.locales.find(l => l.code === i18n.locale)
```

### 8. Package Registration (Removed)

**Before (v0.x):**

```typescript
i18n.register('my-package', { en: {...}, zh: {...} });
i18n.t('key', { package: 'my-package' });
```

**After (v2.0):** Use namespace-based organization instead

```typescript
// Just use namespace prefixes
i18n.t('mypackage.key');
```

## Quick Migration Checklist

- [ ] Update imports from `@shelchin/i18n/svelte` to `@shelchin/i18n`
- [ ] Replace `createI18nStore` with `initI18n`
- [ ] Reorganize translations into `locales/{lang}/{namespace}.json` files
- [ ] Update translation keys to include namespace prefix
- [ ] Add `registerGlobLoaders()` for auto-scanning
- [ ] Update `setLocale` calls to be async
- [ ] Add SSR preloading in `+layout.server.ts`
- [ ] Replace `supportedLocales` with `locales`
- [ ] Remove package-based `register()` calls

## New Features in v2.0

- **Auto-scanning**: Vite glob import for locale files
- **Lazy loading**: Namespaces load on-demand
- **SSR support**: Preload translations on server
- **Type-safe keys**: Generate TypeScript types from JSON
- **Pluralization**: `_zero`, `_one`, `_other` suffixes
- **Interpolation**: `{name}`, `{count:number}` syntax
- **Svelte 5**: Full runes support (`$state`, `$effect`)

## Type-Safe Keys (New)

Generate TypeScript types for your translation keys:

```bash
npx @shelchin/i18n generate-types --dir src/routes/locales --output src/routes/locales/i18n.d.ts
```

This enables autocomplete and compile-time checking for `i18n.t()` calls.
