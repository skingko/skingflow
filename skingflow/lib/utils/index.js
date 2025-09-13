/**
 * Utility Functions for skingflow Framework
 * 
 * Provides helper functions and utilities for common framework operations
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';

/**
 * Configuration utilities
 */
export class ConfigUtils {
  /**
   * Load configuration from file
   */
  static async loadConfig(filePath, defaults = {}) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      let config;
      if (ext === '.json') {
        config = JSON.parse(content);
      } else if (ext === '.yaml' || ext === '.yml') {
        const yaml = await import('yaml');
        config = yaml.parse(content);
      } else {
        throw new Error(`Unsupported config format: ${ext}`);
      }
      
      return this.mergeConfig(defaults, config);
    } catch (error) {
      console.warn(`Failed to load config from ${filePath}:`, error.message);
      return defaults;
    }
  }

  /**
   * Merge configuration objects deeply
   */
  static mergeConfig(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Validate configuration against schema
   */
  static validateConfig(config, schema) {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = config[key];
      
      if (rules.required && value === undefined) {
        errors.push(`Missing required config: ${key}`);
        continue;
      }
      
      if (value !== undefined) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`Config ${key} must be of type ${rules.type}, got ${typeof value}`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`Config ${key} must be one of: ${rules.enum.join(', ')}`);
        }
        
        if (rules.validate && !rules.validate(value)) {
          errors.push(`Config ${key} failed validation`);
        }
      }
    }
    
    return errors;
  }

  /**
   * Get environment configuration
   */
  static getEnvConfig(prefix = 'SKINGFLOW_') {
    const config = {};
    
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key
          .slice(prefix.length)
          .toLowerCase()
          .replace(/_/g, '.');
        
        // Try to parse as JSON, fallback to string
        try {
          config[configKey] = JSON.parse(value);
        } catch {
          config[configKey] = value;
        }
      }
    }
    
    return config;
  }
}

/**
 * Logging utilities
 */
export class Logger extends EventEmitter {
  constructor(options = {}) {
    super();
    this.level = options.level || 'info';
    this.prefix = options.prefix || '[SKINGFLOW]';
    this.colors = options.colors !== false;
    this.timestamp = options.timestamp !== false;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[37m',
      trace: '\x1b[90m',
      reset: '\x1b[0m'
    };
  }

  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  _formatMessage(level, message, ...args) {
    let formatted = '';
    
    if (this.timestamp) {
      formatted += `[${new Date().toISOString()}] `;
    }
    
    if (this.colors && this.colors[level]) {
      formatted += this.colors[level];
    }
    
    formatted += `${this.prefix} ${level.toUpperCase()}: ${message}`;
    
    if (args.length > 0) {
      formatted += ' ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
    }
    
    if (this.colors && this.colors.reset) {
      formatted += this.colors.reset;
    }
    
    return formatted;
  }

  error(message, ...args) {
    if (this._shouldLog('error')) {
      const formatted = this._formatMessage('error', message, ...args);
      console.error(formatted);
      this.emit('log', { level: 'error', message, args, formatted });
    }
  }

  warn(message, ...args) {
    if (this._shouldLog('warn')) {
      const formatted = this._formatMessage('warn', message, ...args);
      console.warn(formatted);
      this.emit('log', { level: 'warn', message, args, formatted });
    }
  }

  info(message, ...args) {
    if (this._shouldLog('info')) {
      const formatted = this._formatMessage('info', message, ...args);
      console.log(formatted);
      this.emit('log', { level: 'info', message, args, formatted });
    }
  }

  debug(message, ...args) {
    if (this._shouldLog('debug')) {
      const formatted = this._formatMessage('debug', message, ...args);
      console.log(formatted);
      this.emit('log', { level: 'debug', message, args, formatted });
    }
  }

  trace(message, ...args) {
    if (this._shouldLog('trace')) {
      const formatted = this._formatMessage('trace', message, ...args);
      console.log(formatted);
      this.emit('log', { level: 'trace', message, args, formatted });
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
  }

  /**
   * Start timing an operation
   */
  startTimer(name) {
    this.timers.set(name, Date.now());
  }

  /**
   * End timing an operation
   */
  endTimer(name) {
    const startTime = this.timers.get(name);
    if (!startTime) return null;
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    // Update metrics
    const metric = this.metrics.get(name) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0
    };
    
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.avgTime = metric.totalTime / metric.count;
    
    this.metrics.set(name, metric);
    return duration;
  }

  /**
   * Record a custom metric
   */
  recordMetric(name, value, type = 'gauge') {
    const metric = this.metrics.get(name) || {
      type,
      count: 0,
      totalValue: 0,
      minValue: Infinity,
      maxValue: -Infinity,
      avgValue: 0,
      lastValue: null
    };
    
    metric.count++;
    metric.totalValue += value;
    metric.minValue = Math.min(metric.minValue, value);
    metric.maxValue = Math.max(metric.maxValue, value);
    metric.avgValue = metric.totalValue / metric.count;
    metric.lastValue = value;
    
    this.metrics.set(name, metric);
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Get specific metric
   */
  getMetric(name) {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Create a timing decorator
   */
  createTimingDecorator(name) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args) {
        this.startTimer(`${name || propertyKey}`);
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } finally {
          this.endTimer(`${name || propertyKey}`);
        }
      };
      
      return descriptor;
    };
  }
}

/**
 * Stream utilities
 */
export class StreamUtils {
  /**
   * Convert async generator to readable stream
   */
  static async *toAsyncGenerator(stream) {
    const reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Combine multiple async generators
   */
  static async *combine(...generators) {
    const promises = generators.map(async (gen) => {
      for await (const value of gen) {
        return { value, done: false };
      }
      return { done: true };
    });
    
    while (promises.length > 0) {
      const result = await Promise.race(promises);
      if (result.done) {
        promises.splice(promises.indexOf(result), 1);
      } else {
        yield result.value;
      }
    }
  }

  /**
   * Buffer stream chunks
   */
  static async *buffer(generator, size = 10) {
    let buffer = [];
    
    for await (const chunk of generator) {
      buffer.push(chunk);
      
      if (buffer.length >= size) {
        yield buffer;
        buffer = [];
      }
    }
    
    if (buffer.length > 0) {
      yield buffer;
    }
  }

  /**
   * Throttle stream output
   */
  static async *throttle(generator, delayMs = 100) {
    for await (const chunk of generator) {
      yield chunk;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  /**
   * Transform stream chunks
   */
  static async *transform(generator, transformer) {
    for await (const chunk of generator) {
      const transformed = await transformer(chunk);
      if (transformed !== undefined) {
        yield transformed;
      }
    }
  }

  /**
   * Filter stream chunks
   */
  static async *filter(generator, predicate) {
    for await (const chunk of generator) {
      if (await predicate(chunk)) {
        yield chunk;
      }
    }
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate required fields
   */
  static validateRequired(obj, fields) {
    const missing = fields.filter(field => !(field in obj) || obj[field] === undefined);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate field types
   */
  static validateTypes(obj, schema) {
    for (const [field, expectedType] of Object.entries(schema)) {
      const value = obj[field];
      if (value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== expectedType) {
          throw new Error(`Field ${field} must be ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  /**
   * Validate enum values
   */
  static validateEnum(value, enumValues, fieldName = 'value') {
    if (!enumValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${enumValues.join(', ')}`);
    }
  }

  /**
   * Validate URL format
   */
  static validateUrl(url, fieldName = 'url') {
    try {
      new URL(url);
    } catch {
      throw new Error(`${fieldName} must be a valid URL`);
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email, fieldName = 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`${fieldName} must be a valid email address`);
    }
  }
}

/**
 * Retry utilities
 */
export class RetryUtils {
  /**
   * Retry a function with exponential backoff
   */
  static async retry(fn, options = {}) {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      jitter = true
    } = options;
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          break;
        }
        
        let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
        
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Create a retry decorator
   */
  static createRetryDecorator(options = {}) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args) {
        return RetryUtils.retry(() => originalMethod.apply(this, args), options);
      };
      
      return descriptor;
    };
  }
}

/**
 * Cache utilities
 */
export class CacheUtils {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 60000; // 1 minute
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Get value from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Update access time
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key, value, ttl = this.ttl) {
    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictOldest();
    }
    
    const entry = {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      ttl
    };
    
    this.cache.set(key, entry);
    
    // Set expiration timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
      }, ttl);
      
      this.timers.set(key, timer);
    }
  }

  /**
   * Delete from cache
   */
  delete(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    
    return this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry: this._getOldestEntry(),
      newestEntry: this._getNewestEntry()
    };
  }

  _evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  _getOldestEntry() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const entry of this.cache.values()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldest = entry;
      }
    }
    
    return oldest;
  }

  _getNewestEntry() {
    let newest = null;
    let newestTime = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.createdAt > newestTime) {
        newestTime = entry.createdAt;
        newest = entry;
      }
    }
    
    return newest;
  }
}

// Export all utilities
export default {
  ConfigUtils,
  Logger,
  PerformanceMonitor,
  StreamUtils,
  ValidationUtils,
  RetryUtils,
  CacheUtils
};
