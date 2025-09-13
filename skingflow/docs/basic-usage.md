# 基础使用教程

本教程将带你从零开始学会使用 SkinFlow 多智能体框架，通过实际示例掌握核心功能。

## 目录

- [创建第一个应用](#创建第一个应用)
- [理解核心概念](#理解核心概念)
- [基础配置](#基础配置)
- [处理请求](#处理请求)
- [使用工具系统](#使用工具系统)
- [记忆管理](#记忆管理)
- [智能体协作](#智能体协作)
- [错误处理](#错误处理)

## 创建第一个应用

### 1. 项目初始化

```bash
mkdir my-first-agent
cd my-first-agent
npm init -y
echo '{"type": "module"}' > package.json && npm init -y
npm install skingflow dotenv
```

### 2. 环境配置

创建 `.env` 文件：

```env
# LLM 配置 - 使用 OpenAI
LLM_PROVIDER=http
LLM_BASE_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-3.5-turbo

# 数据库配置 - 使用 SQLite（简单开始）
DB_TYPE=sqlite
SQLITE_PATH=./data/app.db

# 调试配置
DEBUG_ENABLED=true
LOG_LEVEL=info
```

### 3. 创建基础应用

创建 `app.js`：

```javascript
import { createMultiAgentFramework } from 'skingflow';
import dotenv from 'dotenv';
import fs from 'fs';

// 加载环境变量
dotenv.config();

// 确保数据目录存在
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

async function main() {
  console.log('🚀 启动 SkinFlow 应用...\n');
  
  try {
    // 1. 创建框架配置
    const config = {
      // LLM 配置
      llm: {
        provider: process.env.LLM_PROVIDER,
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL,
        temperature: 0.7,
        maxTokens: 2000
      },
      
      // 记忆系统配置
      memory: {
        storage: {
          type: process.env.DB_TYPE,
          config: {
            database: process.env.SQLITE_PATH
          }
        }
      },
      
      // 启用内置工具
      builtinTools: ['write_todos', 'write_file', 'read_file', 'ls'],
      
      // 调试模式
      debug: process.env.DEBUG_ENABLED === 'true'
    };
    
    // 2. 初始化框架
    const framework = await createMultiAgentFramework(config);
    console.log('✅ 框架初始化成功！\n');
    
    // 3. 处理一系列示例请求
    await runExamples(framework);
    
    // 4. 清理资源
    await framework.close();
    console.log('\n👋 应用结束');
    
  } catch (error) {
    console.error('❌ 应用运行失败:', error.message);
    process.exit(1);
  }
}

async function runExamples(framework) {
  const examples = [
    {
      name: '简单对话',
      request: '你好！请介绍一下你的功能',
      userId: 'demo-user-1'
    },
    {
      name: '任务规划',
      request: '帮我制定一个学习 JavaScript 的计划',
      userId: 'demo-user-1'
    },
    {
      name: '文件操作',
      request: '创建一个简单的 HTML 页面，包含标题和欢迎信息',
      userId: 'demo-user-2'
    }
  ];
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    console.log(`📝 示例 ${i + 1}: ${example.name}`);
    console.log(`请求: ${example.request}\n`);
    
    try {
      const startTime = Date.now();
      const result = await framework.processRequest(
        example.request,
        { userId: example.userId }
      );
      
      const duration = Date.now() - startTime;
      
      console.log('✅ 处理成功:');
      console.log(`   耗时: ${duration}ms`);
      console.log(`   子智能体: ${result.subAgentsUsed}`);
      console.log(`   存储记忆: ${result.memoriesStored}`);
      
      if (result.todosCompleted > 0) {
        console.log(`   完成任务: ${result.todosCompleted}`);
      }
      
      if (result.files && Object.keys(result.files).length > 0) {
        console.log(`   创建文件: ${Object.keys(result.files).join(', ')}`);
      }
      
      console.log(`   响应: ${result.response?.substring(0, 100)}...\n`);
      
    } catch (error) {
      console.error(`❌ 处理失败: ${error.message}\n`);
    }
  }
}

// 启动应用
main();
```

### 4. 运行应用

```bash
node app.js
```

预期输出：
```
🚀 启动 SkinFlow 应用...

✅ 框架初始化成功！

📝 示例 1: 简单对话
请求: 你好！请介绍一下你的功能

✅ 处理成功:
   耗时: 2341ms
   子智能体: 1
   存储记忆: 1
   响应: 你好！我是一个多智能体系统，具备以下核心功能...

📝 示例 2: 任务规划
请求: 帮我制定一个学习 JavaScript 的计划

✅ 处理成功:
   耗时: 3567ms
   子智能体: 1
   存储记忆: 2
   完成任务: 1
   响应: 我为你制定了一个详细的 JavaScript 学习计划...
```

## 理解核心概念

### 多智能体架构

SkinFlow 采用分层的多智能体架构：

```
用户请求 → 规划智能体 → 子智能体 → 工具执行 → 结果返回
    ↓           ↓            ↓          ↓         ↓
  解析需求   制定计划    专业执行   具体操作   整合输出
```

### 核心组件说明

1. **规划智能体 (Planning Agent)**
   - 分析用户请求复杂度
   - 制定执行计划和任务分解
   - 选择合适的子智能体

2. **子智能体 (Sub-Agents)**
   - `general-purpose`: 通用任务处理
   - `research-agent`: 信息收集和分析
   - `code-agent`: 编程和技术实现
   - `data-agent`: 数据处理和分析
   - `content-agent`: 内容创作和编辑

3. **记忆系统 (Memory System)**
   - 短期记忆：会话上下文
   - 长期记忆：持久化知识
   - 用户偏好：个性化设置

4. **工具系统 (Tool System)**
   - 内置工具：文件操作、任务管理等
   - 自定义工具：扩展功能
   - 工具链：复合操作

## 基础配置

### 最小配置

```javascript
const minimalConfig = {
  llm: {
    provider: 'http',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'your-api-key',
    model: 'gpt-3.5-turbo'
  },
  memory: {
    storage: {
      type: 'sqlite',
      config: { database: ':memory:' } // 内存数据库，重启后清空
    }
  }
};
```

### 推荐配置

```javascript
const recommendedConfig = {
  // LLM 配置
  llm: {
    provider: 'http',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.LLM_API_KEY,
    model: 'gpt-4', // 更好的推理能力
    temperature: 0.7, // 平衡创造性和一致性
    maxTokens: 4000, // 支持更长的响应
    timeout: 30000 // 30秒超时
  },
  
  // 记忆配置
  memory: {
    storage: {
      type: 'postgres', // 生产环境推荐
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: process.env.DB_PASSWORD
      }
    },
    maxShortTermMemories: 100,
    maxLongTermMemories: 5000,
    enableSemanticSearch: true
  },
  
  // 工具配置
  builtinTools: ['write_todos', 'write_file', 'read_file', 'edit_file', 'ls'],
  customToolsDirectory: './tools',
  
  // 智能体配置
  agents: {
    planning: { enabled: true },
    subAgents: ['general-purpose', 'research-agent', 'code-agent']
  },
  
  // 降级配置
  fallback: {
    maxRetries: 3,
    enableDegradedMode: true
  }
};
```

## 处理请求

### 基本请求处理

```javascript
// 简单请求
const result = await framework.processRequest(
  '今天天气怎么样？',
  { userId: 'user123' }
);

console.log(result.response);
```

### 带上下文的请求

```javascript
// 带用户上下文的请求
const result = await framework.processRequest(
  '根据我的偏好推荐一些书籍',
  {
    userId: 'user123',
    sessionId: 'session456',
    preferences: {
      genres: ['科技', '历史'],
      difficulty: 'intermediate'
    }
  }
);
```

### 复杂任务请求

```javascript
// 需要多步骤处理的复杂请求
const result = await framework.processRequest(
  '创建一个包含用户登录功能的网页应用，需要HTML、CSS和JavaScript文件，并且要有响应式设计',
  {
    userId: 'developer123',
    context: {
      projectType: 'web-app',
      requirements: ['responsive', 'modern-ui', 'accessibility']
    }
  }
);

// 检查创建的文件
if (result.files) {
  console.log('创建的文件:');
  Object.keys(result.files).forEach(filename => {
    console.log(`- ${filename} (${result.files[filename].size} bytes)`);
  });
}
```

### 批量请求处理

```javascript
async function processBatch(framework, requests) {
  const results = [];
  
  for (const request of requests) {
    try {
      const result = await framework.processRequest(
        request.content,
        { userId: request.userId }
      );
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}

const requests = [
  { content: '解释什么是机器学习', userId: 'student1' },
  { content: '写一个排序算法', userId: 'student2' },
  { content: '分析这个数据集', userId: 'analyst1' }
];

const results = await processBatch(framework, requests);
```

## 使用工具系统

### 查看可用工具

```javascript
// 获取所有可用工具
const tools = framework.tools.getAll();
console.log('可用工具:');
tools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

### 直接使用工具

```javascript
// 直接调用工具
const result = await framework.tools.execute(
  'write_file',
  {
    filename: 'hello.txt',
    content: 'Hello, World!'
  },
  { session: { files: {} } }
);

console.log(result); // "File "hello.txt" written successfully (13 bytes)"
```

### 创建简单的自定义工具

创建 `tools/calculator.js`：

```javascript
// 简单的计算器工具
export async function execute(params, context) {
  const { expression } = params;
  
  try {
    // 安全的表达式计算（生产环境需要更严格的验证）
    const result = eval(expression);
    return `计算结果: ${expression} = ${result}`;
  } catch (error) {
    throw new Error(`计算错误: ${error.message}`);
  }
}
```

创建 `tools/calculator.yaml`：

```yaml
name: calculator
description: 简单的数学计算器，支持基本的数学运算

parameters:
  expression:
    type: string
    description: 要计算的数学表达式
    required: true

examples:
  - input:
      expression: "2 + 3 * 4"
    output: "计算结果: 2 + 3 * 4 = 14"
```

注册自定义工具：

```javascript
const config = {
  // ... 其他配置
  customToolsDirectory: './tools',
  builtinTools: ['write_todos', 'calculator'] // 包含自定义工具
};
```

## 记忆管理

### 查看用户记忆

```javascript
// 获取用户的短期记忆
const shortTermMemories = await framework.memory.getShortTermMemories('session123', 10);
console.log('最近的对话:', shortTermMemories);

// 搜索长期记忆
const longTermMemories = await framework.memory.searchLongTermMemories(
  '编程经验',
  'user123',
  5
);
console.log('相关的长期记忆:', longTermMemories);

// 获取用户偏好
const preferences = await framework.memory.getUserPreferences('user123');
console.log('用户偏好:', preferences);
```

### 手动添加记忆

```javascript
// 添加重要的用户信息到长期记忆
await framework.memory.addLongTermMemory({
  userId: 'user123',
  content: '用户是一名前端开发工程师，熟悉React和Vue.js',
  category: 'professional-background',
  importance: 0.9,
  tags: ['profession', 'frontend', 'react', 'vue']
});

// 添加用户偏好
await framework.memory.addUserPreference({
  userId: 'user123',
  preference: '喜欢详细的代码示例和解释',
  category: 'learning-style',
  strength: 0.8
});
```

### 记忆搜索和分析

```javascript
// 综合搜索所有类型的记忆
const searchResults = await framework.memory.searchWithContext(
  '前端开发项目经验',
  'user123',
  {
    shortTermLimit: 5,
    longTermLimit: 10,
    preferencesLimit: 3,
    similarityThreshold: 0.6
  }
);

console.log('搜索结果:');
console.log('- 短期记忆:', searchResults.shortTerm.length);
console.log('- 长期记忆:', searchResults.longTerm.length);
console.log('- 用户偏好:', searchResults.preferences.length);
```

## 智能体协作

### 监听智能体事件

```javascript
// 监听智能体执行事件
framework.on('agentStarted', (event) => {
  console.log(`🤖 ${event.agentName} 开始执行: ${event.taskDescription}`);
});

framework.on('agentCompleted', (event) => {
  console.log(`✅ ${event.agentName} 完成任务 (${event.duration}ms)`);
});

framework.on('planCreated', (event) => {
  console.log(`📋 创建了包含 ${event.taskCount} 个任务的执行计划`);
});
```

### 查看执行统计

```javascript
// 获取详细统计信息
const stats = framework.getStats();
console.log('框架统计:');
console.log(`- 总请求数: ${stats.totalRequests}`);
console.log(`- 成功率: ${(stats.successRate * 100).toFixed(1)}%`);
console.log(`- 平均响应时间: ${stats.averageResponseTime}ms`);
console.log(`- 活跃子智能体: ${stats.subAgents}`);

// 获取记忆统计
console.log('记忆统计:');
console.log(`- 短期记忆: ${stats.memoryUsage.shortTerm}`);
console.log(`- 长期记忆: ${stats.memoryUsage.longTerm}`);
console.log(`- 用户偏好: ${stats.memoryUsage.userPreferences}`);
```

## 错误处理

### 基本错误处理

```javascript
async function safeProcessRequest(framework, request, context) {
  try {
    const result = await framework.processRequest(request, context);
    return { success: true, result };
  } catch (error) {
    console.error('请求处理失败:', error.message);
    
    // 根据错误类型进行不同处理
    if (error.message.includes('API key')) {
      return { success: false, error: 'LLM API 配置错误' };
    } else if (error.message.includes('database')) {
      return { success: false, error: '数据库连接错误' };
    } else {
      return { success: false, error: '系统内部错误' };
    }
  }
}
```

### 重试机制

```javascript
async function processWithRetry(framework, request, context, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await framework.processRequest(request, context);
      return result;
    } catch (error) {
      console.warn(`尝试 ${attempt}/${maxRetries} 失败:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`经过 ${maxRetries} 次重试后仍然失败: ${error.message}`);
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 健康检查

```javascript
async function healthCheck(framework) {
  const health = {
    framework: false,
    llm: false,
    memory: false,
    database: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 检查框架状态
    health.framework = framework.initialized;
    
    // 检查 LLM 连接
    const testResponse = await framework.llm.generate('test', { maxTokens: 1 });
    health.llm = !!testResponse;
    
    // 检查记忆系统
    const memStats = await framework.memory.getStats();
    health.memory = memStats.connected;
    health.database = memStats.connected;
    
  } catch (error) {
    console.error('健康检查错误:', error.message);
  }
  
  return health;
}

// 定期健康检查
setInterval(async () => {
  const health = await healthCheck(framework);
  console.log('系统健康状态:', health);
}, 60000); // 每分钟检查一次
```

## 完整示例应用

创建一个智能助手应用 `assistant.js`：

```javascript
import { createMultiAgentFramework } from 'skingflow';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

class IntelligentAssistant {
  constructor() {
    this.framework = null;
    this.currentUser = 'user123';
    this.currentSession = `session_${Date.now()}`;
  }
  
  async initialize() {
    const config = {
      llm: {
        provider: process.env.LLM_PROVIDER,
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL,
        temperature: 0.7
      },
      memory: {
        storage: {
          type: process.env.DB_TYPE,
          config: { database: process.env.SQLITE_PATH }
        }
      },
      builtinTools: ['write_todos', 'write_file', 'read_file', 'edit_file', 'ls']
    };
    
    this.framework = await createMultiAgentFramework(config);
    console.log('🤖 智能助手已启动！输入 /help 查看帮助，输入 /quit 退出。\n');
  }
  
  async processUserInput(input) {
    if (input.startsWith('/')) {
      return this.handleCommand(input);
    }
    
    try {
      const result = await this.framework.processRequest(input, {
        userId: this.currentUser,
        sessionId: this.currentSession
      });
      
      return result.response;
    } catch (error) {
      return `抱歉，处理您的请求时出错了: ${error.message}`;
    }
  }
  
  handleCommand(command) {
    switch (command) {
      case '/help':
        return `
可用命令:
/help - 显示此帮助信息
/stats - 显示系统统计信息
/memory - 显示记忆统计
/clear - 清除当前会话记忆
/quit - 退出助手
        `;
      
      case '/stats':
        const stats = this.framework.getStats();
        return `系统统计:
- 组件: ${stats.components}
- 工具: ${stats.tools}
- 子智能体: ${stats.subAgents}
- 初始化状态: ${stats.initialized}`;
      
      case '/memory':
        return this.getMemoryStats();
      
      case '/clear':
        this.currentSession = `session_${Date.now()}`;
        return '✅ 会话记忆已清除';
      
      default:
        return '未知命令，输入 /help 查看可用命令';
    }
  }
  
  async getMemoryStats() {
    try {
      const shortTerm = await this.framework.memory.getShortTermMemories(this.currentSession, 100);
      const longTerm = await this.framework.memory.searchLongTermMemories('', this.currentUser, 1000);
      const preferences = await this.framework.memory.getUserPreferences(this.currentUser);
      
      return `记忆统计:
- 短期记忆: ${shortTerm.length} 条
- 长期记忆: ${longTerm.length} 条
- 用户偏好: ${preferences.length} 条`;
    } catch (error) {
      return `获取记忆统计失败: ${error.message}`;
    }
  }
  
  async start() {
    await this.initialize();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = () => {
      rl.question('你: ', async (input) => {
        if (input.trim() === '/quit') {
          console.log('👋 再见！');
          await this.framework.close();
          rl.close();
          return;
        }
        
        const response = await this.processUserInput(input.trim());
        console.log(`助手: ${response}\n`);
        askQuestion();
      });
    };
    
    askQuestion();
  }
}

// 启动助手
const assistant = new IntelligentAssistant();
assistant.start().catch(console.error);
```

运行智能助手：

```bash
node assistant.js
```

## 下一步

完成基础教程后，你可以：

1. 🛠️ 学习 [工具系统](tools.md) 创建自定义功能
2. 🧠 深入了解 [记忆系统](memory.md) 的高级特性
3. 🤖 探索 [智能体系统](agents.md) 的协作机制
4. ⚙️ 查看 [高级配置](advanced-config.md) 优化性能
5. 🎯 运行更多 [示例项目](../examples/)

---

如有问题，请查看 [故障排除指南](troubleshooting.md) 或访问我们的 [GitHub 讨论区](https://github.com/your-org/skingflow/discussions)。
