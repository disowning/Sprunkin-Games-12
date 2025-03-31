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

# 检查必要的命令是否存在
check_commands() {
    print_message "检查必要的命令..."
    
    commands=("git" "docker" "docker-compose")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_error "$cmd 未安装，正在安装..."
            if [ "$cmd" = "git" ]; then
                apt-get update && apt-get install -y git
            elif [ "$cmd" = "docker" ]; then
                curl -fsSL https://get.docker.com | sh
                systemctl enable docker
                systemctl start docker
            elif [ "$cmd" = "docker-compose" ]; then
                curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose
            fi
        fi
    done
}

# 创建项目目录
setup_project_directory() {
    print_message "创建项目目录..."
    
    PROJECT_DIR="/root/jx099"
    if [ ! -d "$PROJECT_DIR" ]; then
        mkdir -p "$PROJECT_DIR"
    fi
    cd "$PROJECT_DIR"
    print_message "当前工作目录: $(pwd)"
}

# 克隆或更新代码
clone_or_update_code() {
    print_message "克隆或更新代码..."
    
    if [ -d ".git" ]; then
        print_message "Git仓库已存在，正在更新..."
        git fetch origin
        git reset --hard origin/main
    else
        print_message "克隆新仓库..."
        git clone https://github.com/disowning/Sprunkin-Games-12.git .
    fi
}

# 创建环境文件
create_env_file() {
    print_message "创建环境配置文件..."
    
    cat > .env << 'EOL'
DATABASE_URL="mysql://root:mysql_jYAwsS@207.211.179.194:3306/jx099?connection_limit=5&pool_timeout=2&charset=utf8mb4_unicode_ci&max_allowed_packet=16777216"
NEXTAUTH_SECRET="8KQzp2nx893KJFmxnv6uqwerty12378HOPxmMs4"
NEXTAUTH_URL="http://jx099.com"
EOL
    
    print_message "环境配置文件创建完成"
}

# 创建 docker-compose 文件
create_docker_compose() {
    print_message "创建 docker-compose.yml 文件..."
    
    cat > docker-compose.yml << 'EOL'
version: '3'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:mysql_jYAwsS@207.211.179.194:3306/jx099?connection_limit=5&pool_timeout=2&charset=utf8mb4_unicode_ci&max_allowed_packet=16777216
      - NEXTAUTH_SECRET=8KQzp2nx893KJFmxnv6uqwerty12378HOPxmMs4
      - NEXTAUTH_URL=http://jx099.com
    volumes:
      - ./public/uploads:/app/public/uploads
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
EOL
    
    print_message "docker-compose.yml 文件创建完成"
}

# 设置文件权限
setup_permissions() {
    print_message "设置文件权限..."
    
    chmod -R 755 .
    chmod 644 .env docker-compose.yml
    
    if [ ! -d "public/uploads" ]; then
        mkdir -p public/uploads
    fi
    chmod -R 777 public/uploads
}

# 构建和启动 Docker 容器
build_and_start_containers() {
    print_message "构建和启动 Docker 容器..."
    
    # 停止并删除现有容器
    if docker-compose ps | grep -q "jx099"; then
        print_warning "检测到现有容器，正在停止..."
        docker-compose down
    fi
    
    # 清理 Docker 缓存
    print_message "清理 Docker 缓存..."
    docker system prune -f
    
    # 构建新镜像并启动容器
    print_message "构建新镜像并启动容器..."
    docker-compose up --build -d
    
    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        print_message "容器启动成功！"
    else
        print_error "容器启动失败，请检查日志"
        docker-compose logs
        exit 1
    fi
}

# 检查应用可访问性
check_application() {
    print_message "检查应用可访问性..."
    
    # 等待应用启动
    sleep 10
    
    # 检查端口是否可访问
    if curl -s "http://localhost:3000" > /dev/null; then
        print_message "应用成功启动，可以通过 http://localhost:3000 访问"
    else
        print_warning "应用可能未正常启动，请检查日志"
        docker-compose logs
    fi
}

# 主函数
main() {
    print_message "开始部署流程..."
    
    check_commands
    setup_project_directory
    clone_or_update_code
    create_env_file
    create_docker_compose
    setup_permissions
    build_and_start_containers
    check_application
    
    print_message "部署完成！"
    print_message "可以通过以下命令查看日志："
    print_message "docker-compose logs -f"
}

# 执行主函数
main 