// main.js - 入口
import { createAgentFlow } from './flow.js';

async function main() {
  // 默认问题
  let question = 'Who won the Nobel Prize in Physics 2024?';
  // 支持命令行参数 --问题
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      question = arg.slice(2);
      break;
    }
  }
  const agentFlow = createAgentFlow();
  const shared = { question };
  // 流式输出
  const node = agentFlow.startNode;
  let context = shared.context || 'No previous search';
  let full = '';
  for await (const chunk of node.execAsyncStream([question, context])) {
    full += chunk;
  }
  console.log('\n🏆 Final Answer:');
  console.log(full || 'No answer found');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
