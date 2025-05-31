# Staging Environment

This document outlines the staging environment setup and usage for pre-production testing.

## Overview

The staging environment is a pre-production environment that mirrors the production setup. It's used for:
- Testing new features
- Validating deployments
- Performance testing
- User acceptance testing
- Security testing

## Access

- **URL**: https://staging.portfolio-g8.vercel.app
- **Database**: staging-db.portfolio-g8.supabase.co
- **Storage**: staging-storage.portfolio-g8.supabase.co

## Environment Variables

```env
# Staging-specific variables
NODE_ENV=staging
NEXT_PUBLIC_VERCEL_ENV=staging
NEXT_PUBLIC_API_URL=https://staging.portfolio-g8.vercel.app/api
```

## Deployment Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push to staging:
   ```bash
   git push origin staging
   ```

4. Monitor deployment:
   ```bash
   vercel list
   ```

## Testing in Staging

### 1. Feature Testing
- Deploy feature to staging
- Run automated tests
- Perform manual testing
- Document any issues

### 2. Performance Testing
- Run Lighthouse audits
- Check Core Web Vitals
- Monitor resource usage
- Compare with production metrics

### 3. Security Testing
- Run security scans
- Check for vulnerabilities
- Verify access controls
- Test authentication flows

### 4. Integration Testing
- Test API integrations
- Verify third-party services
- Check data flows
- Validate webhooks

## Staging Data

### 1. Database
- Separate staging database
- Anonymized production data
- Regular refresh schedule
- Backup enabled

### 2. Storage
- Isolated storage bucket
- Test data only
- Regular cleanup
- Access logging

## Monitoring

### 1. Performance
- Vercel Analytics
- Sentry error tracking
- Custom metrics
- Resource monitoring

### 2. Logs
- Application logs
- Database logs
- Access logs
- Error logs

## Best Practices

1. **Code Quality**
   - Follow coding standards
   - Write tests
   - Document changes
   - Review code

2. **Testing**
   - Test all features
   - Verify integrations
   - Check performance
   - Validate security

3. **Deployment**
   - Use feature branches
   - Follow git flow
   - Monitor deployment
   - Verify changes

4. **Data Management**
   - Use test data
   - Regular cleanup
   - Secure storage
   - Access control

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check build logs
   - Verify environment variables
   - Review dependencies
   - Check for conflicts

2. **Database Issues**
   - Verify connection
   - Check migrations
   - Review permissions
   - Monitor performance

3. **Integration Issues**
   - Check API keys
   - Verify endpoints
   - Test connectivity
   - Review logs

## Maintenance

### 1. Regular Tasks
- Update dependencies
- Clean up old data
- Monitor performance
- Check security

### 2. Backup
- Daily database backup
- Weekly content backup
- Verify backups
- Test restore

### 3. Monitoring
- Check error rates
- Review performance
- Monitor resources
- Update documentation 