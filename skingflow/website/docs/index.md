---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SkinFlow"
  tagline: "Flexible flow engine for intelligent multi-agent applications"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/skingko/skingflow

features:
  - title: 🧠 Intelligent Multi-Agent System
    details: Automatically decomposes complex tasks and coordinates specialized agents for optimal performance.
  - title: 💾 Advanced Memory Management
    details: Mem0-based architecture with short-term and long-term memory capabilities.
  - title: 🛠️ Unified Tool System
    details: YAML/XML tool definitions with virtual file system and MCP protocol support.
  - title: 🔄 Stream Processing Engine
    details: High-performance asynchronous processing with real-time response capabilities.
  - title: 🛡️ Enterprise-Grade Reliability
    details: Multi-layer error recovery, circuit breaker pattern, and health monitoring.
  - title: 🌐 Multi-Language Support
    details: Full internationalization support with 5 languages and comprehensive documentation.
---

# SkinFlow Multi-Agent Framework

SkinFlow is a flexible flow engine for building intelligent multi-agent applications. It supports complex task decomposition, intelligent planning, memory management, and seamless tool integration.

## Quick Start

```bash
npm install skingflow
```

```javascript
import { createMultiAgentFramework } from 'skingflow'

const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }
})

const result = await framework.processRequest(
  "Create a simple to-do list application",
  { userId: 'user123' }
)
```

## Key Features

### 🧠 Multi-Agent Intelligence
- **Planning Agent**: Automatically breaks down complex tasks
- **Specialized Sub-Agents**: Research, programming, analysis, content creation
- **Smart Coordination**: Optimal agent selection and task distribution
- **Secure Collaboration**: Context isolation between agents

### 💾 Smart Memory System
- **Short-term Memory**: Session context and temporary data
- **Long-term Memory**: Persistent knowledge and history
- **User Preferences**: Personalized experience learning
- **Semantic Search**: Vector-based intelligent retrieval

### 🛠️ Extensible Tool System
- **Declarative Tool Definitions**: YAML/XML configuration
- **Virtual File System**: Secure sandboxed operations
- **MCP Protocol**: Standardized integrations
- **Custom Tools**: Flexible development framework

### 🚀 Production Ready
- **High Availability**: Complete error handling and recovery
- **High Performance**: Asynchronous processing and caching
- **Scalable Architecture**: Modular and extensible design
- **Comprehensive Monitoring**: Detailed logging and metrics

## Documentation

Our comprehensive documentation covers everything you need to know:

- **[Getting Started](guide/getting-started)** - Installation and basic usage
- **[Core Features](guide/core-features)** - Main capabilities and concepts
- **[Architecture](guide/architecture)** - System design and components
- **[API Reference](api/)** - Complete API documentation
- **[Examples](examples/)** - Practical implementations

## Community

Join our growing community of developers building intelligent applications with SkinFlow:

- **GitHub**: [Source Code](https://github.com/skingko/skingflow)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/skingko/skingflow/issues)
- **Discussions**: [Community Forum](https://github.com/skingko/skingflow/discussions)
- **NPM**: [Package](https://www.npmjs.com/package/skingflow)

## Language Support

📖 **Multi-language Documentation**: Available in English, Chinese, Spanish, French, and German.

- 🇺🇸 [English](README.md)
- 🇨🇳 [中文](README.zh.md)
- 🇪🇸 [Español](README.es.md)
- 🇫🇷 [Français](README.fr.md)
- 🇩🇪 [Deutsch](README.de.md)

## License

SkinFlow is released under the MIT License. See the [LICENSE](https://github.com/skingko/skingflow/blob/main/LICENSE) file for details.

---

**Start building intelligent applications today with SkinFlow!** 🚀