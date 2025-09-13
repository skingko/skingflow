# Quick Start

This quick start guide will help you get SkinFlow up and running in minutes with a simple but powerful example.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** version 18.0 or higher
- **npm** or yarn package manager
- **An LLM API key** (OpenAI, Anthropic, or compatible)

## Step 1: Installation

Create a new project and install SkinFlow:

```bash
# Create project directory
mkdir skinflow-quickstart
cd skinflow-quickstart

# Initialize npm project
npm init -y

# Install SkinFlow
npm install skingflow

# Install dotenv for environment variables
npm install dotenv
```

## Step 2: Environment Setup

Create a `.env` file for your API keys:

```bash
# .env
OPENAI_API_KEY=your-openai-api-key-here
# Or use Anthropic
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## Step 3: Basic Application

Create a simple application file:

```javascript
// app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function main() {
  console.log('🚀 Starting SkinFlow Quick Start...')

  // Initialize the framework
  const framework = await createMultiAgentFramework({
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      temperature: 0.7
    },
    memory: {
      storage: {
        type: 'memory' // In-memory for this example
      }
    },
    logging: {
      level: 'info'
    }
  })

  console.log('✅ Framework initialized successfully')

  // Example 1: Simple task processing
  console.log('\n📝 Example 1: Simple Task Processing')
  const result1 = await framework.processRequest(
    "What are the main benefits of using AI in business?",
    { userId: 'user123' }
  )

  console.log('Result:', result1.content)

  // Example 2: Multi-step task
  console.log('\n🔨 Example 2: Multi-step Task')
  const result2 = await framework.processRequest(
    "Research current AI trends and create a brief summary",
    { userId: 'user123' }
  )

  console.log('Summary:', result2.content)

  // Example 3: Creative task
  console.log('\n🎨 Example 3: Creative Task')
  const result3 = await framework.processRequest(
    "Write a short poem about artificial intelligence",
    { userId: 'user123' }
  )

  console.log('Poem:', result3.content)

  // Example 4: Technical task
  console.log('\n💻 Example 4: Technical Task')
  const result4 = await framework.processRequest(
    "Create a simple JavaScript function to calculate Fibonacci numbers",
    { userId: 'user123' }
  )

  console.log('Code:', result4.content)

  console.log('\n🎉 Quick start completed successfully!')

  // Shutdown the framework
  await framework.shutdown()
}

main().catch(console.error)
```

## Step 4: Run the Application

Execute your application:

```bash
node app.js
```

You should see output similar to:

```
🚀 Starting SkinFlow Quick Start...
✅ Framework initialized successfully

📝 Example 1: Simple Task Processing
Result: Artificial intelligence offers numerous benefits for businesses...

🔨 Example 2: Multi-step Task
Summary: Current AI trends include increased adoption of generative AI...

🎨 Example 3: Creative Task
Poem: In circuits deep and bytes so bright,
AI learns and grows with pure insight...

💻 Example 4: Technical Task
Code: function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

🎉 Quick start completed successfully!
```

## Step 5: Enhanced Example with Customization

Let's create a more advanced example with custom tools and configuration:

```javascript
// enhanced-app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

// Custom weather tool
const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather information for a location',
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
    // Mock weather data - in real app, you'd call a weather API
    const weatherData = {
      'New York': { temp: 72, condition: 'Sunny', humidity: 65 },
      'London': { temp: 58, condition: 'Cloudy', humidity: 78 },
      'Tokyo': { temp: 68, condition: 'Rainy', humidity: 82 },
      'Paris': { temp: 64, condition: 'Partly Cloudy', humidity: 70 }
    }

    const weather = weatherData[params.location] ||
      { temp: 70, condition: 'Unknown', humidity: 60 }

    return {
      location: params.location,
      temperature: weather.temp,
      condition: weather.condition,
      humidity: weather.humidity,
      timestamp: new Date().toISOString()
    }
  }
}

async function enhancedExample() {
  console.log('🚀 Starting Enhanced SkinFlow Example...')

  // Initialize with custom configuration
  const framework = await createMultiAgentFramework({
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7
    },
    memory: {
      storage: {
        type: 'memory',
        maxItems: 200
      }
    },
    tools: {
      customTools: [weatherTool],
      enableFileSystem: true
    },
    agents: {
      maxConcurrentAgents: 3
    },
    logging: {
      level: 'debug'
    }
  })

  console.log('✅ Enhanced framework initialized')

  // Example with memory persistence
  console.log('\n🧠 Example: Memory Persistence')

  // Store user preference
  await framework.memory.store({
    id: 'pref_style',
    userId: 'user123',
    type: 'user_preference',
    content: 'prefers detailed technical explanations',
    timestamp: Date.now(),
    metadata: { importance: 0.8 }
  })

  // Process request that might use the preference
  const memoryResult = await framework.processRequest(
    "Explain how machine learning works",
    { userId: 'user123' }
  )

  console.log('Memory-aware response:', memoryResult.content.substring(0, 200) + '...')

  // Example with custom tool
  console.log('\n🌤️ Example: Custom Tool Usage')
  const toolResult = await framework.processRequest(
    "What's the weather like in New York? Should I bring an umbrella?",
    { userId: 'user123' }
  )

  console.log('Tool-enhanced response:', toolResult.content)

  // Example with streaming
  console.log('\n🔄 Example: Streaming Response')
  console.log('Streaming response:')

  const stream = await framework.processRequestStream(
    "Write a short story about a robot learning to paint",
    { userId: 'user123' }
  )

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.content)
    }
  }
  console.log('\n')

  // Example: System health check
  console.log('\n🏥 Example: System Health Check')
  const health = await framework.getHealthStatus()
  console.log('System Health:', health.status)
  console.log('Components:', Object.keys(health.components))

  // Example: Agent status
  console.log('\n🤖 Example: Agent Status')
  const agentStatus = await framework.getAgentStatus()
  console.log('Active agents:', agentStatus.total)
  console.log('Capacity utilization:', agentStatus.capacity.utilization)

  console.log('\n🎉 Enhanced example completed!')

  // Shutdown
  await framework.shutdown()
}

enhancedExample().catch(console.error)
```

## Step 6: Production Configuration

For production use, here's a more robust configuration:

```javascript
// production-app.js
import { createMultiAgentFramework } from 'skingflow'
import 'dotenv/config'

async function productionExample() {
  const framework = await createMultiAgentFramework({
    // Production LLM configuration
    llm: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.3,
      retry: {
        maxRetries: 5,
        retryDelay: 1000,
        retryCondition: (error) => {
          return error.status === 429 || error.status >= 500
        }
      }
    },

    // Production memory configuration
    memory: {
      storage: {
        type: 'postgres',
        config: {
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'skingflow',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT) || 5432,
          ssl: process.env.DB_SSL === 'true'
        }
      },
      maxShortTermMemory: 100,
      maxLongTermMemory: 10000,
      consolidation: {
        enabled: true,
        interval: 300000,
        importanceThreshold: 0.7
      }
    },

    // Production tool configuration
    tools: {
      enableFileSystem: true,
      enableWebTools: true,
      security: {
        sandbox: {
          enabled: true,
          timeout: 30000,
          memoryLimit: '512MB'
        },
        rateLimit: {
          enabled: true,
          windowMs: 60000,
          maxRequests: 100
        }
      }
    },

    // Production agent configuration
    agents: {
      maxConcurrentAgents: 10,
      maxConcurrentTasks: 20,
      lifecycle: {
        idleTimeout: 300000,
        healthCheckInterval: 60000
      }
    },

    // Production logging
    logging: {
      level: 'info',
      outputs: [
        {
          type: 'console',
          level: 'info'
        },
        {
          type: 'file',
          level: 'debug',
          filename: './logs/skingflow.log',
          maxSize: '10MB',
          maxFiles: 5
        }
      ],
      metrics: {
        enabled: true,
        interval: 60000
      }
    },

    // Performance optimization
    performance: {
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000
      },
      resources: {
        connections: {
          llm: {
            maxConnections: 10,
            minConnections: 2
          }
        }
      }
    }
  })

  // Use the framework for production tasks
  const result = await framework.processRequest(
    "Analyze customer feedback data and provide insights",
    { userId: 'user456' }
  )

  console.log('Production result:', result.content)

  await framework.shutdown()
}

productionExample().catch(console.error)
```

## Common Use Cases

### 1. Content Creation Assistant

```javascript
// Create a content creation workflow
const contentWorkflow = {
  name: 'content-creation',
  steps: [
    {
      name: 'research',
      input: 'Research the latest trends in AI for content creation',
      agent: 'research'
    },
    {
      name: 'outline',
      input: 'Create a detailed outline for a blog post about AI in content creation',
      agent: 'planning',
      dependencies: ['research']
    },
    {
      name: 'writing',
      input: 'Write a comprehensive blog post based on the research and outline',
      agent: 'content-creation',
      dependencies: ['outline']
    },
    {
      name: 'editing',
      input: 'Edit and improve the blog post for clarity and engagement',
      agent: 'content-creation',
      dependencies: ['writing']
    }
  ]
}

const contentResult = await framework.executeWorkflow(contentWorkflow, {
  userId: 'user789'
})
```

### 2. Data Analysis Pipeline

```javascript
// Analyze data and create visualizations
const analysisResult = await framework.processRequest(
  `Analyze the following sales data and create recommendations:
   - Q1: $150,000
   - Q2: $180,000
   - Q3: $220,000
   - Q4: $195,000

   Include trends, insights, and action items.`,
  { userId: 'user456' }
)
```

### 3. Code Review Assistant

```javascript
// Review and improve code
const codeReview = await framework.processRequest(
  `Review this JavaScript code and suggest improvements:

   function calculateTotal(items) {
     let total = 0;
     for (let i = 0; i < items.length; i++) {
       total += items[i].price * items[i].quantity;
     }
     return total;
   }`,
  { userId: 'developer123' }
)
```

## Troubleshooting

### Common Issues

**Installation Problems:**
```bash
# If you encounter ESM issues, ensure your package.json has:
{
  "type": "module"
}
```

**API Key Issues:**
```bash
# Verify your .env file is in the correct directory
# Make sure the API key is valid and has proper permissions
```

**Memory Issues:**
```bash
# For development, use in-memory storage
memory: { storage: { type: 'memory' } }

# For production, use PostgreSQL or SQLite
memory: {
  storage: {
    type: 'postgres',
    config: { /* your database config */ }
  }
}
```

**Performance Issues:**
```javascript
// Adjust timeouts and concurrency
agents: {
  maxConcurrentAgents: 5,
  maxConcurrentTasks: 10
}

// Enable caching
performance: {
  cache: {
    enabled: true,
    ttl: 300000
  }
}
```

## Next Steps

Now that you have SkinFlow running, explore these resources:

- [Core Features](../../guide/core-features.md) - Learn about advanced features
- [API Reference](../../api/framework.md) - Detailed API documentation
- [Examples](./intelligent-assistant.md) - More practical examples
- [Configuration](../../guide/configuration.md) - Advanced configuration options

## Community Support

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Join community discussions
- **Documentation**: Complete documentation and guides

Happy building with SkinFlow! 🎉