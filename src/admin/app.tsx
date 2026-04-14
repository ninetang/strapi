import type { StrapiApp } from '@strapi/strapi/admin';
import React, { useEffect, useState, useRef } from 'react';

// 导入 Strapi 5 的钩子和类型
// @ts-ignore
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin';
// @ts-ignore
import { useFetchClient } from '@strapi/strapi/admin';

/**
 * 简单的测试组件，用于验证注入是否工作
 */
const SimpleTestComponent = () => {
  console.log('🎯 SimpleTestComponent 已渲染！');

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '4px',
      margin: '12px 0',
      fontWeight: 'bold',
      color: '#92400e'
    }}>
      🎯 组件注入测试成功！如果你看到这个，说明注入功能工作正常。
    </div>
  );
};

/**
 * PDF 信息展示面板组件
 * 在编辑页面右侧展示解析出的 PDF 信息
 */
const PDFInfoPanel = () => {
  console.log('🔍 PDFInfoPanel 组件已渲染');
  const context = useContentManagerContext();

  console.log('📊 Context:', context);

  // 只在 pdf-document 内容类型中显示
  if (!context || context.slug !== 'api::pdf-document.pdf-document') {
    console.log('❌ 不是 PDF 文档类型，跳过渲染');
    return null;
  }

  console.log('✅ 是 PDF 文档类型，准备渲染面板');

  const { form } = context as any;
  const { values } = form as any;

  // 如果没有文档信息，不显示面板
  if (!values || !values.documentFile) {
    return null;
  }

  const hasData = values.documentNumber || values.applicant || values.product || values.modelNumbers;

  if (!hasData) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#f6f6f9',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
          📄 PDF 文档信息
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
          选择 PDF 文件后将自动解析并显示文档信息
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f6f6f9',
      borderRadius: '4px',
      marginBottom: '16px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
        📄 PDF 文档信息
      </h4>

      {values.documentNumber && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#32324d' }}>文档编号:</strong>{' '}
          <span style={{ fontSize: '12px', color: '#666' }}>{values.documentNumber}</span>
        </div>
      )}

      {values.applicant && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#32324d' }}>申请人:</strong>{' '}
          <span style={{ fontSize: '12px', color: '#666' }}>{values.applicant}</span>
        </div>
      )}

      {values.product && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#32324d' }}>产品:</strong>{' '}
          <span style={{ fontSize: '12px', color: '#666' }}>{values.product}</span>
        </div>
      )}

      {values.documentDate && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#32324d' }}>日期:</strong>{' '}
          <span style={{ fontSize: '12px', color: '#666' }}>{values.documentDate}</span>
        </div>
      )}

      {values.modelNumbers && values.modelNumbers.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#32324d', display: 'block', marginBottom: '4px' }}>
            型号列表 ({values.modelNumbers.length}):
          </strong>
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            fontSize: '12px',
            color: '#666'
          }}>
            {values.modelNumbers.slice(0, 10).map((model: any, idx: number) => (
              <li key={idx}>{model}</li>
            ))}
            {values.modelNumbers.length > 10 && (
              <li style={{ color: '#999' }}>... 还有 {values.modelNumbers.length - 10} 个型号</li>
            )}
          </ul>
        </div>
      )}

      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #ddd',
        fontSize: '11px',
        color: '#999'
      }}>
        💡 提示：此信息由 PDF 自动解析生成，您可以在表单中修改
      </div>
    </div>
  );
};

/**
 * PDF 自动解析监听组件
 * 当用户选择 PDF 文件时，自动调用解析 API 并填充表单
 */
const PDFAutoParseWatcher = () => {
  console.log('🔍 PDFAutoParseWatcher 组件已渲染');
  const context = useContentManagerContext();
  const { post } = useFetchClient();
  const [isParsing, setIsParsing] = useState(false);
  const previousFileRef = useRef(null);
  const parsedFilesRef = useRef<Set<number>>(new Set()); // 记录已解析的文件 ID

  console.log('📊 Watcher Context:', context);

  // 只在 pdf-document 内容类型中运行
  if (!context || context.slug !== 'api::pdf-document.pdf-document') {
    console.log('❌ Watcher: 不是 PDF 文档类型，跳过');
    return null;
  }

  console.log('✅ Watcher: 是 PDF 文档类型');

  const { form, id: documentId } = context as any;
  const { values, onChange } = form as any;

  // 添加渲染时的日志
  console.log('🔍 组件重新渲染，values:', values);
  console.log('🔍 documentFile:', values?.documentFile);

  useEffect(() => {
    console.log('🔄 useEffect 触发！');
    console.log('🔄 完整 values:', values);
    console.log('🔄 values.documentFile:', values?.documentFile);

    const currentFile = values?.documentFile;
    const previousFile = previousFileRef.current;

    console.log('🔍 currentFile:', currentFile);
    console.log('🔍 previousFile:', previousFile);
    console.log('🔍 currentFile?.id:', (currentFile as any)?.id);
    console.log('🔍 previousFile?.id:', (previousFile as any)?.id);

    // 检查文件是否变化
    const fileChanged = !!currentFile &&
                       (!previousFile || (currentFile as any).id !== (previousFile as any)?.id);

    // 检查解析字段是否为空
    const fieldsEmpty = !values?.documentNumber && !values?.applicant && !values?.product;

    // 检查是否需要解析：文件存在 且（文件变化 或 解析字段为空）
    const needsParsing = !!currentFile && (fileChanged || fieldsEmpty);

    console.log('🔍 fileChanged:', fileChanged);
    console.log('🔍 fieldsEmpty:', fieldsEmpty);
    console.log('🔍 needsParsing 最终判断:', needsParsing);

    const currentFileId = (currentFile as any)?.id;

    // 如果文件变化了，清除已解析标记，允许重新解析
    if (fileChanged && currentFileId) {
      console.log('🔄 文件已变化，清除已解析标记');
      parsedFilesRef.current.delete(currentFileId);
    }

    const alreadyParsed = currentFileId && parsedFilesRef.current.has(currentFileId);

    console.log('🔍 已解析的文件:', Array.from(parsedFilesRef.current));
    console.log('🔍 当前文件已解析过:', alreadyParsed);

    if (needsParsing && !isParsing && !alreadyParsed) {
      console.log('📄 PDF 文件已选择，开始自动解析...', currentFile);
      setIsParsing(true);

      // 标记此文件为已解析（防止重复）
      if (currentFileId) {
        parsedFilesRef.current.add(currentFileId);
      }

      // 调用解析预览 API
      console.log('📡 发送请求，fileId:', (currentFile as any).id);
      post('/api/pdf-documents/parse-preview', {
        fileId: (currentFile as any).id
      })
        .then((response) => {
          console.log('✅ PDF 解析成功:', response.data);

          const parsedData = response.data?.data || {};

          // 记录哪些字段已被自动填充（用于后续智能合并）
          const autoFilledFields: string[] = [];

          // 只填充空字段，不覆盖用户已填写的内容
          const updates: any = {};
          Object.keys(parsedData).forEach(key => {
            if ((parsedData as any)[key] && !(values as any)[key]) {
              (updates as any)[key] = (parsedData as any)[key];
              autoFilledFields.push(key);
            }
          });

          if (Object.keys(updates).length > 0) {
            // 合并更新到表单
            Object.keys(updates).forEach(key => {
              onChange({
                target: {
                  name: key,
                  value: updates[key],
                  type: typeof updates[key] === 'object' ? 'json' : 'text'
                }
              });
            });

            // 存储自动填充的字段列表到 localStorage
            const storageKey = `pdf-auto-filled-${documentId || 'new'}`;
            localStorage.setItem(storageKey, JSON.stringify(autoFilledFields));

            console.log('📝 已自动填充字段:', autoFilledFields);
          }
        })
        .catch((error) => {
          console.error('❌ PDF 解析失败:', error);
        })
        .finally(() => {
          setIsParsing(false);
        });

      // 更新引用（只在解析成功后更新）
      previousFileRef.current = currentFile;
    } else {
      console.log('⏭️ 跳过解析：needsParsing=', needsParsing, ', isParsing=', isParsing, ', alreadyParsed=', alreadyParsed);

      // 即使跳过解析，也要更新 previousFileRef，避免下次误判
      if (currentFile && !isParsing) {
        previousFileRef.current = currentFile;
      }
    }
  }, [values, isParsing, post, onChange, documentId]); // 改为监听整个 values 对象

  return null; // 隐藏组件，仅执行监听逻辑
};

export default {
  register(app: StrapiApp) {
    console.log('🔧 Register 阶段开始...');

    try {
      const contentManager = app.getPlugin('content-manager');
      console.log('📦 Content Manager in register:', contentManager);

      if (contentManager) {
        // 注入 PDF 自动解析监听组件
        try {
          contentManager.injectComponent('editView', 'right-links', {
            name: 'pdf-auto-parser-watcher',
            Component: PDFAutoParseWatcher, // 使用完整的监听组件
          });
          console.log('✅ PDF 自动解析监听组件注入成功');
        } catch (error) {
          console.error('❌ 监听组件注入失败:', error);
        }

        // 注入 PDF 信息展示组件（可选）
        try {
          contentManager.injectComponent('editView', 'right-links', {
            name: 'pdf-info-display',
            Component: PDFInfoPanel, // 信息展示面板
          });
          console.log('✅ PDF 信息面板注入成功');
        } catch (error) {
          console.error('❌ 信息面板注入失败:', error);
        }
      }
    } catch (error) {
      console.error('❌ Register 阶段失败:', error);
    }
  },

  config: {
    // 设置页面标题
    head: {
      title: 'JooTang Admin',
    },
    // 设置默认语言
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "JooTangCMS Dashboard",
        "Auth.form.welcome.title": "Welcome to JooTangCMS",
        "Auth.form.welcome.subtitle": "Log in to your account",
        "Auth.form.email.placeholder": "Ask Tiger",
        "app.components.HomePage.welcome": "Welcome to JooTangCMS",
        "app.components.HomePage.welcome.again": "Welcome back to JooTangCMS",
        "app.components.HomePage.button.blog": "Learn more on our blog",
        "app.components.HomePage.community": "Join our community",
        "notification.version.update.message": "A new version of JooTangCMS is available!",
        "Settings.application.strapiVersion": "JooTangCMS VERSION",
        "Settings.application.strapiVersion.description": "JooTangCMS version",
        "Settings.application.strapiVersion.link": "View JooTangCMS on GitHub",
        "Settings.application.strapiVersion.release-notes": "Release notes",
        "Settings.application.strapiVersion.upgrade": "Upgrade JooTangCMS",
        "Settings.application.strapiVersion.upgrade.description": "Upgrade to the latest version of JooTangCMS",
        "Settings.application.strapiVersion.upgrade.button": "Upgrade now",
        "Settings.application.strapiVersion.upgrade.success": "JooTangCMS upgraded successfully",
        "Settings.application.strapiVersion.upgrade.error": "Failed to upgrade JooTangCMS",
        "Settings.application.strapiVersion.upgrade.checking": "Checking for updates...",
        "Settings.application.strapiVersion.upgrade.available": "Update available",
        "Settings.application.strapiVersion.upgrade.latest": "You are using the latest version",
        "Settings.application.strapiVersion.upgrade.beta": "Beta version",
        "Settings.application.strapiVersion.upgrade.alpha": "Alpha version",
        "Settings.application.strapiVersion.upgrade.rc": "Release candidate",
        "Settings.application.strapiVersion.upgrade.stable": "Stable version",
        "Settings.application.strapiVersion.upgrade.deprecated": "Deprecated version",
        "Settings.application.strapiVersion.upgrade.security": "Security update available",
        "Settings.application.strapiVersion.upgrade.feature": "Feature update available",
        "Settings.application.strapiVersion.upgrade.bugfix": "Bug fix update available",
        "Settings.application.strapiVersion.upgrade.major": "Major version update available",
        "Settings.application.strapiVersion.upgrade.minor": "Minor version update available",
        "Settings.application.strapiVersion.upgrade.patch": "Patch update available"
      },
      'zh-Hans': {
        "app.components.LeftMenu.navbrand.title": "JooTangCMS 仪表盘",
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
        "cloud.plugin.description": "部署您的 JooTangCMS 应用",
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
        // 登录页面翻译
        "Auth.form.welcome.title": "欢迎使用 JooTang 管理系统",
        "Auth.form.welcome.subtitle": "请登录您的账户",
        "Auth.form.email.label": "邮箱",
        "Auth.form.password.label": "密码",
        "Auth.form.button.login": "登录",
        "Auth.form.button.login.strapi": "登录 JooTangCMS",
        "Auth.form.forgot-password": "忘记密码？",
        "Auth.form.register": "还没有账户？",
        "Auth.form.register.link": "注册",
        "Auth.form.error": "登录失败，请检查您的邮箱和密码",
        "Auth.form.error.invalid": "邮箱或密码错误",
        "Auth.form.error.blocked": "账户已被锁定",
        "Auth.form.error.inactive": "账户未激活",
        "Auth.form.error.expired": "密码已过期",
        "Auth.form.error.rate-limit": "登录尝试次数过多，请稍后再试",
        "Settings.profile.form.section.experience.title": "体验",
        "Settings.profile.form.section.personal.title": "个人信息",
        "Settings.permissions": "管理员权限",
        "Settings.roles": "角色",
        "Settings.webhooks": "Webhooks",
        "Settings.apiTokens": "API 令牌",
        "Settings.transferTokens": "传输令牌",
        "Settings.application": "应用程序设置",
        "app.components.HomePage.welcome": "欢迎使用 JooTangCMS",
        "app.components.HomePage.welcome.again": "欢迎回到 JooTangCMS",
        "app.components.HomePage.button.blog": "在博客上了解更多",
        "app.components.HomePage.community": "加入社区",
        "notification.version.update.message": "有新版本的 JooTangCMS 可用！",
        "Auth.form.email.placeholder": "管理员分配账号",
        "Settings.application.strapiVersion": "JooTangCMS 版本",
        "Settings.application.strapiVersion.description": "JooTangCMS 版本信息",
        "Settings.application.strapiVersion.link": "在 GitHub 上查看 JooTangCMS",
        "Settings.application.strapiVersion.release-notes": "发布说明",
        "Settings.application.strapiVersion.upgrade": "升级 JooTangCMS",
        "Settings.application.strapiVersion.upgrade.description": "升级到最新版本的 JooTangCMS",
        "Settings.application.strapiVersion.upgrade.button": "立即升级",
        "Settings.application.strapiVersion.upgrade.success": "JooTangCMS 升级成功",
        "Settings.application.strapiVersion.upgrade.error": "JooTangCMS 升级失败",
        "Settings.application.strapiVersion.upgrade.checking": "检查更新中...",
        "Settings.application.strapiVersion.upgrade.available": "有可用更新",
        "Settings.application.strapiVersion.upgrade.latest": "您正在使用最新版本",
        "Settings.application.strapiVersion.upgrade.beta": "测试版本",
        "Settings.application.strapiVersion.upgrade.alpha": "预览版本",
        "Settings.application.strapiVersion.upgrade.rc": "候选版本",
        "Settings.application.strapiVersion.upgrade.stable": "稳定版本",
        "Settings.application.strapiVersion.upgrade.deprecated": "已弃用版本",
        "Settings.application.strapiVersion.upgrade.security": "有安全更新可用",
        "Settings.application.strapiVersion.upgrade.feature": "有功能更新可用",
        "Settings.application.strapiVersion.upgrade.bugfix": "有错误修复更新可用",
        "Settings.application.strapiVersion.upgrade.major": "有主要版本更新可用",
        "Settings.application.strapiVersion.upgrade.minor": "有次要版本更新可用",
        "Settings.application.strapiVersion.upgrade.patch": "有补丁更新可用"
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

    // 动态设置页面标题
    document.title = 'JooTang Admin';

    console.log('🔧 Bootstrap 阶段开始...');

    // 暂时注释掉有问题的 addEditViewSidePanel
    // 先确保页面能正常打开
    console.log('✅ Bootstrap 完成（API 方式暂时禁用）');
  },
}; 
