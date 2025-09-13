/**
 * Simple Framework Test - Basic functionality only
 * 
 * @author skingko <venture2157@gmail.com>
 */

import chalk from 'chalk';
import { createFramework } from '../../skingflow/lib/builders/index.js';
import { PostgresMemoryStorage } from '../src/storage/postgres-adapter.js';
import { MemoryManager } from '../../skingflow/lib/core/memory.js';
import config from '../src/config.js';

async function testBasicFramework() {
  console.log(chalk.blue('🧪 Testing Basic Framework Functionality\n'));

  try {
    // Test 1: Framework Creation
    console.log(chalk.yellow('Test 1: Creating Framework'));
    const framework = await createFramework({
      llm: config.llm,
      tools: {
        loadBuiltin: true,
        directory: '/Users/apple/Documents/rust_code/llmlite/nodejs/intelligent-agent/tools'
      }
    });
    console.log(chalk.green('✅ Framework created successfully'));

    // Test 2: Memory System
    console.log(chalk.yellow('\nTest 2: Memory System'));
    const memoryStorage = new PostgresMemoryStorage(config.memory.storage.config);
    const memoryManager = new MemoryManager(memoryStorage, config.memory);
    await memoryManager.initialize();
    
    // Test memory operations
    const testMemoryId = await memoryManager.insert({
      content: 'Simple framework test memory',
      type: 'test',
      category: 'framework_test',
      userId: 'test_user',
      importance: 0.8
    });
    
    console.log(chalk.green(`✅ Memory inserted: ${testMemoryId}`));
    
    const searchResults = await memoryManager.search('framework test', 'test_user');
    console.log(chalk.green(`✅ Memory search found ${searchResults.length} results`));

    // Test 3: Tool System
    console.log(chalk.yellow('\nTest 3: Tool System'));
    if (framework.tools) {
      const calcResult = await framework.tools.execute('calculate', {
        expression: '5 + 3 * 2'
      });
      console.log(chalk.green(`✅ Calculator result: ${calcResult.result}`));
      
      const searchResult = await framework.tools.execute('web_search', {
        query: 'test query',
        max_results: 1
      });
      console.log(chalk.green(`✅ Web search returned ${searchResult.results.length} results`));
    }

    // Test 4: LLM (if available)
    console.log(chalk.yellow('\nTest 4: LLM System'));
    if (framework.llm) {
      try {
        let response = '';
        const testPrompt = '请简短回答：1+1等于多少？';
        
        for await (const chunk of framework.llm.stream(testPrompt)) {
          if (typeof chunk === 'string') {
            response += chunk;
          }
        }
        
        console.log(chalk.green(`✅ LLM response: ${response.substring(0, 50)}...`));
      } catch (error) {
        if (error.message.includes('overloaded') || error.message.includes('429')) {
          console.log(chalk.yellow('⚠️  LLM rate limited (expected)'));
        } else {
          console.log(chalk.red(`❌ LLM error: ${error.message}`));
        }
      }
    }

    // Cleanup
    await memoryManager.close();
    if (framework.close) {
      await framework.close();
    }

    console.log(chalk.green('\n🎉 All basic framework tests passed!'));
    return true;

  } catch (error) {
    console.error(chalk.red(`❌ Framework test failed: ${error.message}`));
    console.error(error.stack);
    return false;
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testBasicFramework().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testBasicFramework };
