# skingflow (Node.js)

> Copyright (c) skingko  
> https://github.com/skingko/skingflow  
> Author: skingko <venture2157@gmail.com>

---

## Introduction

**skingflow** is a flexible flow engine for Node.js, inspired by the pocketflow-chat project. It is designed for building multi-turn chatbots, workflow orchestration, and AI dialog systems. It supports both synchronous and asynchronous nodes, dynamic branching, and is easily extensible to any LLM (e.g., OpenAI GPT).

- Supports sync/async nodes (`Node`/`AsyncNode`)
- Flexible flow control (`Flow`/`AsyncFlow`) with arbitrary jumps
- Supports nesting, dynamic parameters, and branching
- Easily extendable for any LLM backend

## Directory Structure

```
nodejs/
  skingflow.js         # Core flow engine (Node/AsyncNode/Flow/AsyncFlow)
  examples/
    skingflow-chat/
      main.js          # Chatbot demo entry
      utils.js         # OpenAI API utilities
      package.json     # Dependency management
```

## Code Overview

### 1. Node/Flow Basics
- `Node`: The basic unit of a flow. Must implement `prep` (input), `exec` (API call), and `post` (output/transition).
- `Flow`: The controller that orchestrates node transitions, supports nesting.
- `AsyncNode`/`AsyncFlow`: Fully supports asynchronous flows and nodes.

### 2. Chatbot Demo (examples/skingflow-chat)
- `main.js`: Implements a terminal chatbot using skingflow.
    - User input is captured via `prep`.
    - `exec` calls OpenAI API via utils.js.
    - `post` outputs the AI response and controls continuation.
- `utils.js`: OpenAI GPT-4 API wrapper, supports proxy.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/skingko/skingflow.git
cd skingflow/nodejs/examples/skingflow-chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
Set your OpenAI API key (recommended via .env or export):
```bash
export OPENAI_API_KEY=sk-xxxxxx
```
If you need a proxy:
```bash
export https_proxy=http://127.0.0.1:7890
```

### 4. Run the chatbot demo
```bash
node main.js
```

## Dependencies

- openai
- node-fetch@2
- https-proxy-agent
- deasync (for sync user input, Python-like experience)

## API Reference

### Classes

#### Node
- `prep(shared)`: Prepare input or context. Returns data for `exec`.
- `exec(prepRes)`: Execute node logic (e.g., call API). Returns result for `post`.
- `post(shared, prepRes, execRes)`: Handle output, update shared context, control flow.

#### AsyncNode
- Same as `Node`, but all methods are async and return Promises.

#### Flow
- `constructor(entryNode)`: Create a flow with the entry node.
- `_run(shared)`: Run the flow synchronously.

#### AsyncFlow
- `constructor(entryNode)`: Create an async flow.
- `_runAsync(shared)`: Run the flow asynchronously.

### Example Usage

```js
const { Node, Flow } = require('skingflow');

class HelloNode extends Node {
  prep(shared) {
    return 'World';
  }
  exec(name) {
    return `Hello, ${name}!`;
  }
  post(shared, prepRes, execRes) {
    console.log(execRes);
    return null; // End flow
  }
}

const flow = new Flow(new HelloNode());
flow._run({});
```

---

## License

```
Copyright (c) skingko
https://github.com/skingko/skingflow
Author: skingko <venture2157@gmail.com>
```

For commercial or advanced usage, please contact the author.
