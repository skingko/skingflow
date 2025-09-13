// client.js
// A2A Agent Client: 命令行发送任务到 server，打印响应
import fetch from 'node-fetch';

const SERVER_URL = process.argv[2] || 'http://localhost:3000/a2a';
const question = process.argv[3] || 'Who won the Nobel Prize in Physics 2024?';

async function main() {
  const payload = { question };
  const resp = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    console.error('Error:', resp.status, await resp.text());
    process.exit(1);
  }
  const data = await resp.json();
  console.log('\uD83C\uDFC6 Final Answer:', data.answer);
  if (data.context) {
    console.log('Context:', data.context);
  }
}

main();
