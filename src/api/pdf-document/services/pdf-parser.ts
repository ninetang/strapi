import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface FileData {
  url: string;
  hash: string;
}

export default () => ({
  async parsePDF(fileData: FileData) {
    try {
      const { url, hash } = fileData;
      
      // 获取文件的物理路径
      const filePath = path.join(process.cwd(), 'public', url);
      
      // 读取 PDF 文件
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      // 提取文本内容
      const content = pdfData.text;
      
      // 解析各个字段
      const extractField = (pattern: RegExp, text: string) => {
        const match = text.match(pattern);
        return match ? match[1].trim() : null;
      };
      
      // 定义提取规则
      const documentNumber = extractField(/No\.\s*(.*?)(?:\n|$)/i, content);
      const applicant = extractField(/Applicant:\s*(.*?)(?:\n|$)/i, content);
      const applicantAddress = extractField(/Address:\s*(.*?)(?:\n|$)/i, content);
      const product = extractField(/Product:\s*(.*?)(?:\n|$)/i, content);
      const dateMatch = extractField(/Date:\s*(.*?)(?:\n|$)/i, content);
      
      // 解析日期
      let documentDate = null;
      if (dateMatch) {
        const parsedDate = new Date(dateMatch);
        if (!isNaN(parsedDate.getTime())) {
          documentDate = parsedDate.toISOString().split('T')[0];
        }
      }
      
      return {
        documentNumber,
        applicant,
        applicantAddress,
        product,
        documentDate,
        rawContent: content
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw error;
    }
  }
}); 