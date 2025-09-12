# skingflow.js Agent-to-Agent（A2A）协作

本节详解如何用 skingflow.js 实现智能体间（Agent-to-Agent, A2A）自动协作，适用于多智能体分工、链式推理、复杂任务协同等场景。

---

## 场景与目标
- 适用于多 agent 分工协作、链式/树状任务分解、自动化项目管理等。
- 目标是让多个 agent 能自动分配、协调与协作完成复杂任务。

## 核心原理与流程
- 主 agent 根据任务类型动态分配给子 agent。
- agent 间通过上下文/消息结构体传递信息。

**流程图：**
```
[主Agent] → [分配任务] → [子Agent1]
         ↘             ↘ [子Agent2] ...
```

## 关键节点结构说明
- **MainAgentNode**：拆解任务，分配给子 agent
- **SubAgentNode**：处理分配到的子任务，返回结果

## 典型代码片段
```js
export async function* MainAgentNode(taskList) {
  for (const task of taskList) {
    yield* SubAgentNode(task);
  }
}

export async function* SubAgentNode(task) {
  // ... LLM/工具调用
  yield `完成子任务: ${task}`;
}
```

## 易错点与注意事项
- 每个 agent 节点必须 async generator 并 yield，才能流式协作。
- agent 间建议结构化消息传递，避免信息丢失。
- 主 agent 调度建议支持异常兜底、任务重试。

## PocketFlow 迁移经验
- Python 版常用类+方法，js 推荐 async generator 分层封装。
- agent 间通信建议用 context/message 对象，便于扩展。

## 实践建议/扩展思路
- 支持多层级 agent 协作、动态 agent 生成。
- 可结合工具链、RAG、批量等能力实现更复杂自动化。
