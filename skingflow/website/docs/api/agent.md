# Agent API

The Agent API provides interfaces for creating, managing, and interacting with individual agents within the SkinFlow framework.

## Agent Class

Base class for all agents in the system.

### Constructor

```javascript
class Agent {
  constructor(config) {
    this.name = config.name
    this.type = config.type
    this.capabilities = config.capabilities || []
    this.model = config.model
    this.tools = config.tools || []
    this.timeout = config.timeout || 30000
    this.maxConcurrentTasks = config.maxConcurrentTasks || 1
  }
}
```

### Properties

- **`name`** (string): Unique agent name
- **`type`** (string): Agent type ('planning', 'research', 'programming', etc.)
- **`capabilities`** (Array\<string\>): List of agent capabilities
- **`model`** (string): LLM model used by the agent
- **`tools`** (Array\<string\>): Tools available to the agent
- **`timeout`** (number): Operation timeout in milliseconds
- **`maxConcurrentTasks`** (number): Maximum concurrent tasks the agent can handle

### Methods

#### execute(task, context)

Executes a task using the agent's capabilities.

```javascript
const result = await agent.execute({
  id: 'task123',
  type: 'research',
  description: 'Research market trends for AI in 2024',
  parameters: {
    timeframe: '2024',
    topics: ['AI', 'machine learning', 'automation']
  }
}, {
  userId: 'user123',
  sessionId: 'session456'
})
```

**Parameters:**
- **`task`** (Object): Task to execute
  - **`id`** (string): Unique task identifier
  - **`type`** (string): Task type
  - **`description`** (string): Task description
  - **`parameters`** (Object): Task parameters
- **`context`** (Object): Execution context

**Returns:**
- **Promise\<Object\>**: Task execution result
  - **`success`** (boolean): Whether execution succeeded
  - **`result`** (any): Task result data
  - **`metadata`** (Object): Execution metadata
  - **`error`** (string): Error message if failed

#### getCapabilities()

Returns the agent's capabilities.

```javascript
const capabilities = await agent.getCapabilities()
console.log('Agent capabilities:', capabilities)
```

**Returns:**
- **Promise\<Array\<string\>\>**: List of agent capabilities

#### getStatus()

Gets the current status of the agent.

```javascript
const status = await agent.getStatus()
console.log('Agent status:', status)
```

**Returns:**
- **Promise\<Object\>**: Agent status
  - **`state`** (string): Current state ('idle', 'busy', 'error')
  - **`currentTask`** (string): Currently executing task
  - **`activeTime`** (number): Time spent on current task
  - **`tasksCompleted`** (number): Total tasks completed

## PlanningAgent

Specialized agent for task planning and decomposition.

### Constructor

```javascript
import { PlanningAgent } from 'skingflow'

const planningAgent = new PlanningAgent({
  name: 'planning-agent',
  model: 'gpt-4',
  maxPlanningSteps: 20,
  timeout: 60000,
  enableAutoRefinement: true
})
```

### Methods

#### analyzeRequest(request)

Analyzes a user request to understand intent and requirements.

```javascript
const analysis = await planningAgent.analyzeRequest(
  "Create a comprehensive e-commerce platform with user authentication"
)
```

**Parameters:**
- **`request`** (string): User request to analyze

**Returns:**
- **Promise\<Object\>**: Request analysis
  - **`intent`** (string): Identified user intent
  - **`requirements`** (Array\<string\>): Extracted requirements
  - **`complexity`** (number): Estimated complexity (1-10)
  - **`estimatedDuration`** (number): Estimated duration in milliseconds

#### decomposeTask(task)

Breaks down a complex task into manageable subtasks.

```javascript
const task = {
  description: "Create a comprehensive e-commerce platform",
  requirements: ["user authentication", "product catalog", "payment processing"]
}

const subtasks = await planningAgent.decomposeTask(task)
```

**Parameters:**
- **`task`** (Object): Task to decompose

**Returns:**
- **Promise\<Array\<Object\>\>**: Array of subtasks
  - **`id`** (string): Subtask identifier
  - **`description`** (string): Subtask description
  - **`type`** (string): Subtask type
  - **`agent`** (string): Recommended agent type
  - **`dependencies`** (Array\<string\>): Dependencies on other subtasks
  - **`estimatedDuration`** (number): Estimated duration

#### createExecutionPlan(subtasks)

Creates an execution plan from subtasks with dependencies.

```javascript
const plan = await planningAgent.createExecutionPlan(subtasks)
```

**Parameters:**
- **`subtasks`** (Array\<Object\>): Array of subtasks

**Returns:**
- **Promise\<Object\>**: Execution plan
  - **`steps`** (Array\<Object\>): Ordered execution steps
  - **`parallelGroups`** (Array\<Array\<string\>\>): Groups of parallel tasks
  - **criticalPath`** (Array\<string\>): Critical path tasks
  - **`estimatedTotalDuration`** (number): Total estimated duration

## SubAgent

Base class for specialized sub-agents.

### Constructor

```javascript
import { SubAgent } from 'skingflow'

const researchAgent = new SubAgent({
  name: 'research-agent',
  type: 'research',
  capabilities: ['web-research', 'data-analysis', 'report-writing'],
  model: 'gpt-4',
  tools: ['web_search', 'document_analysis', 'data_visualization'],
  maxConcurrentTasks: 3
})
```

### Methods

#### executeSpecializedTask(task, context)

Executes a specialized task specific to the agent type.

```javascript
const result = await researchAgent.executeSpecializedTask({
  type: 'web-research',
  query: 'Latest trends in artificial intelligence',
  sources: ['academic', 'industry', 'news'],
  depth: 'comprehensive'
}, {
  userId: 'user123',
  availableTools: ['web_search', 'document_analysis']
})
```

**Parameters:**
- **`task`** (Object): Specialized task
  - **`type`** (string): Task type specific to agent
  - **`query`** (string): Research query or task description
  - **`parameters`** (Object): Task-specific parameters
- **`context`** (Object): Execution context with available tools

**Returns:**
- **Promise\<Object\>**: Task execution result
  - **`success`** (boolean): Success status
  - **`data`** (Object): Result data
  - **`sources`** (Array\<Object\>): Information sources used
  - **`confidence`** (number): Confidence score (0-1)

## AgentManager

Manages the lifecycle and coordination of all agents.

### Constructor

```javascript
import { AgentManager } from 'skingflow'

const agentManager = new AgentManager({
  maxConcurrentAgents: 5,
  taskQueueSize: 100,
  loadBalancingStrategy: 'round-robin'
})
```

### Methods

#### registerAgent(agent)

Registers an agent with the manager.

```javascript
await agentManager.registerAgent(researchAgent)
```

**Parameters:**
- **`agent`** (Agent): Agent instance to register

**Returns:**
- **Promise\<void\>**

#### unregisterAgent(agentName)

Unregisters an agent from the manager.

```javascript
await agentManager.unregisterAgent('research-agent')
```

**Parameters:**
- **`agentName`** (string): Name of the agent to unregister

**Returns:**
- **Promise\<void\>**

#### selectAgentForTask(task)

Selects the best agent for a given task.

```javascript
const agent = await agentManager.selectAgentForTask({
  type: 'web-research',
  requiredCapabilities: ['web-research', 'data-analysis'],
  priority: 'high'
})
```

**Parameters:**
- **`task`** (Object): Task information
  - **`type`** (string): Task type
  - **`requiredCapabilities`** (Array\<string\>): Required capabilities
  - **`priority`** (string): Task priority ('low', 'normal', 'high')

**Returns:**
- **Promise\<Agent\>**: Selected agent instance

#### distributeTasks(tasks)

Distributes tasks among available agents.

```javascript
const assignments = await agentManager.distributeTasks([
  { id: 'task1', type: 'research', priority: 'high' },
  { id: 'task2', type: 'programming', priority: 'normal' },
  { id: 'task3', type: 'analysis', priority: 'low' }
])
```

**Parameters:**
- **`tasks`** (Array\<Object\>): Tasks to distribute

**Returns:**
- **Promise\<Object\>**: Task assignments
  - **`agentAssignments`** (Object): Mapping of agent names to tasks
  - **`unassignedTasks`** (Array\<string\>): Tasks that couldn't be assigned

#### getAgentStatus()

Gets status information for all registered agents.

```javascript
const status = await agentManager.getAgentStatus()
```

**Returns:**
- **Promise\<Object\>**: Agent status information
  - **`agents`** (Object): Status of each agent
  - **`summary`** (Object): Summary statistics
  - **`utilization`** (number): Overall agent utilization

## Custom Agent Implementation

Create custom agents by extending the base classes:

```javascript
import { SubAgent } from 'skingflow'

class CustomDataProcessor extends SubAgent {
  constructor(config) {
    super({
      name: 'custom-data-processor',
      type: 'data-processor',
      capabilities: ['data-cleaning', 'transformation', 'analysis'],
      model: 'gpt-4',
      tools: ['data_analysis', 'csv_export', 'chart_generation'],
      ...config
    })
  }

  async executeSpecializedTask(task, context) {
    switch (task.type) {
      case 'data-cleaning':
        return await this.cleanData(task.data, task.rules)
      case 'transformation':
        return await this.transformData(task.data, task.transformations)
      case 'analysis':
        return await this.analyzeData(task.data, task.analysisType)
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  async cleanData(data, rules) {
    // Custom data cleaning logic
    const cleanedData = this.applyCleaningRules(data, rules)
    return {
      success: true,
      data: cleanedData,
      metrics: {
        recordsProcessed: data.length,
        errorsFixed: rules.length,
        dataQuality: 0.95
      }
    }
  }

  async transformData(data, transformations) {
    // Custom data transformation logic
    const transformedData = this.applyTransformations(data, transformations)
    return {
      success: true,
      data: transformedData,
      transformations: transformations.map(t => ({
        type: t.type,
        recordsAffected: data.length
      }))
    }
  }

  async analyzeData(data, analysisType) {
    // Custom data analysis logic
    const analysis = this.performAnalysis(data, analysisType)
    return {
      success: true,
      analysis: analysis,
      insights: this.generateInsights(analysis),
      recommendations: this.generateRecommendations(analysis)
    }
  }
}

// Register the custom agent
const customAgent = new CustomDataProcessor({
  timeout: 120000,
  maxConcurrentTasks: 2
})

await framework.registerAgent(customAgent)
```

## Agent Communication

Agents can communicate with each other through the messaging system:

```javascript
// Send message from one agent to another
await agentManager.sendMessage({
  from: 'research-agent',
  to: 'analysis-agent',
  type: 'data-request',
  content: {
    requestId: 'req123',
    dataType: 'market-data',
    timeframe: '2024',
    format: 'json'
  }
})

// Listen for messages
analysisAgent.on('message', async (message) => {
  if (message.type === 'data-request') {
    const data = await analysisAgent.processDataRequest(message.content)
    await agentManager.sendMessage({
      from: 'analysis-agent',
      to: message.from,
      type: 'data-response',
      content: {
        requestId: message.content.requestId,
        data: data,
        success: true
      }
    })
  }
})
```

## Agent Monitoring

Monitor agent performance and health:

```javascript
// Get agent metrics
const metrics = await agentManager.getAgentMetrics()
console.log('Agent Metrics:', metrics)

// Output example:
{
  "agents": {
    "research-agent": {
      "tasksCompleted": 45,
      "averageExecutionTime": 2345,
      "successRate": 0.96,
      "errorRate": 0.04,
      "currentLoad": 0.6
    },
    "programming-agent": {
      "tasksCompleted": 32,
      "averageExecutionTime": 5678,
      "successRate": 0.89,
      "errorRate": 0.11,
      "currentLoad": 0.3
    }
  },
  "summary": {
    "totalTasks": 77,
    "averageSuccessRate": 0.93,
    "totalExecutionTime": 234567,
    "utilization": 0.45
  }
}
```

## Error Handling and Recovery

Implement error handling and recovery in custom agents:

```javascript
class RobustAgent extends SubAgent {
  async executeSpecializedTask(task, context) {
    try {
      const result = await this.attemptTaskExecution(task, context)
      return result
    } catch (error) {
      return await this.handleExecutionError(error, task, context)
    }
  }

  async attemptTaskExecution(task, context) {
    // Main task execution logic
    const result = await this.performTask(task, context)
    return {
      success: true,
      result: result,
      executionTime: Date.now() - task.startTime
    }
  }

  async handleExecutionError(error, task, context) {
    // Error handling and recovery logic
    if (this.isRecoverableError(error)) {
      const recoveryResult = await this.attemptRecovery(error, task, context)
      if (recoveryResult.success) {
        return {
          success: true,
          result: recoveryResult.result,
          recovered: true,
          originalError: error.message
        }
      }
    }

    // Log error for monitoring
    await this.logError(error, task, context)

    return {
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      taskId: task.id
    }
  }

  isRecoverableError(error) {
    const recoverableErrors = ['TIMEOUT_ERROR', 'NETWORK_ERROR', 'TEMPORARY_FAILURE']
    return recoverableErrors.includes(error.code)
  }

  async attemptRecovery(error, task, context) {
    // Implement recovery strategy based on error type
    switch (error.code) {
      case 'TIMEOUT_ERROR':
        return await this.retryWithLongerTimeout(task, context)
      case 'NETWORK_ERROR':
        return await this.retryWithDifferentEndpoint(task, context)
      default:
        return { success: false }
    }
  }
}
```

## Best Practices

### 1. Agent Specialization
- Create agents with specific, well-defined capabilities
- Avoid creating "do-everything" agents
- Leverage agent collaboration for complex tasks

### 2. Resource Management
- Set appropriate timeouts and concurrency limits
- Implement proper error handling and recovery
- Monitor agent performance and health

### 3. Communication
- Use the messaging system for inter-agent communication
- Implement proper message handling and routing
- Handle communication failures gracefully

### 4. Testing
- Test individual agent capabilities
- Test agent collaboration scenarios
- Test error handling and recovery mechanisms

## Next Steps

- [Tool API](./tool.md) - Tool system API documentation
- [Memory API](./memory.md) - Memory system API documentation
- [Framework API](./framework.md) - Main framework API documentation
- [Examples](../examples/quick-start.md) - Practical implementations