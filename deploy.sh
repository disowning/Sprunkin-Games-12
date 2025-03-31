#!/bin/bash

# Sprunkin 游戏平台 - 1Panel 部署脚本

# 默认配置文件
COMPOSE_FILE="docker-compose.yml"

# 处理命令行参数
while getopts ":f:" opt; do
  case $opt in
    f)
      COMPOSE_FILE="$OPTARG"
      ;;
    \?)
      echo "无效选项: -$OPTARG"
      exit 1
      ;;
    :)
      echo "选项 -$OPTARG 需要一个参数."
      exit 1
      ;;
  esac
done

echo "--------------------------------------------"
echo "  Sprunkin 游戏平台 - 1Panel 部署脚本"
echo "--------------------------------------------"
echo "使用配置文件: $COMPOSE_FILE"
echo ""

# 确认当前目录
CURRENT_DIR=$(pwd)
echo "当前目录: $CURRENT_DIR"
echo ""

# 检查必要文件
echo "检查必要文件..."
if [ ! -f "Dockerfile" ]; then
  echo "错误: Dockerfile 不存在!"
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "错误: $COMPOSE_FILE 不存在!"
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "错误: package.json 不存在!"
  exit 1
fi
echo "✅ 所有必要文件存在"
echo ""

# 创建必要的目录
echo "创建持久化数据目录..."
mkdir -p uploads prisma
chmod 777 uploads
echo "✅ 数据目录已创建"
echo ""

# 检查 docker 和 docker-compose 是否安装
echo "检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
  echo "错误: Docker 未安装!"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "错误: Docker Compose 未安装!"
  exit 1
fi
echo "✅ Docker 环境正常"
echo ""

# 确认部署参数
echo "请确认部署参数:"
echo "  • 数据库连接: $(grep DATABASE_URL $COMPOSE_FILE | cut -d= -f2)"
echo "  • 域名: $(grep NEXTAUTH_URL $COMPOSE_FILE | cut -d= -f2)"
echo ""

read -p "确认开始部署? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "部署已取消"
  exit 0
fi
echo ""

# 停止并移除旧容器
echo "停止并移除旧容器..."
docker-compose -f $COMPOSE_FILE down
echo "✅ 旧容器已移除"
echo ""

# 构建新镜像
echo "构建新镜像..."
docker-compose -f $COMPOSE_FILE build --no-cache
if [ $? -ne 0 ]; then
  echo "错误: 构建失败!"
  exit 1
fi
echo "✅ 新镜像已构建"
echo ""

# 启动容器
echo "启动容器..."
docker-compose -f $COMPOSE_FILE up -d
if [ $? -ne 0 ]; then
  echo "错误: 启动失败!"
  exit 1
fi
echo "✅ 容器已启动"
echo ""

# 等待容器启动
echo "等待容器完全启动..."
sleep 10

# 初始化数据库
echo "是否需要初始化数据库? (首次部署时需要)"
read -p "初始化数据库? (y/n): " init_db
if [ "$init_db" = "y" ]; then
  echo "初始化数据库..."
  
  echo "正在生成 Prisma 客户端..."
  docker exec -it jx099-nextjs npx prisma generate
  
  echo "正在应用数据库迁移..."
  docker exec -it jx099-nextjs npx prisma db push
  
  echo "是否需要添加种子数据?"
  read -p "添加种子数据? (y/n): " seed_db
  if [ "$seed_db" = "y" ]; then
    echo "正在添加种子数据..."
    docker exec -it jx099-nextjs npx prisma db seed
  fi
  
  echo "✅ 数据库初始化完成"
fi
echo ""

# 检查容器状态
echo "检查容器状态..."
docker ps | grep jx099-nextjs
echo ""

# 检查容器日志
echo "显示最近的容器日志..."
docker logs --tail 20 jx099-nextjs
echo ""

echo "--------------------------------------------"
echo "🎮 Sprunkin 游戏平台部署完成!"
echo "--------------------------------------------"
echo "现在，你可以通过以下地址访问你的游戏平台:"
echo "$(grep NEXTAUTH_URL $COMPOSE_FILE | cut -d= -f2 | tr -d '[:space:]')"
echo ""
echo "请确保配置了正确的 Nginx 反向代理以及 SSL 证书。"
echo "如有任何问题，请查看容器日志或联系技术支持。"
echo ""

exit 0 