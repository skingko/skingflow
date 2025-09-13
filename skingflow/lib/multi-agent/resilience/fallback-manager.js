/**
 * Fallback Manager for Multi-Agent Framework
 * 
 * Implements comprehensive fallback strategies based on deepagents patterns:
 * - LLM provider fallbacks
 * - Tool execution fallbacks
 * - Memory system fallbacks
 * - Sub-agent fallbacks
 * - Planning fallbacks
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import chalk from 'chalk';

/**
 * Fallback Strategy Types
 */
export const FallbackStrategy = {
  RETRY: 'retry',
  ALTERNATIVE: 'alternative',
  DEGRADED: 'degraded',
  SKIP: 'skip',
  MANUAL: 'manual'
};

/**
 * Error Categories for different fallback strategies
 */
export const ErrorCategory = {
  NETWORK: 'network',
  RATE_LIMIT: 'rate_limit',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  TIMEOUT: 'timeout',
  RESOURCE: 'resource',
  UNKNOWN: 'unknown'
};

/**
 * Fallback Configuration
 */
export class FallbackConfig {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.maxRetryDelay = options.maxRetryDelay || 30000;
    this.enableDegradedMode = options.enableDegradedMode !== false;
    this.fallbackTimeout = options.fallbackTimeout || 60000;
    
    // Component-specific fallback strategies
    this.strategies = {
      llm: options.llmStrategy || FallbackStrategy.RETRY,
      memory: options.memoryStrategy || FallbackStrategy.DEGRADED,
      tools: options.toolsStrategy || FallbackStrategy.ALTERNATIVE,
      planning: options.planningStrategy || FallbackStrategy.DEGRADED,
      subAgents: options.subAgentsStrategy || FallbackStrategy.ALTERNATIVE,
      ...options.strategies
    };
  }
}

/**
 * Fallback Manager
 */
export class FallbackManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config instanceof FallbackConfig ? config : new FallbackConfig(config);
    this.retryCounters = new Map();
    this.circuitBreakers = new Map();
    this.degradedComponents = new Set();
    this.fallbackHistory = [];
  }

  /**
   * Execute operation with fallback handling
   */
  async executeWithFallback(operation, context = {}) {
    const { component, operationType, fallbackOptions = {} } = context;
    const operationId = `${component}_${operationType}_${Date.now()}`;
    
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(component)) {
        return await this.handleCircuitBreakerOpen(operation, context);
      }

      // Execute primary operation
      const result = await this.executeWithRetry(operation, context);
      
      // Reset circuit breaker on success
      this.resetCircuitBreaker(component);
      
      return result;

    } catch (error) {
      console.warn(chalk.yellow(`⚠️  ${component} operation failed: ${error.message}`));
      
      // Categorize error
      const errorCategory = this.categorizeError(error);
      
      // Record failure
      this.recordFailure(component, error, errorCategory);
      
      // Execute fallback strategy
      return await this.executeFallbackStrategy(operation, context, error, errorCategory);
    }
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry(operation, context) {
    const { component } = context;
    const maxRetries = context.maxRetries || this.config.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(chalk.gray(`🔄 Retrying ${component} operation (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms`));
          await this.sleep(delay);
        }

        const result = await operation();
        
        // Reset retry counter on success
        this.retryCounters.delete(component);
        
        return result;

      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute fallback strategy based on error and configuration
   */
  async executeFallbackStrategy(operation, context, error, errorCategory) {
    const { component } = context;
    const strategy = this.config.strategies[component] || FallbackStrategy.RETRY;

    this.emit('fallbackTriggered', { component, strategy, error, errorCategory });

    switch (strategy) {
      case FallbackStrategy.RETRY:
        return await this.handleRetryFallback(operation, context, error);

      case FallbackStrategy.ALTERNATIVE:
        return await this.handleAlternativeFallback(operation, context, error);

      case FallbackStrategy.DEGRADED:
        return await this.handleDegradedFallback(operation, context, error);

      case FallbackStrategy.SKIP:
        return await this.handleSkipFallback(operation, context, error);

      case FallbackStrategy.MANUAL:
        return await this.handleManualFallback(operation, context, error);

      default:
        throw new Error(`Unknown fallback strategy: ${strategy}`);
    }
  }

  /**
   * Handle retry fallback (already handled in executeWithRetry)
   */
  async handleRetryFallback(operation, context, error) {
    console.log(chalk.red(`❌ ${context.component} retry fallback exhausted`));
    throw error;
  }

  /**
   * Handle alternative fallback (use backup component/method)
   */
  async handleAlternativeFallback(operation, context, error) {
    const { component, alternatives = [] } = context;
    
    console.log(chalk.yellow(`🔄 Trying alternative for ${component}`));
    
    for (const alternative of alternatives) {
      try {
        console.log(chalk.gray(`   Trying alternative: ${alternative.name}`));
        const result = await alternative.execute();
        
        console.log(chalk.green(`✅ Alternative ${alternative.name} succeeded`));
        return result;

      } catch (altError) {
        console.warn(chalk.gray(`   Alternative ${alternative.name} failed: ${altError.message}`));
        continue;
      }
    }

    // All alternatives failed, fall back to degraded mode
    return await this.handleDegradedFallback(operation, context, error);
  }

  /**
   * Handle degraded fallback (reduced functionality)
   */
  async handleDegradedFallback(operation, context, error) {
    const { component, degradedHandler } = context;
    
    console.log(chalk.yellow(`⚠️  Entering degraded mode for ${component}`));
    this.degradedComponents.add(component);
    
    if (degradedHandler && typeof degradedHandler === 'function') {
      try {
        const result = await degradedHandler(error, context);
        console.log(chalk.yellow(`✅ Degraded mode handler succeeded for ${component}`));
        return result;
      } catch (degradedError) {
        console.warn(chalk.red(`❌ Degraded mode handler failed for ${component}: ${degradedError.message}`));
      }
    }

    // Return default degraded response
    return this.getDefaultDegradedResponse(component, context);
  }

  /**
   * Handle skip fallback (continue without this component)
   */
  async handleSkipFallback(operation, context, error) {
    const { component } = context;
    
    console.log(chalk.yellow(`⏭️  Skipping ${component} operation`));
    
    return {
      skipped: true,
      component,
      reason: error.message,
      timestamp: new Date()
    };
  }

  /**
   * Handle manual fallback (require human intervention)
   */
  async handleManualFallback(operation, context, error) {
    const { component } = context;
    
    console.log(chalk.red(`🚨 Manual intervention required for ${component}`));
    
    // In a real implementation, this might trigger notifications or pause execution
    throw new Error(`Manual intervention required for ${component}: ${error.message}`);
  }

  /**
   * Get default degraded response for component
   */
  getDefaultDegradedResponse(component, context) {
    switch (component) {
      case 'llm':
        return {
          response: "I apologize, but I'm currently experiencing technical difficulties. Please try again later.",
          degraded: true,
          component: 'llm'
        };

      case 'memory':
        return {
          memories: [],
          degraded: true,
          component: 'memory'
        };

      case 'planning':
        return {
          needsPlanning: false,
          reason: 'Planning service unavailable, proceeding with direct execution',
          degraded: true,
          directAction: context.fallbackAction || 'Execute request directly'
        };

      case 'tools':
        return {
          result: 'Tool execution unavailable',
          degraded: true,
          component: 'tools'
        };

      case 'subAgents':
        return {
          result: 'Sub-agent execution unavailable, using fallback response',
          degraded: true,
          component: 'subAgents'
        };

      default:
        return {
          result: `${component} service unavailable`,
          degraded: true,
          component
        };
    }
  }

  /**
   * Categorize error for appropriate fallback strategy
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    if (message.includes('unauthorized') || message.includes('authentication') || message.includes('api key')) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    if (message.includes('validation') || message.includes('parameter') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (message.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }
    
    if (message.includes('memory') || message.includes('resource') || message.includes('limit')) {
      return ErrorCategory.RESOURCE;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const category = this.categorizeError(error);
    
    // Don't retry validation or authentication errors
    if (category === ErrorCategory.VALIDATION || category === ErrorCategory.AUTHENTICATION) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.config.maxRetryDelay);
  }

  /**
   * Circuit breaker logic
   */
  isCircuitBreakerOpen(component) {
    const breaker = this.circuitBreakers.get(component);
    if (!breaker) return false;
    
    const now = Date.now();
    if (now - breaker.lastFailure > breaker.timeout) {
      // Reset circuit breaker after timeout
      this.circuitBreakers.delete(component);
      return false;
    }
    
    return breaker.failures >= breaker.threshold;
  }

  async handleCircuitBreakerOpen(operation, context) {
    const { component } = context;
    console.log(chalk.red(`🚫 Circuit breaker open for ${component}, using fallback`));
    
    return await this.handleDegradedFallback(operation, context, new Error('Circuit breaker open'));
  }

  resetCircuitBreaker(component) {
    this.circuitBreakers.delete(component);
  }

  recordFailure(component, error, errorCategory) {
    // Update circuit breaker
    const breaker = this.circuitBreakers.get(component) || {
      failures: 0,
      threshold: 5,
      timeout: 60000,
      lastFailure: 0
    };
    
    breaker.failures++;
    breaker.lastFailure = Date.now();
    this.circuitBreakers.set(component, breaker);
    
    // Record in history
    this.fallbackHistory.push({
      component,
      error: error.message,
      errorCategory,
      timestamp: new Date(),
      strategy: this.config.strategies[component]
    });
    
    // Keep only last 100 entries
    if (this.fallbackHistory.length > 100) {
      this.fallbackHistory = this.fallbackHistory.slice(-100);
    }
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    return {
      degradedComponents: Array.from(this.degradedComponents),
      circuitBreakers: Object.fromEntries(this.circuitBreakers),
      recentFailures: this.fallbackHistory.slice(-10),
      isHealthy: this.degradedComponents.size === 0 && this.circuitBreakers.size === 0
    };
  }

  /**
   * Recover component from degraded state
   */
  recoverComponent(component) {
    this.degradedComponents.delete(component);
    this.circuitBreakers.delete(component);
    console.log(chalk.green(`✅ Component ${component} recovered from degraded state`));
  }

  /**
   * Utility method for sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default FallbackManager;
