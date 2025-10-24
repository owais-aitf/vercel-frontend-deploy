import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from '../../public/locales/en/common.json';
import commonJA from '../../public/locales/ja/common.json';
import authEN from '../../public/locales/en/auth.json';
import authJA from '../../public/locales/ja/auth.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
  },
  ja: {
    common: commonJA,
    auth: authJA,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage',
    },
  });

export default i18n;
