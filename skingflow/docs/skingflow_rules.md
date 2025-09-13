# skingflow.js 开发规范与经验总结

## 节点与流式输出
- 节点需实现为 `async *execAsyncStream(...)`（async generator），并在内部 `yield` 每个 token，实现流式 LLM 输出。
- 主流程通过 `for await...of node.execAsyncStream(...)` 实现流式消费。
- 若节点未实现 async generator 或未 yield，将导致 TypeError: not async iterable。

## 代理与网络配置
- OpenAI API 调用需支持代理，优先读取 `https_proxy`、`http_proxy`、`all_proxy` 环境变量。
- fetch 实例应正确传递 agent。

## ESM/require 规范
- 项目采用 ESM（import/export），所有工具函数应用 `export` 导出，`import` 导入。
- 不可混用 CommonJS 的 require/module.exports，否则会导致 undefined 或类型错误。

## 其它注意事项
- 搜索节点应优先返回摘要，若无摘要需 fallback 至知识库或 LLM 自身知识。
- 过程日志、调试 log 应可配置关闭，避免污染最终输出。
- 终端/用户界面只输出最终答案时，主流程应移除所有执行过程相关 log。

## 常见 bug 及排查
- TypeError: not async iterable：检查 execAsyncStream 是否为 async generator 并 yield。
- callLLMStream 不是函数或 async iterable：检查导入导出方式、函数声明是否为 async *。
- 代理无效：检查 fetch/agent 配置，确保环境变量生效。
- 输出内容重复或乱码：检查流式输出逻辑，避免多次 process.stdout.write。

---

本规范适用于 skingflow.js 及基于 skingflow 的所有 LLM 自动化项目。
