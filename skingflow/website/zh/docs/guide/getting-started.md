# 入门指南

本指南将帮助您在几分钟内启动并运行 SkinFlow。

## 前提条件

在开始之前，请确保您拥有：

- **Node.js** 版本 18.0 或更高
- **npm** 或 yarn 包管理器
- **LLM API 密钥**（OpenAI、Anthropic 或兼容）
- **JavaScript/ESM 基础知识**

## 安装

### 1. 安装 SkinFlow

```bash
npm install skingflow
```

### 2. 创建您的项目

为您的 SkinFlow 应用程序创建一个新的 JavaScript 文件：

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'

// 创建框架实例
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  },
  memory: {
    storage: {
      type: 'memory' // 开发环境的内存存储
    }
  }
})
```

### 3. 设置环境变量

在项目根目录创建 `.env` 文件：

```bash
# .env
OPENAI_API_KEY=your-openai-api-key-here
```

## 您的第一个 SkinFlow 应用程序

让我们创建一个可以帮助用户完成任务的简单应用程序：

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function main() {
  // 初始化框架
  const framework = await createMultiAgentFramework({
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4'
    },
    memory: {
      storage: {
        type: 'memory'
      }
    }
  })

  // 处理用户请求
  const result = await framework.processRequest(
    "帮助我创建一个简单的待办事项列表应用程序",
    { userId: 'user123' }
  )

  console.log('结果:', result)
}

main().catch(console.error)
```

运行您的应用程序：

```bash
node app.js
```

## 理解输出

SkinFlow 将会：

1. **分析请求**以理解用户想要什么
2. **创建计划**来完成任务
3. **使用适当的智能体和工具执行计划**
4. **将结果提供**回给用户

## 配置选项

### LLM 配置

SkinFlow 支持多个 LLM 提供商：

```javascript
// OpenAI
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1'
  }
})

// Anthropic Claude
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229'
  }
})

// 自定义 HTTP 提供商
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'http',
    apiKey: 'your-api-key',
    baseUrl: 'https://your-llm-api.com/v1/chat/completions',
    model: 'your-model-name'
  }
})
```

### 内存配置

对于生产环境，您需要持久化存储：

```javascript
// PostgreSQL（推荐用于生产）
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password',
        port: 5432
      }
    }
  }
})

// SQLite（适合开发）
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'sqlite',
      config: {
        database: './skingflow.db'
      }
    }
  }
})
```

### 工具配置

添加自定义工具以扩展功能：

```javascript
const framework = await createMultiAgentFramework({
  tools: {
    customTools: [
      {
        name: 'weather',
        description: '获取当前天气信息',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: '城市名称或邮政编码'
            }
          },
          required: ['location']
        },
        handler: async (params) => {
          // 您的天气 API 实现
          return ` ${params.location}的天气：72°F，晴朗`
        }
      }
    ]
  }
})
```

## 高级配置

对于更复杂的应用程序，您可以配置多个方面：

```javascript
const framework = await createMultiAgentFramework({
  // LLM 配置
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },

  // 内存配置
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password'
      }
    },
    // 内存设置
    maxShortTermMemory: 100,
    maxLongTermMemory: 10000
  },

  // 工具配置
  tools: {
    enableVirtualFileSystem: true,
    customTools: []
  },

  // 智能体配置
  agents: {
    maxConcurrentAgents: 5,
    timeout: 30000 // 30 秒
  },

  // 日志记录和监控
  logging: {
    level: 'info',
    enableMetrics: true
  }
})
```

## 错误处理

SkinFlow 包含强大的错误处理：

```javascript
try {
  const result = await framework.processRequest(
    "您的请求",
    { userId: 'user123' }
  )
  console.log('成功:', result)
} catch (error) {
  if (error.code === 'LLM_API_ERROR') {
    console.error('LLM API 错误:', error.message)
  } else if (error.code === 'MEMORY_ERROR') {
    console.error('内存错误:', error.message)
  } else {
    console.error('意外错误:', error)
  }
}
```

## 下一步

- [核心功能](./core-features.md) - 了解 SkinFlow 的主要功能
- [架构](./architecture.md) - 了解系统设计
- [示例](../../examples/) - 查看实际实现
- [API 参考](../../api/) - 详细的 API 文档

## 故障排除

### 常见问题

**模块未找到错误:**
```bash
# 确保您使用的是 ES 模块
# 在 package.json 中添加 "type": "module"
```

**API 密钥问题:**
```bash
# 验证 .env 文件在正确的位置
# 确保 API 密钥有效且具有适当权限
```

**内存连接错误:**
```bash
# 检查数据库连接参数
# 确保数据库服务器正在运行
```

### 获取帮助

- 查看[故障排除指南](../troubleshooting.md)
- 搜索 [GitHub Issues](https://github.com/skingko/skingflow/issues)
- 加入我们的 [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

恭喜！您现在已经设置了 SkinFlow 并准备好构建智能应用程序。