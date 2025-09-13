// main.js
// skingflow-mcp 入口
import { runFlow } from './flow.js';

const question = process.argv[2] || 'What is 982713504867129384651 plus 73916582047365810293746529?';

(async () => {
  await runFlow({ question });
})();
