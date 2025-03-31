# Sprunkin 游戏平台部署指南

本文档提供 Sprunkin 游戏平台的详细部署说明，包括开发环境和生产环境的配置步骤。

## 目录结构

Sprunkin 游戏平台的目录结构如下：

```
/
├── .next/                 # Next.js 构建输出
├── node_modules/          # 依赖包
├── prisma/                # Prisma 数据库相关文件
│   ├── migrations/        # 数据库迁移文件
│   ├── schema.prisma      # Prisma 数据模型
│   ├── seed.ts            # 数据库种子文件
│   └── tsconfig.json      # Prisma TypeScript 配置
├── public/                # 静态资源
│   ├── images/            # 图片资源
│   └── games/             # 游戏资源文件
├── src/                   # 源代码
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API 路由
│   │   ├── (auth)/        # 认证相关页面
│   │   ├── (main)/        # 主要页面
│   │   ├── admin/         # 管理后台
│   │   └── ...            # 其他页面和路由
│   ├── components/        # React 组件
│   ├── lib/               # 工具函数
│   └── styles/            # 样式文件
├── .env                   # 环境变量
├── .env.example           # 环境变量示例
├── docker-compose.yml     # Docker 开发环境配置
├── docker-compose.prod.yml# Docker 生产环境配置
├── Dockerfile             # Docker 镜像构建文件
├── fix-deploy.sh          # 修复版部署脚本
├── next.config.js         # Next.js 配置
├── package.json           # 项目依赖和脚本
├── README.md              # 项目说明文档
└── tsconfig.json          # TypeScript 配置
```

## 环境要求

- Node.js 18.0+
- npm 9.0+ 或 yarn 1.22+
- Docker (如果使用 Docker 部署)
- 数据库: PostgreSQL (可配置为 MySQL)

## 开发环境部署

1. **克隆代码库**

```bash
git clone [仓库URL] sprunkin
cd sprunkin
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env.local` 并根据需要修改：

```bash
cp .env.example .env.local
```

主要环境变量说明：

```
# 数据库连接信息
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sprunkin?schema=public"

# NextAuth配置
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 管理员设置密钥
ADMIN_SETUP_KEY="your-admin-setup-key"
```

4. **初始化数据库**

```bash
# 生成Prisma客户端
npx prisma generate

# 同步数据库架构
npx prisma migrate dev --name init

# 导入种子数据
npx prisma db seed
```

5. **启动开发服务器**

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动。

## 生产环境部署 (Docker)

### 使用 Docker Compose

1. **确保 Docker 和 Docker Compose 已安装**

```bash
docker --version
docker-compose --version
```

2. **配置环境变量**

编辑 `docker-compose.prod.yml` 文件中的环境变量：

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:postgres@db:5432/sprunkin?schema=public
  - NEXTAUTH_SECRET=your-nextauth-secret
  - NEXTAUTH_URL=https://yourdomain.com
  - ADMIN_SETUP_KEY=your-admin-setup-key
```

3. **运行修复版部署脚本**

```bash
chmod +x fix-deploy.sh
./fix-deploy.sh
```

脚本会自动执行以下操作：
- 检查必要文件
- 创建持久化数据目录
- 构建 Docker 镜像
- 启动容器
- 初始化数据库(可选)

4. **配置 Nginx 反向代理**

创建 Nginx 配置文件：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

5. **配置 SSL 证书**

推荐使用 Let's Encrypt：

```bash
certbot --nginx -d yourdomain.com
```

## 手动部署 (无 Docker)

1. **安装 Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **安装依赖**

```bash
npm ci
```

3. **构建项目**

```bash
npm run build
```

4. **启动服务**

```bash
npm start
```

可以使用 PM2 来管理 Node.js 进程：

```bash
npm install -g pm2
pm2 start npm --name "sprunkin" -- start
pm2 save
pm2 startup
```

## 数据库迁移

当架构发生变化时，需要更新数据库：

```bash
# 开发环境
npx prisma migrate dev --name [migration-name]

# 生产环境
npx prisma migrate deploy
```

## 常见问题解决

### 1. Docker 构建或启动失败

检查日志：

```bash
docker logs sprunkin-nextjs
```

常见解决方案：
- 确保 Docker 版本兼容
- 检查环境变量配置
- 确保端口未被占用

### 2. 数据库连接问题

- 检查数据库服务是否运行
- 确认 DATABASE_URL 配置正确
- 检查网络连接和防火墙配置

### 3. 认证问题

- 确保 NEXTAUTH_SECRET 和 NEXTAUTH_URL 配置正确
- 检查 NextAuth 提供者配置

## 备份与恢复

### 数据库备份

```bash
# PostgreSQL
pg_dump -U postgres -d sprunkin > backup.sql

# 恢复
psql -U postgres -d sprunkin < backup.sql
```

### 文件备份

定期备份上传的内容：

```bash
tar -czf uploads_backup.tar.gz uploads/
```

## 监控与维护

推荐配置以下监控：

1. **服务器监控**: Prometheus + Grafana
2. **应用监控**: Sentry 或 New Relic
3. **日志管理**: ELK 栈或 Papertrail
4. **性能监控**: Lighthouse 和 PageSpeed Insights

## 升级指南

当有新版本发布时：

1. 备份数据
2. 更新代码库
3. 安装新依赖
4. 应用数据库迁移
5. 重新构建并重启服务

## 联系支持

如果在部署过程中遇到问题，请联系技术支持：

- 问题报告: [GitHub Issues](https://github.com/yourusername/sprunkin/issues)
- 技术支持: support@sprunkin.com 