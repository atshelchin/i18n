# i18n 懒加载设计文档

## 0. 设计原则与改动总结（最终版）

### 0.1 核心设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                    开发者体验优先                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 零破坏性：现有代码完全不改也能工作                        │
│  2. 渐进增强：新功能是可选的增量，不是强制迁移                │
│  3. 最小改动：只改"加载导入处"，使用处不变                    │
│  4. 文件兼容：en.json/zh.json 格式和内容不变                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 0.2 改动总结表

| 你想做什么      | 需要改动什么                | 改动量        |
| --------------- | --------------------------- | ------------- |
| 什么都不改      | 无                          | **0 行**      |
| 只要单语言加载  | `+layout.svelte` 的注册方式 | **~3 行**     |
| 拆分部分翻译    | 新增文件 + 页面加载代码     | **~5 行/页**  |
| 所有 `t()` 调用 | 无                          | **永远 0 行** |
| JSON 文件内容   | 无                          | **永远 0 行** |

### 0.3 改动示例对比

**场景 A：完全不改（继续工作）**

```typescript
// +layout.svelte - 现有代码，无需任何修改
import en from './locales/en.json';
import zh from './locales/zh.json';
i18n.register('__default__', { en, zh }); // ✅ 继续工作
```

**场景 B：启用单语言加载（最小改动）**

```typescript
// +layout.svelte - 只改这 3 行
// ❌ 删除: import en from './locales/en.json';
// ❌ 删除: import zh from './locales/zh.json';
// ❌ 删除: i18n.register('__default__', { en, zh });

// ✅ 新增:
i18n.registerLoader('__default__', {
	en: () => import('./locales/en.json'),
	zh: () => import('./locales/zh.json')
});
```

**使用处 - 完全不变：**

```svelte
<!-- +page.svelte - 不改任何代码 -->
{i18n.t('title')} // ✅ 不变
{i18n.t('features.title')} // ✅ 不变
```

### 0.4 API 分类

| 分类             | API                   | 用途                  |
| ---------------- | --------------------- | --------------------- |
| **核心（必须）** | `registerLoader`      | 注册懒加载器          |
| **核心（必须）** | `registerLoaders`     | 批量注册（配合 Glob） |
| **核心（必须）** | `ensureNamespace`     | 确保 namespace 已加载 |
| **核心（必须）** | `setLocaleAsync`      | 异步切换语言          |
| 高级（可选）     | `loadNamespace`       | 强制重新加载          |
| 高级（可选）     | `isNamespaceLoaded`   | 检查加载状态          |
| 高级（可选）     | `preload` / `hydrate` | SSR 支持              |

### 0.5 兼容性保证

| 现有 API                | 状态    | 说明                         |
| ----------------------- | ------- | ---------------------------- |
| `register()`            | ✅ 保留 | 同步注册，兼容模式           |
| `t()`                   | ✅ 不变 | 翻译函数，语法完全不变       |
| `setLocale()`           | ✅ 保留 | 同步切换（不自动加载新语言） |
| `getMeta()`             | ✅ 不变 | 获取语言元信息               |
| `getSupportedLocales()` | ✅ 不变 | 获取支持的语言列表           |

---

## 1. 背景与问题

### 1.1 当前问题

随着应用功能增长，翻译文件（如 `en.json`、`zh.json`）可能达到数万行、数兆字节。当前方案存在以下问题：

| 问题           | 影响                                           |
| -------------- | ---------------------------------------------- |
| 全量加载       | 首屏加载所有翻译，即使只需要当前页面的少量翻译 |
| 多语言同时加载 | 同时加载所有语言，即使用户只使用一种语言       |
| 文件过大       | 单个 JSON 文件数万行，难以维护                 |
| 浪费带宽       | 页面 JS 几十 KB，翻译文件却有几 MB             |

### 1.2 目标需求

| #   | 需求           | 说明                                         |
| --- | -------------- | -------------------------------------------- |
| 1   | **按需加载**   | 只加载当前页面/组件需要的翻译                |
| 2   | **文件拆分**   | 每个 JSON 文件行数小，分散到多个文件便于维护 |
| 3   | **单语言加载** | 只加载当前语言，切换时动态加载目标语言       |
| 4   | **低破坏性**   | 现有 `t()` 调用语法尽量不变                  |
| 5   | **SSR 友好**   | 支持服务端渲染，SEO 友好                     |
| 6   | **渐进式迁移** | 现有大文件可继续使用，逐步拆分               |

---

## 2. 设计概览

### 2.1 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                      Namespace（命名空间）                    │
├─────────────────────────────────────────────────────────────┤
│  将翻译按功能域拆分为多个 namespace：                          │
│  - common:     公共翻译（按钮、状态词）                        │
│  - pages/home: 首页专用翻译                                   │
│  - pages/dashboard: Dashboard 页面翻译                       │
│  - features/auth: 认证相关组件翻译                            │
│  - features/wallet: 钱包相关组件翻译                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Loader（加载器）                         │
├─────────────────────────────────────────────────────────────┤
│  每个 namespace 注册一个 loader，而非直接注册数据：             │
│                                                             │
│  i18n.registerLoader('common', {                            │
│    en: () => import('./locales/common/en.json'),            │
│    zh: () => import('./locales/common/zh.json'),            │
│  });                                                        │
│                                                             │
│  Loader 只在需要时才执行，实现真正的懒加载。                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    按需加载流程                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 用户访问首页                                             │
│     └── 加载: common/en.json + pages/home/en.json           │
│                                                             │
│  2. 用户点击进入 Dashboard                                   │
│     └── 加载: pages/dashboard/en.json（common 已缓存）       │
│                                                             │
│  3. 用户切换语言 en → zh                                     │
│     └── 加载: common/zh.json + home/zh.json + dashboard/zh  │
│         （只加载已使用过的 namespace）                        │
│                                                             │
│  4. 用户从未访问 Settings 页面                               │
│     └── pages/settings/*.json 永远不会被加载                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 文件结构（渐进式迁移）

**核心原则**：现有大文件继续工作，逐步拆分，新旧共存。

```
src/
├── locales/
│   │
│   │  ┌─────────────────────────────────────────────────────┐
│   │  │ 阶段 0：现有结构（继续工作，无需修改）                  │
│   │  └─────────────────────────────────────────────────────┘
│   ├── en.json                        # 现有大文件，保持不动
│   ├── zh.json                        # 现有大文件，保持不动
│   │
│   │  ┌─────────────────────────────────────────────────────┐
│   │  │ 阶段 1+：逐步拆分（按需添加，不影响现有）              │
│   │  └─────────────────────────────────────────────────────┘
│   ├── common/                        # 可选：拆出全局通用词汇
│   │   ├── en.json
│   │   └── zh.json
│   │
│   ├── pages/                         # 可选：拆出页面级翻译
│   │   ├── home/
│   │   │   ├── en.json
│   │   │   └── zh.json
│   │   └── dashboard/
│   │       ├── en.json
│   │       └── zh.json
│   │
│   └── features/                      # 可选：拆出功能模块翻译
│       ├── auth/
│       │   ├── en.json
│       │   └── zh.json
│       └── wallet/
│           ├── en.json
│           └── zh.json
```

**渐进式迁移路径**：

```
阶段 0（当前）          阶段 1              阶段 2              阶段 N
┌──────────┐         ┌──────────┐        ┌──────────┐        ┌──────────┐
│ en.json  │   →     │ en.json  │   →    │ en.json  │   →    │ (删除)   │
│ (3MB)    │         │ (2.8MB)  │        │ (1MB)    │        │          │
└──────────┘         └──────────┘        └──────────┘        └──────────┘
                      + common/           + common/           + common/
                        en.json             en.json             en.json
                        (200KB)           + pages/home/        + pages/*/
                                            en.json           + features/*/
                                            (100KB)
```

### 2.3 三层翻译架构

| 层级            | 目录                          | 说明       | 加载时机   | 典型内容                   |
| --------------- | ----------------------------- | ---------- | ---------- | -------------------------- |
| **L0: Legacy**  | `locales/en.json`             | 现有大文件 | 应用启动   | 所有翻译（兼容模式）       |
| **L1: Common**  | `locales/common/`             | 全局通用   | 应用启动   | OK、Cancel、Loading、Error |
| **L2: Page**    | `locales/pages/{page}/`       | 页面专属   | 进入页面   | 页面标题、说明文字         |
| **L3: Feature** | `locales/features/{feature}/` | 功能模块   | 使用功能时 | 跨页面复用的功能组件群     |

**选择原则**：

```
┌─────────────────────────────────────────────────────────────┐
│  翻译应该放在哪一层？                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Q0: 暂时不想拆分？                                          │
│      └── Yes → L0: 继续使用 en.json/zh.json                 │
│                                                             │
│  Q1: 是否全局复用？（如 OK、Cancel）                          │
│      └── Yes → L1: common/                                  │
│                                                             │
│  Q2: 是否仅在单个页面使用？                                   │
│      └── Yes → L2: pages/{page}/                            │
│                                                             │
│  Q3: 是否跨多个页面的功能模块？                               │
│      └── Yes → L3: features/{feature}/                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**注意**：组件级翻译（每个组件自带 i18n/）对现有代码侵入性太大，不推荐。所有组件翻译统一放在 `features/` 层集中管理

### 2.4 加载责任原则

**简化原则**：页面负责加载自己需要的所有翻译（包括页面内使用的 feature）。

```
┌─────────────────────────────────────────────────────────────┐
│                    加载责任分配                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  L0 Legacy     → 应用启动时同步加载（现有方式，兼容）          │
│  L1 Common     → Layout 负责加载（应用启动时）                │
│  L2 Page       → 各页面自己负责加载                           │
│  L3 Feature    → 页面负责加载自己用到的 feature              │
│                                                             │
│  ✅ 优点：                                                   │
│  - 现有代码零修改（L0 兼容模式）                              │
│  - 页面清楚知道自己需要哪些翻译                               │
│  - 无需改动组件代码                                          │
│  - 加载逻辑集中在页面级，便于管理                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**示例：Dashboard 页面**

```
Dashboard 页面
├── Layout 已加载: common ✅
├── 页面加载: pages/dashboard + features/chains + features/wallet ✅
│
├── <ChainSelector /> 组件（无需修改）
├── <WalletConnect /> 组件（无需修改）
│
└── 组件代码保持不变 ✅
```

**代码示例**：

```svelte
<!-- +layout.svelte：加载 common（或使用 L0 兼容模式） -->
<script>
  const i18n = useI18n();

  // 方式 1：L0 兼容模式（现有方式，同步加载全部）
  // i18n.register('__default__', { en, zh });

  // 方式 2：懒加载 common
  onMount(() => i18n.ensureNamespace('common'));
</script>

<!-- Dashboard.svelte：页面负责加载自己 + 用到的 feature -->
<script>
  const i18n = useI18n();

  onMount(() => {
    // 页面知道自己用了哪些 feature，一次性加载
    i18n.ensureNamespaces([
      'pages/dashboard',
      'features/chains',   // ChainSelector 用到
      'features/wallet',   // WalletConnect 用到
    ]);
  });
</script>

<!-- 组件代码完全不变 -->
<ChainSelector />
<WalletConnect />
```

### 2.5 翻译 key 结构保持不变

拆分前后，`t()` 调用语法**完全不变**：

```typescript
// 拆分前（单个大文件）
i18n.t('common.ok');
i18n.t('home.title');
i18n.t('chains.all_chains');

// 拆分后（多个小文件）
i18n.t('common.ok'); // ✅ 完全一样
i18n.t('home.title'); // ✅ 完全一样
i18n.t('chains.all_chains'); // ✅ 完全一样
```

**原理**：多个 namespace 的翻译通过 deep merge 合并到同一个注册表。

### 2.5 自动扫描注册（Glob Import）

利用 Vite 的 `import.meta.glob` 实现**零配置自动扫描**，无需手动编写每个 loader：

```typescript
// src/lib/i18n-setup.ts

/**
 * 自动扫描 locales 目录，生成 namespace loaders
 * Vite 会在构建时静态分析并生成代码
 */
const localeModules = import.meta.glob<{ default: LocaleData }>('../locales/**/*.json');

/**
 * 解析 glob 结果为 namespace -> locale -> loader 结构
 *
 * 输入: { '../locales/common/en.json': () => import(...) }
 * 输出: { 'common': { en: () => import(...) } }
 */
function parseLocaleLoaders(
	modules: Record<string, () => Promise<{ default: LocaleData }>>
): Record<string, NamespaceLoaders> {
	const loaders: Record<string, NamespaceLoaders> = {};

	for (const [path, loader] of Object.entries(modules)) {
		// 解析路径: ../locales/pages/home/en.json → namespace: 'pages/home', locale: 'en'
		const match = path.match(/\.\.\/locales\/(.+)\/(\w+)\.json$/);
		if (match) {
			const [, namespace, locale] = match;
			loaders[namespace] ??= {};
			loaders[namespace][locale] = loader;
		}
	}

	return loaders;
}

// 解析后的 loaders
const appLoaders = parseLocaleLoaders(localeModules);

// 使用示例
export function setupI18n(initialLocale: string) {
	const i18n = createI18nStore({ initialLocale });

	// 一行代码批量注册所有 namespace
	i18n.registerLoaders(appLoaders);

	return i18n;
}
```

**自动扫描结果示例**：

```typescript
// Vite 构建时自动生成的 localeModules:
{
  '../locales/common/en.json': () => import('../locales/common/en.json'),
  '../locales/common/zh.json': () => import('../locales/common/zh.json'),
  '../locales/pages/home/en.json': () => import('../locales/pages/home/en.json'),
  '../locales/pages/home/zh.json': () => import('../locales/pages/home/zh.json'),
  '../locales/features/auth/en.json': () => import('../locales/features/auth/en.json'),
  '../locales/features/auth/zh.json': () => import('../locales/features/auth/zh.json'),
  // ...
}

// 解析后的 appLoaders:
{
  'common': {
    en: () => import('../locales/common/en.json'),
    zh: () => import('../locales/common/zh.json'),
  },
  'pages/home': {
    en: () => import('../locales/pages/home/en.json'),
    zh: () => import('../locales/pages/home/zh.json'),
  },
  'features/auth': {
    en: () => import('../locales/features/auth/en.json'),
    zh: () => import('../locales/features/auth/zh.json'),
  },
}
```

**优势**：

- ✅ 零配置：新增翻译文件自动被识别
- ✅ 构建时分析：不影响运行时性能
- ✅ Tree-shaking：未使用的 namespace 不会被打包
- ✅ 类型安全：可配合 TypeScript 推导

---

## 3. API 设计

### 3.1 新增类型定义

```typescript
// src/lib/types.ts

/**
 * 翻译加载器函数
 */
export type LocaleLoader = () => Promise<{ default: LocaleData } | LocaleData>;

/**
 * Namespace 加载器配置
 */
export interface NamespaceLoaders {
	[locale: string]: LocaleLoader;
}

/**
 * Namespace 加载状态
 */
export interface NamespaceState {
	/** 已加载的语言 */
	loadedLocales: Set<string>;
	/** 是否正在加载 */
	loading: boolean;
	/** 加载器配置 */
	loaders: NamespaceLoaders;
}
```

### 3.2 核心 I18n 类扩展

```typescript
// src/lib/i18n.ts

export class I18n {
  // === 现有属性（保持不变）===
  private _locale: string;
  private registry: PackageRegistry = {};
  private registrations: Array<{...}> = [];
  private registered = new Set<string>();
  private compiled = false;

  // === 新增属性 ===
  /** Namespace 加载器注册表 */
  private namespaceLoaders: Map<string, NamespaceLoaders> = new Map();

  /** Namespace 加载状态 */
  private namespaceStates: Map<string, NamespaceState> = new Map();

  /** 已加载的 namespace 集合（用于语言切换时重新加载）*/
  private loadedNamespaces: Set<string> = new Set();

  // === 现有方法（保持不变）===
  get locale(): string;
  setLocale(locale: string): void;
  register(...): void;
  t(...): string;
  getMeta(...): LocaleMeta | undefined;
  getSupportedLocales(...): LocaleMeta[];

  // === 新增方法 ===

  /**
   * 注册单个 namespace 加载器（不立即加载数据）
   */
  registerLoader(namespace: string, loaders: NamespaceLoaders): void;

  /**
   * 批量注册 namespace 加载器（配合 Glob Import 使用）
   */
  registerLoaders(loaders: Record<string, NamespaceLoaders>): void;

  /**
   * 加载指定 namespace 的当前语言翻译（强制加载）
   */
  loadNamespace(namespace: string): Promise<void>;

  /**
   * 批量加载多个 namespace（强制加载）
   */
  loadNamespaces(namespaces: string[]): Promise<void>;

  /**
   * 确保 namespace 已加载（幂等，推荐使用）
   * - 已加载：立即返回（不重复加载）
   * - 未加载：触发加载
   * - 多处调用同一 namespace：只加载一次
   */
  ensureNamespace(namespace: string): Promise<void>;

  /**
   * 批量确保 namespace 已加载（幂等）
   */
  ensureNamespaces(namespaces: string[]): Promise<void>;

  /**
   * 检查 namespace 是否已加载当前语言
   */
  isNamespaceLoaded(namespace: string): boolean;

  /**
   * 异步切换语言（自动加载已使用 namespace 的目标语言）
   */
  setLocaleAsync(locale: string): Promise<void>;

  /**
   * SSR: 预加载指定 namespace 和语言
   */
  preload(namespaces: string[], locale: string): Promise<Record<string, LocaleData>>;

  /**
   * SSR: 水合服务端预加载的数据
   */
  hydrate(data: Record<string, LocaleData>): void;

  /**
   * 获取已加载的 namespace 列表
   */
  getLoadedNamespaces(): string[];
}
```

### 3.3 Svelte Store 扩展

```typescript
// src/lib/svelte/i18n.svelte.ts

export interface I18nStore {
  // === 现有 API（保持不变）===
  readonly locale: string;
  readonly supportedLocales: LocaleMeta[];
  readonly currentMeta: LocaleMeta | undefined;
  setLocale: (locale: string) => void;
  register: (...) => void;
  t: (...) => string;
  getMeta: (...) => LocaleMeta | undefined;
  getSupportedLocales: (...) => LocaleMeta[];

  // === 新增 API ===

  /** 注册单个 namespace 加载器 */
  registerLoader: (namespace: string, loaders: NamespaceLoaders) => void;

  /** 批量注册 namespace 加载器（配合 Glob Import） */
  registerLoaders: (loaders: Record<string, NamespaceLoaders>) => void;

  /** 加载 namespace（强制加载）*/
  loadNamespace: (namespace: string) => Promise<void>;

  /** 批量加载 namespace（强制加载）*/
  loadNamespaces: (namespaces: string[]) => Promise<void>;

  /** 确保 namespace 已加载（幂等，推荐）*/
  ensureNamespace: (namespace: string) => Promise<void>;

  /** 批量确保 namespace 已加载（幂等）*/
  ensureNamespaces: (namespaces: string[]) => Promise<void>;

  /** 检查 namespace 是否已加载 */
  isNamespaceLoaded: (namespace: string) => boolean;

  /** 异步切换语言（自动加载已使用的 namespace） */
  setLocaleAsync: (locale: string) => Promise<void>;

  /** 获取已加载的 namespace 列表 */
  getLoadedNamespaces: () => string[];

  // === SSR 支持 ===
  /** 水合服务端数据 */
  hydrate: (data: Record<string, LocaleData>) => void;
}

export interface CreateI18nStoreOptions {
  // === 现有选项（保持不变）===
  initialLocale?: string;
  defaultPackage?: string;
  persistKey?: string;
  enablePersist?: boolean;
  enableCookie?: boolean;
  cookieName?: string;
  cookieOptions?: {...};

  // === 新增选项 ===

  /** SSR: 服务端预加载的翻译数据 */
  initialData?: Record<string, LocaleData>;

  /** 翻译未加载时的 fallback 模式 */
  fallbackMode?: 'key' | 'loading' | 'empty';

  /** fallback 显示的加载文本 */
  loadingText?: string;
}
```

---

## 4. 使用示例

### 4.1 基础用法：自动扫描注册

```typescript
// src/lib/i18n-setup.ts
import { createI18nStore, type LocaleData, type NamespaceLoaders } from '@anthropic/i18n';

// ============================================
// 自动扫描 locales 目录（Vite Glob Import）
// ============================================
const localeModules = import.meta.glob<{ default: LocaleData }>('../locales/**/*.json');

function parseLocaleLoaders(
	modules: Record<string, () => Promise<{ default: LocaleData }>>
): Record<string, NamespaceLoaders> {
	const loaders: Record<string, NamespaceLoaders> = {};

	for (const [path, loader] of Object.entries(modules)) {
		const match = path.match(/\.\.\/locales\/(.+)\/(\w+)\.json$/);
		if (match) {
			const [, namespace, locale] = match;
			loaders[namespace] ??= {};
			loaders[namespace][locale] = loader;
		}
	}

	return loaders;
}

const appLoaders = parseLocaleLoaders(localeModules);

// ============================================
// 导出 i18n 初始化函数
// ============================================
export function setupI18n(initialLocale: string, initialData?: Record<string, LocaleData>) {
	const i18n = createI18nStore({
		initialLocale,
		initialData, // SSR 预加载数据
		fallbackMode: 'key'
	});

	// 一行代码批量注册所有 namespace（自动扫描）
	i18n.registerLoaders(appLoaders);

	return i18n;
}

// 导出 loaders 供 SSR 预加载使用
export { appLoaders };
```

**效果**：新增翻译文件后无需修改代码，自动被识别和注册。

### 4.2 页面级加载

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { useI18n } from '@anthropic/i18n';
	import { onMount } from 'svelte';

	const i18n = useI18n();
	let ready = $state(false);

	onMount(async () => {
		// 加载当前页面需要的 namespace
		await i18n.loadNamespaces(['common', 'dashboard']);
		ready = true;
	});
</script>

{#if ready}
	<h1>{i18n.t('dashboard.title')}</h1>
	<button>{i18n.t('common.save')}</button>
{:else}
	<p>Loading...</p>
{/if}
```

### 4.3 SSR 支持

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { preloadNamespaces } from '$lib/i18n-setup';

export const load: PageServerLoad = async ({ locals }) => {
	const locale = locals.locale;

	// 服务端预加载当前页面需要的翻译
	const translations = await preloadNamespaces(['common', 'dashboard'], locale);

	return {
		i18n: {
			locale,
			translations,
			namespaces: ['common', 'dashboard']
		}
	};
};
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { useI18n } from '@anthropic/i18n';

	let { data } = $props();
	const i18n = useI18n();

	// 水合服务端数据（同步，SSR 时已有数据）
	i18n.hydrate(data.i18n.translations);
</script>

<!-- 无需等待，SSR 时数据已存在 -->
<h1>{i18n.t('dashboard.title')}</h1>
<button>{i18n.t('common.save')}</button>
```

### 4.4 语言切换

```svelte
<script lang="ts">
	import { useI18n } from '@anthropic/i18n';

	const i18n = useI18n();

	async function switchLanguage(locale: string) {
		// 异步切换：自动加载已使用 namespace 的目标语言
		await i18n.setLocaleAsync(locale);
	}
</script>

<select value={i18n.locale} onchange={(e) => switchLanguage(e.currentTarget.value)}>
	{#each i18n.supportedLocales as locale}
		<option value={locale.code}>{locale.flag} {locale.name}</option>
	{/each}
</select>
```

---

## 5. 内部实现细节

### 5.1 状态管理

```typescript
class I18n {
	// Namespace 状态追踪
	private namespaceStates = new Map<
		string,
		{
			loadedLocales: Set<string>; // 已加载的语言
			loading: boolean; // 是否正在加载
			loaders: NamespaceLoaders; // 加载器配置
		}
	>();

	// 已使用的 namespace（用于语言切换）
	private loadedNamespaces = new Set<string>();
}
```

### 5.2 加载流程

```
loadNamespace('dashboard')
        │
        ▼
┌───────────────────────┐
│ 检查是否已加载当前语言  │
│ loadedLocales.has(en) │
└───────────────────────┘
        │
    已加载？
    ├── Yes → 直接返回
    │
    └── No
        │
        ▼
┌───────────────────────┐
│ 获取对应语言的 loader  │
│ loaders['en']         │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 执行 loader           │
│ await loader()        │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 注册翻译数据           │
│ this.register(...)    │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ 更新状态              │
│ loadedLocales.add(en) │
│ loadedNamespaces.add  │
└───────────────────────┘
```

### 5.3 语言切换流程

语言切换是懒加载方案的核心场景，需要**自动加载已使用 namespace 的目标语言**。

#### 5.3.1 完整流程图

```
用户点击切换语言 en → zh
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  setLocaleAsync('zh')                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: 获取已使用的 namespace 列表                          │
│          loadedNamespaces = ['common', 'pages/dashboard',   │
│                              'features/chains']             │
│                                                             │
│  Step 2: 筛选需要加载的 namespace                            │
│          对每个 namespace 检查: loadedLocales.has('zh')?    │
│          - common: 未加载 zh ✗ → 需要加载                    │
│          - pages/dashboard: 未加载 zh ✗ → 需要加载          │
│          - features/chains: 未加载 zh ✗ → 需要加载          │
│                                                             │
│  Step 3: 并行加载所有需要的翻译                              │
│          Promise.all([                                      │
│            loaders['common']['zh'](),                       │
│            loaders['pages/dashboard']['zh'](),              │
│            loaders['features/chains']['zh'](),              │
│          ])                                                 │
│                                                             │
│  Step 4: 注册翻译数据                                        │
│          将加载的数据 deep merge 到 registry                 │
│                                                             │
│  Step 5: 更新加载状态                                        │
│          为每个 namespace 标记 loadedLocales.add('zh')       │
│                                                             │
│  Step 6: 切换当前语言                                        │
│          this._locale = 'zh'                                │
│                                                             │
│  Step 7: 触发响应式更新                                      │
│          Svelte runes 自动更新 UI                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
      UI 显示中文
```

#### 5.3.2 时序图

```
┌──────┐     ┌──────┐     ┌────────┐     ┌────────┐     ┌────┐
│ User │     │ i18n │     │ Loader │     │Network │     │ UI │
└──┬───┘     └──┬───┘     └───┬────┘     └───┬────┘     └─┬──┘
   │            │             │              │            │
   │ setLocaleAsync('zh')     │              │            │
   │───────────>│             │              │            │
   │            │             │              │            │
   │            │ 检查已使用 namespace        │            │
   │            │─────┐       │              │            │
   │            │     │       │              │            │
   │            │<────┘       │              │            │
   │            │             │              │            │
   │            │ 并行调用 loaders            │            │
   │            │────────────>│              │            │
   │            │             │              │            │
   │            │             │ fetch zh.json (x3)        │
   │            │             │─────────────>│            │
   │            │             │              │            │
   │            │             │   JSON data  │            │
   │            │             │<─────────────│            │
   │            │             │              │            │
   │            │ 翻译数据    │              │            │
   │            │<────────────│              │            │
   │            │             │              │            │
   │            │ 更新 locale + registry     │            │
   │            │─────┐       │              │            │
   │            │     │       │              │            │
   │            │<────┘       │              │            │
   │            │             │              │            │
   │            │ 触发响应式更新              │   re-render
   │            │────────────────────────────────────────>│
   │            │             │              │            │
   │  Promise resolved        │              │            │
   │<───────────│             │              │            │
   │            │             │              │            │
```

#### 5.3.3 关键实现代码

```typescript
async setLocaleAsync(locale: string): Promise<void> {
  // 1. 获取所有已使用的 namespace
  const usedNamespaces = Array.from(this.loadedNamespaces);

  // 2. 筛选出需要加载的（目标语言尚未加载的）
  const namespacesToLoad = usedNamespaces.filter(ns => {
    const state = this.namespaceStates.get(ns);
    return state && !state.loadedLocales.has(locale);
  });

  // 3. 并行加载所有需要的翻译
  if (namespacesToLoad.length > 0) {
    await Promise.all(
      namespacesToLoad.map(ns => this.loadNamespaceForLocale(ns, locale))
    );
  }

  // 4. 切换语言（触发响应式更新）
  this._locale = locale;
}

private async loadNamespaceForLocale(namespace: string, locale: string): Promise<void> {
  const state = this.namespaceStates.get(namespace);
  if (!state) return;

  const loader = state.loaders[locale];
  if (!loader) {
    console.warn(`No loader for namespace "${namespace}" locale "${locale}"`);
    return;
  }

  const module = await loader();
  const data = 'default' in module ? module.default : module;

  // 注册到 registry
  this.register('__default__', { [locale]: data });

  // 标记为已加载
  state.loadedLocales.add(locale);
}
```

#### 5.3.4 边界情况处理

| 场景                               | 处理方式                 |
| ---------------------------------- | ------------------------ |
| 目标语言已全部加载                 | 跳过网络请求，直接切换   |
| 部分 namespace 缺少目标语言 loader | 警告 + 跳过该 namespace  |
| 网络请求失败                       | 抛出错误，语言不切换     |
| 切换过程中再次切换                 | 后一次切换覆盖前一次     |
| SSR 水合后切换                     | 正常流程，水合数据不影响 |

#### 5.3.5 性能优化

```typescript
// 并行加载，而非串行
await Promise.all(loaders); // ✅ 3 个请求并行，总时间 = 最慢的一个

// 而非
for (const ns of namespaces) {
	// ❌ 串行，总时间 = 3 个请求之和
	await loadNamespace(ns);
}
```

**网络请求示例**：

```
切换 en → zh，已使用 3 个 namespace

并行加载（推荐）：
├── common/zh.json ─────────────────────> 100ms
├── pages/dashboard/zh.json ────────────> 80ms
└── features/chains/zh.json ────────────> 120ms
                              总时间: 120ms ✅

串行加载（不推荐）：
├── common/zh.json ────> 100ms
│                   └── pages/dashboard/zh.json ────> 80ms
│                                                └── features/chains/zh.json ─> 120ms
                                                           总时间: 300ms ❌
```

### 5.4 SSR 预加载

```typescript
// 服务端执行
async preload(namespaces: string[], locale: string) {
  const results: Record<string, LocaleData> = {};

  await Promise.all(
    namespaces.map(async (ns) => {
      const loader = this.namespaceLoaders.get(ns)?.[locale];
      if (loader) {
        const module = await loader();
        const data = 'default' in module ? module.default : module;
        results[ns] = data;
      }
    })
  );

  return results;
}

// 客户端水合
hydrate(data: Record<string, LocaleData>) {
  for (const [namespace, localeData] of Object.entries(data)) {
    // 直接注册，跳过 loader
    this.register('__default__', { [this._locale]: localeData });

    // 标记为已加载
    const state = this.namespaceStates.get(namespace);
    if (state) {
      state.loadedLocales.add(this._locale);
    }
    this.loadedNamespaces.add(namespace);
  }
}
```

---

## 6. 迁移指南

### 6.1 从全量加载迁移

**Before（全量加载）：**

```typescript
import en from './locales/en.json';
import zh from './locales/zh.json';

const i18n = createI18nStore({ initialLocale: 'en' });
i18n.register('__default__', { en, zh });
```

**After（懒加载）：**

```typescript
const i18n = createI18nStore({ initialLocale: 'en' });

// 注册加载器
i18n.registerLoader('common', {
	en: () => import('./locales/common/en.json'),
	zh: () => import('./locales/common/zh.json')
});

i18n.registerLoader('home', {
	en: () => import('./locales/pages/home/en.json'),
	zh: () => import('./locales/pages/home/zh.json')
});

// 加载初始 namespace
await i18n.loadNamespaces(['common', 'home']);
```

### 6.2 拆分翻译文件

**拆分规则**：按顶层 key 拆分

```json
// Before: locales/en.json (一个大文件)
{
  "_meta": {...},
  "common": { "ok": "OK", "cancel": "Cancel" },
  "home": { "title": "Welcome" },
  "dashboard": { "title": "Dashboard" },
  "chains": { "all_chains": "All Chains" }
}
```

```json
// After: locales/common/en.json
{
  "_meta": {...},
  "common": { "ok": "OK", "cancel": "Cancel" }
}

// After: locales/pages/home/en.json
{
  "home": { "title": "Welcome" }
}

// After: locales/pages/dashboard/en.json
{
  "dashboard": { "title": "Dashboard" }
}

// After: locales/features/chains/en.json
{
  "chains": { "all_chains": "All Chains" }
}
```

### 6.3 兼容模式

支持渐进式迁移，新旧方式可共存：

```typescript
const i18n = createI18nStore({ initialLocale: 'en' });

// 旧方式：同步注册（仍然支持）
i18n.register('__default__', { en: legacyTranslations });

// 新方式：注册加载器
i18n.registerLoader('new-feature', {
	en: () => import('./locales/new-feature/en.json'),
	zh: () => import('./locales/new-feature/zh.json')
});
```

---

## 7. 破坏性变更

### 7.1 无破坏性变更

| 功能                           | 状态    |
| ------------------------------ | ------- |
| `t(key)` 调用语法              | ✅ 不变 |
| `t(key, params)` 参数插值      | ✅ 不变 |
| `t(key, { package })` 多包支持 | ✅ 不变 |
| `register()` 同步注册          | ✅ 保留 |
| `setLocale()` 同步切换         | ✅ 保留 |
| `locale` 响应式属性            | ✅ 不变 |
| `supportedLocales` 响应式属性  | ✅ 不变 |

### 7.2 新增 API（非破坏性）

| API                     | 类型 | 说明                                   |
| ----------------------- | ---- | -------------------------------------- |
| `registerLoader()`      | 新增 | 注册单个 namespace 加载器              |
| `registerLoaders()`     | 新增 | 批量注册加载器（配合 Glob Import）     |
| `loadNamespace()`       | 新增 | 强制加载单个 namespace                 |
| `loadNamespaces()`      | 新增 | 强制批量加载 namespace                 |
| `ensureNamespace()`     | 新增 | 确保 namespace 已加载（幂等，推荐）    |
| `ensureNamespaces()`    | 新增 | 确保批量 namespace 已加载（幂等）      |
| `isNamespaceLoaded()`   | 新增 | 检查加载状态                           |
| `setLocaleAsync()`      | 新增 | 异步切换语言（自动加载已用 namespace） |
| `getLoadedNamespaces()` | 新增 | 获取已加载列表                         |
| `hydrate()`             | 新增 | SSR 水合                               |
| `preload()`             | 新增 | SSR 预加载                             |

### 7.3 新增选项（非破坏性）

| 选项            | 类型                            | 默认值                 | 说明                              |
| --------------- | ------------------------------- | ---------------------- | --------------------------------- |
| `initialData`   | `Record<string, LocaleData>`    | `undefined`            | SSR 预加载数据                    |
| `fallbackMode`  | `'key' \| 'loading' \| 'empty'` | `'key'`                | 未加载时的 fallback               |
| `loadingText`   | `string`                        | `'...'`                | loading 模式显示的文本            |
| `defaultLocale` | `string`                        | `'en'`                 | 默认语言（用于生产环境 fallback） |
| `devMode`       | `boolean`                       | `import.meta.env?.DEV` | 是否为开发环境                    |

### 7.4 翻译 Fallback 策略

当翻译 key 未找到时，根据环境采用不同策略：

```
┌─────────────────────────────────────────────────────────────┐
│                    Fallback 决策流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  t('some.key') 调用                                         │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐                                        │
│  │ 查找当前语言翻译 │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│       找到？                                                 │
│       ├── Yes → 返回翻译                                    │
│       │                                                     │
│       └── No                                                │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 检查运行环境     │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│       开发环境？                                             │
│       ├── Yes → 返回 key（便于发现遗漏）                     │
│       │         例: "home.missing_key"                      │
│       │                                                     │
│       └── No（生产环境）                                     │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ 查找默认语言翻译 │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│       找到？                                                 │
│       ├── Yes → 返回默认语言翻译                             │
│       │         例: "Welcome" (en)                          │
│       │                                                     │
│       └── No → 返回 key（最后兜底）                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**配置示例**：

```typescript
const i18n = createI18nStore({
	initialLocale: 'zh',
	defaultLocale: 'en', // 生产环境 fallback 语言
	devMode: import.meta.env.DEV // 自动检测环境
});
```

**行为对比**：

| 环境                     | `t('home.missing')` 结果 | 说明                       |
| ------------------------ | ------------------------ | -------------------------- |
| 开发环境                 | `"home.missing"`         | 显示 key，便于发现遗漏翻译 |
| 生产环境                 | `"Welcome"` (默认语言值) | 用户看到有意义的文本       |
| 生产环境（默认语言也无） | `"home.missing"`         | 最后兜底                   |

**实现代码**：

```typescript
t(key: string, params?: Record<string, string | number>): string {
  // 1. 尝试当前语言
  const translation = this.lookup(key, this._locale);
  if (translation !== undefined) {
    return this.interpolate(translation, params);
  }

  // 2. 开发环境：直接返回 key（便于发现问题）
  if (this.devMode) {
    console.warn(`[i18n] Missing translation: "${key}" for locale "${this._locale}"`);
    return key;
  }

  // 3. 生产环境：尝试默认语言
  if (this._locale !== this.defaultLocale) {
    const fallback = this.lookup(key, this.defaultLocale);
    if (fallback !== undefined) {
      return this.interpolate(fallback, params);
    }
  }

  // 4. 最后兜底：返回 key
  return key;
}
```

**优势**：

- ✅ 开发时快速发现遗漏的翻译
- ✅ 生产环境用户体验更好（不会看到技术性的 key）
- ✅ 零配置自动检测环境
- ✅ 可手动覆盖 `devMode` 进行测试

---

## 8. 实现计划

### Phase 1: 核心功能

1. 扩展 `I18n` 类
   - 添加 `namespaceLoaders` 和 `namespaceStates` 属性
   - 实现 `registerLoader()` 方法
   - 实现 `loadNamespace()` 和 `loadNamespaces()` 方法
   - 实现 `isNamespaceLoaded()` 方法
   - 实现 `setLocaleAsync()` 方法

2. 扩展 `I18nStore`
   - 包装新方法，保持响应式
   - 添加 `fallbackMode` 支持

3. 更新类型定义
   - 添加 `LocaleLoader`、`NamespaceLoaders` 类型
   - 扩展 `CreateI18nStoreOptions`

### Phase 2: SSR 支持

1. 实现 `preload()` 方法
2. 实现 `hydrate()` 方法
3. 添加 `initialData` 选项支持

### Phase 3: 文档和测试

1. 更新 README.md
2. 编写单元测试
3. 编写集成测试
4. 添加使用示例

---

## 9. 性能预期

### 9.1 加载体积对比

| 场景            | Before         | After                               |
| --------------- | -------------- | ----------------------------------- |
| 首页加载        | 全部翻译 (3MB) | common + home (50KB)                |
| 进入 Dashboard  | 无额外加载     | dashboard (30KB)                    |
| 切换语言 en→zh  | 已加载         | common + home + dashboard zh (80KB) |
| 未访问 Settings | 已加载         | 不加载 (0KB)                        |

### 9.2 请求数量

- 首屏：2-3 个小请求（可通过 preload 优化为 1 个）
- 页面切换：1 个请求
- 语言切换：N 个请求（N = 已使用的 namespace 数量，可并行）

---

## 10. 待讨论事项

1. **是否需要 namespace 依赖声明？**
   - 如 `registerLoader('dashboard', { deps: ['common'], ... })`
   - 可自动加载依赖的 namespace

2. **是否支持 namespace 分组？**
   - 如 `i18n.loadGroup('page:dashboard')` 自动加载页面及其组件

3. **是否支持翻译 key 类型推导？**
   - 根据 JSON 文件生成类型定义

4. **缓存策略？**
   - 是否需要 localStorage 缓存已加载的翻译？
   - 过期策略？

---

## 11. 开发者体验（DX）指南

### 11.1 常见场景与推荐做法

#### 场景 1：现有项目，暂不想改动

```typescript
// 完全不变，继续使用现有方式
import en from './locales/en.json';
import zh from './locales/zh.json';
i18n.register('__default__', { en, zh });
```

**结论**：什么都不用做。

#### 场景 2：想要单语言加载（最常见需求）

```typescript
// +layout.svelte
const i18n = createI18nStore({ initialLocale: data.locale });

// 只改这一处：register → registerLoader
i18n.registerLoader('__default__', {
	en: () => import('./locales/en.json'),
	zh: () => import('./locales/zh.json')
});

setI18nContext(i18n);
```

**注意**：首次渲染时翻译可能短暂显示 key（因为懒加载）。如需避免：

- 方案 A：使用 SSR 预加载
- 方案 B：将首屏必需的翻译同步加载，其余懒加载

#### 场景 3：混合模式（首屏同步 + 其余懒加载）

```typescript
// +layout.svelte

// 首屏必需：同步加载（保证不闪烁）
import commonEn from './locales/common/en.json';
import commonZh from './locales/common/zh.json';
i18n.register('common', { en: commonEn, zh: commonZh });

// 页面级：懒加载
i18n.registerLoaders(parseLocaleLoaders(import.meta.glob('./locales/pages/**/*.json')));
```

#### 场景 4：库开发者（翻译打包在库中）

```typescript
// my-lib/src/i18n.ts
import en from './locales/en.json';
import zh from './locales/zh.json';

export const useMyLibI18n = () => {
	const i18n = useI18n();
	// 库的翻译通常较小，同步加载即可
	i18n.register('my-lib', { en, zh });
	return i18n;
};
```

**结论**：库开发者通常不需要懒加载，保持现有方式。

### 11.2 常见问题

#### Q: `registerLoader` 和 `register` 有什么区别？

| API                             | 加载时机     | 适用场景             |
| ------------------------------- | ------------ | -------------------- |
| `register(name, data)`          | 立即（同步） | 小文件、库、首屏必需 |
| `registerLoader(name, loaders)` | 按需（异步） | 大文件、页面级翻译   |

两者可以混用。

#### Q: 使用懒加载后，首屏会闪烁吗？

如果翻译尚未加载完成，会显示 fallback（默认是 key）。解决方案：

1. **SSR 预加载**：服务端加载，客户端 hydrate
2. **混合模式**：首屏翻译同步加载
3. **接受短暂 fallback**：对于非首屏页面通常可接受

#### Q: 切换语言时需要做什么？

```typescript
// 旧方式（仍然可用，但不会自动加载新语言）
i18n.setLocale('zh');

// 新方式（推荐：自动加载已使用 namespace 的目标语言）
await i18n.setLocaleAsync('zh');
```

#### Q: 如何知道翻译是否加载完成？

```typescript
// 检查单个 namespace
if (i18n.isNamespaceLoaded('pages/dashboard')) {
	// 已加载
}

// 获取所有已加载的 namespace
const loaded = i18n.getLoadedNamespaces();
```

### 11.3 错误处理

```typescript
try {
	await i18n.ensureNamespace('pages/dashboard');
} catch (error) {
	console.error('翻译加载失败:', error);
	// 可以显示错误提示或使用 fallback
}
```

### 11.4 调试技巧

```typescript
// 开发环境：翻译缺失时会 console.warn
// 生产环境：静默 fallback 到默认语言

// 手动检查加载状态
console.log('已加载的 namespace:', i18n.getLoadedNamespaces());
console.log('pages/home 是否加载:', i18n.isNamespaceLoaded('pages/home'));
```

---

## 附录 A：API 速查表

```typescript
// ============================================
// 创建 store
// ============================================
const i18n = createI18nStore({
	initialLocale: 'en',
	initialData: ssrData, // SSR 预加载数据
	fallbackMode: 'key' // 未加载时显示 key
});

// ============================================
// 注册加载器（推荐：自动扫描批量注册）
// ============================================
const loaders = import.meta.glob('../locales/**/*.json');
i18n.registerLoaders(parseLocaleLoaders(loaders));

// 或手动注册单个
i18n.registerLoader('namespace', {
	en: () => import('./locales/namespace/en.json'),
	zh: () => import('./locales/namespace/zh.json')
});

// ============================================
// 加载 namespace（推荐使用 ensure，幂等）
// ============================================
await i18n.ensureNamespace('namespace'); // 幂等，已加载则跳过
await i18n.ensureNamespaces(['ns1', 'ns2']); // 批量幂等

await i18n.loadNamespace('namespace'); // 强制加载
await i18n.loadNamespaces(['ns1', 'ns2']); // 强制批量加载

// ============================================
// 检查状态
// ============================================
i18n.isNamespaceLoaded('namespace'); // boolean
i18n.getLoadedNamespaces(); // string[]

// ============================================
// 切换语言
// ============================================
i18n.setLocale('zh'); // 同步（不自动加载新翻译）
await i18n.setLocaleAsync('zh'); // 异步（自动加载已使用 namespace 的目标语言）

// ============================================
// SSR 支持
// ============================================
const data = await i18n.preload(['common', 'home'], 'en');
i18n.hydrate(data);

// ============================================
// 翻译（语法不变）
// ============================================
i18n.t('common.ok');
i18n.t('home.title', { name: 'World' });
```

---

## 附录 B：三层架构速查（渐进式迁移）

| 层级       | 目录                       | namespace 示例    | 加载责任 | 加载时机         |
| ---------- | -------------------------- | ----------------- | -------- | ---------------- |
| L0 Legacy  | `locales/en.json`          | `'__default__'`   | 应用启动 | 同步加载（兼容） |
| L1 Common  | `locales/common/`          | `'common'`        | Layout   | 应用启动         |
| L2 Page    | `locales/pages/{page}/`    | `'pages/home'`    | 页面自己 | 进入页面         |
| L3 Feature | `locales/features/{feat}/` | `'features/auth'` | 页面负责 | 进入页面         |

**核心原则：页面负责加载**

- 现有代码零修改（L0 兼容模式）
- 页面知道自己用了哪些翻译（包括 feature）
- 组件代码完全不变

**选择依据**：

- 暂不拆分 → L0（继续用 en.json）
- 全局复用 → L1
- 单页面专用 → L2
- 跨页面功能模块 → L3

---

## 附录 C：语言切换流程速查

```
setLocaleAsync('zh')
     │
     ├── 1. 获取已使用的 namespace 列表
     │      loadedNamespaces = ['common', 'pages/home', 'features/chains']
     │
     ├── 2. 筛选需要加载的（zh 尚未加载的）
     │      需要加载: ['common', 'pages/home', 'features/chains']
     │
     ├── 3. 并行加载所有目标语言翻译
     │      Promise.all([loader1(), loader2(), loader3()])
     │
     ├── 4. 注册翻译数据 + 更新加载状态
     │
     ├── 5. 切换 locale = 'zh'
     │
     └── 6. UI 自动响应式更新
```

**关键点**：

- 只加载**已使用**的 namespace，未访问的页面翻译不加载
- **并行**加载，总时间 = 最慢的一个请求
- 如果目标语言已全部加载，**跳过网络请求**直接切换
