# AI旅游助手 - Windows一键部署脚本
# 需要管理员权限运行

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "请以管理员身份运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host "==================================" -ForegroundColor Blue
Write-Host "  AI旅游助手 - 一键部署脚本" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

# 步骤1: 检查Docker
Write-Host "[1/6] 检查Docker..." -ForegroundColor Green
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "未检测到Docker，请先安装Docker Desktop" -ForegroundColor Red
    Write-Host "下载地址: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "未检测到Docker Compose" -ForegroundColor Red
    exit 1
}

Write-Host "Docker已安装" -ForegroundColor Green

# 步骤2: 获取配置信息
Write-Host "[2/6] 配置环境变量..." -ForegroundColor Green

# 获取OpenAI API密钥
$OPENAI_KEY = Read-Host "请输入OpenAI API密钥"
while ([string]::IsNullOrWhiteSpace($OPENAI_KEY)) {
    Write-Host "OpenAI API密钥不能为空" -ForegroundColor Red
    $OPENAI_KEY = Read-Host "请输入OpenAI API密钥"
}

# 生成随机密码
function Generate-RandomString {
    param([int]$length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $random = 1..$length | ForEach-Object { Get-Random -Maximum $chars.length }
    return -join ($random | ForEach-Object { $chars[$_] })
}

$MONGO_PASSWORD = Generate-RandomString -length 25
$JWT_SECRET = Generate-RandomString -length 32

Write-Host "配置信息：" -ForegroundColor Yellow
Write-Host "MongoDB密码: $MONGO_PASSWORD"
Write-Host "JWT密钥: $JWT_SECRET"

# 步骤3: 创建环境变量文件
Write-Host "[3/6] 创建配置文件..." -ForegroundColor Green

# 创建根目录.env
$envContent = @"
# MongoDB配置
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$MONGO_PASSWORD

# 应用配置
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_KEY
FRONTEND_URL=http://localhost
LOG_LEVEL=info
"@

Set-Content -Path ".env" -Value $envContent

# 创建后端.env
$backendEnvContent = @"
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/travel-assistant?authSource=admin
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
OPENAI_API_KEY=$OPENAI_KEY
FRONTEND_URL=http://localhost
LOG_LEVEL=info
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
"@

Set-Content -Path "backend\.env" -Value $backendEnvContent

Write-Host "配置文件创建完成" -ForegroundColor Green

# 步骤4: 构建并启动服务
Write-Host "[4/6] 构建Docker镜像（这可能需要几分钟）..." -ForegroundColor Green
docker-compose build

Write-Host "[5/6] 启动服务..." -ForegroundColor Green
docker-compose up -d

# 等待服务启动
Write-Host "等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 步骤5: 初始化数据
Write-Host "[6/6] 初始化数据库..." -ForegroundColor Green
docker-compose exec -T backend npm run seed

# 完成
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址: http://localhost" -ForegroundColor Blue
Write-Host ""
Write-Host "常用命令："
Write-Host "  查看状态: docker-compose ps"
Write-Host "  查看日志: docker-compose logs -f"
Write-Host "  重启服务: docker-compose restart"
Write-Host "  停止服务: docker-compose down"
Write-Host ""
Write-Host "重要提示：" -ForegroundColor Yellow
Write-Host "1. 配置信息已保存到 .env 和 backend\.env"
Write-Host "2. 请妥善保管这些文件，不要泄露"
Write-Host "3. 如需外网访问，请配置端口转发和防火墙"
Write-Host ""
Write-Host "祝使用愉快！🎉" -ForegroundColor Green
