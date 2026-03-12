#!/bin/bash

# Deployment script for AI Travel Assistant
# This script handles the deployment process on the production server

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${PROJECT_DIR}/deploy.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker &> /dev/null || error "Docker is not installed"
    command -v docker-compose &> /dev/null || error "Docker Compose is not installed"
    
    log "Prerequisites check passed"
}

# Backup current deployment
backup_deployment() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cp -r "$PROJECT_DIR" "$BACKUP_DIR/backup_${TIMESTAMP}"
        log "Backup created at $BACKUP_DIR/backup_${TIMESTAMP}"
    else
        warning "No existing deployment to backup"
    fi
}

# Pull latest code
pull_latest_code() {
    log "Pulling latest code from repository..."
    
    cd "$PROJECT_DIR"
    git fetch origin
    git checkout main
    git pull origin main
    
    log "Code pulled successfully"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."
    
    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        error ".env.production file not found"
    fi
    
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a
    
    log "Environment variables loaded"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    cd "$PROJECT_DIR"
    docker-compose build --no-cache
    
    log "Docker images built successfully"
}

# Stop current containers
stop_containers() {
    log "Stopping current containers..."
    
    cd "$PROJECT_DIR"
    docker-compose down || warning "No running containers to stop"
    
    log "Containers stopped"
}

# Start new containers
start_containers() {
    log "Starting new containers..."
    
    cd "$PROJECT_DIR"
    docker-compose up -d
    
    log "Containers started"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "healthy"; then
            log "Services are healthy"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    error "Services failed to become healthy"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$PROJECT_DIR"
    docker-compose exec -T backend npm run migrate || warning "No migrations to run"
    
    log "Migrations completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    local backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
    local frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
    
    if [ "$backend_health" != "200" ]; then
        error "Backend health check failed (HTTP $backend_health)"
    fi
    
    if [ "$frontend_health" != "200" ]; then
        error "Frontend health check failed (HTTP $frontend_health)"
    fi
    
    log "Health checks passed"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Keep only the last 5 backups
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r | tail -n +6 | xargs -r rm -rf
    
    log "Old backups cleaned up"
}

# Rollback function
rollback() {
    error_msg=$1
    error "Deployment failed: $error_msg"
    
    log "Rolling back to previous deployment..."
    
    # Find the most recent backup
    latest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r | head -n 1)
    
    if [ -z "$latest_backup" ]; then
        error "No backup found for rollback"
    fi
    
    # Stop current containers
    cd "$PROJECT_DIR"
    docker-compose down || true
    
    # Restore from backup
    cp -r "$latest_backup"/* "$PROJECT_DIR"
    
    # Start containers with previous version
    docker-compose up -d
    
    log "Rollback completed"
    exit 1
}

# Main deployment flow
main() {
    log "Starting deployment process..."
    
    check_prerequisites
    backup_deployment
    pull_latest_code
    load_environment
    
    # Build and start new containers
    build_images || rollback "Docker image build failed"
    stop_containers || rollback "Failed to stop containers"
    start_containers || rollback "Failed to start containers"
    wait_for_services || rollback "Services failed to become healthy"
    run_migrations || rollback "Database migrations failed"
    health_check || rollback "Health checks failed"
    cleanup_old_backups
    
    log "Deployment completed successfully!"
    log "Application is now running at ${FRONTEND_URL}"
}

# Run main function
main "$@"
