/**
 * Framework Builders for skingflow
 * 
 * Provides high-level builders for common framework patterns
 * Simplifies the creation of complex AI applications
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { LLMFactory, PromptTemplate } from '../core/llm.js';
import { MemoryManager, InMemoryStorage } from '../core/memory.js';
import { ToolRegistry, BuiltinTools, FunctionTool } from '../core/tools.js';
import { FlowOrchestrator } from '../core/orchestration.js';
import { AsyncFlow } from '../../skingflow.js';

/**
 * Framework Builder - Main framework configuration and setup
 */
export class FrameworkBuilder {
  constructor() {
    this.config = {
      llm: null,
      memory: null,
      tools: null,
      orchestration: null
    };
    this.components = {};
  }

  /**
   * Configure LLM provider
   */
  withLLM(config) {
    this.config.llm = config;
    return this;
  }

  /**
   * Configure memory system
   */
  withMemory(config) {
    this.config.memory = config;
    return this;
  }

  /**
   * Configure tools
   */
  withTools(config) {
    this.config.tools = config;
    return this;
  }

  /**
   * Configure orchestration
   */
  withOrchestration(config) {
    this.config.orchestration = config;
    return this;
  }

  /**
   * Add custom component
   */
  withComponent(name, component) {
    this.components[name] = component;
    return this;
  }

  /**
   * Build the framework instance
   */
  async build() {
    const framework = new Framework();

    // Initialize LLM
    if (this.config.llm) {
      framework.llm = LLMFactory.create(this.config.llm);
      await framework.llm.initialize();
    }

    // Initialize Memory
    if (this.config.memory) {
      const storage = new InMemoryStorage(this.config.memory.storage || {});
      framework.memory = new MemoryManager(storage, this.config.memory);
      await framework.memory.initialize();
    }

    // Initialize Tools
    if (this.config.tools) {
      framework.tools = new ToolRegistry();
      
      // Load builtin tools if requested
      if (this.config.tools.loadBuiltin !== false) {
        Object.values(BuiltinTools).forEach(tool => {
          framework.tools.register(tool);
        });
      }
      
      // Load custom tools
      if (this.config.tools.custom) {
        for (const toolConfig of this.config.tools.custom) {
          const tool = await this._createTool(toolConfig);
          framework.tools.register(tool);
        }
      }
      
      // Load tools from directory
      if (this.config.tools.directory) {
        await framework.tools.loadFromDirectory(this.config.tools.directory);
      }
    }

    // Initialize Orchestration
    if (this.config.orchestration) {
      framework.orchestrator = new FlowOrchestrator(this.config.orchestration);
    }

    // Add custom components
    for (const [name, component] of Object.entries(this.components)) {
      framework[name] = component;
    }

    return framework;
  }

  async _createTool(toolConfig) {
    if (toolConfig.type === 'function') {
      return new FunctionTool(
        toolConfig.name,
        toolConfig.implementation,
        toolConfig
      );
    }
    
    // Add more tool types as needed
    throw new Error(`Unsupported tool type: ${toolConfig.type}`);
  }
}

/**
 * Main Framework Class
 */
export class Framework {
  constructor() {
    this.llm = null;
    this.memory = null;
    this.tools = null;
    this.orchestrator = null;
  }

  /**
   * Create a chat flow
   */
  createChatFlow(options = {}) {
    return new ChatFlowBuilder(this, options);
  }

  /**
   * Create an orchestrated flow
   */
  createOrchestration(options = {}) {
    return new OrchestrationBuilder(this, options);
  }

  /**
   * Create a custom flow
   */
  createFlow(FlowClass, options = {}) {
    return new FlowClass(this, options);
  }

  /**
   * Get framework statistics
   */
  getStats() {
    const stats = {
      framework: {
        components: {
          llm: !!this.llm,
          memory: !!this.memory,
          tools: !!this.tools,
          orchestrator: !!this.orchestrator
        }
      }
    };

    if (this.memory) {
      stats.memory = this.memory.getStats();
    }

    if (this.tools) {
      stats.tools = this.tools.getStats();
    }

    if (this.orchestrator) {
      stats.orchestrator = this.orchestrator.getStats();
    }

    return stats;
  }

  /**
   * Close framework and cleanup resources
   */
  async close() {
    if (this.llm) await this.llm.close();
    if (this.memory) await this.memory.close();
    if (this.tools) await this.tools.close();
  }
}

/**
 * Chat Flow Builder
 */
export class ChatFlowBuilder {
  constructor(framework, options = {}) {
    this.framework = framework;
    this.options = options;
    this.promptTemplate = null;
    this.middleware = [];
    this.hooks = {};
  }

  /**
   * Set prompt template
   */
  withPrompt(template, variables = {}) {
    if (typeof template === 'string') {
      this.promptTemplate = new PromptTemplate(template, variables);
    } else {
      this.promptTemplate = template;
    }
    return this;
  }

  /**
   * Add middleware
   */
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Add hook
   */
  hook(event, handler) {
    if (!this.hooks[event]) {
      this.hooks[event] = [];
    }
    this.hooks[event].push(handler);
    return this;
  }

  /**
   * Build the chat flow
   */
  build() {
    return new ChatFlow(this.framework, {
      promptTemplate: this.promptTemplate,
      middleware: this.middleware,
      hooks: this.hooks,
      ...this.options
    });
  }
}

/**
 * Chat Flow Implementation
 */
export class ChatFlow extends AsyncFlow {
  constructor(framework, options = {}) {
    super();
    this.framework = framework;
    this.options = options;
    this.promptTemplate = options.promptTemplate;
    this.middleware = options.middleware || [];
    this.hooks = options.hooks || {};
  }

  async prepAsync(shared) {
    // Apply middleware
    for (const middleware of this.middleware) {
      if (middleware.beforePrep) {
        await middleware.beforePrep(shared);
      }
    }

    // Trigger hooks
    await this._triggerHooks('beforePrep', shared);

    const userId = shared.userId || 'default';
    let messages = shared.messages || shared.content || shared.prompt || '';

    // Apply prompt template
    if (this.promptTemplate && typeof messages === 'string') {
      messages = this.promptTemplate.compile({
        ...shared,
        input: messages
      });
    }

    // Retrieve memories if memory system is available
    let memories = [];
    if (this.framework.memory && typeof messages === 'string') {
      try {
        memories = await this.framework.memory.search(messages, userId, 5);
      } catch (error) {
        console.warn('Memory retrieval failed:', error.message);
      }
    }

    const prepResult = {
      messages,
      memories,
      userId,
      tools: this.framework.tools ? this.framework.tools.getOpenAIFunctions() : [],
      context: shared
    };

    // Apply middleware
    for (const middleware of this.middleware) {
      if (middleware.afterPrep) {
        await middleware.afterPrep(shared, prepResult);
      }
    }

    // Trigger hooks
    await this._triggerHooks('afterPrep', shared, prepResult);

    return prepResult;
  }

  async *execAsyncStream(prepRes) {
    try {
      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.beforeExec) {
          await middleware.beforeExec(prepRes);
        }
      }

      // Trigger hooks
      await this._triggerHooks('beforeExec', prepRes);

      // Add memory context if available
      if (prepRes.memories.length > 0) {
        yield 'Using relevant memories...\n';
        const memoryContext = prepRes.memories
          .map((memory, index) => `${index + 1}. ${memory.content}`)
          .join('\n');
        
        if (typeof prepRes.messages === 'string') {
          prepRes.messages = `Context from memory:\n${memoryContext}\n\nUser: ${prepRes.messages}`;
        }
      }

      // Generate LLM response
      if (this.framework.llm) {
        let response = '';
        for await (const chunk of this.framework.llm.stream(prepRes.messages, {
          tools: prepRes.tools
        })) {
          if (typeof chunk === 'string') {
            response += chunk;
            yield chunk;
          } else {
            // Handle tool calls
            if (chunk.type === 'tool_calls') {
              yield* this._handleToolCalls(chunk.content);
            }
          }
        }

        // Store conversation in memory
        if (this.framework.memory && prepRes.messages) {
          try {
            await this.framework.memory.insert({
              content: `User: ${prepRes.messages}\nAssistant: ${response}`,
              type: 'conversation',
              userId: prepRes.userId
            });
          } catch (error) {
            console.warn('Memory storage failed:', error.message);
          }
        }
      } else {
        yield 'No LLM configured\n';
      }

      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.afterExec) {
          await middleware.afterExec(prepRes);
        }
      }

      // Trigger hooks
      await this._triggerHooks('afterExec', prepRes);

    } catch (error) {
      // Trigger error hooks
      await this._triggerHooks('onError', prepRes, error);
      throw error;
    }
  }

  async *_handleToolCalls(toolCalls) {
    if (!this.framework.tools) {
      yield 'Tool execution requested but no tools available\n';
      return;
    }

    for (const toolCall of toolCalls) {
      yield `\nExecuting tool: ${toolCall.function.name}\n`;
      
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await this.framework.tools.execute(toolCall.function.name, args);
        
        if (typeof result === 'string') {
          yield result;
        } else {
          yield JSON.stringify(result, null, 2);
        }
        yield '\n';
      } catch (error) {
        yield `Tool execution failed: ${error.message}\n`;
      }
    }
  }

  async _triggerHooks(event, ...args) {
    const handlers = this.hooks[event] || [];
    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (error) {
        console.warn(`Hook ${event} failed:`, error.message);
      }
    }
  }

  async postAsync(shared, prepRes, execRes) {
    // Apply middleware
    for (const middleware of this.middleware) {
      if (middleware.beforePost) {
        await middleware.beforePost(shared, prepRes, execRes);
      }
    }

    // Trigger hooks
    await this._triggerHooks('beforePost', shared, prepRes, execRes);

    const result = {
      success: true,
      userId: prepRes.userId,
      memoriesUsed: prepRes.memories.length,
      timestamp: new Date()
    };

    // Apply middleware
    for (const middleware of this.middleware) {
      if (middleware.afterPost) {
        await middleware.afterPost(shared, prepRes, execRes, result);
      }
    }

    // Trigger hooks
    await this._triggerHooks('afterPost', shared, prepRes, execRes, result);

    return result;
  }
}

/**
 * Orchestration Builder
 */
export class OrchestrationBuilder {
  constructor(framework, options = {}) {
    this.framework = framework;
    this.orchestrator = new FlowOrchestrator(options);
  }

  /**
   * Add step
   */
  addStep(node, options = {}) {
    this.orchestrator.addStep(node, options);
    return this;
  }

  /**
   * Add condition
   */
  addCondition(predicate, trueStep, falseStep) {
    this.orchestrator.addCondition(predicate, trueStep, falseStep);
    return this;
  }

  /**
   * Add parallel group
   */
  addParallel(steps, options = {}) {
    this.orchestrator.addParallel(steps, options);
    return this;
  }

  /**
   * Add loop
   */
  addLoop(steps, condition, options = {}) {
    this.orchestrator.addLoop(steps, condition, options);
    return this;
  }

  /**
   * Set variable
   */
  setVariable(name, value) {
    this.orchestrator.setVariable(name, value);
    return this;
  }

  /**
   * Build the orchestration
   */
  build() {
    return this.orchestrator;
  }
}

/**
 * Convenience functions
 */
export const createFramework = async (config = {}) => {
  const builder = new FrameworkBuilder();
  
  if (config.llm) builder.withLLM(config.llm);
  if (config.memory) builder.withMemory(config.memory);
  if (config.tools) builder.withTools(config.tools);
  if (config.orchestration) builder.withOrchestration(config.orchestration);
  
  return await builder.build();
};

export const createChatFlow = (framework, options = {}) => {
  return new ChatFlowBuilder(framework, options);
};

export default {
  FrameworkBuilder,
  Framework,
  ChatFlowBuilder,
  ChatFlow,
  OrchestrationBuilder,
  createFramework,
  createChatFlow
};
