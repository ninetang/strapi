
# 项目信息：
- Strapi 5.12.7 CMS 应用
- 使用 SQLite 数据库（better-sqlite3）
- 运行端口：1337

# 域名和服务：
- CMS 管理后台：belling-cms.jootang.cn（80端口）→ 反向代理到 127.0.0.1:1337
- 前端展示：belling.jootang.cn（8000端口）→ /var/www/bellingeel.com

  ---
需要你提供的信息

1. 腾讯云服务器信息

- 服务器IP地址是什么？
  - root@jootang.cn
- 服务器区域（如：北京、上海、广州）？
  - 广州
- 操作系统（如：Ubuntu 20.04、CentOS）？
  - TencentOS Server 3.1 (TK4) 
- 使用的是轻量应用服务器还是云服务器CVM？
  - 云服务器 CVM 标准型SA9 到期时间 2027-08-23 22:32:53

2. 数据库配置

- 使用的是 SQLite 吗？数据库文件存放在哪个路径？
  - 我猜是，文件存放我也不记得了，你能根据代码分析出来吗？
- 还是使用了云数据库（如 MySQL、PostgreSQL）？
  - 应该没用 云数据库（腾讯云数据库是要付费的）

3. SSL/HTTPS配置
 
- 域名是否配置了 SSL证书？
  - 没配置 证书
- 使用的是 Let's Encrypt 还是其他证书？
  - 无
- 证书存放路径和续期方式？
  - 无

4. 进程管理

- 使用什么管理 Strapi 进程（PM2、systemd、screen）？
  - 不清楚，要分析 node_modules 下的 strapi 目录吗？
- PM2 配置文件路径（如果有）？
  - 不清楚

5. 部署流程

- 代码如何上传到服务器（Git pull、FTP、rsync）？
  - 通过 webstorm 的 部署工具，还做了目录映射，你能查看到 .idea 目录下的配置文件吗？
- 构建流程是在本地还是服务器上执行？
  - 本地构建
- 重启应用的命令是什么？
  - 不清楚呀, `nginx -s reload` ? 

6. 前端项目

- /var/www/bellingeel.com 的前端项目是什么技术栈？
  - 参考工程 /Users/tigertang/WebstormProjects/Jootang/bellingeel.com 
    - 还有部署文档 bellingeel.com 根目录 docs/nginx-deployment-guide.md#L376-377
- 前端项目的代码仓库在哪里？
  - https://github.com/ninetang/jootang-ui-starter.git



# history
腾讯云的运行 history ，复制部分
```

350  EOF
  351  cat belling.conf
  352  nginx -t
  353  systemctl reload nginx
  354  curl -I -H "Host: bellingeel.com" http://localhost
  355  curl -L -I -H "Host: bellingeel.com" http://localhost
  356  curl -I -H "Host: bellingeel.com" http://localhost/some/path
  357  ps aux |grep nginx
  358  pm2 list
  359  ping www.bellingeel.com 
  360  pm2 lgos
  361  pm2 logs
  362  cd /etc/nginx/conf.d/ls -al 
  363  cd /etc/nginx/conf.d/
  364  ls -al 
  365  cd ../
  366  ls -al
  367  cd sites-available/
  368  ls -al
  369  cat belling.conf
  370  ls -la /etc/nginx/sites-available/ | grep bellingeel
  371  ls -la /etc/nginx/sites-available/
  372  cat /etc/nginx/sites-available/belling.conf
  373  cat /etc/nginx/sites-available/belling-cms.conf
  374  ls -la /etc/nginx/sites-enabled/ | grep belling
  375  systemctl status nginx
  376  pm2 status
  377  ls -la /var/www/bellingeel.com/
  378  curl -I http://www.bellingeel.com
  379  curl -I -H "Host: www.bellingeel.com" http://localhost
  380  curl -I -H "Host: bellingeel.com" http://localhost
  381  netstat -tlnp | grep :80
  382  tail -10 /var/log/nginx/error.log

```
