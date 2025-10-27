import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from '../../public/locales/en/common.json';
import commonJA from '../../public/locales/ja/common.json';
import authEN from '../../public/locales/en/auth.json';
import authJA from '../../public/locales/ja/auth.json';
import salesEN from '../../public/locales/en/sales.json';
import salesJA from '../../public/locales/ja/sales.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    sales: salesEN,
  },
  ja: {
    common: commonJA,
    auth: authJA,
    sales: salesJA,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    fallbackNS: 'common',
    ns: ['common', 'auth', 'sales'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage',
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
  });

export default i18n;
