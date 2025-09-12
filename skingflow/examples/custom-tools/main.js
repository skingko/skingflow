/**
 * Custom Tools Example using skingflow Framework
 * 
 * Demonstrates how to define and use custom tools with XML/YAML definitions
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createFramework } from '../../lib/builders/index.js';
import { ToolDefinition, Tool } from '../../lib/core/tools.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🔧 Starting Custom Tools Example\n');

  try {
    // Create framework with custom tools
    const framework = await createFramework({
      llm: process.env.OPENAI_API_KEY ? {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7
      } : null,
      tools: {
        loadBuiltin: true,
        directory: __dirname // Load tools from current directory
      }
    });

    console.log('✅ Framework initialized with custom tools');

    // List all available tools
    console.log('\n📋 Available Tools:');
    console.log('=' * 30);
    const allTools = framework.tools.getAll();
    allTools.forEach(tool => {
      console.log(`• ${tool.name}: ${tool.description}`);
      console.log(`  Category: ${tool.definition.category}`);
      console.log(`  Parameters: ${Object.keys(tool.definition.parameters).join(', ')}`);
      console.log('');
    });

    // Test weather tool
    console.log('🌤️  Testing Weather Tool:');
    console.log('-' * 25);
    
    try {
      const weatherResult = await framework.tools.execute('get_weather', {
        location: 'Tokyo, Japan',
        units: 'celsius',
        include_forecast: true
      });
      console.log('Weather result:', JSON.stringify(weatherResult, null, 2));
    } catch (error) {
      console.log('Weather tool error:', error.message);
    }

    // Test translation tool
    console.log('\n🌐 Testing Translation Tool:');
    console.log('-' * 28);
    
    try {
      const translationResult = await framework.tools.execute('translate_text', {
        text: 'Hello, how are you?',
        target_language: 'es'
      });
      console.log('Translation result:', JSON.stringify(translationResult, null, 2));
    } catch (error) {
      console.log('Translation tool error:', error.message);
    }

    // Test builtin tools
    console.log('\n🧮 Testing Builtin Tools:');
    console.log('-' * 24);
    
    const calcResult = await framework.tools.execute('calculate', {
      expression: '(15 * 23) + (100 / 4)'
    });
    console.log('Calculation result:', JSON.stringify(calcResult, null, 2));

    const datetimeResult = await framework.tools.execute('datetime', {
      format: 'local'
    });
    console.log('Current time:', datetimeResult);

    // Create a chat flow that can use tools
    if (framework.llm) {
      console.log('\n💬 Testing Tool-Enabled Chat:');
      console.log('-' * 30);

      const chatFlow = framework
        .createChatFlow()
        .build();

      console.log('\n👤 User: What\'s the weather like in London and translate "thank you" to Spanish?');
      console.log('🤖 Assistant: ');

      for await (const chunk of chatFlow.execAsyncStream({
        content: 'What\'s the weather like in London, UK? Also, can you translate "thank you" to Spanish?',
        userId: 'tools-demo'
      })) {
        process.stdout.write(chunk);
      }
    } else {
      console.log('\n⚠️  LLM not available - skipping chat demo');
    }

    // Show tool usage statistics
    console.log('\n\n📊 Tool Usage Statistics:');
    console.log('=' * 30);
    const toolStats = framework.tools.getStats();
    console.log(`Total tools: ${toolStats.totalTools}`);
    console.log(`Total calls: ${toolStats.totalCalls}`);
    console.log(`Success rate: ${(toolStats.successRate * 100).toFixed(1)}%`);
    console.log(`Average execution time: ${toolStats.averageTime.toFixed(0)}ms`);
    
    console.log('\nTools by category:');
    Object.entries(toolStats.categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} tools`);
    });

    // Show individual tool statistics
    console.log('\nIndividual tool statistics:');
    allTools.forEach(tool => {
      const stats = tool.getStats();
      if (stats.calls > 0) {
        console.log(`  ${tool.name}: ${stats.calls} calls, ${(stats.successRate * 100).toFixed(1)}% success`);
      }
    });

    await framework.close();
    console.log('\n✅ Custom tools example completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
