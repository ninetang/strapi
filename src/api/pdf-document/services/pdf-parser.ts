import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

interface FileData {
  url: string;
  hash: string;
}

// console.log('PDF Parser service file loaded!');

export default () => ({
  async parsePDF(fileData: FileData) {
    // console.log('=== PDF Parser Started ===');
    // console.log('File Data:', JSON.stringify(fileData, null, 2));
    
    try {
      const { url, hash } = fileData;
      
      // 获取文件的物理路径
      const filePath = path.join(process.cwd(), 'public', url);
      // console.log('Attempting to read file from:', filePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist at path:', filePath);
        throw new Error('PDF file not found');
      }
      
      // 读取 PDF 文件
      const dataBuffer = fs.readFileSync(filePath);
      // console.log('File read successfully, size:', dataBuffer.length, 'bytes');
      
      const pdfData = await pdfParse(dataBuffer);
      // console.log('PDF parsed successfully, text length:', pdfData.text.length);
      
      // 提取文本内容
      const content = pdfData.text;
      console.log('Extracted text content:', content);
      
      // 解析各个字段
      const extractField = (pattern: RegExp, text: string) => {
        const match = text.match(pattern);
        console.log('Extracting field with pattern:', pattern, 'Result:', match ? match[1].trim() : null);
        return match ? match[1].trim() : null;
      };
      
      // 解析 Model Number 字段，返回字符串数组
      const extractModelNumbers = (text: string): string[] => {
        // 匹配 ModelNumber: 或 Model Number: 两种格式
        const pattern = /Model\s*Number:\s*([^]*?)(?=\n\s*[A-Z][a-z]+:|$)/i;
        const match = text.match(pattern);
        console.log('Extracting Model Numbers with pattern:', pattern, 'Result:', match ? match[1].trim() : null);
        
        if (!match || !match[1].trim()) {
          return []; // 如果没有匹配或内容为空，返回空数组
        }
        
        const modelNumbersText = match[1].trim();
        // 按逗号分割，然后清理每个型号
        const modelNumbers = modelNumbersText
          .split(',')
          .map(model => model.trim())
          .filter(model => model.length > 0); // 过滤掉空字符串
        
        console.log('Parsed model numbers:', modelNumbers);
        return modelNumbers;
      };
      
      // 定义提取规则
      const documentNumber = extractField(/No\.:?\s*(.*?)(?:\n|$)/i, content);
      const applicant = extractField(/Applicant:\s*(.*?)(?:\n|$)/i, content);
      const applicantAddress = extractField(/Address:\s*(.*?)(?:\n|$)/i, content);
      const productModel = extractField(/Address:\s*(.*?)(?:\n|$)/i, content);
      const product = extractField(/Product:\s*(.*?)(?:\n|$)/i, content);
      const dateMatch = extractField(/Date:\s*(.*?)(?:\n|$)/i, content);
      const testStandard = extractField(/Tested according to:\s*(.*?)(?:\n|$)/i, content);
      
      // 解析 Model Numbers
      const modelNumbers = extractModelNumbers(content);


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
        modelNumbers,
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
