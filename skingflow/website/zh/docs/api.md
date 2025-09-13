# API 参考

本节提供 SkinFlow API 的综合文档。

## 📖 API 文档

### 核心框架
- [框架 API](api/framework.md) - 主要框架类和方法
- [智能体 API](api/agent.md) - 智能体系统和多智能体协调
- [工具 API](api/tool.md) - 工具系统和自定义工具开发
- [内存 API](api/memory.md) - 内存管理和存储系统

## 🚀 快速开始

如果您是 SkinFlow 新手，我们建议：
1. 阅读[指南](guide/)了解概念
2. 查看[示例](examples/)获取实际实现
3. 浏览[框架 API](api/framework.md)了解核心功能

## 🔧 快速参考

### 创建框架实例
```javascript
import { createMultiAgentFramework } from 'skingflow'

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

### 处理请求
```javascript
const result = await framework.processRequest(
  "您的请求内容",
  { userId: 'user123' }
)
```

## 📚 其他资源

- [配置指南](guide/configuration.md) - 详细配置选项
- [示例](examples/) - 实际实现示例
- [GitHub 仓库](https://github.com/skingko/skingflow) - 源代码和问题