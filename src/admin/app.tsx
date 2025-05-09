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
        "global.content-manager": "内容管理",
        "global.plugins.content-manager": "内容管理",
        "global.plugins.content-type-builder": "内容类型构建器",
        "global.plugins.upload": "媒体库",
        "global.plugins.email": "电子邮件",
        "global.plugins.i18n": "国际化",
        "global.marketplace": "市场",
        "global.settings": "设置",
        "Settings.profile.form.section.experience.title": "体验",
        "Settings.profile.form.section.personal.title": "个人信息",
        "Settings.permissions": "管理员权限",
        "Settings.roles": "角色",
        "Settings.webhooks": "Webhooks",
        "Settings.apiTokens": "API 令牌",
        "Settings.transferTokens": "传输令牌",
        "Settings.application": "应用程序设置",
        "app.components.HomePage.welcome": "欢迎使用",
        "app.components.HomePage.welcome.again": "欢迎回来",
        "app.components.HomePage.button.blog": "在博客上了解更多",
        "app.components.HomePage.community": "加入社区",
        "notification.version.update.message": "有新版本的 Strapi 可用！"
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