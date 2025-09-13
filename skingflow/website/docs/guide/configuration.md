# Configuration

SkinFlow provides extensive configuration options to customize behavior for different use cases. This guide covers all available configuration options and best practices.

## Configuration Structure

SkinFlow uses a hierarchical configuration structure:

```javascript
const config = {
  // LLM Configuration
  llm: {},

  // Memory Configuration
  memory: {},

  // Tool Configuration
  tools: {},

  // Agent Configuration
  agents: {},

  // Security Configuration
  security: {},

  // Performance Configuration
  performance: {},

  // Logging Configuration
  logging: {},

  // Plugin Configuration
  plugins: []
}
```

## LLM Configuration

### Provider Configuration

#### OpenAI
```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeout: 30000,
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        return error.status === 429 || error.status >= 500
      }
    }
  }
})
```

#### Anthropic Claude
```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000,
    retry: {
      maxRetries: 3,
      retryDelay: 2000
    }
  }
})
```

#### Custom HTTP Provider
```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'http',
    apiKey: 'your-api-key',
    baseUrl: 'https://your-llm-api.com/v1/chat/completions',
    model: 'your-model-name',
    headers: {
      'Custom-Header': 'value'
    },
    formatRequest: (messages, options) => {
      // Custom request formatting
      return {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        ...options
      }
    },
    parseResponse: (response) => {
      // Custom response parsing
      return {
        content: response.choices[0].message.content,
        usage: response.usage
      }
    }
  }
})
```

### Model Selection Strategy

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    // Primary model
    model: 'gpt-4',

    // Fallback models for different scenarios
    fallbackModels: {
      // Fallback for long contexts
      longContext: 'gpt-4-1106-preview',
      // Fallback for fast responses
      fast: 'gpt-3.5-turbo',
      // Fallback for coding tasks
      coding: 'gpt-4',
      // Fallback for creative tasks
      creative: 'claude-3-sonnet-20240229'
    },

    // Model selection strategy
    modelSelection: {
      strategy: 'adaptive', // 'adaptive', 'manual', 'cost-based'
      costThreshold: 0.01, // $ per 1K tokens
      contextThreshold: 8000, // tokens
      taskTypeMapping: {
        coding: 'gpt-4',
        writing: 'claude-3-sonnet-20240229',
        analysis: 'gpt-4',
        chat: 'gpt-3.5-turbo'
      }
    }
  }
})
```

## Memory Configuration

### Storage Types

#### In-Memory Storage (Development)
```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'memory',
      maxItems: 1000,
      ttl: 3600000 // 1 hour
    }
  }
})
```

#### SQLite Storage (Production)
```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'sqlite',
      config: {
        database: './skingflow.db',
        maxConnections: 5,
        timeout: 30000
      }
    }
  }
})
```

#### PostgreSQL Storage (Enterprise)
```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password',
        ssl: false,
        connectionTimeout: 30000,
        maxConnections: 20,
        idleTimeout: 300000
      }
    }
  }
})
```

### Memory Management

```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {/* ... */}
    },

    // Memory limits
    maxShortTermMemory: 100,      // Items in short-term memory
    maxLongTermMemory: 10000,     // Items in long-term memory
    maxContextLength: 4000,       // Max context tokens

    // Memory consolidation
    consolidation: {
      enabled: true,
      interval: 300000,           // 5 minutes
      importanceThreshold: 0.7,   // Importance score threshold
      batchSize: 50
    },

    // Semantic search
    search: {
      enabled: true,
      provider: 'openai',         // 'openai', 'anthropic', 'local'
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      similarityThreshold: 0.7
    },

    // Memory retention
    retention: {
      defaultTTL: 2592000000,     // 30 days
      user Memories: {
        conversations: 7776000000,  // 90 days
        preferences: 31536000000   // 1 year
      }
    }
  }
})
```

## Tool Configuration

### Built-in Tools
```javascript
const framework = await createMultiAgentFramework({
  tools: {
    // Enable/disable built-in tools
    enableFileSystem: true,
    enableWebTools: true,
    enableDataTools: true,
    enableCodeTools: true,

    // Tool-specific configuration
    fileSystem: {
      basePath: './workspace',
      allowedPaths: ['./workspace', './temp'],
      restrictedPaths: ['/etc', '/system', '~/.ssh'],
      maxFileSize: 10485760, // 10MB
      allowedExtensions: ['.txt', '.md', '.js', '.json', '.csv']
    },

    webTools: {
      timeout: 10000,
      maxRetries: 3,
      allowedDomains: ['*'],
      blockedDomains: [],
      userAgent: 'SkinFlow/1.0.0'
    },

    codeTools: {
      maxExecutionTime: 30000,
      memoryLimit: '512MB',
      allowedPackages: ['lodash', 'axios', 'moment']
    }
  }
})
```

### Custom Tools
```javascript
const customTools = [
  {
    name: 'database_query',
    description: 'Execute database queries safely',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to execute'
        },
        params: {
          type: 'array',
          description: 'Query parameters',
          items: { type: 'string' }
        }
      },
      required: ['query']
    },
    permissions: ['database:read'],
    handler: async (params, context) => {
      // Database query implementation
      const result = await context.database.query(params.query, params.params)
      return {
        success: true,
        data: result,
        rowsAffected: result.rowCount
      }
    }
  }
]

const framework = await createMultiAgentFramework({
  tools: {
    customTools: customTools
  }
})
```

### Tool Security
```javascript
const framework = await createMultiAgentFramework({
  tools: {
    security: {
      // Sandbox configuration
      sandbox: {
        enabled: true,
        timeout: 30000,
        memoryLimit: '512MB',
        allowedModules: ['fs', 'path', 'crypto'],
        blockedModules: ['child_process', 'net', 'dgram']
      },

      // Permission system
      permissions: {
        enabled: true,
        defaultPermissions: ['read:basic'],
        rolePermissions: {
          admin: ['*'],
          user: ['read:basic', 'write:basic'],
          guest: ['read:basic']
        }
      },

      // Rate limiting
      rateLimit: {
        enabled: true,
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        skipSuccessfulRequests: false
      }
    }
  }
})
```

## Agent Configuration

### Agent Management
```javascript
const framework = await createMultiAgentFramework({
  agents: {
    // Concurrency settings
    maxConcurrentAgents: 5,
    maxConcurrentTasks: 10,

    // Agent lifecycle
    lifecycle: {
      idleTimeout: 300000, // 5 minutes
      healthCheckInterval: 60000, // 1 minute
      restartOnFailure: true,
      maxRestarts: 3
    },

    // Agent-specific configuration
    types: {
      planning: {
        model: 'gpt-4',
        maxPlanningSteps: 20,
        timeout: 60000
      },
      research: {
        model: 'gpt-4',
        tools: ['web_search', 'document_analysis'],
        timeout: 120000
      },
      coding: {
        model: 'gpt-4',
        tools: ['code_execution', 'file_operations'],
        timeout: 180000
      },
      analysis: {
        model: 'gpt-4',
        tools: ['data_processing', 'visualization'],
        timeout: 90000
      }
    },

    // Coordination settings
    coordination: {
      communicationTimeout: 30000,
      maxRetries: 3,
      fallbackStrategy: 'continue' // 'continue', 'retry', 'fail'
    }
  }
})
```

## Security Configuration

### Authentication
```javascript
const framework = await createMultiAgentFramework({
  security: {
    authentication: {
      enabled: true,
      strategy: 'jwt', // 'jwt', 'oauth', 'custom'
      jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
        issuer: 'skingflow',
        audience: 'skingflow-users'
      },
      oauth: {
        provider: 'google',
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/auth/callback'
      }
    },

    authorization: {
      enabled: true,
      strategy: 'rbac', // 'rbac', 'abac', 'custom'
      roles: {
        admin: ['*'],
        developer: ['read', 'write', 'execute'],
        user: ['read', 'write'],
        guest: ['read']
      }
    }
  }
})
```

### Data Protection
```javascript
const framework = await createMultiAgentFramework({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90,
      fields: ['user.preferences', 'system.config']
    },

    audit: {
      enabled: true,
      logLevel: 'info',
      includeSensitiveData: false,
      retentionDays: 365
    },

    pii: {
      enabled: true,
      detectionMethod: 'regex', // 'regex', 'ml', 'both'
      redactionStrategy: 'mask', // 'mask', 'remove', 'encrypt'
      customPatterns: [
        {
          name: 'custom_id',
          pattern: /[A-Z]{2}-\d{5}/,
          replacement: '[REDACTED_ID]'
        }
      ]
    }
  }
})
```

## Performance Configuration

### Caching
```javascript
const framework = await createMultiAgentFramework({
  performance: {
    cache: {
      enabled: true,
      provider: 'memory', // 'memory', 'redis', 'file'
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      strategy: 'lru', // 'lru', 'lfu', 'fifo'

      redis: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0
      },

      strategies: {
        llm: {
          enabled: true,
          keyGenerator: (messages, options) => {
            return `llm:${hash(messages)}:${JSON.stringify(options)}`
          }
        },
        memory: {
          enabled: true,
          keyGenerator: (query, options) => {
            return `memory:${hash(query)}:${options.userId}`
          }
        },
        tools: {
          enabled: true,
          keyGenerator: (toolName, params) => {
            return `tool:${toolName}:${hash(params)}`
          }
        }
      }
    }
  }
})
```

### Resource Management
```javascript
const framework = await createMultiAgentFramework({
  performance: {
    resources: {
      // Memory limits
      memory: {
        maxHeapUsage: '1GB',
        gcInterval: 300000, // 5 minutes
        threshold: 0.8 // 80% usage triggers GC
      },

      // CPU management
      cpu: {
        maxCores: 4,
        loadBalancing: true,
        priority: 'normal' // 'low', 'normal', 'high'
      },

      // Connection pooling
      connections: {
        llm: {
          maxConnections: 10,
          minConnections: 2,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 300000
        },
        database: {
          maxConnections: 20,
          minConnections: 5,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 300000
        }
      }
    }
  }
})
```

## Logging Configuration

### Basic Logging
```javascript
const framework = await createMultiAgentFramework({
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error', 'silent'
    format: 'json', // 'json', 'text', 'pretty'
    outputs: [
      {
        type: 'console',
        level: 'info'
      },
      {
        type: 'file',
        level: 'debug',
        filename: './logs/skingflow.log',
        maxSize: '10MB',
        maxFiles: 5
      }
    ]
  }
})
```

### Advanced Logging
```javascript
const framework = await createMultiAgentFramework({
  logging: {
    level: 'info',

    // Log format
    format: {
      timestamp: true,
      level: true,
      category: true,
      requestId: true,
      userId: true,
      duration: true,
      error: true,
      customFields: {
        environment: process.env.NODE_ENV,
        version: '1.0.0'
      }
    },

    // Log outputs
    outputs: [
      {
        type: 'console',
        level: 'info',
        colorize: true
      },
      {
        type: 'file',
        level: 'debug',
        filename: './logs/skingflow.log',
        maxSize: '10MB',
        maxFiles: 5,
        datePattern: 'YYYY-MM-DD'
      },
      {
        type: 'elasticsearch',
        level: 'info',
        host: 'localhost',
        port: 9200,
        index: 'skingflow-logs'
      }
    ],

    // Request logging
    request: {
      enabled: true,
      includeHeaders: false,
      includeBody: false,
      includeResponse: false,
      sensitiveFields: ['password', 'token', 'key']
    },

    // Performance logging
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
      includeMemory: true,
      includeCPU: true,
      includeLLMCalls: true,
      includeToolCalls: true
    }
  }
})
```

## Environment-Based Configuration

### Development Configuration
```javascript
// config/development.js
export default {
  llm: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  },
  memory: {
    storage: {
      type: 'memory'
    }
  },
  logging: {
    level: 'debug'
  }
}
```

### Production Configuration
```javascript
// config/production.js
export default {
  llm: {
    model: 'gpt-4',
    temperature: 0.3,
    retry: {
      maxRetries: 5
    }
  },
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
    }
  },
  security: {
    authentication: {
      enabled: true
    }
  },
  logging: {
    level: 'info',
    outputs: [
      {
        type: 'elasticsearch',
        host: process.env.ELASTICSEARCH_HOST
      }
    ]
  }
}
```

### Configuration Loading
```javascript
import config from './config/index.js'

const framework = await createMultiAgentFramework(config)
```

## Configuration Validation

SkinFlow includes built-in configuration validation:

```javascript
try {
  const framework = await createMultiAgentFramework({
    // Invalid configuration
    llm: {
      provider: 'invalid-provider',
      apiKey: null
    }
  })
} catch (error) {
  console.error('Configuration error:', error.message)
  // Output: Configuration validation failed: Invalid LLM provider: invalid-provider
}
```

### Custom Validation
```javascript
const config = {
  // Your configuration
}

// Validate configuration
const validation = await validateConfig(config)
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors)
  process.exit(1)
}

const framework = await createMultiAgentFramework(config)
```

## Configuration Best Practices

### 1. Environment Variables
```javascript
// .env file
OPENAI_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### 2. Configuration Files
```javascript
// config/index.js
import { load } from 'dotenv-safe'
import path from 'path'

load()

const env = process.env.NODE_ENV || 'development'

const baseConfig = {
  // Base configuration
}

const envConfig = await import(`./${env}.js`)

export default {
  ...baseConfig,
  ...envConfig.default
}
```

### 3. Runtime Configuration Updates
```javascript
// Update configuration at runtime
await framework.updateConfig({
  logging: {
    level: 'debug'
  }
})
```

### 4. Configuration Monitoring
```javascript
// Monitor configuration changes
framework.on('configUpdated', (newConfig) => {
  console.log('Configuration updated:', newConfig)
})
```

## Next Steps

- [API Reference](../api/framework.md) - Detailed API documentation
- [Examples](../examples/quick-start.md) - Practical implementations
- [Troubleshooting](../troubleshooting.md) - Common issues and solutions