# 插值和复数功能

## 基础插值

支持在翻译文本中使用占位符 `{变量名}` 来插入动态内容：

```typescript
// 注册翻译
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		welcome: 'Hello, {name}!',
		greeting: '{user} sent you a message'
	}
});

// 使用
i18n.t('welcome', { name: 'Alice' }); // "Hello, Alice!"
i18n.t('greeting', { user: 'Bob' }); // "Bob sent you a message"
```

## 复数形式

支持根据 `count` 参数自动选择正确的复数形式：

### 标准复数（\_one 和 \_other）

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		item_one: '{count} item',
		item_other: '{count} items'
	}
});

i18n.t('item', { count: 1 }); // "1 item"
i18n.t('item', { count: 5 }); // "5 items"
```

### 零值特殊处理（\_zero）

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		message_zero: 'No messages',
		message_one: 'One message',
		message_other: '{count} messages'
	}
});

i18n.t('message', { count: 0 }); // "No messages"
i18n.t('message', { count: 1 }); // "One message"
i18n.t('message', { count: 5 }); // "5 messages"
```

### 二值特殊处理（\_two）

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		person_one: 'One person',
		person_two: 'A pair of people',
		person_other: '{count} people'
	}
});

i18n.t('person', { count: 1 }); // "One person"
i18n.t('person', { count: 2 }); // "A pair of people"
i18n.t('person', { count: 3 }); // "3 people"
```

## 格式化器

支持在占位符中指定格式化器：`{变量名:格式化器}`

### 数字格式化（:number）

自动根据当前语言环境格式化数字（添加千分位分隔符）：

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		users: '{count:number} registered users'
	}
});

i18n.t('users', { count: 1000 }); // "1,000 registered users"
i18n.t('users', { count: 1000000 }); // "1,000,000 registered users"
```

### 货币格式化（:currency）

格式化为货币显示（默认 USD）：

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		total: 'Total: {amount:currency}'
	}
});

i18n.t('total', { amount: 99.99 }); // "Total: $99.99"
```

### 百分比格式化（:percent）

将小数转换为百分比：

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		progress: 'Progress: {value:percent}'
	}
});

i18n.t('progress', { value: 0.75 }); // "Progress: 75%"
```

## 混合使用

可以同时使用插值和复数：

```typescript
i18n.register('__default__', {
	en: {
		_meta: {
			/* ... */
		},
		notification_one: '{user} sent you {count} message',
		notification_other: '{user} sent you {count} messages'
	}
});

i18n.t('notification', { user: 'Alice', count: 1 }); // "Alice sent you 1 message"
i18n.t('notification', { user: 'Bob', count: 5 }); // "Bob sent you 5 messages"
```

## 与 package 选项一起使用

```typescript
i18n.register('wallet', {
	en: {
		_meta: {
			/* ... */
		},
		balance: 'Balance: {amount:currency}'
	}
});

i18n.t('balance', { package: 'wallet', amount: 1234.56 }); // "Balance: $1,234.56"
```

## 在 Svelte 中使用

在 Svelte 组件中，所有功能都可以通过 store 的 `t()` 方法使用：

```svelte
<script>
	import { useI18n } from '$lib/svelte';

	const i18n = useI18n();

	let accounts = [
		/* ... */
	];
</script>

<!-- 基础插值 -->
<p>{i18n.t('welcome', { name: 'Alice' })}</p>

<!-- 复数形式 -->
<p>{i18n.t('account', { count: accounts.length })}</p>

<!-- 格式化 -->
<p>{i18n.t('total', { amount: 99.99 })}</p>
```

## 复数规则总结

当传入 `count` 参数时，系统会按以下优先级查找翻译：

1. `count === 0` → 查找 `key_zero`
2. `count === 1` → 查找 `key_one`
3. `count === 2` → 查找 `key_two`
4. 其他值 → 查找 `key_other`

如果对应的复数形式不存在，会回退到基础 key。

## 注意事项

1. **占位符命名**：只支持字母、数字和下划线（`\w+`）
2. **未定义的参数**：如果占位符对应的参数未传入，占位符会保持原样
3. **格式化器**：未知的格式化器会被忽略，但参数值仍会被插入
4. **兼容性**：这些功能完全向后兼容，不影响已有的翻译代码
