import { Config } from './types';

const loggingConfig: Config = {
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    directory: 'logs',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    timestamp: true,
    colorize: process.env.NODE_ENV !== 'production',
  },

  // Sentry Configuration
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    debug: process.env.NODE_ENV === 'development',
  },

  // Alerting Configuration
  alerting: {
    // Slack Integration
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#alerts',
      username: 'Portfolio Alert Bot',
      iconEmoji: ':warning:',
    },

    // Email Alerts
    email: {
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: 'alerts@portfolio-g8.com',
      to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
    },

    // PagerDuty Integration
    pagerduty: {
      apiKey: process.env.PAGERDUTY_API_KEY,
      serviceId: process.env.PAGERDUTY_SERVICE_ID,
      escalationPolicy: process.env.PAGERDUTY_ESCALATION_POLICY,
    },
  },

  // Monitoring Configuration
  monitoring: {
    // Application Metrics
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
      prefix: 'portfolio_g8_',
      labels: {
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION,
      },
    },

    // Health Checks
    health: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      threshold: 3, // Number of failures before alert
    },

    // Performance Monitoring
    performance: {
      enabled: true,
      sampleRate: 0.1, // 10% of requests
      thresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.01, // 1%
        cpuUsage: 80, // 80%
        memoryUsage: 80, // 80%
      },
    },
  },

  // Log Retention
  retention: {
    application: '30d',
    audit: '90d',
    security: '365d',
    performance: '7d',
  },

  // Log Aggregation
  aggregation: {
    elasticsearch: {
      node: process.env.ELASTICSEARCH_URL,
      index: `portfolio-g8-${process.env.NODE_ENV}`,
      auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASS,
      },
    },
  },
};

export default loggingConfig; 