# skingflow-mcp 教程：MCP 工具链集成与原理详解

本节系统讲解如何用 skingflow.js 实现 PocketFlow/cookbook/pocketflow-mcp 的动态工具链调用，涵盖原理、流程、结构图与迁移经验。

---

## 场景与目标
- 让 LLM 能自动发现、理解并调用外部工具，提升智能自动化能力。
- 适用于复杂问答、自动运维、数据处理等场景。

## 核心原理与流程
- 通过 MCP 协议获取工具列表，格式化为 action space
- LLM 结合 action space 和用户问题，决策调用哪个工具及参数
- 自动调用工具并返回结果

**流程结构图：**
```
[用户问题] → [GetToolsNode] → [DecideToolNode (LLM分析)] → [ExecuteToolNode] → [结果输出]
```

## 关键节点结构说明
- **GetToolsNode**：获取 MCP 工具列表，格式化为 action space
- **DecideToolNode**：构造 prompt，流式 LLM 决策
- **ExecuteToolNode**：根据 LLM 决策调用工具

## 典型代码片段
```js
// nodes.js
export const GetToolsNode = {
  async execAsync(shared) {
    const tools = await getTools();
    shared.tools = tools;
    shared.toolInfo = tools.map(/* ...格式化... */).join('\n');
    return 'decide';
  }
};

export const DecideToolNode = {
  async execAsync(shared) {
    const prompt = `...${shared.toolInfo}...${shared.question}...`;
    let response = '';
    for await (const chunk of callLLMStream(prompt)) {
      response += chunk;
    }
    // 解析 YAML，存入 shared
    return 'execute';
  }
};

export const ExecuteToolNode = {
  async execAsync(shared) {
    const result = await callTool(shared.toolName, shared.parameters);
    return null;
  }
};
```

## 易错点与注意事项
- 工具 schema 需格式化清晰，便于 LLM 理解。
- LLM prompt 需详细、示例明确，避免 YAML 解析失败。
- 支持本地 mock 与远程 MCP 切换，便于开发调试。
- 代理配置建议参考 skingflow-agent。

## PocketFlow 迁移经验
- Python 版通常用类+方法，js 推荐用对象+async 方法。
- skingflow.js 强调 ESM 规范与流式 LLM 调用。
- 工具参数建议用标准 JSON schema，便于 LLM 解析。
- 详见 skingflow-mcp 目录和 utils.js 代码。
