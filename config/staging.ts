import { Config } from './types';

const stagingConfig: Config = {
  // Environment
  env: 'staging',
  
  // API Configuration
  api: {
    baseUrl: 'https://staging.portfolio-g8.vercel.app/api',
    timeout: 30000,
    retries: 3,
  },

  // Database Configuration
  database: {
    url: process.env.STAGING_DATABASE_URL,
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Storage Configuration
  storage: {
    bucket: 'staging-storage',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  // Authentication
  auth: {
    jwtSecret: process.env.STAGING_JWT_SECRET,
    jwtExpiresIn: '24h',
    refreshTokenExpiresIn: '7d',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Logging
  logging: {
    level: 'debug',
    format: 'json',
    directory: 'logs/staging',
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.STAGING_SENTRY_DSN,
      environment: 'staging',
      tracesSampleRate: 0.2,
    },
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
    },
  },

  // Cache
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 1000,
    checkPeriod: 600, // 10 minutes
  },

  // Feature Flags
  features: {
    enableBetaFeatures: true,
    enableAnalytics: true,
    enableNotifications: true,
  },

  // Security
  security: {
    cors: {
      origin: ['https://staging.portfolio-g8.vercel.app'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.staging.portfolio-g8.vercel.app'],
        },
      },
    },
  },

  // Performance
  performance: {
    compression: {
      enabled: true,
      level: 6,
    },
    cacheControl: {
      maxAge: 3600,
      staleWhileRevalidate: 60,
    },
  },
};

export default stagingConfig; 