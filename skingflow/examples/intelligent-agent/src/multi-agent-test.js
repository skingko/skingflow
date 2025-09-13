/**
 * Multi-Agent Framework Test System
 * 
 * Comprehensive test for the new multi-agent framework with:
 * - Advanced memory system (short-term/long-term/preferences)
 * - Planning agent with deepagents prompts
 * - Specialized sub-agents
 * - Virtual file system
 * - Real LLM integration (Moonshot API)
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createMultiAgentFramework } from '../../skingflow/lib/multi-agent/index.js';
import { PostgresMemoryStorage } from './storage/postgres-adapter.js';
import config from './config.js';
import chalk from 'chalk';

/**
 * Multi-Agent Test Configuration
 */
const testConfig = {
  llm: {
    provider: 'http',
    baseUrl: config.llm.baseUrl,
    apiKey: config.llm.apiKey,
    model: config.llm.model,
    temperature: 0.7,
    maxTokens: 2000
  },
  
  memory: {
    storage: new PostgresMemoryStorage({
      host: config.memory.storage.config.host,
      port: config.memory.storage.config.port,
      database: config.memory.storage.config.database,
      user: config.memory.storage.config.user,
      password: config.memory.storage.config.password
    }),
    shortTermRetention: 2 * 60 * 60 * 1000, // 2 hours
    maxShortTermMemories: 50,
    maxLongTermMemories: 5000,
    consolidationThreshold: 0.7,
    preferenceUpdateThreshold: 0.8
  },
  
  tools: [],
  
  instructions: `
You are an advanced AI assistant powered by a multi-agent framework. You have access to:

1. **Advanced Memory System**: Short-term session memory, long-term persistent memory, and user preferences
2. **Specialized Sub-Agents**: Research, coding, data analysis, content creation, and general-purpose agents
3. **Virtual File System**: For sharing context and files between agents
4. **Planning Capabilities**: Break down complex tasks into structured plans
5. **Tool Integration**: Access to various tools for different tasks

Your core principles:
- **Comprehensive Analysis**: Always consider the full context and user history
- **Systematic Execution**: Use planning and sub-agents for complex tasks
- **Memory Integration**: Learn and adapt from user preferences and past interactions
- **Quality Assurance**: Ensure high-quality, thorough results
- **Personalization**: Tailor responses based on user preferences and history

Provide helpful, accurate, and personalized assistance while leveraging all available capabilities.
`,
  
  subAgents: [
    // Custom research agent for specific domains
    {
      name: 'tech-research-agent',
      description: 'Specialized in technology research and analysis',
      prompt: `You are a technology research specialist. Focus on:
- Latest technology trends and developments
- Technical analysis and comparisons
- Industry insights and market analysis
- Implementation recommendations
- Future technology predictions

Provide thorough, well-researched, and actionable insights.`,
      tools: ['web_search', 'read_file', 'write_file'],
      priority: 1
    }
  ],
  
  builtinTools: ['write_todos', 'write_file', 'read_file', 'ls', 'edit_file'],
  virtualFileSystem: true,
  planningEnabled: true
};

/**
 * Test Scenarios
 */
const testScenarios = [
  {
    name: 'Simple Query Test',
    description: 'Test basic functionality with a simple query',
    request: 'Hello, I\'m interested in learning about artificial intelligence. Can you help me?',
    userId: 'test_user_1',
    expectedComponents: ['llm', 'memory'],
    validate: (result) => {
      return result.success && result.response && result.response.length > 0;
    }
  },
  
  {
    name: 'Complex Planning Test',
    description: 'Test planning agent with a complex multi-step task',
    request: 'I want to create a comprehensive guide about renewable energy technologies. Include research on solar, wind, and hydroelectric power, compare their efficiency and costs, and create a structured report with recommendations.',
    userId: 'test_user_2',
    expectedComponents: ['planning', 'subAgents', 'virtualFs'],
    validate: (result) => {
      return result.success && 
             result.subAgentsUsed > 0 && 
             result.todosCompleted > 0;
    }
  },
  
  {
    name: 'Memory Integration Test',
    description: 'Test memory system with user preferences',
    request: 'I prefer technical details and code examples. Can you explain how machine learning models work?',
    userId: 'test_user_3',
    context: {
      setupPreferences: [
        { content: 'User prefers technical explanations with detailed examples', category: 'communication_style' },
        { content: 'User is interested in machine learning and AI topics', category: 'interests' },
        { content: 'User likes code examples and practical implementations', category: 'learning_style' }
      ]
    },
    expectedComponents: ['memory', 'preferences'],
    validate: (result) => {
      return result.success && 
             result.memoriesStored > 0 &&
             result.response.toLowerCase().includes('technical');
    }
  },
  
  {
    name: 'Sub-Agent Specialization Test',
    description: 'Test specialized sub-agent selection and execution',
    request: 'Write a Python function that implements a simple neural network from scratch, include comments and test cases.',
    userId: 'test_user_4',
    expectedComponents: ['subAgents', 'codeAgent'],
    validate: (result) => {
      return result.success && 
             result.subAgentsUsed > 0 &&
             (result.files && Object.keys(result.files).length > 0);
    }
  },
  
  {
    name: 'Virtual File System Test',
    description: 'Test virtual file system operations',
    request: 'Create a project structure for a web application with HTML, CSS, and JavaScript files. Include a README file.',
    userId: 'test_user_5',
    expectedComponents: ['virtualFs', 'files'],
    validate: (result) => {
      return result.success && 
             result.files && 
             Object.keys(result.files).length >= 3;
    }
  },
  
  {
    name: 'Long-term Memory Test',
    description: 'Test long-term memory consolidation and retrieval',
    request: 'Based on our previous conversations about AI, what would you recommend for my next learning steps?',
    userId: 'test_user_3', // Same user as memory integration test
    expectedComponents: ['memory', 'longTerm'],
    validate: (result) => {
      return result.success && 
             result.response.toLowerCase().includes('previous') ||
             result.response.toLowerCase().includes('recommend');
    }
  }
];

/**
 * Test Runner
 */
export class MultiAgentTestRunner {
  constructor() {
    this.framework = null;
    this.results = [];
    this.startTime = null;
  }

  async initialize() {
    console.log(chalk.blue('🚀 Initializing Multi-Agent Framework Test System...\n'));
    
    try {
      this.framework = await createMultiAgentFramework(testConfig);
      await this.framework.initialize();
      
      console.log(chalk.green('✅ Framework initialized successfully'));
      console.log(chalk.gray('Framework stats:'), this.framework.getStats());
      console.log();
      
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Framework initialization failed:'), error.message);
      return false;
    }
  }

  async runAllTests() {
    if (!this.framework) {
      throw new Error('Framework not initialized');
    }

    this.startTime = Date.now();
    console.log(chalk.blue(`🧪 Running ${testScenarios.length} test scenarios...\n`));

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(chalk.cyan(`Test ${i + 1}/${testScenarios.length}: ${scenario.name}`));
      console.log(chalk.gray(scenario.description));
      console.log(chalk.gray('─'.repeat(60)));

      const result = await this.runSingleTest(scenario);
      this.results.push(result);

      if (result.success) {
        console.log(chalk.green(`✅ ${scenario.name} - PASSED`));
      } else {
        console.log(chalk.red(`❌ ${scenario.name} - FAILED`));
        console.log(chalk.red(`Error: ${result.error}`));
      }
      
      console.log(chalk.gray(`Duration: ${result.duration}ms`));
      console.log();

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await this.generateReport();
  }

  async runSingleTest(scenario) {
    const testStartTime = Date.now();
    
    try {
      // Setup user preferences if specified
      if (scenario.context && scenario.context.setupPreferences) {
        for (const pref of scenario.context.setupPreferences) {
          await this.framework.memory.addUserPreference({
            userId: scenario.userId,
            content: pref.content,
            category: pref.category,
            importance: 0.9
          });
        }
      }

      // Execute the test request
      const result = await this.framework.processRequest(scenario.request, {
        userId: scenario.userId,
        sessionId: `test_session_${Date.now()}`,
        ...scenario.context
      });

      // Validate the result
      const isValid = scenario.validate(result);
      
      return {
        scenario: scenario.name,
        success: isValid && result.success,
        result,
        duration: Date.now() - testStartTime,
        error: isValid ? null : 'Validation failed',
        components: scenario.expectedComponents
      };

    } catch (error) {
      return {
        scenario: scenario.name,
        success: false,
        result: null,
        duration: Date.now() - testStartTime,
        error: error.message,
        components: scenario.expectedComponents
      };
    }
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.length - passed;
    const successRate = (passed / this.results.length) * 100;

    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 MULTI-AGENT FRAMEWORK TEST REPORT'));
    console.log(chalk.blue('='.repeat(60)));

    console.log(chalk.white('\n📈 Overall Results:'));
    console.log(chalk.green(`  ✅ Passed: ${passed}/${this.results.length} (${successRate.toFixed(1)}%)`));
    console.log(chalk.red(`  ❌ Failed: ${failed}/${this.results.length}`));
    console.log(chalk.gray(`  ⏱️  Total Duration: ${totalDuration}ms`));
    console.log(chalk.gray(`  ⚡ Average Test Duration: ${Math.round(totalDuration / this.results.length)}ms`));

    console.log(chalk.white('\n🧪 Test Results:'));
    for (const result of this.results) {
      const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      console.log(`  ${status} ${result.scenario} (${result.duration}ms)`);
      
      if (!result.success && result.error) {
        console.log(chalk.red(`       Error: ${result.error}`));
      }
      
      if (result.result && result.result.success) {
        const stats = [];
        if (result.result.subAgentsUsed) stats.push(`${result.result.subAgentsUsed} sub-agents`);
        if (result.result.memoriesStored) stats.push(`${result.result.memoriesStored} memories`);
        if (result.result.todosCompleted) stats.push(`${result.result.todosCompleted} todos`);
        if (result.result.files) stats.push(`${Object.keys(result.result.files).length} files`);
        
        if (stats.length > 0) {
          console.log(chalk.gray(`       Stats: ${stats.join(', ')}`));
        }
      }
    }

    // Component usage analysis
    console.log(chalk.white('\n🔧 Component Usage Analysis:'));
    const componentUsage = {};
    for (const result of this.results) {
      if (result.result && result.result.success) {
        for (const component of result.components) {
          componentUsage[component] = (componentUsage[component] || 0) + 1;
        }
      }
    }
    
    for (const [component, count] of Object.entries(componentUsage)) {
      console.log(`  ${component}: ${count} tests`);
    }

    // Framework statistics
    if (this.framework) {
      const frameworkStats = this.framework.getStats();
      console.log(chalk.white('\n⚙️  Framework Statistics:'));
      console.log(`  Initialized: ${frameworkStats.initialized ? 'Yes' : 'No'}`);
      console.log(`  Components: ${Object.keys(frameworkStats.components).length}`);
      console.log(`  Tools: ${frameworkStats.components.tools}`);
      console.log(`  Sub-Agents: ${frameworkStats.components.subAgents}`);
    }

    console.log(chalk.blue('\n' + '='.repeat(60)));
    
    if (successRate >= 80) {
      console.log(chalk.green('🎉 FRAMEWORK TEST SUITE PASSED!'));
      console.log(chalk.green('The multi-agent framework is ready for production use.'));
    } else if (successRate >= 60) {
      console.log(chalk.yellow('⚠️  FRAMEWORK TEST SUITE PARTIALLY PASSED'));
      console.log(chalk.yellow('Some issues need to be addressed before production use.'));
    } else {
      console.log(chalk.red('❌ FRAMEWORK TEST SUITE FAILED'));
      console.log(chalk.red('Significant issues need to be resolved.'));
    }
    
    console.log(chalk.blue('='.repeat(60)));
  }

  async cleanup() {
    if (this.framework) {
      await this.framework.close();
    }
  }
}

/**
 * Main test execution function
 */
export async function runMultiAgentTests() {
  const testRunner = new MultiAgentTestRunner();
  
  try {
    const initialized = await testRunner.initialize();
    if (!initialized) {
      process.exit(1);
    }

    await testRunner.runAllTests();
    
  } catch (error) {
    console.error(chalk.red('❌ Test execution failed:'), error.message);
    console.error(error.stack);
  } finally {
    await testRunner.cleanup();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMultiAgentTests();
}

export default {
  MultiAgentTestRunner,
  runMultiAgentTests,
  testScenarios
};
