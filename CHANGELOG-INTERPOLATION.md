# 插值功能更新

## 新增功能

### 1. 基础插值 (Parameter Interpolation)

支持在翻译文本中使用 `{变量名}` 占位符来插入动态内容：

```typescript
i18n.t('wallet.account_count', { count: accounts.length });
// 如果翻译是 "You have {count} accounts"
// 输出: "You have 5 accounts"
```

### 2. 复数形式 (Pluralization)

根据 `count` 参数自动选择正确的复数形式：

**支持的后缀：**

- `_zero`: count === 0
- `_one`: count === 1
- `_two`: count === 2
- `_other`: 其他所有值

**示例：**

```typescript
// 定义翻译
{
  account_zero: 'No accounts',
  account_one: '{count} account',
  account_two: '{count} accounts',
  account_other: '{count} accounts'
}

// 使用
i18n.t('account', { count: 0 });   // "No accounts"
i18n.t('account', { count: 1 });   // "1 account"
i18n.t('account', { count: 2 });   // "2 accounts"
i18n.t('account', { count: 10 });  // "10 accounts"
```

### 3. 数值格式化 (Number Formatting)

支持三种内置格式化器：

#### `:number` - 千分位格式化

```typescript
i18n.t('users', { count: 1000000 });
// 定义: "Total: {count:number} users"
// 输出: "Total: 1,000,000 users"
```

#### `:currency` - 货币格式化

```typescript
i18n.t('balance', { amount: 1234.56 });
// 定义: "Balance: {amount:currency}"
// 输出: "Balance: $1,234.56"
```

#### `:percent` - 百分比格式化

```typescript
i18n.t('progress', { value: 0.75 });
// 定义: "Progress: {value:percent}"
// 输出: "Progress: 75%"
```

### 4. 混合使用

可以同时使用插值、复数和格式化：

```typescript
// 定义
{
  notification_one: '{user} sent you {count} message',
  notification_other: '{user} sent you {count:number} messages'
}

// 使用
i18n.t('notification', { user: 'Alice', count: 1 });
// 输出: "Alice sent you 1 message"

i18n.t('notification', { user: 'Bob', count: 1000 });
// 输出: "Bob sent you 1,000 messages"
```

## API 变更

### `t()` 方法签名更新

```typescript
// 之前
t(key: string, options?: { package?: string }): string

// 现在 (支持两种重载)
t(key: string, params?: Record<string, string | number>): string
t(key: string, options?: { package?: string } & Record<string, string | number>): string
```

**向后兼容：** 所有旧代码无需修改，仍然可以正常工作。

### 使用示例

```typescript
// 1. 仅插值参数
i18n.t('welcome', { name: 'Alice' });

// 2. 带 package 选项
i18n.t('balance', { package: 'wallet', amount: 1234.56 });

// 3. 复数 + 插值
i18n.t('notification', { user: 'Bob', count: 5 });

// 4. 格式化
i18n.t('total', { amount: 99.99 }); // 如果定义了 {amount:currency}
```

## 在 Svelte 中使用

```svelte
<script>
	import { useI18n } from '@shelchin/i18n/svelte';

	const i18n = useI18n();

	let accounts = [
		/* ... */
	];
	let userName = 'Alice';
</script>

<!-- 基础插值 -->
<h1>{i18n.t('welcome', { name: userName })}</h1>

<!-- 复数形式 -->
<p>{i18n.t('account', { count: accounts.length })}</p>

<!-- 格式化 -->
<p>{i18n.t('balance', { amount: 1234.56 })}</p>
```

## 回退机制

1. **未找到参数**：占位符保持原样

   ```typescript
   i18n.t('welcome', {}); // "Welcome, {name}!"
   ```

2. **未找到复数形式**：使用基础 key

   ```typescript
   // 只定义了 base key，没有 _one, _other
   i18n.t('item', { count: 1 }); // 使用 'item' 的值
   ```

3. **未知格式化器**：忽略格式化器，仍插入值

   ```typescript
   // 定义: "{value:unknown}"
   i18n.t('key', { value: 42 }); // "42"
   ```

4. **未找到翻译 key**：返回 key 本身
   ```typescript
   i18n.t('nonexistent', { foo: 'bar' }); // "nonexistent"
   ```

## 测试覆盖

新增 10+ 测试用例，覆盖：

- ✅ 基础插值
- ✅ 多参数插值
- ✅ 单复数形式 (\_one, \_other)
- ✅ 零值特殊处理 (\_zero)
- ✅ 二值特殊处理 (\_two)
- ✅ 数字格式化 (:number)
- ✅ 货币格式化 (:currency)
- ✅ 百分比格式化 (:percent)
- ✅ 混合使用场景
- ✅ 回退机制

所有测试通过：**35/35** ✓

## 性能影响

- 正则表达式替换是惰性执行的
- 只有在传入参数时才会进行插值处理
- 复数查找使用简单的 if-else，性能开销极小
- 格式化使用原生 `Intl` API，性能优良

## 文档

- 📖 [完整文档](./docs/interpolation.md)
- 💡 [示例代码](./examples/interpolation-example.ts)

## 破坏性变更

**无** - 此更新完全向后兼容，所有现有代码无需修改即可继续使用。
