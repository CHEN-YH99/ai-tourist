# Production Deployment Checklist

Use this checklist to ensure all aspects of the application are properly configured for production deployment.

## Pre-Deployment

### Environment Configuration
- [ ] `.env.production` file created with all required variables
- [ ] `JWT_SECRET` is a strong random value (32+ characters)
- [ ] `OPENAI_API_KEY` is valid and has sufficient quota
- [ ] `MONGODB_URI` points to production MongoDB Atlas cluster
- [ ] `FRONTEND_URL` matches your production domain
- [ ] `CORS_ORIGIN` is set to your production domain
- [ ] `NODE_ENV` is set to `production`
- [ ] `LOG_LEVEL` is set to `info` (not `debug`)

### Database Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with strong password
- [ ] IP whitelist configured to allow production server
- [ ] Backup enabled in MongoDB Atlas
- [ ] Database indexes created
- [ ] Connection string tested and working

### SSL/TLS Certificates
- [ ] SSL certificates obtained (Let's Encrypt or commercial)
- [ ] Certificates copied to `./ssl/` directory
- [ ] Certificate expiration date noted
- [ ] Auto-renewal configured (if using Let's Encrypt)
- [ ] HTTPS enabled in nginx.conf
- [ ] HTTP to HTTPS redirect configured

### Docker Configuration
- [ ] Docker and Docker Compose installed on production server
- [ ] `.dockerignore` files configured
- [ ] Docker images build successfully
- [ ] Docker Compose configuration tested locally
- [ ] Health checks configured for all services
- [ ] Resource limits set appropriately

### Security
- [ ] All default passwords changed
- [ ] SSH keys configured for deployment
- [ ] Firewall rules configured (allow 80, 443, deny others)
- [ ] Rate limiting configured in nginx
- [ ] Security headers configured in nginx
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection prevention (if applicable)
- [ ] XSS protection enabled

### Monitoring and Logging
- [ ] Log rotation configured
- [ ] Log files location determined
- [ ] Monitoring tools configured (optional)
- [ ] Alert thresholds set
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring enabled

### Backup and Recovery
- [ ] Backup strategy defined
- [ ] Backup script created and tested
- [ ] Backup location secured
- [ ] Restore procedure documented and tested
- [ ] Backup retention policy set
- [ ] Automated backups scheduled

### CI/CD Pipeline
- [ ] GitHub Actions secrets configured
- [ ] Deploy key generated and added to GitHub
- [ ] Deployment script tested
- [ ] Rollback procedure documented
- [ ] Notification system configured

## Deployment Day

### Pre-Deployment Checks
- [ ] All code committed and pushed to main branch
- [ ] All tests passing
- [ ] Code review completed
- [ ] Deployment window scheduled
- [ ] Team notified of deployment
- [ ] Backup of current production taken

### Deployment Steps
- [ ] Pull latest code from repository
- [ ] Build Docker images
- [ ] Run database migrations
- [ ] Stop old containers
- [ ] Start new containers
- [ ] Wait for services to become healthy
- [ ] Run health checks
- [ ] Verify all endpoints responding

### Post-Deployment Verification
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] AI chat functionality works
- [ ] Itinerary generation works
- [ ] Destination browsing works
- [ ] Search functionality works
- [ ] Collection/favorites work
- [ ] File uploads work
- [ ] Error handling works
- [ ] Logging working correctly
- [ ] Performance acceptable

### Monitoring
- [ ] Monitor error logs for 30 minutes
- [ ] Monitor application performance
- [ ] Check database performance
- [ ] Verify backup completed
- [ ] Monitor user activity

## Post-Deployment

### Documentation
- [ ] Deployment notes documented
- [ ] Any issues encountered documented
- [ ] Solutions applied documented
- [ ] Performance metrics recorded
- [ ] Deployment time recorded

### Communication
- [ ] Team notified of successful deployment
- [ ] Users notified of new features (if applicable)
- [ ] Status page updated
- [ ] Release notes published

### Monitoring (Ongoing)
- [ ] Daily log review
- [ ] Weekly performance review
- [ ] Monthly security review
- [ ] Quarterly backup restoration test

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor disk space
- [ ] Verify backups completed

### Weekly
- [ ] Review performance metrics
- [ ] Check for security updates
- [ ] Test backup restoration

### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Database maintenance
- [ ] Certificate expiration check

### Quarterly
- [ ] Full backup restoration test
- [ ] Disaster recovery drill
- [ ] Security penetration test
- [ ] Capacity planning review

## Rollback Procedure

If issues occur after deployment:

1. [ ] Identify the issue
2. [ ] Notify team
3. [ ] Stop new containers: `docker-compose down`
4. [ ] Restore from backup: `cp -r backups/backup_YYYYMMDD_HHMMSS/* .`
5. [ ] Start previous version: `docker-compose up -d`
6. [ ] Verify services are running
7. [ ] Document what went wrong
8. [ ] Plan fix for next deployment

## Emergency Contacts

- **DevOps Lead**: [Name] - [Phone/Email]
- **Database Admin**: [Name] - [Phone/Email]
- **Security Officer**: [Name] - [Phone/Email]
- **On-Call Support**: [Phone/Email]

## Useful Commands

```bash
# View container status
docker-compose ps

# View logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend npm run migrate

# Restart service
docker-compose restart backend

# View resource usage
docker stats

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://..." --out=/backups/

# Restore database
docker-compose exec mongodb mongorestore --uri="mongodb://..." /backups/

# Check disk space
df -h

# Check memory usage
free -h

# View running processes
ps aux | grep docker
```

## Notes

Use this section to add any deployment-specific notes or issues:

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Notes**: _______________________________________________

---

**Last Updated**: [Date]
**Next Review**: [Date]
