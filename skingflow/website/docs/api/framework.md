# Framework API

The SkinFlow Framework API provides the main interface for creating and managing multi-agent systems.

## createMultiAgentFramework

Creates a new instance of the SkinFlow framework with the specified configuration.

```javascript
import { createMultiAgentFramework } from 'skingflow'

const framework = await createMultiAgentFramework(config)
```

### Parameters

- **`config`** (Object): Configuration object for the framework
  - **`llm`** (Object): LLM provider configuration
  - **`memory`** (Object): Memory system configuration
  - **`tools`** (Object): Tool system configuration
  - **`agents`** (Object): Agent system configuration
  - **`security`** (Object): Security configuration
  - **`logging`** (Object): Logging configuration

### Returns

Returns a Promise that resolves to a Framework instance.

### Example

```javascript
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

## Framework Class

The main framework class that provides all functionality.

### Methods

#### processRequest(request, context)

Processes a user request using the multi-agent system.

```javascript
const result = await framework.processRequest(
  "Create a todo list application",
  { userId: 'user123' }
)
```

**Parameters:**
- **`request`** (string): The user request to process
- **`context`** (Object): Context object containing user and session information
  - **`userId`** (string): Unique identifier for the user
  - **`sessionId`** (string): Unique identifier for the session
  - **`metadata`** (Object): Additional context metadata

**Returns:**
- **Promise\<Object\>**: Result object containing:
  - **`success`** (boolean): Whether the request was successful
  - **`content`** (string): The main response content
  - **`data`** (Object): Additional data returned by agents
  - **`metadata`** (Object): Processing metadata
  - **`error`** (string): Error message if failed

**Example:**
```javascript
const result = await framework.processRequest(
  "Analyze the sales data and create a report",
  {
    userId: 'user123',
    sessionId: 'session456',
    metadata: {
      department: 'sales',
      priority: 'high'
    }
  }
)

if (result.success) {
  console.log('Response:', result.content)
  console.log('Additional data:', result.data)
} else {
  console.error('Error:', result.error)
}
```

#### processRequestStream(request, context)

Processes a user request with streaming output for real-time responses.

```javascript
const stream = await framework.processRequestStream(
  "Write a detailed analysis of current AI trends",
  { userId: 'user123' }
)

for await (const chunk of stream) {
  console.log(chunk.content)
}
```

**Parameters:**
- **`request`** (string): The user request to process
- **`context`** (Object): Context object (same as `processRequest`)

**Returns:**
- **AsyncIterable\<Object\>**: Async iterable that yields chunks containing:
  - **`content`** (string): Content chunk
  - **`type`** (string): Chunk type ('content', 'metadata', 'error')
  - **`done`** (boolean): Whether this is the final chunk

**Example:**
```javascript
const stream = await framework.processRequestStream(
  "Create a comprehensive business plan",
  { userId: 'user123' }
)

let fullContent = ''
for await (const chunk of stream) {
  if (chunk.type === 'content') {
    fullContent += chunk.content
    process.stdout.write(chunk.content)
  } else if (chunk.type === 'metadata') {
    console.log('\nMetadata:', chunk.data)
  }
}

console.log('\nComplete response received')
```

#### executeWorkflow(workflow, context)

Executes a predefined workflow with multiple steps and agents.

```javascript
const workflow = {
  name: 'data-analysis-workflow',
  description: 'Analyze data and create visualizations',
  steps: [
    {
      name: 'data-collection',
      agent: 'research',
      input: 'Collect sales data for Q4 2023',
      timeout: 300000
    },
    {
      name: 'data-analysis',
      agent: 'analysis',
      input: 'Analyze the collected sales data',
      dependencies: ['data-collection']
    },
    {
      name: 'visualization',
      agent: 'programming',
      input: 'Create charts and graphs from the analysis',
      dependencies: ['data-analysis']
    },
    {
      name: 'report',
      agent: 'content-creation',
      input: 'Write a comprehensive report with findings',
      dependencies: ['visualization']
    }
  ]
}

const result = await framework.executeWorkflow(workflow, { userId: 'user123' })
```

**Parameters:**
- **`workflow`** (Object): Workflow definition
  - **`name`** (string): Unique workflow name
  - **`description`** (string): Workflow description
  - **`steps`** (Array\<Object\>): Array of workflow steps
    - **`name`** (string): Step name
    - **`agent`** (string): Agent type to use
    - **`input`** (string): Input for the step
    - **`timeout`** (number): Step timeout in milliseconds
    - **`dependencies`** (Array\<string\>): Dependencies on other steps
- **`context`** (Object): Context object

**Returns:**
- **Promise\<Object\>**: Workflow execution result
  - **`success`** (boolean): Whether workflow completed successfully
  - **`results`** (Object): Results from each step
  - **`metadata`** (Object): Execution metadata
  - **`error`** (string): Error message if failed

#### getAgentStatus()

Gets the current status of all agents in the system.

```javascript
const status = await framework.getAgentStatus()
console.log('Agent Status:', status)
```

**Returns:**
- **Promise\<Object\>**: Agent status information
  - **`planning`** (Object): Planning agent status
  - **`sub-agents`** (Object): Sub-agent status
  - **`total`** (number): Total number of active agents
  - **`capacity`** (Object): Agent capacity information

**Example:**
```javascript
{
  "planning": {
    "status": "idle",
    "currentTask": null,
    "lastActivity": "2024-01-15T10:30:00Z"
  },
  "sub-agents": {
    "research": {
      "status": "busy",
      "currentTask": "market-analysis",
      "activeTime": 120000
    },
    "programming": {
      "status": "idle",
      "currentTask": null,
      "lastActivity": "2024-01-15T10:25:00Z"
    }
  },
  "total": 5,
  "capacity": {
    "used": 2,
    "available": 3,
    "utilization": 0.4
  }
}
```

#### getHealthStatus()

Gets the overall health status of the framework.

```javascript
const health = await framework.getHealthStatus()
console.log('System Health:', health)
```

**Returns:**
- **Promise\<Object\>**: Health status information
  - **`status`** (string): Overall health status ('healthy', 'degraded', 'unhealthy')
  - **`components`** (Object): Status of individual components
  - **`metrics`** (Object): System metrics

**Example:**
```javascript
{
  "status": "healthy",
  "components": {
    "llm": {
      "status": "connected",
      "provider": "openai",
      "responseTime": 234
    },
    "memory": {
      "status": "connected",
      "storage": "memory",
      "usage": 0.3
    },
    "tools": {
      "status": "operational",
      "available": 15,
      "enabled": 12
    }
  },
  "metrics": {
    "uptime": 86400000,
    "requestsProcessed": 1234,
    "successRate": 0.98,
    "averageResponseTime": 2345
  }
}
```

#### registerAgent(agentConfig)

Registers a custom agent with the framework.

```javascript
const customAgent = {
  name: 'custom-data-processor',
  type: 'specialist',
  capabilities: ['data-processing', 'etl'],
  model: 'gpt-4',
  tools: ['data-analysis', 'csv-export'],
  maxConcurrentTasks: 3,
  timeout: 300000,
  handler: async (task, context) => {
    // Custom agent implementation
    return {
      success: true,
      result: 'Data processed successfully',
      data: processedData
    }
  }
}

await framework.registerAgent(customAgent)
```

**Parameters:**
- **`agentConfig`** (Object): Agent configuration
  - **`name`** (string): Unique agent name
  - **`type`** (string): Agent type
  - **`capabilities`** (Array\<string\>): Agent capabilities
  - **`model`** (string): LLM model to use
  - **`tools`** (Array\<string\>): Tools the agent can use
  - **`handler`** (Function): Agent handler function

**Returns:**
- **Promise\<void\>**

#### updateConfig(newConfig)

Updates the framework configuration at runtime.

```javascript
await framework.updateConfig({
  logging: {
    level: 'debug'
  },
  agents: {
    maxConcurrentAgents: 10
  }
})
```

**Parameters:**
- **`newConfig`** (Object): New configuration values to merge with existing config

**Returns:**
- **Promise\<void\>**

#### shutdown()

Gracefully shuts down the framework and releases resources.

```javascript
await framework.shutdown()
console.log('Framework shutdown complete')
```

**Returns:**
- **Promise\<void\>**

## Events

The framework emits various events that you can listen to:

```javascript
framework.on('requestStarted', (requestId, request, context) => {
  console.log(`Request started: ${requestId}`)
})

framework.on('requestCompleted', (requestId, result, duration) => {
  console.log(`Request completed: ${requestId} in ${duration}ms`)
})

framework.on('requestFailed', (requestId, error, duration) => {
  console.log(`Request failed: ${requestId} - ${error.message}`)
})

framework.on('agentStatusChanged', (agentName, oldStatus, newStatus) => {
  console.log(`Agent ${agentName} status changed: ${oldStatus} -> ${newStatus}`)
})

framework.on('workflowStepCompleted', (workflowName, stepName, result) => {
  console.log(`Workflow ${workflowName} step ${stepName} completed`)
})
```

### Event Types

- **`requestStarted`**: Fired when a request starts processing
- **`requestCompleted`**: Fired when a request completes successfully
- **`requestFailed`**: Fired when a request fails
- **`agentStatusChanged`**: Fired when an agent's status changes
- **`workflowStepCompleted`**: Fired when a workflow step completes
- **`workflowCompleted`**: Fired when a workflow completes
- **`configUpdated`**: Fired when configuration is updated
- **`healthStatusChanged`**: Fired when system health status changes

## Error Handling

The framework provides comprehensive error handling:

```javascript
try {
  const result = await framework.processRequest(
    "Complex request that might fail",
    { userId: 'user123' }
  )
} catch (error) {
  switch (error.code) {
    case 'LLM_API_ERROR':
      console.error('LLM API Error:', error.message)
      break
    case 'MEMORY_ERROR':
      console.error('Memory Error:', error.message)
      break
    case 'TOOL_ERROR':
      console.error('Tool Error:', error.message)
      break
    case 'TIMEOUT_ERROR':
      console.error('Timeout Error:', error.message)
      break
    case 'AUTHENTICATION_ERROR':
      console.error('Authentication Error:', error.message)
      break
    default:
      console.error('Unknown Error:', error.message)
  }
}
```

### Error Codes

- **`LLM_API_ERROR`**: LLM provider API error
- **`MEMORY_ERROR`**: Memory system error
- **`TOOL_ERROR`**: Tool execution error
- **`TIMEOUT_ERROR`**: Operation timeout
- **`AUTHENTICATION_ERROR`**: Authentication failure
- **`AUTHORIZATION_ERROR`**: Authorization failure
- **`VALIDATION_ERROR`**: Input validation error
- **`CONFIGURATION_ERROR`**: Configuration error
- **`INTERNAL_ERROR`**: Internal system error

## Performance Optimization

### Request Batching

```javascript
// Process multiple requests efficiently
const requests = [
  { request: "Task 1", context: { userId: 'user123' } },
  { request: "Task 2", context: { userId: 'user123' } },
  { request: "Task 3", context: { userId: 'user123' } }
]

const results = await Promise.all(
  requests.map(r => framework.processRequest(r.request, r.context))
)
```

### Connection Pooling

The framework automatically manages connection pooling for optimal performance:

```javascript
// Configure connection pooling
const framework = await createMultiAgentFramework({
  performance: {
    resources: {
      connections: {
        llm: {
          maxConnections: 10,
          minConnections: 2
        },
        database: {
          maxConnections: 20,
          minConnections: 5
        }
      }
    }
  }
})
```

## Configuration Examples

### Production Configuration

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4000,
    temperature: 0.3,
    retry: {
      maxRetries: 5,
      retryDelay: 1000
    }
  },
  memory: {
    storage: {
      type: 'postgres',
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
    }
  },
  agents: {
    maxConcurrentAgents: 10,
    maxConcurrentTasks: 20
  },
  logging: {
    level: 'info',
    outputs: [
      {
        type: 'elasticsearch',
        host: process.env.ELASTICSEARCH_HOST
      }
    ]
  }
})
```

### Development Configuration

```javascript
const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  },
  memory: {
    storage: {
      type: 'memory'
    }
  },
  logging: {
    level: 'debug'
  }
})
```

## Next Steps

- [Agent API](./agent.md) - Agent-specific API documentation
- [Tool API](./tool.md) - Tool system API documentation
- [Memory API](./memory.md) - Memory system API documentation
- [Examples](../examples/quick-start.md) - Practical implementations