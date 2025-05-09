# skingflow Chat (Node.js)

A basic chat application using PocketFlow's `flowlib.js` and OpenAI's GPT-4o model.

## Features
- Conversational chat interface in the terminal
- Maintains full conversation history for context
- Demonstrates PocketFlow's node and flow concepts with Node.js

## Run It
1. Ensure your OpenAI API key is set:
   ```sh
   export OPENAI_API_KEY="your-api-key-here"
   ```
2. Install dependencies and run:
   ```sh
   npm install
   npm start
   ```

## How It Works
- Uses a single `ChatNode` with a self-loop:
  - Takes user input
  - Sends the conversation history to GPT-4o
  - Adds responses to the conversation history
  - Loops until the user types 'exit'

## Files
- `main.js`: ChatNode and chat flow implementation
- `utils.js`: OpenAI API wrapper
- `../flowlib.js`: skingflow flow library
