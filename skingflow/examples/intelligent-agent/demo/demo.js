/**
 * Interactive Demo for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { IntelligentAgent } from '../src/agent.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

class AgentDemo {
  constructor() {
    this.agent = null;
    this.sessionId = `demo_${Date.now()}`;
    this.conversationHistory = [];
  }

  async initialize() {
    console.log(chalk.blue('🚀 Starting Intelligent Agent Demo\n'));
    
    try {
      this.agent = new IntelligentAgent();
      await this.agent.initialize();
      
      console.log(chalk.green('✅ Agent system ready!\n'));
      this.showWelcome();
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize agent:'), error.message);
      console.log(chalk.yellow('\n💡 Make sure PostgreSQL is running and the database is accessible.'));
      process.exit(1);
    }
  }

  showWelcome() {
    console.log(chalk.blue('🎉 Welcome to the Intelligent Agent Demo!\n'));
    console.log(chalk.white('This demo showcases all core features of the skingflow framework:'));
    console.log(chalk.gray('  • 🤖 Multi-LLM support (using Moonshot API)'));
    console.log(chalk.gray('  • 🧠 PostgreSQL-based memory system'));
    console.log(chalk.gray('  • 🔧 Custom and built-in tools'));
    console.log(chalk.gray('  • 🎭 Advanced flow orchestration'));
    console.log(chalk.gray('  • 📊 Real-time streaming responses\n'));
    
    console.log(chalk.yellow('Try these example queries:'));
    console.log(chalk.gray('  • "你好，我叫张三，是一名软件工程师"'));
    console.log(chalk.gray('  • "请帮我计算 (15 + 25) * 3 / 2"'));
    console.log(chalk.gray('  • "搜索人工智能的最新发展"'));
    console.log(chalk.gray('  • "分析这些数据：[1,2,3,4,5,6,7,8,9,10]"'));
    console.log(chalk.gray('  • "你还记得我的信息吗？"\n'));
  }

  async startInteractiveSession() {
    while (true) {
      try {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: '💬 Chat with Agent', value: 'chat' },
              { name: '📊 View Agent Statistics', value: 'stats' },
              { name: '🧠 View Memory Contents', value: 'memory' },
              { name: '🔧 List Available Tools', value: 'tools' },
              { name: '📋 View Conversation History', value: 'history' },
              { name: '🔄 Run Quick Test', value: 'test' },
              { name: '❌ Exit', value: 'exit' }
            ]
          }
        ]);

        switch (action) {
          case 'chat':
            await this.chatSession();
            break;
          case 'stats':
            await this.showStats();
            break;
          case 'memory':
            await this.showMemory();
            break;
          case 'tools':
            await this.showTools();
            break;
          case 'history':
            this.showHistory();
            break;
          case 'test':
            await this.runQuickTest();
            break;
          case 'exit':
            await this.cleanup();
            return;
        }
      } catch (error) {
        if (error.isTtyError) {
          console.log(chalk.yellow('\n💡 Interactive mode not supported. Running quick test instead...\n'));
          await this.runQuickTest();
          break;
        } else {
          console.error(chalk.red('❌ Error:'), error.message);
        }
      }
    }
  }

  async chatSession() {
    console.log(chalk.blue('\n💬 Chat Session Started'));
    console.log(chalk.gray('Type "exit" to return to main menu\n'));

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

        if (query.toLowerCase() === 'exit') {
          break;
        }

        console.log(chalk.blue('\n🤖 Agent:'));
        console.log('-'.repeat(50));

        const startTime = Date.now();
        const result = await this.agent.processQuery(query, this.sessionId);
        const duration = Date.now() - startTime;

        console.log('-'.repeat(50));
        console.log(chalk.gray(`⏱️  Response time: ${duration}ms\n`));

        // Add to conversation history
        this.conversationHistory.push({
          timestamp: new Date(),
          query,
          result,
          duration
        });

      } catch (error) {
        console.error(chalk.red('❌ Chat error:'), error.message);
      }
    }
  }

  async showStats() {
    console.log(chalk.blue('\n📊 Agent Statistics\n'));

    try {
      const stats = await this.agent.getStats();

      console.log(chalk.yellow('Framework Stats:'));
      if (stats.framework.memory) {
        console.log(`  Memory entries: ${stats.framework.memory.total || 0}`);
      }
      if (stats.framework.tools) {
        console.log(`  Tools available: ${stats.framework.tools.totalTools || 0}`);
        console.log(`  Tool calls: ${stats.framework.tools.totalCalls || 0}`);
      }

      console.log(chalk.yellow('\nOrchestration Stats:'));
      console.log(`  Executions: ${stats.orchestration.executions}`);
      console.log(`  Success rate: ${(stats.orchestration.successRate * 100).toFixed(1)}%`);
      console.log(`  Average time: ${stats.orchestration.averageTime.toFixed(0)}ms`);

      console.log(chalk.yellow('\nSystem Stats:'));
      console.log(`  Uptime: ${stats.agent.uptime.toFixed(0)}s`);
      console.log(`  Memory usage: ${Math.round(stats.agent.memoryUsage.heapUsed / 1024 / 1024)}MB`);
      console.log(`  Conversations: ${this.conversationHistory.length}`);

    } catch (error) {
      console.error(chalk.red('❌ Failed to get stats:'), error.message);
    }

    console.log(); // Empty line
  }

  async showMemory() {
    console.log(chalk.blue('\n🧠 Memory Contents\n'));

    try {
      const memories = await this.agent.framework.memory.findByUser(this.sessionId, 10);

      if (memories.length === 0) {
        console.log(chalk.gray('No memories found for this session.'));
      } else {
        memories.forEach((memory, index) => {
          console.log(chalk.yellow(`${index + 1}. [${memory.type}] ${memory.category}`));
          console.log(chalk.gray(`   ${memory.content.substring(0, 100)}...`));
          console.log(chalk.gray(`   Importance: ${memory.importance}, Created: ${memory.createdAt.toLocaleString()}`));
          console.log();
        });
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to get memory:'), error.message);
    }
  }

  async showTools() {
    console.log(chalk.blue('\n🔧 Available Tools\n'));

    try {
      const tools = this.agent.framework.tools.getAll();

      tools.forEach(tool => {
        console.log(chalk.yellow(`• ${tool.name}`));
        console.log(chalk.gray(`  ${tool.description}`));
        console.log(chalk.gray(`  Category: ${tool.definition.category}`));
        
        const stats = tool.getStats();
        if (stats.calls > 0) {
          console.log(chalk.gray(`  Usage: ${stats.calls} calls, ${(stats.successRate * 100).toFixed(1)}% success`));
        }
        console.log();
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to get tools:'), error.message);
    }
  }

  showHistory() {
    console.log(chalk.blue('\n📋 Conversation History\n'));

    if (this.conversationHistory.length === 0) {
      console.log(chalk.gray('No conversations yet.'));
      return;
    }

    this.conversationHistory.forEach((conv, index) => {
      console.log(chalk.yellow(`${index + 1}. [${conv.timestamp.toLocaleTimeString()}] ${conv.duration}ms`));
      console.log(chalk.white(`   Q: ${conv.query}`));
      console.log(chalk.gray(`   Tools: ${conv.result.toolsUsed || 0}, Memories: ${conv.result.relevantMemories || 0}`));
      console.log();
    });
  }

  async runQuickTest() {
    console.log(chalk.blue('\n🔄 Running Quick Test\n'));

    const testQueries = [
      '你好，我是测试用户',
      '请计算 10 + 15 * 2',
      '搜索最新的技术新闻',
      '我刚才问了什么？'
    ];

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(chalk.yellow(`Test ${i + 1}/${testQueries.length}: ${query}`));
      
      try {
        const startTime = Date.now();
        const result = await this.agent.processQuery(query, 'test_user');
        const duration = Date.now() - startTime;
        
        console.log(chalk.green(`✅ Completed in ${duration}ms`));
        console.log(chalk.gray(`   Tools used: ${result.toolsUsed}, Memories: ${result.relevantMemories}\n`));
        
      } catch (error) {
        console.log(chalk.red(`❌ Failed: ${error.message}\n`));
      }
    }

    console.log(chalk.green('🎉 Quick test completed!\n'));
  }

  async cleanup() {
    console.log(chalk.blue('\n👋 Shutting down agent system...'));
    
    if (this.agent) {
      await this.agent.close();
    }
    
    console.log(chalk.green('✅ Cleanup completed. Goodbye!\n'));
  }
}

// Main demo function
async function main() {
  const demo = new AgentDemo();
  
  try {
    await demo.initialize();
    await demo.startInteractiveSession();
  } catch (error) {
    console.error(chalk.red('💥 Demo failed:'), error.message);
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

export { AgentDemo };
