module.exports = {
  apps: [
    {
      name: 'strapi-cms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/belling-cms.jootang.cn',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
        HOST: '0.0.0.0'
      },
      error_file: '/var/log/pm2/strapi-cms-error.log',
      out_file: '/var/log/pm2/strapi-cms-out.log',
      log_file: '/var/log/pm2/strapi-cms-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};