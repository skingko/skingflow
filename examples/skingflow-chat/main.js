const { Node, Flow } = require("../skingflow.js");
const { callLLM } = require("./utils.js");
const readline = require("readline");
const deasync = require("deasync");

class ChatNode extends Node {
  prep(shared) {
    if (!shared.messages) {
      shared.messages = [];
      console.log("Welcome to the chat! Type 'exit' to end the conversation.");
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    let user_input = '';
    rl.question("\nYou: ", answer => {
      user_input = answer;
      rl.close();
    });
    deasync.loopWhile(() => rl.closed !== true);
    if (user_input.trim().toLowerCase() === "exit") {
      return null;
    }
    shared.messages.push({ role: "user", content: user_input });
    return shared.messages;
  }

  exec(messages) {
    if (!messages) return null;
    let result = undefined, done = false;
    callLLM(messages).then(res => { result = res; done = true; })
                    .catch(err => { result = null; done = true; });
    deasync.loopWhile(() => !done);
    return result;
  }

  post(shared, prepRes, execRes) {
    if (!prepRes || !execRes) {
      console.log("\nGoodbye!");
      return null;
    }
    console.log(`\nAssistant: ${execRes}`);
    shared.messages.push({ role: "assistant", content: execRes });
    return "continue";
  }
}

const chatNode = new ChatNode();
chatNode.next(chatNode, "continue");
const flow = new Flow(chatNode);

if (require.main === module) {
  const shared = {};
  flow._run(shared);
}
