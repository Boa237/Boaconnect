export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'mboa_user',
    password: process.env.DB_PASSWORD || 'mboa_password',
    name: process.env.DB_NAME || 'mboa_connect',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  otp: {
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
    expiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'console',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
  },
  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    maxPhotosPerListing: parseInt(process.env.MAX_PHOTOS_PER_LISTING || '6', 10),
  },
  payments: {
    orangeMoney: {
      merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY,
    },
    mtnMomo: {
      subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    },
  },
});
