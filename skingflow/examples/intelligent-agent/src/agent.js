/**
 * Intelligent Agent System using skingflow Framework
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createFramework } from '../skingflow/lib/builders/index.js';
import { PromptTemplate } from '../skingflow/lib/core/llm.js';
import { AsyncNode } from '../skingflow/skingflow.js';
import { PostgresMemoryStorage } from './storage/postgres-adapter.js';
import { MemoryManager } from '../skingflow/lib/core/memory.js';
import config, { validateConfig } from './config.js';
import chalk from 'chalk';

/**
 * Knowledge Processing Node
 */
class KnowledgeProcessor extends AsyncNode {
  constructor(framework) {
    super();
    this.framework = framework;
  }

  async *execAsyncStream(shared) {
    yield chalk.blue('🧠 Processing knowledge and context...\n');
    
    const userId = shared.userId || 'default';
    const query = shared.content || shared.message || '';
    
    if (!query) {
      yield chalk.yellow('⚠️  No query provided for knowledge processing\n');
      return;
    }
    
    // Search for relevant memories
    try {
      const memories = await this.framework.memory.query(q => 
        q.semantic(query, 5)
         .equals('userId', userId)
         .orderBy('importance', 'desc')
      );
      
      shared.relevantMemories = memories;
      yield chalk.green(`✅ Found ${memories.length} relevant memories\n`);
      
      if (memories.length > 0) {
        yield chalk.gray('📚 Relevant knowledge:\n');
        memories.forEach((memory, index) => {
          yield chalk.gray(`  ${index + 1}. ${memory.content.substring(0, 100)}...\n`);
        });
      }
      
    } catch (error) {
      yield chalk.red(`❌ Knowledge processing error: ${error.message}\n`);
      shared.relevantMemories = [];
    }
  }
}

/**
 * Task Planning Node
 */
class TaskPlanner extends AsyncNode {
  constructor(framework) {
    super();
    this.framework = framework;
  }

  async *execAsyncStream(shared) {
    yield chalk.blue('📋 Planning task execution...\n');
    
    const query = shared.content || shared.message || '';
    const memories = shared.relevantMemories || [];
    
    // Analyze if tools are needed
    const needsWebSearch = /search|find|look up|latest|news|current/i.test(query);
    const needsDataAnalysis = /analyze|statistics|data|chart|graph/i.test(query);
    const needsCalculation = /calculate|compute|math|number/i.test(query);
    
    const plannedTools = [];
    
    if (needsWebSearch) {
      plannedTools.push('web_search');
      yield chalk.cyan('🔍 Planning to use web search\n');
    }
    
    if (needsDataAnalysis) {
      plannedTools.push('analyze_data');
      yield chalk.cyan('📊 Planning to use data analysis\n');
    }
    
    if (needsCalculation) {
      plannedTools.push('calculate');
      yield chalk.cyan('🧮 Planning to use calculator\n');
    }
    
    shared.plannedTools = plannedTools;
    shared.executionPlan = {
      useMemory: memories.length > 0,
      useTools: plannedTools.length > 0,
      complexity: plannedTools.length > 1 ? 'high' : plannedTools.length === 1 ? 'medium' : 'low'
    };
    
    yield chalk.green(`✅ Task plan created (complexity: ${shared.executionPlan.complexity})\n`);
  }
}

/**
 * Response Generator Node
 */
class ResponseGenerator extends AsyncNode {
  constructor(framework) {
    super();
    this.framework = framework;
    
    this.promptTemplate = new PromptTemplate(`
你是一个智能助手，能够访问记忆系统和各种工具。请基于提供的信息给出有用、准确的回答。

{{#if relevantMemories}}
相关记忆：
{{#each relevantMemories}}
- {{content}}
{{/each}}
{{/if}}

{{#if toolResults}}
工具执行结果：
{{#each toolResults}}
- {{name}}: {{result}}
{{/each}}
{{/if}}

用户问题：{{query}}

请提供详细、有帮助的回答：`, {
      assistantName: config.app.name
    });
  }

  async *execAsyncStream(shared) {
    yield chalk.blue('🤖 Generating intelligent response...\n');
    
    const query = shared.content || shared.message || '';
    const memories = shared.relevantMemories || [];
    const toolResults = shared.toolResults || [];
    
    // Prepare context for LLM
    const context = this.promptTemplate.compile({
      query,
      relevantMemories: memories.map(m => ({ content: m.content })),
      toolResults: toolResults.map(r => ({ name: r.name, result: r.result }))
    });
    
    // Generate response using LLM
    if (this.framework.llm) {
      let response = '';
      for await (const chunk of this.framework.llm.stream(context)) {
        if (typeof chunk === 'string') {
          response += chunk;
          yield chunk;
        }
      }
      
      shared.generatedResponse = response;
      
      // Store the interaction in memory
      if (this.framework.memory) {
        try {
          await this.framework.memory.insert({
            content: `问题: ${query}\n回答: ${response}`,
            type: 'conversation',
            category: 'interaction',
            userId: shared.userId || 'default',
            importance: 0.7,
            metadata: {
              toolsUsed: shared.plannedTools || [],
              memoriesUsed: memories.length,
              timestamp: new Date().toISOString()
            }
          });
          
          yield chalk.gray('\n💾 Conversation stored in memory\n');
        } catch (error) {
          yield chalk.red(`❌ Memory storage error: ${error.message}\n`);
        }
      }
    } else {
      yield chalk.red('❌ No LLM available for response generation\n');
    }
  }
}

/**
 * Tool Execution Node
 */
class ToolExecutor extends AsyncNode {
  constructor(framework) {
    super();
    this.framework = framework;
  }

  async *execAsyncStream(shared) {
    const plannedTools = shared.plannedTools || [];
    
    if (plannedTools.length === 0) {
      return; // No tools to execute
    }
    
    yield chalk.blue('🔧 Executing tools...\n');
    
    const toolResults = [];
    const query = shared.content || shared.message || '';
    
    for (const toolName of plannedTools) {
      try {
        yield chalk.cyan(`⚡ Executing ${toolName}...\n`);
        
        let result;
        
        switch (toolName) {
          case 'web_search':
            result = await this.framework.tools.execute('web_search', {
              query: query,
              max_results: 3
            });
            break;
            
          case 'analyze_data':
            // Extract numbers from query for analysis
            const numbers = query.match(/\d+/g);
            if (numbers) {
              result = await this.framework.tools.execute('analyze_data', {
                data: numbers.map(n => parseInt(n)),
                analysis_type: 'statistical'
              });
            } else {
              result = { error: 'No data found for analysis' };
            }
            break;
            
          case 'calculate':
            // Extract mathematical expression
            const mathExpression = query.match(/[\d+\-*/().\s]+/g);
            if (mathExpression && mathExpression[0]) {
              result = await this.framework.tools.execute('calculate', {
                expression: mathExpression[0].trim()
              });
            } else {
              result = { error: 'No mathematical expression found' };
            }
            break;
            
          default:
            result = await this.framework.tools.execute(toolName, { query });
        }
        
        toolResults.push({
          name: toolName,
          result: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          success: true
        });
        
        yield chalk.green(`✅ ${toolName} completed\n`);
        
      } catch (error) {
        toolResults.push({
          name: toolName,
          result: error.message,
          success: false
        });
        
        yield chalk.red(`❌ ${toolName} failed: ${error.message}\n`);
      }
    }
    
    shared.toolResults = toolResults;
    yield chalk.green(`🎯 Tool execution completed (${toolResults.length} tools)\n`);
  }
}

/**
 * Main Intelligent Agent Class
 */
export class IntelligentAgent {
  constructor() {
    this.framework = null;
    this.orchestration = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log(chalk.blue('🚀 Initializing Intelligent Agent System...\n'));

    try {
      // Validate configuration
      validateConfig();
      console.log(chalk.green('✅ Configuration validated'));

      // Create custom memory storage
      const memoryStorage = new PostgresMemoryStorage(config.memory.storage.config);
      const memoryManager = new MemoryManager(memoryStorage, config.memory);
      
      // Create framework with custom memory
      this.framework = await createFramework({
        llm: config.llm,
        tools: config.tools
      });
      
      // Replace default memory with our PostgreSQL memory
      this.framework.memory = memoryManager;
      await this.framework.memory.initialize();
      console.log(chalk.green('✅ Memory system initialized'));

      // Create orchestrated workflow
      this.orchestration = this.framework
        .createOrchestration(config.orchestration)
        .addStep(new KnowledgeProcessor(this.framework), { name: 'Knowledge Processing' })
        .addStep(new TaskPlanner(this.framework), { name: 'Task Planning' })
        .addStep(new ToolExecutor(this.framework), { name: 'Tool Execution' })
        .addStep(new ResponseGenerator(this.framework), { name: 'Response Generation' })
        .build();

      this.initialized = true;
      console.log(chalk.green('🎉 Intelligent Agent System initialized successfully!\n'));

    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      throw error;
    }
  }

  async processQuery(query, userId = 'default') {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(chalk.blue(`\n📝 Processing query from ${userId}:`));
    console.log(chalk.white(`"${query}"\n`));

    const shared = {
      content: query,
      message: query,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    try {
      console.log(chalk.yellow('🔄 Executing intelligent workflow...\n'));
      console.log('='.repeat(60));

      for await (const chunk of this.orchestration.execAsyncStream(shared)) {
        process.stdout.write(chunk);
      }

      console.log('='.repeat(60));
      console.log(chalk.green('✅ Query processing completed!\n'));

      return {
        success: true,
        userId,
        query,
        timestamp: shared.timestamp,
        relevantMemories: shared.relevantMemories?.length || 0,
        toolsUsed: shared.plannedTools?.length || 0,
        response: shared.generatedResponse
      };

    } catch (error) {
      console.error(chalk.red('❌ Query processing failed:'), error.message);
      throw error;
    }
  }

  async getStats() {
    if (!this.initialized) return null;

    const frameworkStats = this.framework.getStats();
    const orchestrationStats = this.orchestration.getStats();

    return {
      framework: frameworkStats,
      orchestration: orchestrationStats,
      agent: {
        initialized: this.initialized,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };
  }

  async close() {
    if (this.framework) {
      await this.framework.close();
    }
    this.initialized = false;
    console.log(chalk.blue('👋 Intelligent Agent System closed'));
  }
}

// Export for use in other modules
export default IntelligentAgent;
