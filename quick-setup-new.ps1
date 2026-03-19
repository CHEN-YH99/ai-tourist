# AI Travel Assistant - Windows Quick Setup Script
# Run as Administrator

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Please run this script as Administrator" -ForegroundColor Red
    exit 1
}

Write-Host "==================================" -ForegroundColor Blue
Write-Host "  AI Travel Assistant - Setup" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/6] Checking Docker..." -ForegroundColor Green
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker not found. Please install Docker Desktop first" -ForegroundColor Red
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Compose not found" -ForegroundColor Red
    exit 1
}

Write-Host "Docker is installed" -ForegroundColor Green

# Step 2: Get configuration
Write-Host "[2/6] Configuring environment variables..." -ForegroundColor Green

# Get OpenAI API Key
$OPENAI_KEY = Read-Host "Enter your OpenAI API Key"
while ([string]::IsNullOrWhiteSpace($OPENAI_KEY)) {
    Write-Host "OpenAI API Key cannot be empty" -ForegroundColor Red
    $OPENAI_KEY = Read-Host "Enter your OpenAI API Key"
}

# Generate random passwords
function Generate-RandomString {
    param([int]$length = 32)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $random = 1..$length | ForEach-Object { Get-Random -Maximum $chars.length }
    return -join ($random | ForEach-Object { $chars[$_] })
}

$MONGO_PASSWORD = Generate-RandomString -length 25
$JWT_SECRET = Generate-RandomString -length 32

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "MongoDB Password: $MONGO_PASSWORD"
Write-Host "JWT Secret: $JWT_SECRET"

# Step 3: Create environment files
Write-Host "[3/6] Creating configuration files..." -ForegroundColor Green

# Create root .env
$envContent = "# MongoDB Configuration`nMONGO_ROOT_USER=admin`nMONGO_ROOT_PASSWORD=$MONGO_PASSWORD`n`n# Application Configuration`nNODE_ENV=production`nJWT_SECRET=$JWT_SECRET`nOPENAI_API_KEY=$OPENAI_KEY`nFRONTEND_URL=http://localhost`nLOG_LEVEL=info`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD\.env", $envContent, $utf8NoBom)

# Create backend .env
$backendEnvContent = "NODE_ENV=production`nPORT=3000`nMONGODB_URI=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/travel-assistant?authSource=admin`nJWT_SECRET=$JWT_SECRET`nJWT_EXPIRES_IN=24h`nOPENAI_API_KEY=$OPENAI_KEY`nFRONTEND_URL=http://localhost`nLOG_LEVEL=info`nMAX_FILE_SIZE=5242880`nUPLOAD_DIR=uploads`n"

[System.IO.File]::WriteAllText("$PWD\backend\.env", $backendEnvContent, $utf8NoBom)

Write-Host "Configuration files created" -ForegroundColor Green

# Step 4: Build and start services
Write-Host "[4/6] Building Docker images (this may take a few minutes)..." -ForegroundColor Green
docker-compose build

Write-Host "[5/6] Starting services..." -ForegroundColor Green
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Initialize database
Write-Host "[6/6] Initializing database..." -ForegroundColor Green
docker-compose exec -T backend npm run seed

# Complete
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URL: http://localhost" -ForegroundColor Blue
Write-Host ""
Write-Host "Common commands:"
Write-Host "  Check status: docker-compose ps"
Write-Host "  View logs: docker-compose logs -f"
Write-Host "  Restart: docker-compose restart"
Write-Host "  Stop: docker-compose down"
Write-Host ""
Write-Host "Important notes:" -ForegroundColor Yellow
Write-Host "1. Configuration saved to .env and backend\.env"
Write-Host "2. Keep these files secure"
Write-Host "3. For external access, configure port forwarding and firewall"
Write-Host ""
Write-Host "Enjoy! 🎉" -ForegroundColor Green
