# skingflow-mcp

本示例基于 skingflow 框架，复刻 PocketFlow/cookbook/pocketflow-mcp 的核心功能，支持通过 Model Context Protocol (MCP) 动态获取工具列表、LLM 决策工具及参数、并调用工具执行任务。

## 目录结构
```
/nodejs/examples/skingflow-mcp/
  ├─ main.js         // 入口，主流程
  ├─ flow.js         // 定义流程
  ├─ nodes.js        // 各节点实现（GetToolsNode, DecideToolNode, ExecuteToolNode）
  ├─ utils.js        // 工具函数（callLLMStream, getTools, callTool 等）
  ├─ README.md       // 使用说明
```

## 主要功能
- 动态获取 MCP 工具列表
- LLM 分析问题并决策工具与参数
- 支持流式输出与 skingflow 节点规范
- 可切换 MCP/本地 mock 模式

## 使用方法
1. 安装依赖
2. 运行 main.js

后续可扩展更多 MCP 工具与复杂决策流程。
