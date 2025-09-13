# 智能体 API

SkinFlow 智能体 API 提供了管理和与多智能体系统交互的接口。

## 智能体类型

### 规划智能体 (Planning Agent)
负责任务分析、分解和执行计划。

### 子智能体 (Sub-Agents)
专业化智能体，用于特定任务类型：
- **研究智能体**: 信息收集和分析
- **编程智能体**: 代码编写和调试
- **数据分析智能体**: 数据处理和洞察
- **内容创作智能体**: 文本和媒体生成

## 智能体管理

### 注册智能体
```javascript
const customAgent = {
  name: 'my-specialist-agent',
  type: 'specialist',
  capabilities: ['data-analysis', 'reporting'],
  model: 'gpt-4',
  tools: ['data-processing', 'visualization'],
  handler: async (task, context) => {
    // 智能体实现
    return { success: true, result: '任务完成' }
  }
}

await framework.registerAgent(customAgent)
```

### 智能体状态监控
```javascript
const status = await framework.getAgentStatus()
console.log('智能体状态:', status)
```

## 智能体配置

### 并发设置
```javascript
const framework = await createMultiAgentFramework({
  agents: {
    maxConcurrentAgents: 5,
    maxConcurrentTasks: 10,
    lifecycle: {
      idleTimeout: 300000,
      healthCheckInterval: 60000
    }
  }
})
```

### 智能体特定配置
```javascript
agents: {
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
    }
  }
}
```

## 智能体通信

### 消息传递
智能体之间通过协调系统进行通信：

```javascript
// 智能体协作由框架自动处理
const result = await framework.processRequest(
  "研究市场趋势并创建商业计划",
  { userId: 'user123' }
)
```

### 结果聚合
框架自动聚合多个智能体的结果：

```javascript
{
  "success": true,
  "content": "综合分析结果",
  "data": {
    "research": { /* 研究结果 */ },
    "analysis": { /* 分析结果 */ },
    "planning": { /* 规划结果 */ }
  }
}
```

## 自定义智能体

### 基础自定义智能体
```javascript
class CustomAgent extends BaseAgent {
  async execute(task, context) {
    // 自定义智能体逻辑
    const result = await this.processTask(task)
    return {
      success: true,
      result: result,
      metadata: { processingTime: Date.now() }
    }
  }

  getCapabilities() {
    return ['custom-task', 'data-processing']
  }
}
```

### 注册自定义智能体
```javascript
const customAgent = new CustomAgent({
  name: 'custom-processor',
  model: 'gpt-4',
  tools: ['data-analysis']
})

await framework.registerAgent(customAgent)
```

## 智能体生命周期

### 状态管理
智能体具有以下状态：
- **idle**: 空闲，等待任务
- **busy**: 忙碌，处理任务
- **error**: 错误状态
- **offline**: 离线

### 健康检查
框架定期执行智能体健康检查：

```javascript
// 自动健康检查
framework.on('agentHealthCheck', (agentName, health) => {
  console.log(`${agentName} 健康状态:`, health)
})
```

## 性能优化

### 智能体池化
框架自动管理智能体实例池化：

```javascript
agents: {
  pooling: {
    enabled: true,
    minInstances: 2,
    maxInstances: 10,
    idleTimeout: 300000
  }
}
```

### 负载均衡
智能体任务分配基于：
- 当前负载
- 专业化程度
- 历史性能
- 资源可用性

## 错误处理

### 智能体错误处理
```javascript
try {
  const result = await framework.processRequest(
    "复杂任务",
    { userId: 'user123' }
  )
} catch (error) {
  if (error.code === 'AGENT_TIMEOUT') {
    console.log('智能体超时，尝试重试...')
  } else if (error.code === 'AGENT_ERROR') {
    console.log('智能体执行错误:', error.message)
  }
}
```

### 回退策略
```javascript
agents: {
  fallback: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
    fallbackAgents: {
      'specialist': ['general', 'expert']
    }
  }
}
```

## 监控和调试

### 智能体指标
```javascript
const metrics = await framework.getAgentMetrics()
console.log('智能体指标:', metrics)
```

### 性能跟踪
```javascript
framework.on('agentPerformance', (agentName, metrics) => {
  console.log(`${agentName} 性能:`, {
    averageResponseTime: metrics.responseTime,
    successRate: metrics.successRate,
    tasksCompleted: metrics.tasksCompleted
  })
})
```

## 下一步

- [框架 API](./framework.md) - 主要框架 API
- [工具 API](./tool.md) - 工具系统 API
- [内存 API](./memory.md) - 内存系统 API