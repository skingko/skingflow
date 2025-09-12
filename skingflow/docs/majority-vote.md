# skingflow.js 多轮投票与结果裁决（Majority Vote）

本节讲解如何用 skingflow.js 实现多轮投票、裁决机制，适用于答案一致性增强、自动纠错等场景。

---

## 场景与目标
- 适用于 LLM 多轮输出一致性增强、自动纠错、答案裁决等。
- 目标是让多个 LLM/agent 输出投票，最终裁决最优结果。

## 核心原理与流程
- 多 agent/LLM 并发输出候选答案。
- 投票节点统计并裁决最终输出。

**流程图：**
```
[输入] → [多agent/LLM节点(并发)] → [投票节点] → [最终答案]
```

## 关键节点结构说明
- **AgentNode**：并发生成候选答案
- **VoteNode**：统计投票并裁决输出

## 典型代码片段
```js
export async function* AgentNode(input, n = 3) {
  const results = await Promise.all(Array(n).fill().map(() => callLLMStream(input)));
  yield results;
}

export async function* VoteNode(results) {
  const count = {};
  for (const r of results) count[r] = (count[r] || 0) + 1;
  const sorted = Object.entries(count).sort((a,b) => b[1]-a[1]);
  yield sorted[0][0];
}
```

## 易错点与注意事项
- agent/LLM 输出建议去重，防止重复投票。
- 投票规则建议可配置（如多数、置信度等）。
- 节点建议解耦，便于扩展多种裁决方式。

## PocketFlow 迁移经验
- Python 版常用 Counter/majority_vote，js 推荐对象计数+排序。
- agent/vote 节点建议独立封装，便于维护。

## 实践建议/扩展思路
- 支持多层投票、置信度加权等复杂裁决。
- 可结合批量并发、结构化输出等实现更强自动化。
