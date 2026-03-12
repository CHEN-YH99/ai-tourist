# Docker Deployment Guide

This document provides detailed information about Docker deployment for the AI Travel Assistant.

## Quick Start

### Development Environment

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Build and start production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down
```

## Docker Images

### Backend Image

**Dockerfile**: `backend/Dockerfile`

- **Base Image**: `node:18-alpine`
- **Size**: ~200MB (optimized)
- **Ports**: 3000
- **Health Check**: Every 30 seconds

**Features**:
- Multi-stage build (if needed)
- Production dependencies only
- TypeScript compilation
- Health check endpoint

### Frontend Image

**Dockerfile**: `Dockerfile`

- **Build Stage**: `node:18-alpine`
- **Runtime Stage**: `nginx:alpine`
- **Size**: ~50MB (optimized)
- **Ports**: 80, 443
- **Health Check**: Every 30 seconds

**Features**:
- Multi-stage build for optimization
- Nginx for static file serving
- Gzip compression enabled
- Security headers configured
- Rate limiting configured

## Docker Compose Services

### MongoDB

- **Image**: `mongo:6-alpine`
- **Port**: 27017
- **Volume**: `mongodb_data` (persistent)
- **Health Check**: MongoDB ping command

### Backend

- **Build**: `./backend/Dockerfile`
- **Port**: 3000
- **Depends On**: MongoDB (healthy)
- **Volumes**: 
  - `./backend/logs` (logs)
  - `./backend/uploads` (user uploads)
- **Environment**: Loaded from `.env` file

### Frontend

- **Build**: `./Dockerfile`
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Depends On**: Backend
- **Volumes**:
  - `./nginx.conf` (nginx configuration)
  - `./ssl` (SSL certificates)

## Environment Variables

### Backend Environment Variables

```bash
# Node environment
NODE_ENV=production

# Server configuration
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Authentication
JWT_SECRET=your-secret-key

# AI Service
OPENAI_API_KEY=sk-your-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```bash
# API base URL
VITE_API_BASE_URL=https://api.your-domain.com
```

## Building Images

### Build All Images

```bash
docker-compose build
```

### Build Specific Image

```bash
# Build backend only
docker-compose build backend

# Build frontend only
docker-compose build frontend
```

### Build Without Cache

```bash
docker-compose build --no-cache
```

## Running Containers

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up -d backend
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## Viewing Logs

### View All Logs

```bash
# View last 100 lines
docker-compose logs --tail=100

# Follow logs in real-time
docker-compose logs -f
```

### View Service-Specific Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MongoDB logs
docker-compose logs -f mongodb
```

### View Logs with Timestamps

```bash
docker-compose logs -f --timestamps
```

## Executing Commands

### Execute Command in Container

```bash
# Run command in backend
docker-compose exec backend npm run migrate

# Run command in MongoDB
docker-compose exec mongodb mongosh

# Run command in frontend
docker-compose exec frontend npm run build
```

### Interactive Shell

```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password
```

## Database Management

### Backup Database

```bash
# Backup to local directory
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/travel-assistant?authSource=admin" \
  --out=/backups/

# Copy backup from container
docker cp travel-assistant-db:/backups ./backups
```

### Restore Database

```bash
# Restore from backup
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/travel-assistant?authSource=admin" \
  /backups/
```

### Connect to MongoDB

```bash
# Interactive MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Run MongoDB command
docker-compose exec mongodb mongosh -u admin -p password --eval "db.users.count()"
```

## Monitoring

### Check Container Status

```bash
docker-compose ps
```

### View Resource Usage

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats travel-assistant-api
```

### Check Container Health

```bash
# View health status
docker-compose ps

# Detailed health info
docker inspect travel-assistant-api | grep -A 5 Health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache backend

# Start with verbose output
docker-compose up backend
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Test MongoDB connection
docker-compose exec backend npm run test:db

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
docker-compose config | grep MONGODB_URI
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Memory Issues

```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# Edit Docker Desktop settings or docker daemon.json
```

## Performance Optimization

### Enable BuildKit

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build
```

### Optimize Images

```bash
# View image sizes
docker images

# Remove unused images
docker image prune -a
```

### Optimize Volumes

```bash
# Use named volumes for better performance
# Already configured in docker-compose.yml
```

## Security

### Secrets Management

```bash
# Use .env file for secrets (not committed to git)
# Never commit .env to repository
# Use environment variables in production
```

### Network Security

```bash
# Services communicate through internal network
# Only expose necessary ports
# Use firewall rules on host
```

### Image Security

```bash
# Use specific version tags (not latest)
# Scan images for vulnerabilities
docker scan travel-assistant-api
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] SSL certificates in place
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Health checks verified

### Deploy to Production

```bash
# Pull latest code
git pull origin main

# Build images
docker-compose build

# Stop old containers
docker-compose down

# Start new containers
docker-compose up -d

# Verify health
docker-compose ps
```

### Rollback

```bash
# Stop current containers
docker-compose down

# Restore previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d
```

## Useful Docker Commands

```bash
# View all containers
docker ps -a

# View all images
docker images

# Remove image
docker rmi <image-id>

# Remove container
docker rm <container-id>

# View container details
docker inspect <container-id>

# View container logs
docker logs <container-id>

# Execute command in container
docker exec <container-id> <command>

# Copy file from container
docker cp <container-id>:/path/to/file ./local/path

# Copy file to container
docker cp ./local/file <container-id>:/path/to/file
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Docker Documentation](https://hub.docker.com/_/nginx)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the troubleshooting section
3. Check Docker documentation
4. Open an issue on GitHub
