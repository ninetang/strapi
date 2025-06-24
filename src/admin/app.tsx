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
        "content-manager.plugin.name": "内容管理",
        "content-manager.components.LeftMenu.navbrand.title": "内容管理",
        "content-manager.pages.ListView.headerLayout": "列表视图",
        "content-manager.pages.ListView.table-headers.name": "名称",
        "content-manager.pages.ListView.table-headers.createdAt": "创建时间",
        "content-manager.pages.ListView.table-headers.updatedAt": "更新时间",
        "content-manager.pages.ListView.table-headers.publishedAt": "发布时间",
        "content-manager.pages.ListView.table-headers.status": "状态",
        "content-manager.pages.ListView.table-headers.actions": "操作",
        "content-manager.pages.ListView.table-headers.actions.edit": "编辑",
        "content-manager.pages.ListView.table-headers.actions.delete": "删除",
        "content-manager.pages.ListView.table-headers.actions.publish": "发布",
        "content-manager.pages.ListView.table-headers.actions.unpublish": "取消发布",
        "content-manager.pages.ListView.table-headers.actions.duplicate": "复制",
        "content-manager.pages.ListView.table-headers.actions.preview": "预览",
        "content-manager.pages.ListView.table-headers.actions.view": "查看",
        "content-manager.pages.ListView.table-headers.actions.configure": "配置",
        "content-manager.pages.ListView.table-headers.actions.settings": "设置",
        "content-manager.pages.ListView.table-headers.actions.permissions": "权限",
        "content-manager.pages.ListView.table-headers.actions.webhooks": "Webhooks",
        "content-manager.pages.ListView.table-headers.actions.apiTokens": "API 令牌",
        "content-manager.pages.ListView.table-headers.actions.transferTokens": "传输令牌",
        "content-manager.pages.ListView.table-headers.actions.application": "应用程序设置",
        "cloud.plugin.name": "部署",
        "cloud.plugin.description": "部署您的 Strapi 应用",
        "marketplace.plugin.name": "市场",
        "marketplace.plugin.description": "浏览和安装插件",
        "upload.plugin.name": "媒体库",
        "upload.plugin.description": "管理您的媒体文件",
        "email.plugin.name": "电子邮件",
        "email.plugin.description": "配置电子邮件设置",
        "i18n.plugin.name": "国际化",
        "i18n.plugin.description": "管理多语言内容",
        // 内容类型翻译
        "Article": "文章",
        "Author": "作者",
        "Category": "分类",
        "PDF Document": "PDF 文档",
        "User": "用户",
        "About": "关于",
        "Global": "全局设置",
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
