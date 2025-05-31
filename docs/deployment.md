# Deployment Guide

This document outlines the deployment process for the portfolio platform on Vercel.

## Prerequisites

- Vercel account
- GitHub account
- Supabase project
- OpenAI API key
- GitHub personal access token

## Environment Variables

The following environment variables need to be set in the Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `GITHUB_TOKEN`: GitHub personal access token
- `NEXT_PUBLIC_VERCEL_URL`: Vercel deployment URL (automatically set)

## Deployment Process

1. **Initial Setup**
   - Connect your GitHub repository to Vercel
   - Configure the project settings in Vercel dashboard
   - Set up environment variables
   - Configure build settings

2. **Build Configuration**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

3. **Deployment Settings**
   - Framework Preset: Next.js
   - Node.js Version: 18.x
   - Build Cache: Enabled
   - Auto-cancellation: Enabled

4. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure SSL certificate
   - Set up DNS records

## Deployment Environments

### Production
- Branch: `main`
- Environment: Production
- Auto-deploy: Enabled
- Preview deployments: Disabled

### Preview
- Branch: `develop`
- Environment: Preview
- Auto-deploy: Enabled
- Preview deployments: Enabled

### Development
- Branch: `feature/*`
- Environment: Development
- Auto-deploy: Disabled
- Preview deployments: Enabled

## Monitoring

- Vercel Analytics enabled
- Error tracking configured
- Performance monitoring active
- Build logs accessible in Vercel dashboard

## Rollback Process

1. Access Vercel dashboard
2. Navigate to Deployments
3. Select the deployment to rollback to
4. Click "Redeploy"

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify environment variables
   - Check for dependency conflicts

2. **Deployment Errors**
   - Verify build output
   - Check for missing environment variables
   - Review deployment logs

3. **Runtime Errors**
   - Check application logs
   - Verify API endpoints
   - Review error tracking

### Support

For deployment-related issues:
1. Check Vercel documentation
2. Review build logs
3. Contact Vercel support if needed

## Security Considerations

- Environment variables are encrypted
- API routes are protected
- CORS is configured
- Security headers are set
- Rate limiting is enabled

## Performance Optimization

- Edge caching enabled
- Image optimization configured
- Static page generation
- ISR for dynamic content
- API route caching

## Backup and Recovery

- Database backups configured
- Content versioning enabled
- Deployment history maintained
- Rollback capability available 