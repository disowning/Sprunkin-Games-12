FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . ./

# 生成Prisma客户端
RUN npx prisma generate

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine

# 安装必要的包
RUN apk add --no-cache openssl

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 创建uploads目录
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NEXTAUTH_SECRET="8KQzp2nx893KJFmxnv6uqwerty12378HOPxmMs4"
ENV NEXTAUTH_URL="http://jx099.com"

# 设置启动命令
CMD ["node", "server.js"]

# 暴露端口
EXPOSE 3000