// flow.js
// 组装 agent flow 的节点连接逻辑
import { DecideAction, SearchWeb, AnswerQuestion } from './nodes.js';

/**
 * 创建完整 agent flow
 * @returns {Function} flowRunner
 */
export function createAgentFlow() {
  // 返回一个 async 运行器（带状态流转）
  return async function run(shared) {
    let done = false;
    while (!done) {
      // 1. 决策当前动作
      for await (const { action, answer, search_query } of DecideAction(shared)) {
        if (action === 'search') {
          // 2. 搜索
          for await (const { results } of SearchWeb(shared, search_query)) {
            // 搜索结果已写入 shared.context
          }
          // 回到决策节点
          break;
        } else if (action === 'answer') {
          // 3. 生成最终答案
          for await (const { answer: finalAnswer } of AnswerQuestion(shared)) {
            shared.answer = finalAnswer;
            done = true;
          }
          break;
        } else {
          // fallback: treat as answer
          shared.answer = answer;
          done = true;
          break;
        }
      }
    }
  };
}
