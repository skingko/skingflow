// nodes.js - 定义决策、搜索、回答节点
import { AsyncNode } from '../../skingflow/skingflow.js';
import { callLLM, callLLMStream, searchWeb } from './utils.js';

export class DecideAction extends AsyncNode {
  async prepAsync(shared) {
    const context = shared.context || 'No previous search';
    const question = shared.question;
    return [question, context];
  }
  async execAsync([question, context]) {
    console.log('🤔 Agent deciding what to do next...');
    const prompt = `
### CONTEXT
You are a research assistant that can search the web.
Question: ${question}
Previous Research: ${context}

### ACTION SPACE
[1] search
  Description: Look up more information on the web
  Parameters:
    - query (str): What to search for

[2] answer
  Description: Answer the question with current knowledge
  Parameters:
    - answer (str): Final answer to the question

## NEXT ACTION
Decide the next action based on the context and available actions.
Return your response in this format:

\u0060\u0060\u0060yaml
thinking: |
    <your step-by-step reasoning process>
action: search OR answer
reason: <why you chose this action>
answer: <if action is answer>
search_query: <specific search query if action is search>
\u0060\u0060\u0060
IMPORTANT: Make sure to:
1. Use proper indentation (4 spaces) for all multi-line fields
2. Use the | character for multi-line text fields
3. Keep single-line fields without the | character
`;
    const response = await callLLM(prompt);
    // 解析 yaml 部分
    const yamlMatch = response.match(/```yaml([\s\S]*?)```/);
    if (!yamlMatch) throw new Error('未找到 yaml 响应');
    const yamlStr = yamlMatch[1];
    // 简易解析（仅支持本场景）
    const action = /action:\s*(search|answer)/.exec(yamlStr)?.[1];
    const search_query = /search_query:\s*(.*)/.exec(yamlStr)?.[1]?.trim();
    const answer = /answer:\s*([\s\S]*)/.exec(yamlStr)?.[1]?.trim();
    return { action, search_query, answer };
  }

  // 流式 LLM 输出
  async *execAsyncStream([question, context], { onToken } = {}) {
    console.log('🤔 (流式) Agent deciding what to do next...');
    const prompt = `
### CONTEXT
You are a research assistant that can search the web.
Question: ${question}
Previous Research: ${context}

### ACTION SPACE
[1] search
  Description: Look up more information on the web
  Parameters:
    - query (str): What to search for

[2] answer
  Description: Answer the question with current knowledge
  Parameters:
    - answer (str): Final answer to the question

## NEXT ACTION
Decide the next action based on the context and available actions.
Return your response in this format:

[BEGIN YAML]
thinking: |
    <your step-by-step reasoning process>
action: search OR answer
reason: <why you chose this action>
answer: <if action is answer>
search_query: <specific search query if action is search>
[END YAML]
IMPORTANT: Make sure to:
1. Use proper indentation (4 spaces) for all multi-line fields
2. Use the | character for multi-line text fields
3. Keep single-line fields without the | character
`;
    let output = '';
    for await (const token of callLLMStream(prompt, (token) => {
      process.stdout.write(token);
      output += token;
      if (onToken) onToken(token);
    })) {
      yield token;
    }
    // 解析 yaml 部分
    const yamlMatch = output.match(/\[BEGIN YAML\]([\s\S]*?)\[END YAML\]/);
    if (!yamlMatch) throw new Error('未找到 yaml 响应');
    const yamlStr = yamlMatch[1];
    const action = /action:\s*(search|answer)/.exec(yamlStr)?.[1];
    const search_query = /search_query:\s*(.*)/.exec(yamlStr)?.[1]?.trim();
    const answer = /answer:\s*([\s\S]*)/.exec(yamlStr)?.[1]?.trim();
    // 可选：yield 最终结构
    // yield { action, search_query, answer };
    return { action, search_query, answer };
  }

  async postAsync(shared, prepRes, execRes) {
    if (execRes.action === 'search') {
      shared.search_query = execRes.search_query;
      return 'search';
    } else {
      shared.answer = execRes.answer;
      return 'answer';
    }
  }
}

export class SearchWeb extends AsyncNode {
  async prepAsync(shared) {
    return shared.search_query;
  }
  async execAsync(search_query) {
    console.log(`🌐 Searching web: ${search_query}`);
    const result = await searchWeb(search_query);
    console.log('[searchWeb] 搜索结果:', result);
    return result;
  }
  async postAsync(shared, prepRes, execRes) {
    shared.context = execRes;
    return 'decide';
  }
}

export class AnswerQuestion extends AsyncNode {
  async prepAsync(shared) {
    return [shared.question, shared.context];
  }
  async execAsync([question, context]) {
    console.log('📝 Generating final answer...');
    const prompt = `
### CONTEXT
You are a research assistant. Answer the question using all available information.
Question: ${question}
Previous Research: ${context}

Give a concise and accurate answer.`;
    const response = await callLLM(prompt);
    return response;
  }

  // 流式 LLM 输出
  async *execAsyncStream([question, context], { onToken } = {}) {
    console.log('📝 (流式) Generating final answer...');
    const prompt = `
### CONTEXT
You are a research assistant. Answer the question using all available information.
Question: ${question}
Previous Research: ${context}

Give a concise and accurate answer.`;
    let output = '';
    for await (const token of callLLMStream(prompt, (token) => {
      process.stdout.write(token);
      output += token;
      if (onToken) onToken(token);
    })) {
      yield token;
    }
    return output;
  }

  async postAsync(shared, prepRes, execRes) {
    shared.answer = execRes;
    return null; // 终止流程
  }
}
