# skingflow.js 检索增强生成（RAG）详解

本节系统讲解如何用 skingflow.js 实现 Retrieval-Augmented Generation（RAG）模式，结合外部知识库/搜索与 LLM，提升复杂任务的知识覆盖与准确率。

---

## 场景与目标
- 适用于需要外部知识、上下文增强的 LLM 应用，如智能问答、企业知识助手、文档摘要等。
- 目标是让 LLM 先检索相关资料，再生成高质量答案。

## 核心原理与流程
- 检索节点优先返回摘要，无摘要时 fallback 至知识库或 LLM 自身知识。
- 支持多轮检索与生成，提升鲁棒性。

**流程图：**
```
[用户问题] → [检索节点] → [相关资料] → [LLM生成节点] → [答案输出]
           ↘（无资料）→ [LLM直接生成]
```

## 关键节点结构说明
- **searchDocs**：检索外部知识库，返回相关文档
- **RAGNode**：先检索再生成，自动 fallback

## 典型代码片段
```js
export async function* RAGNode(query) {
  const docs = await searchDocs(query);
  if (docs.length > 0) {
    yield* callLLMStream(`请基于以下资料回答：${docs.join('\n')}`);
  } else {
    yield* callLLMStream(query);
  }
}
```

## 易错点与注意事项
- 检索节点应优先返回摘要，提升答案准确率。
- fallback 逻辑要健壮，避免检索失败导致流程中断。
- 检索与生成建议分离，便于调试与扩展。
- 代理、环境变量、流式输出等建议参考 skingflow-agent。

## PocketFlow 迁移经验
- Python 版常用 yield/async for，js 推荐 async generator 并 yield。
- 检索节点建议封装为工具函数，便于多流程复用。
- 日志建议可控，避免污染最终输出。
