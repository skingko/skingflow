# skingflow.js Map-Reduce 流程

本节讲解如何用 skingflow.js 实现 Map-Reduce 场景，适用于大规模文本处理、分布式推理、结果聚合等。

---

## 场景与目标
- 适用于大规模数据处理、分布式 LLM 推理、批量摘要等。
- 目标是将任务拆分为 map 阶段并发处理，再 reduce 阶段聚合结果。

## 核心原理与流程
- map 节点批量并发处理子任务。
- reduce 节点聚合所有 map 结果。

**流程图：**
```
[任务列表] → [Map节点(并发)] → [Reduce节点(聚合)] → [最终输出]
```

## 关键节点结构说明
- **MapNode**：批量并发处理输入任务
- **ReduceNode**：聚合 map 阶段所有结果

## 典型代码片段
```js
export async function* MapNode(tasks) {
  const results = await Promise.all(tasks.map(task => callLLMStream(task)));
  yield results;
}

export async function* ReduceNode(results) {
  // 例如聚合摘要、投票等
  yield results.join('\n');
}
```

## 易错点与注意事项
- map 阶段建议控制并发数，防止资源耗尽。
- reduce 阶段逻辑应灵活，支持多种聚合方式。
- 节点建议解耦，便于扩展与调试。

## PocketFlow 迁移经验
- Python 版常用 asyncio.gather/map-reduce，js 推荐 Promise.all/async generator。
- map/reduce 节点建议独立文件，便于维护。

## 实践建议/扩展思路
- 支持多层 map-reduce 嵌套，适配更复杂场景。
- 可结合结构化输出、批量并发等能力实现更强自动化。
