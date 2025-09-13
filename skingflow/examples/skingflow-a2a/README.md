# skingflow-a2a 示例

本项目完整复刻 PocketFlow/cookbook/pocketflow-a2a 的 Agent-to-Agent（A2A）智能体协作逻辑，全部基于 skingflow.js 实现，适用于多智能体分工、链式推理、复杂任务协同等场景。

## 目录结构
- main.js         // 入口，命令行读取问题并运行 agent flow
- nodes.js        // 定义所有 agent 节点（决策、搜索、回答等）
- utils.js        // LLM、Web 搜索等工具函数，调用 skingflow.js 实际能力
- flow.js         // agent flow 节点连接逻辑
- package.json    // 依赖与启动脚本
- README.md

## 快速开始
```bash
npm install
npm start -- "你的问题内容"
```

## 主要特性
- 完整复刻决策、搜索、回答、上下文流转等 PocketFlow 逻辑
- 全部节点用 async generator 形式实现，支持流式协作
- LLM 与 Web 搜索均调用 skingflow.js 实际能力

## 参考
- [PocketFlow/cookbook/pocketflow-a2a](../../../../PocketFlow/cookbook/pocketflow-a2a)
- [skingflow.js 文档](../../skingflow/docs)
