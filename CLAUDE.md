# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 **Strapi 5.12.7** CMS 应用，用于管理内容和 PDF 文档。应用包含自定义的 PDF 解析功能，部署在腾讯云上，使用 SQLite 数据库。

**技术栈：**
- Strapi 5.12.7 (Headless CMS)
- TypeScript
- SQLite (better-sqlite3)
- Node.js 18-22
- React (管理面板定制)

## 开发命令

### 本地开发

```bash
# 启动开发服务器（自动重载）
npm run dev

# 启动开发服务器（别名）
npm run develop

# 构建生产版本
npm run build

# 启动生产服务器（需要先构建）
npm start

# 打开 Strapi 控制台
npm run console

# 填充示例数据
npm run seed:example
```

### 升级命令

```bash
# 检查可用的升级
npm run upgrade:dry

# 升级 Strapi 到最新版本
npm run upgrade
```

## 架构

### 目录结构

```
src/
├── api/                          # 内容类型和 API 端点
│   ├── pdf-document/            # PDF 文档内容类型（自定义）
│   │   ├── content-types/
│   │   │   └── pdf-document/
│   │   │       ├── schema.json  # 数据模型定义
│   │   │       └── lifecycles.ts # 创建/更新时自动解析
│   │   ├── services/
│   │   │   ├── pdf-parser.ts    # PDF 解析逻辑
│   │   │   └── pdf-document.ts  # 服务方法
│   │   ├── controllers/         # API 处理器
│   │   └── routes/              # 路由定义
│   ├── article/                 # 博客文章
│   ├── author/                  # 作者
│   ├── category/                # 分类
│   ├── about/                   # 关于页面
│   └── global/                  # 全局设置
│
├── components/shared/           # 可复用的内容组件
│   ├── media.json
│   ├── quote.json
│   ├── seo.json
│   ├── rich-text.json
│   └── slider.json
│
├── admin/                       # 管理面板定制
│   ├── app.tsx                  # 管理面板定制入口
│   └── vite.config.example.ts
│
├── middlewares/                 # 自定义中间件
│   └── license-override.ts      # 许可证限制绕过
│
└── index.ts                     # Strapi 应用入口

config/
├── database.ts                  # 数据库配置（SQLite）
├── server.ts                    # 服务器设置（host, port）
├── middlewares.ts               # 中间件注册
├── admin.ts                     # 管理面板配置
├── api.ts                       # API 设置
├── logger.ts                    # 日志配置
└── plugins.ts                   # 插件配置
```

### 核心架构模式

#### 1. PDF 文档自动解析系统

PDF 文档内容类型（`api::pdf-document`）在文件上传时实现自动 PDF 解析：

**流程：**
1. 用户通过管理面板上传 PDF → `documentFile` 字段
2. **生命周期钩子**（`lifecycles.ts`）在 `beforeCreate`/`beforeUpdate` 时触发
3. **PDF 解析服务**（`pdf-parser.ts`）从 `public/` 目录读取 PDF
4. 解析器使用正则表达式提取结构化数据：
   - 文档编号（Document Number）
   - 申请人（Applicant）
   - 申请人地址（Applicant Address）
   - 产品（Product）
   - 文档日期（Document Date）
   - **型号列表**（Model Numbers）（字符串数组，逗号分隔）
   - 原始内容（Raw Content）（全文，标记为私有）
5. 解析的数据**自动合并**到内容类型字段中
6. 数据保存到 SQLite 数据库

**重要文件：**
- `src/api/pdf-document/content-types/pdf-document/lifecycles.ts:18-38` - beforeCreate 钩子
- `src/api/pdf-document/services/pdf-parser.ts:13-129` - PDF 解析逻辑
- `src/api/pdf-document/content-types/pdf-document/schema.json` - Schema 定义

**关键实现细节：**
- 使用 `pdf-parse` 库从 PDF 提取文本
- 文件路径解析：`public/ + fileData.url`
- 型号列表以 JSON 数组形式存储在数据库
- 所有解析在创建/更新操作期间同步进行
- 包含大量 console 日志用于调试（生产环境可移除）

#### 2. 自定义中间件系统

**许可证覆盖中间件**（`src/middlewares/license-override.ts`）：
- 拦截 `/admin/license-limit-information` 端点
- 返回模拟的 "gold" 许可证功能以绕过 Strapi Cloud 限制
- 在 `config/middlewares.ts:12` 中注册为 `'global::license-override'`

**添加自定义中间件：**
1. 在 `src/middlewares/` 创建文件
2. 导出默认函数，签名：`(config, { strapi }) => async (ctx, next) => {...}`
3. 在 `config/middlewares.ts` 中注册，格式：`'global::middleware-name'`

#### 3. 数据库配置

使用 **SQLite** 基于文件的存储（无需外部数据库）。

**数据库文件位置：**
- 开发/生产环境：`.tmp/data.local.db`（相对于项目根目录）
- 配置文件：`config/database.ts:47`

**切换数据库：**
数据库配置支持通过环境变量使用 MySQL 和 PostgreSQL：
- 在 `.env` 中设置 `DATABASE_CLIENT` 为 `mysql` 或 `postgres`
- 在 `.env` 中提供连接详情（参考 `.env.example`）

#### 4. 内容类型结构

所有内容类型遵循 Strapi 的标准结构：
```
src/api/<content-type-name>/
├── content-types/<content-type-name>/
│   ├── schema.json           # 数据模型（字段、关系、选项）
│   └── lifecycles.ts         # 可选：钩子（beforeCreate, afterCreate 等）
├── controllers/
│   └── <content-type-name>.ts  # API 请求处理器
├── services/
│   └── <content-type-name>.ts  # 业务逻辑
└── routes/
    └── <content-type-name>.ts  # 路由定义
```

**可用的内容类型：**
- `pdf-document` - 自定义的自动解析功能
- `article`, `author`, `category` - 博客功能
- `about`, `global` - 静态内容

## TypeScript 配置

- **服务器代码**：使用 CommonJS 模块（`tsconfig.json`）
- **管理面板**：有独立的 `src/admin/tsconfig.json`
- 构建输出：`dist/` 目录
- 类型检查：`strict: false` 以适应 Strapi 类型

**重要的排除项：**
- `src/admin/` 从服务器编译中排除
- `src/plugins/` 排除（如果添加了插件）

## 处理 PDF 文档

### 添加新的提取字段

要从 PDF 中提取额外字段：

1. **在 schema 中添加字段**（`src/api/pdf-document/content-types/pdf-document/schema.json`）：
```json
"attributes": {
  "newField": {
    "type": "string",
    "required": false
  }
}
```

2. **更新解析器**（`src/api/pdf-document/services/pdf-parser.ts`）：
```typescript
const newField = extractField(/NewPattern:\s*(.*?)(?:\n|$)/i, content);

return {
  // ... 现有字段
  newField,
};
```

3. Strapi 会在下次构建时自动生成 TypeScript 类型

### 自定义正则表达式模式

`extractField` 函数使用正则表达式匹配 PDF 文本模式。常见模式：

```typescript
// 简单字段："标签: 值"
/Label:\s*(.*?)(?:\n|$)/i

// 多行字段（直到下一个标签）
/Label:\s*([^]*?)(?=\n\s*[A-Z][a-z]+:|$)/i

// 日期格式
/Date:\s*(\d{4}-\d{2}-\d{2})/
```

## 环境配置

关键环境变量（`.env`）：

```bash
# 服务器
HOST=0.0.0.0
PORT=1337

# 密钥（生产环境必须修改）
APP_KEYS="key1,key2"
API_TOKEN_SALT=your-token-salt
ADMIN_JWT_SECRET=your-admin-secret
TRANSFER_TOKEN_SALT=your-transfer-salt
JWT_SECRET=your-jwt-secret

# 数据库（默认 SQLite）
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.local.db
```

**安全提示：** `.env.example` 中的所有密钥都是占位符。使用以下命令为生产环境生成新密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 部署

### 生产部署（腾讯云）

详细信息参见 [docs/deployment.md](./docs/deployment.md)。

**快速参考：**
- **服务器**：root@jootang.cn（TencentOS Server 3.1）
- **部署方式**：WebStorm SFTP with rsync
- **远程路径**：`/var/www/belling-cms.jootang.cn/`
- **进程管理器**：PM2（通过 `ecosystem.config.js`）
- **Web 服务器**：Nginx（反向代理 80 端口 → 1337）

**部署步骤：**
1. 本地构建：`npm run build`
2. 通过 WebStorm 上传（Tools → Deployment → Upload to jootang.cn）
3. SSH 连接服务器：`ssh root@jootang.cn`
4. 重启应用：`pm2 restart strapi-cms`

**PM2 管理：**
```bash
pm2 list              # 查看运行的进程
pm2 logs strapi-cms   # 查看日志
pm2 restart strapi-cms # 重启应用
pm2 start ecosystem.config.js  # 使用配置文件启动
```

### 构建流程

**本地构建**（部署前）：
```bash
npm run build
```

这会编译：
- TypeScript → JavaScript（到 `dist/`）
- 管理面板（React 应用）
- 服务器代码

**不要**提交 `dist/` 或 `.tmp/` 目录。

## 常见任务

### 创建新的内容类型

使用 Strapi CLI 或管理面板：

```bash
# 通过 CLI
npm run strapi generate

# 然后选择 "content-type"
```

或通过管理面板创建：Content-Type Builder → Create new collection type

### 添加自定义 API 路由

1. 在 `src/api/<name>/routes/<name>.ts` 中定义路由：
```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/<name>/custom',
      handler: '<name>.customAction',
    }
  ]
}
```

2. 在控制器中实现处理器：
```typescript
// src/api/<name>/controllers/<name>.ts
export default factories.createCoreController('api::<name>.<name>', ({ strapi }) => ({
  async customAction(ctx) {
    // 你的逻辑
    return { data: 'result' };
  }
}));
```

### 访问 Strapi 服务

在生命周期钩子或控制器中：

```typescript
// 获取服务
const service = strapi.service('api::pdf-document.pdf-parser');

// 使用服务方法
const result = await service.parsePDF(fileData);
```

## 开发注意事项

### 日志

代码库中有大量 `console.log` 语句用于调试（特别是在 PDF 解析器和生命周期中）。生产环境可以移除或替换为 Strapi 的日志器：

```typescript
strapi.log.info('Message');
strapi.log.error('Error', error);
```

### TypeScript Ignores

某些文件使用 `// @ts-ignore` 来绕过 Strapi 全局 `strapi` 对象的类型检查。这在 Strapi 项目中很正常。

### 热重载

`npm run dev` 命令会监视变化并自动重载：
- 服务器代码变化 → 服务器重启
- 管理面板变化 → 浏览器热重载
- Schema 变化 → 可能需要手动重启

## 故障排查

### PDF 解析不工作

1. 检查文件是否存在于 `public/` 目录
2. 查看日志：`pm2 logs strapi-cms`（生产环境）或控制台输出（开发环境）
3. 验证生命周期钩子是否触发：检查控制台中的 "beforeCreate TRIGGERED"
4. 测试 PDF 结构：确保模式匹配你的 PDF 格式

### 数据库问题

```bash
# SQLite 文件位置
ls -lh .tmp/data.local.db

# 备份数据库
cp .tmp/data.local.db .tmp/data.local.db.backup

# 重置数据库（警告：销毁所有数据）
rm -rf .tmp/data.local.db
npm run dev  # 会重新创建数据库
```

### 构建错误

```bash
# 清理构建产物
rm -rf dist/ .cache/ .tmp/

# 重新构建
npm run build
```

## 相关文档

- [部署指南](./docs/deployment.md) - 腾讯云生产部署
- [Strapi 文档](https://docs.strapi.io) - 官方 Strapi 文档
- `.env.example` - 环境变量参考