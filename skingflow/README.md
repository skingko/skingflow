# SkinFlow Multi-Agent Framework

> 🚀 **Flexible flow engine for intelligent multi-agent applications** - Supports complex task decomposition, intelligent planning, memory management, and tool integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Framework Status](https://img.shields.io/badge/status-production--ready-green.svg)]()
[![Documentation](https://img.shields.io/badge/docs-online-blue.svg)](https://skingflow-docs.pages.dev/)
[![NPM Version](https://img.shields.io/npm/v/skingflow.svg)](https://www.npmjs.com/package/skingflow)

## 🌍 Language Support / 语言支持

This project is available in multiple languages:

| Language | README | Documentation |
|----------|--------|---------------|
| 🇺🇸 **English** | [README.md](README.md) | [Online Docs](https://skingflow-docs.pages.dev/) |
| 🇨🇳 **中文** | [README.zh.md](README.zh.md) | [中文文档](https://skingflow-docs.pages.dev/zh/) |
| 🇪🇸 **Español** | [README.es.md](README.es.md) | [Docs en Español](https://skingflow-docs.pages.dev/es/) |
| 🇫🇷 **Français** | [README.fr.md](README.fr.md) | [Docs en Français](https://skingflow-docs.pages.dev/fr/) |
| 🇩🇪 **Deutsch** | [README.de.md](README.de.md) | [Dokumentation auf Deutsch](https://skingflow-docs.pages.dev/de/) |

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

### 📖 Documentation Topics
- **[Introduction](website/docs/guide/introduction.md)** - Framework overview and getting started
- **[Getting Started](website/docs/guide/getting-started.md)** - Installation and basic configuration
- **[Core Features](website/docs/guide/core-features.md)** - Multi-agent system capabilities
- **[Architecture](website/docs/guide/architecture.md)** - System design and components
- **[Configuration](website/docs/guide/configuration.md)** - Advanced configuration options
- **[Framework API](website/docs/api/framework.md)** - Main framework interface
- **[Agent API](website/docs/api/agent.md)** - Multi-agent system API
- **[Tool API](website/docs/api/tool.md)** - Tool system integration
- **[Memory API](website/docs/api/memory.md)** - Memory management API
- **[Examples](website/docs/examples/)** - Practical usage examples

## 🎯 Examples

### 📁 Local Examples
- **[Quick Start](examples/quick-start/)** - Simplest usage example
- **[Intelligent Assistant](examples/intelligent-assistant/)** - Complete intelligent assistant application
- **[Content Creation](examples/content-creation/)** - Automated content generation
- **[Data Analysis](examples/data-analysis/)** - Intelligent data processing

### 🌐 Online Documentation Examples
- **[Quick Start Guide](website/docs/examples/quick-start.md)** - Step-by-step getting started
- **[Intelligent Assistant Example](website/docs/examples/intelligent-assistant.md)** - Building smart assistants
- **[Content Creation Example](website/docs/examples/content-creation.md)** - Automated content generation
- **[Data Analysis Example](website/docs/examples/data-analysis.md)** - Intelligent data processing

## 🌐 Language Support

This project is fully internationalized with comprehensive multi-language support:

### README Files
- 🇺🇸 **English** - [README.md](README.md)
- 🇨🇳 **中文** - [README.zh.md](README.zh.md)
- 🇪🇸 **Español** - [README.es.md](README.es.md)
- 🇫🇷 **Français** - [README.fr.md](README.fr.md)
- 🇩🇪 **Deutsch** - [README.de.md](README.de.md)

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

- **📚 Online Documentation**: [Complete Documentation](https://skingflow-docs.pages.dev/)
- **📖 Local Documentation**: [Documentation Source](website/docs/)
- **💻 Example Code**: [Local Examples](examples/) | [Online Examples](website/docs/examples/)
- **🐛 Issue Feedback**: [GitHub Issues](https://github.com/skingko/skingflow/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

## 📄 License

This project is open source under the MIT License. See [LICENSE](LICENSE) file for details.

---

**🎉 Start using SkinFlow to build your intelligent applications!**