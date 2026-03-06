export default () => ({
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
});
