const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
  },
  localePath: path.resolve('./public/locales'),
  ns: [
    'common',
    'auth',
    'dashboard',
    'engineers',
    'assignments',
    'projects',
    'reports',
  ],
  defaultNS: 'common',
};
