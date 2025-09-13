# SkinFlow 项目结构

本文档描述了 SkinFlow 多智能体框架的完整项目结构和各个组件的职责。

## 📁 项目目录结构

```
skingflow/
├── README.md                           # 项目主文档
├── PROJECT_STRUCTURE.md                # 项目结构说明
├── package.json                        # Node.js 项目配置
├── .env.example                        # 环境变量示例
├── .gitignore                          # Git 忽略文件
│
├── lib/                                # 核心框架代码
│   ├── core/                          # 核心组件
│   │   ├── llm.js                     # LLM 抽象层
│   │   ├── memory.js                  # 基础记忆系统
│   │   └── tools.js                   # 工具注册和管理
│   │
│   └── multi-agent/                   # 多智能体系统
│       ├── index.js                   # 框架主入口
│       │
│       ├── agents/                    # 智能体实现
│       │   ├── planning-agent.js      # 规划智能体
│       │   └── sub-agent-manager.js   # 子智能体管理器
│       │
│       ├── memory/                    # 高级记忆系统
│       │   └── advanced-memory.js     # 记忆管理实现
│       │
│       ├── tools/                     # 内置工具
│       │   ├── write_todos.yaml       # 任务管理工具定义
│       │   ├── write_todos.js         # 任务管理工具实现
│       │   ├── write_file.xml         # 文件写入工具定义
│       │   ├── write_file.js          # 文件写入工具实现
│       │   ├── read_file.yaml         # 文件读取工具定义
│       │   ├── read_file.js           # 文件读取工具实现
│       │   ├── edit_file.yaml         # 文件编辑工具定义
│       │   ├── edit_file.js           # 文件编辑工具实现
│       │   ├── ls.xml                 # 文件列表工具定义
│       │   └── ls.js                  # 文件列表工具实现
│       │
│       ├── filesystem/                # 虚拟文件系统
│       │   └── virtual-fs.js          # 虚拟文件系统实现
│       │
│       └── resilience/                # 可靠性组件
│           └── fallback-manager.js    # 降级和错误处理
│
├── docs/                              # 详细文档
│   ├── installation.md               # 安装配置指南
│   ├── basic-usage.md                # 基础使用教程
│   ├── advanced-config.md            # 高级配置
│   ├── tools.md                      # 工具系统文档
│   ├── memory.md                     # 记忆系统文档
│   ├── agents.md                     # 智能体系统文档
│   ├── api-reference.md              # API 参考
│   ├── best-practices.md             # 最佳实践
│   └── troubleshooting.md            # 故障排除
│
├── examples/                          # 示例项目
│   ├── quick-start/                   # 快速开始示例
│   │   ├── README.md                  # 示例说明
│   │   ├── package.json               # 示例依赖
│   │   ├── index.js                   # 示例主文件
│   │   └── env.example                # 示例环境配置
│   │
│   ├── intelligent-assistant/         # 智能助手示例
│   ├── content-creation/              # 内容创作示例
│   ├── data-analysis/                 # 数据分析示例
│   └── web-app-generator/             # Web应用生成示例
│
├── tests/                             # 测试文件
│   ├── unit/                          # 单元测试
│   ├── integration/                   # 集成测试
│   └── e2e/                           # 端到端测试
│
└── scripts/                           # 工具脚本
    ├── setup.js                       # 项目设置脚本
    ├── build.js                       # 构建脚本
    └── deploy.js                      # 部署脚本
```

## 🏗️ 核心组件说明

### lib/core/ - 核心组件

#### llm.js - LLM 抽象层
- **职责**: 统一不同 LLM 提供商的接口
- **功能**: 
  - 支持 OpenAI、Anthropic、Ollama 等
  - 流式响应处理
  - 错误重试和降级
  - 配置管理

#### memory.js - 基础记忆系统
- **职责**: 提供基础的记忆存储和检索功能
- **功能**:
  - 记忆的 CRUD 操作
  - 查询构建器
  - 存储适配器接口

#### tools.js - 工具系统
- **职责**: 工具的注册、管理和执行
- **功能**:
  - 工具定义解析 (YAML/XML)
  - 参数验证
  - 工具执行上下文管理

### lib/multi-agent/ - 多智能体系统

#### index.js - 框架主入口
- **职责**: 框架的初始化和协调
- **功能**:
  - 组件初始化
  - 请求处理流程
  - 会话管理
  - 统计信息收集

#### agents/ - 智能体实现

##### planning-agent.js - 规划智能体
- **职责**: 任务分析和执行计划制定
- **功能**:
  - 请求复杂度分析
  - 任务分解
  - 子智能体选择
  - 执行顺序规划

##### sub-agent-manager.js - 子智能体管理器
- **职责**: 专业子智能体的管理和调度
- **功能**:
  - 子智能体注册
  - 任务分配
  - 执行监控
  - 结果整合

#### memory/ - 高级记忆系统

##### advanced-memory.js - 高级记忆管理
- **职责**: 基于 mem0 架构的高级记忆功能
- **功能**:
  - 短期/长期记忆分类
  - 语义搜索
  - 记忆整合
  - 用户偏好管理

#### tools/ - 内置工具集

每个工具包含两个文件：
- **定义文件** (.yaml/.xml): 工具的接口定义
- **实现文件** (.js): 工具的具体实现

##### 工具列表:
- `write_todos`: 任务管理和规划
- `write_file`: 虚拟文件创建
- `read_file`: 虚拟文件读取
- `edit_file`: 虚拟文件编辑
- `ls`: 虚拟文件系统浏览

#### filesystem/ - 虚拟文件系统

##### virtual-fs.js - 虚拟文件系统
- **职责**: 提供安全的文件操作环境
- **功能**:
  - 内存文件存储
  - 文件版本控制
  - 权限管理
  - 元数据管理

#### resilience/ - 可靠性组件

##### fallback-manager.js - 降级管理器
- **职责**: 系统可靠性和错误恢复
- **功能**:
  - 多层降级策略
  - 熔断器模式
  - 重试机制
  - 健康监控

## 📚 文档结构

### docs/ - 文档目录

- **installation.md**: 详细的安装和环境配置指南
- **basic-usage.md**: 从零开始的使用教程
- **advanced-config.md**: 高级特性和自定义配置
- **tools.md**: 工具开发和集成指南
- **memory.md**: 记忆系统的详细说明
- **agents.md**: 多智能体协作机制
- **api-reference.md**: 完整的 API 文档
- **best-practices.md**: 生产环境最佳实践
- **troubleshooting.md**: 常见问题和解决方案

## 🎯 示例项目

### examples/ - 示例目录

#### quick-start/ - 快速开始
- **目标**: 5分钟快速体验框架核心功能
- **内容**: 基础配置、简单对话、任务规划

#### intelligent-assistant/ - 智能助手
- **目标**: 完整的对话式智能助手应用
- **内容**: 交互界面、记忆管理、多轮对话

#### content-creation/ - 内容创作
- **目标**: 自动化内容生成和编辑
- **内容**: 文章写作、代码生成、文档创建

#### data-analysis/ - 数据分析
- **目标**: 智能数据处理和分析
- **内容**: 数据清洗、统计分析、可视化

#### web-app-generator/ - Web应用生成
- **目标**: 自动化Web应用开发
- **内容**: 代码生成、文件组织、项目结构

## 🔧 配置文件

### package.json
```json
{
  "name": "skingflow",
  "type": "module",
  "main": "lib/multi-agent/index.js",
  "exports": {
    ".": "./lib/multi-agent/index.js",
    "./core/*": "./lib/core/*",
    "./tools/*": "./lib/multi-agent/tools/*"
  }
}
```

### .env.example
包含所有可配置的环境变量示例，涵盖：
- LLM 配置
- 数据库配置
- 调试选项
- 性能参数

## 🚀 扩展点

### 1. 自定义工具开发
- 在 `tools/` 目录添加 YAML/XML 定义
- 实现对应的 JavaScript 文件
- 通过配置启用

### 2. 新的子智能体
- 继承 `SubAgent` 基类
- 实现专业化逻辑
- 在管理器中注册

### 3. 存储适配器
- 实现 `MemoryStorage` 接口
- 支持新的数据库类型
- 配置中指定使用

### 4. LLM 提供商
- 实现 `LLMProvider` 接口
- 处理特定的 API 格式
- 在工厂中注册

## 📈 性能特性

### 1. 异步处理
- 所有 I/O 操作异步执行
- 支持并发请求处理
- 流式响应减少延迟

### 2. 内存管理
- 智能记忆压缩
- LRU 缓存策略
- 自动清理过期数据

### 3. 错误恢复
- 多层降级机制
- 自动重试逻辑
- 熔断器保护

### 4. 可观测性
- 详细的日志记录
- 性能指标收集
- 健康状态监控

## 🔒 安全特性

### 1. 虚拟文件系统
- 隔离的文件操作环境
- 防止路径遍历攻击
- 文件大小和类型限制

### 2. 参数验证
- 严格的输入验证
- 类型检查和范围限制
- SQL 注入防护

### 3. 权限控制
- 工具执行权限管理
- 用户数据隔离
- API 访问控制

---

这个项目结构设计确保了：
- **模块化**: 组件职责清晰，易于维护
- **可扩展**: 支持自定义工具和智能体
- **可测试**: 每个组件都可以独立测试
- **文档完善**: 用户能够快速上手和深入学习
- **生产就绪**: 具备完整的错误处理和监控能力
