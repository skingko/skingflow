# SkinFlow Multi-Agent Framework

> 🚀 **Flexible flow engine for intelligent multi-agent applications** - Supports complex task decomposition, intelligent planning, memory management, and tool integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Framework Status](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![NPM Version](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 🌐 Languages | 语言

**🌐 Website**: [www.skingflow.com](https://www.skingflow.com)

**🌐 Languages**: [English](#) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Español](./README.es.md) | [Deutsch](./README.de.md) | [Français](./README.fr.md)

This project is available in multiple languages:

| Language | README | Documentation |
|----------|--------|---------------|
| 🇺🇸 **English** | [README.md](README.md) | [Online Docs](https://skingflow-docs.pages.dev/) |
| 🇨🇳 **中文** | [README.zh-CN.md](README.zh-CN.md) | [中文文档](https://skingflow-docs.pages.dev/zh/) |
| 🇪🇸 **Español** | [README.es.md](README.es.md) | [Docs en Español](https://skingflow-docs.pages.dev/es/) |
| 🇫🇷 **Français** | [README.fr.md](README.fr.md) | [Docs en Français](https://skingflow-docs.pages.dev/fr/) |
| 🇩🇪 **Deutsch** | [README.de.md](README.de.md) | [Dokumentation auf Deutsch](https://skingflow-docs.pages.dev/de/) |
| 🇯🇵 **日本語** | [README.ja.md](README.ja.md) | [日本語ドキュメント](https://skingflow-docs.pages.dev/ja/) |
| 🇰🇷 **한국어** | [README.ko.md](README.ko.md) | [한국어 문서](https://skingflow-docs.pages.dev/ko/) |

## 📖 Table of Contents

- [Quick Start](#quick-start)
- [Core Features](#core-features)
- [Architecture Overview](#architecture-overview)
- [Documentation](#documentation)
- [Examples](#examples)
- [Language Support](#language-support)

## 🚀 Quick Start

### 5-Minute Quick Experience

```bash
# 1. Clone the repository
git clone https://github.com/skingko/skingflow.git
cd skingflow

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env file to set your LLM API key and database connection

# 4. Run the example
node examples/quick-start/index.js
```

### Simple Usage Example

```javascript
import { createMultiAgentFramework } from './lib/multi-agent/index.js';

// Create framework instance
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

// Process request
const result = await framework.processRequest(
  "Create a simple web application",
  { userId: 'user123' }
);

console.log(result);
```

## ✨ Core Features

### 🧠 Intelligent Multi-Agent System
- **Planning Agent**: Automatically decomposes complex tasks and creates execution plans
- **Professional Sub-Agents**: Specialized in research, programming, data analysis, content creation
- **Intelligent Coordination**: Automatically selects the most suitable agents for specific tasks
- **Context Isolation**: Ensures secure collaboration between agents

### 💾 Advanced Memory System (mem0-based architecture)
- **Short-term Memory**: Session context and temporary information management
- **Long-term Memory**: Persistent knowledge storage and historical records
- **User Preferences**: Personalized settings and habit learning
- **Semantic Search**: Vector-based intelligent memory retrieval

### 🛠️ Unified Tool System
- **YAML/XML Tool Definitions**: Declarative tool configuration, easy to extend
- **Virtual File System**: Secure file operation environment
- **MCP Protocol Support**: Standardized tool integration
- **Custom Tools**: Flexible tool development and integration mechanism

### 🔄 Stream Processing Engine
- **Asynchronous Stream Processing**: High-performance concurrent execution
- **Real-time Response**: Supports streaming output and real-time feedback
- **Workflow Orchestration**: Intelligent management of complex workflows

### 🛡️ Enterprise-Grade Reliability
- **Degradation Mechanism**: Multi-layer error recovery strategies
- **Circuit Breaker**: Automatic fault isolation and recovery
- **Health Monitoring**: Real-time system status tracking
- **Detailed Logging**: Complete debugging and audit information

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SkinFlow Framework                        │
├─────────────────────────────────────────────────────────────┤
│  Multi-Agent System                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Planning    │  │ Sub-Agents  │  │ Coordination│         │
│  │ Agent       │  │ Manager     │  │ System      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ LLM         │  │ Memory      │  │ Tool        │         │
│  │ Abstraction │  │ System      │  │ Registry    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Fallback    │  │ Virtual     │  │ Stream      │         │
│  │ Manager     │  │ FileSystem  │  │ Engine      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

### 🌐 Online Documentation (Multi-language)
Our comprehensive documentation is available online with multi-language support:

- **🇺🇸 English**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)
- **🇨🇳 中文**: [skingflow-docs.pages.dev/zh/](https://skingflow-docs.pages.dev/zh/)
- **🇪🇸 Español**: [skingflow-docs.pages.dev/es/](https://skingflow-docs.pages.dev/es/)
- **🇫🇷 Français**: [skingflow-docs.pages.dev/fr/](https://skingflow-docs.pages.dev/fr/)
- **🇩🇪 Deutsch**: [skingflow-docs.pages.dev/de/](https://skingflow-docs.pages.dev/de/)
- **🇯🇵 日本語**: [skingflow-docs.pages.dev/ja/](https://skingflow-docs.pages.dev/ja/)
- **🇰🇷 한국어**: [skingflow-docs.pages.dev/ko/](https://skingflow-docs.pages.dev/ko/)

### 📖 Documentation Topics
- **[Installation Guide](docs/installation.md)** - Detailed installation and configuration steps
- **[Basic Usage Tutorial](docs/basic-usage.md)** - Step-by-step usage tutorial
- **[Advanced Configuration](docs/advanced-config.md)** - Advanced features and custom configuration
- **[Tool System](docs/tools.md)** - Tool development and integration guide
- **[Memory System](docs/memory.md)** - Detailed memory management explanation
- **[Agent System](docs/agents.md)** - Multi-agent collaboration mechanism
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Best Practices](docs/best-practices.md)** - Production environment recommendations
- **[Troubleshooting](docs/troubleshooting.md)** - Common problem solutions

## 🎯 Examples

### Core Framework Examples
- **[Quick Start](examples/quick-start/)** - Simplest usage example
- **[Simple Chat](examples/simple-chat/)** - Basic chatbot implementation
- **[Custom Tools](examples/custom-tools/)** - Custom tool development examples
- **[Orchestration](examples/orchestration/)** - Workflow orchestration examples

### Advanced Applications
- **[Intelligent Assistant](examples/intelligent-agent/)** - Complete intelligent assistant application
- **[Content Creation](examples/content-creation/)** - Automated content generation
- **[Data Analysis](examples/data-analysis/)** - Intelligent data processing
- **[Web App Generator](examples/web-app-generator/)** - Automated web development

### Legacy Examples (Compatibility)
- **[SkinFlow Chat](examples/skingflow-chat/)** - Terminal chatbot demo
- **[SkinFlow Agent](examples/skingflow-agent/)** - Agent-based applications
- **[SkinFlow MCP](examples/skingflow-mcp/)** - MCP protocol integration
- **[SkinFlow A2A](examples/skingflow-a2a/)** - Agent-to-agent communication

## 🌐 Language Support

This project is fully internationalized with comprehensive multi-language support:

### README Files
- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh-CN.md](README.zh-CN.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)
- 🇯🇵 **日本語** - [README.ja.md](README.ja.md)
- 🇰🇷 **한국어** - [README.ko.md](README.ko.md)

### Online Documentation
📖 **Multi-language Documentation**: [skingflow-docs.pages.dev](https://skingflow-docs.pages.dev/)
- Full language switching support
- Responsive design for all devices
- Comprehensive API references and examples

## 🚀 Production Ready

The SkinFlow framework is fully tested with the following production features:

- ✅ **High Availability**: Complete error handling and degradation mechanisms
- ✅ **High Performance**: Asynchronous stream processing and intelligent caching
- ✅ **Scalable**: Modular architecture, easy to extend
- ✅ **Monitorable**: Detailed logs and statistics
- ✅ **Security**: Virtual file system and permission control

## 📊 Benchmark

| Metric | Performance |
|--------|-------------|
| Simple request response time | < 2 seconds |
| Complex task processing time | < 30 seconds |
| Concurrent processing capability | 100+ requests/minute |
| Memory usage | < 512MB |
| Success rate | > 95% |

## 🤝 Contributing

We welcome community contributions! Please check the [Contributing Guide](CONTRIBUTING.md) to learn how to participate in project development.

## 📞 Support

- **Documentation**: [Complete Documentation](docs/)
- **Examples**: [Example Code](examples/)
- **Issue Feedback**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 License

This project is open source under the MIT License. See [LICENSE](LICENSE) file for details.

### Copyright Notice

Copyright (c) 2024 skingko
https://github.com/skingko/skingflow
Author: skingko <venture2157@gmail.com>

For commercial or advanced usage, please contact the author.

---

## 📱 Contact & Follow Us

<div align="center">

### WeChat Official Account
<img src="https://test-models.oss-cn-shanghai.aliyuncs.com/pics_go/202509110044079.jpg" width="200" alt="WeChat Official Account QR Code">

*Scan to follow our WeChat Official Account for updates*

### Add Author WeChat
<img src="https://test-models.oss-cn-shanghai.aliyuncs.com/pics_go/202509102242338.png" width="200" alt="Author WeChat QR Code">

*Scan to add author WeChat: skingko*

</div>

## 🔗 Links

- **🌐 Live Demo**: [SkinFlow Demo](https://skingflow-demo.pages.dev)
- **📖 Documentation**: [Online Docs](https://skingflow-docs.pages.dev)
- **🐛 Issues**: [Report Issues](https://github.com/skingko/skingflow/issues)
- **💡 Feature Requests**: [Request Features](https://github.com/skingko/skingflow/issues/new)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - For providing powerful AI models
- [Node.js](https://nodejs.org/) - JavaScript runtime environment
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [PostgreSQL](https://www.postgresql.org/) - Database system
- [Vector Database](https://github.com/mem0ai/mem0) - Memory management
- [MCP Protocol](https://modelcontextprotocol.io/) - Tool integration standard

---

**⭐ If you find this project helpful, please give it a star on GitHub!**

**🎉 Start using SkinFlow to build your intelligent applications!**
