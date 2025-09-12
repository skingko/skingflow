# skingflow.js 结构化输出（Structured Output）

本节详解如何用 skingflow.js 实现结构化输出，包括 JSON、表格、对象等，适用于信息抽取、自动标注、数据生成等场景。

---

## 场景与目标
- 适用于需要 LLM 输出严格结构化内容的应用，如 JSON、列表、表格等。
- 目标是让 LLM 按预期格式输出，便于后续自动处理。

## 核心原理与流程
- 节点 prompt 明确要求结构化格式（如 JSON Schema）。
- 结果用 JSON.parse/校验工具严格解析。

**流程图：**
```
[用户输入] → [结构化输出节点] → [格式校验/解析] → [后续处理]
```

## 关键节点结构说明
- **StructuredOutputNode**：构造带格式约束的 prompt，流式解析输出。
- **validateJson**：校验并解析 LLM 返回内容。

## 典型代码片段
```js
export async function* StructuredOutputNode(input, schema) {
  const prompt = `请按如下 JSON Schema 输出：${JSON.stringify(schema)}\n输入：${input}`;
  let result = '';
  for await (const chunk of callLLMStream(prompt)) {
    result += chunk;
    yield chunk;
  }
  try {
    const obj = JSON.parse(result);
    yield obj;
  } catch (e) {
    yield '解析失败';
  }
}
```

## 易错点与注意事项
- prompt 必须明确格式要求，防止 LLM 输出不规范。
- 建议用正则/JSON.parse 校验，必要时多轮修正。
- 结构化节点与后续处理解耦，便于扩展。

## PocketFlow 迁移经验
- Python 版常用 pydantic/jsonschema 校验，js 推荐 JSON.parse+自定义校验。
- prompt 设计与解析逻辑建议分离，便于调试。

## 实践建议/扩展思路
- 支持多种格式（YAML、CSV、表格等）。
- 可结合批量并发、RAG 等能力实现大规模结构化数据生成。
