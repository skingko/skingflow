/**
 * Simplified Intelligent Agent System for Testing
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { PostgresMemoryStorage } from './storage/postgres-adapter.js';
import config, { validateConfig } from './config.js';
import chalk from 'chalk';
import fetch from 'node-fetch';

/**
 * Simple Intelligent Agent Class
 */
export class SimpleIntelligentAgent {
  constructor() {
    this.memory = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log(chalk.blue('🚀 Initializing Simple Agent System...\n'));

    try {
      // Validate configuration
      validateConfig();
      console.log(chalk.green('✅ Configuration validated'));

      // Initialize memory storage
      this.memory = new PostgresMemoryStorage(config.memory.storage.config);
      await this.memory.initialize();
      console.log(chalk.green('✅ Memory system initialized'));

      this.initialized = true;
      console.log(chalk.green('🎉 Simple Agent System initialized successfully!\n'));

    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      throw error;
    }
  }

  async processQuery(query, userId = 'default') {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(chalk.blue(`\n📝 Processing query from ${userId}:`));
    console.log(chalk.white(`"${query}"\n`));

    try {
      // 1. Search memory
      console.log(chalk.blue('🧠 Searching memory...'));
      const memories = await this.searchMemory(query, userId);
      console.log(chalk.green(`✅ Found ${memories.length} relevant memories`));

      // 2. Generate response with LLM
      console.log(chalk.blue('🤖 Generating response...'));
      const response = await this.generateResponse(query, memories);
      console.log(chalk.green('✅ Response generated'));

      // 3. Store interaction
      console.log(chalk.blue('💾 Storing interaction...'));
      await this.storeInteraction(query, response, userId);
      console.log(chalk.green('✅ Interaction stored'));

      console.log(chalk.blue('\n🤖 Agent Response:'));
      console.log('-'.repeat(50));
      console.log(response);
      console.log('-'.repeat(50));

      return {
        success: true,
        userId,
        query,
        response,
        memoriesFound: memories.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(chalk.red('❌ Query processing failed:'), error.message);
      throw error;
    }
  }

  async searchMemory(query, userId) {
    if (!this.memory) return [];

    try {
      // Simple text-based search
      const memories = await this.memory.query({
        build: () => ({
          conditions: [
            { type: 'semantic_search', text: query }
          ],
          sort: { field: 'importance', order: 'desc' },
          limit: 5,
          offset: 0
        })
      });

      return memories || [];
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Memory search failed: ${error.message}`));
      return [];
    }
  }

  async generateResponse(query, memories) {
    try {
      let prompt = `你是一个智能助手。请根据以下信息回答用户的问题。\n\n`;
      
      if (memories.length > 0) {
        prompt += `相关记忆：\n`;
        memories.forEach((memory, index) => {
          prompt += `${index + 1}. ${memory.content}\n`;
        });
        prompt += `\n`;
      }
      
      prompt += `用户问题：${query}\n\n请提供有帮助的回答：`;

      const response = await fetch(`${config.llm.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.llm.apiKey}`
        },
        body: JSON.stringify({
          model: config.llm.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: config.llm.temperature,
          max_tokens: config.llm.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '抱歉，我无法生成回答。';

    } catch (error) {
      console.warn(chalk.yellow(`⚠️  LLM generation failed: ${error.message}`));
      return `抱歉，我遇到了技术问题，无法回答您的问题："${query}"`;
    }
  }

  async storeInteraction(query, response, userId) {
    if (!this.memory) return;

    try {
      await this.memory.insert({
        content: `问题: ${query}\n回答: ${response}`,
        type: 'conversation',
        category: 'interaction',
        userId: userId,
        importance: 0.7,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Memory storage failed: ${error.message}`));
    }
  }

  async close() {
    if (this.memory) {
      await this.memory.close();
    }
    this.initialized = false;
    console.log(chalk.blue('👋 Simple Agent System closed'));
  }
}

export default SimpleIntelligentAgent;
