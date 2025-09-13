/**
 * Complete Framework Demo - High Customization Capabilities
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createFramework } from '../../skingflow/lib/builders/index.js';
import { FrameworkIntelligentAgent } from '../src/framework-agent.js';
import { StandaloneIntelligentAgent } from '../src/standalone-agent.js';
import { PostgresMemoryStorage } from '../src/storage/postgres-adapter.js';
import { MemoryManager } from '../../skingflow/lib/core/memory.js';
import { AsyncNode } from '../../skingflow/skingflow.js';
import config from '../src/config.js';
import chalk from 'chalk';
import inquirer from 'inquirer';

/**
 * Custom Analytics Node - Demonstrates framework extensibility
 */
class AnalyticsNode extends AsyncNode {
  constructor() {
    super();
    this.metrics = {
      queries: 0,
      responses: 0,
      tools_used: 0,
      memories_accessed: 0
    };
  }

  async *execAsyncStream(shared) {
    yield chalk.magenta('📊 Analytics: Recording interaction...\n');
    
    this.metrics.queries++;
    
    if (shared.relevantMemories && shared.relevantMemories.length > 0) {
      this.metrics.memories_accessed += shared.relevantMemories.length;
    }
    
    if (shared.plannedTools && shared.plannedTools.length > 0) {
      this.metrics.tools_used += shared.plannedTools.length;
    }
    
    if (shared.generatedResponse) {
      this.metrics.responses++;
    }
    
    yield chalk.gray(`📈 Session metrics: ${JSON.stringify(this.metrics)}\n`);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * Custom Validation Node - Input validation and sanitization
 */
class ValidationNode extends AsyncNode {
  async *execAsyncStream(shared) {
    yield chalk.blue('🔍 Validation: Checking input...\n');
    
    const query = shared.content || shared.message || '';
    
    // Basic validation
    if (!query.trim()) {
      shared.validationError = 'Empty query detected';
      yield chalk.red('❌ Validation failed: Empty query\n');
      return;
    }
    
    if (query.length > 1000) {
      shared.validationError = 'Query too long';
      yield chalk.yellow('⚠️  Warning: Query truncated to 1000 characters\n');
      shared.content = query.substring(0, 1000);
      shared.message = shared.content;
    }
    
    // Content filtering
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /private.key/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(query)) {
        yield chalk.yellow('⚠️  Sensitive content detected - filtered\n');
        shared.sensitiveContent = true;
        break;
      }
    }
    
    yield chalk.green('✅ Input validation passed\n');
  }
}

class FrameworkDemo {
  constructor() {
    this.agents = {};
    this.customNodes = {};
    this.analytics = new AnalyticsNode();
  }

  async initialize() {
    console.log(chalk.blue('🚀 Initializing Framework Demo System\n'));
    console.log('='.repeat(60));
    
    try {
      // 1. Create Standalone Agent
      console.log(chalk.yellow('1. Creating Standalone Agent...'));
      this.agents.standalone = new StandaloneIntelligentAgent();
      await this.agents.standalone.initialize();
      console.log(chalk.green('   ✅ Standalone agent ready'));

      // 2. Create Framework-based Agent
      console.log(chalk.yellow('2. Creating Framework Agent...'));
      this.agents.framework = new FrameworkIntelligentAgent();
      await this.agents.framework.initialize();
      console.log(chalk.green('   ✅ Framework agent ready'));

      // 3. Create Custom Framework with additional nodes
      console.log(chalk.yellow('3. Creating Custom Framework...'));
      this.agents.custom = await this.createCustomFramework();
      console.log(chalk.green('   ✅ Custom framework ready'));

      console.log('='.repeat(60));
      console.log(chalk.green('🎉 All agents initialized successfully!\n'));

    } catch (error) {
      console.error(chalk.red('❌ Demo initialization failed:'), error.message);
      throw error;
    }
  }

  async createCustomFramework() {
    // Create custom framework with additional capabilities
    const customFramework = await createFramework({
      llm: config.llm,
      tools: {
        loadBuiltin: true,
        directory: '/Users/apple/Documents/rust_code/llmlite/nodejs/intelligent-agent/tools',
        custom: [
          {
            name: 'sentiment_analysis',
            description: 'Analyze sentiment of text',
            execute: async (params) => {
              const { text } = params;
              const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', '好', '棒', '优秀'];
              const negativeWords = ['bad', 'terrible', 'awful', 'horrible', '坏', '糟糕', '差'];
              
              let score = 0;
              const words = text.toLowerCase().split(/\s+/);
              
              words.forEach(word => {
                if (positiveWords.some(pw => word.includes(pw))) score += 1;
                if (negativeWords.some(nw => word.includes(nw))) score -= 1;
              });
              
              let sentiment = 'neutral';
              if (score > 0) sentiment = 'positive';
              if (score < 0) sentiment = 'negative';
              
              return {
                sentiment,
                score,
                confidence: Math.min(Math.abs(score) * 0.3, 1.0),
                analysis: `Text sentiment is ${sentiment} with score ${score}`
              };
            }
          }
        ]
      }
    });

    // Create memory system
    const memoryStorage = new PostgresMemoryStorage(config.memory.storage.config);
    const memoryManager = new MemoryManager(memoryStorage, config.memory);
    await memoryManager.initialize();
    customFramework.memory = memoryManager;

    // Create custom orchestration with validation and analytics
    const validation = new ValidationNode();
    
    customFramework.customOrchestration = customFramework
      .createOrchestration({
        stopOnError: false,
        timeout: 120000,
        maxRetries: 2
      })
      .addStep(validation, { name: 'Input Validation' })
      .addStep(this.analytics, { name: 'Analytics Collection' })
      .build();

    return customFramework;
  }

  async demonstrateCapabilities() {
    console.log(chalk.blue('🎭 Demonstrating Framework Capabilities\n'));
    
    const demos = [
      {
        name: 'Memory Persistence',
        description: 'Test cross-session memory retention',
        test: async () => {
          console.log(chalk.yellow('📚 Testing Memory Persistence...'));
          
          // Store information with standalone agent
          await this.agents.standalone.processQuery(
            '请记住：我的名字是张伟，我是一名AI研究员，专注于自然语言处理', 
            'demo_user'
          );
          
          // Retrieve with framework agent (same database)
          const result = await this.agents.framework.processQuery(
            '我的职业是什么？', 
            'demo_user'
          );
          
          console.log(chalk.green(`✅ Memory persistence verified: ${result.relevantMemories} memories found`));
        }
      },
      
      {
        name: 'Tool Extensibility',
        description: 'Demonstrate custom tool integration',
        test: async () => {
          console.log(chalk.yellow('🔧 Testing Custom Tools...'));
          
          if (this.agents.custom && this.agents.custom.tools) {
            const sentimentResult = await this.agents.custom.tools.execute('sentiment_analysis', {
              text: 'This is an amazing framework with excellent capabilities!'
            });
            
            console.log(chalk.green('✅ Custom sentiment analysis:'));
            console.log(chalk.gray(`   Sentiment: ${sentimentResult.sentiment}`));
            console.log(chalk.gray(`   Score: ${sentimentResult.score}`));
            console.log(chalk.gray(`   Confidence: ${sentimentResult.confidence.toFixed(2)}`));
          }
        }
      },
      
      {
        name: 'Workflow Customization',
        description: 'Custom orchestration with validation and analytics',
        test: async () => {
          console.log(chalk.yellow('⚡ Testing Custom Workflow...'));
          
          if (this.agents.custom && this.agents.custom.customOrchestration) {
            const shared = {
              content: 'This is a test query for custom workflow demonstration',
              userId: 'workflow_demo_user'
            };
            
            console.log(chalk.cyan('Executing custom workflow:'));
            for await (const chunk of this.agents.custom.customOrchestration.execAsyncStream(shared)) {
              process.stdout.write(chunk);
            }
            
            const metrics = this.analytics.getMetrics();
            console.log(chalk.green('✅ Custom workflow completed'));
            console.log(chalk.gray(`   Analytics: ${JSON.stringify(metrics)}`));
          }
        }
      },
      
      {
        name: 'Performance Comparison',
        description: 'Compare different agent implementations',
        test: async () => {
          console.log(chalk.yellow('🏁 Performance Comparison...'));
          
          const testQuery = '请计算 25 * 4 + 15';
          const results = {};
          
          for (const [name, agent] of Object.entries(this.agents)) {
            if (name === 'custom') continue; // Skip custom for this test
            
            const startTime = Date.now();
            try {
              const result = await agent.processQuery(testQuery, `perf_test_${name}`);
              results[name] = {
                duration: Date.now() - startTime,
                success: result.success,
                memories: result.relevantMemories || 0,
                tools: result.toolsUsed || 0
              };
            } catch (error) {
              results[name] = {
                duration: Date.now() - startTime,
                success: false,
                error: error.message
              };
            }
          }
          
          console.log(chalk.green('✅ Performance comparison:'));
          Object.entries(results).forEach(([name, result]) => {
            console.log(chalk.gray(`   ${name}: ${result.duration}ms, Success: ${result.success}`));
          });
        }
      }
    ];

    for (const demo of demos) {
      console.log('\n' + '─'.repeat(50));
      console.log(chalk.blue(`🎯 ${demo.name}`));
      console.log(chalk.gray(`   ${demo.description}`));
      console.log('─'.repeat(50));
      
      try {
        await demo.test();
      } catch (error) {
        console.log(chalk.red(`❌ Demo failed: ${error.message}`));
      }
      
      console.log(''); // Empty line
    }
  }

  async interactiveDemo() {
    console.log(chalk.blue('\n💬 Interactive Demo Mode\n'));
    
    while (true) {
      try {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'Choose an option:',
            choices: [
              { name: '🤖 Chat with Standalone Agent', value: 'standalone' },
              { name: '⚡ Chat with Framework Agent', value: 'framework' },
              { name: '🎭 Test Custom Workflow', value: 'custom' },
              { name: '📊 View Analytics', value: 'analytics' },
              { name: '🔧 Framework Capabilities', value: 'capabilities' },
              { name: '❌ Exit', value: 'exit' }
            ]
          }
        ]);

        switch (action) {
          case 'standalone':
          case 'framework':
            await this.chatSession(action);
            break;
          case 'custom':
            await this.customWorkflowDemo();
            break;
          case 'analytics':
            this.showAnalytics();
            break;
          case 'capabilities':
            await this.demonstrateCapabilities();
            break;
          case 'exit':
            await this.cleanup();
            return;
        }
      } catch (error) {
        if (error.isTtyError) {
          console.log(chalk.yellow('Interactive mode not supported. Running capabilities demo...'));
          await this.demonstrateCapabilities();
          break;
        } else {
          console.error(chalk.red('Error:'), error.message);
        }
      }
    }
  }

  async chatSession(agentType) {
    const agent = this.agents[agentType];
    console.log(chalk.blue(`\n💬 Chat with ${agentType} agent (type "exit" to return)`));
    
    while (true) {
      try {
        const { query } = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: 'You:',
            validate: input => input.trim().length > 0 || 'Please enter a message'
          }
        ]);

        if (query.toLowerCase() === 'exit') break;

        await agent.processQuery(query, `demo_${agentType}_user`);
        
      } catch (error) {
        console.error(chalk.red('Chat error:'), error.message);
      }
    }
  }

  async customWorkflowDemo() {
    console.log(chalk.blue('\n🎭 Custom Workflow Demo'));
    
    const testInputs = [
      'This is a wonderful framework!',
      'I hate this terrible system',
      'password123 is my secret key',
      ''
    ];
    
    for (const input of testInputs) {
      console.log(chalk.yellow(`\nTesting input: "${input}"`));
      console.log('─'.repeat(40));
      
      const shared = {
        content: input,
        userId: 'workflow_demo'
      };
      
      if (this.agents.custom && this.agents.custom.customOrchestration) {
        for await (const chunk of this.agents.custom.customOrchestration.execAsyncStream(shared)) {
          process.stdout.write(chunk);
        }
      }
    }
  }

  showAnalytics() {
    console.log(chalk.blue('\n📊 Analytics Dashboard'));
    console.log('='.repeat(40));
    
    const metrics = this.analytics.getMetrics();
    Object.entries(metrics).forEach(([key, value]) => {
      console.log(chalk.cyan(`${key.replace('_', ' ')}: ${value}`));
    });
    
    console.log('='.repeat(40));
  }

  async cleanup() {
    console.log(chalk.blue('\n👋 Cleaning up demo system...'));
    
    for (const [name, agent] of Object.entries(this.agents)) {
      try {
        if (agent && agent.close) {
          await agent.close();
        }
        console.log(chalk.green(`✅ ${name} agent closed`));
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  ${name} cleanup warning: ${error.message}`));
      }
    }
    
    console.log(chalk.green('✨ Demo cleanup completed!'));
  }
}

// Main demo function
async function main() {
  const demo = new FrameworkDemo();
  
  try {
    await demo.initialize();
    await demo.demonstrateCapabilities();
    await demo.interactiveDemo();
  } catch (error) {
    console.error(chalk.red('💥 Demo failed:'), error.message);
    await demo.cleanup();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n🛑 Received interrupt signal...'));
  process.exit(0);
});

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FrameworkDemo };
