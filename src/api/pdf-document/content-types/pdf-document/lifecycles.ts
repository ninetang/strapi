interface Event {
  params: {
    data: any;
    where: any;
    select: any;
    populate: any;
  };
}

console.log('Lifecycles file loaded!');

export default {
  /**
   * beforeCreate 钩子
   * 智能合并模式：只在前端未填充的情况下才自动解析
   */
  async beforeCreate(event: Event) {
    console.log('=== beforeCreate TRIGGERED ===');
    const { data } = event.params;
    console.log('Create Data:', JSON.stringify(data, null, 2));

    // 检查是否有 PDF 文件，且数据为空（说明前端未自动填充）
    const hasFile = !!data.documentFile;
    const isEmpty = !data.documentNumber && !data.applicant && !data.product;

    if (hasFile && isEmpty) {
      console.log('⚠️ 前端未自动填充，后端兜底解析 PDF...');
      try {
        // @ts-ignore
        const pdfParser = strapi.service('api::pdf-document.pdf-parser');
        const parsedData = await pdfParser.parsePDF(data.documentFile);
        console.log('PDF Parsing Result:', JSON.stringify(parsedData, null, 2));

        // 合并解析数据
        Object.assign(data, parsedData);
        console.log('✅ 后端兜底解析完成');
      } catch (error) {
        console.error('❌ PDF Parsing Error:', error);
      }
    } else if (hasFile && !isEmpty) {
      console.log('✅ 前端已填充数据，跳过后端解析');
    } else {
      console.log('ℹ️ 无 PDF 文件，跳过解析');
    }
  },

  async afterCreate(event: Event) {
    console.log('=== afterCreate TRIGGERED ===');
  },

  /**
   * beforeUpdate 钩子
   * 智能合并模式：
   * 1. 如果 documentFile 没变，完全不解析（保留用户修改）
   * 2. 如果 documentFile 变了，只更新空字段
   */
  async beforeUpdate(event: Event) {
    console.log('=== beforeUpdate TRIGGERED ===');
    const { data, where } = event.params;
    console.log('Update Data:', JSON.stringify(data, null, 2));
    console.log('Update Where:', JSON.stringify(where, null, 2));

    try {
      // 获取现有文档
      // @ts-ignore
      const existingDoc = await strapi.documents('api::pdf-document.pdf-document').findOne({
        documentId: where.documentId,
      });

      console.log('Existing Doc:', existingDoc ? '找到' : '未找到');

      if (!existingDoc) {
        console.log('⚠️ 未找到现有文档，跳过解析');
        return;
      }

      // 检查文件是否真的变了
      const currentFileId = typeof data.documentFile === 'object'
        ? data.documentFile.id
        : data.documentFile;
      const existingFileId = (existingDoc as any).documentFile?.id;

      console.log('🔍 当前文件 ID:', currentFileId);
      console.log('🔍 现有文件 ID:', existingFileId);

      const fileChanged = currentFileId && currentFileId !== existingFileId;

      console.log('🔍 文件是否变化:', fileChanged);

      if (!fileChanged) {
        console.log('✅ PDF 文件未变化，完全跳过解析（保留用户修改）');
        return;
      }

      console.log('📄 PDF 文件已更换，执行智能合并...');

      // @ts-ignore
      const pdfParser = strapi.service('api::pdf-document.pdf-parser');
      const parsedData = await pdfParser.parsePDF(data.documentFile);
      console.log('PDF Parsing Result:', JSON.stringify(parsedData, null, 2));

      // 智能合并：只填充空字段，不覆盖已有内容
      const fieldsToUpdate = ['documentNumber', 'applicant', 'applicantAddress', 'product', 'documentDate', 'modelNumbers', 'rawContent'];

      fieldsToUpdate.forEach(field => {
        // 如果解析出了新值，且请求中没有提供值，则使用解析值
        if (parsedData[field] && !data[field]) {
          data[field] = parsedData[field];
          console.log(`✅ 智能填充字段: ${field}`);
        }
      });

      console.log('✅ 智能合并完成');
    } catch (error) {
      console.error('❌ PDF Update Error:', error);
    }
  },

  async afterUpdate(event: Event) {
    console.log('=== afterUpdate TRIGGERED ===');
  }
}; 
