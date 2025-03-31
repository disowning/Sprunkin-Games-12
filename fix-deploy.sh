#!/bin/bash

echo "--------------------------------------------"
echo "  Sprunkin 游戏平台 - 修复部署脚本"
echo "--------------------------------------------"

# 打印当前目录
echo "当前目录: $(pwd)"

# 检查当前目录名
CURRENT_DIR_NAME=$(basename "$(pwd)")
echo "当前目录名: $CURRENT_DIR_NAME"

# 使用目录名作为容器名和镜像名前缀
CONTAINER_NAME="${CURRENT_DIR_NAME}-nextjs"
IMAGE_NAME="${CURRENT_DIR_NAME}/nextjs"

# 检查必要文件是否存在
if [ ! -f "Dockerfile" ]; then
  echo "错误: 在当前目录中找不到Dockerfile"
  exit 1
fi

if [ ! -f "docker-compose.prod.yml" ]; then
  echo "错误: 在当前目录中找不到docker-compose.prod.yml"
  exit 1
fi

# 创建持久化数据目录
mkdir -p ./uploads
mkdir -p ./prisma

# 设置环境变量，这些将被传递给容器
export DATABASE_URL="mysql://root:mysql_mE4Tb5@149.130.209.4:3306/jx099?connection_limit=5&pool_timeout=2&charset=utf8mb4_unicode_ci&max_allowed_packet=16777216"
export NEXTAUTH_SECRET="8KQzp2nx893KJFmxnv6uqwerty12378HOPxmMs4"
export NEXTAUTH_URL="https://jx099.com"
export ADMIN_SETUP_KEY="8KQzp2nx893KJFmxnv6uqwerty12378HOPxmMs4"
export NODE_ENV="production"

# 停止并删除旧容器（如果存在）
if docker ps -a | grep -q "$CONTAINER_NAME"; then
  echo "停止并删除现有的$CONTAINER_NAME容器..."
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

# 构建新的Docker镜像
echo "构建Docker镜像..."
docker build \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --build-arg NEXTAUTH_URL="$NEXTAUTH_URL" \
  --build-arg ADMIN_SETUP_KEY="$ADMIN_SETUP_KEY" \
  --build-arg NODE_ENV="$NODE_ENV" \
  -t "$IMAGE_NAME":latest .

# 启动新容器
echo "启动新容器..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e ADMIN_SETUP_KEY="$ADMIN_SETUP_KEY" \
  -e NODE_ENV="$NODE_ENV" \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/prisma:/app/prisma \
  --network 1panel-network \
  "$IMAGE_NAME":latest

# 初始化数据库（如有需要）
read -p "是否需要初始化数据库? (y/n) " initdb
if [ "$initdb" = "y" ]; then
  echo "生成Prisma客户端..."
  docker exec -it "$CONTAINER_NAME" npx prisma generate

  echo "应用数据库迁移..."
  docker exec -it "$CONTAINER_NAME" npx prisma migrate deploy

  echo "填充初始数据..."
  docker exec -it "$CONTAINER_NAME" npx prisma db seed
fi

# 检查容器状态
echo "检查容器状态..."
docker ps -a | grep "$CONTAINER_NAME"

# 显示日志
echo "容器日志:"
docker logs "$CONTAINER_NAME"

echo "--------------------------------------------"
echo "🎮 Sprunkin 游戏平台部署完成!"
echo "--------------------------------------------"
echo "现在，你可以通过以下地址访问你的游戏平台:"
echo "https://jx099.com"
echo ""
echo "请确保配置了正确的 Nginx 反向代理以及 SSL 证书。"
echo ""

exit 0 