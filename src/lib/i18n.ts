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
import engineerEN from '../../public/locales/en/engineer.json';
import engineerJA from '../../public/locales/ja/engineer.json';
import adminEN from '../../public/locales/en/admin.json';
import adminJA from '../../public/locales/ja/admin.json';
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    sales: salesEN,
    engineer: engineerEN,
    admin: adminEN,
  },
  ja: {
    common: commonJA,
    auth: authJA,
    sales: salesJA,
    engineer: engineerJA,
    admin: adminJA,
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
    ns: ['common', 'auth', 'sales', 'engineer', 'admin'],
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
