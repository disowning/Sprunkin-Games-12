# 1Panel 部署指南

本指南将帮助你在 1Panel 上使用 Docker 和 docker-compose 部署 Sprunkin 游戏平台。

## 前提条件

1. 已安装并配置好 1Panel
2. 已在 1Panel 中安装 Docker 和 Docker Compose 应用
3. 已在 1Panel 中创建 MySQL 数据库（或使用外部数据库）

## 部署步骤

### 1. 准备项目文件

1. 通过 1Panel 的 SFTP 或文件管理器，将项目文件上传到服务器，例如 `/www/sprunkin`
2. 确保项目文件夹中包含 `Dockerfile` 和 `docker-compose.yml` 文件

### 2. 创建数据库

1. 在 1Panel 的应用商店中找到 MySQL 应用并安装
2. 创建数据库 `jx099`
3. 创建用户并设置密码，记下凭据

### 3. 修改环境变量

1. 编辑 `docker-compose.yml` 文件，确保环境变量正确设置：

```yaml
environment:
  - DATABASE_URL=mysql://username:password@host:port/database
  - NEXTAUTH_URL=https://yourdomain.com
  - NEXTAUTH_SECRET=your-random-secret
```

替换以下内容：
- `username`: 数据库用户名
- `password`: 数据库密码
- `host`: 数据库主机名（1Panel 中的 MySQL 容器名称，如 `1Panel-mysql-eaGN`）
- `port`: 数据库端口（通常为 3306）
- `database`: 数据库名称
- `yourdomain.com`: 你的域名
- `your-random-secret`: 生成一个随机字符串作为 NextAuth 密钥

### 4. 创建数据持久化目录

在项目目录中创建所需的持久化目录：

```bash
mkdir -p uploads prisma
chmod 777 uploads
```

### 5. 使用 Docker Compose 部署

1. 通过 1Panel 的 Docker Compose 管理界面，导入项目目录中的 `docker-compose.yml` 文件
2. 或者在终端中运行以下命令：

```bash
cd /www/sprunkin
docker-compose up -d
```

### 6. 配置数据库

首次部署后，需要初始化数据库：

```bash
# 进入容器
docker exec -it jx099-nextjs sh

# 生成 Prisma 客户端
npx prisma generate

# 应用数据库迁移
npx prisma db push

# 可选：添加种子数据
npx prisma db seed
```

### 7. 配置 Nginx 反向代理

在 1Panel 中创建一个新的网站，配置 Nginx 反向代理：

1. 域名: `jx099.com`（或你的域名）
2. 反向代理: `http://localhost:3000`
3. 启用 SSL

示例 Nginx 配置:

```nginx
server {
    listen 80;
    server_name jx099.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jx099.com;

    ssl_certificate /path/to/ssl/certificate.pem;
    ssl_certificate_key /path/to/ssl/certificate.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 8. 更新与维护

要更新应用程序，可以执行以下操作：

```bash
# 拉取最新代码
cd /www/sprunkin
git pull

# 重新构建并启动容器
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 常见问题排查

### 数据库连接问题

如果应用无法连接到数据库，请检查：

1. 数据库凭据是否正确
2. 容器网络是否正确配置
3. 数据库是否允许远程连接

查看容器日志：

```bash
docker logs jx099-nextjs
```

### 持久化数据问题

如果数据未能持久化，检查 volumes 配置是否正确，目录权限是否设置好。

### 网络问题

如果容器无法连接外部网络，确保 1panel-network 网络存在且配置正确：

```bash
docker network ls
docker network inspect 1panel-network
```

## 完成部署

成功部署后，你可以通过 `https://jx099.com`（或你的域名）访问 Sprunkin 游戏平台。 