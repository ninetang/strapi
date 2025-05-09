export default {
  excludeLoggers: [],
  level: 'debug',
  // 在控制台显示所有日志
  console: {
    level: 'debug',
    enabled: true,
  },
  // 同时将日志写入文件
  file: {
    level: 'debug',
    enabled: true,
    path: 'logs/strapi.log',
  }
}; 