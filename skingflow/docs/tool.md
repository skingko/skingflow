# skingflow.js 工具节点与插件机制（Tool/Plugin）

本节详解如何用 skingflow.js 实现工具节点（Tool Node）与插件化机制，适用于 LLM+外部工具调用、自动化扩展、知识增强等场景。

---

## 场景与目标
- 适用于需要 LLM 自动调用外部 API、数据库、搜索、知识库等工具的场景。
- 目标是让工具节点可插拔、可扩展，支持多种外部能力。

## 核心原理与流程
- 工具节点统一接口，按需动态加载。
- 工具执行结果可流式返回或结构化输出。

**流程图：**
```
[用户输入] → [工具决策节点] → [工具节点(插件)] → [结果输出]
```

## 关键节点结构说明
- **ToolDecideNode**：根据上下文/LLM决策选择工具
- **ToolNode**：实现具体工具（如搜索、数据库、PDF等）
- **ToolRegistry**：统一注册与动态加载工具

## 典型代码片段
```js
export class ToolRegistry {
  constructor() { this.tools = {}; }
  register(name, tool) { this.tools[name] = tool; }
  get(name) { return this.tools[name]; }
}

export async function* ToolDecideNode(input, registry) {
  // 例：LLM 决策选择工具
  const toolName = await decideToolByLLM(input, registry);
  yield* registry.get(toolName)(input);
}

export async function* ToolNode(input) {
  // 如搜索、数据库查询等
  yield `工具处理结果: ${input}`;
}
```

## 易错点与注意事项
- 工具节点建议统一接口（如 async generator），便于插件化。
- 工具注册与加载建议解耦，支持热插拔。
- 工具执行异常建议兜底处理，防止流程中断。

## PocketFlow 迁移经验
- Python 版常用工具类/注册表，js 推荐对象注册+async generator。
- 工具节点建议独立文件，便于维护与扩展。

## 实践建议/扩展思路
- 支持多类型工具（API、数据库、PDF、搜索等）。
- 可结合 agent、RAG、批量等能力实现更复杂自动化。
