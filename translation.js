// Replace this mock provider with your preferred AI/translation API.
// Supported language codes: th, en, zh

const demo = {
  th: {
    en: 'Translation to English (demo)',
    zh: '中文翻译（演示）'
  },
  en: {
    th: 'คำแปลภาษาไทย (เดโม)',
    zh: '中文翻译（演示）'
  },
  zh: {
    th: 'คำแปลภาษาไทย (เดโม)',
    en: 'English translation (demo)'
  }
};

export async function translateText(text, from, to) {
  if (from === to) return text;
  // TODO: connect an AI translation provider here.
  return `${demo[from]?.[to] ?? `[${to}]`} — ${text}`;
}
