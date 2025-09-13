# 快速开始

本快速开始指南将帮助您在几分钟内启动并运行 SkinFlow，并提供一个简单但功能强大的示例。

## 前提条件

在开始之前，请确保您拥有：

- **Node.js** 版本 18.0 或更高
- **npm** 或 yarn 包管理器
- **LLM API 密钥**（OpenAI、Anthropic 或兼容）

## 第 1 步：安装

创建一个新项目并安装 SkinFlow：

```bash
# 创建项目目录
mkdir skinflow-quickstart
cd skinflow-quickstart

# 初始化 npm 项目
npm init -y

# 安装 SkinFlow
npm install skingflow

# 安装 dotenv 用于环境变量
npm install dotenv
```

## 第 2 步：环境设置

为您的 API 密钥创建 `.env` 文件：

```bash
# .env
OPENAI_API_KEY=your-openai-api-key-here
# 或者使用 Anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## 第 3 步：基本应用程序

创建一个简单的应用程序文件：

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function main() {
  console.log('🚀 启动 SkinFlow 快速开始...')

  // 初始化框架
  const framework = await createMultiAgentFramework({
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      temperature: 0.7
    },
    memory: {
      storage: {
        type: 'memory' // 本示例使用内存存储
      }
    },
    logging: {
      level: 'info'
    }
  })

  console.log('✅ 框架初始化成功')

  // 示例 1：简单任务处理
  console.log('\n📝 示例 1：简单任务处理')
  const result1 = await framework.processRequest(
    "在商业中使用人工智能的主要好处是什么？",
    { userId: 'user123' }
  )

  console.log('结果:', result1.content)

  // 示例 2：多步骤任务
  console.log('\n🔨 示例 2：多步骤任务')
  const result2 = await framework.processRequest(
    "研究当前的人工智能趋势并创建简要摘要",
    { userId: 'user123' }
  )

  console.log('摘要:', result2.content)

  // 示例 3：创意任务
  console.log('\n🎨 示例 3：创意任务')
  const result3 = await framework.processRequest(
    "写一首关于人工智能的短诗",
    { userId: 'user123' }
  )

  console.log('诗歌:', result3.content)

  // 示例 4：技术任务
  console.log('\n💻 示例 4：技术任务')
  const result4 = await framework.processRequest(
    "创建一个计算斐波那契数的简单 JavaScript 函数",
    { userId: 'user123' }
  )

  console.log('代码:', result4.content)

  console.log('\n🎉 快速开始完成！')

  // 关闭框架
  await framework.shutdown()
}

main().catch(console.error)
```

## 第 4 步：运行应用程序

执行您的应用程序：

```bash
node app.js
```

您应该看到类似的输出：

```
🚀 启动 SkinFlow 快速开始...
✅ 框架初始化成功

📝 示例 1：简单任务处理
结果: 人工智能为企业提供了许多好处...

🔨 示例 2：多步骤任务
摘要: 当前的人工智能趋势包括生成式 AI 的增加采用...

🎨 示例 3：创意任务
诗歌: 在电路深处，字节如此明亮，
AI 学习并拥有纯粹的洞察力...

💻 示例 4：技术任务
代码: function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

🎉 快速开始完成！
```

## 第 5 步：自定义配置的增强示例

让我们创建一个具有自定义工具和配置的更高级示例：

```javascript
// enhanced-app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

// 自定义天气工具
const weatherTool = {
  name: 'get_weather',
  description: '获取位置的当前天气信息',
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
    // 模拟天气数据 - 在实际应用中，您会调用天气 API
    const weatherData = {
      '北京': { temp: 22, condition: '晴朗', humidity: 65 },
      '上海': { temp: 26, condition: '多云', humidity: 78 },
      '广州': { temp: 28, condition: '雨天', humidity: 82 },
      '深圳': { temp: 27, condition: '部分多云', humidity: 70 }
    }

    const weather = weatherData[params.location] ||
      { temp: 25, condition: '未知', humidity: 60 }

    return {
      location: params.location,
      temperature: weather.temp,
      condition: weather.condition,
      humidity: weather.humidity,
      timestamp: new Date().toISOString()
    }
  }
}

async function enhancedExample() {
  console.log('🚀 启动增强版 SkinFlow 示例...')

  // 使用自定义配置初始化
  const framework = await createMultiAgentFramework({
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7
    },
    memory: {
      storage: {
        type: 'memory',
        maxItems: 200
      }
    },
    tools: {
      customTools: [weatherTool],
      enableFileSystem: true
    },
    agents: {
      maxConcurrentAgents: 3
    },
    logging: {
      level: 'debug'
    }
  })

  console.log('✅ 增强版框架初始化完成')

  // 内存持久化示例
  console.log('\n🧠 示例：内存持久化')

  // 存储用户偏好
  await framework.memory.store({
    id: 'pref_style',
    userId: 'user123',
    type: 'user_preference',
    content: '偏好详细的技术解释',
    timestamp: Date.now(),
    metadata: { importance: 0.8 }
  })

  // 处理可能使用偏好的请求
  const memoryResult = await framework.processRequest(
    "解释机器学习是如何工作的",
    { userId: 'user123' }
  )

  console.log('内存感知响应:', memoryResult.content.substring(0, 200) + '...')

  // 自定义工具示例
  console.log('\n🌤️ 示例：自定义工具使用')
  const toolResult = await framework.processRequest(
    "北京天气怎么样？我需要带伞吗？",
    { userId: 'user123' }
  )

  console.log('工具增强响应:', toolResult.content)

  // 流式响应示例
  console.log('\n🔄 示例：流式响应')
  console.log('流式响应:')

  const stream = await framework.processRequestStream(
    "写一个关于机器人学习绘画的短故事",
    { userId: 'user123' }
  )

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.content)
    }
  }
  console.log('\n')

  // 系统健康检查示例
  console.log('\n🏥 示例：系统健康检查')
  const health = await framework.getHealthStatus()
  console.log('系统健康状态:', health.status)
  console.log('组件:', Object.keys(health.components))

  // 智能体状态示例
  console.log('\n🤖 示例：智能体状态')
  const agentStatus = await framework.getAgentStatus()
  console.log('活跃智能体:', agentStatus.total)
  console.log('容量利用率:', agentStatus.capacity.utilization)

  console.log('\n🎉 增强版示例完成！')

  // 关闭
  await framework.shutdown()
}

enhancedExample().catch(console.error)
```

## 第 6 步：生产环境配置

对于生产环境使用，这里有一个更强大的配置：

```javascript
// production-app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function productionExample() {
  const framework = await createMultiAgentFramework({
    // 生产环境 LLM 配置
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.3,
      retry: {
        maxRetries: 5,
        retryDelay: 1000,
        retryCondition: (error) => {
          return error.status === 429 || error.status >= 500
        }
      }
    },

    // 生产环境内存配置
    memory: {
      storage: {
        type: 'postgres',
        config: {
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'skingflow',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT) || 5432,
          ssl: process.env.DB_SSL === 'true'
        }
      },
      maxShortTermMemory: 100,
      maxLongTermMemory: 10000,
      consolidation: {
        enabled: true,
        interval: 300000,
        importanceThreshold: 0.7
      }
    },

    // 生产环境工具配置
    tools: {
      enableFileSystem: true,
      enableWebTools: true,
      security: {
        sandbox: {
          enabled: true,
          timeout: 30000,
          memoryLimit: '512MB'
        },
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 100
        }
      }
    },

    // 生产环境智能体配置
    agents: {
      maxConcurrentAgents: 10,
      maxConcurrentTasks: 20,
      lifecycle: {
        idleTimeout: 300000,
        healthCheckInterval: 60000
      }
    },

    // 生产环境日志记录
    logging: {
      level: 'info',
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
      ],
      metrics: {
        enabled: true,
        interval: 60000
      }
    },

    // 性能优化
    performance: {
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000
      },
      resources: {
        connections: {
          llm: {
            maxConnections: 10,
            minConnections: 2
          }
        }
      }
    }
  })

  // 使用框架处理生产环境任务
  const result = await framework.processRequest(
    "分析客户反馈数据并提供洞察",
    { userId: 'user456' }
  )

  console.log('生产环境结果:', result.content)

  await framework.shutdown()
}

productionExample().catch(console.error)
```

## 常见用例

### 1. 内容创作助手

```javascript
// 创建内容创作工作流
const contentWorkflow = {
  name: 'content-creation',
  steps: [
    {
      name: 'research',
      input: '研究内容创作人工智能的最新趋势',
      agent: 'research'
    },
    {
      name: 'outline',
      input: '为关于人工智能内容创作的博客文章创建详细大纲',
      agent: 'planning',
      dependencies: ['research']
    },
    {
      name: 'writing',
      input: '基于研究和大纲撰写综合博客文章',
      agent: 'content-creation',
      dependencies: ['outline']
    },
    {
      name: 'editing',
      input: '编辑和改进博客文章的清晰度和吸引力',
      agent: 'content-creation',
      dependencies: ['writing']
    }
  ]
}

const contentResult = await framework.executeWorkflow(contentWorkflow, {
  userId: 'user789'
})
```

### 2. 数据分析管道

```javascript
// 分析数据并创建可视化
const analysisResult = await framework.processRequest(
  `分析以下销售数据并提供建议：
   - 第一季度：¥1,500,000
   - 第二季度：¥1,800,000
   - 第三季度：¥2,200,000
   - 第四季度：¥1,950,000

   包括趋势、洞察和行动项目。`,
  { userId: 'user456' }
)
```

### 3. 代码审查助手

```javascript
// 审查和改进代码
const codeReview = await framework.processRequest(
  `审查此 JavaScript 代码并提出改进建议：

   function calculateTotal(items) {
     let total = 0;
     for (let i = 0; i < items.length; i++) {
       total += items[i].price * items[i].quantity;
     }
     return total;
   }`,
  { userId: 'developer123' }
)
```

## 故障排除

### 常见问题

**安装问题：**
```bash
# 如果遇到 ESM 问题，确保您的 package.json 包含：
{
  "type": "module"
}
```

**API 密钥问题：**
```bash
# 验证 .env 文件在正确的目录中
# 确保 API 密钥有效且具有适当权限
```

**内存问题：**
```bash
# 对于开发，使用内存存储
memory: { storage: { type: 'memory' } }

# 对于生产，使用 PostgreSQL 或 SQLite
memory: {
  storage: {
    type: 'postgres',
    config: { /* 您的数据库配置 */ }
  }
}
```

**性能问题：**
```javascript
// 调整超时和并发
agents: {
  maxConcurrentAgents: 5,
  maxConcurrentTasks: 10
}

// 启用缓存
performance: {
  cache: {
    enabled: true,
    ttl: 300000
  }
}
```

## 下一步

现在您已经运行了 SkinFlow，探索这些资源：

- [核心功能](../../guide/core-features.md) - 了解高级功能
- [API 参考](../../api/framework.md) - 详细的 API 文档
- [示例](./intelligent-assistant.md) - 更多实际示例
- [配置](../../guide/configuration.md) - 高级配置选项

## 社区支持

- **GitHub Issues**: 报告错误和请求功能
- **GitHub Discussions**: 加入社区讨论
- **文档**: 完整的文档和指南

祝您使用 SkinFlow 构建愉快！🎉