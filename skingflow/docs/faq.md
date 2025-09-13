# skingflow.js 常见问题与调试FAQ

本节总结开发 skingflow.js 项目中遇到的典型报错、排查方法与经验建议，帮助你高效定位和解决问题。

---

## 典型报错与排查
- **TypeError: not async iterable**
  - 检查节点是否 async generator 并 yield。
  - 检查主流程是否用 for await...of 消费节点。
- **callLLMStream 不是函数/async iterable**
  - 检查 import/export 路径和声明，确保 utils.js 正确导出。
  - 检查函数声明是否为 async *。
- **代理无效**
  - 检查 fetch/agent 配置，环境变量（https_proxy/http_proxy/all_proxy）是否生效。
  - 参考 skingflow-agent 的代理实现。
- **输出内容重复或乱码**
  - 检查流式输出逻辑，避免多次 process.stdout.write。
  - 节点只 yield，不直接打印。
- **ESM/CJS 混用报错**
  - package.json 应声明 "type": "module"，只用 import/export。
  - 不可混用 require/module.exports。
- **YAML 解析失败**
  - LLM prompt 示例需详细，格式要严格。
  - 建议用正则或 robust 解析方式。

## 调试建议
- 增加日志，逐步定位流程与变量。
- 日志建议可配置开关，避免污染最终输出。
- 终端/用户界面只输出最终答案时，主流程应移除所有执行过程相关 log。
- 复杂流程建议先画流程图，梳理节点依赖关系。

## 其它开发经验
- 节点职责单一，便于组合与复用。
- shared/context 用于节点间传递全局变量。
- 支持本地 mock 与远程服务切换，便于开发调试。
- 最好为每个核心流程写单元测试。
