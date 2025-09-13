# Hello World：skingflow.js 入门示例

本节介绍如何用 skingflow.js 快速实现一个最基础的 LLM 流程自动化节点。

## 示例代码
```js
// nodes.js
export async function* HelloWorldNode() {
  yield 'Hello, world!';
}

// flow.js
import { HelloWorldNode } from './nodes.js';
export async function runFlow() {
  for await (const token of HelloWorldNode()) {
    process.stdout.write(token);
  }
}
```

## 运行效果
```
Hello, world!
```

## 关键点
- 节点需为 async generator 并 yield 输出。
- 主流程用 for await...of 消费节点。
