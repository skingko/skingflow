/**
 * LLM Abstraction Layer for skingflow
 * 
 * Provides unified interface for any LLM provider with streaming support
 * Supports flexible prompt templates and model parameter configuration
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import { AsyncNode } from '../../skingflow.js';

/**
 * LLM Configuration Schema
 */
export class LLMConfig {
  constructor(options = {}) {
    this.provider = options.provider || 'openai';
    this.model = options.model || 'gpt-3.5-turbo';
    this.baseUrl = options.baseUrl || null;
    this.apiKey = options.apiKey || null;
    this.headers = options.headers || {};
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    
    // Model parameters
    this.parameters = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
      topP: options.topP || 1.0,
      frequencyPenalty: options.frequencyPenalty || 0,
      presencePenalty: options.presencePenalty || 0,
      stop: options.stop || null,
      stream: options.stream !== false,
      ...options.parameters
    };
    
    // Custom configuration for specific providers
    this.custom = options.custom || {};
  }
}

/**
 * Prompt Template System
 */
export class PromptTemplate {
  constructor(template, variables = {}) {
    this.template = template;
    this.variables = variables;
    this.compiled = null;
  }

  /**
   * Compile template with variables
   */
  compile(context = {}) {
    const allVars = { ...this.variables, ...context };
    let compiled = this.template;
    
    // Replace variables in format {{variable}}
    for (const [key, value] of Object.entries(allVars)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      compiled = compiled.replace(regex, String(value));
    }
    
    this.compiled = compiled;
    return compiled;
  }

  /**
   * Create from YAML/JSON configuration
   */
  static fromConfig(config) {
    if (typeof config === 'string') {
      return new PromptTemplate(config);
    }
    
    return new PromptTemplate(config.template || '', config.variables || {});
  }

  /**
   * Load from file
   */
  static async fromFile(filePath) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.json') {
      const config = JSON.parse(content);
      return PromptTemplate.fromConfig(config);
    } else if (ext === '.yaml' || ext === '.yml') {
      const yaml = await import('yaml');
      const config = yaml.parse(content);
      return PromptTemplate.fromConfig(config);
    } else {
      return new PromptTemplate(content);
    }
  }
}

/**
 * Abstract LLM Provider Interface
 */
export class LLMProvider extends EventEmitter {
  constructor(config) {
    super();
    this.config = config instanceof LLMConfig ? config : new LLMConfig(config);
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    throw new Error('initialize() must be implemented by provider');
  }

  async *stream(messages, options = {}) {
    throw new Error('stream() must be implemented by provider');
  }

  async complete(messages, options = {}) {
    const chunks = [];
    for await (const chunk of this.stream(messages, options)) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }

  async close() {
    this.initialized = false;
  }

  // Utility methods for message formatting
  formatMessages(messages) {
    if (typeof messages === 'string') {
      return [{ role: 'user', content: messages }];
    }
    return Array.isArray(messages) ? messages : [messages];
  }

  mergeOptions(options) {
    return {
      ...this.config.parameters,
      ...options
    };
  }
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider extends LLMProvider {
  async initialize() {
    if (this.initialized) return;
    
    const { OpenAI } = await import('openai');
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      defaultHeaders: this.config.headers,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    });
    
    this.initialized = true;
  }

  async *stream(messages, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const params = {
      model: this.config.model,
      messages: this.formatMessages(messages),
      stream: true,
      ...this.mergeOptions(options)
    };

    try {
      const stream = await this.client.chat.completions.create(params);
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield delta.content;
        }
        
        // Handle function calls
        if (delta?.tool_calls) {
          yield { type: 'tool_calls', content: delta.tool_calls };
        }
      }
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

/**
 * Anthropic Provider
 */
export class AnthropicProvider extends LLMProvider {
  async initialize() {
    if (this.initialized) return;
    
    const { Anthropic } = await import('@anthropic-ai/sdk');
    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      defaultHeaders: this.config.headers,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    });
    
    this.initialized = true;
  }

  async *stream(messages, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const formattedMessages = this.formatMessages(messages);
    const systemMessage = formattedMessages.find(m => m.role === 'system');
    const userMessages = formattedMessages.filter(m => m.role !== 'system');
    
    const params = {
      model: this.config.model,
      messages: userMessages,
      max_tokens: this.config.parameters.maxTokens,
      stream: true,
      ...this.mergeOptions(options)
    };
    
    if (systemMessage) {
      params.system = systemMessage.content;
    }

    try {
      const stream = await this.client.messages.create(params);
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          yield chunk.delta.text || '';
        }
      }
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

/**
 * Generic HTTP Provider for custom APIs
 */
export class HTTPProvider extends LLMProvider {
  async initialize() {
    if (this.initialized) return;
    
    if (!this.config.baseUrl) {
      throw new Error('baseUrl is required for HTTP provider');
    }
    
    this.initialized = true;
  }

  async *stream(messages, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const payload = {
      model: this.config.model,
      messages: this.formatMessages(messages),
      stream: true,
      ...this.mergeOptions(options),
      ...this.config.custom
    };

    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = this._extractContent(parsed);
              if (content) yield content;
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  _extractContent(data) {
    // Override this method for custom content extraction
    return data.choices?.[0]?.delta?.content || 
           data.content || 
           data.text || 
           '';
  }
}

/**
 * Ollama Provider
 */
export class OllamaProvider extends HTTPProvider {
  constructor(config) {
    super({
      ...config,
      baseUrl: config.baseUrl || 'http://localhost:11434/api/chat'
    });
  }

  _extractContent(data) {
    return data.message?.content || '';
  }
}

/**
 * LLM Factory for creating providers
 */
export class LLMFactory {
  static providers = new Map([
    ['openai', OpenAIProvider],
    ['anthropic', AnthropicProvider],
    ['http', HTTPProvider],
    ['ollama', OllamaProvider]
  ]);

  static registerProvider(name, providerClass) {
    this.providers.set(name, providerClass);
  }

  static create(config) {
    const llmConfig = config instanceof LLMConfig ? config : new LLMConfig(config);
    const ProviderClass = this.providers.get(llmConfig.provider);
    
    if (!ProviderClass) {
      throw new Error(`Unknown LLM provider: ${llmConfig.provider}`);
    }
    
    return new ProviderClass(llmConfig);
  }

  static async createFromConfig(configPath) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const content = await fs.readFile(configPath, 'utf-8');
    const ext = path.extname(configPath).toLowerCase();
    
    let config;
    if (ext === '.json') {
      config = JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      const yaml = await import('yaml');
      config = yaml.parse(content);
    } else {
      throw new Error('Unsupported config file format. Use JSON or YAML.');
    }
    
    return this.create(config);
  }
}

/**
 * LLM Node for skingflow integration
 */
export class LLMNode extends AsyncNode {
  constructor(llmProvider, promptTemplate = null, options = {}) {
    super(options);
    this.llm = llmProvider;
    this.promptTemplate = promptTemplate;
    this.options = options;
  }

  async prepAsync(shared) {
    if (!this.llm.initialized) {
      await this.llm.initialize();
    }

    let messages = shared.messages || shared.prompt || shared.content || '';
    
    // Apply prompt template if provided
    if (this.promptTemplate && typeof messages === 'string') {
      messages = this.promptTemplate.compile({
        ...shared,
        input: messages
      });
    }

    return {
      messages,
      options: { ...this.options, ...shared.llmOptions },
      context: shared
    };
  }

  async *execAsyncStream(prepRes) {
    try {
      for await (const chunk of this.llm.stream(prepRes.messages, prepRes.options)) {
        if (typeof chunk === 'string') {
          yield chunk;
        } else {
          // Handle structured responses (tool calls, etc.)
          yield JSON.stringify(chunk);
        }
      }
    } catch (error) {
      yield `Error: ${error.message}`;
      throw error;
    }
  }

  async postAsync(shared, prepRes, execRes) {
    shared.llmResponse = execRes;
    return 'completed';
  }
}

// Convenience functions
export const createLLM = (config) => LLMFactory.create(config);
export const createLLMNode = (config, promptTemplate, options) => {
  const llm = createLLM(config);
  return new LLMNode(llm, promptTemplate, options);
};

export default LLMFactory;
