const { AsyncNode } = require("../../skingflow/skingflow.js");
const { callLLMStream } = require("./utils.js");
const readline = require("readline");

class StreamChatNode extends AsyncNode {
  async prepAsync(shared) {
    if (!shared.messages) {
      shared.messages = [];
      console.log("Welcome to the chat! Type 'exit' to end the conversation.");
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const user_input = await new Promise(resolve => rl.question("\nYou: ", answer => {
      rl.close();
      resolve(answer);
    }));
    if (user_input.trim().toLowerCase() === "exit") {
      return null;
    }
    shared.messages.push({ role: "user", content: user_input });
    return shared.messages;
  }

  // 流式 LLM 输出
  async *execAsyncStream(messages) {
    if (!messages) return;
    let buffer = '';
    for await (const chunk of callLLMStream(messages)) {
      process.stdout.write(chunk);
      buffer += chunk;
      yield chunk; // 若需外部处理，可用
    }
    return buffer;
  }

  async postAsync(shared, prepRes, execRes) {
    if (!prepRes) {
      console.log("\nGoodbye!");
      return null;
    }
    // execRes 是累积内容
    shared.messages.push({ role: "assistant", content: execRes });
    return "continue";
  }
}

async function main() {
  const node = new StreamChatNode();
  let shared = {};
  while (true) {
    const prepRes = await node.prepAsync(shared);
    if (!prepRes) break;
    let full = '';
    for await (const chunk of node.execAsyncStream(prepRes)) {
      full += chunk;
    }
    const action = await node.postAsync(shared, prepRes, full);
    if (action !== 'continue') break;
    process.stdout.write('\n');
  }
}

if (require.main === module) {
  main();
}
