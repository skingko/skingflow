# 工具 API

SkinFlow 工具 API 提供了扩展和管理智能体可用功能的接口。

## 内置工具

### 文件系统工具
```javascript
// 文件操作
await framework.processRequest(
  "创建项目备份",
  { userId: 'user123' }
)

// 文件读取和分析
await framework.processRequest(
  "分析 README.md 文件",
  { userId: 'user123' }
)
```

### Web 工具
```javascript
// 网络搜索
await framework.processRequest(
  "研究最新的 AI 发展趋势",
  { userId: 'user123' }
)

// API 调用
await framework.processRequest(
  "从天气 API 获取当前天气",
  { userId: 'user123' }
)
```

### 数据处理工具
```javascript
// 数据分析
await framework.processRequest(
  "分析销售数据 CSV 文件",
  { userId: 'user123' }
)

// 数据可视化
await framework.processRequest(
  "为数据集创建图表",
  { userId: 'user123' }
)
```

### 代码执行工具
```javascript
// 代码执行
await framework.processRequest(
  "运行这个 Python 脚本分析数据",
  { userId: 'user123' }
)
```

## 自定义工具

### 创建自定义工具
```javascript
const customTools = [
  {
    name: 'send_email',
    description: '使用 SMTP 发送邮件',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: '收件人邮箱'
        },
        subject: {
          type: 'string',
          description: '邮件主题'
        },
        body: {
          type: 'string',
          description: '邮件正文'
        }
      },
      required: ['to', 'subject', 'body']
    },
    permissions: ['email:send'],
    handler: async (params, context) => {
      // 邮件发送实现
      const result = await emailService.send({
        to: params.to,
        subject: params.subject,
        body: params.body
      })

      return {
        success: true,
        message: '邮件发送成功',
        messageId: result.messageId
      }
    }
  }
]
```

### 注册自定义工具
```javascript
const framework = await createMultiAgentFramework({
  tools: {
    customTools: customTools
  }
})
```

### 工具权限
```javascript
tools: {
  security: {
    permissions: {
      enabled: true,
      defaultPermissions: ['read:basic'],
      rolePermissions: {
        admin: ['*'],
        user: ['read:basic', 'write:basic'],
        guest: ['read:basic']
      }
    }
  }
}
```

## 工具配置

### 文件系统配置
```javascript
tools: {
  fileSystem: {
    basePath: './workspace',
    allowedPaths: ['./workspace', './temp'],
    restrictedPaths: ['/etc', '/system'],
    maxFileSize: 10485760, // 10MB
    allowedExtensions: ['.txt', '.md', '.js', '.json', '.csv']
  }
}
```

### Web 工具配置
```javascript
tools: {
  webTools: {
    timeout: 10000,
    maxRetries: 3,
    allowedDomains: ['*'],
    blockedDomains: [],
    userAgent: 'SkinFlow/1.0.0',
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60
    }
  }
}
```

### 代码执行配置
```javascript
tools: {
  codeTools: {
    maxExecutionTime: 30000,
    memoryLimit: '512MB',
    allowedPackages: ['lodash', 'axios', 'moment'],
    sandbox: {
      enabled: true,
      allowedModules: ['fs', 'path', 'crypto']
    }
  }
}
```

## 工具安全

### 沙盒执行
```javascript
tools: {
  security: {
    sandbox: {
      enabled: true,
      timeout: 30000,
      memoryLimit: '512MB',
      allowedModules: ['fs', 'path', 'crypto'],
      blockedModules: ['child_process', 'net', 'dgram']
    }
  }
}
```

### 输入验证
```javascript
const validationTool = {
  name: 'validated_operation',
  parameters: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_\\-\\.]+$',
        description: '安全文件名'
      },
      data: {
        type: 'object',
        description: '操作数据'
      }
    },
    required: ['filename']
  },
  handler: async (params, context) => {
    // 验证后的操作
    return { success: true, result: '操作完成' }
  }
}
```

## 工具性能

### 缓存策略
```javascript
tools: {
  cache: {
    enabled: true,
    ttl: 300000, // 5 分钟
    maxSize: 1000,
    strategy: 'lru'
  }
}
```

### 并发控制
```javascript
tools: {
  concurrency: {
    maxConcurrent: 5,
    queueSize: 100,
    timeout: 60000
  }
}
```

## 工具监控

### 工具使用统计
```javascript
const toolStats = await framework.getToolStatistics()
console.log('工具使用统计:', toolStats)
```

### 性能指标
```javascript
framework.on('toolExecuted', (toolName, duration, success) => {
  console.log(`工具 ${toolName} 执行:`, {
    duration: `${duration}ms`,
    success: success
  })
})
```

## 工具错误处理

### 工具执行错误
```javascript
try {
  const result = await framework.processRequest(
    "使用自定义工具执行任务",
    { userId: 'user123' }
  )
} catch (error) {
  if (error.code === 'TOOL_TIMEOUT') {
    console.log('工具执行超时')
  } else if (error.code === 'TOOL_PERMISSION_DENIED') {
    console.log('工具权限不足')
  }
}
```

### 工具回退
```javascript
tools: {
  fallback: {
    enabled: true,
    strategies: {
      'web_search': ['cache', 'alternative_service'],
      'file_operation': ['read_only', 'skip']
    }
  }
}
```

## 工具分类

### 数据工具
- 数据读取和解析
- 数据转换和清洗
- 数据分析和统计
- 数据导出和报告

### 开发工具
- 代码生成和补全
- 代码审查和优化
- 文件操作和管理
- 版本控制集成

### 通信工具
- 邮件发送
- API 调用
- 消息推送
- Webhook 处理

### 分析工具
- 文本分析
- 图像处理
- 统计计算
- 机器学习推理

## 下一步

- [框架 API](./framework.md) - 主要框架 API
- [智能体 API](./agent.md) - 智能体系统 API
- [内存 API](./memory.md) - 内存系统 API