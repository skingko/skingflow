# Quick Start Guide

Get up and running with skingflow in just a few minutes! This guide will walk you through creating your first AI-powered application using the framework.

## 📋 Prerequisites

- Node.js 18+ installed
- An OpenAI API key (or other LLM provider)
- Basic knowledge of JavaScript/TypeScript

## 🚀 Installation

### Option 1: NPM

```bash
npm install skingflow
```

### Option 2: Yarn

```bash
yarn add skingflow
```

### Option 3: Clone Examples

```bash
git clone https://github.com/skingko/skingflow.git
cd skingflow/examples
npm install
```

## ⚡ 5-Minute Tutorial

### Step 1: Set Up Environment

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 2: Create Your First Chat Bot

Create `app.js`:

```javascript
import { createFramework } from 'skingflow';

async function main() {
  // Create framework instance
  const framework = await createFramework({
    llm: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7
    }
  });

  // Create a chat flow
  const chatFlow = framework.createChatFlow().build();

  // Chat with the AI
  console.log('🤖 AI Assistant ready! Ask me anything...\n');

  for await (const chunk of chatFlow.execAsyncStream({
    content: 'Hello! Can you explain what you can do?',
    userId: 'user-123'
  })) {
    process.stdout.write(chunk);
  }

  await framework.close();
}

main().catch(console.error);
```

### Step 3: Run Your App

```bash
node app.js
```

You should see streaming AI responses! 🎉

## 🧠 Add Memory (Optional)

Enhance your bot with memory capabilities:

```javascript
import { createFramework } from 'skingflow';

async function main() {
  const framework = await createFramework({
    llm: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY
    },
    // Add memory system
    memory: {
      storage: {}, // In-memory storage
      autoEmbedding: false
    }
  });

  const chatFlow = framework.createChatFlow().build();

  // First conversation
  console.log('👤 User: Hi, my name is Alice and I love pizza.');
  console.log('🤖 Assistant: ');
  
  for await (const chunk of chatFlow.execAsyncStream({
    content: 'Hi, my name is Alice and I love pizza.',
    userId: 'alice'
  })) {
    process.stdout.write(chunk);
  }

  // Second conversation - AI remembers!
  console.log('\n\n👤 User: What do you remember about me?');
  console.log('🤖 Assistant: ');
  
  for await (const chunk of chatFlow.execAsyncStream({
    content: 'What do you remember about me?',
    userId: 'alice'
  })) {
    process.stdout.write(chunk);
  }

  await framework.close();
}
```

## 🔧 Add Tools (Optional)

Give your AI access to tools:

```javascript
import { createFramework } from 'skingflow';

async function main() {
  const framework = await createFramework({
    llm: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY
    },
    tools: {
      loadBuiltin: true, // Includes calculator, datetime, etc.
      custom: [
        {
          type: 'function',
          name: 'get_joke',
          description: 'Get a random joke',
          implementation: async () => {
            const jokes = [
              "Why don't scientists trust atoms? Because they make up everything!",
              "Why did the scarecrow win an award? He was outstanding in his field!",
              "Why don't eggs tell jokes? They'd crack each other up!"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
          },
          parameters: {}
        }
      ]
    }
  });

  const chatFlow = framework.createChatFlow().build();

  console.log('👤 User: Tell me a joke and calculate 15 * 23');
  console.log('🤖 Assistant: ');
  
  for await (const chunk of chatFlow.execAsyncStream({
    content: 'Tell me a joke and then calculate 15 * 23',
    userId: 'user-123'
  })) {
    process.stdout.write(chunk);
  }

  await framework.close();
}
```

## 🎭 Advanced: Flow Orchestration

Create complex workflows:

```javascript
import { createFramework } from 'skingflow';
import { AsyncNode } from 'skingflow/skingflow.js';

// Custom processing node
class DataProcessor extends AsyncNode {
  async *execAsyncStream(shared) {
    yield 'Processing data...\n';
    shared.processedData = `Processed: ${shared.input}`;
    yield `Result: ${shared.processedData}\n`;
  }
}

async function main() {
  const framework = await createFramework({
    llm: {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY
    }
  });

  // Create orchestrated flow
  const orchestration = framework
    .createOrchestration()
    .addStep(new DataProcessor(), { name: 'Process Input' })
    .addStep(framework.createChatFlow().build(), { name: 'AI Analysis' })
    .build();

  console.log('🎭 Running orchestrated workflow...\n');

  for await (const chunk of orchestration.execAsyncStream({
    input: 'User feedback data',
    content: 'Analyze the processed data and provide insights'
  })) {
    process.stdout.write(chunk);
  }

  await framework.close();
}
```

## 🌟 What's Next?

Congratulations! You've created your first skingflow application. Here's what to explore next:

### 📚 Learn More
- [Core Concepts](./core-concepts.md) - Understand the framework fundamentals
- [LLM System](./llm-system.md) - Master multi-provider LLM integration
- [Memory System](./memory-system.md) - Build applications with long-term memory
- [Tool System](./tools-system.md) - Create and integrate custom tools

### 🔧 Practical Examples
- [Simple Chat Bot](./examples/simple-chat.md) - Basic conversational AI
- [Memory-Enhanced Chat](./examples/memory-chat.md) - Chat with persistent memory
- [Tool-Enabled Assistant](./examples/tool-assistant.md) - AI with external capabilities
- [Complex Orchestration](./examples/orchestration.md) - Multi-step workflows

### 🚀 Advanced Topics
- [Custom Providers](./custom-providers.md) - Integrate any LLM
- [Custom Storage](./custom-storage.md) - Use your preferred database
- [Flow Patterns](./flow-patterns.md) - Architectural best practices

## 🆘 Getting Help

### Common Issues

**Q: "Module not found" error**
A: Make sure you're using Node.js 18+ and have installed skingflow properly.

**Q: LLM requests failing**
A: Check your API key and network connection. Verify the key has proper permissions.

**Q: Streaming not working**
A: Ensure you're using `for await` loops and async generators properly.

### Support Channels

- **Documentation**: [Full documentation](./README.md)
- **Examples**: [GitHub examples](../examples/)
- **Issues**: [GitHub issues](https://github.com/skingko/skingflow/issues)
- **Discord**: [Community chat](https://discord.gg/skingflow)

## 💡 Tips for Success

1. **Start Simple**: Begin with basic chat flows before adding complexity
2. **Use Streaming**: Leverage the framework's streaming capabilities for better UX
3. **Handle Errors**: Always wrap LLM calls in try-catch blocks
4. **Monitor Usage**: Keep track of API usage and costs
5. **Test Thoroughly**: Test with various inputs and edge cases
6. **Read Examples**: The examples/ directory has many practical implementations

---

Ready to build something amazing? Let's go! 🚀
