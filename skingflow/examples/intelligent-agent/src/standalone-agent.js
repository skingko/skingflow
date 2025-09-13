/**
 * Standalone Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import pkg from 'pg';
import config, { validateConfig } from './config.js';
import chalk from 'chalk';
import fetch from 'node-fetch';

const { Pool } = pkg;

/**
 * Standalone Memory Storage
 */
class StandaloneMemoryStorage {
  constructor(config) {
    this.config = config;
    this.pool = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.pool = new Pool(this.config);
      
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      // Create schema
      await this.createSchema();
      
      this.initialized = true;
    } catch (error) {
      throw error;
    }
  }

  async createSchema() {
    const client = await this.pool.connect();
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS memories (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          importance DECIMAL(3,2) DEFAULT 0.5,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await client.query(createTableQuery);
      
      const indices = [
        'CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_memories_content ON memories USING gin(to_tsvector(\'english\', content))'
      ];
      
      for (const indexQuery of indices) {
        await client.query(indexQuery);
      }
      
    } finally {
      client.release();
    }
  }

  async insert(entry) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const query = `
        INSERT INTO memories (id, user_id, content, type, category, importance, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const values = [
        id,
        entry.userId,
        entry.content,
        entry.type || 'general',
        entry.category || 'default',
        entry.importance || 0.5,
        new Date(),
        new Date()
      ];
      
      const result = await client.query(query, values);
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async search(query, userId, limit = 5) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      const sql = `
        SELECT * FROM memories 
        WHERE user_id = $1 AND content ILIKE $2
        ORDER BY importance DESC, created_at DESC
        LIMIT $3
      `;
      
      const values = [userId, `%${query}%`, limit];
      const result = await client.query(sql, values);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        type: row.type,
        category: row.category,
        importance: parseFloat(row.importance),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
    this.initialized = false;
  }
}

/**
 * Standalone Intelligent Agent
 */
export class StandaloneIntelligentAgent {
  constructor() {
    this.memory = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log(chalk.blue('🚀 Initializing Standalone Agent System...\n'));

    try {
      validateConfig();
      console.log(chalk.green('✅ Configuration validated'));

      this.memory = new StandaloneMemoryStorage(config.memory.storage.config);
      await this.memory.initialize();
      console.log(chalk.green('✅ Memory system initialized'));

      this.initialized = true;
      console.log(chalk.green('🎉 Standalone Agent System initialized!\n'));

    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
      throw error;
    }
  }

  async processQuery(query, userId = 'default') {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(chalk.blue(`\n📝 Processing: "${query}"`));
    console.log(chalk.gray(`👤 User: ${userId}\n`));

    const startTime = Date.now();

    try {
      // 1. Search memory
      console.log(chalk.cyan('🧠 Searching memory...'));
      const memories = await this.memory.search(query, userId);
      console.log(chalk.green(`   Found ${memories.length} memories`));

      // 2. Generate response
      console.log(chalk.cyan('🤖 Generating response...'));
      const response = await this.generateResponse(query, memories);
      console.log(chalk.green('   Response generated'));

      // 3. Store interaction
      console.log(chalk.cyan('💾 Storing interaction...'));
      await this.memory.insert({
        content: `Q: ${query}\nA: ${response}`,
        type: 'conversation',
        category: 'interaction',
        userId: userId,
        importance: 0.7
      });
      console.log(chalk.green('   Interaction stored'));

      const duration = Date.now() - startTime;

      // Display response
      console.log('\n' + '='.repeat(60));
      console.log(chalk.blue('🤖 Agent Response:'));
      console.log('='.repeat(60));
      console.log(chalk.white(response));
      console.log('='.repeat(60));
      console.log(chalk.gray(`⏱️  Processing time: ${duration}ms\n`));

      return {
        success: true,
        userId,
        query,
        response,
        memoriesFound: memories.length,
        processingTime: duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(chalk.red('❌ Processing failed:'), error.message);
      throw error;
    }
  }

  async generateResponse(query, memories) {
    try {
      let prompt = `你是一个智能助手，请根据提供的信息回答用户问题。\n\n`;
      
      if (memories.length > 0) {
        prompt += `相关记忆：\n`;
        memories.forEach((memory, index) => {
          prompt += `${index + 1}. ${memory.content}\n`;
        });
        prompt += `\n`;
      }
      
      prompt += `用户问题：${query}\n\n请提供详细、有帮助的回答：`;

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
          temperature: config.llm.temperature || 0.7,
          max_tokens: config.llm.maxTokens || 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '抱歉，我无法生成回答。';

    } catch (error) {
      console.warn(chalk.yellow(`⚠️  LLM error: ${error.message}`));
      
      // Fallback response
      if (query.includes('计算') || query.includes('数学')) {
        const numbers = query.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          const num1 = parseInt(numbers[0]);
          const num2 = parseInt(numbers[1]);
          if (query.includes('+')) {
            return `根据您的问题，${num1} + ${num2} = ${num1 + num2}`;
          }
          if (query.includes('*')) {
            return `根据您的问题，${num1} * ${num2} = ${num1 * num2}`;
          }
        }
      }
      
      return `我理解您的问题是："${query}"。虽然我遇到了一些技术问题，但我会尽力帮助您。如果这是数学问题，请明确指出运算符号。如果是其他问题，我建议您稍后再试。`;
    }
  }

  async getMemoryStats(userId) {
    if (!this.memory) return null;

    try {
      const client = await this.memory.pool.connect();
      const result = await client.query(
        'SELECT COUNT(*) as total FROM memories WHERE user_id = $1',
        [userId]
      );
      client.release();
      
      return {
        totalMemories: parseInt(result.rows[0].total),
        userId
      };
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Stats error: ${error.message}`));
      return null;
    }
  }

  async close() {
    if (this.memory) {
      await this.memory.close();
    }
    this.initialized = false;
    console.log(chalk.blue('👋 Standalone Agent closed'));
  }
}

export default StandaloneIntelligentAgent;
