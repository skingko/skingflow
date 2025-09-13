# Intelligent Agent System

A comprehensive demonstration of the **skingflow framework** capabilities, featuring an intelligent agent system with memory, tools, and advanced orchestration.

## 🌟 Features

This intelligent agent system showcases all core features of the skingflow framework:

- **🤖 Multi-LLM Support**: Uses Moonshot API (Kimi) with HTTP provider
- **🧠 PostgreSQL Memory System**: Semantic memory with vector-like search
- **🔧 Unified Tool System**: Custom tools (XML/YAML) + built-in tools
- **🎭 Flow Orchestration**: Advanced workflow with parallel execution
- **📊 Real-time Streaming**: Streaming responses and progress updates
- **🛠️ Comprehensive Testing**: Full test suite with integration tests

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL** (Homebrew installation)
- **Moonshot API Key** (provided in configuration)

## 🚀 Quick Start

### 1. Setup

```bash
# Install dependencies and setup environment
npm run setup
```

### 2. Configuration

The system comes pre-configured for macOS Homebrew PostgreSQL:

- Database: `skingflow_agent` (automatically created)
- User: `apple` (current macOS user)
- No password required
- Moonshot API key included

### 3. Run Tests

```bash
# Run comprehensive test suite
npm test

# Run individual test components
npm run test:llm
npm run test:memory
npm run test:tools
npm run test:orchestration
npm run test:integration
```

### 4. Interactive Demo

```bash
# Start interactive demo
npm run demo
```

### 5. Direct Usage

```bash
# Start the agent system directly
npm start
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Intelligent Agent System                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Knowledge   │  │ Task        │  │ Tool        │         │
│  │ Processor   │→ │ Planner     │→ │ Executor    │→ ...    │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                     skingflow Framework                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   LLM       │  │   Memory    │  │   Tools     │         │
│  │  (Moonshot) │  │(PostgreSQL) │  │ (Custom +   │         │
│  │             │  │             │  │  Built-in)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Test Coverage

The test suite covers all major components:

### 1. **Agent Initialization** 
- Framework setup and configuration validation
- Component initialization and connectivity

### 2. **Database Connection**
- PostgreSQL connection and table creation
- Memory storage and retrieval operations

### 3. **LLM Integration**
- Moonshot API connectivity and streaming
- Response generation and processing

### 4. **Tool System**
- Built-in tools (calculator, datetime)
- Custom tools (web search, data analyzer)
- Tool loading from XML/YAML definitions

### 5. **Memory Operations**
- Memory insertion and retrieval
- Semantic search capabilities
- Query builder functionality

### 6. **Complete Workflow**
- End-to-end agent processing
- Multi-step orchestration
- Error handling and recovery

### 7. **Performance Testing**
- Response time measurements
- Memory usage monitoring
- Statistics collection

## 🔧 Custom Tools

The system includes custom tools defined in multiple formats:

### XML Tool Definition (`tools/web-search.xml`)
```xml
<tool>
    <name>web_search</name>
    <description>Search the web for information</description>
    <parameters>
        <param name="query" type="string" required="true">
            The search query
        </param>
    </parameters>
</tool>
```

### YAML Tool Definition (`tools/data-analyzer.yaml`)
```yaml
name: analyze_data
description: Analyze data and provide insights
parameters:
  data:
    type: array
    required: true
  analysis_type:
    type: string
    enum: ['statistical', 'trend', 'correlation']
```

## 📊 Usage Examples

### Basic Chat
```javascript
import { IntelligentAgent } from './src/agent.js';

const agent = new IntelligentAgent();
await agent.initialize();

const result = await agent.processQuery(
  '你好，请帮我计算 15 * 23',
  'user123'
);
```

### Memory-Enhanced Conversation
```javascript
// First interaction
await agent.processQuery('我叫张三，是软件工程师', 'user123');

// Later interaction - agent remembers
await agent.processQuery('我的职业是什么？', 'user123');
```

### Tool Usage
```javascript
// Triggers calculator tool
await agent.processQuery('计算 (10 + 5) * 3');

// Triggers web search tool
await agent.processQuery('搜索人工智能最新发展');

// Triggers data analysis tool
await agent.processQuery('分析数据：[1,2,3,4,5,6,7,8,9,10]');
```

## 🎯 Interactive Demo Features

The demo provides multiple interaction modes:

1. **💬 Chat Session**: Natural conversation with the agent
2. **📊 Statistics View**: Real-time performance metrics
3. **🧠 Memory Browser**: View stored memories and knowledge
4. **🔧 Tool Inspector**: List and analyze available tools
5. **📋 Conversation History**: Review past interactions
6. **🔄 Quick Tests**: Run predefined test scenarios

## 📈 Performance Monitoring

The system includes comprehensive monitoring:

- **Response Times**: Track query processing speed
- **Memory Usage**: Monitor system resource consumption
- **Tool Statistics**: Analyze tool usage patterns
- **Success Rates**: Track operation success/failure rates
- **Orchestration Metrics**: Monitor workflow performance

## 🛠️ Development

### Project Structure
```
intelligent-agent/
├── src/
│   ├── agent.js              # Main agent system
│   ├── config.js             # Configuration management
│   └── storage/
│       └── postgres-adapter.js # PostgreSQL memory adapter
├── tools/                     # Custom tool definitions
│   ├── web-search.xml
│   ├── web-search.js
│   ├── data-analyzer.yaml
│   └── data-analyzer.js
├── tests/                     # Comprehensive test suite
│   └── test-runner.js
├── demo/                      # Interactive demonstration
│   └── demo.js
├── scripts/                   # Setup and utility scripts
│   └── setup.js
└── README.md
```

### Adding Custom Tools

1. **Define tool schema** (XML/YAML):
```xml
<tool>
    <name>your_tool</name>
    <description>Tool description</description>
    <parameters>
        <param name="input" type="string" required="true">
            Input parameter
        </param>
    </parameters>
</tool>
```

2. **Implement tool logic** (JavaScript):
```javascript
export default async function yourTool(params) {
  const { input } = params;
  // Tool implementation
  return result;
}
```

3. **Tools are automatically loaded** from the `tools/` directory

### Configuration

Environment variables in `.env`:

```env
# Moonshot API (pre-configured)
MOONSHOT_API_KEY=sk-9fA9a7M6iy84jKCeeNvxgCWMQ1Robtf8b3mv8vjbUqOsPt0M
MOONSHOT_BASE_URL=https://api.moonshot.cn/v1
MOONSHOT_MODEL=kimi-k2-0905-preview

# PostgreSQL (Homebrew macOS)
DATABASE_URL=postgresql://apple@localhost:5432/skingflow_agent
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skingflow_agent
DB_USER=apple

# Application Settings
LOG_LEVEL=info
AGENT_NAME=SkingflowAgent
MAX_MEMORY_ENTRIES=10000
MEMORY_SIMILARITY_THRESHOLD=0.7
```

## 🚨 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   ```bash
   # Start PostgreSQL service
   brew services start postgresql
   
   # Create database manually
   createdb skingflow_agent
   ```

2. **Moonshot API Errors**
   - Check API key validity
   - Verify network connectivity
   - Monitor rate limits

3. **Tool Loading Failures**
   - Verify XML/YAML syntax
   - Check JavaScript implementation files
   - Ensure file permissions

4. **Memory Issues**
   - Check PostgreSQL disk space
   - Monitor memory usage
   - Clean old test data

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm start
```

## 📄 License

MIT License - see the main skingflow project for details.

## 🤝 Contributing

This intelligent agent system serves as both a demonstration and a template for building advanced AI applications with the skingflow framework. Feel free to:

1. **Extend the agent capabilities**
2. **Add new custom tools**
3. **Improve the orchestration workflow**
4. **Enhance the memory system**
5. **Add new test scenarios**

---

Built with ❤️ using the **skingflow framework**
