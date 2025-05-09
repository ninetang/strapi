import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface FileData {
  url: string;
  hash: string;
}

console.log('PDF Parser service file loaded!');

export default () => ({
  async parsePDF(fileData: FileData) {
    console.log('=== PDF Parser Started ===');
    console.log('File Data:', JSON.stringify(fileData, null, 2));
    
    try {
      const { url, hash } = fileData;
      
      // 获取文件的物理路径
      const filePath = path.join(process.cwd(), 'public', url);
      console.log('Attempting to read file from:', filePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist at path:', filePath);
        throw new Error('PDF file not found');
      }
      
      // 读取 PDF 文件
      const dataBuffer = fs.readFileSync(filePath);
      console.log('File read successfully, size:', dataBuffer.length, 'bytes');
      
      const pdfData = await pdfParse(dataBuffer);
      console.log('PDF parsed successfully, text length:', pdfData.text.length);
      
      // 提取文本内容
      const content = pdfData.text;
      console.log('Extracted text content:', content);
      
      // 解析各个字段
      const extractField = (pattern: RegExp, text: string) => {
        const match = text.match(pattern);
        console.log('Extracting field with pattern:', pattern, 'Result:', match ? match[1].trim() : null);
        return match ? match[1].trim() : null;
      };
      
      // 定义提取规则
      const documentNumber = extractField(/No\.\s*(.*?)(?:\n|$)/i, content);
      const applicant = extractField(/Applicant:\s*(.*?)(?:\n|$)/i, content);
      const applicantAddress = extractField(/Address:\s*(.*?)(?:\n|$)/i, content);
      const product = extractField(/Product:\s*(.*?)(?:\n|$)/i, content);
      const dateMatch = extractField(/Date:\s*(.*?)(?:\n|$)/i, content);
      
      // 改进的日期解析逻辑
      let documentDate = null;
      if (dateMatch) {
        console.log('Raw date string:', dateMatch);
        // 处理类似 "2023-04-25" 格式的日期
        if (dateMatch.match(/^\d{4}-\d{2}-\d{2}$/)) {
          documentDate = dateMatch;
        } else {
          // 处理其他可能的日期格式
          const cleanDateStr = dateMatch.replace(/‐/g, '-'); // 处理特殊的连字符
          const dateParts = cleanDateStr.split(/[-\/]/); // 支持 - 或 / 作为分隔符
          
          if (dateParts.length === 3) {
            const year = dateParts[0].length === 4 ? dateParts[0] : `20${dateParts[0]}`;
            const month = dateParts[1].padStart(2, '0');
            const day = dateParts[2].padStart(2, '0');
            documentDate = `${year}-${month}-${day}`;
          }
        }
        console.log('Date parsing steps:', {
          dateMatch,
          cleanDate: dateMatch.replace(/‐/g, '-'),
          finalResult: documentDate
        });
      }
      
      const result = {
        documentNumber,
        applicant,
        applicantAddress,
        product,
        documentDate,
        rawContent: content
      };
      
      console.log('=== PDF Parser Result ===');
      console.log(JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('=== PDF Parser Error ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}); 