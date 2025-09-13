# 内存 API

SkinFlow 内存 API 提供了管理和查询智能体记忆系统的接口。

## 内存类型

### 短期内存
维护当前会话的上下文信息。

```javascript
const framework = await createMultiAgentFramework({
  memory: {
    maxShortTermMemory: 100,
    maxContextLength: 4000
  }
})
```

### 长期内存
持久化存储用户交互历史和偏好。

```javascript
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password'
      }
    }
  }
})
```

## 内存操作

### 存储记忆
```javascript
// 手动存储记忆
await framework.memory.store({
  userId: 'user123',
  type: 'preference',
  content: '用户 prefers concise responses',
  timestamp: Date.now(),
  importance: 0.8
})
```

### 检索记忆
```javascript
// 语义搜索记忆
const memories = await framework.memory.search(
  "用户对暗色主题的偏好",
  {
    userId: 'user123',
    limit: 5,
    threshold: 0.7
  }
)

console.log('相关记忆:', memories)
```

### 更新记忆
```javascript
// 更新现有记忆
await framework.memory.update(memoryId, {
  content: '更新后的记忆内容',
  importance: 0.9
})
```

### 删除记忆
```javascript
// 删除特定记忆
await framework.memory.delete(memoryId)

// 批量删除用户记忆
await framework.memory.deleteByUser('user123')
```

## 内存配置

### 存储配置
```javascript
memory: {
  storage: {
    type: 'postgres', // 'memory', 'sqlite', 'postgres'
    config: {
      // 数据库特定配置
    }
  }
}
```

### 内存管理
```javascript
memory: {
  maxShortTermMemory: 100,
  maxLongTermMemory: 10000,
  maxContextLength: 4000,
  consolidation: {
    enabled: true,
    interval: 300000, // 5 分钟
    importanceThreshold: 0.7
  }
}
```

### 语义搜索配置
```javascript
memory: {
  search: {
    enabled: true,
    provider: 'openai',
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    similarityThreshold: 0.7
  }
}
```

## 内存类型

### 对话记忆
存储用户与智能体的对话历史。

```javascript
{
  type: 'conversation',
  userId: 'user123',
  sessionId: 'session456',
  messages: [
    { role: 'user', content: 'Hello', timestamp: Date.now() },
    { role: 'assistant', content: 'Hi there!', timestamp: Date.now() }
  ]
}
```

### 偏好记忆
存储用户偏好和设置。

```javascript
{
  type: 'preference',
  userId: 'user123',
  category: 'response_style',
  value: 'concise',
  confidence: 0.9
}
```

### 上下文记忆
存储任务相关的上下文信息。

```javascript
{
  type: 'context',
  userId: 'user123',
  task: 'data_analysis',
  data: { dataset: 'sales_q4_2023' },
  timestamp: Date.now()
}
```

### 学习记忆
存储智能体学习到的模式和信息。

```javascript
{
  type: 'learning',
  userId: 'user123',
  pattern: 'user_requests_data_analysis_every_monday',
  confidence: 0.8,
  learnedAt: Date.now()
}
```

## 内存整合

### 自动整合
框架自动将重要记忆从短期移动到长期：

```javascript
memory: {
  consolidation: {
    enabled: true,
    interval: 300000, // 5 分钟
    importanceThreshold: 0.7,
    batchSize: 50
  }
}
```

### 手动整合
```javascript
// 手动触发内存整合
await framework.memory.consolidate()
```

### 重要性计算
```javascript
// 计算记忆重要性
const importance = await framework.memory.calculateImportance(memory)
console.log('记忆重要性:', importance)
```

## 内存查询

### 基本搜索
```javascript
// 按用户搜索
const userMemories = await framework.memory.getByUser('user123')

// 按类型搜索
const preferences = await framework.memory.getByType('preference', 'user123')

// 按时间范围搜索
const recentMemories = await framework.memory.getByTimeRange(
  'user123',
  Date.now() - 86400000, // 24 小时前
  Date.now()
)
```

### 高级搜索
```javascript
// 组合搜索条件
const results = await framework.memory.searchAdvanced({
  userId: 'user123',
  types: ['preference', 'context'],
  timeRange: {
    start: Date.now() - 604800000, // 7 天前
    end: Date.now()
  },
  importance: { min: 0.5 },
  limit: 20
})
```

### 语义搜索
```javascript
// 使用自然语言查询
const relevantMemories = await framework.memory.semanticSearch(
  "用户对数据可视化的偏好",
  {
    userId: 'user123',
    limit: 10,
    includeMetadata: true
  }
)
```

## 内存分析

### 记忆统计
```javascript
const stats = await framework.memory.getStatistics('user123')
console.log('内存统计:', {
  totalMemories: stats.total,
  byType: stats.byType,
  averageImportance: stats.averageImportance,
  lastUpdate: stats.lastUpdate
})
```

### 记忆模式
```javascript
// 识别用户行为模式
const patterns = await framework.memory.identifyPatterns('user123')
console.log('检测到的模式:', patterns)
```

### 记忆清理
```javascript
// 清理过期记忆
const cleanedCount = await framework.memory.cleanup({
  olderThan: Date.now() - 2592000000, // 30 天前
  keepImportant: true,
  minImportance: 0.3
})

console.log(`清理了 ${cleanedCount} 个记忆`)
```

## 内存安全

### 访问控制
```javascript
memory: {
  security: {
    enabled: true,
    accessControl: {
      userIsolation: true,
      rolePermissions: {
        admin: ['read', 'write', 'delete'],
        user: ['read', 'write'],
        guest: ['read']
      }
    }
  }
}
```

### 数据加密
```javascript
memory: {
  encryption: {
    enabled: true,
    fields: ['content', 'value'],
    algorithm: 'aes-256-gcm'
  }
}
```

### 审计日志
```javascript
// 启用内存操作审计
framework.memory.on('operation', (operation) => {
  console.log('内存操作:', {
    type: operation.type,
    userId: operation.userId,
    timestamp: operation.timestamp,
    details: operation.details
  })
})
```

## 内存性能

### 缓存策略
```javascript
memory: {
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 1000,
    ttl: 300000 // 5 分钟
  }
}
```

### 批量操作
```javascript
// 批量存储记忆
const memories = [
  { userId: 'user123', type: 'preference', content: 'pref1' },
  { userId: 'user123', type: 'preference', content: 'pref2' }
]

await framework.memory.storeBatch(memories)

// 批量检索
const batchResults = await framework.memory.getBatch(memoryIds)
```

## 内存监控

### 性能指标
```javascript
const metrics = await framework.memory.getMetrics()
console.log('内存性能:', {
  averageQueryTime: metrics.averageQueryTime,
  cacheHitRate: metrics.cacheHitRate,
  storageUsage: metrics.storageUsage,
  activeConnections: metrics.activeConnections
})
```

### 健康检查
```javascript
const health = await framework.memory.checkHealth()
console.log('内存系统健康状态:', health)
```

## 下一步

- [框架 API](./framework.md) - 主要框架 API
- [智能体 API](./agent.md) - 智能体系统 API
- [工具 API](./tool.md) - 工具系统 API