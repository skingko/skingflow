const OpenAI = require("openai");
const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch');

async function callLLM(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[callLLM] Using API Key:", apiKey ? (apiKey.slice(0,8) + '...') : 'NOT SET');
  console.log("[callLLM] Request messages:", JSON.stringify(messages, null, 2));
  const proxy = process.env.https_proxy || process.env.http_proxy;
  const openai = new OpenAI({
    apiKey,
    fetch: (url, options = {}) => {
      if (proxy) {
        options.agent = new HttpsProxyAgent(proxy);
      }
      return fetch(url, options);
    },
  });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.log("[callLLM] Error during OpenAI API call:", err);
    throw err;
  }
}

// 流式 LLM 调用：返回 async generator，每次 yield 一个 token/chunk
async function* callLLMStream(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const proxy = process.env.https_proxy || process.env.http_proxy;
  const openai = new OpenAI({
    apiKey,
    fetch: (url, options = {}) => {
      if (proxy) {
        options.agent = new HttpsProxyAgent(proxy);
      }
      return fetch(url, options);
    },
  });
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  } catch (err) {
    console.log("[callLLMStream] Error during OpenAI API call:", err);
    throw err;
  }
}

module.exports = { callLLM, callLLMStream };
