// utils.js
// 工具方法：封装 skingflow.js 的 LLM 与 Web 搜索真实调用
import { llm, search } from 'skingflow';

/**
 * 调用 skingflow.js 的 LLM 能力
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function callLLM(prompt) {
  // 假设 skingflow.llm 支持 async/await
  const res = await llm({ prompt });
  return res.text || res.result || '';
}

/**
 * 调用 skingflow.js 的 Web 搜索能力
 * @param {string} query
 * @returns {Promise<string>}
 */
export async function searchWeb(query) {
  // 假设 skingflow.search 支持 async/await
  const res = await search({ query });
  if (Array.isArray(res.results)) {
    return res.results.map(r => `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet || r.body || ''}`).join('\n\n');
  }
  return typeof res === 'string' ? res : JSON.stringify(res);
}
