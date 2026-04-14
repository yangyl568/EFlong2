生成**两个一键更新脚本**：

1. **update-frontend.sh** → 前端一键更新（上传dist + 重启nginx）
2. **update-backend.sh** → 后端一键更新（拉代码 + 构建 + 重启pm2）

你**后期只需要执行这两个 sh 脚本**，就能全自动更新。

---

# 1. 前端一键更新脚本：`update-frontend.sh`

## 作用：

本地打包dist → 自动上传到服务器 → 自动重启nginx

### 在你**本地电脑**新建文件：`update-frontend.sh`

复制以下内容（**直接可用**）：

```sh
#!/bin/bash

# ===================== 前端自动更新脚本 =====================
# 作用：打包Vue项目 → 上传dist到服务器 → 重启Nginx
# ============================================================

# 【配置区】你只需要确认这里正确
LOCAL_DIST="./dist"                  # 本地打包后的dist目录
SERVER_USER="root"                   # 服务器用户
SERVER_IP="115.29.192.176"           # 服务器IP
SERVER_DIR="/data/www/vue-chat"      # 服务器前端目录（你现在的正确路径）

echo "==================================="
echo " 🚀 开始更新前端 vue-chat"
echo "==================================="

# 1. 打包
echo "📦 正在打包前端项目..."
npm run build

# 2. 上传到服务器
echo "☁️  正在上传 dist 到服务器..."
scp -r $LOCAL_DIST $SERVER_USER@$SERVER_IP:$SERVER_DIR/

# 3. 远程重启nginx
echo "🔄 正在重启 Nginx..."
ssh $SERVER_USER@$SERVER_IP "nginx -t && systemctl restart nginx"

echo "✅ 前端更新完成！"
```

## 使用方法（本地）

```bash
# 第一次加执行权限
chmod +x update-frontend.sh

# 以后更新只需要运行
./update-frontend.sh
```

---

# 2. 后端一键更新脚本：`update-backend.sh`

## 作用：

登录服务器 → 拉最新代码 → 安装依赖 → 构建 → 重启PM2

### 在你的**服务器**创建：`/data/project/update-backend.sh`

```sh
#!/bin/bash

# ===================== 后端自动更新脚本 =====================
# 作用：拉取最新代码 → 安装依赖 → 构建 → 重启PM2
# ============================================================

# 项目路径（你的真实路径）
PROJECT_DIR="/data/project/nest-server"

echo "==================================="
echo " 🚀 开始更新后端 nest-server"
echo "==================================="

# 进入项目目录
cd $PROJECT_DIR

# 1. 拉取最新代码
echo "🔄 正在拉取最新代码..."
git pull

# 2. 安装依赖
echo "📦 正在安装依赖..."
npm install

# 3. 构建
echo "🔨 正在构建项目..."
npm run build

# 4. 重启 PM2 服务
echo "♻️  正在重启后端服务..."
pm2 restart nest-server

echo "✅ 后端更新完成！"
```

## 服务器赋权 + 使用

```bash
chmod +x /data/project/update-backend.sh

# 以后更新后端只需要执行
cd /data/project
./update-backend.sh
```

---

# ✔ 最终效果

- **更新前端**：本地运行 `./update-frontend.sh`
- **更新后端**：服务器运行 `./update-backend.sh`

**全程全自动，不需要再手动操作任何步骤！**

