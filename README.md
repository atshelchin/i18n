# @shelchin/i18n 使用指南

一个轻量级、类型安全的 Svelte 国际化库，支持响应式状态管理和自动持久化。

## 📦 安装

```bash
pnpm add @shelchin/i18n
```

---

## 🎯 三种使用场景

### 1️⃣ 在应用中使用（Application）

适用于：最终用户应用（网站、Web App）

#### 步骤 1: 在根布局中初始化

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { createI18nStore, setI18nContext } from '@shelchin/i18n/svelte';

	// 创建 i18n store（会自动从 localStorage 恢复用户选择）
	const i18n = createI18nStore({
		initialLocale: 'en',
		enablePersist: true // 默认启用 localStorage 持久化
	});

	// 注册翻译内容
	i18n.register('__default__', {
		en: {
			_meta: {
				code: 'en',
				name: 'English',
				englishName: 'English',
				direction: 'ltr',
				flag: '🇬🇧'
			},
			welcome: 'Welcome',
			greeting: 'Hello',
			user: {
				profile: 'Profile',
				settings: 'Settings'
			}
		},
		zh: {
			_meta: {
				code: 'zh',
				name: '中文',
				englishName: 'Chinese',
				direction: 'ltr',
				flag: '🇨🇳'
			},
			welcome: '欢迎',
			greeting: '你好',
			user: {
				profile: '个人资料',
				settings: '设置'
			}
		}
	});

	// 设置 context，让子组件可以访问
	setI18nContext(i18n);
</script>

<slot />
```

#### 步骤 2: 在子组件中使用

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { useI18n } from '@shelchin/i18n/svelte';

	// ⚠️ 注意：不要解构响应式属性！
	const i18n = useI18n();

	// 可以解构方法
	const { setLocale } = i18n;
</script>

<h1>{i18n.t('greeting')}</h1>
<p>{i18n.t('welcome')}</p>

<!-- 嵌套键 -->
<a href="/profile">{i18n.t('user.profile')}</a>

<!-- 显示当前语言 -->
<p>Current: {i18n.locale} - {i18n.currentMeta?.name}</p>

<!-- 语言切换 -->
<button onclick={() => setLocale('zh')}>切换到中文</button>
<button onclick={() => setLocale('en')}>Switch to English</button>

<!-- 语言选择器 -->
<select value={i18n.locale} onchange={(e) => setLocale(e.target.value)}>
	{#each i18n.supportedLocales as locale}
		<option value={locale.code}>
			{locale.flag}
			{locale.name}
		</option>
	{/each}
</select>
```

#### 按需加载翻译

```svelte
<script lang="ts">
	import { useI18n } from '@shelchin/i18n/svelte';
	import { onMount } from 'svelte';

	const i18n = useI18n();

	onMount(async () => {
		// 动态加载翻译文件
		const ja = await import('./locales/ja.json');

		i18n.register('__default__', {
			ja: ja.default
		});
	});
</script>
```

---

### 2️⃣ 在可复用包中使用（Package/Library）

适用于：开发可复用的 Svelte 组件库

#### 包结构

```
my-component-lib/
├── src/
│   ├── lib/
│   │   ├── Button.svelte
│   │   ├── Modal.svelte
│   │   └── i18n/
│   │       ├── index.ts          # 导出 useI18n
│   │       └── locales/
│   │           ├── en.json
│   │           └── zh.json
│   └── index.ts
└── package.json
```

#### 步骤 1: 创建包专属的 i18n hook

```typescript
// src/lib/i18n/index.ts
import { useI18n as useI18nBase } from '@shelchin/i18n/svelte';
import type { PackageLocales } from '@shelchin/i18n';
import en from './locales/en.json' with { type: 'json' };
import zh from './locales/zh.json' with { type: 'json' };

// 定义你的包名（建议使用 package.json 中的名称）
export const PACKAGE_NAME = 'my-component-lib';

// 预加载的翻译数据
export const locales = { en, zh } as PackageLocales;

// 导出包专属的 useI18n hook
export const useI18n = () => {
	const i18n = useI18nBase();

	// 自动注册本包的翻译
	i18n.register(PACKAGE_NAME, locales);

	// 返回一个封装后的 t 函数，自动使用本包的翻译
	const originalT = i18n.t;
	i18n.t = (key) => {
		return originalT(key, { package: PACKAGE_NAME });
	};

	return i18n;
};
```

#### 步骤 2: 在组件中使用

```svelte
<!-- src/lib/Button.svelte -->
<script lang="ts">
	import { useI18n } from './i18n/index.js';

	const i18n = useI18n();

	let { variant = 'primary' } = $props<{ variant?: string }>();
</script>

<button class={variant}>
	{i18n.t('button.label')}
</button>
```

#### 翻译文件格式

```json
// src/lib/i18n/locales/en.json
{
	"_meta": {
		"code": "en",
		"name": "English",
		"englishName": "English",
		"direction": "ltr",
		"flag": "🇬🇧"
	},
	"button": {
		"label": "Click me",
		"loading": "Loading..."
	},
	"modal": {
		"close": "Close",
		"confirm": "Confirm"
	}
}
```

```json
// src/lib/i18n/locales/zh.json
{
	"_meta": {
		"code": "zh",
		"name": "中文",
		"englishName": "Chinese",
		"direction": "ltr",
		"flag": "🇨🇳"
	},
	"button": {
		"label": "点击我",
		"loading": "加载中..."
	},
	"modal": {
		"close": "关闭",
		"confirm": "确认"
	}
}
```

#### 步骤 3: 在应用中使用你的包

```svelte
<!-- 用户的应用 -->
<script lang="ts">
	import { createI18nStore, setI18nContext } from '@shelchin/i18n/svelte';
	import { Button } from 'my-component-lib';

	// 应用初始化 i18n
	const i18n = createI18nStore({ initialLocale: 'en' });

	// 注册应用自己的翻译
	i18n.register('__default__', {
		en: {
			/* ... */
		},
		zh: {
			/* ... */
		}
	});

	setI18nContext(i18n);
</script>

<!-- Button 组件会自动使用正确的语言 -->
<Button />

<!-- 应用和组件库的翻译互不干扰 -->
<h1>{i18n.t('app.title')}</h1>
```

---

### 3️⃣ SvelteKit 增强用法（带路由本地化）

适用于：需要 URL 路径包含语言代码的 SSR 应用（如 `/en/about`, `/zh/about`）

#### 功能特性

- ✅ URL 路径本地化：`/en/about`, `/zh/about`
- ✅ 服务端语言检测（Cookie、Accept-Language）
- ✅ 自动路由重写（`/zh/about` → 内部路由 `/about`）
- ✅ 客户端与服务端语言同步

#### 步骤 1: 创建工具函数

```typescript
// src/lib/utils/locale.ts

const LOCALE_REGEX = /^\/([a-z]{2})(\/|$)/;

/**
 * 从 URL 路径提取语言代码
 * /en/about → 'en'
 * /zh/users/123 → 'zh'
 * /about → null
 */
export function extractLocaleFromPath(pathname: string): string | null {
	const match = pathname.match(LOCALE_REGEX);
	return match ? match[1] : null;
}

/**
 * 移除 URL 中的语言前缀
 * /en/about → /about
 * /zh/users/123 → /users/123
 */
export function deLocalizeUrl(url: URL): URL {
	const locale = extractLocaleFromPath(url.pathname);
	if (!locale) return url;

	const newUrl = new URL(url);
	newUrl.pathname = url.pathname.replace(LOCALE_REGEX, '/');
	return newUrl;
}

/**
 * 为 URL 添加语言前缀
 * (/about, 'zh') → /zh/about
 */
export function localizeUrl(pathname: string, locale: string): string {
	// 移除可能存在的语言前缀
	const cleaned = pathname.replace(LOCALE_REGEX, '/');
	return `/${locale}${cleaned === '/' ? '' : cleaned}`;
}

/**
 * 从 Cookie 中提取语言
 */
export function extractLocaleFromCookie(
	cookies: { get: (name: string) => string | undefined },
	cookieName = 'i18n-locale'
): string | null {
	return cookies.get(cookieName) || null;
}

/**
 * 从 Accept-Language header 提取语言
 */
export function extractLocaleFromHeader(acceptLanguage: string | null): string | null {
	if (!acceptLanguage) return null;

	// Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
	const languages = acceptLanguage
		.split(',')
		.map((lang) => lang.split(';')[0].trim().split('-')[0]);

	return languages[0] || null;
}
```

#### 步骤 2: 配置路由重写

```typescript
// src/hooks.server.ts
import { deLocalizeUrl } from '$lib/utils/locale';

/**
 * 路由重写：将 /zh/about 内部映射到 /about
 * 这样你只需要写 src/routes/about/+page.svelte
 * 而不需要 src/routes/[locale]/about/+page.svelte
 */
export const reroute = ({ url }: { url: URL }) => {
	return deLocalizeUrl(url).pathname;
};
```

#### 步骤 3: 服务端语言检测

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import {
	extractLocaleFromPath,
	extractLocaleFromCookie,
	extractLocaleFromHeader
} from '$lib/utils/locale';

const SUPPORTED_LOCALES = ['en', 'zh', 'ja'];
const DEFAULT_LOCALE = 'en';

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
	// 语言检测优先级：URL > Cookie > Accept-Language > Default
	const locale =
		extractLocaleFromPath(url.pathname) ||
		extractLocaleFromCookie(cookies) ||
		extractLocaleFromHeader(request.headers.get('accept-language')) ||
		DEFAULT_LOCALE;

	// 验证语言是否支持
	const validLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

	return {
		locale: validLocale
	};
};
```

#### 步骤 4: 客户端集成

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import type { LayoutData } from './$types';
	import { createI18nStore, setI18nContext } from '@shelchin/i18n/svelte';
	import { page } from '$app/stores';

	let { data, children } = $props<{
		data: LayoutData;
		children: import('svelte').Snippet;
	}>();

	// 使用服务端检测的语言初始化
	const i18n = createI18nStore({
		initialLocale: data.locale,
		enablePersist: true,
		enableCookie: true // 同步到 Cookie，供服务端读取
	});

	// 注册翻译
	i18n.register('__default__', {
		en: {
			_meta: { code: 'en', name: 'English', englishName: 'English', direction: 'ltr', flag: '🇬🇧' },
			home: 'Home',
			about: 'About'
		},
		zh: {
			_meta: { code: 'zh', name: '中文', englishName: 'Chinese', direction: 'ltr', flag: '🇨🇳' },
			home: '首页',
			about: '关于'
		}
	});

	setI18nContext(i18n);

	// 可选：监听路由变化，同步语言
	$effect(() => {
		if ($page.data.locale && $page.data.locale !== i18n.locale) {
			i18n.setLocale($page.data.locale);
		}
	});
</script>

{@render children()}
```

#### 步骤 5: 创建语言切换组件

```svelte
<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
	import { useI18n } from '@shelchin/i18n/svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { localizeUrl } from '$lib/utils/locale';

	const i18n = useI18n();

	function switchLocale(newLocale: string) {
		// 1. 更新客户端状态和 Cookie
		i18n.setLocale(newLocale);

		// 2. 导航到新的 URL
		const newPath = localizeUrl($page.url.pathname, newLocale);
		goto(newPath);
	}
</script>

<select value={i18n.locale} onchange={(e) => switchLocale(e.target.value)}>
	{#each i18n.supportedLocales as locale}
		<option value={locale.code}>
			{locale.flag}
			{locale.name}
		</option>
	{/each}
</select>
```

#### 完整示例

访问流程：

1. 用户访问 `/zh/about`
2. `reroute` 将其重写为 `/about`（内部）
3. `+layout.server.ts` 检测语言为 `zh`
4. 渲染 `src/routes/about/+page.svelte`
5. 客户端 i18n store 使用 `zh` 语言
6. URL 显示为 `/zh/about`，内容为中文

---

## 📚 API 参考

### `createI18nStore(options)`

| 选项             | 类型      | 默认值          | 说明                       |
| ---------------- | --------- | --------------- | -------------------------- |
| `initialLocale`  | `string`  | `'en'`          | 初始语言（无持久化时使用） |
| `defaultPackage` | `string`  | `'__default__'` | 默认翻译包名               |
| `enablePersist`  | `boolean` | `true`          | 启用 localStorage 持久化   |
| `persistKey`     | `string`  | `'i18n-locale'` | localStorage 键名          |
| `enableCookie`   | `boolean` | `false`         | 启用 Cookie 持久化         |
| `cookieName`     | `string`  | `'i18n-locale'` | Cookie 名称                |
| `cookieOptions`  | `object`  | `{}`            | Cookie 配置                |

### `I18nStore` 方法

- `locale: string` - 当前语言（响应式）
- `supportedLocales: LocaleMeta[]` - 支持的语言列表（响应式）
- `currentMeta: LocaleMeta` - 当前语言元数据（响应式）
- `setLocale(locale: string)` - 切换语言
- `register(packageName, locales)` - 注册翻译包
- `t(key: string, options?)` - 翻译文本
- `getMeta(packageName?)` - 获取语言元数据
- `getSupportedLocales(packageName?)` - 获取支持的语言列表

---

## ⚠️ 注意事项

### 1. 不要解构响应式属性

```svelte
<script>
	import { useI18n } from '@shelchin/i18n/svelte';

	// ❌ 错误：解构会丢失响应式
	const { locale, t } = useI18n();

	// ✅ 正确：保持对象引用
	const i18n = useI18n();

	// ✅ 方法可以解构
	const { setLocale } = i18n;
</script>

<!-- ✅ 正确使用 --><p>{i18n.locale}</p><p>{i18n.t('greeting')}</p>
```

### 2. 语言加载优先级

```
localStorage > Cookie > initialLocale
```

刷新页面时，会优先使用持久化的语言设置。

### 3. 包名隔离

不同包的翻译互不影响：

```typescript
// 应用的翻译
i18n.register('__default__', { en: { greeting: 'Hello' } });
i18n.t('greeting'); // "Hello"

// 组件库的翻译
i18n.register('my-lib', { en: { greeting: 'Hi' } });
i18n.t('greeting', { package: 'my-lib' }); // "Hi"
```

---

## 🎨 最佳实践

### 1. 按需加载大型翻译文件

```typescript
const i18n = useI18n();

// 仅在需要时加载
const loadJapanese = async () => {
	const ja = await import('./locales/ja.json');
	i18n.register('__default__', { ja: ja.default });
};
```

### 2. 类型安全的翻译键

```typescript
// types/i18n.ts
export type TranslationKey = 'greeting' | 'user.profile' | 'user.settings';

// 使用
i18n.t('greeting' as TranslationKey);
```

### 3. SSR 友好的语言检测

在 SvelteKit 中，优先使用服务端检测的语言：

```typescript
// +layout.svelte
const i18n = createI18nStore({
	initialLocale: data.locale, // 来自服务端
	enableCookie: true // 同步到 Cookie
});
```

---

## 📖 示例项目

查看完整示例：

- [应用示例](./src/routes/+page.svelte)
- [包示例](./src/examples/i18n.svelte.ts)
- [工具函数](./src/lib/svelte/README.md)

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

## 📄 许可证

MIT
