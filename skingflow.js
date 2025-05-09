// node_flow.js – A Node.js port of the Python node/flow orchestration framework
// -----------------------------------------------------------------------------
// The public API mirrors the original Python design as closely as the language
// allows. Key differences:
//   • JavaScript does not support operator overloading (e.g. "node1 >> node2"),
//     so use the provided fluent helpers instead:
//         node1.next(node2)                          // default transition
//         node1.when('error').next(errorHandler)     // conditional transition
//   • Synchronous retry waits are implemented with a blocking sleep util. For
//     high‑throughput scenarios, prefer AsyncNode‑based flows to avoid blocking
//     the Node.js event loop.
// -----------------------------------------------------------------------------
//
// Copyright (c) skingko
// https://github.com/skingko/skingflow
// Author: skingko <venture2157@gmail.com>
//

// Helper: blocking sleep (sync) -------------------------------------------------
function sleepSync(ms) {
  const end = Date.now() + ms;
  // eslint-disable-next-line no-empty
  while (Date.now() < end) {}
}


// Helper: shallow clone of an object, preserving prototype ---------------------
function shallowClone(obj) {
  if (!obj) return obj;
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

// BaseNode ---------------------------------------------------------------------
class BaseNode {
  constructor() {
    this.params = {};
    this.successors = new Map(); // action → node
  }

  /** Merge‑or‑replace runtime parameters for this node instance. */
  setParams(params = {}) {
    this.params = params;
  }

  /**
   * Attach a successor node for a given action (default="default").
   * Returns the target node to enable fluent chaining.
   */
  next(node, action = 'default') {
    if (this.successors.has(action)) {
      console.warn(`Overwriting successor for action '${action}'`);
    }
    this.successors.set(action, node);
    return node;
  }

  /** Fluent conditional builder: node.when('error').next(handler) */
  when(action) {
    if (typeof action !== 'string') {
      throw new TypeError('Action must be a string');
    }
    return {
      next: (node) => this.next(node, action),
    };
  }

  // Override‑points (sync) ------------------------------------------------------
  /* eslint-disable class-methods-use-this, no-unused-vars */
  prep(shared) {}
  exec(prepRes) {}
  post(shared, prepRes, execRes) {}
  /* eslint-enable class-methods-use-this */

  _exec(prepRes) {
    return this.exec(prepRes);
  }

  _run(shared) {
    const p = this.prep(shared);
    const e = this._exec(p);
    return this.post(shared, p, e);
  }

  /** Execute a single node in isolation (no successor traversal). */
  run(shared = {}) {
    if (this.successors.size) {
      console.warn('Node won\'t run successors. Use Flow.');
    }
    return this._run(shared);
  }
}

// Node (sync, with retries) -----------------------------------------------------
class Node extends BaseNode {
  constructor({ maxRetries = 1, wait = 0 } = {}) {
    super();
    this.maxRetries = maxRetries;
    this.wait = wait; // milliseconds
    this.curRetry = 0;
  }

  /** Override to customise fallback behaviour. */
  /* eslint-disable class-methods-use-this, no-unused-vars */
  execFallback(prepRes, err) {
    throw err;
  }
  /* eslint-enable class-methods-use-this */

  _exec(prepRes) {
    for (this.curRetry = 0; this.curRetry < this.maxRetries; this.curRetry += 1) {
      try {
        return this.exec(prepRes);
      } catch (err) {
        if (this.curRetry === this.maxRetries - 1) {
          return this.execFallback(prepRes, err);
        }
        if (this.wait > 0) sleepSync(this.wait);
      }
    }
    return undefined; // should never reach
  }
}

// BatchNode (sync) -------------------------------------------------------------
class BatchNode extends Node {
  _exec(items = []) {
    return items.map((item) => super._exec(item));
  }
}

// Flow (sync orchestration) -----------------------------------------------------
class Flow extends BaseNode {
  constructor(start = null) {
    super();
    this.startNode = start;
  }

  /** Chainable setter: flow.start(nodeA) */
  start(node) {
    this.startNode = node;
    return node;
  }

  getNextNode(curr, action) {
    const key = action || 'default';
    const nxt = curr.successors.get(key);
    if (!nxt && curr.successors.size) {
      console.warn(`Flow ends: '${key}' not found in ${Array.from(curr.successors.keys())}`);
    }
    return nxt;
  }

  _orch(shared, params = null) {
    let curr = shallowClone(this.startNode);
    const combinedParams = params || { ...this.params };
    let lastAction = null;

    while (curr) {
      curr.setParams(combinedParams);
      lastAction = curr._run(shared);
      curr = shallowClone(this.getNextNode(curr, lastAction));
    }
    return lastAction;
  }

  _run(shared) {
    const p = this.prep(shared);
    const o = this._orch(shared);
    return this.post(shared, p, o);
  }

  /* eslint-disable class-methods-use-this */
  post(shared, prepRes, execRes) {
    return execRes;
  }
  /* eslint-enable class-methods-use-this */
}

// BatchFlow (sync) -------------------------------------------------------------
class BatchFlow extends Flow {
  _run(shared) {
    const pr = this.prep(shared) || [];
    pr.forEach((bp) => this._orch(shared, { ...this.params, ...bp }));
    return this.post(shared, pr, null);
  }
}

// -----------------------------------------------------------------------------
// Asynchronous variants (Promise/async‑await) ----------------------------------
// -----------------------------------------------------------------------------

// AsyncNode --------------------------------------------------------------------
class AsyncNode extends Node {
  // Override‑points (async) ---------------------------------------------------
  /* eslint-disable class-methods-use-this, no-unused-vars */
  async prepAsync(shared) {}
  async execAsync(prepRes) {}
  async execFallbackAsync(prepRes, err) {
    throw err;
  }
  async postAsync(shared, prepRes, execRes) {}
  /* eslint-enable class-methods-use-this */

  async _exec(prepRes) {
    for (let i = 0; i < this.maxRetries; i += 1) {
      try {
        return await this.execAsync(prepRes);
      } catch (err) {
        if (i === this.maxRetries - 1) {
          return this.execFallbackAsync(prepRes, err);
        }
        if (this.wait > 0) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, this.wait));
        }
      }
    }
    return undefined;
  }

  async _runAsync(shared) {
    const p = await this.prepAsync(shared);
    const e = await this._exec(p);
    return this.postAsync(shared, p, e);
  }

  async runAsync(shared = {}) {
    if (this.successors.size) {
      console.warn('Node won\'t run successors. Use AsyncFlow.');
    }
    return this._runAsync(shared);
  }

  
  _run() {
    throw new Error('Use runAsync().');
  }
}

// AsyncBatchNode ---------------------------------------------------------------
class AsyncBatchNode extends AsyncNode {
  async _exec(items = []) {
    const results = [];
    /* eslint-disable no-restricted-syntax */
    for (const item of items) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await super._exec(item));
    }
    /* eslint-enable no-restricted-syntax */
    return results;
  }
}

// AsyncParallelBatchNode -------------------------------------------------------
class AsyncParallelBatchNode extends AsyncNode {
  async _exec(items = []) {
    return Promise.all(items.map((item) => super._exec(item)));
  }
}

// AsyncFlow --------------------------------------------------------------------
class AsyncFlow extends Flow {
  async _orchAsync(shared, params = null) {
    let curr = shallowClone(this.startNode);
    const combinedParams = params || { ...this.params };
    let lastAction = null;

    while (curr) {
      curr.setParams(combinedParams);
      
      lastAction = curr instanceof AsyncNode ? await curr._runAsync(shared) : curr._run(shared);
      curr = shallowClone(this.getNextNode(curr, lastAction));
    }
    return lastAction;
  }

  async _runAsync(shared) {
    const p = await this.prepAsync(shared);
    const o = await this._orchAsync(shared);
    return this.postAsync(shared, p, o);
  }

  /* eslint-disable class-methods-use-this */
  async postAsync(shared, prepRes, execRes) {
    return execRes;
  }
  /* eslint-enable class-methods-use-this */

  
  _run() {
    throw new Error('Use runAsync().');
  }
}


class AsyncBatchFlow extends AsyncFlow {
  async _runAsync(shared) {
    const pr = (await this.prepAsync(shared)) || [];
    /* eslint-disable no-restricted-syntax */
    for (const bp of pr) {
      // eslint-disable-next-line no-await-in-loop
      await this._orchAsync(shared, { ...this.params, ...bp });
    }
    /* eslint-enable no-restricted-syntax */
    return this.postAsync(shared, pr, null);
  }
}

// AsyncParallelBatchFlow -------------------------------------------------------
class AsyncParallelBatchFlow extends AsyncFlow {
  async _runAsync(shared) {
    const pr = (await this.prepAsync(shared)) || [];
    await Promise.all(pr.map((bp) => this._orchAsync(shared, { ...this.params, ...bp })));
    return this.postAsync(shared, pr, null);
  }
}

module.exports = {
  BaseNode,
  Node,
  BatchNode,
  Flow,
  BatchFlow,
  AsyncNode,
  AsyncBatchNode,
  AsyncParallelBatchNode,
  AsyncFlow,
  AsyncBatchFlow,
  AsyncParallelBatchFlow,
};

