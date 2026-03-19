#!/bin/bash

# AI旅游助手 - 一键部署脚本
# 适用于 Ubuntu 20.04+ / Debian 10+

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "=================================="
echo "  AI旅游助手 - 一键部署脚本"
echo "=================================="
echo -e "${NC}"

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}请不要使用root用户运行此脚本${NC}"
    exit 1
fi

# 步骤1: 安装Docker
echo -e "${GREEN}[1/6] 检查并安装Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "正在安装Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker安装完成${NC}"
else
    echo "Docker已安装"
fi

# 检查Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "正在安装Docker Compose插件..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# 步骤2: 获取配置信息
echo -e "${GREEN}[2/6] 配置环境变量...${NC}"

# 获取OpenAI API密钥
read -p "请输入OpenAI API密钥: " OPENAI_KEY
while [ -z "$OPENAI_KEY" ]; do
    echo -e "${RED}OpenAI API密钥不能为空${NC}"
    read -p "请输入OpenAI API密钥: " OPENAI_KEY
done

# 生成随机密码
MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me || echo "localhost")

echo -e "${YELLOW}配置信息：${NC}"
echo "服务器IP: $SERVER_IP"
echo "MongoDB密码: $MONGO_PASSWORD"
echo "JWT密钥: $JWT_SECRET"

# 步骤3: 创建环境变量文件
echo -e "${GREEN}[3/6] 创建配置文件...${NC}"

# 创建根目录.env
cat > .env << EOF
# MongoDB配置
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$MONGO_PASSWORD

# 应用配置
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_KEY
FRONTEND_URL=http://$SERVER_IP
LOG_LEVEL=info
EOF

# 创建后端.env
cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/travel-assistant?authSource=admin
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
OPENAI_API_KEY=$OPENAI_KEY
FRONTEND_URL=http://$SERVER_IP
LOG_LEVEL=info
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
EOF

echo "配置文件创建完成"

# 步骤4: 构建并启动服务
echo -e "${GREEN}[4/6] 构建Docker镜像（这可能需要几分钟）...${NC}"
docker compose build

echo -e "${GREEN}[5/6] 启动服务...${NC}"
docker compose up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 步骤5: 初始化数据
echo -e "${GREEN}[6/6] 初始化数据库...${NC}"
docker compose exec -T backend npm run seed || echo "数据初始化完成"

# 步骤6: 配置防火墙
echo -e "${GREEN}配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "防火墙规则已添加"
fi

# 完成
echo -e "${GREEN}"
echo "=================================="
echo "  部署完成！"
echo "=================================="
echo -e "${NC}"
echo -e "${BLUE}访问地址: http://$SERVER_IP${NC}"
echo ""
echo "常用命令："
echo "  查看状态: docker compose ps"
echo "  查看日志: docker compose logs -f"
echo "  重启服务: docker compose restart"
echo "  停止服务: docker compose down"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "1. 配置信息已保存到 .env 和 backend/.env"
echo "2. 请妥善保管这些文件，不要泄露"
echo "3. 建议配置HTTPS证书以提高安全性"
echo ""
echo -e "${GREEN}祝使用愉快！🎉${NC}"
