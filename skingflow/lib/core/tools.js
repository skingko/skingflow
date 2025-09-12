/**
 * Unified Tool System for skingflow
 * 
 * Supports custom tools (XML/YAML), function calls, and MCP integration
 * Provides a unified interface for all tool types
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import { AsyncNode } from '../../skingflow.js';

/**
 * Tool Definition Schema
 */
export class ToolDefinition {
  constructor(data = {}) {
    this.name = data.name || '';
    this.description = data.description || '';
    this.parameters = data.parameters || {};
    this.returns = data.returns || {};
    this.category = data.category || 'general';
    this.tags = data.tags || [];
    this.examples = data.examples || [];
    this.metadata = data.metadata || {};
    this.version = data.version || '1.0.0';
    this.author = data.author || '';
    this.license = data.license || '';
    this.deprecated = data.deprecated || false;
    this.experimental = data.experimental || false;
  }

  /**
   * Load tool definition from XML
   */
  static fromXML(xmlString) {
    // Simple XML parser - in production, use a proper XML library
    const parseXML = (xml) => {
      const result = {};
      
      // Extract basic fields
      const nameMatch = xml.match(/<name>(.*?)<\/name>/);
      if (nameMatch) result.name = nameMatch[1];
      
      const descMatch = xml.match(/<description>(.*?)<\/description>/s);
      if (descMatch) result.description = descMatch[1].trim();
      
      const categoryMatch = xml.match(/<category>(.*?)<\/category>/);
      if (categoryMatch) result.category = categoryMatch[1];
      
      // Extract parameters
      const paramsMatch = xml.match(/<parameters>(.*?)<\/parameters>/s);
      if (paramsMatch) {
        result.parameters = {};
        const paramMatches = paramsMatch[1].match(/<param name="([^"]+)" type="([^"]+)"[^>]*>(.*?)<\/param>/gs);
        if (paramMatches) {
          paramMatches.forEach(paramMatch => {
            const [, name, type, desc] = paramMatch.match(/<param name="([^"]+)" type="([^"]+)"[^>]*>(.*?)<\/param>/s);
            const required = paramMatch.includes('required="true"');
            result.parameters[name] = {
              type,
              description: desc.trim(),
              required
            };
          });
        }
      }
      
      // Extract examples
      const examplesMatch = xml.match(/<examples>(.*?)<\/examples>/s);
      if (examplesMatch) {
        result.examples = [];
        const exampleMatches = examplesMatch[1].match(/<example>(.*?)<\/example>/gs);
        if (exampleMatches) {
          exampleMatches.forEach(exampleMatch => {
            const content = exampleMatch.match(/<example>(.*?)<\/example>/s)[1].trim();
            result.examples.push(content);
          });
        }
      }
      
      return result;
    };
    
    return new ToolDefinition(parseXML(xmlString));
  }

  /**
   * Load tool definition from YAML
   */
  static async fromYAML(yamlString) {
    const yaml = await import('yaml');
    const data = yaml.parse(yamlString);
    return new ToolDefinition(data);
  }

  /**
   * Load tool definition from file
   */
  static async fromFile(filePath) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.xml') {
      return ToolDefinition.fromXML(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      return await ToolDefinition.fromYAML(content);
    } else if (ext === '.json') {
      return new ToolDefinition(JSON.parse(content));
    } else {
      throw new Error(`Unsupported tool definition format: ${ext}`);
    }
  }

  /**
   * Convert to OpenAI function format
   */
  toOpenAIFunction() {
    const properties = {};
    const required = [];
    
    for (const [name, param] of Object.entries(this.parameters)) {
      properties[name] = {
        type: param.type,
        description: param.description
      };
      
      if (param.enum) properties[name].enum = param.enum;
      if (param.required) required.push(name);
    }
    
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties,
          required
        }
      }
    };
  }

  /**
   * Validate parameters against schema
   */
  validateParameters(params) {
    const errors = [];
    
    // Check required parameters
    for (const [name, param] of Object.entries(this.parameters)) {
      if (param.required && !(name in params)) {
        errors.push(`Missing required parameter: ${name}`);
      }
    }
    
    // Check parameter types
    for (const [name, value] of Object.entries(params)) {
      const param = this.parameters[name];
      if (!param) {
        errors.push(`Unknown parameter: ${name}`);
        continue;
      }
      
      const actualType = typeof value;
      const expectedType = param.type;
      
      if (expectedType === 'array' && !Array.isArray(value)) {
        errors.push(`Parameter ${name} must be an array`);
      } else if (expectedType !== 'any' && expectedType !== actualType && !(expectedType === 'array')) {
        errors.push(`Parameter ${name} must be of type ${expectedType}, got ${actualType}`);
      }
      
      if (param.enum && !param.enum.includes(value)) {
        errors.push(`Parameter ${name} must be one of: ${param.enum.join(', ')}`);
      }
    }
    
    return errors;
  }
}

/**
 * Abstract Tool Interface
 */
export class Tool extends EventEmitter {
  constructor(definition, implementation) {
    super();
    this.definition = definition instanceof ToolDefinition ? definition : new ToolDefinition(definition);
    this.implementation = implementation;
    this.stats = {
      calls: 0,
      successes: 0,
      failures: 0,
      totalTime: 0
    };
  }

  get name() {
    return this.definition.name;
  }

  get description() {
    return this.definition.description;
  }

  async execute(parameters = {}) {
    const startTime = Date.now();
    this.stats.calls++;
    
    try {
      // Validate parameters
      const errors = this.definition.validateParameters(parameters);
      if (errors.length > 0) {
        throw new Error(`Parameter validation failed: ${errors.join(', ')}`);
      }
      
      // Execute tool
      const result = await this._execute(parameters);
      
      this.stats.successes++;
      this.stats.totalTime += Date.now() - startTime;
      
      this.emit('executed', { parameters, result, duration: Date.now() - startTime });
      return result;
    } catch (error) {
      this.stats.failures++;
      this.emit('error', { parameters, error, duration: Date.now() - startTime });
      throw error;
    }
  }

  async _execute(parameters) {
    if (typeof this.implementation === 'function') {
      return await this.implementation(parameters);
    } else {
      throw new Error('Tool implementation not provided');
    }
  }

  getStats() {
    const avgTime = this.stats.calls > 0 ? this.stats.totalTime / this.stats.calls : 0;
    const successRate = this.stats.calls > 0 ? this.stats.successes / this.stats.calls : 0;
    
    return {
      ...this.stats,
      averageTime: avgTime,
      successRate
    };
  }
}

/**
 * Function Call Tool - wraps JavaScript functions
 */
export class FunctionTool extends Tool {
  constructor(name, func, options = {}) {
    const definition = new ToolDefinition({
      name,
      description: options.description || `Function: ${name}`,
      parameters: options.parameters || {},
      category: options.category || 'function',
      ...options
    });
    
    super(definition, func);
  }

  static fromFunction(func, options = {}) {
    const name = options.name || func.name || 'anonymous';
    return new FunctionTool(name, func, options);
  }
}

/**
 * MCP Tool - integrates with Model Context Protocol
 */
export class MCPTool extends Tool {
  constructor(definition, mcpClient, mcpToolName = null) {
    super(definition);
    this.mcpClient = mcpClient;
    this.mcpToolName = mcpToolName || definition.name;
  }

  async _execute(parameters) {
    if (!this.mcpClient) {
      throw new Error('MCP client not available');
    }
    
    return await this.mcpClient.callTool(this.mcpToolName, parameters);
  }

  static fromMCPTool(mcpClient, toolInfo) {
    const definition = new ToolDefinition({
      name: toolInfo.name,
      description: toolInfo.description,
      parameters: toolInfo.inputSchema?.properties || {},
      category: 'mcp'
    });
    
    return new MCPTool(definition, mcpClient, toolInfo.name);
  }
}

/**
 * HTTP Tool - calls external HTTP APIs
 */
export class HTTPTool extends Tool {
  constructor(definition, config) {
    super(definition);
    this.config = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      ...config
    };
  }

  async _execute(parameters) {
    const { url, method, headers, timeout } = this.config;
    
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(parameters) : undefined,
      signal: AbortSignal.timeout(timeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }
}

/**
 * Tool Registry - manages all available tools
 */
export class ToolRegistry extends EventEmitter {
  constructor() {
    super();
    this.tools = new Map();
    this.categories = new Map();
    this.tags = new Map();
  }

  /**
   * Register a tool
   */
  register(tool) {
    if (!(tool instanceof Tool)) {
      throw new Error('Tool must be an instance of Tool class');
    }
    
    this.tools.set(tool.name, tool);
    
    // Update category index
    const category = tool.definition.category;
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category).add(tool.name);
    
    // Update tag index
    for (const tag of tool.definition.tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag).add(tool.name);
    }
    
    this.emit('registered', tool);
    return tool;
  }

  /**
   * Unregister a tool
   */
  unregister(name) {
    const tool = this.tools.get(name);
    if (!tool) return false;
    
    this.tools.delete(name);
    
    // Remove from indices
    this.categories.get(tool.definition.category)?.delete(name);
    for (const tag of tool.definition.tags) {
      this.tags.get(tag)?.delete(name);
    }
    
    this.emit('unregistered', tool);
    return true;
  }

  /**
   * Get tool by name
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAll() {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category) {
    const toolNames = this.categories.get(category) || new Set();
    return Array.from(toolNames).map(name => this.tools.get(name));
  }

  /**
   * Get tools by tag
   */
  getByTag(tag) {
    const toolNames = this.tags.get(tag) || new Set();
    return Array.from(toolNames).map(name => this.tools.get(name));
  }

  /**
   * Search tools
   */
  search(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const tool of this.tools.values()) {
      let score = 0;
      
      // Check name match
      if (tool.name.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Check description match
      if (tool.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Check category match
      if (tool.definition.category.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      
      // Check tag matches
      for (const tag of tool.definition.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 2;
        }
      }
      
      if (score > 0) {
        results.push({ tool, score });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.tool);
  }

  /**
   * Execute tool by name
   */
  async execute(name, parameters = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    return await tool.execute(parameters);
  }

  /**
   * Get OpenAI function definitions for all tools
   */
  getOpenAIFunctions() {
    return this.getAll().map(tool => tool.definition.toOpenAIFunction());
  }

  /**
   * Load tools from directory
   */
  async loadFromDirectory(dirPath) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const files = await fs.readdir(dirPath);
      const toolFiles = files.filter(file => 
        file.endsWith('.xml') || 
        file.endsWith('.yaml') || 
        file.endsWith('.yml') || 
        file.endsWith('.json')
      );
      
      for (const file of toolFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const definition = await ToolDefinition.fromFile(filePath);
          
          // Look for corresponding implementation file
          const baseName = path.basename(file, path.extname(file));
          const implPath = path.join(dirPath, `${baseName}.js`);
          
          try {
            const impl = await import(implPath);
            const tool = new Tool(definition, impl.default || impl[definition.name]);
            this.register(tool);
          } catch (implError) {
            console.warn(`Implementation not found for tool ${definition.name}: ${implPath}`);
          }
        } catch (error) {
          console.warn(`Failed to load tool from ${file}:`, error.message);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load tools from directory: ${error.message}`);
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const tools = this.getAll();
    const totalStats = tools.reduce((acc, tool) => {
      const stats = tool.getStats();
      acc.totalCalls += stats.calls;
      acc.totalSuccesses += stats.successes;
      acc.totalFailures += stats.failures;
      acc.totalTime += stats.totalTime;
      return acc;
    }, { totalCalls: 0, totalSuccesses: 0, totalFailures: 0, totalTime: 0 });
    
    const categories = {};
    for (const [category, toolNames] of this.categories) {
      categories[category] = toolNames.size;
    }
    
    return {
      totalTools: tools.length,
      categories,
      totalCalls: totalStats.totalCalls,
      successRate: totalStats.totalCalls > 0 ? totalStats.totalSuccesses / totalStats.totalCalls : 0,
      averageTime: totalStats.totalCalls > 0 ? totalStats.totalTime / totalStats.totalCalls : 0
    };
  }

  async close() {
    this.tools.clear();
    this.categories.clear();
    this.tags.clear();
    this.emit('closed');
  }
}

/**
 * Tool Execution Node for skingflow integration
 */
export class ToolNode extends AsyncNode {
  constructor(toolRegistry, options = {}) {
    super(options);
    this.registry = toolRegistry;
    this.options = options;
  }

  async prepAsync(shared) {
    const action = shared.action || shared.toolAction || 'execute';
    const toolName = shared.tool || shared.toolName || '';
    const parameters = shared.parameters || shared.args || {};
    
    return {
      action,
      toolName,
      parameters,
      context: shared
    };
  }

  async *execAsyncStream(prepRes) {
    try {
      switch (prepRes.action) {
        case 'execute':
          if (!prepRes.toolName) {
            yield 'Error: No tool name specified\n';
            return;
          }
          
          yield `Executing tool: ${prepRes.toolName}\n`;
          const result = await this.registry.execute(prepRes.toolName, prepRes.parameters);
          
          if (typeof result === 'string') {
            yield result;
          } else {
            yield JSON.stringify(result, null, 2);
          }
          break;
          
        case 'list':
          yield 'Available tools:\n';
          const tools = this.registry.getAll();
          for (const tool of tools) {
            yield `- ${tool.name}: ${tool.description}\n`;
          }
          break;
          
        case 'search':
          const query = prepRes.parameters.query || prepRes.toolName;
          yield `Searching tools for: ${query}\n`;
          const searchResults = this.registry.search(query);
          
          if (searchResults.length === 0) {
            yield 'No tools found\n';
          } else {
            for (const tool of searchResults) {
              yield `- ${tool.name}: ${tool.description}\n`;
            }
          }
          break;
          
        case 'stats':
          yield 'Tool registry statistics:\n';
          const stats = this.registry.getStats();
          yield `Total tools: ${stats.totalTools}\n`;
          yield `Total calls: ${stats.totalCalls}\n`;
          yield `Success rate: ${(stats.successRate * 100).toFixed(1)}%\n`;
          break;
          
        default:
          yield `Unknown tool action: ${prepRes.action}\n`;
      }
    } catch (error) {
      yield `Tool error: ${error.message}\n`;
      throw error;
    }
  }

  async postAsync(shared, prepRes, execRes) {
    shared.toolActionComplete = true;
    return 'completed';
  }
}

// Convenience functions
export const createTool = (definition, implementation) => new Tool(definition, implementation);
export const createFunctionTool = (name, func, options) => new FunctionTool(name, func, options);
export const createToolRegistry = () => new ToolRegistry();

// Built-in tools
export const BuiltinTools = {
  /**
   * Echo tool - returns input as output
   */
  echo: new FunctionTool('echo', 
    async (params) => params.text || '',
    {
      description: 'Echo the input text back as output',
      parameters: {
        text: { type: 'string', description: 'Text to echo', required: true }
      }
    }
  ),

  /**
   * Math tool - perform basic calculations
   */
  calculate: new FunctionTool('calculate',
    async (params) => {
      try {
        // Simple and safe math evaluation
        const result = Function(`"use strict"; return (${params.expression})`)();
        return { result, expression: params.expression };
      } catch (error) {
        throw new Error(`Invalid math expression: ${error.message}`);
      }
    },
    {
      description: 'Perform basic mathematical calculations',
      parameters: {
        expression: { type: 'string', description: 'Mathematical expression to evaluate', required: true }
      }
    }
  ),

  /**
   * Date tool - get current date/time
   */
  datetime: new FunctionTool('datetime',
    async (params) => {
      const now = new Date();
      const format = params.format || 'iso';
      
      switch (format) {
        case 'iso':
          return now.toISOString();
        case 'local':
          return now.toLocaleString();
        case 'date':
          return now.toDateString();
        case 'time':
          return now.toTimeString();
        case 'timestamp':
          return now.getTime();
        default:
          return now.toISOString();
      }
    },
    {
      description: 'Get current date and time in various formats',
      parameters: {
        format: { 
          type: 'string', 
          description: 'Output format', 
          enum: ['iso', 'local', 'date', 'time', 'timestamp'],
          required: false 
        }
      }
    }
  )
};

export default ToolRegistry;
