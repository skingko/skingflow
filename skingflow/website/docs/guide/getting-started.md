# Getting Started

This guide will help you get up and running with SkinFlow in just a few minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** version 18.0 or higher
- **npm** or yarn package manager
- **An LLM API key** (OpenAI, Anthropic, or compatible)
- **Basic knowledge of JavaScript/ESM**

## Installation

### 1. Install SkinFlow

```bash
npm install skingflow
```

### 2. Create Your Project

Create a new JavaScript file for your SkinFlow application:

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'

// Create framework instance
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  },
  memory: {
    storage: {
      type: 'memory' // In-memory storage for development
    }
  }
})
```

### 3. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# .env
OPENAI_API_KEY=your-openai-api-key-here
```

## Your First SkinFlow Application

Let's create a simple application that can help users with tasks:

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function main() {
  // Initialize the framework
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

  // Process a user request
  const result = await framework.processRequest(
    "Help me create a simple to-do list application",
    { userId: 'user123' }
  )

  console.log('Result:', result)
}

main().catch(console.error)
```

Run your application:

```bash
node app.js
```

## Understanding the Output

SkinFlow will:

1. **Analyze the request** to understand what the user wants
2. **Create a plan** to accomplish the task
3. **Execute the plan** using appropriate agents and tools
4. **Provide the result** back to the user

## Configuration Options

### LLM Configuration

SkinFlow supports multiple LLM providers:

```javascript
// OpenAI
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1'
  }
})

// Anthropic Claude
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229'
  }
})

// Custom HTTP Provider
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'http',
    apiKey: 'your-api-key',
    baseUrl: 'https://your-llm-api.com/v1/chat/completions',
    model: 'your-model-name'
  }
})
```

### Memory Configuration

For production use, you'll want persistent storage:

```javascript
// PostgreSQL (recommended for production)
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password',
        port: 5432
      }
    }
  }
})

// SQLite (good for development)
const framework = await createMultiAgentFramework({
  memory: {
    storage: {
      type: 'sqlite',
      config: {
        database: './skingflow.db'
      }
    }
  }
})
```

### Tool Configuration

Add custom tools to extend functionality:

```javascript
const framework = await createMultiAgentFramework({
  tools: {
    customTools: [
      {
        name: 'weather',
        description: 'Get current weather information',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name or ZIP code'
            }
          },
          required: ['location']
        },
        handler: async (params) => {
          // Your weather API implementation
          return `Weather in ${params.location}: 72°F, Sunny`
        }
      }
    ]
  }
})
```

## Advanced Configuration

For more complex applications, you can configure multiple aspects:

```javascript
const framework = await createMultiAgentFramework({
  // LLM Configuration
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.7
  },

  // Memory Configuration
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password'
      }
    },
    // Memory settings
    maxShortTermMemory: 100,
    maxLongTermMemory: 10000
  },

  // Tool Configuration
  tools: {
    enableVirtualFileSystem: true,
    customTools: []
  },

  // Agent Configuration
  agents: {
    maxConcurrentAgents: 5,
    timeout: 30000 // 30 seconds
  },

  // Logging and Monitoring
  logging: {
    level: 'info',
    enableMetrics: true
  }
})
```

## Error Handling

SkinFlow includes robust error handling:

```javascript
try {
  const result = await framework.processRequest(
    "Your request here",
    { userId: 'user123' }
  )
  console.log('Success:', result)
} catch (error) {
  if (error.code === 'LLM_API_ERROR') {
    console.error('LLM API Error:', error.message)
  } else if (error.code === 'MEMORY_ERROR') {
    console.error('Memory Error:', error.message)
  } else {
    console.error('Unexpected Error:', error)
  }
}
```

## Next Steps

- [Core Features](./core-features.md) - Learn about SkinFlow's main capabilities
- [Architecture](./architecture.md) - Understand the system design
- [Examples](../../examples/) - Explore practical implementations
- [API Reference](../../api/) - Detailed API documentation

## Troubleshooting

### Common Issues

**Module not found error:**
```bash
# Make sure you're using ES modules
# Add "type": "module" to your package.json
```

**API key issues:**
```bash
# Verify your .env file is in the correct location
# Make sure the API key is valid and has proper permissions
```

**Memory connection errors:**
```bash
# Check your database connection parameters
# Ensure the database server is running
```

### Getting Help

- Check the [troubleshooting guide](../troubleshooting.md)
- Search [GitHub Issues](https://github.com/skingko/skingflow/issues)
- Join our [GitHub Discussions](https://github.com/skingko/skingflow/discussions)

Congratulations! You now have SkinFlow set up and ready to build intelligent applications.