# AI-Codereview-Gitlab 使用教程

## 查看步骤

以下是在 Mac M1 上通过 Docker 远程部署 Git 项目的步骤：

### 1. 首先登录远程服务器

```bash
ssh username@47.120.34.18
```

(将 `username` 替换为你的实际用户名，系统会提示输入密码)

### 2. 在服务器上安装 Docker（如果尚未安装）

```bash
# 对于 CentOS/RHEL:
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# 对于 Ubuntu/Debian:
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. 克隆项目并创建 Dockerfile

```bash
git clone https://github.com/sunmh207/AI-Codereview-Gitlab.git
cd AI-Codereview-Gitlab
```

创建一个 Dockerfile（如果项目没有提供）：

```dockerfile
# 使用适合项目的基础镜像，例如Python
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖（根据项目实际需求修改）
RUN pip install -r requirements.txt

# 暴露端口（根据项目实际需求修改）
EXPOSE 8000

# 启动命令（根据项目实际需求修改）
CMD ["python", "app.py"]
```

### 4. 构建并运行 Docker 容器

```bash
# 构建镜像
docker build -t ai-codereview .

# 运行容器（根据项目需求调整端口映射和参数）
docker run -d -p 8000:8000 --name ai-review ai-codereview
```

### 5. 验证容器是否运行

```bash
docker ps
```

### 替代方案：如果项目已有 docker-compose.yml

如果项目包含 docker-compose.yml 文件，只需运行：

```bash
docker-compose up -d
```

### 注意事项：

1. 确保服务器防火墙开放了所需端口（如 8000）
2. M1 Mac 可能需要确保服务器上的 Docker 镜像与 ARM 架构兼容
3. 根据项目实际需求调整 Dockerfile 中的命令
4. 如果项目需要数据库或其他服务，可能需要额外配置

### 如果需要在本地构建镜像再推送到服务器：

1. 本地构建（确保使用 ARM 兼容镜像）：

```bash
docker buildx build --platform linux/amd64 -t ai-codereview .
```

2. 推送到 Docker Hub：

```bash
docker tag ai-codereview yourusername/ai-codereview
docker push yourusername/ai-codereview
```

3. 在服务器上拉取并运行：

```bash
docker pull yourusername/ai-codereview
docker run -d -p 8000:8000 yourusername/ai-codereview
```
