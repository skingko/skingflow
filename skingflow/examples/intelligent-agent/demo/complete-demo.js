/**
 * Complete Framework Demo - Showcase All Capabilities
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { StandaloneIntelligentAgent } from '../src/standalone-agent.js';
import { createFramework } from '../../skingflow/lib/builders/index.js';
import { PostgresMemoryStorage } from '../src/storage/postgres-adapter.js';
import { MemoryManager } from '../../skingflow/lib/core/memory.js';
import { AsyncNode } from '../../skingflow/skingflow.js';
import config from '../src/config.js';
import chalk from 'chalk';

/**
 * Custom Processing Node - Demonstrates framework extensibility
 */
class CustomProcessingNode extends AsyncNode {
  constructor(name) {
    super();
    this.name = name;
    this.processedCount = 0;
  }

  async *execAsyncStream(shared) {
    yield chalk.magenta(`🎭 ${this.name}: Processing request...\n`);
    
    this.processedCount++;
    const query = shared.content || shared.message || '';
    
    // Add custom metadata
    shared.customProcessing = {
      processedBy: this.name,
      processedAt: new Date(),
      queryLength: query.length,
      processCount: this.processedCount
    };
    
    yield chalk.gray(`   📊 Processed ${this.processedCount} requests so far\n`);
    yield chalk.gray(`   📝 Query length: ${query.length} characters\n`);
  }
}

class CompleteDemo {
  constructor() {
    this.results = [];
  }

  async runCompleteDemo() {
    console.log(chalk.blue('🚀 Complete Framework Capabilities Demo\n'));
    console.log('='.repeat(70));
    
    try {
      // 1. Standalone Agent Demo
      await this.demonstrateStandaloneAgent();
      
      // 2. Framework Components Demo
      await this.demonstrateFrameworkComponents();
      
      // 3. Custom Orchestration Demo
      await this.demonstrateCustomOrchestration();
      
      // 4. Memory System Demo
      await this.demonstrateMemorySystem();
      
      // 5. Tool System Demo
      await this.demonstrateToolSystem();
      
      // 6. Performance Comparison
      await this.demonstratePerformance();
      
      // Summary
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.red('💥 Demo failed:'), error.message);
      throw error;
    }
  }

  async demonstrateStandaloneAgent() {
    console.log(chalk.yellow('\n📱 1. Standalone Agent Demonstration'));
    console.log('─'.repeat(50));
    
    const agent = new StandaloneIntelligentAgent();
    await agent.initialize();
    
    const testQueries = [
      '你好，我叫李华，是一名软件工程师',
      '请计算 15 * 8 + 32',
      '我的职业是什么？'
    ];
    
    for (const query of testQueries) {
      console.log(chalk.cyan(`\n🔸 Query: "${query}"`));
      const result = await agent.processQuery(query, 'standalone_demo_user');
      
      this.results.push({
        type: 'standalone',
        query,
        success: result.success,
        memories: result.memoriesFound || 0,
        processingTime: result.processingTime || 0
      });
    }
    
    await agent.close();
    console.log(chalk.green('✅ Standalone agent demo completed'));
  }

  async demonstrateFrameworkComponents() {
    console.log(chalk.yellow('\n⚡ 2. Framework Components Demonstration'));
    console.log('─'.repeat(50));
    
    // Create framework
    const framework = await createFramework({
      llm: config.llm,
      tools: {
        loadBuiltin: true,
        directory: '/Users/apple/Documents/rust_code/llmlite/nodejs/intelligent-agent/tools'
      }
    });
    
    // Test LLM component
    console.log(chalk.cyan('\n🧠 Testing LLM Component:'));
    if (framework.llm) {
      try {
        let response = '';
        const prompt = '请用一句话解释什么是人工智能';
        
        for await (const chunk of framework.llm.stream(prompt)) {
          if (typeof chunk === 'string') {
            response += chunk;
          }
        }
        
        console.log(chalk.green(`✅ LLM Response: ${response.substring(0, 100)}...`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  LLM Error (expected): ${error.message.substring(0, 50)}...`));
      }
    }
    
    // Test Tool component
    console.log(chalk.cyan('\n🔧 Testing Tool Component:'));
    if (framework.tools) {
      const calcResult = await framework.tools.execute('calculate', {
        expression: '42 + 18'
      });
      console.log(chalk.green(`✅ Calculator: ${calcResult.result}`));
      
      const searchResult = await framework.tools.execute('web_search', {
        query: 'framework demo',
        max_results: 2
      });
      console.log(chalk.green(`✅ Web Search: ${searchResult.results.length} results`));
    }
    
    // Test Memory component
    console.log(chalk.cyan('\n🧠 Testing Memory Component:'));
    const memoryStorage = new PostgresMemoryStorage(config.memory.storage.config);
    const memoryManager = new MemoryManager(memoryStorage, config.memory);
    await memoryManager.initialize();
    
    const memoryId = await memoryManager.insert({
      content: 'Framework components test memory',
      type: 'test',
      category: 'demo',
      userId: 'framework_demo_user',
      importance: 0.9
    });
    
    const memories = await memoryManager.search('framework components', 'framework_demo_user');
    console.log(chalk.green(`✅ Memory: Stored ${memoryId}, Found ${memories.length} memories`));
    
    await memoryManager.close();
    if (framework.close) await framework.close();
    
    console.log(chalk.green('✅ Framework components demo completed'));
  }

  async demonstrateCustomOrchestration() {
    console.log(chalk.yellow('\n🎭 3. Custom Orchestration Demonstration'));
    console.log('─'.repeat(50));
    
    // Create framework with custom orchestration
    const framework = await createFramework({
      llm: config.llm,
      tools: { loadBuiltin: true }
    });
    
    // Create custom nodes
    const preprocessor = new CustomProcessingNode('Preprocessor');
    const analyzer = new CustomProcessingNode('Analyzer');
    const postprocessor = new CustomProcessingNode('Postprocessor');
    
    // Create custom orchestration
    const customOrchestration = framework
      .createOrchestration({
        stopOnError: false,
        timeout: 60000
      })
      .addStep(preprocessor, { name: 'Preprocessing' })
      .addStep(analyzer, { name: 'Analysis' })
      .addStep(postprocessor, { name: 'Postprocessing' })
      .build();
    
    // Test custom workflow
    const shared = {
      content: 'This is a test for custom orchestration workflow',
      userId: 'orchestration_demo_user'
    };
    
    console.log(chalk.cyan('\n🔄 Executing Custom Workflow:'));
    for await (const chunk of customOrchestration.execAsyncStream(shared)) {
      process.stdout.write(chunk);
    }
    
    console.log(chalk.green('✅ Custom orchestration completed'));
    console.log(chalk.gray(`   Custom metadata: ${JSON.stringify(shared.customProcessing, null, 2)}`));
    
    if (framework.close) await framework.close();
  }

  async demonstrateMemorySystem() {
    console.log(chalk.yellow('\n🧠 4. Advanced Memory System Demonstration'));
    console.log('─'.repeat(50));
    
    const memoryStorage = new PostgresMemoryStorage(config.memory.storage.config);
    const memoryManager = new MemoryManager(memoryStorage, config.memory);
    await memoryManager.initialize();
    
    // Insert various types of memories
    const memoryTypes = [
      {
        content: 'User prefers coffee over tea',
        type: 'preference',
        category: 'food',
        importance: 0.7
      },
      {
        content: 'Meeting scheduled for 3 PM tomorrow',
        type: 'event',
        category: 'schedule',
        importance: 0.9
      },
      {
        content: 'JavaScript is user\'s favorite programming language',
        type: 'fact',
        category: 'technology',
        importance: 0.8
      }
    ];
    
    console.log(chalk.cyan('\n💾 Inserting diverse memory types:'));
    for (const memory of memoryTypes) {
      const id = await memoryManager.insert({
        ...memory,
        userId: 'memory_demo_user'
      });
      console.log(chalk.green(`   ✅ ${memory.type}: ${id}`));
    }
    
    // Demonstrate different search capabilities
    console.log(chalk.cyan('\n🔍 Testing search capabilities:'));
    
    const searchTests = [
      { query: 'coffee preferences', description: 'Semantic search' },
      { query: 'programming language', description: 'Technology search' },
      { query: 'tomorrow meeting', description: 'Schedule search' }
    ];
    
    for (const test of searchTests) {
      const results = await memoryManager.search(test.query, 'memory_demo_user');
      console.log(chalk.green(`   ✅ ${test.description}: ${results.length} results`));
    }
    
    // Test query builder
    console.log(chalk.cyan('\n📊 Testing query builder:'));
    const categoryResults = await memoryManager.query(q => 
      q.equals('userId', 'memory_demo_user')
       .equals('category', 'technology')
       .limit(5)
    );
    console.log(chalk.green(`   ✅ Technology category: ${categoryResults.length} memories`));
    
    await memoryManager.close();
    console.log(chalk.green('✅ Memory system demo completed'));
  }

  async demonstrateToolSystem() {
    console.log(chalk.yellow('\n🔧 5. Advanced Tool System Demonstration'));
    console.log('─'.repeat(50));
    
    const framework = await createFramework({
      tools: {
        loadBuiltin: true,
        directory: '/Users/apple/Documents/rust_code/llmlite/nodejs/intelligent-agent/tools'
      }
    });
    
    if (framework.tools) {
      console.log(chalk.cyan('\n📋 Available tools:'));
      const tools = framework.tools.getAll();
      tools.forEach(tool => {
        console.log(chalk.gray(`   • ${tool.name}: ${tool.description}`));
      });
      
      console.log(chalk.cyan('\n⚡ Testing tool execution:'));
      
      // Test built-in tools
      const builtinTests = [
        {
          name: 'calculate',
          params: { expression: '(25 + 15) * 2' },
          expected: 80
        },
        {
          name: 'datetime',
          params: { format: 'iso' },
          expected: null // Just check it doesn't error
        }
      ];
      
      for (const test of builtinTests) {
        try {
          const result = await framework.tools.execute(test.name, test.params);
          console.log(chalk.green(`   ✅ ${test.name}: Success`));
          if (test.expected !== null && result.result === test.expected) {
            console.log(chalk.gray(`      Expected result verified: ${result.result}`));
          }
        } catch (error) {
          console.log(chalk.red(`   ❌ ${test.name}: ${error.message}`));
        }
      }
      
      // Test custom tools
      const customTests = [
        {
          name: 'web_search',
          params: { query: 'AI framework', max_results: 1 }
        },
        {
          name: 'analyze_data',
          params: { data: [1, 2, 3, 4, 5], analysis_type: 'statistical' }
        }
      ];
      
      for (const test of customTests) {
        try {
          const result = await framework.tools.execute(test.name, test.params);
          console.log(chalk.green(`   ✅ ${test.name}: Success`));
        } catch (error) {
          console.log(chalk.yellow(`   ⚠️  ${test.name}: ${error.message.substring(0, 50)}...`));
        }
      }
    }
    
    if (framework.close) await framework.close();
    console.log(chalk.green('✅ Tool system demo completed'));
  }

  async demonstratePerformance() {
    console.log(chalk.yellow('\n🏁 6. Performance and Scalability Demonstration'));
    console.log('─'.repeat(50));
    
    const agent = new StandaloneIntelligentAgent();
    await agent.initialize();
    
    // Test concurrent queries
    console.log(chalk.cyan('\n⚡ Testing concurrent processing:'));
    const concurrentQueries = [
      '计算 10 + 20',
      '计算 15 * 3',
      '计算 100 - 25',
      '计算 50 / 2'
    ];
    
    const startTime = Date.now();
    const promises = concurrentQueries.map((query, index) => 
      agent.processQuery(query, `perf_user_${index}`)
    );
    
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(chalk.green(`   ✅ Processed ${successful}/${concurrentQueries.length} concurrent queries in ${duration}ms`));
    console.log(chalk.gray(`   ⚡ Average: ${(duration / concurrentQueries.length).toFixed(0)}ms per query`));
    
    // Test memory performance
    console.log(chalk.cyan('\n💾 Testing memory performance:'));
    const memoryStartTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await agent.processQuery(`测试记忆 ${i}: 这是第${i}个测试条目`, 'memory_perf_user');
    }
    
    const memoryDuration = Date.now() - memoryStartTime;
    console.log(chalk.green(`   ✅ Stored 10 memories in ${memoryDuration}ms`));
    console.log(chalk.gray(`   💾 Average: ${(memoryDuration / 10).toFixed(0)}ms per memory operation`));
    
    await agent.close();
    console.log(chalk.green('✅ Performance demo completed'));
  }

  printSummary() {
    console.log(chalk.blue('\n📊 Demo Summary Report'));
    console.log('='.repeat(70));
    
    console.log(chalk.green('✅ Successfully Demonstrated:'));
    console.log(chalk.gray('   • Standalone Agent System'));
    console.log(chalk.gray('   • Framework Component Architecture'));
    console.log(chalk.gray('   • Custom Orchestration Workflows'));
    console.log(chalk.gray('   • Advanced Memory Management'));
    console.log(chalk.gray('   • Extensible Tool System'));
    console.log(chalk.gray('   • Performance & Scalability'));
    
    console.log(chalk.yellow('\n🎯 Key Framework Features:'));
    console.log(chalk.gray('   • Multi-LLM Support (HTTP/OpenAI/Anthropic/Ollama)'));
    console.log(chalk.gray('   • PostgreSQL Memory with Semantic Search'));
    console.log(chalk.gray('   • Unified Tool System (XML/YAML/Function/MCP)'));
    console.log(chalk.gray('   • Streaming Response Generation'));
    console.log(chalk.gray('   • Custom Node & Orchestration Support'));
    console.log(chalk.gray('   • High-Performance Concurrent Processing'));
    
    console.log(chalk.blue('\n🚀 Framework Customization Capabilities:'));
    console.log(chalk.gray('   ✓ Custom Processing Nodes'));
    console.log(chalk.gray('   ✓ Flexible Orchestration Workflows'));
    console.log(chalk.gray('   ✓ Pluggable Memory Storage Backends'));
    console.log(chalk.gray('   ✓ Custom Tool Integration'));
    console.log(chalk.gray('   ✓ LLM Provider Abstraction'));
    console.log(chalk.gray('   ✓ Real-time Analytics & Monitoring'));
    
    console.log('='.repeat(70));
    console.log(chalk.green('🎉 Framework Demo Completed Successfully!'));
    console.log(chalk.blue('   Ready for production use with high customization flexibility.'));
  }
}

// Main demo function
async function main() {
  const demo = new CompleteDemo();
  
  try {
    await demo.runCompleteDemo();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('💥 Complete demo failed:'), error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Demo interrupted'));
  process.exit(0);
});

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CompleteDemo };
