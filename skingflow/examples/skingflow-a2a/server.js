// server.js
// A2A Agent Server: 接收任务请求，调用 agent 能力，返回结构化结果
import express from 'express';
import bodyParser from 'body-parser';
import { createAgentFlow } from './flow.js';

const app = express();
app.use(bodyParser.json());

// POST /a2a 入口，接收 { question, context } 请求
app.post('/a2a', async (req, res) => {
  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }
  const shared = { question, context };
  const agentFlow = createAgentFlow();
  await agentFlow(shared);
  res.json({ answer: shared.answer, context: shared.context });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`A2A Agent Server listening on port ${PORT}`);
});
