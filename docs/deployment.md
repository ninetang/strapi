# Strapi CMS 部署文档

本文档记录了 Strapi CMS 在腾讯云服务器的部署配置信息和操作流程。

## 目录

- [服务器信息](#服务器信息)
- [应用架构](#应用架构)
- [数据库配置](#数据库配置)
- [Nginx 配置](#nginx-配置)
- [进程管理](#进程管理)
- [部署流程](#部署流程)
- [常用运维命令](#常用运维命令)
- [故障排查](#故障排查)

---

## 服务器信息

### 腾讯云 CVM

- **服务器地址**: `root@jootang.cn`
- **区域**: 广州
- **操作系统**: TencentOS Server 3.1 (TK4)
- **服务器类型**: 云服务器 CVM 标准型 SA9
- **到期时间**: 2027-08-23 22:32:53

### SSH 连接

```bash
ssh root@jootang.cn
```

> 💡 WebStorm 已配置自动部署，使用 SSH Key 认证

---

## 应用架构

### 服务部署概览

```
┌─────────────────────────────────────────────────────┐
│              腾讯云 CVM (jootang.cn)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Nginx (80, 8000)                             │  │
│  └──────────────┬───────────────────────────────┘  │
│                 │                                   │
│  ┌──────────────▼───────────────┐                  │
│  │ belling-cms.jootang.cn:80    │                  │
│  │ → 127.0.0.1:1337 (Strapi)    │                  │
│  └──────────────────────────────┘                  │
│                                                     │
│  ┌──────────────────────────────┐                  │
│  │ belling.jootang.cn:8000      │                  │
│  │ → /var/www/bellingeel.com    │                  │
│  │   (前端静态文件)               │                  │
│  └──────────────────────────────┘                  │
│                                                     │
│  ┌──────────────────────────────┐                  │
│  │ PM2 进程管理                  │                  │
│  │ ├─ Strapi (1337)             │                  │
│  └──────────────────────────────┘                  │
│                                                     │
│  ┌──────────────────────────────┐                  │
│  │ SQLite 数据库                 │                  │
│  │ /var/www/belling-cms.jootang.│                  │
│  │ cn/.tmp/data.local.db        │                  │
│  └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────┘
```

### 目录结构

```
/var/www/
├── belling-cms.jootang.cn/          # Strapi CMS 应用目录
│   ├── node_modules/
│   ├── dist/                        # 构建产物
│   ├── config/                      # 配置文件
│   ├── src/                         # 源代码
│   ├── .tmp/                        # 临时文件和数据库
│   │   └── data.local.db           # SQLite 数据库文件
│   ├── .env                         # 环境变量
│   └── package.json
│
└── bellingeel.com/                  # 前端静态文件目录
    └── index.html

/etc/nginx/
├── sites-available/
│   ├── belling.conf                 # 前端站点配置
│   └── belling-cms.conf             # CMS 站点配置
└── sites-enabled/                   # 软链接到 sites-available
```

---

## 数据库配置

### SQLite 数据库

项目使用 SQLite 数据库（`better-sqlite3`），无需独立数据库服务。

**数据库文件位置**:
```
/var/www/belling-cms.jootang.cn/.tmp/data.local.db
```

**配置文件**: `config/database.ts:47`

```typescript
sqlite: {
  connection: {
    filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.local.db')),
  },
  useNullAsDefault: true,
}
```

### 环境变量

`.env` 文件中的数据库相关配置：

```bash
# 使用 SQLite，以下配置留空
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.local.db
```

### 数据库备份

```bash
# 备份数据库
cp /var/www/belling-cms.jootang.cn/.tmp/data.local.db \
   /var/www/belling-cms.jootang.cn/.tmp/data.local.db.backup-$(date +%Y%m%d)

# 定期备份（可添加到 crontab）
0 2 * * * cp /var/www/belling-cms.jootang.cn/.tmp/data.local.db \
          /var/www/belling-cms.jootang.cn/.tmp/data.local.db.backup-$(date +\%Y\%m\%d)
```

---

## Nginx 配置

### CMS 管理后台配置

**文件**: `/etc/nginx/sites-available/belling-cms.conf`

```nginx
server {
    listen 80;
    server_name belling-cms.jootang.cn;

    access_log /var/log/nginx/belling-cms.access.log;
    error_log /var/log/nginx/belling-cms.error.log;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 前端站点配置

**文件**: `/etc/nginx/sites-available/belling.conf`

```nginx
server {
    listen 8000;
    server_name belling.jootang.cn 0.0.0.0;

    location / {
        root /var/www/bellingeel.com;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 启用配置

```bash
# 创建软链接（如果尚未创建）
ln -s /etc/nginx/sites-available/belling-cms.conf /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/belling.conf /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 访问地址

- **CMS 管理后台**: http://belling-cms.jootang.cn
- **前端展示站**: http://belling.jootang.cn:8000

> ⚠️ **注意**: 当前未配置 SSL 证书，使用 HTTP 协议

---

## 进程管理

### PM2 管理 Strapi

使用 PM2 管理 Strapi 进程，保证应用持续运行和自动重启。

#### 启动 Strapi

```bash
# 进入应用目录
cd /var/www/belling-cms.jootang.cn

# 使用 PM2 启动（推荐使用配置文件）
pm2 start ecosystem.config.js

# 或者直接启动
pm2 start npm --name "strapi-cms" -- start
```

#### PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看进程状态
pm2 status

# 查看日志
pm2 logs

# 查看特定应用日志
pm2 logs strapi-cms

# 重启应用
pm2 restart strapi-cms

# 停止应用
pm2 stop strapi-cms

# 删除应用
pm2 delete strapi-cms

# 保存 PM2 配置（开机自启）
pm2 save

# 生成开机启动脚本
pm2 startup
```

#### 监控和调试

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show strapi-cms

# 重载应用（0秒停机）
pm2 reload strapi-cms
```

---

## 部署流程

### 1. 本地开发

```bash
# 开发模式
npm run dev

# 构建
npm run build
```

### 2. 通过 WebStorm 部署

项目已配置 WebStorm 自动部署工具（`.idea/deployment.xml`）。

**配置信息**:
- **服务器**: `root@jootang.cn:22` (SSH Key 认证)
- **本地目录** → **远程目录**:
  - `$PROJECT_DIR$` → `/var/www/belling-cms.jootang.cn/`
  - `$PROJECT_DIR$/cloud.tencent/nginx/sites-available` → `/etc/nginx/sites-available`
- **排除目录**: `node_modules/`
- **传输方式**: SFTP with rsync

**部署步骤**:

1. 在 WebStorm 中右键项目文件夹
2. 选择 `Deployment` → `Upload to jootang.cn`
3. WebStorm 会自动同步文件到服务器

### 3. 服务器端操作

```bash
# SSH 连接服务器
ssh root@jootang.cn

# 进入应用目录
cd /var/www/belling-cms.jootang.cn

# 如果是首次部署，安装依赖
npm install --production

# 重启应用
pm2 restart strapi-cms

# 如果修改了 Nginx 配置
nginx -t && systemctl reload nginx
```

### 4. 验证部署

```bash
# 检查 PM2 进程状态
pm2 status

# 检查 Nginx 状态
systemctl status nginx

# 检查端口监听
netstat -tlnp | grep :1337
netstat -tlnp | grep :80

# 测试 CMS 访问
curl -I http://belling-cms.jootang.cn

# 测试前端访问
curl -I http://belling.jootang.cn:8000

# 查看日志
pm2 logs strapi-cms --lines 50
tail -f /var/log/nginx/belling-cms.access.log
tail -f /var/log/nginx/belling-cms.error.log
```

---

## 常用运维命令

### 系统监控

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看应用目录大小
du -sh /var/www/belling-cms.jootang.cn

# 查看进程
ps aux | grep node
ps aux | grep nginx
```

### 日志管理

```bash
# PM2 日志
pm2 logs
pm2 logs strapi-cms --lines 100

# Nginx 访问日志
tail -f /var/log/nginx/belling-cms.access.log

# Nginx 错误日志
tail -f /var/log/nginx/belling-cms.error.log

# 清理 PM2 日志
pm2 flush
```

### 应用维护

```bash
# 重启 Strapi
pm2 restart strapi-cms

# 重启 Nginx
systemctl restart nginx

# 查看 Strapi 配置
cat /var/www/belling-cms.jootang.cn/.env

# 备份数据库
cp /var/www/belling-cms.jootang.cn/.tmp/data.local.db \
   ~/backups/strapi-db-$(date +%Y%m%d-%H%M%S).db
```

---

## 故障排查

### CMS 无法访问

```bash
# 1. 检查 PM2 进程状态
pm2 status

# 2. 查看 Strapi 日志
pm2 logs strapi-cms --lines 50

# 3. 检查端口监听
netstat -tlnp | grep :1337

# 4. 手动启动测试
cd /var/www/belling-cms.jootang.cn
npm start

# 5. 检查 Nginx 配置
nginx -t
systemctl status nginx

# 6. 查看 Nginx 错误日志
tail -f /var/log/nginx/belling-cms.error.log
```

### 502 Bad Gateway

通常是 Strapi 未启动或崩溃导致：

```bash
# 重启 Strapi
pm2 restart strapi-cms

# 查看日志
pm2 logs strapi-cms
```

### 数据库问题

```bash
# 检查数据库文件
ls -lh /var/www/belling-cms.jootang.cn/.tmp/data.local.db

# 检查权限
chmod 644 /var/www/belling-cms.jootang.cn/.tmp/data.local.db

# 从备份恢复
cp ~/backups/strapi-db-YYYYMMDD.db \
   /var/www/belling-cms.jootang.cn/.tmp/data.local.db
pm2 restart strapi-cms
```

### 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理 PM2 日志
pm2 flush

# 清理旧日志文件
find /var/log/nginx -name "*.log.*" -mtime +30 -delete

# 清理 npm 缓存
npm cache clean --force
```

---

## 相关资源

### 项目信息

- **Strapi 版本**: 5.12.7
- **Node.js 版本要求**: >=18.0.0 <=22.x.x
- **包管理器**: npm >=6.0.0

### 相关项目

- **前端项目仓库**: https://github.com/ninetang/jootang-ui-starter.git
- **前端本地路径**: `/Users/tigertang/WebstormProjects/Jootang/bellingeel.com`
- **前端部署文档**: `bellingeel.com/docs/nginx-deployment-guide.md`

### 环境变量说明

参考 `.env.example` 文件，主要配置项：

```bash
# 服务器配置
HOST=0.0.0.0
PORT=1337

# 密钥配置（生产环境必须修改）
APP_KEYS="your-app-keys"
API_TOKEN_SALT="your-api-token-salt"
ADMIN_JWT_SECRET="your-admin-jwt-secret"
TRANSFER_TOKEN_SALT="your-transfer-token-salt"
JWT_SECRET="your-jwt-secret"

# 数据库配置
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.local.db
```

---

## 待办事项

### 安全性改进

- [ ] 配置 SSL/TLS 证书（Let's Encrypt）
- [ ] 修改生产环境密钥（APP_KEYS, JWT_SECRET 等）
- [ ] 配置防火墙规则
- [ ] 启用 Fail2ban 防止暴力破解

### 监控和备份

- [ ] 配置自动数据库备份（crontab）
- [ ] 设置服务器监控告警
- [ ] 配置日志轮转

### 性能优化

- [ ] 启用 Nginx Gzip 压缩
- [ ] 配置静态资源缓存
- [ ] 考虑使用 CDN

---

**文档更新时间**: 2026-04-12
**维护人员**: TigerTang