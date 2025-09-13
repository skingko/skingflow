# skingflow.js 批量并发与任务调度

本节介绍如何用 skingflow.js 实现批量任务并发处理、自动调度与错误恢复，适用于大规模数据处理、批量问答、自动化内容生成等场景。

---

## 场景与目标
- 适用于需要高吞吐、自动重试的 LLM 应用。
- 支持任务批量分发、并发执行、失败重试与结果聚合。

## 核心原理与流程
- 通过任务队列与并发控制（如 Promise.all、p-limit）实现批量调度。
- 每个任务节点独立运行，支持流式输出与错误隔离。

**流程图：**
```
[任务列表] → [调度节点] → [并发执行节点] → [结果聚合节点]
```

## 关键节点结构说明
- **BatchSchedulerNode**：调度与分发任务
- **WorkerNode**：并发执行单个任务
- **ResultAggregatorNode**：聚合所有结果

## 典型代码片段
```js
import pLimit from 'p-limit';

export async function* BatchSchedulerNode(tasks, limit = 5) {
  const limiter = pLimit(limit);
  const results = await Promise.all(tasks.map(task =>
    limiter(() => WorkerNode(task))
  ));
  yield* ResultAggregatorNode(results);
}

export async function* WorkerNode(task) {
  for await (const chunk of callLLMStream(task)) {
    yield chunk;
  }
}

export async function* ResultAggregatorNode(results) {
  yield results.join('\n');
}
```

## 易错点与注意事项
- 并发数建议可配置，避免资源耗尽。
- 每个 WorkerNode 应独立 try/catch，防止单点失败。
- 任务结果建议统一聚合，便于后续处理。
- 日志、代理、环境变量等建议参考 skingflow-agent。

## PocketFlow 迁移经验
- Python 版常用 asyncio.gather，js 推荐 Promise.all + async generator。
- 节点建议解耦，便于扩展和调试。

## 实践建议/扩展思路
- 支持分布式调度与多机并发。
- 可结合多智能体、RAG 等高级能力实现更复杂批量自动化。
