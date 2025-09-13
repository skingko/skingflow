// node_flow.js – A Node.js port of the Python node/flow orchestration framework
// Copyright (c) skingko
// https://github.com/skingko/skingflow
// Author: skingko <venture2157@gmail.com>
//

function sleepSync(ms) {
  const end = Date.now() + ms;
  // eslint-disable-next-line no-empty
  while (Date.now() < end) {}
}


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

  setParams(params = {}) {
    this.params = params;
  }

  next(node, action = 'default') {
    if (this.successors.has(action)) {
      console.warn(`Overwriting successor for action '${action}'`);
    }
    this.successors.set(action, node);
    return node;
  }

  when(action) {
    if (typeof action !== 'string') {
      throw new TypeError('Action must be a string');
    }
    return {
      next: (node) => this.next(node, action),
    };
  }

  prep(shared) {}
  exec(prepRes) {}
  post(shared, prepRes, execRes) {}

  _exec(prepRes) {
    return this.exec(prepRes);
  }

  _run(shared) {
    const p = this.prep(shared);
    const e = this._exec(p);
    return this.post(shared, p, e);
  }

  run(shared = {}) {
    if (this.successors.size) {
      console.warn('Node won\'t run successors. Use Flow.');
    }
    return this._run(shared);
  }
}

class Node extends BaseNode {
  constructor({ maxRetries = 1, wait = 0 } = {}) {
    super();
    this.maxRetries = maxRetries;
    this.wait = wait; // milliseconds
    this.curRetry = 0;
  }

  execFallback(prepRes, err) {
    throw err;
  }

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

class BatchNode extends Node {
  _exec(items = []) {
    return items.map((item) => super._exec(item));
  }
}

class Flow extends BaseNode {
  constructor(start = null) {
    super();
    this.startNode = start;
  }

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

  post(shared, prepRes, execRes) {
    return execRes;
  }
}

class BatchFlow extends Flow {
  _run(shared) {
    const pr = this.prep(shared) || [];
    pr.forEach((bp) => this._orch(shared, { ...this.params, ...bp }));
    return this.post(shared, pr, null);
  }
}


class AsyncNode extends Node {
  async prepAsync(shared) {}
  async execAsync(prepRes) {}
  async *execAsyncStream(prepRes) {
    throw new Error('execAsyncStream not implemented');
  }
  async execFallbackAsync(prepRes, err) {
    throw err;
  }
  async postAsync(shared, prepRes, execRes) {}

  async _exec(prepRes) {
    for (let i = 0; i < this.maxRetries; i += 1) {
      try {
        return await this.execAsync(prepRes);
      } catch (err) {
        if (i === this.maxRetries - 1) {
          return this.execFallbackAsync(prepRes, err);
        }
        if (this.wait > 0) {
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
    for (const item of items) {
      results.push(await super._exec(item));
    }
    return results;
  }
}

class AsyncParallelBatchNode extends AsyncNode {
  async _exec(items = []) {
    return Promise.all(items.map((item) => super._exec(item)));
  }
}

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

  async postAsync(shared, prepRes, execRes) {
    return execRes;
  }
  
  _run() {
    throw new Error('Use runAsync().');
  }
}


class AsyncBatchFlow extends AsyncFlow {
  async _runAsync(shared) {
    const pr = (await this.prepAsync(shared)) || [];
    for (const bp of pr) {
      await this._orchAsync(shared, { ...this.params, ...bp });
    }
    return this.postAsync(shared, pr, null);
  }
}

class AsyncParallelBatchFlow extends AsyncFlow {
  async _runAsync(shared) {
    const pr = (await this.prepAsync(shared)) || [];
    await Promise.all(pr.map((bp) => this._orchAsync(shared, { ...this.params, ...bp })));
    return this.postAsync(shared, pr, null);
  }
}

export {
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