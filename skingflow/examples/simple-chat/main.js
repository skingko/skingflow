/**
 * Simple Chat Example using skingflow Framework
 * 
 * Demonstrates basic usage of the new flexible framework
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createFramework } from '../../lib/builders/index.js';
import { PromptTemplate } from '../../lib/core/llm.js';

async function main() {
  console.log('🚀 Starting Simple Chat Example\n');

  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key: export OPENAI_API_KEY=your_key_here');
    process.exit(1);
  }

  try {
    // Create framework instance
    const framework = await createFramework({
      llm: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7
      },
      memory: {
        storage: {},
        autoEmbedding: false
      },
      tools: {
        loadBuiltin: true
      }
    });

    console.log('✅ Framework initialized successfully!');

    // Create a simple chat flow with prompt template
    const promptTemplate = new PromptTemplate(`
You are a helpful AI assistant. You have access to some basic tools and can remember our conversation.

{{#if context}}
Previous context: {{context}}
{{/if}}

User: {{input}}
Assistant:`, {
      context: 'This is our first conversation.'
    });

    const chatFlow = framework
      .createChatFlow()
      .withPrompt(promptTemplate)
      .build();

    // Test conversation
    console.log('\n💬 Starting Chat Session\n');
    console.log('=' * 50);

    // Message 1
    console.log('\n👤 User: Hello! Can you help me with math?');
    console.log('🤖 Assistant: ');
    
    let response = '';
    for await (const chunk of chatFlow.execAsyncStream({
      content: 'Hello! Can you help me with math?',
      userId: 'demo-user'
    })) {
      process.stdout.write(chunk);
      response += chunk;
    }

    // Message 2
    console.log('\n\n👤 User: What is 15 * 23?');
    console.log('🤖 Assistant: ');
    
    for await (const chunk of chatFlow.execAsyncStream({
      content: 'What is 15 * 23? Please use the calculate tool.',
      userId: 'demo-user'
    })) {
      process.stdout.write(chunk);
    }

    // Message 3 - Test memory
    console.log('\n\n👤 User: What did I ask you about earlier?');
    console.log('🤖 Assistant: ');
    
    for await (const chunk of chatFlow.execAsyncStream({
      content: 'What did I ask you about earlier?',
      userId: 'demo-user'
    })) {
      process.stdout.write(chunk);
    }

    // Show framework statistics
    console.log('\n\n📊 Framework Statistics:');
    console.log('=' * 30);
    const stats = framework.getStats();
    console.log(JSON.stringify(stats, null, 2));

    await framework.close();
    console.log('\n✅ Chat session completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
