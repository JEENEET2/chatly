// Chatly Configuration
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 8080,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database - MongoDB for Chatly
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatly',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'chatly-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Telegram API (for MTProto bridge if needed)
  telegram: {
    apiId: process.env.TELEGRAM_API_ID || '',
    apiHash: process.env.TELEGRAM_API_HASH || ''
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024 * 1024, // 2GB
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || './logs'
  },
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  
  // WebSocket
  websocket: {
    cors: {
      origin: process.env.WS_CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    pingInterval: 25000,
    pingTimeout: 60000
  }
};

export default config;
