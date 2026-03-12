# Deployment Guide - AI Travel Assistant

This guide provides comprehensive instructions for deploying the AI Travel Assistant application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development with Docker](#local-development-with-docker)
4. [Production Deployment](#production-deployment)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Docker**: 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- **Git**: 2.30+ ([Install Git](https://git-scm.com/))
- **Node.js**: 18+ (for local development)
- **MongoDB**: 6+ (or use MongoDB Atlas)

### Required Accounts

- **MongoDB Atlas**: For production database ([Sign up](https://www.mongodb.com/cloud/atlas))
- **OpenAI API**: For AI features ([Get API Key](https://platform.openai.com/api-keys))
- **GitHub**: For CI/CD pipeline ([Sign up](https://github.com))
- **Docker Registry**: For image storage (GitHub Container Registry or Docker Hub)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ai-travel-assistant.git
cd ai-travel-assistant
```

### 2. Configure Environment Variables

#### Development Environment

```bash
cp .env.example .env.development
# Edit .env.development with your development settings
```

#### Production Environment

```bash
cp .env.production .env.production
# Edit .env.production with your production settings
```

### 3. Environment Variables Reference

**Key variables to configure:**

```bash
# Node Environment
NODE_ENV=production

# Frontend
VITE_API_BASE_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com

# MongoDB (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-assistant?retryWrites=true&w=majority

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-strong-random-secret-key

# OpenAI API Key
OPENAI_API_KEY=sk-your-api-key

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://your-domain.com
```

## Local Development with Docker

### 1. Start Development Environment

```bash
# Using docker-compose.dev.yml for development
docker-compose -f docker-compose.dev.yml up -d

# Or use the standard docker-compose.yml
docker-compose up -d
```

### 2. Access Services

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### 4. Stop Development Environment

```bash
docker-compose down

# Remove volumes (careful - deletes data)
docker-compose down -v
```

## Production Deployment

### 1. Prepare Production Server

```bash
# SSH into your production server
ssh user@your-production-server

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository on Production Server

```bash
cd /opt
sudo git clone https://github.com/your-org/ai-travel-assistant.git
sudo chown -R $USER:$USER ai-travel-assistant
cd ai-travel-assistant
```

### 3. Configure Production Environment

```bash
# Copy and edit production environment file
cp .env.production .env

# Edit with your production values
nano .env
```

### 4. Set Up SSL Certificates (Optional but Recommended)

```bash
# Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*
```

### 5. Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or manually:
docker-compose build
docker-compose up -d
```

### 6. Verify Deployment

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoints
curl http://localhost:3000/health
curl http://localhost/health
```

### 7. Set Up Automatic Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ai-travel-assistant/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR
docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password@localhost:27017/travel-assistant?authSource=admin" --out=$BACKUP_DIR/backup_$TIMESTAMP
EOF

chmod +x backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /opt/ai-travel-assistant/backup.sh
```

## Monitoring and Maintenance

### 1. Monitor Container Health

```bash
# Check container status
docker-compose ps

# View resource usage
docker stats

# Check logs for errors
docker-compose logs --tail=100 backend
```

### 2. Database Maintenance

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password

# View database stats
db.stats()

# Create indexes
db.users.createIndex({ email: 1 })
db.conversations.createIndex({ userId: 1, createdAt: -1 })
```

### 3. Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### 4. View Application Logs

```bash
# Backend logs
docker-compose logs -f backend

# Access log files
docker-compose exec backend tail -f logs/combined-*.log
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache backend

# Check environment variables
docker-compose config
```

### Database Connection Issues

```bash
# Test MongoDB connection
docker-compose exec backend npm run test:db

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string in .env
cat .env | grep MONGODB_URI
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :80

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old backups
rm -rf backups/backup_*
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Renew certificate
sudo certbot renew

# Copy new certificate
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Add Secrets to GitHub Repository**

   Go to Settings → Secrets and add:
   - `DEPLOY_KEY`: SSH private key for deployment
   - `DEPLOY_HOST`: Production server hostname
   - `DEPLOY_USER`: SSH user for deployment
   - `DEPLOY_PATH`: Deployment path on server

2. **Workflow Triggers**

   - Automatic tests on pull requests
   - Automatic build on push to main/develop
   - Automatic deployment on push to main

3. **View Workflow Status**

   - GitHub Actions tab in repository
   - Check logs for each workflow run

## Performance Optimization

### 1. Enable Caching

```bash
# In nginx.conf, caching is already configured
# Static assets cached for 1 year
# HTML cached for 1 hour
```

### 2. Enable Compression

```bash
# Gzip compression is enabled in nginx.conf
# Reduces response size by ~70%
```

### 3. Database Optimization

```bash
# Ensure indexes are created
docker-compose exec backend npm run migrate

# Monitor slow queries
docker-compose exec mongodb mongosh
> db.setProfilingLevel(1, { slowms: 100 })
```

### 4. Monitor Performance

```bash
# Check response times
docker-compose logs backend | grep "response time"

# Monitor resource usage
docker stats
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable MongoDB authentication
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates

## Support and Documentation

- **API Documentation**: See `backend/README.md`
- **Frontend Documentation**: See `README.md`
- **Issue Tracking**: GitHub Issues
- **Deployment Issues**: Check logs and troubleshooting section

## Rollback Procedure

If deployment fails:

```bash
# The deploy.sh script automatically creates backups
# To manually rollback:

# Stop current containers
docker-compose down

# Restore from backup
cp -r backups/backup_YYYYMMDD_HHMMSS/* .

# Start previous version
docker-compose up -d
```

---

For more information, see the main README.md and backend/README.md files.
