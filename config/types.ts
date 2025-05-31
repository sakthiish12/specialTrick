export interface Config {
  env: string;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  database: {
    url: string | undefined;
    maxConnections: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  storage: {
    bucket: string;
    maxFileSize: number;
    allowedTypes: string[];
  };
  auth: {
    jwtSecret: string | undefined;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  logging: {
    level: string;
    format: string;
    directory: string;
    maxSize: number;
    maxFiles: number;
    timestamp: boolean;
    colorize: boolean;
  };
  sentry: {
    dsn: string | undefined;
    environment: string | undefined;
    tracesSampleRate: number;
    maxBreadcrumbs: number;
    attachStacktrace: boolean;
    debug: boolean;
  };
  alerting: {
    slack: {
      webhookUrl: string | undefined;
      channel: string;
      username: string;
      iconEmoji: string;
    };
    email: {
      smtp: {
        host: string | undefined;
        port: number;
        secure: boolean;
        auth: {
          user: string | undefined;
          pass: string | undefined;
        };
      };
      from: string;
      to: string[];
    };
    pagerduty: {
      apiKey: string | undefined;
      serviceId: string | undefined;
      escalationPolicy: string | undefined;
    };
  };
  monitoring: {
    metrics: {
      enabled: boolean;
      interval: number;
      prefix: string;
      labels: {
        environment: string | undefined;
        version: string | undefined;
      };
    };
    health: {
      enabled: boolean;
      interval: number;
      timeout: number;
      threshold: number;
    };
    performance: {
      enabled: boolean;
      sampleRate: number;
      thresholds: {
        responseTime: number;
        errorRate: number;
        cpuUsage: number;
        memoryUsage: number;
      };
    };
  };
  retention: {
    application: string;
    audit: string;
    security: string;
    performance: string;
  };
  aggregation: {
    elasticsearch: {
      node: string | undefined;
      index: string;
      auth: {
        username: string | undefined;
        password: string | undefined;
      };
    };
  };
  cache: {
    ttl: number;
    maxSize: number;
    checkPeriod: number;
  };
  features: {
    enableBetaFeatures: boolean;
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
  security: {
    cors: {
      origin: string[];
      methods: string[];
      allowedHeaders: string[];
    };
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: string[];
          scriptSrc: string[];
          styleSrc: string[];
          imgSrc: string[];
          connectSrc: string[];
        };
      };
    };
  };
  performance: {
    compression: {
      enabled: boolean;
      level: number;
    };
    cacheControl: {
      maxAge: number;
      staleWhileRevalidate: number;
    };
  };
} 