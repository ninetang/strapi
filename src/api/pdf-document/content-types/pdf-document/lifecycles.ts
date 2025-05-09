interface Event {
  params: {
    data: any;
    where: any;
    select: any;
    populate: any;
  };
}

export default {
  async beforeCreate(event: Event) {
    const { data, where, select, populate } = event.params;
    
    if (data.documentFile) {
      try {
        // @ts-ignore
        const pdfParser = strapi.service('api::pdf-document.pdf-parser');
        const parsedData = await pdfParser.parsePDF(data.documentFile);
        
        // 将解析出的数据合并到创建数据中
        Object.assign(data, parsedData);
      } catch (error) {
        console.error('Error parsing PDF:', error);
      }
    }
  },
  
  async beforeUpdate(event: Event) {
    const { data, where, select, populate } = event.params;
    
    if (data.documentFile) {
      try {
        // @ts-ignore
        const pdfParser = strapi.service('api::pdf-document.pdf-parser');
        const parsedData = await pdfParser.parsePDF(data.documentFile);
        
        // 将解析出的数据合并到更新数据中
        Object.assign(data, parsedData);
      } catch (error) {
        console.error('Error parsing PDF:', error);
      }
    }
  }
}; 