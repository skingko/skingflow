#!/usr/bin/env node

/**
 * Quick Test for Multi-Agent Framework
 * 
 * Simple test to verify basic framework functionality
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createMultiAgentFramework } from '../skingflow/lib/multi-agent/index.js';
import { PostgresMemoryStorage } from './src/storage/postgres-adapter.js';
import config from './src/config.js';
import chalk from 'chalk';

async function quickTest() {
  console.log(chalk.blue('🚀 Quick Multi-Agent Framework Test\n'));

  try {
    // Create framework with minimal configuration
    const framework = await createMultiAgentFramework({
      llm: {
        provider: 'http',
        baseUrl: config.llm.baseUrl + '/chat/completions',
        apiKey: config.llm.apiKey,
        model: config.llm.model,
        temperature: 0.7,
        maxTokens: 1000
      },
      
      memory: {
        storage: new PostgresMemoryStorage({
          host: config.memory.storage.config.host,
          port: config.memory.storage.config.port,
          database: config.memory.storage.config.database,
          user: config.memory.storage.config.user,
          password: config.memory.storage.config.password
        }),
        shortTermRetention: 60 * 60 * 1000, // 1 hour
        maxShortTermMemories: 20,
        maxLongTermMemories: 1000
      },
      
      instructions: 'You are a helpful AI assistant.',
      builtinTools: ['echo', 'write_todos'],
      virtualFileSystem: true,
      planningEnabled: true
    });

    console.log(chalk.cyan('📋 Initializing framework...'));
    await framework.initialize();
    console.log(chalk.green('✅ Framework initialized successfully!\n'));

    // Test 1: Simple query
    console.log(chalk.cyan('🧪 Test 1: Simple Query'));
    const result1 = await framework.processRequest(
      'Hello! Can you help me understand what you can do?',
      { userId: 'test_user', sessionId: 'test_session_1' }
    );
    
    console.log(chalk.green('✅ Simple query test:'), result1.success ? 'PASSED' : 'FAILED');
    if (result1.success) {
      console.log(chalk.gray(`   Duration: ${result1.duration}ms`));
      console.log(chalk.gray(`   Sub-agents used: ${result1.subAgentsUsed}`));
      console.log(chalk.gray(`   Memories stored: ${result1.memoriesStored}`));
    } else {
      console.log(chalk.red(`   Error: ${result1.error}`));
    }
    console.log();

    // Test 2: Memory test
    console.log(chalk.cyan('🧪 Test 2: Memory System'));
    
    // Add a user preference
    await framework.memory.addUserPreference({
      userId: 'test_user',
      content: 'User prefers detailed technical explanations',
      category: 'communication_style',
      importance: 0.9
    });
    
    // Query with context
    const result2 = await framework.processRequest(
      'Explain how machine learning works.',
      { userId: 'test_user', sessionId: 'test_session_2' }
    );
    
    console.log(chalk.green('✅ Memory test:'), result2.success ? 'PASSED' : 'FAILED');
    if (result2.success) {
      console.log(chalk.gray(`   Duration: ${result2.duration}ms`));
      console.log(chalk.gray(`   Memories stored: ${result2.memoriesStored}`));
    } else {
      console.log(chalk.red(`   Error: ${result2.error}`));
    }
    console.log();

    // Test 3: Planning test
    console.log(chalk.cyan('🧪 Test 3: Planning System'));
    const result3 = await framework.processRequest(
      'Create a simple web application with HTML, CSS, and JavaScript files.',
      { userId: 'test_user', sessionId: 'test_session_3' }
    );
    
    console.log(chalk.green('✅ Planning test:'), result3.success ? 'PASSED' : 'FAILED');
    if (result3.success) {
      console.log(chalk.gray(`   Duration: ${result3.duration}ms`));
      console.log(chalk.gray(`   Sub-agents used: ${result3.subAgentsUsed}`));
      console.log(chalk.gray(`   Todos completed: ${result3.todosCompleted}`));
      console.log(chalk.gray(`   Files created: ${Object.keys(result3.files || {}).length}`));
    } else {
      console.log(chalk.red(`   Error: ${result3.error}`));
    }
    console.log();

    // Framework stats
    const stats = framework.getStats();
    console.log(chalk.blue('📊 Framework Statistics:'));
    console.log(chalk.white(`   Initialized: ${stats.initialized}`));
    console.log(chalk.white(`   Components: ${Object.keys(stats.components).length}`));
    console.log(chalk.white(`   Tools: ${stats.components.tools}`));
    console.log(chalk.white(`   Sub-Agents: ${stats.components.subAgents}`));
    console.log();

    await framework.close();
    console.log(chalk.green('🎉 Quick test completed successfully!'));

  } catch (error) {
    console.error(chalk.red('❌ Quick test failed:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Test interrupted by user'));
  process.exit(0);
});

// Run the quick test
quickTest().catch(error => {
  console.error(chalk.red('❌ Test execution failed:'), error.message);
  process.exit(1);
});
