# Tool API

The Tool API provides interfaces for creating, managing, and executing tools that agents can use to interact with external systems and perform various operations.

## Tool Class

Base class for all tools in the system.

### Constructor

```javascript
class Tool {
  constructor(config) {
    this.name = config.name
    this.description = config.description
    this.parameters = config.parameters
    this.handler = config.handler
    this.permissions = config.permissions || []
    this.timeout = config.timeout || 30000
    this.rateLimit = config.rateLimit || null
  }
}
```

### Properties

- **`name`** (string): Unique tool name
- **`description`** (string): Tool description for LLM understanding
- **`parameters`** (Object): JSON Schema parameter definition
- **`handler`** (Function): Tool execution function
- **`permissions`** (Array\<string\>): Required permissions
- **`timeout`** (number): Execution timeout in milliseconds
- **`rateLimit`** (Object): Rate limiting configuration

### Methods

#### execute(params, context)

Executes the tool with given parameters.

```javascript
const result = await tool.execute({
  query: 'latest AI trends',
  maxResults: 10,
  timeframe: '2024'
}, {
  userId: 'user123',
  sessionId: 'session456',
  requestId: 'req123'
})
```

**Parameters:**
- **`params`** (Object): Tool parameters
- **`context`** (Object): Execution context

**Returns:**
- **Promise\<Object\>**: Tool execution result
  - **`success`** (boolean): Whether execution succeeded
  - **`data`** (any): Tool result data
  - **`metadata`** (Object): Execution metadata
  - **`error`** (string): Error message if failed

#### validateParameters(params)

Validates tool parameters against the schema.

```javascript
const validation = await tool.validateParameters({
  query: 'AI trends',
  maxResults: 10
})
```

**Parameters:**
- **`params`** (Object): Parameters to validate

**Returns:**
- **Object**: Validation result
  - **`valid`** (boolean): Whether parameters are valid
  - **`errors`** (Array\<string\>): Validation errors if invalid

## ToolRegistry

Manages tool registration, discovery, and execution.

### Constructor

```javascript
import { ToolRegistry } from 'skingflow'

const toolRegistry = new ToolRegistry({
  enableSandbox: true,
  defaultTimeout: 30000,
  rateLimit: {
    enabled: true,
    windowMs: 60000,
    maxRequests: 100
  }
})
```

### Methods

#### registerTool(tool)

Registers a tool with the registry.

```javascript
const searchTool = new Tool({
  name: 'web_search',
  description: 'Search the web for information',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results',
        default: 10
      }
    },
    required: ['query']
  },
  handler: async (params, context) => {
    // Web search implementation
    const results = await performWebSearch(params.query, params.maxResults)
    return { results }
  }
})

await toolRegistry.registerTool(searchTool)
```

**Parameters:**
- **`tool`** (Tool): Tool instance to register

**Returns:**
- **Promise\<void\>**

#### unregisterTool(toolName)

Unregisters a tool from the registry.

```javascript
await toolRegistry.unregisterTool('web_search')
```

**Parameters:**
- **`toolName`** (string): Name of the tool to unregister

**Returns:**
- **Promise\<void\>**

#### getTool(toolName)

Gets a registered tool by name.

```javascript
const tool = await toolRegistry.getTool('web_search')
```

**Parameters:**
- **`toolName`** (string): Name of the tool to retrieve

**Returns:**
- **Promise\<Tool\>**: Tool instance or null if not found

#### listTools()

Lists all registered tools.

```javascript
const tools = await toolRegistry.listTools()
console.log('Available tools:', tools)
```

**Returns:**
- **Promise\<Array\<Object\>\>**: List of tool information
  - **`name`** (string): Tool name
  - **`description`** (string): Tool description
  - **`parameters`** (Object): Tool parameters schema
  - **`permissions`** (Array\<string\>): Required permissions

#### executeTool(toolName, params, context)

Executes a tool with permission checks and error handling.

```javascript
const result = await toolRegistry.executeTool(
  'web_search',
  { query: 'latest AI trends', maxResults: 5 },
  { userId: 'user123', sessionId: 'session456' }
)
```

**Parameters:**
- **`toolName`** (string): Name of the tool to execute
- **`params`** (Object): Tool parameters
- **`context`** (Object): Execution context

**Returns:**
- **Promise\<Object\>**: Tool execution result

## Built-in Tools

### FileSystemTool

File system operations with security restrictions.

```javascript
import { FileSystemTool } from 'skingflow'

const fileTool = new FileSystemTool({
  basePath: './workspace',
  allowedPaths: ['./workspace', './temp'],
  restrictedPaths: ['/etc', '/system', '~/.ssh'],
  maxFileSize: 10485760 // 10MB
})

await toolRegistry.registerTool(fileTool)

// Usage
const result = await toolRegistry.executeTool('file_system', {
  operation: 'read',
  path: './workspace/data.txt'
}, context)
```

### WebSearchTool

Web search functionality.

```javascript
import { WebSearchTool } from 'skingflow'

const webTool = new WebSearchTool({
  provider: 'serpapi', // 'serpapi', 'google', 'bing'
  apiKey: process.env.SERPAPI_KEY,
  timeout: 10000,
  maxResults: 10
})

await toolRegistry.registerTool(webTool)

// Usage
const result = await toolRegistry.executeTool('web_search', {
  query: 'latest developments in artificial intelligence',
  maxResults: 5
}, context)
```

### DataProcessingTool

Data processing and analysis.

```javascript
import { DataProcessingTool } from 'skingflow'

const dataTool = new DataProcessingTool({
  supportedFormats: ['json', 'csv', 'xml'],
  maxFileSize: 52428800, // 50MB
  allowedOperations: ['filter', 'sort', 'aggregate', 'transform']
})

await toolRegistry.registerTool(dataTool)

// Usage
const result = await toolRegistry.executeTool('data_processing', {
  operation: 'aggregate',
  data: salesData,
  groupBy: 'region',
  aggregation: 'sum'
}, context)
```

### CodeExecutionTool

Safe code execution in sandboxed environment.

```javascript
import { CodeExecutionTool } from 'skingflow'

const codeTool = new CodeExecutionTool({
  allowedLanguages: ['javascript', 'python'],
  timeout: 30000,
  memoryLimit: '512MB',
  allowedModules: ['lodash', 'axios', 'moment'],
  enableNetworking: false
})

await toolRegistry.registerTool(codeTool)

// Usage
const result = await toolRegistry.executeTool('code_execution', {
  language: 'javascript',
  code: `
    const data = [1, 2, 3, 4, 5];
    const sum = data.reduce((a, b) => a + b, 0);
    return { sum, average: sum / data.length };
  `
}, context)
```

## Custom Tool Implementation

Create custom tools by extending the base Tool class:

```javascript
import { Tool } from 'skingflow'

class DatabaseQueryTool extends Tool {
  constructor(config) {
    super({
      name: 'database_query',
      description: 'Execute safe database queries',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'SQL query to execute'
          },
          params: {
            type: 'array',
            items: { type: 'string' },
            description: 'Query parameters'
          },
          maxRows: {
            type: 'number',
            description: 'Maximum number of rows to return',
            default: 1000
          }
        },
        required: ['query']
      },
      permissions: ['database:read'],
      timeout: config.timeout || 30000,
      ...config
    })

    this.pool = config.pool // Database connection pool
    this.queryValidator = config.queryValidator
  }

  async execute(params, context) {
    try {
      // Validate query for security
      await this.validateQuery(params.query)

      // Execute query with parameterized inputs
      const result = await this.executeQuery(params.query, params.params || [], params.maxRows)

      return {
        success: true,
        data: result.rows,
        metadata: {
          rowCount: result.rowCount,
          queryTime: result.queryTime,
          fields: result.fields
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  async validateQuery(query) {
    // Check for dangerous operations
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /UPDATE\s+.*\s+SET/i,
      /INSERT\s+INTO/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        throw new Error('Potentially dangerous query detected')
      }
    }

    // Use custom validator if provided
    if (this.queryValidator) {
      await this.queryValidator.validate(query)
    }
  }

  async executeQuery(query, params, maxRows) {
    const startTime = Date.now()

    // Add LIMIT clause if not present
    let limitedQuery = query
    if (!query.toLowerCase().includes('limit') && maxRows) {
      limitedQuery = `${query} LIMIT ${maxRows}`
    }

    const result = await this.pool.query(limitedQuery, params)
    const queryTime = Date.now() - startTime

    return {
      rows: result.rows,
      rowCount: result.rowCount,
      queryTime,
      fields: result.fields
    }
  }
}

// Register the custom tool
const dbTool = new DatabaseQueryTool({
  pool: databasePool,
  queryValidator: new SQLValidator(),
  timeout: 45000
})

await toolRegistry.registerTool(dbTool)
```

## Tool Security

### Permission System

```javascript
// Configure tool permissions
const toolRegistry = new ToolRegistry({
  security: {
    permissions: {
      enabled: true,
      defaultPermissions: ['read:basic'],
      rolePermissions: {
        admin: ['*'],
        developer: ['read:basic', 'write:basic', 'execute:tools'],
        user: ['read:basic', 'execute:basic_tools'],
        guest: ['read:basic']
      }
    }
  }
})

// Check permissions before tool execution
await toolRegistry.checkPermission('file_system', 'write', { userId: 'user123', role: 'user' })
```

### Sandboxing

```javascript
// Configure tool sandboxing
const toolRegistry = new ToolRegistry({
  sandbox: {
    enabled: true,
    timeout: 30000,
    memoryLimit: '512MB',
    allowedModules: ['fs', 'path', 'crypto'],
    blockedModules: ['child_process', 'net', 'dgram'],
    fileSystem: {
      basePath: './sandbox',
      readOnly: true,
      allowedPaths: ['./sandbox/public'],
      restrictedPaths: ['/etc', '/system']
    },
    network: {
      enabled: false,
      allowedHosts: [],
      allowedPorts: []
    }
  }
})
```

### Rate Limiting

```javascript
// Configure rate limiting
const toolRegistry = new ToolRegistry({
  rateLimit: {
    enabled: true,
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    onLimitReached: (toolName, userId) => {
      console.log(`Rate limit reached for ${toolName} by user ${userId}`)
    }
  }
})
```

## Tool Monitoring

Monitor tool usage and performance:

```javascript
// Get tool usage statistics
const stats = await toolRegistry.getToolStatistics()
console.log('Tool Statistics:', stats)

// Output example:
{
  "tools": {
    "web_search": {
      "totalExecutions": 1234,
      "successfulExecutions": 1180,
      "failedExecutions": 54,
      "averageExecutionTime": 2345,
      "lastUsed": "2024-01-15T10:30:00Z",
      "topUsers": ["user123", "user456", "user789"]
    },
    "file_system": {
      "totalExecutions": 856,
      "successfulExecutions": 834,
      "failedExecutions": 22,
      "averageExecutionTime": 1234,
      "lastUsed": "2024-01-15T10:25:00Z",
      "topUsers": ["user123", "user789", "user456"]
    }
  },
  "summary": {
    "totalExecutions": 2090,
    "successRate": 0.964,
    "averageExecutionTime": 1890
  }
}
```

## Tool Chaining

Chain multiple tools together for complex operations:

```javascript
// Execute a tool chain
const chainResult = await toolRegistry.executeToolChain([
  {
    tool: 'web_search',
    params: { query: 'latest AI research papers', maxResults: 5 },
    saveTo: 'search_results'
  },
  {
    tool: 'data_processing',
    params: {
      operation: 'filter',
      data: '${search_results.results}',
      condition: 'year >= 2023'
    },
    saveTo: 'filtered_results'
  },
  {
    tool: 'file_system',
    params: {
      operation: 'write',
      path: './research_summary.json',
      content: '${filtered_results}'
    }
  }
], context)
```

## Error Handling and Recovery

Implement comprehensive error handling:

```javascript
class RobustTool extends Tool {
  async execute(params, context) {
    try {
      // Validate parameters
      const validation = await this.validateParameters(params)
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`)
      }

      // Check rate limits
      await this.checkRateLimit(context.userId)

      // Execute with timeout
      const result = await this.executeWithTimeout(params, context, this.timeout)

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - context.startTime,
          toolVersion: this.version
        }
      }

    } catch (error) {
      return await this.handleError(error, params, context)
    }
  }

  async executeWithTimeout(params, context, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Tool execution timeout'))
      }, timeout)

      this.doExecute(params, context)
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  async handleError(error, params, context) {
    // Log error for monitoring
    await this.logError(error, params, context)

    // Attempt recovery if possible
    if (await this.isRecoverableError(error)) {
      const recoveryResult = await this.attemptRecovery(error, params, context)
      if (recoveryResult.success) {
        return {
          success: true,
          data: recoveryResult.data,
          recovered: true,
          warning: error.message
        }
      }
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      retryable: await this.isRetryableError(error)
    }
  }
}
```

## Best Practices

### 1. Tool Design
- Keep tools focused on single responsibilities
- Use clear, descriptive names and parameter schemas
- Implement proper error handling and validation
- Include comprehensive documentation

### 2. Security
- Always validate and sanitize inputs
- Implement proper permission checks
- Use sandboxing for potentially dangerous operations
- Monitor tool usage and performance

### 3. Performance
- Implement appropriate timeouts and rate limiting
- Use connection pooling for external services
- Cache results when appropriate
- Monitor and optimize execution times

### 4. Reliability
- Implement retry logic for transient failures
- Provide meaningful error messages
- Include detailed logging and monitoring
- Test edge cases and error scenarios

## Next Steps

- [Memory API](./memory.md) - Memory system API documentation
- [Framework API](./framework.md) - Main framework API documentation
- [Agent API](./agent.md) - Agent system API documentation
- [Examples](../examples/quick-start.md) - Practical implementations