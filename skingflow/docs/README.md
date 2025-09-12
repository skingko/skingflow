# skingflow Framework Documentation

Welcome to the comprehensive documentation for the skingflow framework - a flexible, extensible framework for building AI-powered applications with streaming capabilities.

## 📖 Table of Contents

### Getting Started
- [Quick Start Guide](./quick-start.md)
- [Installation & Setup](./installation.md)
- [Core Concepts](./core-concepts.md)
- [Your First Flow](./first-flow.md)

### Core Components
- [LLM System](./llm-system.md) - Multi-provider LLM integration
- [Memory System](./memory-system.md) - Vector-based memory management
- [Tool System](./tools-system.md) - Unified tool integration
- [Orchestration](./orchestration.md) - Advanced flow composition

### Advanced Topics
- [Custom Providers](./custom-providers.md) - Creating custom LLM providers
- [Custom Storage](./custom-storage.md) - Implementing memory storage backends
- [Tool Development](./tool-development.md) - Creating custom tools
- [Flow Patterns](./flow-patterns.md) - Common architectural patterns

### Integration Guides
- [OpenAI Integration](./integrations/openai.md)
- [Anthropic Integration](./integrations/anthropic.md)
- [Custom LLM Integration](./integrations/custom-llm.md)
- [MCP Integration](./integrations/mcp.md)
- [Database Integration](./integrations/databases.md)

### API Reference
- [Framework API](./api/framework.md)
- [LLM API](./api/llm.md)
- [Memory API](./api/memory.md)
- [Tools API](./api/tools.md)
- [Orchestration API](./api/orchestration.md)
- [Utilities API](./api/utils.md)

### Examples & Tutorials
- [Simple Chat Bot](./examples/simple-chat.md)
- [Memory-Enhanced Chat](./examples/memory-chat.md)
- [Tool-Enabled Assistant](./examples/tool-assistant.md)
- [Complex Orchestration](./examples/orchestration.md)
- [Multi-Agent System](./examples/multi-agent.md)
- [RAG Implementation](./examples/rag.md)

### Best Practices
- [Architecture Guidelines](./best-practices/architecture.md)
- [Performance Optimization](./best-practices/performance.md)
- [Error Handling](./best-practices/error-handling.md)
- [Testing Strategies](./best-practices/testing.md)
- [Production Deployment](./best-practices/deployment.md)

### Migration & Compatibility
- [Migrating from v1.x](./migration/from-v1.md)
- [Breaking Changes](./migration/breaking-changes.md)
- [Compatibility Matrix](./migration/compatibility.md)

### Contributing
- [Development Setup](./contributing/setup.md)
- [Contributing Guidelines](./contributing/guidelines.md)
- [Code Style Guide](./contributing/style-guide.md)
- [Testing Guidelines](./contributing/testing.md)

---

## 🚀 Framework Overview

skingflow is a streaming-first framework designed for building sophisticated AI applications. It provides:

### ✨ Key Features

- **🌊 Streaming Architecture**: Built around async generators for real-time data processing
- **🤖 Multi-LLM Support**: Unified interface for OpenAI, Anthropic, Ollama, and custom providers
- **🧠 Vector Memory System**: Semantic memory with multiple storage backends
- **🔧 Unified Tool System**: Support for custom tools, function calls, and MCP integration
- **🎭 Flow Orchestration**: Advanced composition patterns with parallel execution and conditionals
- **📦 Modular Design**: Extensible architecture with plugin support
- **⚡ High Performance**: Optimized for streaming and concurrent operations
- **🛠️ Developer Friendly**: Comprehensive APIs with TypeScript support

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM System    │    │  Memory System  │    │  Tool System    │
│                 │    │                 │    │                 │
│ • Multi-provider│    │ • Vector search │    │ • Custom tools  │
│ • Streaming     │    │ • Multi-storage │    │ • Function calls│
│ • Templates     │    │ • SDK interface │    │ • MCP support   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Orchestration  │
                    │                 │
                    │ • Flow control  │
                    │ • Parallel exec │
                    │ • Conditionals  │
                    │ • Error handling│
                    └─────────────────┘
```

### 🎯 Use Cases

- **Conversational AI**: Build chatbots with memory and tool capabilities
- **Content Generation**: Create sophisticated content pipelines
- **Data Processing**: Implement AI-powered data analysis workflows
- **Multi-Agent Systems**: Coordinate multiple specialized AI agents
- **RAG Applications**: Build retrieval-augmented generation systems
- **API Integration**: Connect AI models with external services
- **Workflow Automation**: Create intelligent automation pipelines

## 📊 Framework Comparison

| Feature | skingflow v2 | LangChain | AutoGen | Custom Solution |
|---------|--------------|-----------|---------|----------------|
| Streaming First | ✅ | ❌ | ❌ | ❓ |
| Multi-LLM Support | ✅ | ✅ | ✅ | ❓ |
| Vector Memory | ✅ | ✅ | ❌ | ❓ |
| Tool Integration | ✅ | ✅ | ✅ | ❓ |
| Flow Orchestration | ✅ | ❌ | ❌ | ❓ |
| TypeScript Support | ✅ | ✅ | ❌ | ❓ |
| Learning Curve | Low | High | Medium | High |
| Performance | High | Medium | Medium | ❓ |

## 🚦 Getting Started

### Quick Installation

```bash
npm install skingflow
# or
yarn add skingflow
```

### Basic Usage

```javascript
import { createFramework } from 'skingflow';

// Create framework instance
const framework = await createFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY
  }
});

// Create a simple chat flow
const chatFlow = framework.createChatFlow().build();

// Use the chat flow
for await (const chunk of chatFlow.execAsyncStream({
  content: 'Hello, world!'
})) {
  process.stdout.write(chunk);
}
```

### Next Steps

1. **[Quick Start Guide](./quick-start.md)** - Get up and running in 5 minutes
2. **[Core Concepts](./core-concepts.md)** - Understand the framework fundamentals
3. **[Examples](./examples/)** - Explore practical implementations
4. **[API Reference](./api/)** - Dive deep into the framework APIs

## 🤝 Community & Support

- **GitHub**: [github.com/skingko/skingflow](https://github.com/skingko/skingflow)
- **Documentation**: [skingflow.dev](https://skingflow.dev)
- **Discord**: [Join our community](https://discord.gg/skingflow)
- **Issues**: [Report bugs or request features](https://github.com/skingko/skingflow/issues)

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

*Built with ❤️ by the skingflow team*