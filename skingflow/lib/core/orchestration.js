/**
 * Flow Orchestration System for skingflow
 * 
 * Provides advanced flow composition and orchestration capabilities
 * Leverages skingflow's streaming architecture for complex workflows
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import { AsyncNode, AsyncFlow } from '../../skingflow.js';

/**
 * Flow Step Definition
 */
export class FlowStep {
  constructor(options = {}) {
    this.id = options.id || FlowStep.generateId();
    this.name = options.name || this.id;
    this.type = options.type || 'node'; // node, flow, condition, loop, parallel
    this.node = options.node || null;
    this.condition = options.condition || null;
    this.onSuccess = options.onSuccess || 'continue';
    this.onFailure = options.onFailure || 'stop';
    this.retries = options.retries || 0;
    this.timeout = options.timeout || 30000;
    this.metadata = options.metadata || {};
  }

  static generateId() {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Conditional Logic for Flows
 */
export class FlowCondition {
  constructor(predicate, trueStep = null, falseStep = null) {
    this.predicate = predicate;
    this.trueStep = trueStep;
    this.falseStep = falseStep;
  }

  async evaluate(shared) {
    if (typeof this.predicate === 'function') {
      return await this.predicate(shared);
    } else if (typeof this.predicate === 'string') {
      // Simple string evaluation
      return shared[this.predicate] || false;
    } else {
      return Boolean(this.predicate);
    }
  }

  getNextStep(result) {
    return result ? this.trueStep : this.falseStep;
  }
}

/**
 * Parallel Execution Group
 */
export class ParallelGroup {
  constructor(steps = [], options = {}) {
    this.steps = steps;
    this.waitForAll = options.waitForAll !== false;
    this.failFast = options.failFast !== false;
    this.maxConcurrency = options.maxConcurrency || null;
  }

  async *execute(orchestrator, shared) {
    const results = [];
    const errors = [];
    
    if (this.maxConcurrency && this.steps.length > this.maxConcurrency) {
      // Execute in batches
      for (let i = 0; i < this.steps.length; i += this.maxConcurrency) {
        const batch = this.steps.slice(i, i + this.maxConcurrency);
        yield `Executing parallel batch ${Math.floor(i / this.maxConcurrency) + 1}...\n`;
        
        const batchResults = await this._executeBatch(orchestrator, shared, batch);
        results.push(...batchResults.results);
        errors.push(...batchResults.errors);
        
        if (this.failFast && errors.length > 0) break;
      }
    } else {
      // Execute all at once
      yield `Executing ${this.steps.length} steps in parallel...\n`;
      const batchResults = await this._executeBatch(orchestrator, shared, this.steps);
      results.push(...batchResults.results);
      errors.push(...batchResults.errors);
    }
    
    if (errors.length > 0 && this.failFast) {
      throw new Error(`Parallel execution failed: ${errors[0].message}`);
    }
    
    return { results, errors };
  }

  async _executeBatch(orchestrator, shared, steps) {
    const promises = steps.map(async (step) => {
      try {
        const result = await orchestrator._executeStep(step, shared);
        return { step: step.id, result, success: true };
      } catch (error) {
        return { step: step.id, error, success: false };
      }
    });
    
    const outcomes = await Promise.all(promises);
    
    return {
      results: outcomes.filter(o => o.success),
      errors: outcomes.filter(o => !o.success)
    };
  }
}

/**
 * Loop Control for Flows
 */
export class FlowLoop {
  constructor(steps, condition, options = {}) {
    this.steps = steps;
    this.condition = condition; // Function or FlowCondition
    this.maxIterations = options.maxIterations || 100;
    this.breakOn = options.breakOn || null; // Function to check break condition
  }

  async *execute(orchestrator, shared) {
    let iteration = 0;
    
    while (iteration < this.maxIterations) {
      yield `Loop iteration ${iteration + 1}...\n`;
      
      // Check continue condition
      let shouldContinue;
      if (this.condition instanceof FlowCondition) {
        shouldContinue = await this.condition.evaluate(shared);
      } else if (typeof this.condition === 'function') {
        shouldContinue = await this.condition(shared, iteration);
      } else {
        shouldContinue = Boolean(this.condition);
      }
      
      if (!shouldContinue) {
        yield `Loop condition failed, breaking at iteration ${iteration + 1}\n`;
        break;
      }
      
      // Execute loop steps
      for (const step of this.steps) {
        yield* orchestrator._executeStepStream(step, shared);
        
        // Check break condition
        if (this.breakOn && await this.breakOn(shared, iteration)) {
          yield `Break condition met, exiting loop\n`;
          return;
        }
      }
      
      iteration++;
    }
    
    if (iteration >= this.maxIterations) {
      yield `Loop reached maximum iterations (${this.maxIterations})\n`;
    }
  }
}

/**
 * Flow Orchestrator - Advanced flow composition
 */
export class FlowOrchestrator extends AsyncFlow {
  constructor(options = {}) {
    super();
    this.steps = [];
    this.variables = new Map();
    this.middleware = [];
    this.options = {
      stopOnError: options.stopOnError !== false,
      timeout: options.timeout || 300000, // 5 minutes
      maxRetries: options.maxRetries || 3,
      ...options
    };
    this.stats = {
      executions: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      stepStats: new Map()
    };
  }

  /**
   * Add a step to the flow
   */
  addStep(stepOrNode, options = {}) {
    let step;
    
    if (stepOrNode instanceof FlowStep) {
      step = stepOrNode;
    } else if (stepOrNode instanceof AsyncNode) {
      step = new FlowStep({
        node: stepOrNode,
        ...options
      });
    } else {
      throw new Error('Step must be a FlowStep or AsyncNode');
    }
    
    this.steps.push(step);
    return this;
  }

  /**
   * Add conditional step
   */
  addCondition(predicate, trueStep, falseStep = null) {
    const condition = new FlowCondition(predicate, trueStep, falseStep);
    const step = new FlowStep({
      type: 'condition',
      condition,
      name: 'conditional-step'
    });
    
    this.steps.push(step);
    return this;
  }

  /**
   * Add parallel execution group
   */
  addParallel(steps, options = {}) {
    const parallelGroup = new ParallelGroup(steps, options);
    const step = new FlowStep({
      type: 'parallel',
      node: parallelGroup,
      name: 'parallel-group'
    });
    
    this.steps.push(step);
    return this;
  }

  /**
   * Add loop
   */
  addLoop(steps, condition, options = {}) {
    const loop = new FlowLoop(steps, condition, options);
    const step = new FlowStep({
      type: 'loop',
      node: loop,
      name: 'loop'
    });
    
    this.steps.push(step);
    return this;
  }

  /**
   * Set flow variable
   */
  setVariable(name, value) {
    this.variables.set(name, value);
    return this;
  }

  /**
   * Get flow variable
   */
  getVariable(name) {
    return this.variables.get(name);
  }

  /**
   * Add middleware
   */
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Execute the orchestrated flow
   */
  async *execAsyncStream(shared) {
    const startTime = Date.now();
    this.stats.executions++;
    
    try {
      // Initialize shared context with variables
      for (const [key, value] of this.variables) {
        shared[key] = value;
      }
      
      yield `Starting flow orchestration with ${this.steps.length} steps...\n`;
      
      // Execute steps sequentially
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        
        yield `\nStep ${i + 1}/${this.steps.length}: ${step.name}\n`;
        yield '-'.repeat(40) + '\n';
        
        try {
          yield* this._executeStepStream(step, shared);
        } catch (error) {
          yield `Step failed: ${error.message}\n`;
          
          if (this.options.stopOnError) {
            throw error;
          }
        }
      }
      
      this.stats.successes++;
      this.stats.totalTime += Date.now() - startTime;
      
      yield `\nFlow orchestration completed successfully!\n`;
      
    } catch (error) {
      this.stats.failures++;
      this.stats.totalTime += Date.now() - startTime;
      
      yield `\nFlow orchestration failed: ${error.message}\n`;
      throw error;
    }
  }

  async *_executeStepStream(step, shared) {
    const stepStartTime = Date.now();
    let stepStats = this.stats.stepStats.get(step.id) || { calls: 0, successes: 0, failures: 0, totalTime: 0 };
    stepStats.calls++;
    
    try {
      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.beforeStep) {
          await middleware.beforeStep(step, shared);
        }
      }
      
      // Execute step based on type
      switch (step.type) {
        case 'node':
          if (step.node) {
            yield* step.node.execAsyncStream(shared);
          }
          break;
          
        case 'condition':
          const conditionResult = await step.condition.evaluate(shared);
          yield `Condition result: ${conditionResult}\n`;
          
          const nextStep = step.condition.getNextStep(conditionResult);
          if (nextStep) {
            yield* this._executeStepStream(nextStep, shared);
          }
          break;
          
        case 'parallel':
          if (step.node instanceof ParallelGroup) {
            const results = yield* step.node.execute(this, shared);
            yield `Parallel execution completed: ${results.results.length} successes, ${results.errors.length} failures\n`;
          }
          break;
          
        case 'loop':
          if (step.node instanceof FlowLoop) {
            yield* step.node.execute(this, shared);
          }
          break;
          
        case 'flow':
          if (step.node instanceof AsyncFlow) {
            const result = await step.node._runAsync(shared);
            yield `Subflow completed with result: ${JSON.stringify(result)}\n`;
          }
          break;
          
        default:
          yield `Unknown step type: ${step.type}\n`;
      }
      
      stepStats.successes++;
      
      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.afterStep) {
          await middleware.afterStep(step, shared, null);
        }
      }
      
    } catch (error) {
      stepStats.failures++;
      
      // Apply middleware
      for (const middleware of this.middleware) {
        if (middleware.afterStep) {
          await middleware.afterStep(step, shared, error);
        }
      }
      
      throw error;
    } finally {
      stepStats.totalTime += Date.now() - stepStartTime;
      this.stats.stepStats.set(step.id, stepStats);
    }
  }

  async _executeStep(step, shared) {
    let result = '';
    for await (const chunk of this._executeStepStream(step, shared)) {
      result += chunk;
    }
    return result;
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    const avgTime = this.stats.executions > 0 ? this.stats.totalTime / this.stats.executions : 0;
    const successRate = this.stats.executions > 0 ? this.stats.successes / this.stats.executions : 0;
    
    const stepStats = {};
    for (const [stepId, stats] of this.stats.stepStats) {
      stepStats[stepId] = {
        ...stats,
        averageTime: stats.calls > 0 ? stats.totalTime / stats.calls : 0,
        successRate: stats.calls > 0 ? stats.successes / stats.calls : 0
      };
    }
    
    return {
      ...this.stats,
      averageTime: avgTime,
      successRate,
      stepStats
    };
  }

  /**
   * Create orchestrator from configuration
   */
  static fromConfig(config) {
    const orchestrator = new FlowOrchestrator(config.options);
    
    // Set variables
    if (config.variables) {
      for (const [key, value] of Object.entries(config.variables)) {
        orchestrator.setVariable(key, value);
      }
    }
    
    // Add steps
    if (config.steps) {
      for (const stepConfig of config.steps) {
        // This would need to be implemented based on specific step types
        // For now, we'll skip the detailed implementation
      }
    }
    
    return orchestrator;
  }

  /**
   * Load orchestrator from file
   */
  static async fromFile(filePath) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    let config;
    if (ext === '.json') {
      config = JSON.parse(content);
    } else if (ext === '.yaml' || ext === '.yml') {
      const yaml = await import('yaml');
      config = yaml.parse(content);
    } else {
      throw new Error('Unsupported orchestrator config format. Use JSON or YAML.');
    }
    
    return FlowOrchestrator.fromConfig(config);
  }
}

/**
 * Middleware for flow orchestration
 */
export class OrchestrationMiddleware {
  constructor(options = {}) {
    this.options = options;
  }

  async beforeStep(step, shared) {
    // Override in subclasses
  }

  async afterStep(step, shared, error = null) {
    // Override in subclasses
  }
}

/**
 * Logging Middleware
 */
export class LoggingMiddleware extends OrchestrationMiddleware {
  constructor(logger = console) {
    super();
    this.logger = logger;
  }

  async beforeStep(step, shared) {
    this.logger.log(`[ORCHESTRATOR] Starting step: ${step.name} (${step.id})`);
  }

  async afterStep(step, shared, error = null) {
    if (error) {
      this.logger.error(`[ORCHESTRATOR] Step failed: ${step.name} - ${error.message}`);
    } else {
      this.logger.log(`[ORCHESTRATOR] Step completed: ${step.name}`);
    }
  }
}

/**
 * Timing Middleware
 */
export class TimingMiddleware extends OrchestrationMiddleware {
  constructor() {
    super();
    this.timings = new Map();
  }

  async beforeStep(step, shared) {
    this.timings.set(step.id, Date.now());
  }

  async afterStep(step, shared, error = null) {
    const startTime = this.timings.get(step.id);
    if (startTime) {
      const duration = Date.now() - startTime;
      shared._stepTimings = shared._stepTimings || {};
      shared._stepTimings[step.id] = duration;
      this.timings.delete(step.id);
    }
  }

  getTimings(shared) {
    return shared._stepTimings || {};
  }
}

/**
 * Retry Middleware
 */
export class RetryMiddleware extends OrchestrationMiddleware {
  constructor(options = {}) {
    super();
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.retryCondition = options.retryCondition || (() => true);
  }

  async beforeStep(step, shared) {
    shared._retryCount = shared._retryCount || {};
    shared._retryCount[step.id] = 0;
  }

  async afterStep(step, shared, error = null) {
    if (error && this.retryCondition(error)) {
      const retryCount = shared._retryCount[step.id] || 0;
      
      if (retryCount < this.maxRetries) {
        shared._retryCount[step.id] = retryCount + 1;
        
        if (this.retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
        
        // This would trigger a retry - implementation depends on orchestrator design
        throw new Error(`Retry needed for step ${step.name} (attempt ${retryCount + 1})`);
      }
    }
  }
}

// Convenience functions
export const createOrchestrator = (options) => new FlowOrchestrator(options);
export const createStep = (nodeOrOptions, options) => {
  if (nodeOrOptions instanceof AsyncNode) {
    return new FlowStep({ node: nodeOrOptions, ...options });
  }
  return new FlowStep(nodeOrOptions);
};
export const createCondition = (predicate, trueStep, falseStep) => new FlowCondition(predicate, trueStep, falseStep);
export const createParallelGroup = (steps, options) => new ParallelGroup(steps, options);
export const createLoop = (steps, condition, options) => new FlowLoop(steps, condition, options);

export default FlowOrchestrator;
