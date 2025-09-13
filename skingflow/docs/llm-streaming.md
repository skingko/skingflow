# skingflow.js 流式 LLM 输出原理与实战

本节系统讲解如何用 skingflow.js 实现 LLM token 级流式输出，适用于实时对话、长文本生成等场景。

---

## 场景与目标
- 需要 LLM 一边生成一边输出，提升响应速度和交互体验。
- 适用于 AI 聊天、代码生成、内容创作等实时反馈场景。

## 核心原理与流程
- 利用 OpenAI 等大模型的流式接口，每收到一个 token 就 yield 给主流程。
- 节点必须 async generator，主流程用 for await...of 实时消费。

**流程图：**
```
[用户输入] → [LLMNode (async generator)] → (token) → [主流程 for await...of] → [终端输出]
```

## 关键节点结构说明
- **callLLMStream**：底层流式 LLM 调用，yield 每个 token
- **LLMNode**：业务节点，for await...of 消费 callLLMStream

## 典型代码片段
```js
// utils.js
export async function* callLLMStream(prompt) {
  // 代理支持见 skingflow-agent
  const client = new OpenAI({ /* ... */ });
  const stream = await client.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  });
  for await (const chunk of stream) {
    yield chunk.choices?.[0]?.delta?.content || '';
  }
}

// nodes.js
export async function* LLMNode(prompt) {
  for await (const token of callLLMStream(prompt)) {
    yield token;
  }
}
```

## 易错点与注意事项
- 节点未用 async generator 或未 yield，流式失效。
- 多次 process.stdout.write 可能导致输出重复。
- 代理配置需参考 skingflow-agent，避免网络异常。
- ESM 导入导出规范，避免 import/export 与 require 混用。

## PocketFlow 迁移经验
- Python 版通常用 yield/async for，js 需用 async generator 并 yield。
- skingflow.js 推荐将流式逻辑封装为工具函数，便于多节点复用。
- 日志建议可控，避免污染最终输出。
