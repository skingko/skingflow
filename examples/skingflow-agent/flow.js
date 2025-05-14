// flow.js - 创建 agent 流程
import { AsyncFlow } from '../../skingflow/skingflow.js';
import { DecideAction, SearchWeb, AnswerQuestion } from './nodes.js';

export function createAgentFlow() {
  const decide = new DecideAction();
  const search = new SearchWeb();
  const answer = new AnswerQuestion();

  decide.when('search').next(search);
  decide.when('answer').next(answer);
  search.when('decide').next(decide);

  console.log('[flow.js] decide node type:', decide.constructor.name);
  const flow = new AsyncFlow(decide);
  flow.prepAsync = async () => {};
  return flow;
}
