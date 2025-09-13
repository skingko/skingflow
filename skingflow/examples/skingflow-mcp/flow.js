// flow.js
// skingflow-mcp 流程定义
import { GetToolsNode, DecideToolNode, ExecuteToolNode } from './nodes.js';

export async function runFlow(shared) {
  let next = 'getTools';
  while (next) {
    switch (next) {
      case 'getTools':
        next = await GetToolsNode.execAsync(shared);
        break;
      case 'decide':
        next = await DecideToolNode.execAsync(shared);
        break;
      case 'execute':
        next = await ExecuteToolNode.execAsync(shared);
        break;
      default:
        next = null;
    }
  }
}
