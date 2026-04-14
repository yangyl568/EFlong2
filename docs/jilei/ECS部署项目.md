# 🚀 阿里云ECS部署Vue前端+NestJS后端全流程指南

针对当前的ECS环境（Alibaba Cloud Linux 3.2104 LTS 64位、公网IP `xxx`）和安全组配置，提供一套**可直接复制执行**的完整部署方案，包含环境搭建、项目部署、反向代理、安全加固全流程。

---

## 一、先确认安全组配置（当前配置优化）

当前的安全组存在**高风险配置**，先做安全加固，再部署项目：

### 1. 高风险项整改

| 规则                    | 问题                                                      | 整改方案                                               |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| SSH(22) 开放0.0.0.0/0   | 暴力破解风险极高                                          | 仅开放自己的固定公网IP（可在阿里云安全组直接修改源IP） |
| RDP(3389) 开放0.0.0.0/0 | Linux系统不需要Windows远程桌面                            | 直接删除这条规则                                       |
| 3000端口开放0.0.0.0/0   | 后续Node服务端口，建议通过Nginx反向代理，关闭直接公网访问 | 后续部署后删除这条入方向规则                           |

### 2. 必须保留的规则

- `HTTP(80)`、`HTTPS(443)`：用于前端页面访问、HTTPS证书部署
- `SSH(22)`：仅开放自己的IP，用于服务器维护
- 后续NestJS后端接口：通过Nginx反向代理到443/80端口，无需额外开放端口

---

## 二、服务器环境搭建（一键执行）

通过SSH连接的ECS服务器，执行以下命令完成环境初始化：

### 1. 系统更新与基础工具安装

```bash
# 更新系统包
sudo dnf update -y

# 安装基础工具
sudo dnf install -y git wget curl vim nginx
```

### 2. 安装Node.js（LTS版本，适配NestJS/Vue）

```bash
# 安装nvm（Node版本管理器，方便后续升级）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 生效nvm环境变量
source ~/.bashrc

# 安装Node.js 20.x LTS（NestJS/Vue3推荐版本）
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装（输出版本号即成功）
node -v
npm -v
```

### 3. 安装pnpm（可选，加速依赖安装）

```bash
npm install -g pnpm
pnpm -v
```

### 4. 安装PM2（Node进程守护，保证服务后台运行）

```bash
npm install -g pm2
pm2 -v
```

---

## 三、后端项目（nest-server）部署

### 1. 拉取/上传项目到服务器

```bash
# 方式1：通过Git拉取（推荐）
cd /home
sudo mkdir -p /data/project
cd /data/project
git clone 的nest-server项目仓库地址

# 方式2：本地打包后上传（用scp命令，本地执行）
# scp -r ./nest-server root@xxx:/data/project/
```

### 2. 安装依赖、构建项目

```bash
cd /data/project/nest-server

# 安装依赖
pnpm install
# 或 npm install

# 构建项目（生成dist目录）
pnpm build
# 或 npm run build
```

### 3. 配置环境变量（关键！）

```bash
# 创建环境变量文件
vim .env
```

填入的后端配置（示例）：

```env
# 服务端口（建议用3000，后续Nginx反向代理）
PORT=3000
# 数据库地址、密钥等其他配置
# DATABASE_URL=xxx
# JWT_SECRET=xxx
```

### 4. PM2启动后端服务

```bash
# 启动服务（--name指定服务名，方便管理）
pm2 start dist/main.js --name nest-server

# 设置开机自启（服务器重启后自动恢复服务）
pm2 startup
pm2 save

# 查看服务状态（online即正常运行）
pm2 status
```

### 5. 验证后端服务

```bash
# 本地测试（服务器内执行）
curl http://localhost:3000/的健康检查接口
# 例如 curl http://localhost:3000/health
```

正常返回数据即后端服务启动成功。

---

## 四、前端项目（vue-chat）部署

### 1. 本地打包前端项目（关键！）

**在本地开发环境执行**，不要在服务器打包（服务器资源有限）：

```bash
# 进入vue-chat项目目录
cd /path/to/your/vue-chat

# 安装依赖
pnpm install
# 或 npm install

# 打包项目（生成dist目录）
pnpm build
# 或 npm run build
```

> 注意：打包前请修改`vite.config.ts`/`vue.config.js`中的`base`路径，确保接口请求地址正确：
>
> ```ts
> // vite.config.ts 示例
> export default defineConfig({
>   server: {
>     proxy: {
>       "/api": {
>         target: "http://xxx:3000", // 后端地址
>         changeOrigin: true,
>         rewrite: (path) => path.replace(/^\/api/, ""),
>       },
>     },
>   },
> });
> ```

### 2. 上传打包后的dist目录到服务器

**本地执行scp命令**：

```bash
# 上传dist目录到服务器的Nginx静态资源目录
scp -r ./dist root@xxx:/data/project/vue-chat/
```

> 服务器端提前创建目录：`sudo mkdir -p /data/project/vue-chat`

### 3. Nginx配置前端静态资源+反向代理后端接口

```bash
# 编辑Nginx配置文件
sudo vim /etc/nginx/conf.d/vue-chat.conf
```

填入以下配置（直接复制，按需修改）：

```nginx
# 前端静态资源服务
server {
    listen 80;
    server_name xxx; # 的公网IP，后续可替换为域名

    # 前端静态资源目录
    root /data/project/vue-chat/dist;
    index index.html;

    # 解决Vue History模式路由刷新404问题
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理后端接口（关键！）
    location /api/ {
        proxy_pass http://localhost:3000/; # 后端服务地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存配置（优化加载速度）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 启动Nginx并验证

```bash
# 检查Nginx配置是否正确
sudo nginx -t

# 重启Nginx生效配置
sudo systemctl restart nginx

# 设置Nginx开机自启
sudo systemctl enable nginx
```

---

## 五、访问验证

### 1. 前端访问

在浏览器输入：`http://xxx`，正常打开vue-chat页面即成功。

### 2. 后端接口访问

在浏览器/Postman输入：`http://xxx/api/的接口地址`，正常返回数据即反向代理成功。

---

## 六、安全加固与优化（必做）

### 1. 关闭服务器直接端口访问

部署完成后，**删除安全组中3000端口的入方向规则**，所有请求通过Nginx 80/443端口转发，避免后端服务直接暴露在公网。

### 2. 配置HTTPS（域名+SSL证书）

如果有域名，推荐配置HTTPS：

```bash
# 安装certbot，申请免费Let's Encrypt证书
sudo dnf install -y certbot python3-certbot-nginx

# 自动配置HTTPS（替换为的域名）
sudo certbot --nginx -d your-domain.com
```

certbot会自动修改Nginx配置，实现HTTPS访问、自动续期。

### 3. 服务器安全加固

```bash
# 禁用root远程登录（用普通用户+sudo操作）
sudo vim /etc/ssh/sshd_config
# 修改：PermitRootLogin no
# 重启SSH服务：sudo systemctl restart sshd

# 配置防火墙（Alibaba Cloud Linux默认用firewalld）
sudo systemctl start firewalld
sudo systemctl enable firewalld
# 开放80、443、22端口（仅开放必要端口）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### 4. 性能优化

- **Nginx优化**：修改`/etc/nginx/nginx.conf`，调整worker进程、连接数等参数
- **Node.js优化**：PM2配置集群模式，充分利用服务器CPU：
  ```bash
  pm2 start dist/main.js --name nest-server -i max
  ```
- **前端优化**：开启Gzip压缩、CDN加速静态资源

---

## 七、常见问题排查

### 1. 前端页面404

- 检查Nginx `root` 路径是否正确（必须指向dist目录）
- 检查Vue History模式的`try_files`配置是否正确
- 检查Nginx是否正常运行：`sudo systemctl status nginx`

### 2. 后端接口502/504

- 检查PM2中nest-server是否为`online`状态：`pm2 status`
- 检查后端服务是否正常：`curl http://localhost:3000/health`
- 检查Nginx反向代理配置是否正确（`proxy_pass`地址是否为`localhost:3000`）

### 3. 端口占用问题

```bash
# 查看端口占用
sudo lsof -i :3000
# 杀死占用进程
sudo kill -9 进程ID
```

---

## 八、后续维护命令

### PM2常用命令

```bash
# 查看服务日志
pm2 logs nest-server

# 重启服务
pm2 restart nest-server

# 停止服务
pm2 stop nest-server

# 查看服务监控
pm2 monit
```

### Nginx常用命令

```bash
# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 💡 补充说明

- 如果没有域名，直接用公网IP访问即可，后续绑定域名后只需修改Nginx的`server_name`
- 数据库（如MySQL、MongoDB）建议部署在同一台服务器，通过内网访问，不要开放公网端口
- 后续项目更新：前端重新打包上传dist目录，重启Nginx；后端拉取最新代码、重新构建，PM2重启服务

## 九、一键部署脚本（可选）

看下一章节

## 遇到的问题

后端服务统一采用的是 /api/xxx/xxx 的形式，所以需要在Nginx中配置反向代理，将/api/xxx/xxx的请求转发到后端服务。

前端需要配合去修改请求地址，将请求地址从 /xxx/xxx 改为 /api/xxx/xxx

### Nginx配置示例(这个很重要，我就在这里被踩坑了)

```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
}
```

## 终止了相关进程

```bash
lsof -ti:3008 | xargs kill -9
```
