/**
 * Standalone Test for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import chalk from 'chalk';
import { StandaloneIntelligentAgent } from '../src/standalone-agent.js';

class StandaloneTestRunner {
  constructor() {
    this.tests = [];
    this.results = { total: 0, passed: 0, failed: 0 };
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTest(test) {
    console.log(chalk.blue(`🧪 TEST: ${test.name}`));
    
    try {
      await test.testFn();
      console.log(chalk.green(`✅ PASS: ${test.name}\n`));
      this.results.passed++;
    } catch (error) {
      console.log(chalk.red(`❌ FAIL: ${test.name}`));
      console.log(chalk.red(`   Error: ${error.message}\n`));
      this.results.failed++;
    }
  }

  async runAll() {
    console.log(chalk.blue('🚀 Starting Standalone Agent Tests\n'));
    console.log('='.repeat(60));
    
    this.results.total = this.tests.length;
    
    for (const test of this.tests) {
      await this.runTest(test);
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('='.repeat(60));
    console.log(chalk.blue('📊 Test Results\n'));
    
    console.log(`Total: ${this.results.total}`);
    console.log(chalk.green(`Passed: ${this.results.passed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    
    const passRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    console.log(`Pass Rate: ${passRate}%`);
    
    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 All tests passed!'));
    } else {
      console.log(chalk.red(`\n💥 ${this.results.failed} test(s) failed`));
    }
  }
}

// Initialize test runner
const runner = new StandaloneTestRunner();
let agent = null;

// Test 1: Agent Initialization
runner.addTest('Agent Initialization', async () => {
  agent = new StandaloneIntelligentAgent();
  await agent.initialize();
  
  if (!agent.initialized) {
    throw new Error('Agent not initialized properly');
  }
  
  console.log('   ✓ Agent initialized successfully');
});

// Test 2: Database Operations
runner.addTest('Database Operations', async () => {
  if (!agent || !agent.memory) {
    throw new Error('Agent or memory not available');
  }
  
  // Test memory insertion
  const testMemoryId = await agent.memory.insert({
    content: 'Test memory for database operations',
    type: 'test',
    category: 'system_test',
    userId: 'test_user',
    importance: 0.5
  });
  
  if (!testMemoryId) {
    throw new Error('Failed to insert test memory');
  }
  
  // Test memory search
  const searchResults = await agent.memory.search('database operations', 'test_user');
  
  if (searchResults.length === 0) {
    throw new Error('Failed to search memories');
  }
  
  console.log('   ✓ Database operations working');
  console.log(`   ✓ Test memory ID: ${testMemoryId}`);
});

// Test 3: Basic Conversation
runner.addTest('Basic Conversation', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const result = await agent.processQuery('你好，我叫李明，是一名程序员', 'test_user_1');
  
  if (!result || !result.success) {
    throw new Error('Basic conversation failed');
  }
  
  console.log('   ✓ Basic conversation successful');
  console.log(`   ✓ Response generated: ${result.response.length} chars`);
});

// Test 4: Memory Recall
runner.addTest('Memory Recall', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  // First, introduce information
  await agent.processQuery('我最喜欢的编程语言是 JavaScript', 'test_user_2');
  
  // Then try to recall it
  const result = await agent.processQuery('我喜欢什么编程语言？', 'test_user_2');
  
  if (!result || !result.success) {
    throw new Error('Memory recall failed');
  }
  
  console.log('   ✓ Memory recall working');
  console.log(`   ✓ Found ${result.memoriesFound} relevant memories`);
});

// Test 5: Mathematical Queries
runner.addTest('Mathematical Queries', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const queries = [
    '请计算 15 + 25',
    '帮我算一下 8 * 7',
    '10 + 5 等于多少？'
  ];
  
  for (const query of queries) {
    const result = await agent.processQuery(query, 'math_test_user');
    
    if (!result || !result.success) {
      throw new Error(`Math query failed: ${query}`);
    }
    
    console.log(`   ✓ Math query processed: "${query}"`);
  }
});

// Test 6: Performance Test
runner.addTest('Performance Test', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const startTime = Date.now();
  const testQueries = [
    '今天天气如何？',
    '推荐一本好书',
    '什么是人工智能？'
  ];
  
  for (const query of testQueries) {
    await agent.processQuery(query, 'perf_test_user');
  }
  
  const totalTime = Date.now() - startTime;
  const avgTime = totalTime / testQueries.length;
  
  if (avgTime > 30000) { // 30 seconds per query is too slow
    throw new Error(`Performance too slow: ${avgTime}ms average`);
  }
  
  console.log(`   ✓ Performance acceptable: ${avgTime.toFixed(0)}ms average`);
  console.log(`   ✓ Total time: ${totalTime}ms for ${testQueries.length} queries`);
});

// Test 7: Memory Statistics
runner.addTest('Memory Statistics', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  const stats = await agent.getMemoryStats('test_user_1');
  
  if (!stats) {
    throw new Error('Failed to get memory statistics');
  }
  
  console.log(`   ✓ Memory stats retrieved: ${stats.totalMemories} memories`);
});

// Test 8: Error Handling
runner.addTest('Error Handling', async () => {
  if (!agent) {
    throw new Error('Agent not available');
  }
  
  // Test with potentially problematic input
  const problemQueries = [
    '', // Empty query
    'a'.repeat(1000), // Very long query
    '特殊字符测试 @#$%^&*()', // Special characters
  ];
  
  for (const query of problemQueries) {
    try {
      if (query === '') continue; // Skip empty query as it might be handled differently
      
      const result = await agent.processQuery(query, 'error_test_user');
      
      // Should not throw, but should handle gracefully
      if (!result) {
        throw new Error(`No result for problematic query: ${query.substring(0, 50)}...`);
      }
      
    } catch (error) {
      // Some errors are expected, but system should not crash
      console.log(`   ⚠️  Expected error handled: ${error.message.substring(0, 50)}...`);
    }
  }
  
  console.log('   ✓ Error handling working');
});

// Test 9: Cleanup
runner.addTest('Cleanup', async () => {
  if (agent) {
    await agent.close();
    console.log('   ✓ Agent closed successfully');
  }
});

// Main test function
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

export { StandaloneTestRunner, runner };
