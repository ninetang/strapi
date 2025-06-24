export default (config, { strapi }) => {
  return async (ctx, next) => {
    // 检查是否是 license-limit-information 接口
    if (ctx.path === '/admin/license-limit-information' && ctx.method === 'GET') {
      // 设置响应状态码
      ctx.status = 200;
      
      // 设置响应头
      ctx.set('Content-Type', 'application/json');
      
      // 返回自定义的 license 信息
      ctx.body = {
        data: {
          enforcementUserCount: 22,
          currentActiveUserCount: 22,
          permittedSeats: 999999, // 设置很大的用户数限制
          shouldNotify: false,
          shouldStopCreate: false,
          licenseLimitStatus: "WITHIN_LIMIT", // 改为在限制内
          isHostedOnStrapiCloud: false,
          type: "gold", // 升级到 gold 版本
          features: [
            {
              name: "cms-content-history",
              options: {
                retentionDays: 365 // 增加保留天数
              }
            },
            {
              name: "cms-advanced-preview"
            },
            {
              name: "cms-content-releases",
              options: {
                maximumReleases: 999999
              }
            },
            // 添加更多企业级功能
            {
              name: "cms-advanced-workflows"
            },
            {
              name: "cms-advanced-permissions"
            },
            {
              name: "cms-advanced-analytics"
            }
          ]
        }
      };
      
      return; // 直接返回，不继续执行后续中间件
    }
    
    // 对于其他请求，继续正常流程
    await next();
  };
}; 
