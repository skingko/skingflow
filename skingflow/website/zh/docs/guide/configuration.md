# 配置

SkinFlow 提供广泛的配置选项，可为不同用例自定义行为。本指南涵盖所有可用的配置选项和最佳实践。

## 配置结构

SkinFlow 使用分层配置结构：

```javascript
const config = {
  // LLM 配置
  llm: {},

  // 内存配置
  memory: {},

  // 工具配置
  tools: {},

  // 智能体配置
  agents: {},

  // 安全配置
  security: {},

  // 性能配置
  performance: {},

  // 日志配置
  logging: {},

  // 插件配置
  plugins: []
}
```

## LLM 配置

### 提供商配置

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

#### 自定义 HTTP 提供商
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
      // 自定义请求格式化
      return {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        ...options
      }
    },
    parseResponse: (response) => {
      // 自定义响应解析
      return {
        content: response.choices[0].message.content,
        usage: response.usage
      }
    }
  }
})
```

### 模型选择策略

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    // 主模型
    model: 'gpt-4',

    // 不同场景的回退模型
    fallbackModels: {
      // 长上下文回退
      longContext: 'gpt-4-1106-preview',
      // 快速响应回退
      fast: 'gpt-3.5-turbo',
      // 编程任务回退
      coding: 'gpt-4',
      // 创意任务回退
      creative: 'claude-3-sonnet-20240229'
    },

    // 模型选择策略
    modelSelection: {
      strategy: 'adaptive', // 'adaptive', 'manual', 'cost-based'
      costThreshold: 0.01, // 每 1K 令牌的美元
      contextThreshold: 8000, // 令牌数
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

## 内存配置

### 存储类型

#### 内存存储（开发）
```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'memory',
      maxItems: 1000,
      ttl: 3600000 // 1 小时
    }
  }
})
```

#### SQLite 存储（生产）
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

#### PostgreSQL 存储（企业）
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

### 内存管理

```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {/* ... */}
    },

    // 内存限制
    maxShortTermMemory: 100,      // 短期内存中的项目数
    maxLongTermMemory: 10000,     // 长期内存中的项目数
    maxContextLength: 4000,       // 最大上下文令牌数

    // 内存整合
    consolidation: {
      enabled: true,
      interval: 300000,           // 5 分钟
      importanceThreshold: 0.7,   // 重要性分数阈值
      batchSize: 50
    },

    // 语义搜索
    search: {
      enabled: true,
      provider: 'openai',         // 'openai', 'anthropic', 'local'
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      similarityThreshold: 0.7
    },

    // 内存保留
    retention: {
      defaultTTL: 2592000000,     // 30 天
      userMemories: {
        conversations: 7776000000,  // 90 天
        preferences: 31536000000   // 1 年
      }
    }
  }
})
```

## 工具配置

### 内置工具
```javascript
const framework = await createMultiAgentFramework({
  tools: {
    // 启用/禁用内置工具
    enableFileSystem: true,
    enableWebTools: true,
    enableDataTools: true,
    enableCodeTools: true,

    // 工具特定配置
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

### 自定义工具
```javascript
const customTools = [
  {
    name: 'database_query',
    description: '安全执行数据库查询',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '要执行的 SQL 查询'
        },
        params: {
          type: 'array',
          description: '查询参数',
          items: { type: 'string' }
        }
      },
      required: ['query']
    },
    permissions: ['database:read'],
    handler: async (params, context) => {
      // 数据库查询实现
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

### 工具安全
```javascript
const framework = await createMultiAgentFramework({
  tools: {
    security: {
      // 沙盒配置
      sandbox: {
        enabled: true,
        timeout: 30000,
        memoryLimit: '512MB',
        allowedModules: ['fs', 'path', 'crypto'],
        blockedModules: ['child_process', 'net', 'dgram']
      },

      // 权限系统
      permissions: {
        enabled: true,
        defaultPermissions: ['read:basic'],
        rolePermissions: {
          admin: ['*'],
          user: ['read:basic', 'write:basic'],
          guest: ['read:basic']
        }
      },

      // 速率限制
      rateLimit: {
        enabled: true,
        windowMs: 60000, // 1 分钟
        maxRequests: 100,
        skipSuccessfulRequests: false
      }
    }
  }
})
```

## 智能体配置

### 智能体管理
```javascript
const framework = await createMultiAgentFramework({
  agents: {
    // 并发设置
    maxConcurrentAgents: 5,
    maxConcurrentTasks: 10,

    // 智能体生命周期
    lifecycle: {
      idleTimeout: 300000, // 5 分钟
      healthCheckInterval: 60000, // 1 分钟
      restartOnFailure: true,
      maxRestarts: 3
    },

    // 智能体特定配置
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

    // 协调设置
    coordination: {
      communicationTimeout: 30000,
      maxRetries: 3,
      fallbackStrategy: 'continue' // 'continue', 'retry', 'fail'
    }
  }
})
```

## 安全配置

### 身份验证
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

### 数据保护
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
          replacement: '[已编辑_ID]'
        }
      ]
    }
  }
})
```

## 性能配置

### 缓存
```javascript
const framework = await createMultiAgentFramework({
  performance: {
    cache: {
      enabled: true,
      provider: 'memory', // 'memory', 'redis', 'file'
      ttl: 300000, // 5 分钟
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

### 资源管理
```javascript
const framework = await createMultiAgentFramework({
  performance: {
    resources: {
      // 内存限制
      memory: {
        maxHeapUsage: '1GB',
        gcInterval: 300000, // 5 分钟
        threshold: 0.8 // 80% 使用率触发 GC
      },

      // CPU 管理
      cpu: {
        maxCores: 4,
        loadBalancing: true,
        priority: 'normal' // 'low', 'normal', 'high'
      },

      // 连接池
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

## 日志配置

### 基础日志记录
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

### 高级日志记录
```javascript
const framework = await createMultiAgentFramework({
  logging: {
    level: 'info',

    // 日志格式
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

    // 日志输出
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

    // 请求日志记录
    request: {
      enabled: true,
      includeHeaders: false,
      includeBody: false,
      includeResponse: false,
      sensitiveFields: ['password', 'token', 'key']
    },

    // 性能日志记录
    metrics: {
      enabled: true,
      interval: 60000, // 1 分钟
      includeMemory: true,
      includeCPU: true,
      includeLLMCalls: true,
      includeToolCalls: true
    }
  }
})
```

## 基于环境的配置

### 开发配置
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

### 生产配置
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

### 配置加载
```javascript
import config from './config/index.js'

const framework = await createMultiAgentFramework(config)
```

## 配置验证

SkinFlow 包含内置配置验证：

```javascript
try {
  const framework = await createMultiAgentFramework({
    // 无效配置
    llm: {
      provider: 'invalid-provider',
      apiKey: null
    }
  })
} catch (error) {
  console.error('配置错误:', error.message)
  // 输出：配置验证失败：无效的 LLM 提供商：invalid-provider
}
```

### 自定义验证
```javascript
const config = {
  // 您的配置
}

// 验证配置
const validation = await validateConfig(config)
if (!validation.valid) {
  console.error('配置错误:', validation.errors)
  process.exit(1)
}

const framework = await createMultiAgentFramework(config)
```

## 配置最佳实践

### 1. 环境变量
```javascript
// .env 文件
OPENAI_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### 2. 配置文件
```javascript
// config/index.js
import { load } from 'dotenv-safe'
import path from 'path'

load()

const env = process.env.NODE_ENV || 'development'

const baseConfig = {
  // 基础配置
}

const envConfig = await import(`./${env}.js`)

export default {
  ...baseConfig,
  ...envConfig.default
}
```

### 3. 运行时配置更新
```javascript
// 运行时更新配置
await framework.updateConfig({
  logging: {
    level: 'debug'
  }
})
```

### 4. 配置监控
```javascript
// 监控配置更改
framework.on('configUpdated', (newConfig) => {
  console.log('配置已更新:', newConfig)
})
```

## 下一步

- [API 参考](../api/framework.md) - 详细的 API 文档
- [示例](../examples/quick-start.md) - 实际实现
- [故障排除](../troubleshooting.md) - 常见问题和解决方案