# @shelchin/i18n

Modern i18n library for Svelte 5 with automatic lazy loading and SSR support.

## Features

- **Auto-scan locale files** - Use Vite glob imports
- **Lazy loading by namespace** - Load translations on-demand
- **SSR support** - Preload translations on server
- **Automatic fallback** - Missing translations fall back to default locale
- **Type-safe keys** - Generate TypeScript definitions
- **Minimal core API** - Simple and intuitive
- **Svelte 5 runes** - Full `$state` reactivity

## Installation

```bash
npm install @shelchin/i18n
# or
pnpm add @shelchin/i18n
```

## Quick Start

### 1. Create locale files

Organize translations by locale and namespace:

```
src/
├── routes/
│   ├── locales/          # Can be anywhere
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── home.json
│   │   │   └── routes/        # Subdirectories for organization
│   │   │       └── about.json
│   │   └── zh/
│   │       ├── common.json
│   │       ├── home.json
│   │       └── routes/
│   │           └── about.json
│   ├── +layout.svelte
│   └── +page.svelte
```

> **Note:** Subdirectories are for organization only. The namespace is derived from the filename:
>
> - `en/common.json` → namespace: `common`
> - `en/routes/about.json` → namespace: `about` (not `routes/about`)

Each JSON file contains translations for that namespace:

```json
// locales/en/common.json
{
	"_meta": {
		"code": "en",
		"name": "English",
		"englishName": "English",
		"flag": "🇬🇧"
	},
	"greeting": "Hello, {name}!",
	"ok": "OK",
	"cancel": "Cancel"
}
```

```json
// locales/zh/common.json
{
	"_meta": {
		"code": "zh",
		"name": "中文",
		"englishName": "Chinese",
		"flag": "🇨🇳"
	},
	"greeting": "你好，{name}！",
	"ok": "确定",
	"cancel": "取消"
}
```

### 2. Initialize in layout

```svelte
<!-- +layout.svelte -->
<script lang="ts">
	import { initI18n, setI18nContext, registerGlobLoaders } from '@shelchin/i18n';

	let { data, children } = $props();

	// Initialize i18n
	const i18n = initI18n({
		locale: data.locale ?? 'en',
		defaultLocale: 'en',
		devMode: true,
		preloadedTranslations: data.preloadedTranslations
	});

	// Auto-scan locale files (lazy loading on client)
	registerGlobLoaders(import.meta.glob('./locales/**/*.json'), i18n);

	// Set context for child components
	setI18nContext(i18n);
</script>

{@render children()}
```

### 3. Use in components

```svelte
<!-- +page.svelte -->
<script lang="ts">
	import { useI18n } from '@shelchin/i18n';

	const i18n = useI18n();
</script>

<h1>{i18n.t('common.greeting', { name: 'World' })}</h1>
<p>Current locale: {i18n.locale}</p>

<!-- Language switcher -->
<select onchange={(e) => i18n.setLocale(e.target.value)}>
	{#each i18n.locales as loc}
		<option value={loc.code} selected={i18n.locale === loc.code}>
			{loc.flag}
			{loc.name}
		</option>
	{/each}
</select>
```

## SSR Support

For server-side rendering, use `createServerLoader` for automatic namespace detection based on URL:

```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';
import { createServerLoader } from '@shelchin/i18n';

const { load: i18nLoad, localeMetas } = createServerLoader(
	import.meta.glob('./locales/**/*.json', { eager: true }),
	{
		defaultLocale: 'en',
		baseNamespaces: ['common'], // Always preload these
		homeNamespace: 'home' // Namespace for "/" route
	}
);

export const load = (async (event) => {
	const data = await i18nLoad(event);
	return { ...data, localeMetas };
}) satisfies LayoutServerLoad;
```

### Automatic Namespace Detection

The server loader automatically detects which namespace to preload based on URL:

| URL Path         | Namespaces Loaded     |
| ---------------- | --------------------- |
| `/`              | `common` + `home`     |
| `/about`         | `common` + `about`    |
| `/products/list` | `common` + `products` |
| `/en/about`      | `common` + `about`    |

Only namespaces that exist in your locale files are preloaded. Unknown namespaces fall back to client-side lazy loading.

### Manual SSR Setup

For more control, use the individual helper functions:

```typescript
import { parseLocaleModules, getPreloadedTranslations } from '@shelchin/i18n';

const parsed = parseLocaleModules(import.meta.glob('./locales/**/*.json', { eager: true }));

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	const locale = cookies.get('i18n-locale') || 'en';

	const preloadedTranslations = getPreloadedTranslations(parsed, {
		locale,
		pathname: url.pathname,
		baseNamespaces: ['common']
	});

	return {
		locale,
		supportedLocales: parsed.locales,
		localeMetas: parsed.localeMetas,
		preloadedTranslations
	};
};
```

## Pluralization

Use `_zero`, `_one`, `_other` suffixes:

```json
{
	"items_zero": "No items",
	"items_one": "{count} item",
	"items_other": "{count} items"
}
```

```svelte
{i18n.t('common.items', { count: 0 })}
<!-- "No items" -->
{i18n.t('common.items', { count: 1 })}
<!-- "1 item" -->
{i18n.t('common.items', { count: 5 })}
<!-- "5 items" -->
```

## Interpolation

Use `{key}` syntax with optional formatting:

```json
{
	"greeting": "Hello, {name}!",
	"price": "Price: {amount:currency}",
	"progress": "Progress: {value:percent}"
}
```

```svelte
{i18n.t('common.greeting', { name: 'Alice' })}
{i18n.t('common.price', { amount: 99.99 })}
{i18n.t('common.progress', { value: 0.75 })}
```

## Array Access

You can define arrays in your translation files and access elements by index:

```json
{
	"features": ["Auto-scan locale files", "Lazy loading by namespace", "Full SSR support"]
}
```

```svelte
{i18n.t('home.features.0')}
<!-- "Auto-scan locale files" -->
{i18n.t('home.features.1')}
<!-- "Lazy loading by namespace" -->
```

## Fallback Behavior

When a translation key is missing for the current locale, the library automatically falls back to the default locale:

- **SSR**: Both current locale and default locale translations are preloaded
- **Client**: Missing namespace triggers automatic loading of default locale
- **Dev mode**: Console warnings show which keys are using fallback

```typescript
// Configure default locale for fallback
const i18n = initI18n({
	locale: 'zh',
	defaultLocale: 'en', // Fallback to English if Chinese translation missing
	devMode: true // Show console warnings for missing translations
});
```

## Type-Safe Keys

Generate TypeScript types for compile-time key checking:

```bash
npx @shelchin/i18n generate-types --dir src/routes/locales --output src/routes/locales/i18n.d.ts
```

Options:

- `--dir` - Locales directory (default: `src/locales`)
- `--output` - Output file path (default: `src/locales/i18n.d.ts`)
- `--watch` - Watch for changes
- `--module` - Module to augment (default: `@shelchin/i18n`)

## API Reference

### Core Functions

| Function                             | Description                    |
| ------------------------------------ | ------------------------------ |
| `initI18n(options)`                  | Initialize i18n store          |
| `setI18nContext(i18n)`               | Set Svelte context             |
| `useI18n()`                          | Get i18n instance from context |
| `registerGlobLoaders(modules, i18n)` | Register locale file loaders   |
| `t(key, params?)`                    | Translate a key (module-level) |

### Server Functions

| Function                               | Description                           |
| -------------------------------------- | ------------------------------------- |
| `createServerLoader(modules, options)` | Create SSR load function              |
| `parseLocaleModules(modules)`          | Parse glob imports to structured data |
| `getPreloadedTranslations(data, opts)` | Get filtered translations for SSR     |
| `getNamespaceFromPath(pathname)`       | Extract namespace from URL path       |
| `getNamespacesForPath(pathname, ns)`   | Get all namespaces for a path         |

### InitI18nOptions

| Option                  | Type                | Default  | Description         |
| ----------------------- | ------------------- | -------- | ------------------- |
| `locale`                | `string`            | required | Initial locale      |
| `defaultLocale`         | `string`            | `'en'`   | Fallback locale     |
| `preloadedTranslations` | `object`            | -        | SSR preloaded data  |
| `localeMetas`           | `LocaleMeta[]`      | -        | All locale metadata |
| `devMode`               | `boolean`           | `false`  | Show missing keys   |
| `persist`               | `boolean \| object` | -        | Persist to storage  |

### I18nInstance

| Property/Method       | Type            | Description                  |
| --------------------- | --------------- | ---------------------------- |
| `locale`              | `string`        | Current locale (reactive)    |
| `locales`             | `LocaleMeta[]`  | Available locales (reactive) |
| `t(key, params?)`     | `function`      | Translate a key              |
| `setLocale(locale)`   | `Promise<void>` | Switch locale                |
| `isLoaded(namespace)` | `boolean`       | Check if loaded              |
| `preload(namespaces)` | `Promise<void>` | Preload namespaces           |

## URL-Based Locale (SvelteKit)

For SEO-friendly URLs like `/en/about`, `/zh/about`:

```typescript
// hooks.ts
import { deLocalizeUrl } from '@shelchin/i18n/utils';

export const reroute = ({ url }) => deLocalizeUrl(url).pathname;
```

```svelte
<!-- Override setLocale to use navigation -->
<script>
	import { goto } from '$app/navigation';

	i18n.setLocale = async (locale) => {
		await goto(`/${locale}${currentPath}`);
	};
</script>
```

## Migration

- **From v0.x to v2.0:** See [MIGRATION.md](./MIGRATION.md)
- **From v2.0.x to v2.1.0:** See [v2.0 to v2.1 Migration](#v20x-to-v210-migration) below

### v2.0.x to v2.1.0 Migration

v2.1.0 adds new features with full backward compatibility:

#### New: Nested Directory Support

You can now organize locale files in subdirectories:

```
locales/
├── en/
│   ├── common.json        # namespace: "common"
│   ├── home.json          # namespace: "home"
│   └── routes/            # subdirectory for organization
│       ├── about.json     # namespace: "about"
│       └── products.json  # namespace: "products"
```

No code changes required - subdirectories are for organization only.

#### New: `createServerLoader` Helper

Simplify your SSR setup:

**Before (v2.0.x):**

```typescript
const localeModules = import.meta.glob('./locales/**/*.json', { eager: true });

function parseLocaleModules() {
	/* ... manual parsing ... */
}
function getNamespacesForPath(pathname) {
	/* ... manual mapping ... */
}

export const load = async ({ url, cookies }) => {
	// ... manual locale detection and translation filtering
};
```

**After (v2.1.0):**

```typescript
import { createServerLoader } from '@shelchin/i18n';

const { load: i18nLoad, localeMetas } = createServerLoader(
	import.meta.glob('./locales/**/*.json', { eager: true }),
	{ defaultLocale: 'en' }
);

export const load = async (event) => {
	const data = await i18nLoad(event);
	return { ...data, localeMetas };
};
```

## License

MIT
