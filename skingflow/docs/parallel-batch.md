# skingflow.js 并行批量（Parallel Batch）与嵌套批量

本节讲解如何用 skingflow.js 实现多层并行批量与嵌套批量任务调度，适用于大规模复杂流程。

---

## 场景与目标
- 适用于需要多层并发、批量嵌套的 LLM 应用。
- 目标是实现任务树状分发、分层聚合、最大化吞吐。

## 核心原理与流程
- 多层批量节点递归调度任务。
- 每层可独立配置并发数、聚合逻辑。

**流程图：**
```
[任务树] → [批量分发节点(递归)] → [并发执行节点] → [分层聚合节点]
```

## 关键节点结构说明
- **ParallelBatchNode**：递归调度批量任务
- **NestedWorkerNode**：并发执行单节点任务
- **LayerAggregatorNode**：分层聚合结果

## 典型代码片段
```js
export async function* ParallelBatchNode(taskTree, limit = 5) {
  if (Array.isArray(taskTree)) {
    const results = await Promise.all(taskTree.map(task => NestedWorkerNode(task, limit)));
    yield* LayerAggregatorNode(results);
  } else {
    yield* NestedWorkerNode(taskTree, limit);
  }
}

export async function* NestedWorkerNode(task, limit) {
  // 递归处理子任务或单任务
  if (Array.isArray(task)) {
    yield* ParallelBatchNode(task, limit);
  } else {
    for await (const chunk of callLLMStream(task)) {
      yield chunk;
    }
  }
}

export async function* LayerAggregatorNode(results) {
  yield results.flat().join('\n');
}
```

## 易错点与注意事项
- 递归批量建议防止无限嵌套，合理设置深度。
- 每层并发数建议独立配置，防止资源耗尽。
- 结果聚合建议分层处理，便于调试。

## PocketFlow 迁移经验
- Python 版常用递归/asyncio.gather，js 推荐递归 async generator + Promise.all。
- 节点建议分层独立，便于维护。

## 实践建议/扩展思路
- 支持分布式批量调度、多机并发。
- 可结合 map-reduce、majority-vote 等能力实现更复杂自动化。
