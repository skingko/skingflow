# skingflow.js 集成 MCP 工具调用详解

本节介绍如何用 skingflow.js 实现 Model Context Protocol（MCP）动态工具链调用，结合 pocketflow-mcp 经验，助力 LLM 智能决策与自动执行。

---

## 场景与目标
- 让 LLM 能自动获取、解析并调用外部工具，支持复杂任务自动化。
- 适用于智能问答、数据处理、自动运维等场景。

## 核心原理与流程
- 通过 MCP 协议获取工具列表，格式化为 action space
- LLM 结合 action space 和用户问题，决策调用哪个工具及参数
- 自动调用工具并返回结果

**流程图：**
```
[用户问题] → [GetToolsNode] → [DecideToolNode (LLM分析)] → [ExecuteToolNode] → [结果输出]
```

## 关键节点结构说明
- **GetToolsNode**：获取并格式化 MCP 工具列表
- **DecideToolNode**：构造 prompt，流式 LLM 解析 action space 并决策
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
