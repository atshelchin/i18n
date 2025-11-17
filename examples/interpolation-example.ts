/**
 * Interpolation and Pluralization Examples
 *
 * This file demonstrates all the interpolation and pluralization features
 * of the i18n library.
 */

import { I18n } from '../src/lib/i18n';

// Create an i18n instance
const i18n = new I18n('en');

// Register translations with various interpolation examples
i18n.register('__default__', {
	en: {
		_meta: {
			code: 'en',
			name: 'English',
			englishName: 'English',
			direction: 'ltr',
			flag: '🇬🇧'
		},
		// Basic interpolation
		welcome: 'Welcome, {name}!',
		greeting: 'Hello, {firstName} {lastName}!',

		// Pluralization examples
		item_zero: 'No items',
		item_one: '{count} item',
		item_other: '{count} items',

		message_zero: 'No messages',
		message_one: 'One message',
		message_two: 'A couple of messages',
		message_other: '{count} messages',

		// Mixed interpolation and pluralization
		notification_one: '{user} sent you {count} message',
		notification_other: '{user} sent you {count} messages',

		// Formatted numbers
		users: 'Total users: {count:number}',
		balance: 'Account balance: {amount:currency}',
		completion: 'Task completion: {progress:percent}',

		// Complex example
		wallet_balance_one: "{user}'s wallet has {amount:currency} ({count} transaction)",
		wallet_balance_other: "{user}'s wallet has {amount:currency} ({count} transactions)"
	},
	zh: {
		_meta: {
			code: 'zh',
			name: '中文',
			englishName: 'Chinese',
			direction: 'ltr',
			flag: '🇨🇳'
		},
		welcome: '欢迎，{name}！',
		greeting: '你好，{firstName} {lastName}！',

		item_zero: '没有项目',
		item_one: '{count} 个项目',
		item_other: '{count} 个项目',

		message_zero: '没有消息',
		message_one: '一条消息',
		message_other: '{count} 条消息',

		notification_one: '{user} 给你发送了 {count} 条消息',
		notification_other: '{user} 给你发送了 {count} 条消息',

		users: '总用户数：{count:number}',
		balance: '账户余额：{amount:currency}',
		completion: '任务完成度：{progress:percent}',

		wallet_balance_one: '{user} 的钱包有 {amount:currency}（{count} 笔交易）',
		wallet_balance_other: '{user} 的钱包有 {amount:currency}（{count} 笔交易）'
	}
});

console.log('=== Basic Interpolation Examples ===\n');

console.log('English:');
console.log(i18n.t('welcome', { name: 'Alice' }));
// Output: Welcome, Alice!

console.log(i18n.t('greeting', { firstName: 'John', lastName: 'Doe' }));
// Output: Hello, John Doe!

i18n.setLocale('zh');
console.log('\nChinese:');
console.log(i18n.t('welcome', { name: '小明' }));
// Output: 欢迎，小明！

console.log(i18n.t('greeting', { firstName: '张', lastName: '伟' }));
// Output: 你好，张 伟！

console.log('\n=== Pluralization Examples ===\n');

i18n.setLocale('en');
console.log('English:');
console.log(i18n.t('item', { count: 0 })); // No items
console.log(i18n.t('item', { count: 1 })); // 1 item
console.log(i18n.t('item', { count: 5 })); // 5 items

console.log('\n' + i18n.t('message', { count: 0 })); // No messages
console.log(i18n.t('message', { count: 1 })); // One message
console.log(i18n.t('message', { count: 2 })); // A couple of messages
console.log(i18n.t('message', { count: 10 })); // 10 messages

i18n.setLocale('zh');
console.log('\nChinese:');
console.log(i18n.t('item', { count: 0 })); // 没有项目
console.log(i18n.t('item', { count: 1 })); // 1 个项目
console.log(i18n.t('item', { count: 5 })); // 5 个项目

console.log('\n=== Mixed Interpolation and Pluralization ===\n');

i18n.setLocale('en');
console.log('English:');
console.log(i18n.t('notification', { user: 'Alice', count: 1 }));
// Output: Alice sent you 1 message

console.log(i18n.t('notification', { user: 'Bob', count: 5 }));
// Output: Bob sent you 5 messages

i18n.setLocale('zh');
console.log('\nChinese:');
console.log(i18n.t('notification', { user: '小明', count: 1 }));
// Output: 小明 给你发送了 1 条消息

console.log('\n=== Formatting Examples ===\n');

i18n.setLocale('en');
console.log('English:');
console.log(i18n.t('users', { count: 1234567 }));
// Output: Total users: 1,234,567

console.log(i18n.t('balance', { amount: 1234.56 }));
// Output: Account balance: $1,234.56

console.log(i18n.t('completion', { progress: 0.856 }));
// Output: Task completion: 86%

console.log('\n=== Complex Example ===\n');

i18n.setLocale('en');
console.log('English:');
console.log(i18n.t('wallet_balance', { user: 'Alice', amount: 1234.56, count: 1 }));
// Output: Alice's wallet has $1,234.56 (1 transaction)

console.log(i18n.t('wallet_balance', { user: 'Bob', amount: 9876.54, count: 25 }));
// Output: Bob's wallet has $9,876.54 (25 transactions)

i18n.setLocale('zh');
console.log('\nChinese:');
console.log(i18n.t('wallet_balance', { user: '小明', amount: 1234.56, count: 1 }));
// Output: 小明 的钱包有 $1,234.56（1 笔交易）

console.log(i18n.t('wallet_balance', { user: '小红', amount: 9876.54, count: 25 }));
// Output: 小红 的钱包有 $9,876.54（25 笔交易）

console.log('\n=== Fallback Behavior ===\n');

i18n.setLocale('en');
console.log('Missing parameter (keeps placeholder):');
console.log(i18n.t('welcome', {}));
// Output: Welcome, {name}!

console.log('\nMissing translation key:');
console.log(i18n.t('nonexistent.key', { foo: 'bar' }));
// Output: nonexistent.key

console.log('\nMissing plural form (uses base key):');
i18n.register('test', {
	en: {
		_meta: {
			code: 'en',
			name: 'English',
			englishName: 'English',
			direction: 'ltr',
			flag: '🇬🇧'
		},
		basic_item: '{count} items (no plural forms)'
	}
});
console.log(i18n.t('basic_item', { package: 'test', count: 1 }));
// Output: 1 items (no plural forms)
