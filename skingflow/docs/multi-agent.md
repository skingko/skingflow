# skingflow.js 多智能体（Multi-Agent）协作详解

本节介绍如何用 skingflow.js 实现多智能体协作、分工与信息流转，适合复杂任务拆解、专家协同等场景。

---

## 场景与目标
- 适用于需要多个 agent 分工协作、互相调用的复杂流程（如专家问诊、AI 评审、团队决策等）。
- 目标是 agent 间信息流转、结果整合，提升系统智能。

## 核心原理与流程
- 每个 agent 节点为 async generator，主流程可动态调度多个 agent。
- 支持主-子 agent、peer-to-peer、树状等多种协作结构。

**结构图（主-子 agent）：**
```
[主Agent] → [子Agent1]
         ↘ [子Agent2]
         ↘ [子Agent3]
```

## 关键节点结构说明
- **SupervisorAgent**：主调度 agent，分发任务给各子 agent
- **WorkerAgent**：子 agent，处理分配到的具体任务

## 典型代码片段
```js
export async function* SupervisorAgent(taskList) {
  for (const task of taskList) {
    yield* WorkerAgent(task);
  }
}

export async function* WorkerAgent(task) {
  // ... LLM/工具调用
  yield `完成任务: ${task}`;
}
```

## 易错点与注意事项
- 各 agent 必须 async generator 并 yield，才能流式协作。
- 主 agent 调度建议支持异常兜底、任务重试。
- agent 间信息建议结构化传递，避免混乱。

## PocketFlow 迁移经验
- Python 版常用类+方法，js 推荐用 async generator。
- skingflow.js 支持多层嵌套、动态 agent 调度。
- 复杂协作建议先画结构图梳理关系。
