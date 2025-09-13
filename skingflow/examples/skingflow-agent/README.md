# skingflow-agent

这是一个基于 [skingflow](../../skingflow) 库的 Node.js 版 pocketflow-agent，复刻自 Python 版 [PocketFlow/cookbook/pocketflow-agent](../../../PocketFlow/cookbook/pocketflow-agent)。

## 主要功能
- 智能决策：判断是否需要联网搜索还是直接回答
- 联网搜索：自动调用搜索引擎获取信息
- LLM 回答：调用大模型生成最终答案

## 用法
```bash
npm install
npm start -- --你的问题
```

如：
```bash
npm start -- --Who won the Nobel Prize in Physics 2024?
```

## 文件结构
- main.js         入口，读取问题并运行 agent
- flow.js         定义 agent 流程
- nodes.js        各节点逻辑（决策、搜索、回答）
- utils.js        LLM 和搜索工具

## 依赖
- skingflow（本地依赖）
- openai（如需接入 OpenAI，可选）

## 环境变量
如需调用 OpenAI，请设置 OPENAI_API_KEY。

---
本项目为教学/演示用途，欢迎二次开发。
