import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // 设置默认语言
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Strapi Dashboard",
      },
      'zh-Hans': {
        "app.components.LeftMenu.navbrand.title": "Strapi 仪表盘",
      },
    },
    // 设置可用的语言
    locales: ['zh-Hans'],
    // 设置默认语言
    locale: 'zh-Hans',
  },
  bootstrap(app: StrapiApp) {
    // 设置默认语言
    if (localStorage.getItem('strapi-admin-language') === null) {
      localStorage.setItem('strapi-admin-language', 'zh-Hans');
    }
  },
}; 