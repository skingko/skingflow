# API Reference

This section provides comprehensive documentation for the SkinFlow API.

## 📖 API Documentation

### Core Framework
- [Framework API](framework.md) - Main framework classes and methods
- [Agent API](agent.md) - Agent system and multi-agent coordination
- [Tool API](tool.md) - Tool system and custom tool development
- [Memory API](memory.md) - Memory management and storage systems

## 🚀 Getting Started

If you're new to SkinFlow, we recommend starting with:
1. Read the [Guide](../guide/) to understand the concepts
2. Check the [Examples](../examples/) for practical implementations
3. Browse the [Framework API](framework.md) for core functionality

## 🔧 Quick Reference

### Creating a Framework Instance
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

### Processing Requests
```javascript
const result = await framework.processRequest(
  "Your request here",
  { userId: 'user123' }
)
```

## 📚 Additional Resources

- [Configuration Guide](../guide/configuration.md) - Detailed configuration options
- [Examples](../examples/) - Practical implementation examples
- [GitHub Repository](https://github.com/skingko/skingflow) - Source code and issues