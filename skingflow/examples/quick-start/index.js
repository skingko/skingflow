#!/usr/bin/env node

/**
 * SkinFlow 多智能体框架 - 快速开始示例
 * 
 * 这个示例展示了如何在几分钟内开始使用 SkinFlow 框架
 * 包含基本配置、请求处理和核心功能演示
 */

import { createMultiAgentFramework } from '../../lib/multi-agent/index.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// 确保数据目录存在
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * 快速开始示例主函数
 */
async function quickStartExample() {
  console.log('🚀 SkinFlow 多智能体框架 - 快速开始示例\n');
  
  // 检查必需的环境变量
  if (!process.env.LLM_API_KEY) {
    console.error('❌ 错误: 请在 .env 文件中设置 LLM_API_KEY');
    console.error('   1. 复制 env.example 为 .env');
    console.error('   2. 编辑 .env 文件，设置你的 API 密钥');
    console.error('   3. 重新运行示例');
    process.exit(1);
  }
  
  let framework;
  
  try {
    // 1. 创建框架配置
    console.log('📦 正在初始化框架...');
    const config = createQuickStartConfig();
    
    // 2. 初始化框架
    framework = await createMultiAgentFramework(config);
    console.log('✅ 框架初始化成功！\n');
    
    // 3. 运行示例
    await runExamples(framework);
    
    // 4. 显示统计信息
    displayStats(framework);
    
    console.log('\n🎉 快速开始示例完成！');
    console.log('📚 接下来你可以:');
    console.log('   - 查看 docs/basic-usage.md 学习更多功能');
    console.log('   - 探索其他示例项目');
    console.log('   - 创建你自己的智能体应用\n');
    
  } catch (error) {
    console.error('❌ 示例运行失败:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 提示: 请检查你的 LLM API 密钥是否正确设置');
    } else if (error.message.includes('network') || error.message.includes('connect')) {
      console.error('\n💡 提示: 请检查网络连接和 API 端点是否可访问');
    }
    
    process.exit(1);
  } finally {
    // 5. 清理资源
    if (framework) {
      await framework.close();
    }
  }
}

/**
 * 创建快速开始配置
 */
function createQuickStartConfig() {
  return {
    // LLM 配置
    llm: {
      provider: process.env.LLM_PROVIDER || 'http',
      baseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000
    },
    
    // 记忆系统配置 (使用 SQLite 简化设置)
    memory: {
      storage: {
        type: process.env.DB_TYPE || 'sqlite',
        config: {
          database: process.env.SQLITE_PATH || './data/quickstart.db'
        }
      },
      maxShortTermMemories: 20,
      maxLongTermMemories: 100
    },
    
    // 启用基础工具
    builtinTools: ['write_todos', 'write_file', 'read_file', 'ls'],
    
    // 智能体配置
    agents: {
      planning: { enabled: true },
      subAgents: ['general-purpose', 'research-agent', 'code-agent']
    },
    
    // 调试配置
    debug: process.env.DEBUG_ENABLED === 'true'
  };
}

/**
 * 运行示例演示
 */
async function runExamples(framework) {
  const examples = [
    {
      name: '简单对话',
      description: '测试基本的对话交互功能',
      request: '你好！请简单介绍一下你的能力和功能',
      userId: 'quickstart-user-1'
    },
    {
      name: '任务规划',
      description: '测试复杂任务的自动分解和规划',
      request: '帮我制定一个为期一周的学习 Python 编程的计划，包括每天的学习内容和目标',
      userId: 'quickstart-user-1'
    },
    {
      name: '文件操作',
      description: '测试虚拟文件系统和文件创建功能',
      request: '创建一个简单的 HTML 网页，包含欢迎信息、导航菜单和联系表单',
      userId: 'quickstart-user-2'
    },
    {
      name: '记忆测试',
      description: '测试记忆系统的存储和检索功能',
      request: '我是一名前端开发工程师，主要使用 React 和 TypeScript。请根据我的背景推荐一些学习资源',
      userId: 'quickstart-user-1'
    }
  ];
  
  console.log('🧪 开始运行示例...\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    console.log(`📝 示例 ${i + 1}: ${example.name}`);
    console.log(`   ${example.description}`);
    console.log(`   请求: ${example.request.substring(0, 50)}...`);
    
    const startTime = Date.now();
    
    try {
      const result = await framework.processRequest(
        example.request,
        { 
          userId: example.userId,
          sessionId: `quickstart-session-${i + 1}`
        }
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(`✅ 处理成功 (${duration}秒)`);
      console.log(`   子智能体: ${result.subAgentsUsed}`);
      console.log(`   存储记忆: ${result.memoriesStored}`);
      
      if (result.todosCompleted > 0) {
        console.log(`   完成任务: ${result.todosCompleted}`);
      }
      
      if (result.files && Object.keys(result.files).length > 0) {
        console.log(`   创建文件: ${Object.keys(result.files).join(', ')}`);
      }
      
      // 显示响应摘要
      if (result.response) {
        const summary = result.response.length > 100 
          ? result.response.substring(0, 100) + '...'
          : result.response;
        console.log(`   响应: ${summary}`);
      }
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`❌ 处理失败 (${duration}秒): ${error.message}`);
    }
    
    console.log(''); // 空行分隔
  }
}

/**
 * 显示框架统计信息
 */
function displayStats(framework) {
  try {
    const stats = framework.getStats();
    
    console.log('📊 框架统计信息:');
    console.log(`   - 框架状态: ${stats.initialized ? '✅ 已初始化' : '❌ 未初始化'}`);
    console.log(`   - 组件数量: ${stats.components}`);
    console.log(`   - 工具数量: ${stats.tools}`);
    console.log(`   - 子智能体: ${stats.subAgents}`);
    
    if (stats.totalRequests > 0) {
      console.log(`   - 总请求数: ${stats.totalRequests}`);
      console.log(`   - 成功率: ${(stats.successRate * 100).toFixed(1)}%`);
      console.log(`   - 平均响应时间: ${(stats.averageResponseTime / 1000).toFixed(1)}秒`);
    }
    
    if (stats.memoryUsage) {
      console.log(`   - 记忆使用:`);
      console.log(`     * 短期: ${stats.memoryUsage.shortTerm} 条`);
      console.log(`     * 长期: ${stats.memoryUsage.longTerm} 条`);
      console.log(`     * 偏好: ${stats.memoryUsage.userPreferences} 条`);
    }
    
  } catch (error) {
    console.warn('⚠️  无法获取统计信息:', error.message);
  }
}

/**
 * 优雅的错误处理
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message);
  process.exit(1);
});

// 处理 Ctrl+C 信号
process.on('SIGINT', () => {
  console.log('\n👋 收到退出信号，正在清理...');
  process.exit(0);
});

// 启动示例
quickStartExample();
