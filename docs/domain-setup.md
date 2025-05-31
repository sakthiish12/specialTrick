# Domain and SSL Certificate Setup

This document outlines the process for setting up and managing domains and SSL certificates for the portfolio platform.

## Domain Configuration

### Primary Domain
- **Domain**: portfolio-g8.com
- **Type**: Apex domain
- **Provider**: Vercel

### Subdomain Configuration
- **www.portfolio-g8.com**: Redirects to apex domain
- **staging.portfolio-g8.com**: Staging environment
- **api.portfolio-g8.com**: API endpoints

## DNS Records

### Required DNS Records
```dns
# Apex Domain
portfolio-g8.com.     A     76.76.21.21
portfolio-g8.com.     AAAA  2606:4700:3034::ac43:21a5

# www Subdomain
www.portfolio-g8.com. CNAME cname.vercel-dns.com.

# Verification
_vercel.portfolio-g8.com. TXT vercel-dns-verification
```

## SSL Certificate

### Configuration
- **Provider**: Vercel (Let's Encrypt)
- **Type**: Wildcard certificate
- **Minimum TLS Version**: 1.2
- **HSTS**: Enabled
- **Auto-renewal**: Enabled

### Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Setup Process

1. **Domain Registration**
   - Register domain with preferred registrar
   - Ensure domain is unlocked for transfer
   - Verify domain ownership

2. **DNS Configuration**
   - Add required DNS records
   - Wait for DNS propagation (up to 48 hours)
   - Verify DNS configuration

3. **SSL Certificate**
   - Automatic provisioning through Vercel
   - Verify certificate installation
   - Test SSL configuration

4. **Domain Verification**
   - Add verification TXT record
   - Wait for verification (up to 24 hours)
   - Confirm domain ownership

## Maintenance

### Regular Tasks
- Monitor SSL certificate expiration
- Check DNS record validity
- Verify domain redirects
- Test SSL configuration

### Security Checks
- SSL Labs grade monitoring
- HSTS preload status
- Certificate transparency logs
- Security headers validation

## Troubleshooting

### Common Issues

1. **DNS Propagation**
   - Check DNS propagation status
   - Verify record configuration
   - Clear DNS cache
   - Wait for TTL expiration

2. **SSL Issues**
   - Verify certificate installation
   - Check certificate chain
   - Validate SSL configuration
   - Test SSL handshake

3. **Domain Redirects**
   - Verify redirect configuration
   - Check HTTP status codes
   - Test redirect chains
   - Validate canonical URLs

## Best Practices

1. **Security**
   - Enable HSTS
   - Use secure cookies
   - Implement CSP
   - Regular security audits

2. **Performance**
   - Enable HTTP/2
   - Configure CDN
   - Optimize DNS
   - Monitor SSL handshake

3. **Monitoring**
   - SSL certificate expiration
   - DNS record changes
   - Security header compliance
   - Domain health checks 