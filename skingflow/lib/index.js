/**
 * skingflow Framework - Main Entry Point
 * 
 * A flexible, extensible framework for building AI-powered applications
 * with streaming capabilities, memory management, tool integration, and orchestration
 * 
 * @author skingko <venture2157@gmail.com>
 * @version 2.0.0
 */

// Core skingflow components
export {
  BaseNode,
  Node,
  BatchNode,
  Flow,
  BatchFlow,
  AsyncNode,
  AsyncBatchNode,
  AsyncParallelBatchNode,
  AsyncFlow,
  AsyncBatchFlow,
  AsyncParallelBatchFlow
} from '../skingflow.js';

// LLM System
export {
  LLMConfig,
  PromptTemplate,
  LLMProvider,
  OpenAIProvider,
  AnthropicProvider,
  HTTPProvider,
  OllamaProvider,
  LLMFactory,
  LLMNode,
  createLLM,
  createLLMNode
} from './core/llm.js';

// Memory System
export {
  MemoryEntry,
  MemoryQuery,
  MemoryStorage,
  InMemoryStorage,
  MemoryManager,
  MemoryNode,
  createMemoryManager,
  createInMemoryStorage,
  createMemoryQuery
} from './core/memory.js';

// Tool System
export {
  ToolDefinition,
  Tool,
  FunctionTool,
  MCPTool,
  HTTPTool,
  ToolRegistry,
  ToolNode,
  createTool,
  createFunctionTool,
  createToolRegistry,
  BuiltinTools
} from './core/tools.js';

// Orchestration System
export {
  FlowStep,
  FlowCondition,
  ParallelGroup,
  FlowLoop,
  FlowOrchestrator,
  OrchestrationMiddleware,
  LoggingMiddleware,
  TimingMiddleware,
  RetryMiddleware,
  createOrchestrator,
  createStep,
  createCondition,
  createParallelGroup,
  createLoop
} from './core/orchestration.js';

// Framework utilities and builders
export * from './builders/index.js';
export * from './utils/index.js';

/**
 * Framework version information
 */
export const VERSION = '2.0.0';
export const FRAMEWORK_NAME = 'skingflow';

/**
 * Framework configuration defaults
 */
export const DEFAULT_CONFIG = {
  llm: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },
  memory: {
    storage: 'memory',
    maxEntries: 10000,
    autoEmbedding: false
  },
  tools: {
    loadBuiltin: true,
    autoRegister: true
  },
  orchestration: {
    stopOnError: true,
    timeout: 300000,
    maxRetries: 3
  }
};

/**
 * Quick start function for common use cases
 */
export async function quickStart(config = {}) {
  const { createFramework } = await import('./builders/index.js');
  return await createFramework({
    ...DEFAULT_CONFIG,
    ...config
  });
}

/**
 * Create a simple LLM chat flow
 */
export async function createChatFlow(llmConfig, options = {}) {
  const { LLMNode } = await import('./core/llm.js');
  const { AsyncFlow } = await import('../skingflow.js');
  
  const llmNode = createLLMNode(llmConfig);
  
  class ChatFlow extends AsyncFlow {
    constructor() {
      super();
      this.llm = llmNode;
    }
    
    async *execAsyncStream(shared) {
      yield* this.llm.execAsyncStream(shared);
    }
  }
  
  return new ChatFlow();
}

/**
 * Create a memory-enhanced chat flow
 */
export async function createMemoryChatFlow(llmConfig, memoryConfig = {}, options = {}) {
  const { LLMNode } = await import('./core/llm.js');
  const { MemoryManager, InMemoryStorage } = await import('./core/memory.js');
  const { AsyncFlow } = await import('../skingflow.js');
  
  const llmNode = createLLMNode(llmConfig);
  const memoryStorage = new InMemoryStorage(memoryConfig.storage || {});
  const memory = new MemoryManager(memoryStorage, memoryConfig);
  await memory.initialize();
  
  class MemoryChatFlow extends AsyncFlow {
    constructor() {
      super();
      this.llm = llmNode;
      this.memory = memory;
    }
    
    async *execAsyncStream(shared) {
      const userId = shared.userId || 'default';
      const query = shared.content || shared.message || '';
      
      // Retrieve relevant memories
      if (query) {
        yield 'Retrieving relevant memories...\n';
        const memories = await this.memory.search(query, userId, 3);
        
        if (memories.length > 0) {
          shared.context = shared.context || '';
          shared.context += '\n\nRelevant memories:\n';
          memories.forEach((memory, index) => {
            shared.context += `${index + 1}. ${memory.content}\n`;
          });
        }
      }
      
      // Generate response
      yield* this.llm.execAsyncStream(shared);
      
      // Store conversation in memory
      if (query) {
        await this.memory.insert({
          content: `User: ${query}`,
          type: 'conversation',
          userId: userId
        });
      }
    }
  }
  
  return new MemoryChatFlow();
}

/**
 * Create a tool-enabled chat flow
 */
export async function createToolChatFlow(llmConfig, tools = [], options = {}) {
  const { LLMNode } = await import('./core/llm.js');
  const { ToolRegistry, BuiltinTools } = await import('./core/tools.js');
  const { AsyncFlow } = await import('../skingflow.js');
  
  const llmNode = createLLMNode(llmConfig);
  const toolRegistry = new ToolRegistry();
  
  // Register builtin tools
  Object.values(BuiltinTools).forEach(tool => toolRegistry.register(tool));
  
  // Register custom tools
  tools.forEach(tool => toolRegistry.register(tool));
  
  class ToolChatFlow extends AsyncFlow {
    constructor() {
      super();
      this.llm = llmNode;
      this.tools = toolRegistry;
    }
    
    async *execAsyncStream(shared) {
      // Add available tools to LLM context
      shared.availableTools = this.tools.getOpenAIFunctions();
      
      // Generate response with tool calls
      let response = '';
      for await (const chunk of this.llm.execAsyncStream(shared)) {
        if (typeof chunk === 'string') {
          response += chunk;
          yield chunk;
        } else {
          // Handle tool calls
          if (chunk.type === 'tool_calls') {
            for (const toolCall of chunk.content) {
              yield `\nCalling tool: ${toolCall.function.name}\n`;
              try {
                const result = await this.tools.execute(
                  toolCall.function.name,
                  JSON.parse(toolCall.function.arguments)
                );
                yield `Tool result: ${JSON.stringify(result)}\n`;
              } catch (error) {
                yield `Tool error: ${error.message}\n`;
              }
            }
          }
        }
      }
    }
  }
  
  return new ToolChatFlow();
}

/**
 * Framework information
 */
export function getFrameworkInfo() {
  return {
    name: FRAMEWORK_NAME,
    version: VERSION,
    description: 'A flexible, extensible framework for building AI-powered applications',
    features: [
      'Streaming-first architecture',
      'Multi-LLM support',
      'Vector-based memory system',
      'Unified tool system (custom, function calls, MCP)',
      'Advanced flow orchestration',
      'Extensible and modular design'
    ],
    author: 'skingko <venture2157@gmail.com>',
    license: 'MIT'
  };
}

/**
 * Export default as the main framework object
 */
export default {
  VERSION,
  FRAMEWORK_NAME,
  DEFAULT_CONFIG,
  quickStart,
  createChatFlow,
  createMemoryChatFlow,
  createToolChatFlow,
  getFrameworkInfo
};
