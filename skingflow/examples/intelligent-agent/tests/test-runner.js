/**
 * Test Runner for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import chalk from 'chalk';
import { IntelligentAgent } from '../src/agent.js';

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  addTest(name, testFn, options = {}) {
    this.tests.push({
      name,
      testFn,
      timeout: options.timeout || 30000,
      skip: options.skip || false
    });
  }

  async runTest(test) {
    if (test.skip) {
      console.log(chalk.yellow(`⏭️  SKIP: ${test.name}`));
      this.results.skipped++;
      return;
    }

    console.log(chalk.blue(`🧪 TEST: ${test.name}`));
    
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), test.timeout)
      );
      
      await Promise.race([test.testFn(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(chalk.green(`✅ PASS: ${test.name} (${duration}ms)\n`));
      this.results.passed++;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(chalk.red(`❌ FAIL: ${test.name} (${duration}ms)`));
      console.log(chalk.red(`   Error: ${error.message}\n`));
      this.results.failed++;
    }
  }

  async runAll() {
    console.log(chalk.blue('🚀 Starting Test Suite for Intelligent Agent System\n'));
    console.log('='.repeat(60));
    
    this.results.total = this.tests.length;
    
    for (const test of this.tests) {
      await this.runTest(test);
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('='.repeat(60));
    console.log(chalk.blue('📊 Test Results Summary\n'));
    
    console.log(`Total Tests: ${this.results.total}`);
    console.log(chalk.green(`Passed: ${this.results.passed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    console.log(chalk.yellow(`Skipped: ${this.results.skipped}`));
    
    const passRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    console.log(`\nPass Rate: ${passRate}%`);
    
    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.red(`\n💥 ${this.results.failed} test(s) failed`));
    }
  }
}

// Initialize test runner
const runner = new TestRunner();
let agent = null;

// Test 1: Agent Initialization
runner.addTest('Agent Initialization', async () => {
  agent = new IntelligentAgent();
  await agent.initialize();
  
  if (!agent.initialized) {
    throw new Error('Agent not initialized properly');
  }
  
  console.log('   ✓ Agent initialized successfully');
});

// Test 2: Database Connection
runner.addTest('Database Connection', async () => {
  if (!agent || !agent.framework || !agent.framework.memory) {
    throw new Error('Agent or memory system not available');
  }
  
  // Test database connection by inserting a test memory
  const testMemory = {
    content: 'Test memory for database connection',
    type: 'test',
    category: 'system_test',
    userId: 'test_user',
    importance: 0.5
  };
  
  const memoryId = await agent.framework.memory.insert(testMemory);
  
  if (!memoryId) {
    throw new Error('Failed to insert test memory');
  }
  
  // Verify memory was stored
  const retrievedMemory = await agent.framework.memory.findById(memoryId);
  
  if (!retrievedMemory || retrievedMemory.content !== testMemory.content) {
    throw new Error('Failed to retrieve test memory');
  }
  
  // Clean up test memory
  await agent.framework.memory.delete(memoryId);
  
  console.log('   ✓ Database connection working');
  console.log(`   ✓ Test memory stored and retrieved: ${memoryId}`);
});

// Test 3: LLM Connection
runner.addTest('LLM Connection', async () => {
  if (!agent || !agent.framework || !agent.framework.llm) {
    throw new Error('Agent or LLM not available');
  }
  
  // Test LLM with a simple query
  const testPrompt = '请回答：1+1等于多少？（请简短回答）';
  let response = '';
  
  for await (const chunk of agent.framework.llm.stream(testPrompt)) {
    if (typeof chunk === 'string') {
      response += chunk;
    }
  }
  
  if (!response || response.length === 0) {
    throw new Error('No response from LLM');
  }
  
  console.log('   ✓ LLM connection working');
  console.log(`   ✓ LLM response: ${response.substring(0, 50)}...`);
});

// Test 4: Tool System
runner.addTest('Tool System', async () => {
  if (!agent || !agent.framework || !agent.framework.tools) {
    throw new Error('Agent or tool system not available');
  }
  
  // Test built-in calculator tool
  const calcResult = await agent.framework.tools.execute('calculate', {
    expression: '2 + 3 * 4'
  });
  
  if (!calcResult || calcResult.result !== 14) {
    throw new Error(`Calculator tool failed: expected 14, got ${calcResult?.result}`);
  }
  
  // Test custom web search tool
  const searchResult = await agent.framework.tools.execute('web_search', {
    query: 'test query',
    max_results: 2
  });
  
  if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
    throw new Error('Web search tool failed');
  }
  
  console.log('   ✓ Calculator tool working');
  console.log('   ✓ Web search tool working');
  console.log(`   ✓ Tools available: ${agent.framework.tools.getAll().length}`);
});

// Test 5: Memory Operations
runner.addTest('Memory Operations', async () => {
  if (!agent || !agent.framework || !agent.framework.memory) {
    throw new Error('Agent or memory system not available');
  }
  
  const testUserId = 'memory_test_user';
  
  // Insert test memories
  const memories = [
    {
      content: 'User likes coffee',
      type: 'preference',
      category: 'food',
      userId: testUserId,
      importance: 0.8
    },
    {
      content: 'User is interested in AI technology',
      type: 'interest',
      category: 'technology',
      userId: testUserId,
      importance: 0.9
    },
    {
      content: 'User works as a software developer',
      type: 'fact',
      category: 'personal',
      userId: testUserId,
      importance: 0.7
    }
  ];
  
  const memoryIds = [];
  for (const memory of memories) {
    const id = await agent.framework.memory.insert(memory);
    memoryIds.push(id);
  }
  
  // Test semantic search
  const searchResults = await agent.framework.memory.search('coffee preferences', testUserId);
  
  if (searchResults.length === 0) {
    throw new Error('Semantic search returned no results');
  }
  
  // Test query builder
  const queryResults = await agent.framework.memory.query(q => 
    q.equals('userId', testUserId)
     .equals('category', 'technology')
     .limit(5)
  );
  
  if (queryResults.length === 0) {
    throw new Error('Query builder returned no results');
  }
  
  // Clean up test memories
  for (const id of memoryIds) {
    await agent.framework.memory.delete(id);
  }
  
  console.log(`   ✓ Inserted ${memoryIds.length} test memories`);
  console.log(`   ✓ Semantic search found ${searchResults.length} results`);
  console.log(`   ✓ Query builder found ${queryResults.length} results`);
});

// Test 6: Complete Agent Workflow
runner.addTest('Complete Agent Workflow', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const testQueries = [
    '你好，我是测试用户',
    '请帮我计算 15 * 23',
    '搜索人工智能的最新发展',
    '我之前问过什么问题吗？'
  ];
  
  for (const query of testQueries) {
    console.log(`   Testing query: "${query}"`);
    
    const result = await agent.processQuery(query, 'workflow_test_user');
    
    if (!result || !result.success) {
      throw new Error(`Workflow failed for query: ${query}`);
    }
    
    console.log(`   ✓ Query processed successfully`);
  }
  
  console.log(`   ✓ All ${testQueries.length} test queries processed`);
});

// Test 7: Orchestration System
runner.addTest('Orchestration System', async () => {
  if (!agent || !agent.orchestration) {
    throw new Error('Agent or orchestration not available');
  }
  
  const stats = agent.orchestration.getStats();
  
  if (!stats) {
    throw new Error('Failed to get orchestration stats');
  }
  
  console.log(`   ✓ Orchestration executions: ${stats.executions}`);
  console.log(`   ✓ Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  console.log(`   ✓ Average execution time: ${stats.averageTime.toFixed(0)}ms`);
});

// Test 8: Performance and Stats
runner.addTest('Performance and Stats', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const stats = await agent.getStats();
  
  if (!stats) {
    throw new Error('Failed to get agent stats');
  }
  
  console.log('   ✓ Framework stats retrieved');
  console.log('   ✓ Orchestration stats retrieved');
  console.log('   ✓ Agent stats retrieved');
  console.log(`   ✓ Memory usage: ${Math.round(stats.agent.memoryUsage.heapUsed / 1024 / 1024)}MB`);
});

// Test 9: Cleanup
runner.addTest('Cleanup', async () => {
  if (agent) {
    await agent.close();
    console.log('   ✓ Agent closed successfully');
  }
});

// Run all tests
async function main() {
  try {
    await runner.runAll();
    process.exit(runner.results.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('💥 Test runner failed:'), error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestRunner, runner };
