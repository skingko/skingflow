// utils.js - 工具函数，包含 LLM 调用和 Web 搜索
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

// 调用 OpenAI LLM（支持代理，适配 openai v4.x）
export async function callLLM(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('请设置 OPENAI_API_KEY 环境变量');
  }
  const proxy = process.env.https_proxy || process.env.http_proxy || process.env.all_proxy;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: (url, options = {}) => {
      if (proxy) {
        options.agent = new HttpsProxyAgent(proxy);
      }
      return fetch(url, options);
    },
  });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });
  return completion.choices[0].message.content;
}

// OpenAI v4 流式输出
export async function* callLLMStream(prompt, onToken) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('请设置 OPENAI_API_KEY 环境变量');
  }
  const proxy = process.env.https_proxy || process.env.http_proxy || process.env.all_proxy;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    fetch: (url, options = {}) => {
      if (proxy) options.agent = new HttpsProxyAgent(proxy);
      return fetch(url, options);
    },
  });
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    stream: true,
  });
  let full = '';
  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content || '';
    if (token) {
      full += token;
      if (onToken) onToken(token);
      yield token;
    }
  }
  // return full; // 不再直接 return，流式消费者会累积 token
}


// 最简单的 Bing 抓取版网络搜索
export async function searchWeb(query) {
  console.log('[searchWeb] 搜索内容:', query);
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    // 提取第一条摘要（<li class="b_algo">...<p>摘要</p>...）
    const match = html.match(/<li class="b_algo"[\s\S]*?<p>([\s\S]*?)<\/p>/i);
    if (match && match[1]) {
      // 去除所有 HTML 标签
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      return `Bing摘要：${text}`;
    }
    return '未找到相关信息（Bing），请基于你的知识库自行回答问题';
  } catch (e) {
    return '搜索失败：' + e.message;
  }
}
