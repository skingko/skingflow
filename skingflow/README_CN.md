# skingflow (Node.js)

> Copyright (c) skingko
> https://github.com/skingko/skingflow
> Author: skingko <venture2157@gmail.com>

---

## 简介

**skingflow** 是一个灵活的 Node.js 流式对话/流程引擎，适用于构建多轮对话机器人、流程编排、AI 聊天等场景。其核心思想源自 Python 版 pocketflow-chat，并在 Node.js 下实现了同步与异步节点的灵活编排。

- 支持同步/异步节点（Node/AsyncNode）
- 支持流程（Flow/AsyncFlow）任意跳转
- 支持嵌套、动态参数、流程分支
- 可扩展适配任意 LLM（如 OpenAI GPT）


## 目录结构

```
nodejs/
  skingflow.js         # 流程引擎核心（Node/AsyncNode/Flow/AsyncFlow）
  examples/
    skingflow-chat/
      main.js          # 聊天 demo 入口
      utils.js         # OpenAI API 封装
      package.json     # 依赖管理
```


## 代码逻辑简述

### 1. Node/Flow 基础
- `Node`：流程节点，需实现 `prep`（准备/输入）、`exec`（执行/调用API）、`post`（输出/跳转）方法。
- `Flow`：流程控制器，负责 orchestrate 节点流转，可嵌套。
- `AsyncNode`/`AsyncFlow`：支持异步节点和流程。

### 2. 聊天 Demo（examples/skingflow-chat）
- `main.js`：实现了一个基于 skingflow 的终端聊天机器人。
    - 用户输入通过 `prep` 捕获。
    - `exec` 通过 utils.js 调用 OpenAI API。
    - `post` 输出 AI 回复并决定是否继续。
- `utils.js`：封装 OpenAI GPT-4 API 调用，支持代理。


## 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/skingko/skingflow.git
cd skingflow/nodejs/examples/skingflow-chat
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在终端设置你的 OpenAI Key（推荐写入 .env 文件或 export）：
```bash
export OPENAI_API_KEY=sk-xxxxxx
```
如需代理：
```bash
export https_proxy=http://127.0.0.1:7890
```

### 4. 运行 Demo 聊天机器人
```bash
node main.js
```


## 依赖说明
- openai
- node-fetch@2
- https-proxy-agent
- deasync（同步等待用户输入，仿 Python 行为）


## API 说明

### 主要类

#### Node
- `prep(shared)`：准备输入或上下文，返回给 `exec`。
- `exec(prepRes)`：执行节点逻辑（如 API 调用），返回给 `post`。
- `post(shared, prepRes, execRes)`：处理输出，更新 shared，控制流程。

#### AsyncNode
- 与 `Node` 类似，但所有方法均为 async，返回 Promise。

#### Flow
- `constructor(entryNode)`：以入口节点创建流程。
- `_run(shared)`：同步运行流程。

#### AsyncFlow
- `constructor(entryNode)`：创建异步流程。
- `_runAsync(shared)`：异步运行流程。

### 用法示例

```js
const { Node, Flow } = require('skingflow');

class HelloNode extends Node {
  prep(shared) {
    return '世界';
  }
  exec(name) {
    return `你好, ${name}!`;
  }
  post(shared, prepRes, execRes) {
    console.log(execRes);
    return null; // 结束流程
  }
}

const flow = new Flow(new HelloNode());
flow._run({});
```

---

## 版权声明

```
Copyright (c) skingko
https://github.com/skingko/skingflow
Author: skingko <venture2157@gmail.com>
```

如需商用/二次开发请联系作者。
