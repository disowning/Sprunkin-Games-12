# Sprunkin 游戏平台

## 项目简介
Sprunkin 是一个现代化的在线 HTML5 游戏平台，使用最新的 Web 技术栈构建。平台提供丰富的游戏内容，支持多人游戏体验，并具备完善的用户管理和内容管理系统。

### 技术栈
- 前端：Next.js 14 (App Router)、React 18.2+、TypeScript、TailwindCSS
- 后端：Next.js API Routes、Server Actions、Prisma ORM
- 数据库：SQLite
- 认证：NextAuth.js
- 部署：支持 Docker 和传统部署

## 功能特性

### 用户功能
1. **游戏体验**
   - 即时游戏，无需下载安装
   - 全屏模式支持
   - 游戏收藏与分享
   - 评分和评论系统
   - 游戏进度保存
   - 多人游戏支持

2. **内容发现**
   - 智能搜索与筛选
   - 分类浏览
   - 个性化推荐
   - 热门游戏榜单
   - 最新游戏推送
   - 相关游戏推荐

3. **用户界面**
   - 响应式设计（移动端/平板/桌面）
   - 深色/浅色主题
   - 多语言支持
   - 无障碍设计
   - 直观的导航系统
   - 快捷键支持

### 管理功能
1. **游戏管理**
   - 游戏 CRUD 操作
   - 批量导入（CSV/JSON）
   - 游戏状态管理
   - 游戏统计分析
   - 游戏置顶和推荐
   - 游戏标签管理

2. **用户管理**
   - 用户角色管理
   - 用户行为分析
   - 用户反馈处理
   - 用户封禁功能
   - 用户数据导出

3. **内容管理**
   - 分类管理
   - 标签系统
     - 支持创建、编辑、删除游戏标签
     - 自动生成SEO友好的URL标识(slug)
     - 标签与游戏多对多关联
     - 用于游戏分类和检索
   - 评论审核
   - 内容审核
   - SEO 优化
   - 站点配置

4. **广告系统**
   - 多广告位管理
   - 广告投放控制
   - 广告效果分析
   - A/B 测试支持
   - 广告屏蔽检测

### 3. SEO管理

SEO管理页面提供了完整的搜索引擎优化设置功能，包括：

1. **首页SEO设置**
   - 网站名称：显示在所有页面标题后缀
   - 首页标题：自定义首页的HTML标题标签
   - 首页描述：自定义首页的meta description内容
   - 首页关键词：设置首页的meta keywords内容

2. **页面SEO模板**
   - 游戏详情页：设置游戏页面的标题和描述模板，支持{game_title}和{game_category}变量
   - 分类页面：设置分类页面的标题和描述模板，支持{category_name}变量
   - 标签页面：设置标签页面的标题和描述模板，支持{tag_name}变量

3. **站点验证**
   - Google站点验证：添加Google Search Console的验证代码
   - 百度站点验证：添加百度搜索资源平台的验证代码
   - Bing站点验证：添加Bing Webmaster Tools的验证代码

这些SEO设置可以帮助您的游戏网站在搜索引擎中获得更好的排名和展示效果。

## 仪表盘和数据分析功能

### 仪表盘功能

管理员仪表盘提供网站关键指标的实时概览，包括：

- **实时统计数据**：显示注册用户数、游戏总数、游戏游玩次数和访问国家/地区数
- **游戏访问量趋势**：展示近7个月的游戏访问量变化趋势
- **热门游戏排行**：展示按游玩次数排名的热门游戏
- **每日游玩统计**：展示近7天的每日游玩次数
- **设备类型分布**：用户访问设备类型的分布
- **浏览器分布**：用户使用浏览器的分布情况
- **活跃用户列表**：显示最活跃的用户及其游玩次数

### 数据分析功能

数据分析页面提供更详细的数据分析功能：

- **综合数据分析**：展示总体数据统计，包括游戏总数、用户数、游玩次数等
- **热门游戏分析**：展示最受欢迎的游戏，包括访问量和游玩次数
- **用户设备分析**：分析用户使用的设备类型和浏览器分布
- **最近游戏记录**：显示最近的游戏游玩记录，包括游戏名称、用户、设备和时长

### 游戏游玩分析

提供详细的游戏游玩数据分析：

- **游戏游玩统计**：各游戏的游玩次数和平均游玩时长统计
- **设备分布统计**：游戏在不同设备上的游玩分布
- **浏览器分布统计**：游戏在不同浏览器中的游玩分布
- **游玩详细记录**：包含每次游玩的详细信息，如用户、游戏、设备、IP地址等

### 访客地区分析

提供详细的访客地理位置数据分析：

- **访问国家排名**：按访问次数排名的国家/地区
- **地区分布图表**：以条形图和饼图展示访问分布
- **访问详细数据**：每个国家/地区的访问次数和上次访问时间

所有这些数据都是基于真实的数据库记录自动生成的，提供了网站运营和用户行为的真实洞察。

## 项目结构
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── (auth)/           # 认证相关页面
│   ├── (main)/           # 主要页面
│   ├── admin/            # 管理后台
│   ├── components/       # 共享组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   ├── styles/           # 样式文件
│   └── types/            # TypeScript 类型
├── prisma/                # Prisma 配置
│   ├── schema.prisma     # 数据模型
│   ├── seed.ts          # 种子数据
│   └── migrations/      # 数据迁移
├── public/                # 静态资源
│   ├── images/          # 图片资源
│   ├── games/           # 游戏文件
│   └── locales/         # 多语言文件
└── scripts/              # 工具脚本
```

## 开发指南

### 环境要求
- Node.js 18.0+
- npm 9.0+ 或 yarn 1.22+
- Git

### 本地开发
1. 克隆仓库
```bash
git clone https://github.com/your-username/sprunkin.git
cd sprunkin
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 环境配置
```bash
cp .env.example .env
# 编辑 .env 文件配置必要的环境变量
```

4. 数据库设置
```bash
npx prisma generate    # 生成 Prisma Client
npx prisma db push    # 同步数据库架构
npx prisma db seed    # 导入测试数据
```

5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

### 生产部署

#### Docker 部署
1. 构建镜像
```bash
docker build -t sprunkin .
```

2. 运行容器
```bash
docker run -p 3000:3000 -d sprunkin
```

#### 传统部署
1. 构建项目
```bash
npm run build
```

2. 启动服务
```bash
npm start
```

### 2. 宝塔面板部署

#### 环境准备
1. 在宝塔面板中安装以下环境：
   - Node.js 18+ (推荐 18.17.0 或更高版本)
   - PM2 管理器
   - Nginx

#### 部署步骤
1. **创建站点**
   - 在宝塔面板中创建一个新站点，如 `sprunkin.com`
   - 设置合适的根目录，如 `/www/wwwroot/sprunkin`

2. **上传代码**
   - 通过 SFTP 或 Git 将代码上传到站点根目录
   - 或在宝塔文件管理器中直接上传压缩包并解压

3. **安装依赖**
   - 在宝塔的终端中进入项目目录：
   ```bash
   cd /www/wwwroot/sprunkin
   ```
   - 安装项目依赖：
   ```bash
   npm install
   ```

4. **环境配置**
   - 创建并编辑 `.env.local` 文件：
   ```bash
   cp .env.example .env.local
   nano .env.local  # 编辑环境变量
   ```

5. **数据库配置**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **构建项目**
   ```bash
   npm run build
   ```

7. **PM2 配置**
   - 创建 PM2 配置文件 `ecosystem.config.js`：
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'sprunkin',
         script: 'npm',
         args: 'start',
         cwd: '/www/wwwroot/sprunkin',
         env: {
           NODE_ENV: 'production',
         },
       },
     ],
   };
   ```
   - 使用 PM2 启动项目：
   ```bash
   pm2 start ecosystem.config.js
   ```
   - 设置开机自启：
   ```bash
   pm2 save
   pm2 startup
   ```

8. **Nginx 配置**
   - 在宝塔面板中修改网站的 Nginx 配置，添加以下内容：
   ```nginx
   location / {
     proxy_pass http://127.0.0.1:3000;
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```
   - 保存并重启 Nginx

9. **SSL 配置**
   - 在宝塔面板中为网站申请 SSL 证书并开启强制 HTTPS

### 3. 宝塔面板数据库配置

#### SQLite 数据库（默认）
1. **数据库文件位置**
   - SQLite 数据库文件默认位于项目根目录的 `prisma` 文件夹中：`/www/wwwroot/sprunkin/prisma/dev.db`
   - 确保该目录具有适当的读写权限：
   ```bash
   chmod 755 /www/wwwroot/sprunkin/prisma
   chmod 644 /www/wwwroot/sprunkin/prisma/dev.db
   ```

2. **备份配置**
   - 在宝塔面板中设置定时任务，定期备份数据库文件：
   ```bash
   # 创建备份目录
   mkdir -p /www/backup/sprunkin

   # 备份命令（每天凌晨2点执行）
   0 2 * * * cp /www/wwwroot/sprunkin/prisma/dev.db /www/backup/sprunkin/dev_$(date +\%Y\%m\%d).db
   ```

#### MySQL 数据库（可选）
1. **安装 MySQL**
   - 在宝塔面板中安装 MySQL 数据库
   - 创建数据库，如 `sprunkin`
   - 创建数据库用户并授予权限

2. **修改 Prisma 配置**
   - 编辑 `prisma/schema.prisma` 文件，将数据库连接从 SQLite 更改为 MySQL：
   ```prisma
   // 修改前（SQLite）
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }

   // 修改后（MySQL）
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **更新环境变量**
   - 编辑 `.env.local` 文件，添加 MySQL 连接信息：
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/sprunkin"
   ```
   
4. **重新生成 Prisma 客户端并部署数据库架构**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **数据导入**
   - 如果需要从 SQLite 迁移数据到 MySQL，可以使用 Prisma 的数据迁移功能：
   ```bash
   # 安装 Prisma 迁移工具
   npm install prisma-db-migrate

   # 执行迁移（需要自定义迁移脚本）
   npx prisma-db-migrate
   ```

#### MongoDB 数据库（可选）
1. **安装 MongoDB**
   - 在宝塔面板中安装 MongoDB 数据库
   - 创建数据库和用户

2. **修改 Prisma 配置**
   - 编辑 `prisma/schema.prisma` 文件，将数据库连接更改为 MongoDB：
   ```prisma
   datasource db {
     provider = "mongodb"
     url      = env("DATABASE_URL")
   }
   ```

3. **更新环境变量**
   - 编辑 `.env.local` 文件，添加 MongoDB 连接信息：
   ```
   DATABASE_URL="mongodb://username:password@localhost:27017/sprunkin?authSource=admin"
   ```

4. **重新生成 Prisma 客户端并部署数据库架构**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 性能优化
1. **前端优化**
   - 图片懒加载和优化
   - 组件代码分割
   - 静态页面生成
   - 客户端缓存策略
   - 资源预加载

2. **后端优化**
   - 数据库索引优化
   - 缓存层实现
   - 请求合并
   - 异步处理
   - 数据库连接池

3. **部署优化**
   - CDN 加速
   - Gzip 压缩
   - HTTP/2 支持
   - 负载均衡
   - SSL 证书配置

## 监控与维护

### 系统监控
- 服务器资源监控
- 应用性能监控
- 错误追踪
- 用户行为分析
- 性能指标收集

### 日常维护
- 数据库备份
- 日志管理
- 安全更新
- 性能优化
- 内容审核

## 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证
MIT License

## 联系方式
- 官方网站：[https://sprunkin.com](https://sprunkin.com)
- 技术支持：support@sprunkin.com
- 问题反馈：issues@sprunkin.com

## 更新日志
请查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细更新历史。

# 管理员设置密钥 - 使用强随机字符串
ADMIN_SETUP_KEY="your-secret-random-key-here"