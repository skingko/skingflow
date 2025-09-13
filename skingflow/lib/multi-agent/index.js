/**
 * Multi-Agent Framework for skingflow
 * 
 * Based on deepagents architecture with:
 * - Planning agent with detailed prompts
 * - Sub-agents for specialized tasks
 * - Virtual file system for context sharing
 * - Advanced memory system (short-term/long-term)
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { AsyncNode, AsyncFlow } from '../../skingflow.js';
import { LLMFactory } from '../core/llm.js';
import { AdvancedMemoryManager } from './memory/advanced-memory.js';
import { VirtualFileSystem } from './filesystem/virtual-fs.js';
import { PlanningAgent } from './agents/planning-agent.js';
import { SubAgentManager } from './agents/sub-agent-manager.js';
import { ToolRegistry } from '../core/tools.js';
import { FallbackManager, FallbackStrategy } from './resilience/fallback-manager.js';
import chalk from 'chalk';

/**
 * Multi-Agent Framework Builder
 */
export class MultiAgentFrameworkBuilder {
  constructor() {
    this.config = {
      llm: null,
      memory: null,
      tools: [],
      instructions: '',
      subAgents: [],
      builtinTools: ['write_todos', 'write_file', 'read_file', 'ls', 'edit_file'],
      virtualFileSystem: true,
      planningEnabled: true
    };
  }

  withLLM(llmConfig) {
    this.config.llm = llmConfig;
    return this;
  }

  withMemory(memoryConfig) {
    this.config.memory = memoryConfig;
    return this;
  }

  withTools(tools) {
    this.config.tools = Array.isArray(tools) ? tools : [tools];
    return this;
  }

  withInstructions(instructions) {
    this.config.instructions = instructions;
    return this;
  }

  withSubAgents(subAgents) {
    this.config.subAgents = Array.isArray(subAgents) ? subAgents : [subAgents];
    return this;
  }

  withBuiltinTools(tools) {
    this.config.builtinTools = tools;
    return this;
  }

  disableVirtualFileSystem() {
    this.config.virtualFileSystem = false;
    return this;
  }

  disablePlanning() {
    this.config.planningEnabled = false;
    return this;
  }

  async build() {
    return new MultiAgentFramework(this.config);
  }
}

/**
 * Main Multi-Agent Framework
 */
export class MultiAgentFramework {
  constructor(config) {
    this.config = config;
    this.llm = null;
    this.memory = null;
    this.tools = null;
    this.virtualFs = null;
    this.planningAgent = null;
    this.subAgentManager = null;
    this.fallbackManager = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log(chalk.blue('🚀 Initializing Multi-Agent Framework...'));

    try {
      // Initialize Fallback Manager
      this.fallbackManager = new FallbackManager({
        maxRetries: 3,
        retryDelay: 1000,
        enableDegradedMode: true,
        strategies: {
          llm: FallbackStrategy.RETRY,
          memory: FallbackStrategy.DEGRADED,
          tools: FallbackStrategy.ALTERNATIVE,
          planning: FallbackStrategy.DEGRADED,
          subAgents: FallbackStrategy.ALTERNATIVE
        }
      });
      console.log(chalk.green('✅ Fallback manager initialized'));

      // Initialize LLM with fallback
      if (this.config.llm) {
        await this.fallbackManager.executeWithFallback(
          async () => {
            this.llm = LLMFactory.create(this.config.llm);
            await this.llm.initialize();
          },
          {
            component: 'llm',
            operationType: 'initialize'
          }
        );
        console.log(chalk.green('✅ LLM initialized'));
      }

      // Initialize Advanced Memory System
      this.memory = new AdvancedMemoryManager(this.config.memory || {});
      await this.memory.initialize();
      console.log(chalk.green('✅ Advanced memory system initialized'));

      // Initialize Tools
      this.tools = new ToolRegistry();
      
      // Add builtin tools from YAML/XML definitions
      if (this.config.builtinTools && this.config.builtinTools.length > 0) {
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const builtinToolsDir = path.join(__dirname, 'tools');
        
        try {
          await this.tools.loadFromDirectory(builtinToolsDir);
          console.log(chalk.green('✅ Builtin tools loaded'));
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  Failed to load builtin tools: ${error.message}`));
        }
      }
      
      // Add custom tools
      for (const tool of this.config.tools) {
        this.tools.register(tool);
      }
      console.log(chalk.green(`✅ Tools initialized (${this.tools.getAll().length} tools)`));

      // Initialize Virtual File System
      if (this.config.virtualFileSystem) {
        this.virtualFs = new VirtualFileSystem();
        await this.virtualFs.initialize();
        
        // Add VFS tools to registry
        this.tools.registerVirtualFileSystemTools(this.virtualFs);
        console.log(chalk.green('✅ Virtual file system initialized'));
      }

      // Initialize Planning Agent
      if (this.config.planningEnabled) {
        this.planningAgent = new PlanningAgent({
          llm: this.llm,
          memory: this.memory,
          tools: this.tools,
          instructions: this.config.instructions
        });
        await this.planningAgent.initialize();
        console.log(chalk.green('✅ Planning agent initialized'));
      }

      // Initialize Sub-Agent Manager
      this.subAgentManager = new SubAgentManager({
        llm: this.llm,
        memory: this.memory,
        tools: this.tools,
        virtualFs: this.virtualFs,
        subAgents: this.config.subAgents
      });
      await this.subAgentManager.initialize();
      console.log(chalk.green(`✅ Sub-agent manager initialized (${this.config.subAgents.length} sub-agents)`));

      this.initialized = true;
      console.log(chalk.green('🎉 Multi-Agent Framework initialized successfully!'));

    } catch (error) {
      console.error(chalk.red('❌ Framework initialization failed:'), error.message);
      throw error;
    }
  }

  /**
   * Create a multi-agent workflow
   */
  createWorkflow(options = {}) {
    return new MultiAgentWorkflowBuilder(this, options);
  }

  /**
   * Process a user request using the full multi-agent system
   */
  async processRequest(request, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const session = {
      id: context.sessionId || `session_${Date.now()}`,
      userId: context.userId || 'default',
      request,
      context,
      files: Object.assign({}, context.files || {}), // Create a new mutable object
      memories: {
        shortTerm: [],
        longTerm: [],
        userPreferences: []
      },
      todos: [],
      subAgentResults: [],
      finalResult: null,
      startTime: Date.now()
    };

    try {
      console.log(chalk.blue(`\n🎯 Processing request: "${request}"`));
      console.log(chalk.gray(`Session: ${session.id}, User: ${session.userId}`));

      // Step 1: Load relevant memories
      await this.loadRelevantMemories(session);

      // Step 2: Planning phase with fallback
      if (this.planningAgent) {
        await this.fallbackManager.executeWithFallback(
          async () => {
            await this.planningAgent.createPlan(session);
          },
          {
            component: 'planning',
            operationType: 'createPlan',
            degradedHandler: async (error, context) => {
              console.log(chalk.yellow('📋 Using fallback planning: direct execution'));
              session.directAction = session.request;
              session.todos = [];
              return { needsPlanning: false, reason: 'Planning service degraded' };
            }
          }
        );
      }

      // Step 3: Execute plan with sub-agents
      await this.executePlan(session);

      // Step 4: Store memories and update context
      await this.storeSessionMemories(session);

      session.finalResult = {
        success: true,
        response: session.response || 'Task completed successfully',
        duration: Date.now() - session.startTime,
        memoriesStored: session.memories.shortTerm.length + session.memories.longTerm.length,
        subAgentsUsed: session.subAgentResults.length,
        todosCompleted: session.todos.filter(t => t.status === 'completed').length,
        files: session.files
      };

      console.log(chalk.green('✅ Request processed successfully'));
      return session.finalResult;

    } catch (error) {
      console.error(chalk.red('❌ Request processing failed:'), error.message);
      session.finalResult = {
        success: false,
        error: error.message,
        duration: Date.now() - session.startTime
      };
      return session.finalResult;
    }
  }

  async loadRelevantMemories(session) {
    console.log(chalk.cyan('🧠 Loading relevant memories...'));
    
    // Load short-term memories (current session context)
    session.memories.shortTerm = await this.memory.getShortTermMemories(
      session.userId, 
      session.id,
      10
    );

    // Load long-term memories (user history and preferences)
    session.memories.longTerm = await this.memory.searchLongTermMemories(
      session.request,
      session.userId,
      5
    );

    // Load user preferences
    session.memories.userPreferences = await this.memory.getUserPreferences(
      session.userId
    );

    console.log(chalk.green(
      `✅ Loaded ${session.memories.shortTerm.length} short-term, ` +
      `${session.memories.longTerm.length} long-term memories, ` +
      `${session.memories.userPreferences.length} preferences`
    ));
  }

  async executePlan(session) {
    console.log(chalk.cyan('⚡ Executing plan with sub-agents...'));

    if (session.todos && session.todos.length > 0) {
      for (const todo of session.todos) {
        if (todo.status === 'pending') {
          console.log(chalk.yellow(`📋 Executing: ${todo.content}`));
          
          // Determine appropriate sub-agent
          const subAgent = this.subAgentManager.selectSubAgent(todo, session);
          
          if (subAgent) {
            const result = await this.fallbackManager.executeWithFallback(
              async () => {
                return await subAgent.execute(todo, session);
              },
              {
                component: 'subAgents',
                operationType: 'execute',
                alternatives: [
                  {
                    name: 'general-purpose-fallback',
                    execute: async () => {
                      const generalAgent = this.subAgentManager.getGeneralPurposeAgent();
                      return await generalAgent.execute(todo, session);
                    }
                  }
                ],
                degradedHandler: async (error, context) => {
                  return {
                    success: false,
                    result: `Task execution failed: ${error.message}`,
                    degraded: true,
                    subAgent: 'fallback'
                  };
                }
              }
            );
            
            session.subAgentResults.push({
              todo: todo.id,
              subAgent: subAgent.name,
              result,
              timestamp: new Date()
            });
            
            // Update todo status
            todo.status = result.success ? 'completed' : 'failed';
            todo.result = result;
          }
        }
      }
    } else {
      // No specific plan, use general-purpose agent
      const generalAgent = this.subAgentManager.getGeneralPurposeAgent();
      const result = await generalAgent.execute({
        content: session.request,
        type: 'general'
      }, session);
      
      session.subAgentResults.push({
        subAgent: 'general-purpose',
        result,
        timestamp: new Date()
      });
      
      session.response = result.response;
    }

    console.log(chalk.green(`✅ Plan executed with ${session.subAgentResults.length} sub-agents`));
  }

  async storeSessionMemories(session) {
    console.log(chalk.cyan('💾 Storing session memories...'));

    // Store short-term memory (conversation context)
    await this.memory.addShortTermMemory({
      userId: session.userId,
      sessionId: session.id,
      content: session.request,
      response: session.response || 'No response generated',
      context: {
        subAgentsUsed: session.subAgentResults.map(r => r.subAgent),
        todosCompleted: session.todos.filter(t => t.status === 'completed').length,
        files: Object.keys(session.files || {})
      }
    });

    // Extract and store long-term memories (user preferences, important facts)
    const longTermMemories = await this.extractLongTermMemories(session);
    for (const memory of longTermMemories) {
      await this.memory.addLongTermMemory(memory);
    }

    console.log(chalk.green(`✅ Stored session memories`));
  }

  async extractLongTermMemories(session) {
    // Use LLM to extract important information for long-term storage
    if (!this.llm) return [];

    const extractionPrompt = `
Analyze the following conversation and extract important information that should be remembered long-term:

User Request: ${session.request}
Response: ${session.response || 'No response generated'}
Context: ${JSON.stringify(session.context, null, 2)}

Extract:
1. User preferences or settings mentioned
2. Important facts about the user
3. Recurring themes or interests
4. Technical preferences or requirements

Return a JSON array of memories, each with:
- type: "preference" | "fact" | "interest" | "requirement"
- content: string description
- importance: number (0.0 to 1.0)

Only include truly important information worth remembering.
`;

    try {
      let response = '';
      for await (const chunk of this.llm.stream(extractionPrompt)) {
        if (typeof chunk === 'string') {
          response += chunk;
        }
      }

      // Try to parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const memories = JSON.parse(jsonMatch[0]);
        return memories.map(memory => ({
          ...memory,
          userId: session.userId,
          extractedAt: new Date()
        }));
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to extract long-term memories:'), error.message);
    }

    return [];
  }

  async close() {
    if (this.memory) await this.memory.close();
    if (this.virtualFs) await this.virtualFs.close();
    this.initialized = false;
    console.log(chalk.blue('👋 Multi-Agent Framework closed'));
  }

  getStats() {
    return {
      initialized: this.initialized,
      components: {
        llm: !!this.llm,
        memory: !!this.memory,
        tools: this.tools?.getAll().length || 0,
        virtualFs: !!this.virtualFs,
        planningAgent: !!this.planningAgent,
        subAgents: this.subAgentManager?.getSubAgentCount() || 0
      }
    };
  }
}

/**
 * Multi-Agent Workflow Builder
 */
export class MultiAgentWorkflowBuilder {
  constructor(framework, options) {
    this.framework = framework;
    this.options = options;
    this.steps = [];
  }

  addStep(step, config = {}) {
    this.steps.push({ step, config });
    return this;
  }

  build() {
    return new MultiAgentWorkflow(this.framework, this.steps, this.options);
  }
}

/**
 * Multi-Agent Workflow Execution
 */
export class MultiAgentWorkflow extends AsyncNode {
  constructor(framework, steps, options) {
    super();
    this.framework = framework;
    this.steps = steps;
    this.options = options;
  }

  async *execAsyncStream(shared) {
    yield chalk.blue('🔄 Starting multi-agent workflow...\n');

    for (let i = 0; i < this.steps.length; i++) {
      const { step, config } = this.steps[i];
      
      yield chalk.cyan(`Step ${i + 1}/${this.steps.length}: ${config.name || step.constructor.name}\n`);
      yield chalk.gray('─'.repeat(40) + '\n');

      if (step.execAsyncStream) {
        for await (const chunk of step.execAsyncStream(shared)) {
          yield chunk;
        }
      } else if (typeof step === 'function') {
        const result = await step(shared);
        yield chalk.gray(`Result: ${JSON.stringify(result)}\n`);
      }

      yield chalk.gray('─'.repeat(40) + '\n');
    }

    yield chalk.green('✅ Multi-agent workflow completed\n');
  }
}

/**
 * Factory function for creating multi-agent frameworks
 */
export function createMultiAgentFramework(config = {}) {
  const builder = new MultiAgentFrameworkBuilder();
  
  if (config.llm) builder.withLLM(config.llm);
  if (config.memory) builder.withMemory(config.memory);
  if (config.tools) builder.withTools(config.tools);
  if (config.instructions) builder.withInstructions(config.instructions);
  if (config.subAgents) builder.withSubAgents(config.subAgents);
  if (config.builtinTools) builder.withBuiltinTools(config.builtinTools);
  if (config.virtualFileSystem === false) builder.disableVirtualFileSystem();
  if (config.planningEnabled === false) builder.disablePlanning();

  return builder.build();
}

export default {
  MultiAgentFrameworkBuilder,
  MultiAgentFramework,
  MultiAgentWorkflowBuilder,
  MultiAgentWorkflow,
  createMultiAgentFramework
};
