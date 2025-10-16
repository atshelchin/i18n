import type { LocaleMeta } from '$lib/types.ts';
export const languages: LocaleMeta[] = [
	// ========== ISO 639-1 codes (2 letters) - UN Official Languages ==========
	{ code: 'en', name: 'English', englishName: 'English', direction: 'ltr', flag: '🇬🇧' },
	{ code: 'zh', name: '中文', englishName: 'Chinese', direction: 'ltr', flag: '🇨🇳' },
	{ code: 'es', name: 'Español', englishName: 'Spanish', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'fr', name: 'Français', englishName: 'French', direction: 'ltr', flag: '🇫🇷' },
	{ code: 'ru', name: 'Русский', englishName: 'Russian', direction: 'ltr', flag: '🇷🇺' },
	{ code: 'ar', name: 'العربية', englishName: 'Arabic', direction: 'rtl', flag: '🇸🇦' },

	// ========== ISO 639-1 codes - Major World Languages ==========
	{ code: 'de', name: 'Deutsch', englishName: 'German', direction: 'ltr', flag: '🇩🇪' },
	{ code: 'ja', name: '日本語', englishName: 'Japanese', direction: 'ltr', flag: '🇯🇵' },
	{ code: 'ko', name: '한국어', englishName: 'Korean', direction: 'ltr', flag: '🇰🇷' },
	{ code: 'pt', name: 'Português', englishName: 'Portuguese', direction: 'ltr', flag: '🇵🇹' },
	{ code: 'hi', name: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'it', name: 'Italiano', englishName: 'Italian', direction: 'ltr', flag: '🇮🇹' },
	{ code: 'nl', name: 'Nederlands', englishName: 'Dutch', direction: 'ltr', flag: '🇳🇱' },
	{ code: 'pl', name: 'Polski', englishName: 'Polish', direction: 'ltr', flag: '🇵🇱' },
	{ code: 'tr', name: 'Türkçe', englishName: 'Turkish', direction: 'ltr', flag: '🇹🇷' },
	{ code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', direction: 'ltr', flag: '🇻🇳' },
	{ code: 'th', name: 'ไทย', englishName: 'Thai', direction: 'ltr', flag: '🇹🇭' },
	{ code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', direction: 'ltr', flag: '🇮🇩' },
	{ code: 'he', name: 'עברית', englishName: 'Hebrew', direction: 'rtl', flag: '🇮🇱' },

	// ========== European Languages (EU + Others) ==========
	{ code: 'sv', name: 'Svenska', englishName: 'Swedish', direction: 'ltr', flag: '🇸🇪' },
	{ code: 'no', name: 'Norsk', englishName: 'Norwegian', direction: 'ltr', flag: '🇳🇴' },
	{ code: 'da', name: 'Dansk', englishName: 'Danish', direction: 'ltr', flag: '🇩🇰' },
	{ code: 'fi', name: 'Suomi', englishName: 'Finnish', direction: 'ltr', flag: '🇫🇮' },
	{ code: 'cs', name: 'Čeština', englishName: 'Czech', direction: 'ltr', flag: '🇨🇿' },
	{ code: 'hu', name: 'Magyar', englishName: 'Hungarian', direction: 'ltr', flag: '🇭🇺' },
	{ code: 'el', name: 'Ελληνικά', englishName: 'Greek', direction: 'ltr', flag: '🇬🇷' },
	{ code: 'ro', name: 'Română', englishName: 'Romanian', direction: 'ltr', flag: '🇷🇴' },
	{ code: 'uk', name: 'Українська', englishName: 'Ukrainian', direction: 'ltr', flag: '🇺🇦' },
	{ code: 'bg', name: 'Български', englishName: 'Bulgarian', direction: 'ltr', flag: '🇧🇬' },
	{ code: 'sk', name: 'Slovenčina', englishName: 'Slovak', direction: 'ltr', flag: '🇸🇰' },
	{ code: 'hr', name: 'Hrvatski', englishName: 'Croatian', direction: 'ltr', flag: '🇭🇷' },
	{ code: 'sr', name: 'Српски', englishName: 'Serbian', direction: 'ltr', flag: '🇷🇸' },
	{ code: 'sl', name: 'Slovenščina', englishName: 'Slovenian', direction: 'ltr', flag: '🇸🇮' },
	{ code: 'lt', name: 'Lietuvių', englishName: 'Lithuanian', direction: 'ltr', flag: '🇱🇹' },
	{ code: 'lv', name: 'Latviešu', englishName: 'Latvian', direction: 'ltr', flag: '🇱🇻' },
	{ code: 'et', name: 'Eesti', englishName: 'Estonian', direction: 'ltr', flag: '🇪🇪' },
	{ code: 'is', name: 'Íslenska', englishName: 'Icelandic', direction: 'ltr', flag: '🇮🇸' },
	{ code: 'ga', name: 'Gaeilge', englishName: 'Irish', direction: 'ltr', flag: '🇮🇪' },
	{ code: 'mt', name: 'Malti', englishName: 'Maltese', direction: 'ltr', flag: '🇲🇹' },
	{ code: 'sq', name: 'Shqip', englishName: 'Albanian', direction: 'ltr', flag: '🇦🇱' },
	{ code: 'mk', name: 'Македонски', englishName: 'Macedonian', direction: 'ltr', flag: '🇲🇰' },
	{ code: 'ca', name: 'Català', englishName: 'Catalan', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'eu', name: 'Euskara', englishName: 'Basque', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'gl', name: 'Galego', englishName: 'Galician', direction: 'ltr', flag: '🇪🇸' },
	{
		code: 'nb',
		name: 'Norsk Bokmål',
		englishName: 'Norwegian Bokmål',
		direction: 'ltr',
		flag: '🇳🇴'
	},
	{
		code: 'nn',
		name: 'Norsk Nynorsk',
		englishName: 'Norwegian Nynorsk',
		direction: 'ltr',
		flag: '🇳🇴'
	},
	{
		code: 'lb',
		name: 'Lëtzebuergesch',
		englishName: 'Luxembourgish',
		direction: 'ltr',
		flag: '🇱🇺'
	},

	// ========== Asian Languages (South Asia) ==========
	{ code: 'bn', name: 'বাংলা', englishName: 'Bengali', direction: 'ltr', flag: '🇧🇩' },
	{ code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'te', name: 'తెలుగు', englishName: 'Telugu', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'mr', name: 'मराठी', englishName: 'Marathi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'ta', name: 'தமிழ்', englishName: 'Tamil', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'ur', name: 'اردو', englishName: 'Urdu', direction: 'rtl', flag: '🇵🇰' },
	{ code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'si', name: 'සිංහල', englishName: 'Sinhala', direction: 'ltr', flag: '🇱🇰' },
	{ code: 'ne', name: 'नेपाली', englishName: 'Nepali', direction: 'ltr', flag: '🇳🇵' },
	{ code: 'dz', name: 'རྫོང་ཁ', englishName: 'Dzongkha', direction: 'ltr', flag: '🇧🇹' },

	// ========== Southeast Asian Languages ==========
	{ code: 'my', name: 'မြန်မာ', englishName: 'Burmese', direction: 'ltr', flag: '🇲🇲' },
	{ code: 'km', name: 'ខ្មែរ', englishName: 'Khmer', direction: 'ltr', flag: '🇰🇭' },
	{ code: 'lo', name: 'ລາວ', englishName: 'Lao', direction: 'ltr', flag: '🇱🇦' },
	{ code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay', direction: 'ltr', flag: '🇲🇾' },
	{ code: 'tl', name: 'Tagalog', englishName: 'Tagalog', direction: 'ltr', flag: '🇵🇭' },
	{ code: 'fil', name: 'Filipino', englishName: 'Filipino', direction: 'ltr', flag: '🇵🇭' },
	{ code: 'jv', name: 'Basa Jawa', englishName: 'Javanese', direction: 'ltr', flag: '🇮🇩' },
	{ code: 'su', name: 'Basa Sunda', englishName: 'Sundanese', direction: 'ltr', flag: '🇮🇩' },

	// ========== Central Asian Languages ==========
	{ code: 'kk', name: 'Қазақ', englishName: 'Kazakh', direction: 'ltr', flag: '🇰🇿' },
	{ code: 'uz', name: 'Oʻzbek', englishName: 'Uzbek', direction: 'ltr', flag: '🇺🇿' },
	{ code: 'ky', name: 'Кыргызча', englishName: 'Kyrgyz', direction: 'ltr', flag: '🇰🇬' },
	{ code: 'tg', name: 'Тоҷикӣ', englishName: 'Tajik', direction: 'ltr', flag: '🇹🇯' },
	{ code: 'tk', name: 'Türkmen', englishName: 'Turkmen', direction: 'ltr', flag: '🇹🇲' },
	{ code: 'mn', name: 'Монгол', englishName: 'Mongolian', direction: 'ltr', flag: '🇲🇳' },

	// ========== Caucasus Region ==========
	{ code: 'ka', name: 'ქართული', englishName: 'Georgian', direction: 'ltr', flag: '🇬🇪' },
	{ code: 'hy', name: 'Հայերեն', englishName: 'Armenian', direction: 'ltr', flag: '🇦🇲' },
	{ code: 'az', name: 'Azərbaycan', englishName: 'Azerbaijani', direction: 'ltr', flag: '🇦🇿' },

	// ========== Middle Eastern Languages ==========
	{ code: 'fa', name: 'فارسی', englishName: 'Persian', direction: 'rtl', flag: '🇮🇷' },
	{ code: 'ps', name: 'پښتو', englishName: 'Pashto', direction: 'rtl', flag: '🇦🇫' },
	{ code: 'ku', name: 'کوردی', englishName: 'Kurdish', direction: 'rtl', flag: '🇮🇶' },
	{ code: 'iw', name: 'עברית', englishName: 'Hebrew (deprecated)', direction: 'rtl', flag: '🇮🇱' }, // Deprecated code

	// ========== African Languages ==========
	{ code: 'sw', name: 'Kiswahili', englishName: 'Swahili', direction: 'ltr', flag: '🇰🇪' },
	{ code: 'am', name: 'አማርኛ', englishName: 'Amharic', direction: 'ltr', flag: '🇪🇹' },
	{ code: 'ha', name: 'Hausa', englishName: 'Hausa', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'yo', name: 'Yorùbá', englishName: 'Yoruba', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'ig', name: 'Igbo', englishName: 'Igbo', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'zu', name: 'isiZulu', englishName: 'Zulu', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'xh', name: 'isiXhosa', englishName: 'Xhosa', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'af', name: 'Afrikaans', englishName: 'Afrikaans', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'so', name: 'Soomaali', englishName: 'Somali', direction: 'ltr', flag: '🇸🇴' },
	{ code: 'ti', name: 'ትግርኛ', englishName: 'Tigrinya', direction: 'ltr', flag: '🇪🇷' },
	{ code: 'om', name: 'Oromoo', englishName: 'Oromo', direction: 'ltr', flag: '🇪🇹' },
	{ code: 'rw', name: 'Kinyarwanda', englishName: 'Kinyarwanda', direction: 'ltr', flag: '🇷🇼' },
	{ code: 'rn', name: 'Kirundi', englishName: 'Kirundi', direction: 'ltr', flag: '🇧🇮' },
	{ code: 'ny', name: 'Chichewa', englishName: 'Chichewa', direction: 'ltr', flag: '🇲🇼' },
	{ code: 'sn', name: 'chiShona', englishName: 'Shona', direction: 'ltr', flag: '🇿🇼' },
	{ code: 'st', name: 'Sesotho', englishName: 'Sesotho', direction: 'ltr', flag: '🇱🇸' },
	{ code: 'tn', name: 'Setswana', englishName: 'Tswana', direction: 'ltr', flag: '🇧🇼' },
	{ code: 'ts', name: 'Xitsonga', englishName: 'Tsonga', direction: 'ltr', flag: '🇿🇦' },
	{ code: 've', name: 'Tshivenḓa', englishName: 'Venda', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'wo', name: 'Wolof', englishName: 'Wolof', direction: 'ltr', flag: '🇸🇳' },
	{ code: 'ff', name: 'Fulfulde', englishName: 'Fulah', direction: 'ltr', flag: '🇸🇳' },
	{ code: 'lg', name: 'Luganda', englishName: 'Ganda', direction: 'ltr', flag: '🇺🇬' },
	{ code: 'ak', name: 'Akan', englishName: 'Akan', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'tw', name: 'Twi', englishName: 'Twi', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'ee', name: 'Eʋegbe', englishName: 'Ewe', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'kg', name: 'Kikongo', englishName: 'Kongo', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'ln', name: 'Lingála', englishName: 'Lingala', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'lu', name: 'Tshiluba', englishName: 'Luba-Katanga', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'sg', name: 'Sängö', englishName: 'Sango', direction: 'ltr', flag: '🇨🇫' },
	{ code: 'mg', name: 'Malagasy', englishName: 'Malagasy', direction: 'ltr', flag: '🇲🇬' },

	// ========== Pacific Islands Languages ==========
	{ code: 'mi', name: 'Te Reo Māori', englishName: 'Maori', direction: 'ltr', flag: '🇳🇿' },
	{ code: 'sm', name: 'Gagana Samoa', englishName: 'Samoan', direction: 'ltr', flag: '🇼🇸' },
	{ code: 'to', name: 'Lea faka-Tonga', englishName: 'Tongan', direction: 'ltr', flag: '🇹🇴' },
	{ code: 'fj', name: 'Na Vosa Vakaviti', englishName: 'Fijian', direction: 'ltr', flag: '🇫🇯' },
	{ code: 'ty', name: 'Reo Tahiti', englishName: 'Tahitian', direction: 'ltr', flag: '🇵🇫' },
	{ code: 'haw', name: 'ʻŌlelo Hawaiʻi', englishName: 'Hawaiian', direction: 'ltr', flag: '🇺🇸' },
	{ code: 'mh', name: 'Kajin M̧ajeļ', englishName: 'Marshallese', direction: 'ltr', flag: '🇲🇭' },
	{ code: 'nau', name: 'Dorerin Naoero', englishName: 'Nauruan', direction: 'ltr', flag: '🇳🇷' },
	{ code: 'tvl', name: 'Te Ggana Tuuvalu', englishName: 'Tuvaluan', direction: 'ltr', flag: '🇹🇻' },
	{ code: 'pau', name: 'Tekoi ra Belau', englishName: 'Palauan', direction: 'ltr', flag: '🇵🇼' },
	{
		code: 'gil',
		name: 'Te taetae ni Kiribati',
		englishName: 'Gilbertese',
		direction: 'ltr',
		flag: '🇰🇮'
	},
	{ code: 'bi', name: 'Bislama', englishName: 'Bislama', direction: 'ltr', flag: '🇻🇺' },
	{ code: 'tpi', name: 'Tok Pisin', englishName: 'Tok Pisin', direction: 'ltr', flag: '🇵🇬' },
	{ code: 'ho', name: 'Hiri Motu', englishName: 'Hiri Motu', direction: 'ltr', flag: '🇵🇬' },

	// ========== Americas - Indigenous Languages ==========
	{ code: 'qu', name: 'Runa Simi', englishName: 'Quechua', direction: 'ltr', flag: '🇵🇪' },
	{ code: 'ay', name: 'Aymar aru', englishName: 'Aymara', direction: 'ltr', flag: '🇧🇴' },
	{ code: 'gn', name: "Avañe'ẽ", englishName: 'Guarani', direction: 'ltr', flag: '🇵🇾' },
	{
		code: 'ht',
		name: 'Kreyòl ayisyen',
		englishName: 'Haitian Creole',
		direction: 'ltr',
		flag: '🇭🇹'
	},

	// ========== Caribbean Languages ==========
	{ code: 'pap', name: 'Papiamentu', englishName: 'Papiamento', direction: 'ltr', flag: '🇦🇼' },

	// ========== Sign Languages (Optional - may need special handling) ==========
	{ code: 'ase', name: 'American Sign Language', englishName: 'ASL', direction: 'ltr', flag: '🇺🇸' },
	{ code: 'bfi', name: 'British Sign Language', englishName: 'BSL', direction: 'ltr', flag: '🇬🇧' },

	// ========== Constructed Languages (Optional) ==========
	{ code: 'eo', name: 'Esperanto', englishName: 'Esperanto', direction: 'ltr', flag: '🌐' },
	{ code: 'ia', name: 'Interlingua', englishName: 'Interlingua', direction: 'ltr', flag: '🌐' },
	{ code: 'ie', name: 'Interlingue', englishName: 'Interlingue', direction: 'ltr', flag: '🌐' },
	{ code: 'io', name: 'Ido', englishName: 'Ido', direction: 'ltr', flag: '🌐' },
	{ code: 'vo', name: 'Volapük', englishName: 'Volapük', direction: 'ltr', flag: '🌐' },

	// ========== Latin & Ancient Languages (Optional - for academic/religious texts) ==========
	{ code: 'la', name: 'Latina', englishName: 'Latin', direction: 'ltr', flag: '🇻🇦' },
	{ code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'grc', name: 'Ἑλληνική', englishName: 'Ancient Greek', direction: 'ltr', flag: '🇬🇷' },

	// ========== BCP 47 Regional Variants ==========
	{
		code: 'zh-TW',
		name: '繁體中文',
		englishName: 'Traditional Chinese',
		direction: 'ltr',
		flag: '🇹🇼'
	},
	{
		code: 'zh-CN',
		name: '简体中文',
		englishName: 'Simplified Chinese',
		direction: 'ltr',
		flag: '🇨🇳'
	},
	{
		code: 'zh-HK',
		name: '繁體中文 (香港)',
		englishName: 'Chinese (Hong Kong)',
		direction: 'ltr',
		flag: '🇭🇰'
	},
	{
		code: 'zh-SG',
		name: '简体中文 (新加坡)',
		englishName: 'Chinese (Singapore)',
		direction: 'ltr',
		flag: '🇸🇬'
	},
	{
		code: 'zh-MO',
		name: '繁體中文 (澳門)',
		englishName: 'Chinese (Macau)',
		direction: 'ltr',
		flag: '🇲🇴'
	},
	{
		code: 'pt-BR',
		name: 'Português (Brasil)',
		englishName: 'Portuguese (Brazil)',
		direction: 'ltr',
		flag: '🇧🇷'
	},
	{
		code: 'pt-PT',
		name: 'Português (Portugal)',
		englishName: 'Portuguese (Portugal)',
		direction: 'ltr',
		flag: '🇵🇹'
	},
	{
		code: 'pt-AO',
		name: 'Português (Angola)',
		englishName: 'Portuguese (Angola)',
		direction: 'ltr',
		flag: '🇦🇴'
	},
	{
		code: 'pt-MZ',
		name: 'Português (Moçambique)',
		englishName: 'Portuguese (Mozambique)',
		direction: 'ltr',
		flag: '🇲🇿'
	},
	{
		code: 'en-US',
		name: 'English (US)',
		englishName: 'English (United States)',
		direction: 'ltr',
		flag: '🇺🇸'
	},
	{
		code: 'en-GB',
		name: 'English (UK)',
		englishName: 'English (United Kingdom)',
		direction: 'ltr',
		flag: '🇬🇧'
	},
	{
		code: 'en-AU',
		name: 'English (Australia)',
		englishName: 'English (Australia)',
		direction: 'ltr',
		flag: '🇦🇺'
	},
	{
		code: 'en-CA',
		name: 'English (Canada)',
		englishName: 'English (Canada)',
		direction: 'ltr',
		flag: '🇨🇦'
	},
	{
		code: 'en-IN',
		name: 'English (India)',
		englishName: 'English (India)',
		direction: 'ltr',
		flag: '🇮🇳'
	},
	{
		code: 'en-IE',
		name: 'English (Ireland)',
		englishName: 'English (Ireland)',
		direction: 'ltr',
		flag: '🇮🇪'
	},
	{
		code: 'en-NZ',
		name: 'English (New Zealand)',
		englishName: 'English (New Zealand)',
		direction: 'ltr',
		flag: '🇳🇿'
	},
	{
		code: 'en-ZA',
		name: 'English (South Africa)',
		englishName: 'English (South Africa)',
		direction: 'ltr',
		flag: '🇿🇦'
	},
	{
		code: 'en-SG',
		name: 'English (Singapore)',
		englishName: 'English (Singapore)',
		direction: 'ltr',
		flag: '🇸🇬'
	},
	{
		code: 'en-HK',
		name: 'English (Hong Kong)',
		englishName: 'English (Hong Kong)',
		direction: 'ltr',
		flag: '🇭🇰'
	},
	{
		code: 'fr-CA',
		name: 'Français (Canada)',
		englishName: 'French (Canada)',
		direction: 'ltr',
		flag: '🇨🇦'
	},
	{
		code: 'fr-FR',
		name: 'Français (France)',
		englishName: 'French (France)',
		direction: 'ltr',
		flag: '🇫🇷'
	},
	{
		code: 'fr-BE',
		name: 'Français (Belgique)',
		englishName: 'French (Belgium)',
		direction: 'ltr',
		flag: '🇧🇪'
	},
	{
		code: 'fr-CH',
		name: 'Français (Suisse)',
		englishName: 'French (Switzerland)',
		direction: 'ltr',
		flag: '🇨🇭'
	},
	{
		code: 'fr-LU',
		name: 'Français (Luxembourg)',
		englishName: 'French (Luxembourg)',
		direction: 'ltr',
		flag: '🇱🇺'
	},
	{
		code: 'es-ES',
		name: 'Español (España)',
		englishName: 'Spanish (Spain)',
		direction: 'ltr',
		flag: '🇪🇸'
	},
	{
		code: 'es-MX',
		name: 'Español (México)',
		englishName: 'Spanish (Mexico)',
		direction: 'ltr',
		flag: '🇲🇽'
	},
	{
		code: 'es-AR',
		name: 'Español (Argentina)',
		englishName: 'Spanish (Argentina)',
		direction: 'ltr',
		flag: '🇦🇷'
	},
	{
		code: 'es-CO',
		name: 'Español (Colombia)',
		englishName: 'Spanish (Colombia)',
		direction: 'ltr',
		flag: '🇨🇴'
	},
	{
		code: 'es-CL',
		name: 'Español (Chile)',
		englishName: 'Spanish (Chile)',
		direction: 'ltr',
		flag: '🇨🇱'
	},
	{
		code: 'es-PE',
		name: 'Español (Perú)',
		englishName: 'Spanish (Peru)',
		direction: 'ltr',
		flag: '🇵🇪'
	},
	{
		code: 'es-VE',
		name: 'Español (Venezuela)',
		englishName: 'Spanish (Venezuela)',
		direction: 'ltr',
		flag: '🇻🇪'
	},
	{
		code: 'es-EC',
		name: 'Español (Ecuador)',
		englishName: 'Spanish (Ecuador)',
		direction: 'ltr',
		flag: '🇪🇨'
	},
	{
		code: 'es-GT',
		name: 'Español (Guatemala)',
		englishName: 'Spanish (Guatemala)',
		direction: 'ltr',
		flag: '🇬🇹'
	},
	{
		code: 'es-CU',
		name: 'Español (Cuba)',
		englishName: 'Spanish (Cuba)',
		direction: 'ltr',
		flag: '🇨🇺'
	},
	{
		code: 'es-BO',
		name: 'Español (Bolivia)',
		englishName: 'Spanish (Bolivia)',
		direction: 'ltr',
		flag: '🇧🇴'
	},
	{
		code: 'es-DO',
		name: 'Español (República Dominicana)',
		englishName: 'Spanish (Dominican Republic)',
		direction: 'ltr',
		flag: '🇩🇴'
	},
	{
		code: 'es-HN',
		name: 'Español (Honduras)',
		englishName: 'Spanish (Honduras)',
		direction: 'ltr',
		flag: '🇭🇳'
	},
	{
		code: 'es-PY',
		name: 'Español (Paraguay)',
		englishName: 'Spanish (Paraguay)',
		direction: 'ltr',
		flag: '🇵🇾'
	},
	{
		code: 'es-SV',
		name: 'Español (El Salvador)',
		englishName: 'Spanish (El Salvador)',
		direction: 'ltr',
		flag: '🇸🇻'
	},
	{
		code: 'es-NI',
		name: 'Español (Nicaragua)',
		englishName: 'Spanish (Nicaragua)',
		direction: 'ltr',
		flag: '🇳🇮'
	},
	{
		code: 'es-CR',
		name: 'Español (Costa Rica)',
		englishName: 'Spanish (Costa Rica)',
		direction: 'ltr',
		flag: '🇨🇷'
	},
	{
		code: 'es-PA',
		name: 'Español (Panamá)',
		englishName: 'Spanish (Panama)',
		direction: 'ltr',
		flag: '🇵🇦'
	},
	{
		code: 'es-UY',
		name: 'Español (Uruguay)',
		englishName: 'Spanish (Uruguay)',
		direction: 'ltr',
		flag: '🇺🇾'
	},
	{
		code: 'es-PR',
		name: 'Español (Puerto Rico)',
		englishName: 'Spanish (Puerto Rico)',
		direction: 'ltr',
		flag: '🇵🇷'
	},
	{
		code: 'ar-SA',
		name: 'العربية (السعودية)',
		englishName: 'Arabic (Saudi Arabia)',
		direction: 'rtl',
		flag: '🇸🇦'
	},
	{
		code: 'ar-EG',
		name: 'العربية (مصر)',
		englishName: 'Arabic (Egypt)',
		direction: 'rtl',
		flag: '🇪🇬'
	},
	{
		code: 'ar-AE',
		name: 'العربية (الإمارات)',
		englishName: 'Arabic (UAE)',
		direction: 'rtl',
		flag: '🇦🇪'
	},
	{
		code: 'ar-IQ',
		name: 'العربية (العراق)',
		englishName: 'Arabic (Iraq)',
		direction: 'rtl',
		flag: '🇮🇶'
	},
	{
		code: 'ar-JO',
		name: 'العربية (الأردن)',
		englishName: 'Arabic (Jordan)',
		direction: 'rtl',
		flag: '🇯🇴'
	},
	{
		code: 'ar-LB',
		name: 'العربية (لبنان)',
		englishName: 'Arabic (Lebanon)',
		direction: 'rtl',
		flag: '🇱🇧'
	},
	{
		code: 'ar-SY',
		name: 'العربية (سوريا)',
		englishName: 'Arabic (Syria)',
		direction: 'rtl',
		flag: '🇸🇾'
	},
	{
		code: 'ar-MA',
		name: 'العربية (المغرب)',
		englishName: 'Arabic (Morocco)',
		direction: 'rtl',
		flag: '🇲🇦'
	},
	{
		code: 'ar-TN',
		name: 'العربية (تونس)',
		englishName: 'Arabic (Tunisia)',
		direction: 'rtl',
		flag: '🇹🇳'
	},
	{
		code: 'ar-DZ',
		name: 'العربية (الجزائر)',
		englishName: 'Arabic (Algeria)',
		direction: 'rtl',
		flag: '🇩🇿'
	},
	{
		code: 'ar-LY',
		name: 'العربية (ليبيا)',
		englishName: 'Arabic (Libya)',
		direction: 'rtl',
		flag: '🇱🇾'
	},
	{
		code: 'ar-OM',
		name: 'العربية (عُمان)',
		englishName: 'Arabic (Oman)',
		direction: 'rtl',
		flag: '🇴🇲'
	},
	{
		code: 'ar-YE',
		name: 'العربية (اليمن)',
		englishName: 'Arabic (Yemen)',
		direction: 'rtl',
		flag: '🇾🇪'
	},
	{
		code: 'ar-BH',
		name: 'العربية (البحرين)',
		englishName: 'Arabic (Bahrain)',
		direction: 'rtl',
		flag: '🇧🇭'
	},
	{
		code: 'ar-KW',
		name: 'العربية (الكويت)',
		englishName: 'Arabic (Kuwait)',
		direction: 'rtl',
		flag: '🇰🇼'
	},
	{
		code: 'ar-QA',
		name: 'العربية (قطر)',
		englishName: 'Arabic (Qatar)',
		direction: 'rtl',
		flag: '🇶🇦'
	},
	{
		code: 'de-DE',
		name: 'Deutsch (Deutschland)',
		englishName: 'German (Germany)',
		direction: 'ltr',
		flag: '🇩🇪'
	},
	{
		code: 'de-AT',
		name: 'Deutsch (Österreich)',
		englishName: 'German (Austria)',
		direction: 'ltr',
		flag: '🇦🇹'
	},
	{
		code: 'de-CH',
		name: 'Deutsch (Schweiz)',
		englishName: 'German (Switzerland)',
		direction: 'ltr',
		flag: '🇨🇭'
	},
	{
		code: 'de-LI',
		name: 'Deutsch (Liechtenstein)',
		englishName: 'German (Liechtenstein)',
		direction: 'ltr',
		flag: '🇱🇮'
	},
	{
		code: 'de-LU',
		name: 'Deutsch (Luxemburg)',
		englishName: 'German (Luxembourg)',
		direction: 'ltr',
		flag: '🇱🇺'
	},
	{
		code: 'it-IT',
		name: 'Italiano (Italia)',
		englishName: 'Italian (Italy)',
		direction: 'ltr',
		flag: '🇮🇹'
	},
	{
		code: 'it-CH',
		name: 'Italiano (Svizzera)',
		englishName: 'Italian (Switzerland)',
		direction: 'ltr',
		flag: '🇨🇭'
	},
	{
		code: 'it-SM',
		name: 'Italiano (San Marino)',
		englishName: 'Italian (San Marino)',
		direction: 'ltr',
		flag: '🇸🇲'
	},
	{
		code: 'nl-NL',
		name: 'Nederlands (Nederland)',
		englishName: 'Dutch (Netherlands)',
		direction: 'ltr',
		flag: '🇳🇱'
	},
	{
		code: 'nl-BE',
		name: 'Nederlands (België)',
		englishName: 'Dutch (Belgium)',
		direction: 'ltr',
		flag: '🇧🇪'
	},
	{
		code: 'nl-SR',
		name: 'Nederlands (Suriname)',
		englishName: 'Dutch (Suriname)',
		direction: 'ltr',
		flag: '🇸🇷'
	},
	{
		code: 'ru-RU',
		name: 'Русский (Россия)',
		englishName: 'Russian (Russia)',
		direction: 'ltr',
		flag: '🇷🇺'
	},
	{
		code: 'ru-BY',
		name: 'Русский (Беларусь)',
		englishName: 'Russian (Belarus)',
		direction: 'ltr',
		flag: '🇧🇾'
	},
	{
		code: 'ru-KZ',
		name: 'Русский (Казахстан)',
		englishName: 'Russian (Kazakhstan)',
		direction: 'ltr',
		flag: '🇰🇿'
	},
	{
		code: 'ru-KG',
		name: 'Русский (Кыргызстан)',
		englishName: 'Russian (Kyrgyzstan)',
		direction: 'ltr',
		flag: '🇰🇬'
	},

	// ========== ISO 639-2/3 codes (3 letters) ==========
	// ISO 639-2 codes for major languages (bibliographic codes)
	{ code: 'eng', name: 'English', englishName: 'English', direction: 'ltr', flag: '🇬🇧' },
	{ code: 'chi', name: '中文', englishName: 'Chinese', direction: 'ltr', flag: '🇨🇳' }, // ISO 639-2/B
	{ code: 'zho', name: '中文', englishName: 'Chinese', direction: 'ltr', flag: '🇨🇳' }, // ISO 639-2/T
	{ code: 'spa', name: 'Español', englishName: 'Spanish', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'fra', name: 'Français', englishName: 'French', direction: 'ltr', flag: '🇫🇷' },
	{ code: 'fre', name: 'Français', englishName: 'French', direction: 'ltr', flag: '🇫🇷' }, // ISO 639-2/B
	{ code: 'ger', name: 'Deutsch', englishName: 'German', direction: 'ltr', flag: '🇩🇪' }, // ISO 639-2/B
	{ code: 'deu', name: 'Deutsch', englishName: 'German', direction: 'ltr', flag: '🇩🇪' }, // ISO 639-2/T
	{ code: 'jpn', name: '日本語', englishName: 'Japanese', direction: 'ltr', flag: '🇯🇵' },
	{ code: 'kor', name: '한국어', englishName: 'Korean', direction: 'ltr', flag: '🇰🇷' },
	{ code: 'por', name: 'Português', englishName: 'Portuguese', direction: 'ltr', flag: '🇵🇹' },
	{ code: 'rus', name: 'Русский', englishName: 'Russian', direction: 'ltr', flag: '🇷🇺' },
	{ code: 'ara', name: 'العربية', englishName: 'Arabic', direction: 'rtl', flag: '🇸🇦' },
	{ code: 'hin', name: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'ita', name: 'Italiano', englishName: 'Italian', direction: 'ltr', flag: '🇮🇹' },
	{ code: 'dut', name: 'Nederlands', englishName: 'Dutch', direction: 'ltr', flag: '🇳🇱' }, // ISO 639-2/B
	{ code: 'nld', name: 'Nederlands', englishName: 'Dutch', direction: 'ltr', flag: '🇳🇱' }, // ISO 639-2/T
	{ code: 'pol', name: 'Polski', englishName: 'Polish', direction: 'ltr', flag: '🇵🇱' },
	{ code: 'tur', name: 'Türkçe', englishName: 'Turkish', direction: 'ltr', flag: '🇹🇷' },
	{ code: 'vie', name: 'Tiếng Việt', englishName: 'Vietnamese', direction: 'ltr', flag: '🇻🇳' },
	{ code: 'tha', name: 'ไทย', englishName: 'Thai', direction: 'ltr', flag: '🇹🇭' },
	{
		code: 'ind',
		name: 'Bahasa Indonesia',
		englishName: 'Indonesian',
		direction: 'ltr',
		flag: '🇮🇩'
	},
	{ code: 'heb', name: 'עברית', englishName: 'Hebrew', direction: 'rtl', flag: '🇮🇱' },
	{ code: 'swe', name: 'Svenska', englishName: 'Swedish', direction: 'ltr', flag: '🇸🇪' },
	{ code: 'nor', name: 'Norsk', englishName: 'Norwegian', direction: 'ltr', flag: '🇳🇴' },
	{ code: 'dan', name: 'Dansk', englishName: 'Danish', direction: 'ltr', flag: '🇩🇰' },
	{ code: 'fin', name: 'Suomi', englishName: 'Finnish', direction: 'ltr', flag: '🇫🇮' },
	{ code: 'cze', name: 'Čeština', englishName: 'Czech', direction: 'ltr', flag: '🇨🇿' }, // ISO 639-2/B
	{ code: 'ces', name: 'Čeština', englishName: 'Czech', direction: 'ltr', flag: '🇨🇿' }, // ISO 639-2/T
	{ code: 'hun', name: 'Magyar', englishName: 'Hungarian', direction: 'ltr', flag: '🇭🇺' },
	{ code: 'gre', name: 'Ελληνικά', englishName: 'Greek', direction: 'ltr', flag: '🇬🇷' }, // ISO 639-2/B
	{ code: 'ell', name: 'Ελληνικά', englishName: 'Greek', direction: 'ltr', flag: '🇬🇷' }, // ISO 639-2/T
	{ code: 'rum', name: 'Română', englishName: 'Romanian', direction: 'ltr', flag: '🇷🇴' }, // ISO 639-2/B
	{ code: 'ron', name: 'Română', englishName: 'Romanian', direction: 'ltr', flag: '🇷🇴' }, // ISO 639-2/T
	{ code: 'ukr', name: 'Українська', englishName: 'Ukrainian', direction: 'ltr', flag: '🇺🇦' },
	{ code: 'bul', name: 'Български', englishName: 'Bulgarian', direction: 'ltr', flag: '🇧🇬' },
	{ code: 'ben', name: 'বাংলা', englishName: 'Bengali', direction: 'ltr', flag: '🇧🇩' },
	{ code: 'pan', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'tel', name: 'తెలుగు', englishName: 'Telugu', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'mar', name: 'मराठी', englishName: 'Marathi', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'tam', name: 'தமிழ்', englishName: 'Tamil', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'urd', name: 'اردو', englishName: 'Urdu', direction: 'rtl', flag: '🇵🇰' },
	{ code: 'guj', name: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'kan', name: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'mal', name: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'ori', name: 'ଓଡ଼ିଆ', englishName: 'Odia', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'sin', name: 'සිංහල', englishName: 'Sinhala', direction: 'ltr', flag: '🇱🇰' },
	{ code: 'nep', name: 'नेपाली', englishName: 'Nepali', direction: 'ltr', flag: '🇳🇵' },
	{ code: 'bur', name: 'မြန်မာ', englishName: 'Burmese', direction: 'ltr', flag: '🇲🇲' }, // ISO 639-2/B
	{ code: 'mya', name: 'မြန်မာ', englishName: 'Burmese', direction: 'ltr', flag: '🇲🇲' }, // ISO 639-2/T
	{ code: 'khm', name: 'ខ្មែរ', englishName: 'Khmer', direction: 'ltr', flag: '🇰🇭' },
	{ code: 'lao', name: 'ລາວ', englishName: 'Lao', direction: 'ltr', flag: '🇱🇦' },
	{ code: 'may', name: 'Bahasa Melayu', englishName: 'Malay', direction: 'ltr', flag: '🇲🇾' }, // ISO 639-2/B
	{ code: 'msa', name: 'Bahasa Melayu', englishName: 'Malay', direction: 'ltr', flag: '🇲🇾' }, // ISO 639-2/T
	{ code: 'tgl', name: 'Tagalog', englishName: 'Tagalog', direction: 'ltr', flag: '🇵🇭' },
	{ code: 'jav', name: 'Basa Jawa', englishName: 'Javanese', direction: 'ltr', flag: '🇮🇩' },
	{ code: 'kaz', name: 'Қазақ', englishName: 'Kazakh', direction: 'ltr', flag: '🇰🇿' },
	{ code: 'uzb', name: 'Oʻzbek', englishName: 'Uzbek', direction: 'ltr', flag: '🇺🇿' },
	{ code: 'kir', name: 'Кыргызча', englishName: 'Kyrgyz', direction: 'ltr', flag: '🇰🇬' },
	{ code: 'tgk', name: 'Тоҷикӣ', englishName: 'Tajik', direction: 'ltr', flag: '🇹🇯' },
	{ code: 'tuk', name: 'Türkmen', englishName: 'Turkmen', direction: 'ltr', flag: '🇹🇲' },
	{ code: 'mon', name: 'Монгол', englishName: 'Mongolian', direction: 'ltr', flag: '🇲🇳' },
	{ code: 'geo', name: 'ქართული', englishName: 'Georgian', direction: 'ltr', flag: '🇬🇪' }, // ISO 639-2/B
	{ code: 'kat', name: 'ქართული', englishName: 'Georgian', direction: 'ltr', flag: '🇬🇪' }, // ISO 639-2/T
	{ code: 'arm', name: 'Հայերեն', englishName: 'Armenian', direction: 'ltr', flag: '🇦🇲' }, // ISO 639-2/B
	{ code: 'hye', name: 'Հայերեն', englishName: 'Armenian', direction: 'ltr', flag: '🇦🇲' }, // ISO 639-2/T
	{ code: 'aze', name: 'Azərbaycan', englishName: 'Azerbaijani', direction: 'ltr', flag: '🇦🇿' },
	{ code: 'per', name: 'فارسی', englishName: 'Persian', direction: 'rtl', flag: '🇮🇷' }, // ISO 639-2/B
	{ code: 'fas', name: 'فارسی', englishName: 'Persian', direction: 'rtl', flag: '🇮🇷' }, // ISO 639-2/T
	{ code: 'pus', name: 'پښتو', englishName: 'Pashto', direction: 'rtl', flag: '🇦🇫' },
	{ code: 'kur', name: 'کوردی', englishName: 'Kurdish', direction: 'rtl', flag: '🇮🇶' },
	{ code: 'swa', name: 'Kiswahili', englishName: 'Swahili', direction: 'ltr', flag: '🇰🇪' },
	{ code: 'amh', name: 'አማርኛ', englishName: 'Amharic', direction: 'ltr', flag: '🇪🇹' },
	{ code: 'hau', name: 'Hausa', englishName: 'Hausa', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'yor', name: 'Yorùbá', englishName: 'Yoruba', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'ibo', name: 'Igbo', englishName: 'Igbo', direction: 'ltr', flag: '🇳🇬' },
	{ code: 'zul', name: 'isiZulu', englishName: 'Zulu', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'xho', name: 'isiXhosa', englishName: 'Xhosa', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'afr', name: 'Afrikaans', englishName: 'Afrikaans', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'som', name: 'Soomaali', englishName: 'Somali', direction: 'ltr', flag: '🇸🇴' },
	{ code: 'tir', name: 'ትግርኛ', englishName: 'Tigrinya', direction: 'ltr', flag: '🇪🇷' },
	{ code: 'orm', name: 'Oromoo', englishName: 'Oromo', direction: 'ltr', flag: '🇪🇹' },
	{ code: 'kin', name: 'Kinyarwanda', englishName: 'Kinyarwanda', direction: 'ltr', flag: '🇷🇼' },
	{ code: 'run', name: 'Kirundi', englishName: 'Kirundi', direction: 'ltr', flag: '🇧🇮' },
	{ code: 'nya', name: 'Chichewa', englishName: 'Chichewa', direction: 'ltr', flag: '🇲🇼' },
	{ code: 'sna', name: 'chiShona', englishName: 'Shona', direction: 'ltr', flag: '🇿🇼' },
	{ code: 'sot', name: 'Sesotho', englishName: 'Sesotho', direction: 'ltr', flag: '🇱🇸' },
	{ code: 'tsn', name: 'Setswana', englishName: 'Tswana', direction: 'ltr', flag: '🇧🇼' },
	{ code: 'tso', name: 'Xitsonga', englishName: 'Tsonga', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'ven', name: 'Tshivenḓa', englishName: 'Venda', direction: 'ltr', flag: '🇿🇦' },
	{ code: 'wol', name: 'Wolof', englishName: 'Wolof', direction: 'ltr', flag: '🇸🇳' },
	{ code: 'ful', name: 'Fulfulde', englishName: 'Fulah', direction: 'ltr', flag: '🇸🇳' },
	{ code: 'lug', name: 'Luganda', englishName: 'Ganda', direction: 'ltr', flag: '🇺🇬' },
	{ code: 'aka', name: 'Akan', englishName: 'Akan', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'twi', name: 'Twi', englishName: 'Twi', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'ewe', name: 'Eʋegbe', englishName: 'Ewe', direction: 'ltr', flag: '🇬🇭' },
	{ code: 'kon', name: 'Kikongo', englishName: 'Kongo', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'lin', name: 'Lingála', englishName: 'Lingala', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'lub', name: 'Tshiluba', englishName: 'Luba-Katanga', direction: 'ltr', flag: '🇨🇩' },
	{ code: 'sag', name: 'Sängö', englishName: 'Sango', direction: 'ltr', flag: '🇨🇫' },
	{ code: 'mlg', name: 'Malagasy', englishName: 'Malagasy', direction: 'ltr', flag: '🇲🇬' },
	{ code: 'mao', name: 'Te Reo Māori', englishName: 'Maori', direction: 'ltr', flag: '🇳🇿' }, // ISO 639-2/B
	{ code: 'mri', name: 'Te Reo Māori', englishName: 'Maori', direction: 'ltr', flag: '🇳🇿' }, // ISO 639-2/T
	{ code: 'smo', name: 'Gagana Samoa', englishName: 'Samoan', direction: 'ltr', flag: '🇼🇸' },
	{ code: 'ton', name: 'Lea faka-Tonga', englishName: 'Tongan', direction: 'ltr', flag: '🇹🇴' },
	{ code: 'fij', name: 'Na Vosa Vakaviti', englishName: 'Fijian', direction: 'ltr', flag: '🇫🇯' },
	{ code: 'tah', name: 'Reo Tahiti', englishName: 'Tahitian', direction: 'ltr', flag: '🇵🇫' },
	{ code: 'mah', name: 'Kajin M̧ajeļ', englishName: 'Marshallese', direction: 'ltr', flag: '🇲🇭' },
	{ code: 'bis', name: 'Bislama', englishName: 'Bislama', direction: 'ltr', flag: '🇻🇺' },
	{ code: 'hmo', name: 'Hiri Motu', englishName: 'Hiri Motu', direction: 'ltr', flag: '🇵🇬' },
	{ code: 'que', name: 'Runa Simi', englishName: 'Quechua', direction: 'ltr', flag: '🇵🇪' },
	{ code: 'aym', name: 'Aymar aru', englishName: 'Aymara', direction: 'ltr', flag: '🇧🇴' },
	{ code: 'grn', name: "Avañe'ẽ", englishName: 'Guarani', direction: 'ltr', flag: '🇵🇾' },
	{
		code: 'hat',
		name: 'Kreyòl ayisyen',
		englishName: 'Haitian Creole',
		direction: 'ltr',
		flag: '🇭🇹'
	},
	{ code: 'epo', name: 'Esperanto', englishName: 'Esperanto', direction: 'ltr', flag: '🌐' },
	{ code: 'ina', name: 'Interlingua', englishName: 'Interlingua', direction: 'ltr', flag: '🌐' },
	{ code: 'ile', name: 'Interlingue', englishName: 'Interlingue', direction: 'ltr', flag: '🌐' },
	{ code: 'ido', name: 'Ido', englishName: 'Ido', direction: 'ltr', flag: '🌐' },
	{ code: 'vol', name: 'Volapük', englishName: 'Volapük', direction: 'ltr', flag: '🌐' },
	{ code: 'lat', name: 'Latina', englishName: 'Latin', direction: 'ltr', flag: '🇻🇦' },
	{ code: 'san', name: 'संस्कृतम्', englishName: 'Sanskrit', direction: 'ltr', flag: '🇮🇳' },
	{ code: 'slo', name: 'Slovenčina', englishName: 'Slovak', direction: 'ltr', flag: '🇸🇰' }, // ISO 639-2/B
	{ code: 'slk', name: 'Slovenčina', englishName: 'Slovak', direction: 'ltr', flag: '🇸🇰' }, // ISO 639-2/T
	{ code: 'hrv', name: 'Hrvatski', englishName: 'Croatian', direction: 'ltr', flag: '🇭🇷' },
	{ code: 'srp', name: 'Српски', englishName: 'Serbian', direction: 'ltr', flag: '🇷🇸' },
	{ code: 'slv', name: 'Slovenščina', englishName: 'Slovenian', direction: 'ltr', flag: '🇸🇮' },
	{ code: 'lit', name: 'Lietuvių', englishName: 'Lithuanian', direction: 'ltr', flag: '🇱🇹' },
	{ code: 'lav', name: 'Latviešu', englishName: 'Latvian', direction: 'ltr', flag: '🇱🇻' },
	{ code: 'est', name: 'Eesti', englishName: 'Estonian', direction: 'ltr', flag: '🇪🇪' },
	{ code: 'ice', name: 'Íslenska', englishName: 'Icelandic', direction: 'ltr', flag: '🇮🇸' }, // ISO 639-2/B
	{ code: 'isl', name: 'Íslenska', englishName: 'Icelandic', direction: 'ltr', flag: '🇮🇸' }, // ISO 639-2/T
	{ code: 'gle', name: 'Gaeilge', englishName: 'Irish', direction: 'ltr', flag: '🇮🇪' },
	{ code: 'mlt', name: 'Malti', englishName: 'Maltese', direction: 'ltr', flag: '🇲🇹' },
	{ code: 'alb', name: 'Shqip', englishName: 'Albanian', direction: 'ltr', flag: '🇦🇱' }, // ISO 639-2/B
	{ code: 'sqi', name: 'Shqip', englishName: 'Albanian', direction: 'ltr', flag: '🇦🇱' }, // ISO 639-2/T
	{ code: 'mac', name: 'Македонски', englishName: 'Macedonian', direction: 'ltr', flag: '🇲🇰' }, // ISO 639-2/B
	{ code: 'mkd', name: 'Македонски', englishName: 'Macedonian', direction: 'ltr', flag: '🇲🇰' }, // ISO 639-2/T
	{ code: 'cat', name: 'Català', englishName: 'Catalan', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'baq', name: 'Euskara', englishName: 'Basque', direction: 'ltr', flag: '🇪🇸' }, // ISO 639-2/B
	{ code: 'eus', name: 'Euskara', englishName: 'Basque', direction: 'ltr', flag: '🇪🇸' }, // ISO 639-2/T
	{ code: 'glg', name: 'Galego', englishName: 'Galician', direction: 'ltr', flag: '🇪🇸' },
	{ code: 'wel', name: 'Cymraeg', englishName: 'Welsh', direction: 'ltr', flag: '🏴󐀠󐁧󐁢󐁷󐁬󐁳󐁿' }, // ISO 639-2/B
	{ code: 'cym', name: 'Cymraeg', englishName: 'Welsh', direction: 'ltr', flag: '🏴󐀠󐁧󐁢󐁷󐁬󐁳󐁿' }, // ISO 639-2/T
	{
		code: 'gla',
		name: 'Gàidhlig',
		englishName: 'Scottish Gaelic',
		direction: 'ltr',
		flag: '🏴󐀠󐁧󐁢󐁳󐁣󐁴󐁿'
	},
	{ code: 'bre', name: 'Brezhoneg', englishName: 'Breton', direction: 'ltr', flag: '🇫🇷' },
	{
		code: 'ltz',
		name: 'Lëtzebuergesch',
		englishName: 'Luxembourgish',
		direction: 'ltr',
		flag: '🇱🇺'
	},
	{ code: 'fao', name: 'Føroyskt', englishName: 'Faroese', direction: 'ltr', flag: '🇫🇴' },
	{ code: 'kal', name: 'Kalaallisut', englishName: 'Greenlandic', direction: 'ltr', flag: '🇬🇱' },
	{ code: 'sun', name: 'Basa Sunda', englishName: 'Sundanese', direction: 'ltr', flag: '🇮🇩' },
	{ code: 'dzo', name: 'རྫོང་ཁ', englishName: 'Dzongkha', direction: 'ltr', flag: '🇧🇹' },
	{ code: 'tib', name: 'བོད་སྐད་', englishName: 'Tibetan', direction: 'ltr', flag: '🇨🇳' }, // ISO 639-2/B
	{ code: 'bod', name: 'བོད་སྐད་', englishName: 'Tibetan', direction: 'ltr', flag: '🇨🇳' }, // ISO 639-2/T
	{ code: 'uig', name: 'ئۇيغۇرچە', englishName: 'Uyghur', direction: 'rtl', flag: '🇨🇳' }
];
