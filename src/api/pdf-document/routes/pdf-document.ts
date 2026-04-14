/**
 * pdf-document router
 */

// 自定义路由：PDF 预览解析
export default {
  routes: [
    {
      method: 'POST',
      path: '/pdf-documents/parse-preview',
      handler: 'api::pdf-document.pdf-document.parsePreview',
      config: {
        auth: false, // 禁用认证要求（因为从管理面板调用）
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 