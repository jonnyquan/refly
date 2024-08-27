export const enum LOCALE {
  ZH_CN = 'zh-CN',
  EN = 'en',
}

export const languageNameToLocale = {
  en: {
    'English (English)': 'en',
    'Simplified Chinese (简体中文)': 'zh-CN',
    'Traditional Chinese (繁體中文)': 'zh-Hant',
    'Japanese (日本語)': 'ja',
    'French (Français)': 'fr',
    'Standard German (Deutsch)': 'de-DE',
    'Korean (한국어)': 'ko',
    'Hindi (हिंदी)': 'hi',
    'Spanish (Español)': 'es',
    'Russian (русский)': 'ru',
    'German (Deutsch)': 'de',
    'Italian (italiano)': 'it',
    'Turkish (Türkçe)': 'tr',
    'Portuguese (português)': 'pt',
    'Vietnamese (Tiếng Việt)': 'vi',
    'Indonesian (Indonesia)': 'id',
    'Thai (ไทย)': 'th',
    'Arabic (العربية)': 'ar',
    'Mongolian (蒙古语)': 'mn',
    'Persian (فارسی)': 'fa',
  },
  'zh-CN': {
    '英语 (English)': 'en',
    '简体中文 (Simplified Chinese)': 'zh-CN',
    '繁体中文 (Traditional Chinese)': 'zh-Hant',
    '日语 (Japanese)': 'ja',
    '法语 (French)': 'fr',
    '标准德语 (Standard German)': 'de-DE',
    '韩语 (Korean)': 'ko',
    '印地语 (Hindi)': 'hi',
    '西班牙语 (Spanish)': 'es',
    '俄语 (Russian)': 'ru',
    '德语 (German)': 'de',
    '意大利语 (Italian)': 'it',
    '土耳其语 (Turkish)': 'tr',
    '葡萄牙语 (Portuguese)': 'pt',
    '越南语 (Vietnamese)': 'vi',
    '印度尼西亚语 (Indonesia)': 'id',
    '泰语 (Thai)': 'th',
    '阿拉伯语 (Arabic)': 'ar',
    '蒙古语 (Mongolian)': 'mn',
    '波斯语 (Persian)': 'fa',
  },
};

export const localeToLanguageName = {
  en: {
    en: 'English',
    'zh-CN': 'Simplified Chinese (简体中文)',
    'zh-Hant': 'Traditional Chinese (繁體中文)',
    ja: 'Japanese (Japanese)',
    fr: 'French (Français)',
    'de-DE': 'Standard German (Deutsch)',
    ko: 'Korean (한국어)',
    hi: 'Hindi (हिंदी)',
    'fr-FR': 'French (Français)',
    es: 'Spanish (Español)',
    ru: 'Russian (русский)',
    de: 'German (Deutsch)',
    it: 'Italian (italiano)',
    tr: 'Turkish (Türkçe)',
    pt: 'Portuguese (português)',
    vi: 'Vietnamese (Tiếng Việt)',
    id: 'Indonesian (Indonesia)',
    th: 'Thai (ไทย)',
    ar: 'Arabic (العربية)',
    mn: 'Mongolian (蒙古语)',
    fa: 'Persian (فارسی)',
  },
  'zh-CN': {
    en: '英语 (English)',
    'zh-CN': '简体中文',
    'zh-Hant': '繁體中文',
    ja: '日语 (Japanese)',
    fr: '法语 (Français)',
    'de-DE': '标准德语 (Deutsch)',
    ko: '韩语 (한국어)',
    hi: '印地语 (हिंदी)',
    'fr-FR': '法语 (Français)',
    es: '西班牙语 (Español)',
    ru: '俄语 (русский)',
    de: '德语 (Deutsch)',
    it: '意大利语 (italiano)',
    tr: '土耳其语 (Türkçe)',
    pt: '葡萄牙语 (português)',
    vi: '越南语 (Tiếng Việt)',
    id: '印度尼西亚语 (Indonesia)',
    th: '泰语 (Thai)',
    ar: '阿拉伯语 (العربية)',
    mn: '蒙古语 (蒙古语)',
    fa: '波斯语 (فارسی)',
  },
};

export const enLanguageName = Object.keys(languageNameToLocale.en);
export const zhCNLanguageName = Object.keys(languageNameToLocale['zh-CN']);
export const enLocale = Object.keys(localeToLanguageName.en) as OutputLocale[];
export const zhCNLocale = Object.keys(localeToLanguageName['zh-CN']);

export type OutputLocale = keyof typeof localeToLanguageName.en;

// TODO: 国际化后续要改造
export const getOutputLocale = (uiLocale: LOCALE) => {
  if (uiLocale === LOCALE.EN) {
    return enLocale;
  } else {
    return zhCNLocale;
  }
};

// TODO: 国际化后续要改造
export const getOutputLanguage = (uiLocale: LOCALE) => {
  if (uiLocale === LOCALE.EN) {
    return enLanguageName;
  } else {
    return zhCNLanguageName;
  }
};