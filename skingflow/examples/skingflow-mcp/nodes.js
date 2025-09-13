// nodes.js
// skingflow-mcp 各节点实现
import { getTools, callLLMStream, callTool } from './utils.js';

export const GetToolsNode = {
  async execAsync(shared) {
    // 获取工具列表
    const tools = await getTools();
    shared.tools = tools;
    // 格式化工具信息
    shared.toolInfo = tools.map((tool, i) => {
      const props = tool.inputSchema?.properties || {};
      const required = tool.inputSchema?.required || [];
      const params = Object.entries(props).map(([k, v]) => {
        const req = required.includes(k) ? '(Required)' : '(Optional)';
        return `    - ${k} (${v.type || 'unknown'}): ${req}`;
      }).join('\n');
      return `[${i + 1}] ${tool.name}\n  Description: ${tool.description}\n  Parameters:\n${params}`;
    }).join('\n');
    return 'decide';
  }
};

export const DecideToolNode = {
  async execAsync(shared) {
    // 构造 prompt
    const prompt = `### CONTEXT\nYou are an assistant that can use tools via Model Context Protocol (MCP).\n\n### ACTION SPACE\n${shared.toolInfo}\n\n### TASK\nAnswer this question: "${shared.question}"\n\n## NEXT ACTION\nAnalyze the question, extract any numbers or parameters, and decide which tool to use.\nReturn your response in this format:\n\n\`\`\`yaml\nthinking: |\n    <your step-by-step reasoning about what the question is asking and what numbers to extract>\ntool: <name of the tool to use>\nreason: <why you chose this tool>\nparameters:\n    <parameter_name>: <parameter_value>\n    <parameter_name>: <parameter_value>\n\`\`\`\nIMPORTANT: \n1. Extract numbers from the question properly\n2. Use proper indentation (4 spaces) for multi-line fields\n3. Use the | character for multi-line text fields\n`;
    let response = '';
    for await (const chunk of callLLMStream(prompt)) {
      process.stdout.write(chunk);
      response += chunk;
    }
    // 解析 yaml
    const match = response.match(/```yaml([\s\S]*?)```/);
    if (match) {
      try {
        const yaml = await import('js-yaml');
        const decision = yaml.load(match[1]);
        shared.toolName = decision.tool;
        shared.parameters = decision.parameters;
        shared.thinking = decision.thinking;
        return 'execute';
      } catch (e) {
        console.error('YAML parse error:', e);
        return null;
      }
    } else {
      console.error('No YAML block in LLM response');
      return null;
    }
  }
};

export const ExecuteToolNode = {
  async execAsync(shared) {
    const result = await callTool(shared.toolName, shared.parameters);
    console.log(`\n\u2705 Tool result:`, result);
    return null;
  }
};
