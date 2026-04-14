/**
 * pdf-document controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::pdf-document.pdf-document', ({ strapi }) => ({
  /**
   * 预览解析 PDF（不保存到数据库）
   * 用于前端实时预览解析结果
   */
  async parsePreview(ctx) {
    try {
      const { fileId } = ctx.request.body;

      if (!fileId) {
        return ctx.badRequest('Missing fileId parameter');
      }

      // 获取文件信息
      const file = await strapi.plugins.upload.services.upload.findOne(fileId);

      if (!file) {
        return ctx.notFound('File not found');
      }

      // 调用 PDF 解析服务
      // @ts-ignore
      const pdfParser = strapi.service('api::pdf-document.pdf-parser');
      const parsedData = await pdfParser.parsePDF(file);

      return ctx.send({
        data: parsedData,
        message: 'PDF parsed successfully'
      });
    } catch (error) {
      strapi.log.error('PDF preview parse error:', error);
      return ctx.internalServerError('Failed to parse PDF', {
        error: error.message
      });
    }
  }
})); 
