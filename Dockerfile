FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的包
RUN apk add --no-cache openssl

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine

# 安装必要的包
RUN apk add --no-cache openssl

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# 创建uploads目录
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]