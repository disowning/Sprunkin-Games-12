#!/bin/bash

# 设置错误时退出
set -e

# 定义颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息函数
print_message() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# 安装必要的包
install_packages() {
    print_message "安装必要的包..."
    
    # 更新包列表
    apt-get update
    
    # 安装 MySQL 客户端
    apt-get install -y mysql-client-core-8.0
    
    print_message "包安装完成"
}

# 创建数据库
create_database() {
    print_message "创建数据库..."
    
    # 创建 SQL 文件
    cat > create_db.sql << 'EOL'
CREATE DATABASE IF NOT EXISTS jx099 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOL
    
    # 执行 SQL 文件
    if mysql -h 207.211.179.194 -u root -p'mysql_jYAwsS' < create_db.sql; then
        print_message "数据库创建成功"
    else
        print_error "数据库创建失败"
        exit 1
    fi
}

# 初始化数据库结构
init_database() {
    print_message "初始化数据库结构..."
    
    # 安装依赖
    npm install
    
    # 生成 Prisma 客户端
    npx prisma generate
    
    # 推送数据库架构
    npx prisma db push
    
    print_message "数据库结构初始化完成"
}

# 重新构建 Docker
rebuild_docker() {
    print_message "重新构建 Docker 容器..."
    
    # 停止现有容器
    docker-compose down
    
    # 清理缓存
    docker system prune -f
    
    # 重新构建和启动
    docker-compose up --build -d
    
    print_message "Docker 容器重建完成"
}

# 主函数
main() {
    print_message "开始初始化数据库和重建 Docker..."
    
    install_packages
    create_database
    init_database
    rebuild_docker
    
    print_message "所有操作完成！"
    print_message "可以通过以下命令查看日志："
    print_message "docker-compose logs -f"
}

# 执行主函数
main 