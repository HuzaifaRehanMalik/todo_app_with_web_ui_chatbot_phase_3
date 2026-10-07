import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string | undefined;
  aiProviderApiKey: string | undefined;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
}

/**
 * Environment Configuration
 * Centralized configuration management for environment variables
 */

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  aiProviderApiKey: process.env.GEMINI_API_KEY || process.env.ANY_AI_PROVIDER_KEY,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'todo_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  }
};

// Validate required environment variables
const requiredVars = ['JWT_SECRET', 'GEMINI_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
  console.warn('Please check your .env file against .env.example');
}

export default config;
