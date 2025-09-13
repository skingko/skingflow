/**
 * Configuration for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Application Configuration
 */
export const config = {
  // Moonshot LLM Configuration
  llm: {
    provider: 'http',
    baseUrl: process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.cn/v1',
    model: process.env.MOONSHOT_MODEL || 'kimi-k2-0905-preview',
    apiKey: process.env.MOONSHOT_API_KEY,
    temperature: 0.7,
    maxTokens: 4000,
    custom: {
      // Moonshot specific configurations
      stream: true
    }
  },

  // PostgreSQL Memory Storage Configuration
  memory: {
    storage: {
      type: 'postgres',
      config: {
        connectionString: process.env.DATABASE_URL,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'skingflow_agent',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
    },
    maxEntries: parseInt(process.env.MAX_MEMORY_ENTRIES) || 10000,
    similarityThreshold: parseFloat(process.env.MEMORY_SIMILARITY_THRESHOLD) || 0.7,
    autoEmbedding: true,
    embeddingProvider: process.env.OPENAI_API_KEY ? {
      provider: 'openai',
      model: 'text-embedding-ada-002',
      apiKey: process.env.OPENAI_API_KEY
    } : null
  },

  // Tool System Configuration
  tools: {
    loadBuiltin: true,
    directory: path.join(__dirname, '../tools'),
    custom: []
  },

  // Orchestration Configuration
  orchestration: {
    stopOnError: false,
    timeout: 120000, // 2 minutes
    maxRetries: 3,
    maxConcurrency: 5
  },

  // Application Settings
  app: {
    name: process.env.AGENT_NAME || 'SkingflowAgent',
    logLevel: process.env.LOG_LEVEL || 'info',
    port: parseInt(process.env.PORT) || 3000
  }
};

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];

  // Check required LLM configuration
  if (!config.llm.apiKey) {
    errors.push('MOONSHOT_API_KEY is required');
  }

  // Check database configuration
  if (!config.memory.storage.config.connectionString && 
      (!config.memory.storage.config.user || !config.memory.storage.config.password)) {
    errors.push('Database configuration is incomplete. Provide either DATABASE_URL or DB_USER/DB_PASSWORD');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

export default config;
