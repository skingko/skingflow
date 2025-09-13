// utils.js
// skingflow-mcp 工具函数
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

// 是否启用 MCP，默认 false
export const MCP = false;

// LLM 流式调用（OpenAI GPT-4o）
export async function* callLLMStream(prompt) {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  const proxy = process.env.https_proxy || process.env.http_proxy || process.env.all_proxy;
  const client = new OpenAI({
    apiKey,
    fetch: (url, options = {}) => {
      if (proxy) {
        options.agent = new HttpsProxyAgent(proxy);
      }
      return fetch(url, options);
    },
  });
  const stream = await client.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  });
  for await (const chunk of stream) {
    yield chunk.choices?.[0]?.delta?.content || '';
  }
}

// 获取工具列表（可切换 MCP 或本地 mock）
export async function getTools() {
  if (MCP) {
    // TODO: 实现 MCP 获取工具逻辑
    return [];
  } else {
    // 本地 mock
    return [
      {
        name: 'add',
        description: 'Add two numbers together',
        inputSchema: {
          properties: { a: { type: 'integer' }, b: { type: 'integer' } },
          required: ['a', 'b']
        }
      },
      {
        name: 'subtract',
        description: 'Subtract b from a',
        inputSchema: {
          properties: { a: { type: 'integer' }, b: { type: 'integer' } },
          required: ['a', 'b']
        }
      },
      {
        name: 'multiply',
        description: 'Multiply two numbers together',
        inputSchema: {
          properties: { a: { type: 'integer' }, b: { type: 'integer' } },
          required: ['a', 'b']
        }
      },
      {
        name: 'divide',
        description: 'Divide a by b',
        inputSchema: {
          properties: { a: { type: 'integer' }, b: { type: 'integer' } },
          required: ['a', 'b']
        }
      }
    ];
  }
}

// 调用工具（可切换 MCP 或本地 mock）
export async function callTool(toolName, args) {
  if (MCP) {
    // TODO: 实现 MCP 工具调用逻辑
    return null;
  } else {
    // 本地 mock
    switch (toolName) {
      case 'add':
        return args.a + args.b;
      case 'subtract':
        return args.a - args.b;
      case 'multiply':
        return args.a * args.b;
      case 'divide':
        return args.a / args.b;
      default:
        return 'Unknown tool';
    }
  }
}
