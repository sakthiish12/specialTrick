# Environment Variables and Secrets Management

This document outlines the environment variables and secrets used in the portfolio platform.

## Required Environment Variables

### Application Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Vercel Configuration
NEXT_PUBLIC_VERCEL_URL=your_vercel_deployment_url

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_BUCKET=backups
```

### Vercel Deployment Variables
```env
# Vercel Project Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## Environment-Specific Variables

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Staging
```env
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://staging.portfolio-g8.vercel.app/api
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://portfolio-g8.vercel.app/api
```

## Secrets Management

### GitHub Secrets
The following secrets need to be configured in your GitHub repository:

1. `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
3. `OPENAI_API_KEY`: OpenAI API key
4. `GITHUB_TOKEN`: GitHub personal access token
5. `VERCEL_TOKEN`: Vercel deployment token
6. `VERCEL_ORG_ID`: Vercel organization ID
7. `VERCEL_PROJECT_ID`: Vercel project ID

### Vercel Environment Variables
Configure these in your Vercel project settings:

1. Production Environment:
   - All required application variables
   - `NODE_ENV=production`

2. Preview Environment:
   - All required application variables
   - `NODE_ENV=preview`

3. Development Environment:
   - All required application variables
   - `NODE_ENV=development`

## Setting Up Secrets

### GitHub Secrets
1. Go to your repository settings
2. Navigate to Secrets and Variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

### Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each environment variable
4. Select the appropriate environments (Production, Preview, Development)

## Security Best Practices

1. **Never commit sensitive values**
   - Use `.env.example` for documentation
   - Add `.env*` to `.gitignore`
   - Use secrets management for sensitive values

2. **Access Control**
   - Limit access to secrets
   - Use environment-specific secrets
   - Rotate secrets regularly

3. **Secret Rotation**
   - Implement regular secret rotation
   - Update all environments when rotating
   - Document rotation process

4. **Monitoring**
   - Monitor secret usage
   - Set up alerts for suspicious activity
   - Log secret access

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values in `.env.local`

3. Never commit `.env.local` to version control

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check all required variables are set
   - Verify variable names match exactly
   - Check for typos

2. **Secret Access Issues**
   - Verify secret permissions
   - Check secret scope
   - Validate secret values

3. **Environment-Specific Problems**
   - Verify correct environment
   - Check environment-specific variables
   - Validate environment configuration 