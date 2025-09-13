// main.js
// 入口，命令行读取问题，运行 agent flow
import { createAgentFlow } from './flow.js';

const defaultQuestion = 'Who won the Nobel Prize in Physics 2024?';

// 从命令行参数读取问题
let question = defaultQuestion;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--')) {
    question = arg.slice(2);
    break;
  } else if (!arg.startsWith('-')) {
    question = arg;
    break;
  }
}

console.log(`🤔 Processing question: ${question}`);

const agentFlow = createAgentFlow();
const shared = { question };

(async () => {
  await agentFlow(shared);
  console.log('\n🏆 Final Answer:');
  console.log(shared.answer || 'No answer found');
})();
