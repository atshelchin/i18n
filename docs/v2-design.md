# @shelchin/i18n v2.0 设计文档

## 设计理念

```
┌─────────────────────────────────────────────────────────────┐
│                     v2.0 核心理念                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 零配置：约定目录结构，自动发现翻译文件                    │
│  2. 极简 API：5 个 API 搞定所有场景                          │
│  3. 类型安全：翻译 key 自动补全，编译时检查                   │
│  4. 自动懒加载：无需手动 ensureNamespace                     │
│  5. SSR 透明：开发者无需关心 SSR 细节                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 快速开始

### 1.1 安装

```bash
pnpm add @shelchin/i18n
```

### 1.2 创建翻译文件

```
src/locales/
├── en/
│   ├── common.json      # 通用翻译
│   ├── home.json        # 首页
│   └── dashboard.json   # 仪表盘
└── zh/
    ├── common.json
    ├── home.json
    └── dashboard.json
```

```json
// src/locales/en/common.json
{
  "_meta": {
    "code": "en",
    "name": "English",
    "flag": "🇬🇧"
  },
  "ok": "OK",
  "cancel": "Cancel",
  "loading": "Loading..."
}

// src/locales/en/home.json
{
  "title": "Welcome",
  "description": "This is the home page"
}
```

### 1.3 初始化（一次）

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { initI18n, setI18nContext } from '@shelchin/i18n';

  let { data, children } = $props();

  // 一行初始化，自动扫描 src/locales/**
  const i18n = initI18n({ locale: data.locale });
  setI18nContext(i18n);
</script>

{@render children()}
```

### 1.4 使用翻译

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { t, locale, setLocale, locales } from '@shelchin/i18n';
</script>

<h1>{t('home.title')}</h1>
<p>{t('home.description')}</p>
<button>{t('common.ok')}</button>

<!-- 语言切换 -->
<select value={locale} onchange={(e) => setLocale(e.target.value)}>
  {#each locales as loc}
    <option value={loc.code}>{loc.flag} {loc.name}</option>
  {/each}
</select>
```

**完成！** 无需 `register`、`registerLoader`、`ensureNamespace`。

---

## 2. API 参考

### 2.1 完整 API 列表（共 5 个）

| API | 类型 | 说明 |
|-----|------|------|
| `initI18n(options)` | 函数 | 初始化 i18n，返回 store |
| `t(key, params?)` | 函数 | 翻译，支持插值和复数 |
| `setLocale(locale)` | 函数 | 切换语言（自动加载翻译） |
| `locale` | 响应式 | 当前语言代码 |
| `locales` | 响应式 | 支持的语言列表 |

### 2.2 initI18n(options)

```typescript
interface InitOptions {
  /** 初始语言 */
  locale: string;

  /** 默认语言（fallback 用） */
  defaultLocale?: string;  // 默认 'en'

  /** 预加载的 namespace（SSR 用） */
  preload?: string[];

  /** 翻译文件目录（相对于 src/） */
  localesDir?: string;  // 默认 'locales'
}

const i18n = initI18n({
  locale: 'zh',
  defaultLocale: 'en',
  preload: ['common', 'home'],
});
```

### 2.3 t(key, params?)

```typescript
// 简单翻译
t('common.ok')  // "OK"

// 带参数插值
t('greeting', { name: 'World' })  // "Hello, World!"

// 复数形式
t('items', { count: 0 })   // "No items"     (items_zero)
t('items', { count: 1 })   // "1 item"       (items_one)
t('items', { count: 5 })   // "5 items"      (items_other)

// 格式化
t('price', { amount: 1234.5 })  // "Price: $1,234.50" (使用 {amount:currency})
```

### 2.4 setLocale(locale)

```typescript
// 切换语言（自动加载需要的翻译）
await setLocale('zh');

// 内部自动：
// 1. 检测已加载的 namespace
// 2. 并行加载目标语言的对应翻译
// 3. 更新 locale
// 4. 触发 UI 响应式更新
```

### 2.5 locale & locales

```svelte
<script>
  import { locale, locales } from '@shelchin/i18n';
</script>

<!-- locale: 当前语言代码 -->
<p>当前语言: {locale}</p>

<!-- locales: 支持的语言列表 -->
{#each locales as loc}
  <span>{loc.flag} {loc.name} ({loc.code})</span>
{/each}
```

---

## 3. 文件结构约定

### 3.1 推荐结构（按语言分目录）

```
src/locales/
├── en/
│   ├── common.json      # namespace = 'common'
│   ├── home.json        # namespace = 'home'
│   ├── dashboard.json   # namespace = 'dashboard'
│   └── auth.json        # namespace = 'auth'
└── zh/
    ├── common.json
    ├── home.json
    ├── dashboard.json
    └── auth.json
```

**规则**：
- 目录名 = 语言代码（en, zh, ja...）
- 文件名 = namespace（去掉 .json）
- key 格式：`{namespace}.{key}` → `t('home.title')`

### 3.2 翻译文件格式

```json
// src/locales/en/home.json
{
  "_meta": {
    "code": "en",
    "name": "English",
    "englishName": "English",
    "flag": "🇬🇧",
    "direction": "ltr"
  },
  "title": "Welcome",
  "description": "This is {name}'s home page",
  "items_zero": "No items",
  "items_one": "{count} item",
  "items_other": "{count} items"
}
```

**说明**：
- `_meta`：语言元信息（只需在 common.json 中定义一次）
- `{name}`：插值占位符
- `key_zero/one/other`：复数形式

### 3.3 Namespace 与 Key 的关系

```
文件: src/locales/en/dashboard.json
内容: { "title": "Dashboard", "stats": { "users": "Total Users" } }

调用:
t('dashboard.title')        → "Dashboard"
t('dashboard.stats.users')  → "Total Users"
```

---

## 4. 自动懒加载

### 4.1 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                    自动懒加载流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  t('dashboard.title') 被调用                                │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐                                        │
│  │ 解析 namespace   │  'dashboard.title' → namespace='dashboard'
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 检查是否已加载   │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│       已加载？                                               │
│       ├── Yes → 返回翻译值                                  │
│       │                                                     │
│       └── No                                                │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 触发异步加载     │  import(`/locales/${locale}/dashboard.json`)
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 返回 fallback   │  返回 key 或默认语言翻译               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 加载完成后      │  Svelte 响应式自动更新 UI              │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 无需手动管理

```svelte
<!-- 旧方式（v1）：需要手动 ensureNamespace -->
<script>
  import { useI18n } from '@shelchin/i18n';
  import { onMount } from 'svelte';

  const i18n = useI18n();

  onMount(() => {
    i18n.ensureNamespaces(['dashboard', 'auth']);  // 手动加载
  });
</script>

<!-- 新方式（v2）：自动加载 -->
<script>
  import { t } from '@shelchin/i18n';
</script>

{t('dashboard.title')}  <!-- 自动触发加载 dashboard -->
{t('auth.login')}       <!-- 自动触发加载 auth -->
```

### 4.3 预加载（可选优化）

```typescript
// 如果想避免首屏 fallback 闪烁，可以预加载
const i18n = initI18n({
  locale: 'en',
  preload: ['common', 'home'],  // 这些会同步加载
});
```

---

## 5. 语言切换

### 5.1 基础用法

```svelte
<script>
  import { locale, locales, setLocale } from '@shelchin/i18n';
</script>

<select value={locale} onchange={(e) => setLocale(e.target.value)}>
  {#each locales as loc}
    <option value={loc.code}>{loc.flag} {loc.name}</option>
  {/each}
</select>
```

### 5.2 切换流程

```
setLocale('zh') 调用
     │
     ├── 1. 获取已加载的 namespace 列表
     │      ['common', 'home', 'dashboard']
     │
     ├── 2. 并行加载目标语言翻译
     │      Promise.all([
     │        import('locales/zh/common.json'),
     │        import('locales/zh/home.json'),
     │        import('locales/zh/dashboard.json'),
     │      ])
     │
     ├── 3. 更新 locale = 'zh'
     │
     └── 4. UI 自动响应式更新
```

### 5.3 带 Loading 状态

```svelte
<script>
  import { setLocale } from '@shelchin/i18n';

  let switching = $state(false);

  async function handleSwitch(newLocale: string) {
    switching = true;
    await setLocale(newLocale);
    switching = false;
  }
</script>

{#if switching}
  <span>切换中...</span>
{/if}
```

---

## 6. SSR 支持

### 6.1 服务端语言检测

```typescript
// src/routes/+layout.server.ts
import { detectLocale } from '@shelchin/i18n/server';

export async function load({ cookies, request }) {
  const locale = detectLocale({
    cookies,
    request,
    defaultLocale: 'en',
    supportedLocales: ['en', 'zh', 'ja'],
  });

  return { locale };
}
```

**检测优先级**：
1. Cookie（用户之前的选择）
2. Accept-Language header
3. 默认语言

### 6.2 预加载（避免闪烁）

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { initI18n, setI18nContext } from '@shelchin/i18n';

  let { data, children } = $props();

  const i18n = initI18n({
    locale: data.locale,
    preload: ['common'],  // 首屏必需的 namespace
  });

  setI18nContext(i18n);
</script>
```

### 6.3 页面级预加载（可选）

```typescript
// src/routes/dashboard/+page.ts
export async function load({ parent }) {
  const { i18n } = await parent();

  // 预加载 dashboard 翻译
  await i18n.preload(['dashboard']);

  return {};
}
```

---

## 7. 类型安全

### 7.1 生成类型定义

```bash
# CLI 工具自动生成类型
npx i18n generate-types
```

生成文件：

```typescript
// src/locales/i18n.d.ts (自动生成，不要手动修改)
import '@shelchin/i18n';

declare module '@shelchin/i18n' {
  interface TranslationKeys {
    'common.ok': string;
    'common.cancel': string;
    'common.loading': string;
    'home.title': string;
    'home.description': string;
    'dashboard.title': string;
    'dashboard.stats.users': string;
    // ... 所有 key 自动列出
  }

  export function t<K extends keyof TranslationKeys>(
    key: K,
    params?: Record<string, string | number>
  ): string;
}
```

### 7.2 开发体验

```typescript
import { t } from '@shelchin/i18n';

t('common.ok');       // ✅ 类型正确
t('common.okkk');     // ❌ 类型错误，IDE 报红
t('home.ti');         // IDE 自动补全 → 'home.title'
```

### 7.3 自动更新类型

```json
// package.json
{
  "scripts": {
    "dev": "i18n generate-types --watch & vite dev",
    "build": "i18n generate-types && vite build"
  }
}
```

---

## 8. 库开发者

### 8.1 创建库专属 i18n

```typescript
// my-lib/src/i18n.ts
import { createLibI18n } from '@shelchin/i18n';

export const { t, locale } = createLibI18n({
  name: 'my-lib',
  locales: import.meta.glob('./locales/*/*.json'),
});
```

### 8.2 在组件中使用

```svelte
<!-- my-lib/src/Button.svelte -->
<script>
  import { t } from './i18n';
</script>

<button>{t('button.submit')}</button>
```

### 8.3 应用集成

```svelte
<!-- 应用中使用库组件 -->
<script>
  import { Button } from 'my-lib';
  import { t } from '@shelchin/i18n';
</script>

<!-- 库组件使用自己的翻译 -->
<Button />

<!-- 应用使用自己的翻译 -->
<h1>{t('app.title')}</h1>
```

**隔离性**：库的翻译和应用的翻译完全隔离，互不影响。

---

## 9. Fallback 策略

### 9.1 翻译缺失时的行为

```
┌─────────────────────────────────────────────────────────────┐
│                    Fallback 决策流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  t('home.title') 调用，当前语言 zh                          │
│        │                                                    │
│        ▼                                                    │
│  1. 查找 zh 翻译                                            │
│     └── 找到 → 返回                                         │
│                                                             │
│  2. 查找 defaultLocale (en) 翻译                            │
│     └── 找到 → 返回（生产环境）                              │
│                                                             │
│  3. 返回 key                                                │
│     └── 'home.title'                                        │
│                                                             │
│  开发环境额外行为：                                          │
│  - console.warn 警告缺失翻译                                │
│  - 直接返回 key（便于发现问题）                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 配置

```typescript
const i18n = initI18n({
  locale: 'zh',
  defaultLocale: 'en',  // fallback 语言
});
```

---

## 10. 从 v1 迁移

### 10.1 API 对照表

| v1 API | v2 API | 说明 |
|--------|--------|------|
| `createI18nStore()` | `initI18n()` | 简化命名 |
| `useI18n()` | 直接导入 `t` | 无需 hook |
| `i18n.t()` | `t()` | 模块级函数 |
| `i18n.locale` | `locale` | 响应式变量 |
| `i18n.setLocale()` | `setLocale()` | 自动异步 |
| `i18n.supportedLocales` | `locales` | 简化命名 |
| `register()` | 删除 | 自动扫描 |
| `registerLoader()` | 删除 | 自动懒加载 |
| `ensureNamespace()` | 删除 | 自动触发 |
| `setLocaleAsync()` | `setLocale()` | 统一为异步 |
| `getMeta()` | `locales[n]` | 从列表获取 |

### 10.2 迁移步骤

**Step 1：重组文件结构**

```bash
# 旧结构
src/locales/en.json
src/locales/zh.json

# 新结构
src/locales/en/common.json
src/locales/zh/common.json
```

**Step 2：更新 Layout**

```svelte
<!-- 旧代码 -->
<script>
  import { createI18nStore, setI18nContext } from '@shelchin/i18n';
  import en from './locales/en.json';
  import zh from './locales/zh.json';

  const i18n = createI18nStore({ initialLocale: data.locale });
  i18n.register('__default__', { en, zh });
  setI18nContext(i18n);
</script>

<!-- 新代码 -->
<script>
  import { initI18n, setI18nContext } from '@shelchin/i18n';

  const i18n = initI18n({ locale: data.locale });
  setI18nContext(i18n);
</script>
```

**Step 3：更新页面组件**

```svelte
<!-- 旧代码 -->
<script>
  import { useI18n } from '@shelchin/i18n';
  const i18n = useI18n();
</script>

{i18n.t('title')}

<!-- 新代码 -->
<script>
  import { t } from '@shelchin/i18n';
</script>

{t('common.title')}
```

**Step 4：更新语言切换**

```svelte
<!-- 旧代码 -->
<button onclick={() => i18n.setLocale('zh')}>中文</button>

<!-- 新代码 -->
<button onclick={() => setLocale('zh')}>中文</button>
```

### 10.3 自动迁移工具

```bash
# 运行迁移脚本
npx @shelchin/i18n migrate

# 检查迁移结果
npx @shelchin/i18n check
```

---

## 11. 内部实现

### 11.1 核心架构

```
src/lib/
├── core/
│   ├── store.svelte.ts      # Svelte 5 响应式状态
│   ├── loader.ts            # 懒加载管理器
│   ├── lookup.ts            # 翻译查找
│   ├── interpolate.ts       # 插值处理
│   └── plurals.ts           # 复数规则
├── auto-scan.ts             # Vite Glob Import
├── server/
│   ├── detect.ts            # 语言检测
│   └── preload.ts           # SSR 预加载
├── cli/
│   ├── generate-types.ts    # 类型生成
│   └── migrate.ts           # 迁移工具
└── index.ts                 # 公开 API
```

### 11.2 响应式实现

```typescript
// 使用 Svelte 5 runes
let _locale = $state('en');
let _registry = $state<Record<string, Record<string, unknown>>>({});
let _loadedNamespaces = $state<Set<string>>(new Set());

export const locale = {
  get current() { return _locale; },
};

export function t(key: string, params?: Record<string, unknown>): string {
  // 访问 _locale 和 _registry 创建响应式依赖
  const ns = key.split('.')[0];

  if (!_loadedNamespaces.has(ns)) {
    loadNamespace(ns);  // 异步加载
    return fallback(key);
  }

  return lookup(_registry, _locale, key, params);
}
```

### 11.3 自动扫描实现

```typescript
// 利用 Vite Glob Import
const modules = import.meta.glob('/src/locales/**/*.json');

// 解析为结构化 loaders
// '/src/locales/en/home.json' → { locale: 'en', namespace: 'home', loader }
const loaders = parseModules(modules);
```

---

## 12. 性能

### 12.1 加载策略

| 场景 | 加载方式 | 说明 |
|------|----------|------|
| 首屏 | 预加载 | `preload: ['common']` |
| 页面切换 | 自动懒加载 | `t('dashboard.x')` 触发 |
| 语言切换 | 并行加载 | 只加载已使用的 namespace |

### 12.2 Bundle 影响

```
Before (v1):
└── 所有翻译打包在一起: 3MB

After (v2):
├── common.json: 50KB (首屏)
├── home.json: 30KB (首屏)
├── dashboard.json: 100KB (访问时加载)
└── settings.json: 80KB (访问时加载)

首屏: 80KB (↓ 97%)
```

### 12.3 缓存

- 已加载的 namespace 缓存在内存
- 切换语言时，已加载的 namespace 自动加载目标语言
- 刷新页面后，利用浏览器 HTTP 缓存

---

## 附录 A：完整示例项目

```
my-app/
├── src/
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── home.json
│   │   │   └── dashboard.json
│   │   └── zh/
│   │       ├── common.json
│   │       ├── home.json
│   │       └── dashboard.json
│   ├── routes/
│   │   ├── +layout.server.ts
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── dashboard/
│   │       └── +page.svelte
│   └── lib/
├── package.json
└── vite.config.ts
```

```typescript
// src/routes/+layout.server.ts
import { detectLocale } from '@shelchin/i18n/server';

export async function load({ cookies, request }) {
  return {
    locale: detectLocale({ cookies, request, defaultLocale: 'en' }),
  };
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { initI18n, setI18nContext } from '@shelchin/i18n';

  let { data, children } = $props();

  const i18n = initI18n({
    locale: data.locale,
    preload: ['common'],
  });

  setI18nContext(i18n);
</script>

{@render children()}
```

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { t, locale, locales, setLocale } from '@shelchin/i18n';
</script>

<header>
  <h1>{t('home.title')}</h1>

  <select value={locale} onchange={(e) => setLocale(e.target.value)}>
    {#each locales as loc}
      <option value={loc.code}>{loc.flag} {loc.name}</option>
    {/each}
  </select>
</header>

<main>
  <p>{t('home.description')}</p>
  <button>{t('common.ok')}</button>
</main>
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script>
  import { t } from '@shelchin/i18n';
</script>

<!-- dashboard namespace 自动懒加载 -->
<h1>{t('dashboard.title')}</h1>
<p>{t('dashboard.stats.users')}</p>
```

---

## 附录 B：API 速查

```typescript
// ============================================
// 初始化（Layout 中一次）
// ============================================
import { initI18n, setI18nContext } from '@shelchin/i18n';

const i18n = initI18n({
  locale: 'en',
  defaultLocale: 'en',
  preload: ['common'],
});
setI18nContext(i18n);

// ============================================
// 翻译（任何组件）
// ============================================
import { t } from '@shelchin/i18n';

t('common.ok')                     // 简单翻译
t('greeting', { name: 'World' })   // 插值
t('items', { count: 5 })           // 复数

// ============================================
// 语言切换
// ============================================
import { locale, locales, setLocale } from '@shelchin/i18n';

await setLocale('zh');  // 切换语言

// ============================================
// 服务端
// ============================================
import { detectLocale } from '@shelchin/i18n/server';

const locale = detectLocale({ cookies, request });
```

---

## 附录 C：与 v1 对比

| 方面 | v1 | v2 |
|------|----|----|
| API 数量 | 15+ | 5 |
| 初始化代码 | 5+ 行 | 2 行 |
| 手动注册 | 必须 | 自动 |
| 手动加载 | 必须 | 自动 |
| 类型安全 | 无 | 自动生成 |
| 迁移工具 | 无 | CLI 提供 |
