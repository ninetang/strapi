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
  async beforeCreate(event: Event) {
    console.log('=== beforeCreate TRIGGERED ===');
    const { data, where, select, populate } = event.params;
    console.log('Create Data:', JSON.stringify(data, null, 2));
    
    if (data.documentFile) {
      console.log('Found PDF file in create request:', JSON.stringify(data.documentFile, null, 2));
      try {
        // @ts-ignore
        const pdfParser = strapi.service('api::pdf-document.pdf-parser');
        console.log('PDF Parser service loaded successfully');
        
        const parsedData = await pdfParser.parsePDF(data.documentFile);
        console.log('PDF Parsing Result:', JSON.stringify(parsedData, null, 2));
        
        // 将解析出的数据合并到创建数据中
        Object.assign(data, parsedData);
        console.log('Final Data After Merge:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('PDF Parsing Error:', error);
        console.error('Error Stack:', error.stack);
      }
    } else {
      console.log('No PDF file found in create request');
    }
  },
  
  async afterCreate(event: Event) {
    console.log('=== afterCreate TRIGGERED ===');
    console.log('Created Data:', JSON.stringify(event.params, null, 2));
  },
  
  async beforeUpdate(event: Event) {
    console.log('=== beforeUpdate TRIGGERED ===');
    const { data, where, select, populate } = event.params;
    console.log('Update Data:', JSON.stringify(data, null, 2));
    
    if (data.documentFile) {
      console.log('Found PDF file in update request:', JSON.stringify(data.documentFile, null, 2));
      try {
        // @ts-ignore
        const pdfParser = strapi.service('api::pdf-document.pdf-parser');
        console.log('PDF Parser service loaded successfully');
        
        const parsedData = await pdfParser.parsePDF(data.documentFile);
        console.log('PDF Parsing Result:', JSON.stringify(parsedData, null, 2));
        
        // 将解析出的数据合并到更新数据中
        Object.assign(data, parsedData);
        console.log('Final Data After Merge:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('PDF Parsing Error:', error);
        console.error('Error Stack:', error.stack);
      }
    } else {
      console.log('No PDF file found in update request');
    }
  },
  
  async afterUpdate(event: Event) {
    console.log('=== afterUpdate TRIGGERED ===');
    console.log('Updated Data:', JSON.stringify(event.params, null, 2));
  }
}; 