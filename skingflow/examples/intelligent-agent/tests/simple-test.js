/**
 * Simple Test for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import chalk from 'chalk';
import { SimpleIntelligentAgent } from '../src/simple-agent.js';

async function runSimpleTest() {
  console.log(chalk.blue('🧪 Starting Simple Agent Test\n'));
  
  let agent = null;
  
  try {
    // Test 1: Agent Initialization
    console.log(chalk.yellow('Test 1: Agent Initialization'));
    agent = new SimpleIntelligentAgent();
    await agent.initialize();
    console.log(chalk.green('✅ Agent initialized successfully\n'));
    
    // Test 2: Simple Query
    console.log(chalk.yellow('Test 2: Simple Query Processing'));
    const result1 = await agent.processQuery('你好，我叫张三', 'test_user');
    if (result1.success) {
      console.log(chalk.green('✅ Query processed successfully\n'));
    } else {
      throw new Error('Query processing failed');
    }
    
    // Test 3: Memory Recall
    console.log(chalk.yellow('Test 3: Memory Recall'));
    const result2 = await agent.processQuery('我的名字是什么？', 'test_user');
    if (result2.success) {
      console.log(chalk.green('✅ Memory recall test completed\n'));
    } else {
      throw new Error('Memory recall failed');
    }
    
    // Test 4: Mathematical Query
    console.log(chalk.yellow('Test 4: Mathematical Query'));
    const result3 = await agent.processQuery('请帮我计算 15 + 25', 'test_user');
    if (result3.success) {
      console.log(chalk.green('✅ Mathematical query completed\n'));
    } else {
      throw new Error('Mathematical query failed');
    }
    
    console.log(chalk.green('🎉 All tests passed!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error.message);
    process.exit(1);
    
  } finally {
    if (agent) {
      await agent.close();
    }
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleTest();
}

export { runSimpleTest };
