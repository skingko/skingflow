# Core Concepts

Understanding these fundamental concepts will help you build powerful applications with the skingflow framework. This guide covers the essential building blocks and architectural patterns.

## 🌊 Streaming-First Architecture

skingflow is built around **streaming** as a core principle. Instead of waiting for complete responses, data flows through your application in real-time chunks.

### Why Streaming?

- **Better User Experience**: Users see responses immediately
- **Lower Memory Usage**: Process data incrementally
- **Real-time Processing**: Handle live data streams
- **Scalability**: Handle large datasets without blocking

### Async Generators

The foundation of streaming in skingflow is JavaScript's async generators:

```javascript
// Basic async generator
async function* simpleStream() {
  yield 'First chunk';
  yield 'Second chunk';
  yield 'Final chunk';
}

// Usage
for await (const chunk of simpleStream()) {
  console.log(chunk); // Prints each chunk as it's yielded
}
```

### Nodes and Flows

Everything in skingflow is built on **Nodes** and **Flows**:

```javascript
import { AsyncNode, AsyncFlow } from 'skingflow';

// Custom node that processes data
class ProcessorNode extends AsyncNode {
  async *execAsyncStream(shared) {
    yield 'Processing...\n';
    
    // Do some work
    const result = await processData(shared.input);
    
    yield `Result: ${result}\n`;
  }
}

// Flow that orchestrates multiple nodes
class MyFlow extends AsyncFlow {
  async *execAsyncStream(shared) {
    const processor = new ProcessorNode();
    yield* processor.execAsyncStream(shared);
  }
}
```

## 🤖 LLM System

The LLM system provides a unified interface for working with different language models.

### Provider Abstraction

```javascript
import { LLMFactory, LLMConfig } from 'skingflow';

// OpenAI provider
const openaiLLM = LLMFactory.create({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7
});

// Anthropic provider
const anthropicLLM = LLMFactory.create({
  provider: 'anthropic',
  model: 'claude-3-sonnet-20240229',
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Custom HTTP provider
const customLLM = LLMFactory.create({
  provider: 'http',
  baseUrl: 'https://api.custom-llm.com/v1/chat',
  model: 'custom-model',
  apiKey: process.env.CUSTOM_API_KEY
});
```

### Prompt Templates

Create reusable, dynamic prompts:

```javascript
import { PromptTemplate } from 'skingflow';

const template = new PromptTemplate(`
You are a {{role}} assistant specializing in {{domain}}.

{{#if context}}
Context: {{context}}
{{/if}}

User: {{input}}
Assistant:`, {
  role: 'helpful',
  domain: 'general knowledge'
});

const prompt = template.compile({
  input: 'What is machine learning?',
  context: 'Previous conversation about AI'
});
```

### Streaming Responses

All LLM providers support streaming:

```javascript
// Stream from any provider
for await (const chunk of llm.stream('Tell me a story')) {
  process.stdout.write(chunk);
}

// Or get complete response
const response = await llm.complete('Summarize this text');
```

## 🧠 Memory System

The memory system provides semantic storage and retrieval capabilities.

### Memory Entries

Everything stored in memory is a **MemoryEntry**:

```javascript
import { MemoryEntry } from 'skingflow';

const entry = new MemoryEntry({
  content: 'User prefers coffee over tea',
  type: 'preference',
  category: 'food',
  tags: ['beverages', 'preferences'],
  userId: 'user-123',
  importance: 0.8,
  metadata: { source: 'conversation' }
});
```

### Query Builder

Flexible querying with the **MemoryQuery** builder:

```javascript
import { MemoryQuery } from 'skingflow';

// Find user preferences about food
const results = await memory.query(q => 
  q.equals('userId', 'user-123')
   .equals('category', 'food')
   .contains('content', 'prefer')
   .orderBy('importance', 'desc')
   .limit(5)
);

// Semantic search
const semanticResults = await memory.query(q =>
  q.semantic('coffee preferences', 10)
   .equals('userId', 'user-123')
);

// Vector similarity search
const similarResults = await memory.query(q =>
  q.similar(embedding, 0.8)
   .limit(5)
);
```

### Storage Backends

Multiple storage options available:

```javascript
import { 
  InMemoryStorage,
  PostgresStorage,
  RedisStorage,
  MongoDBStorage 
} from 'skingflow';

// In-memory (development)
const memoryStorage = new InMemoryStorage();

// PostgreSQL with vector support
const pgStorage = new PostgresStorage({
  connectionString: 'postgresql://...',
  vectorDimensions: 1536
});

// Redis with vector search
const redisStorage = new RedisStorage({
  url: 'redis://localhost:6379',
  vectorIndex: 'memories_idx'
});
```

## 🔧 Tool System

The tool system provides unified access to external capabilities.

### Tool Definition

Tools are defined with structured metadata:

```javascript
import { ToolDefinition, Tool } from 'skingflow';

// Define a tool
const definition = new ToolDefinition({
  name: 'weather_api',
  description: 'Get current weather for a location',
  parameters: {
    location: { 
      type: 'string', 
      description: 'City name', 
      required: true 
    },
    units: { 
      type: 'string', 
      enum: ['celsius', 'fahrenheit'],
      required: false 
    }
  }
});

// Implement the tool
const weatherTool = new Tool(definition, async (params) => {
  const response = await fetch(`https://api.weather.com/v1/current?location=${params.location}`);
  return await response.json();
});
```

### Tool Registry

Manage all your tools in one place:

```javascript
import { ToolRegistry } from 'skingflow';

const registry = new ToolRegistry();

// Register tools
registry.register(weatherTool);
registry.register(calculatorTool);
registry.register(databaseTool);

// Execute tools
const result = await registry.execute('weather_api', {
  location: 'London, UK',
  units: 'celsius'
});

// Search tools
const weatherTools = registry.search('weather');
const utilityTools = registry.getByCategory('utility');
```

### Tool Types

Multiple ways to create tools:

```javascript
import { FunctionTool, HTTPTool, MCPTool } from 'skingflow';

// Function tool (JavaScript function)
const mathTool = new FunctionTool('add', 
  (params) => params.a + params.b,
  {
    description: 'Add two numbers',
    parameters: {
      a: { type: 'number', required: true },
      b: { type: 'number', required: true }
    }
  }
);

// HTTP tool (external API)
const httpTool = new HTTPTool(definition, {
  url: 'https://api.example.com/tool',
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' }
});

// MCP tool (Model Context Protocol)
const mcpTool = MCPTool.fromMCPTool(mcpClient, toolInfo);
```

## 🎭 Flow Orchestration

Orchestration enables complex workflow composition.

### Flow Steps

Build workflows with different step types:

```javascript
import { FlowOrchestrator, FlowStep } from 'skingflow';

const orchestrator = new FlowOrchestrator()
  // Sequential steps
  .addStep(dataCollector, { name: 'Collect Data' })
  .addStep(dataProcessor, { name: 'Process Data' })
  
  // Conditional execution
  .addCondition(
    (shared) => shared.dataQuality > 0.8,
    generateReport,      // if true
    requestMoreData      // if false
  )
  
  // Parallel execution
  .addParallel([
    emailNotifier,
    slackNotifier,
    databaseLogger
  ], { waitForAll: false })
  
  // Loop execution
  .addLoop([validator, processor], 
    (shared) => !shared.isValid,
    { maxIterations: 5 }
  );
```

### Control Flow

Advanced control patterns:

```javascript
// Conditional branching
const condition = new FlowCondition(
  (shared) => shared.userType === 'premium',
  premiumFlow,
  standardFlow
);

// Parallel processing
const parallelGroup = new ParallelGroup([
  imageProcessor,
  textAnalyzer,
  metadataExtractor
], {
  maxConcurrency: 3,
  failFast: false
});

// Loop with break condition
const processingLoop = new FlowLoop([
  dataFetcher,
  dataValidator,
  dataProcessor
], 
  (shared) => shared.hasMoreData,
  {
    maxIterations: 100,
    breakOn: (shared) => shared.errorCount > 5
  }
);
```

### Middleware

Add cross-cutting concerns:

```javascript
import { LoggingMiddleware, TimingMiddleware, RetryMiddleware } from 'skingflow';

const orchestrator = new FlowOrchestrator()
  .use(new LoggingMiddleware(logger))
  .use(new TimingMiddleware())
  .use(new RetryMiddleware({ maxRetries: 3 }));
```

## 🏗️ Framework Architecture

### Framework Builder

Create framework instances with the builder pattern:

```javascript
import { FrameworkBuilder } from 'skingflow';

const framework = await new FrameworkBuilder()
  .withLLM({
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  })
  .withMemory({
    storage: { type: 'postgres', url: '...' },
    autoEmbedding: true,
    embeddingProvider: { provider: 'openai' }
  })
  .withTools({
    loadBuiltin: true,
    directory: './custom-tools',
    custom: [customTool1, customTool2]
  })
  .withOrchestration({
    stopOnError: false,
    maxConcurrency: 5
  })
  .build();
```

### Component Integration

All components work together seamlessly:

```javascript
// Create a comprehensive AI application
const chatFlow = framework
  .createChatFlow()
  .withPrompt(promptTemplate)
  .hook('beforeExec', async (prepRes) => {
    // Add custom logic before LLM execution
    prepRes.context = await getAdditionalContext(prepRes.userId);
  })
  .hook('afterExec', async (prepRes) => {
    // Store conversation in memory
    await framework.memory.insert({
      content: prepRes.messages,
      userId: prepRes.userId,
      type: 'conversation'
    });
  })
  .build();
```

## 📊 Data Flow

Understanding how data flows through the system:

```
User Input
    ↓
Framework Entry Point
    ↓
Memory Retrieval ←→ Memory System
    ↓
Prompt Template Processing
    ↓
LLM Processing ←→ Tool Execution
    ↓
Response Streaming
    ↓
Memory Storage
    ↓
User Output
```

## 🔄 Lifecycle Management

Proper resource management:

```javascript
async function applicationLifecycle() {
  // Initialize
  const framework = await createFramework(config);
  
  try {
    // Use framework
    const result = await framework.processRequest(input);
    return result;
  } finally {
    // Always cleanup
    await framework.close();
  }
}
```

## 🎯 Key Principles

### 1. Streaming First
- Everything should support streaming
- Use async generators everywhere
- Process data incrementally

### 2. Composability
- Small, focused components
- Easy to combine and extend
- Reusable patterns

### 3. Extensibility
- Plugin architecture
- Custom providers and storage
- Override any component

### 4. Type Safety
- Full TypeScript support
- Runtime validation
- Clear error messages

### 5. Performance
- Lazy loading
- Connection pooling
- Efficient memory usage

## 🧪 Testing Concepts

Testing streaming applications:

```javascript
import { createMockFramework } from 'skingflow/testing';

describe('My Flow', () => {
  it('should process data correctly', async () => {
    const framework = createMockFramework({
      llm: { responses: ['Mocked response'] },
      memory: { entries: [mockMemoryEntry] }
    });
    
    const flow = new MyFlow(framework);
    const chunks = [];
    
    for await (const chunk of flow.execAsyncStream({ input: 'test' })) {
      chunks.push(chunk);
    }
    
    expect(chunks.join('')).toContain('expected output');
  });
});
```

---

These core concepts form the foundation of the skingflow framework. Master them to build sophisticated AI applications with confidence!

## 📚 Next Steps

- [LLM System Deep Dive](./llm-system.md)
- [Memory System Guide](./memory-system.md)
- [Tool Development](./tool-development.md)
- [Flow Patterns](./flow-patterns.md)
