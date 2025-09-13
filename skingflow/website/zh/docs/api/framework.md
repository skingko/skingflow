# 框架 API

SkinFlow 框架 API 提供了创建和管理多智能体系统的主要接口。

## createMultiAgentFramework

使用指定配置创建新的 SkinFlow 框架实例。

```javascript
import { createMultiAgentFramework } from 'skingflow'

const framework = await createMultiAgentFramework(config)
```

### 参数

- **`config`** (Object): 框架的配置对象
  - **`llm`** (Object): LLM 提供商配置
  - **`memory`** (Object): 内存系统配置
  - **`tools`** (Object): 工具系统配置
  - **`agents`** (Object): 智能体系统配置
  - **`security`** (Object): 安全配置
  - **`logging`** (Object): 日志配置

### 返回

返回解析为框架实例的 Promise。

### 示例

```javascript
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
```

## Framework 类

提供所有功能的主要框架类。

### 方法

#### processRequest(request, context)

使用多智能体系统处理用户请求。

```javascript
const result = await framework.processRequest(
  "创建一个待办事项应用程序",
  { userId: 'user123' }
)
```

**参数:**
- **`request`** (string): 要处理的用户请求
- **`context`** (Object): 包含用户和会话信息的上下文对象
  - **`userId`** (string): 用户的唯一标识符
  - **`sessionId`** (string): 会话的唯一标识符
  - **`metadata`** (Object): 额外的上下文元数据

**返回:**
- **Promise\<Object\>**: 包含以下内容的对象：
  - **`success`** (boolean): 请求是否成功
  - **`content`** (string): 主要响应内容
  - **`data`** (Object): 智能体返回的额外数据
  - **`metadata`** (Object): 处理元数据
  - **`error`** (string): 失败时的错误信息

**示例:**
```javascript
const result = await framework.processRequest(
  "分析销售数据并创建报告",
  {
    userId: 'user123',
    sessionId: 'session456',
    metadata: {
      department: 'sales',
      priority: 'high'
    }
  }
)

if (result.success) {
  console.log('响应:', result.content)
  console.log('额外数据:', result.data)
} else {
  console.error('错误:', result.error)
}
```

#### processRequestStream(request, context)

使用流输出处理用户请求以获得实时响应。

```javascript
const stream = await framework.processRequestStream(
  "撰写当前 AI 趋势的详细分析",
  { userId: 'user123' }
)

for await (const chunk of stream) {
  console.log(chunk.content)
}
```

**参数:**
- **`request`** (string): 要处理的用户请求
- **`context`** (Object): 上下文对象（与 `processRequest` 相同）

**返回:**
- **AsyncIterable\<Object\>**: 生成包含以下内容的块的异步可迭代对象：
  - **`content`** (string): 内容块
  - **`type`** (string): 块类型（'content', 'metadata', 'error'）
  - **`done`** (boolean): 是否为最后一个块

**示例:**
```javascript
const stream = await framework.processRequestStream(
  "创建全面的商业计划",
  { userId: 'user123' }
)

let fullContent = ''
for await (const chunk of stream) {
  if (chunk.type === 'content') {
    fullContent += chunk.content
    process.stdout.write(chunk.content)
  } else if (chunk.type === 'metadata') {
    console.log('\n元数据:', chunk.data)
  }
}

console.log('\n收到完整响应')
```

#### executeWorkflow(workflow, context)

执行具有多个步骤和智能体的预定义工作流。

```javascript
const workflow = {
  name: 'data-analysis-workflow',
  description: '分析数据并创建可视化',
  steps: [
    {
      name: 'data-collection',
      agent: 'research',
      input: '收集 2023 年 Q4 的销售数据',
      timeout: 300000
    },
    {
      name: 'data-analysis',
      agent: 'analysis',
      input: '分析收集的销售数据',
      dependencies: ['data-collection']
    },
    {
      name: 'visualization',
      agent: 'programming',
      input: '根据分析创建图表和图形',
      dependencies: ['data-analysis']
    },
    {
      name: 'report',
      agent: 'content-creation',
      input: '撰写包含发现的综合报告',
      dependencies: ['visualization']
    }
  ]
}

const result = await framework.executeWorkflow(workflow, { userId: 'user123' })
```

**参数:**
- **`workflow`** (Object): 工作流定义
  - **`name`** (string): 唯一的工作流名称
  - **`description`** (string): 工作流描述
  - **`steps`** (Array\<Object\>): 工作流步骤数组
    - **`name`** (string): 步骤名称
    - **`agent`** (string): 要使用的智能体类型
    - **`input`** (string): 步骤的输入
    - **`timeout`** (number): 步骤超时时间（毫秒）
    - **`dependencies`** (Array\<string\>): 对其他步骤的依赖
- **`context`** (Object): 上下文对象

**返回:**
- **Promise\<Object\>**: 工作流执行结果
  - **`success`** (boolean): 工作流是否成功完成
  - **`results`** (Object): 每个步骤的结果
  - **`metadata`** (Object): 执行元数据
  - **`error`** (string): 失败时的错误信息

#### getAgentStatus()

获取系统中所有智能体的当前状态。

```javascript
const status = await framework.getAgentStatus()
console.log('智能体状态:', status)
```

**返回:**
- **Promise\<Object\>**: 智能体状态信息
  - **`planning`** (Object): 规划智能体状态
  - **`sub-agents`** (Object): 子智能体状态
  - **`total`** (number): 活动智能体总数
  - **`capacity`** (Object): 智能体容量信息

**示例:**
```javascript
{
  "planning": {
    "status": "idle",
    "currentTask": null,
    "lastActivity": "2024-01-15T10:30:00Z"
  },
  "sub-agents": {
    "research": {
      "status": "busy",
      "currentTask": "market-analysis",
      "activeTime": 120000
    },
    "programming": {
      "status": "idle",
      "currentTask": null,
      "lastActivity": "2024-01-15T10:25:00Z"
    }
  },
  "total": 5,
  "capacity": {
    "used": 2,
    "available": 3,
    "utilization": 0.4
  }
}
```

#### getHealthStatus()

获取框架的整体健康状态。

```javascript
const health = await framework.getHealthStatus()
console.log('系统健康状态:', health)
```

**返回:**
- **Promise\<Object\>**: 健康状态信息
  - **`status`** (string): 整体健康状态（'healthy', 'degraded', 'unhealthy'）
  - **`components`** (Object): 各个组件的状态
  - **`metrics`** (Object): 系统指标

**示例:**
```javascript
{
  "status": "healthy",
  "components": {
    "llm": {
      "status": "connected",
      "provider": "openai",
      "responseTime": 234
    },
    "memory": {
      "status": "connected",
      "storage": "memory",
      "usage": 0.3
    },
    "tools": {
      "status": "operational",
      "available": 15,
      "enabled": 12
    }
  },
  "metrics": {
    "uptime": 86400000,
    "requestsProcessed": 1234,
    "successRate": 0.98,
    "averageResponseTime": 2345
  }
}
```

#### registerAgent(agentConfig)

向框架注册自定义智能体。

```javascript
const customAgent = {
  name: 'custom-data-processor',
  type: 'specialist',
  capabilities: ['data-processing', 'etl'],
  model: 'gpt-4',
  tools: ['data-analysis', 'csv-export'],
  maxConcurrentTasks: 3,
  timeout: 300000,
  handler: async (task, context) => {
    // 自定义智能体实现
    return {
      success: true,
      result: '数据处理成功',
      data: processedData
    }
  }
}

await framework.registerAgent(customAgent)
```

**参数:**
- **`agentConfig`** (Object): 智能体配置
  - **`name`** (string): 唯一的智能体名称
  - **`type`** (string): 智能体类型
  - **`capabilities`** (Array\<string\>): 智能体能力
  - **`model`** (string): 要使用的 LLM 模型
  - **`tools`** (Array\<string\>): 智能体可以使用的工具
  - **`handler`** (Function): 智能体处理函数

**返回:**
- **Promise\<void\>**

#### updateConfig(newConfig)

运行时更新框架配置。

```javascript
await framework.updateConfig({
  logging: {
    level: 'debug'
  },
  agents: {
    maxConcurrentAgents: 10
  }
})
```

**参数:**
- **`newConfig`** (Object): 要与现有配置合并的新配置值

**返回:**
- **Promise\<void\>**

#### shutdown()

优雅地关闭框架并释放资源。

```javascript
await framework.shutdown()
console.log('框架关闭完成')
```

**返回:**
- **Promise\<void\>**

## 事件

框架发出您可以监听的各种事件：

```javascript
framework.on('requestStarted', (requestId, request, context) => {
  console.log(`请求开始: ${requestId}`)
})

framework.on('requestCompleted', (requestId, result, duration) => {
  console.log(`请求完成: ${requestId} 用时 ${duration}ms`)
})

framework.on('requestFailed', (requestId, error, duration) => {
  console.log(`请求失败: ${requestId} - ${error.message}`)
})

framework.on('agentStatusChanged', (agentName, oldStatus, newStatus) => {
  console.log(`智能体 ${agentName} 状态变化: ${oldStatus} -> ${newStatus}`)
})

framework.on('workflowStepCompleted', (workflowName, stepName, result) => {
  console.log(`工作流 ${workflowName} 步骤 ${stepName} 完成`)
})
```

### 事件类型

- **`requestStarted`**: 请求开始处理时触发
- **`requestCompleted`**: 请求成功完成时触发
- **`requestFailed`**: 请求失败时触发
- **`agentStatusChanged`**: 智能体状态变化时触发
- **`workflowStepCompleted`**: 工作流步骤完成时触发
- **`workflowCompleted`**: 工作流完成时触发
- **`configUpdated`**: 配置更新时触发
- **`healthStatusChanged`**: 系统健康状态变化时触发

## 错误处理

框架提供全面的错误处理：

```javascript
try {
  const result = await framework.processRequest(
    "可能失败的复杂请求",
    { userId: 'user123' }
  )
} catch (error) {
  switch (error.code) {
    case 'LLM_API_ERROR':
      console.error('LLM API 错误:', error.message)
      break
    case 'MEMORY_ERROR':
      console.error('内存错误:', error.message)
      break
    case 'TOOL_ERROR':
      console.error('工具错误:', error.message)
      break
    case 'TIMEOUT_ERROR':
      console.error('超时错误:', error.message)
      break
    case 'AUTHENTICATION_ERROR':
      console.error('身份验证错误:', error.message)
      break
    default:
      console.error('未知错误:', error.message)
  }
}
```

### 错误代码

- **`LLM_API_ERROR`**: LLM 提供商 API 错误
- **`MEMORY_ERROR`**: 内存系统错误
- **`TOOL_ERROR`**: 工具执行错误
- **`TIMEOUT_ERROR`**: 操作超时
- **`AUTHENTICATION_ERROR`**: 身份验证失败
- **`AUTHORIZATION_ERROR`**: 授权失败
- **`VALIDATION_ERROR`**: 输入验证错误
- **`CONFIGURATION_ERROR`**: 配置错误
- **`INTERNAL_ERROR`**: 内部系统错误

## 性能优化

### 请求批处理

```javascript
// 高效处理多个请求
const requests = [
  { request: "任务 1", context: { userId: 'user123' } },
  { request: "任务 2", context: { userId: 'user123' } },
  { request: "任务 3", context: { userId: 'user123' } }
]

const results = await Promise.all(
  requests.map(r => framework.processRequest(r.request, r.context))
)
```

### 连接池

框架自动管理连接池以获得最佳性能：

```javascript
// 配置连接池
const framework = await createMultiAgentFramework({
  performance: {
    resources: {
      connections: {
        llm: {
          maxConnections: 10,
          minConnections: 2
        },
        database: {
          maxConnections: 20,
          minConnections: 5
        }
      }
    }
  }
})
```

## 配置示例

### 生产配置

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.3,
    retry: {
      maxRetries: 5,
      retryDelay: 1000
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
  agents: {
    maxConcurrentAgents: 10,
    maxConcurrentTasks: 20
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
})
```

### 开发配置

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
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
})
```

## 下一步

- [智能体 API](./agent.md) - 智能体特定 API 文档
- [工具 API](./tool.md) - 工具系统 API 文档
- [内存 API](./memory.md) - 内存系统 API 文档
- [示例](../examples/quick-start.md) - 实际实现