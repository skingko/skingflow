# SkinFlow 多智能体框架

> 🚀 **基于流式处理的智能多智能体框架** - 支持复杂任务分解、智能规划、记忆管理和工具集成

[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 版本](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![框架状态](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![文档](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![NPM 版本](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 📖 目录

- [快速开始](#快速开始)
- [核心特性](#核心特性)
- [架构概览](#架构概览)
- [详细文档](#详细文档)
- [示例项目](#示例项目)
- [语言支持](#语言支持)

## 🚀 快速开始

### 5分钟快速体验

```bash
# 1. 克隆仓库
git clone https://github.com/skingko/skingflow.git
cd skingflow

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置你的 LLM API 密钥和数据库连接

# 4. 运行示例
node examples/quick-start/index.js
```

### 最简单的使用示例

```javascript
import { createMultiAgentFramework } from './lib/multi-agent/index.js';

// 创建框架实例
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'http',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'your-api-key',
    model: 'gpt-4'
  },
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
});

// 处理请求
const result = await framework.processRequest(
  "创建一个简单的网页应用",
  { userId: 'user123' }
);

console.log(result);
```

## ✨ 核心特性

### 🧠 智能多智能体系统
- **规划智能体**: 自动分解复杂任务，制定执行计划
- **专业子智能体**: 研究、编程、数据分析、内容创作等专业领域
- **智能协调**: 自动选择最适合的智能体执行特定任务
- **上下文隔离**: 确保智能体间的安全协作

### 💾 高级记忆系统 (基于mem0架构)
- **短期记忆**: 会话上下文和临时信息管理
- **长期记忆**: 持久化知识存储和历史记录
- **用户偏好**: 个性化设置和习惯学习
- **语义搜索**: 基于向量的智能记忆检索

### 🛠️ 统一工具系统
- **YAML/XML工具定义**: 声明式工具配置，易于扩展
- **虚拟文件系统**: 安全的文件操作环境
- **MCP协议支持**: 标准化工具集成
- **自定义工具**: 灵活的工具开发和集成机制

### 🔄 流式处理引擎
- **异步流处理**: 高性能并发执行
- **实时响应**: 支持流式输出和实时反馈
- **流程编排**: 复杂工作流的智能管理

### 🛡️ 企业级可靠性
- **降级机制**: 多层错误恢复策略
- **熔断器**: 自动故障隔离和恢复
- **健康监控**: 实时系统状态跟踪
- **详细日志**: 完整的调试和审计信息

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    SkinFlow 框架                              │
├─────────────────────────────────────────────────────────────┤
│  多智能体系统                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 规划        │  │ 子智能体    │  │ 协调        │         │
│  │ 智能体      │  │ 管理器      │  │ 系统        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  核心服务                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ LLM         │  │ 记忆        │  │ 工具        │         │
│  │ 抽象层      │  │ 系统        │  │ 注册表      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  基础设施                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 降级        │  │ 虚拟        │  │ 流式        │         │
│  │ 管理器      │  │ 文件系统    │  │ 引擎        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📚 详细文档

- **[安装配置指南](docs/installation.md)** - 详细的安装和配置步骤
- **[基础使用教程](docs/basic-usage.md)** - 从零开始的使用教程
- **[高级配置](docs/advanced-config.md)** - 高级特性和自定义配置
- **[工具系统](docs/tools.md)** - 工具开发和集成指南
- **[记忆系统](docs/memory.md)** - 记忆管理详细说明
- **[智能体系统](docs/agents.md)** - 多智能体协作机制
- **[API参考](docs/api-reference.md)** - 完整的API文档
- **[最佳实践](docs/best-practices.md)** - 生产环境使用建议
- **[故障排除](docs/troubleshooting.md)** - 常见问题解决方案

## 🎯 示例项目

- **[快速开始](examples/quick-start/)** - 最简单的使用示例
- **[智能助手](examples/intelligent-assistant/)** - 完整的智能助手应用
- **[内容创作](examples/content-creation/)** - 自动化内容生成
- **[数据分析](examples/data-analysis/)** - 智能数据处理
- **[Web应用生成](examples/web-app-generator/)** - 自动化Web开发

## 🌐 语言支持

本项目支持多种语言：

- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh.md](README.zh.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)

📖 **在线文档**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)

## 🚀 生产就绪

SkinFlow 框架经过充分测试，具备以下生产特性：

- ✅ **高可用性**: 完整的错误处理和降级机制
- ✅ **高性能**: 异步流处理和智能缓存
- ✅ **可扩展**: 模块化架构，易于扩展
- ✅ **可监控**: 详细的日志和统计信息
- ✅ **安全性**: 虚拟文件系统和权限控制

## 📊 基准测试

| 指标 | 性能 |
|------|------|
| 简单请求响应时间 | < 2秒 |
| 复杂任务处理时间 | < 30秒 |
| 并发处理能力 | 100+ 请求/分钟 |
| 内存占用 | < 512MB |
| 成功率 | > 95% |

## 🤝 贡献

我们欢迎社区贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

## 📞 支持

- **文档**: [完整文档](docs/)
- **示例**: [示例代码](examples/)
- **问题反馈**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **讨论**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

---

**🎉 开始使用 SkinFlow 构建你的智能应用吧！**