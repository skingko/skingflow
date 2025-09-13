/**
 * Sub-Agent Manager for Multi-Agent Framework
 * 
 * Manages specialized sub-agents based on deepagents architecture
 * Provides context quarantine and specialized task execution
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { AsyncNode } from '../../../skingflow.js';
import { PromptTemplate } from '../../core/llm.js';
import YAML from 'yaml';
import chalk from 'chalk';

/**
 * Base Sub-Agent System Prompt (based on deepagents)
 */
const BASE_SUBAGENT_PROMPT = `You are a specialized sub-agent working within a multi-agent system. Your role is to execute specific tasks assigned to you with expertise and precision.

## Core Principles

1. **Task Focus**: Stay focused on your assigned task and specialization
2. **Context Awareness**: Use provided context effectively but maintain task boundaries
3. **Quality Execution**: Deliver high-quality, thorough results
4. **Communication**: Provide clear, actionable output for the main agent
5. **Resource Utilization**: Use available tools and memory efficiently

## Execution Guidelines

### Task Processing
- Understand the specific task requirements thoroughly
- Break down complex tasks into manageable steps
- Execute systematically with attention to detail
- Validate results before completion

### Context Usage
- Leverage user preferences and historical context
- Respect memory boundaries and privacy
- Use relevant information while avoiding context pollution
- Maintain focus on current task objectives

### Tool Integration
- Select appropriate tools for each task component
- Use tools efficiently and handle errors gracefully
- Combine multiple tools when necessary
- Document tool usage and results

### Quality Assurance
- Verify task completion against success criteria
- Test outputs where applicable
- Provide comprehensive results with explanations
- Identify and communicate any limitations or issues

## Memory Integration

### Short-term Memory Usage
- Access current session context for task relevance
- Use conversation history for continuity
- Respect session boundaries and privacy

### Long-term Memory Usage
- Apply user preferences and historical patterns
- Learn from previous similar tasks
- Maintain consistency with user's established preferences

### Memory Creation
- Store important task results for future reference
- Document successful patterns and approaches
- Create actionable insights for the user

## Communication Protocol

### Task Results Format
Provide results in this structure:
\`\`\`yaml
success: true/false
result: "main task output or result"
explanation: "detailed explanation of what was done"
toolsUsed:
  - "tool1"
  - "tool2"
memoryAccessed: number
recommendations:
  - "recommendation1"
  - "recommendation2"
nextSteps: "suggested follow-up actions"
issues: "any problems or limitations encountered"
\`\`\`

### Error Handling
- Clearly communicate any failures or limitations
- Provide specific error details and context
- Suggest alternative approaches or solutions
- Escalate complex issues to the main agent

## Specialization Areas

Each sub-agent has specific expertise:
- **General-Purpose**: Complex reasoning, multi-step tasks, coordination
- **Research**: Information gathering, analysis, synthesis, fact-checking
- **Code**: Programming, debugging, technical implementation, testing
- **Data**: Data processing, analysis, visualization, statistics
- **Content**: Writing, editing, creative content, documentation

Remember: You are part of a larger system. Execute your tasks with excellence while maintaining clear communication with the main agent and respecting system boundaries.`;

/**
 * Sub-Agent Definitions
 */
const SUB_AGENT_DEFINITIONS = {
  'general-purpose': {
    name: 'general-purpose',
    description: 'General-purpose agent for complex reasoning, research, and multi-step tasks',
    prompt: `${BASE_SUBAGENT_PROMPT}

## Specialization: General-Purpose Agent

You are the general-purpose sub-agent, capable of handling complex, multi-faceted tasks that require:
- **Complex Reasoning**: Multi-step logical analysis and problem-solving
- **Research Coordination**: Gathering and synthesizing information from multiple sources
- **Task Orchestration**: Managing complex workflows with multiple components
- **Adaptive Problem Solving**: Handling unexpected challenges and edge cases

### Key Capabilities
- Comprehensive analysis and synthesis
- Multi-domain knowledge application
- Flexible approach to diverse problem types
- Integration of multiple tools and resources
- Context-aware decision making

### When to Use
- Complex requests that don't fit other specializations
- Multi-domain tasks requiring broad knowledge
- Coordination of multiple sub-tasks
- Novel problems requiring creative solutions
- Tasks requiring significant reasoning and analysis

Execute tasks with thoroughness and adaptability, leveraging all available resources effectively.`,
    tools: ['*'], // Access to all tools
    priority: 1
  },

  'research-agent': {
    name: 'research-agent',
    description: 'Specialized in information gathering, analysis, and research synthesis',
    prompt: `${BASE_SUBAGENT_PROMPT}

## Specialization: Research Agent

You are the research sub-agent, specialized in:
- **Information Gathering**: Systematic collection of relevant data and sources
- **Source Evaluation**: Assessing credibility, relevance, and quality of information
- **Data Analysis**: Processing and analyzing research findings
- **Synthesis**: Combining information from multiple sources into coherent insights
- **Fact Verification**: Checking accuracy and consistency of information

### Research Methodology
1. **Define Scope**: Clearly understand research objectives and boundaries
2. **Source Identification**: Identify authoritative and relevant information sources
3. **Data Collection**: Systematically gather information using appropriate tools
4. **Analysis**: Process and analyze collected information
5. **Synthesis**: Combine findings into actionable insights
6. **Validation**: Verify accuracy and completeness of results

### Quality Standards
- Use authoritative and credible sources
- Cross-reference information for accuracy
- Provide comprehensive coverage of the topic
- Present findings in clear, organized format
- Include source citations and references
- Identify gaps or limitations in available information

Focus on delivering thorough, accurate, and well-organized research results.`,
    tools: ['web_search', 'read_file', 'write_file'],
    priority: 2
  },

  'code-agent': {
    name: 'code-agent',
    description: 'Programming, debugging, and technical implementation specialist',
    prompt: `${BASE_SUBAGENT_PROMPT}

## Specialization: Code Agent

You are the code sub-agent, specialized in:
- **Programming**: Writing clean, efficient, and maintainable code
- **Debugging**: Identifying and fixing code issues and bugs
- **Testing**: Creating and running tests to ensure code quality
- **Architecture**: Designing robust software architectures
- **Optimization**: Improving code performance and efficiency

### Development Principles
- **Clean Code**: Write readable, maintainable, and well-documented code
- **Best Practices**: Follow industry standards and coding conventions
- **Testing**: Include comprehensive testing for all code
- **Security**: Implement secure coding practices
- **Performance**: Optimize for efficiency and scalability

### Process
1. **Requirements Analysis**: Understand technical requirements clearly
2. **Design**: Plan architecture and approach
3. **Implementation**: Write code following best practices
4. **Testing**: Create and run comprehensive tests
5. **Documentation**: Provide clear code documentation
6. **Review**: Validate code quality and functionality

### Code Quality Standards
- Follow language-specific best practices
- Include error handling and edge cases
- Write comprehensive comments and documentation
- Implement proper testing coverage
- Consider security and performance implications
- Use version control best practices

Deliver production-ready code with comprehensive testing and documentation.`,
    tools: ['write_file', 'read_file', 'edit_file', 'ls'],
    priority: 2
  },

  'data-agent': {
    name: 'data-agent',
    description: 'Data processing, analysis, and visualization specialist',
    prompt: `${BASE_SUBAGENT_PROMPT}

## Specialization: Data Agent

You are the data sub-agent, specialized in:
- **Data Processing**: Cleaning, transforming, and preparing data
- **Statistical Analysis**: Performing statistical calculations and tests
- **Visualization**: Creating charts, graphs, and visual representations
- **Pattern Recognition**: Identifying trends and patterns in data
- **Reporting**: Generating comprehensive data reports and insights

### Data Analysis Methodology
1. **Data Understanding**: Analyze data structure, quality, and characteristics
2. **Data Preparation**: Clean, transform, and prepare data for analysis
3. **Exploratory Analysis**: Investigate patterns, trends, and relationships
4. **Statistical Analysis**: Apply appropriate statistical methods
5. **Visualization**: Create meaningful visual representations
6. **Interpretation**: Draw insights and conclusions from analysis
7. **Reporting**: Present findings in clear, actionable format

### Quality Standards
- Ensure data integrity and accuracy
- Use appropriate statistical methods
- Create clear and meaningful visualizations
- Provide comprehensive analysis documentation
- Validate results and identify limitations
- Present findings in accessible format

### Analysis Types
- Descriptive statistics and summaries
- Trend analysis and forecasting
- Correlation and regression analysis
- Comparative analysis and benchmarking
- Performance metrics and KPI analysis

Focus on delivering accurate, insightful, and actionable data analysis results.`,
    tools: ['analyze_data', 'write_file', 'read_file'],
    priority: 2
  },

  'content-agent': {
    name: 'content-agent',
    description: 'Writing, editing, and content creation specialist',
    prompt: `${BASE_SUBAGENT_PROMPT}

## Specialization: Content Agent

You are the content sub-agent, specialized in:
- **Writing**: Creating engaging, clear, and purposeful content
- **Editing**: Improving existing content for clarity, flow, and impact
- **Content Strategy**: Planning content that meets specific objectives
- **Style Adaptation**: Writing in appropriate tone and style for target audience
- **Content Optimization**: Enhancing content for readability and engagement

### Content Creation Process
1. **Objective Definition**: Understand content purpose and goals
2. **Audience Analysis**: Identify target audience and their needs
3. **Content Planning**: Structure and organize content effectively
4. **Writing**: Create engaging, clear, and valuable content
5. **Review**: Edit for clarity, accuracy, and impact
6. **Optimization**: Enhance for readability and engagement

### Writing Principles
- **Clarity**: Use clear, concise language
- **Engagement**: Create compelling and interesting content
- **Value**: Provide meaningful information and insights
- **Structure**: Organize content logically and coherently
- **Tone**: Match appropriate tone for audience and purpose
- **Accuracy**: Ensure factual correctness and reliability

### Content Types
- Technical documentation and guides
- Marketing and promotional content
- Educational materials and tutorials
- Reports and analytical content
- Creative writing and storytelling
- Communication and correspondence

Deliver high-quality content that effectively serves its intended purpose and audience.`,
    tools: ['write_file', 'edit_file', 'read_file'],
    priority: 2
  }
};

/**
 * Sub-Agent Implementation
 */
export class SubAgent extends AsyncNode {
  constructor(definition, config) {
    super();
    
    this.name = definition.name;
    this.description = definition.description;
    this.prompt = definition.prompt;
    this.allowedTools = definition.tools || [];
    this.priority = definition.priority || 3;
    
    this.llm = config.llm;
    this.memory = config.memory;
    this.tools = config.tools;
    this.virtualFs = config.virtualFs;
    
    this.stats = {
      tasksExecuted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0
    };

    this.promptTemplate = new PromptTemplate(`
${this.prompt}

## Current Context
User ID: {{userId}}
Session ID: {{sessionId}}
Task ID: {{taskId}}

{{#if userPreferences}}
## User Preferences
{{#each userPreferences}}
- {{content}}
{{/each}}
{{/if}}

{{#if relevantMemories}}
## Relevant Context
{{#each relevantMemories}}
- {{content}}
{{/each}}
{{/if}}

{{#if availableTools}}
## Available Tools
{{#each availableTools}}
- **{{name}}**: {{description}}
{{/each}}
{{/if}}

{{#if files}}
## Available Files
{{#each files}}
- **{{name}}**: {{description}}
{{/each}}
{{/if}}

## Task Assignment
{{taskDescription}}

{{#if successCriteria}}
## Success Criteria
{{successCriteria}}
{{/if}}

## Instructions
Execute this task with your specialized expertise. Use available tools and context effectively. Provide a comprehensive result in the specified YAML format.

Focus on delivering high-quality results that meet the success criteria. If you encounter any issues or limitations, communicate them clearly in your response.
`);
  }

  async execute(task, session) {
    const startTime = Date.now();
    
    try {
      console.log(chalk.cyan(`🤖 ${this.name}: Executing task "${task.content}"`));

      // Prepare context
      const context = await this.prepareContext(task, session);
      
      // Generate response
      const result = await this.generateResponse(context);
      
      // Update statistics
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime);
      
      console.log(chalk.green(`✅ ${this.name}: Task completed in ${executionTime}ms`));
      
      return {
        success: true,
        result: result.result,
        explanation: result.explanation,
        toolsUsed: result.toolsUsed || [],
        memoryAccessed: result.memoryAccessed || 0,
        recommendations: result.recommendations || [],
        nextSteps: result.nextSteps || '',
        issues: result.issues || '',
        executionTime,
        subAgent: this.name
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime);
      
      console.error(chalk.red(`❌ ${this.name}: Task failed - ${error.message}`));
      
      return {
        success: false,
        error: error.message,
        executionTime,
        subAgent: this.name
      };
    }
  }

  async prepareContext(task, session) {
    // Get relevant memories
    const relevantMemories = [];
    if (this.memory) {
      const searchResult = await this.memory.searchWithContext(
        task.content,
        session.userId,
        { shortTermLimit: 3, longTermLimit: 5, preferencesLimit: 3 }
      );
      
      relevantMemories.push(...searchResult.shortTerm);
      relevantMemories.push(...searchResult.longTerm);
    }

    // Get available tools (filtered by allowed tools)
    const availableTools = this.tools.getAll().filter(tool => 
      this.allowedTools.includes('*') || 
      this.allowedTools.includes(tool.name)
    );

    // Get available files
    const files = this.virtualFs ? 
      Object.entries(this.virtualFs.listFiles()).map(([name, content]) => ({
        name,
        description: `${content.length} characters`
      })) : [];

    return {
      userId: session.userId,
      sessionId: session.id,
      taskId: task.id,
      taskDescription: task.content,
      successCriteria: task.successCriteria,
      userPreferences: session.memories.userPreferences,
      relevantMemories: relevantMemories.map(m => ({ content: m.content })),
      availableTools: availableTools.map(t => ({ 
        name: t.name, 
        description: t.description 
      })),
      files
    };
  }

  async generateResponse(context) {
    const prompt = this.promptTemplate.compile(context);
    
    let response = '';
    for await (const chunk of this.llm.stream(prompt)) {
      if (typeof chunk === 'string') {
        response += chunk;
      }
    }

    // Try to parse YAML response
    try {
      const yamlMatch = response.match(/```yaml\s*([\s\S]*?)\s*```/);
      if (yamlMatch) {
        let yamlContent = yamlMatch[1];
        // Basic YAML cleanup
        yamlContent = this.cleanYAMLResponse(yamlContent);
        return YAML.parse(yamlContent);
      }

      // Try to parse JSON for backward compatibility
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try parsing entire response as YAML
      const cleanResponse = this.cleanYAMLResponse(response);
      const parsed = YAML.parse(cleanResponse);
      return parsed;

    } catch (error) {
      // Try to extract structured information from text
      const extracted = this.extractStructuredInfo(response, context);
      if (extracted) {
        return extracted;
      }

      // Ultimate fallback: create structured response from text
      return {
        success: true,
        result: response,
        explanation: `Generated response using ${this.name} agent`,
        toolsUsed: [],
        memoryAccessed: context.relevantMemories.length,
        recommendations: [],
        nextSteps: '',
        issues: 'Response was not in expected YAML format'
      };
    }
  }

  cleanYAMLResponse(content) {
    // Remove extra whitespace and fix basic formatting issues
    let lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    return lines.join('\n');
  }

  extractStructuredInfo(text, context) {
    try {
      // Try to extract key information from the text response
      const result = {
        success: true,
        result: '',
        explanation: '',
        toolsUsed: [],
        memoryAccessed: context.relevantMemories.length,
        recommendations: [],
        nextSteps: '',
        issues: ''
      };

      // Look for success indicator
      const successMatch = text.match(/success:\s*(true|false)/i);
      if (successMatch) {
        result.success = successMatch[1].toLowerCase() === 'true';
      }

      // Extract main result/content
      const resultMatch = text.match(/result:\s*["\']?([^"'\n]+)["\']?/i);
      if (resultMatch) {
        result.result = resultMatch[1].trim();
      } else {
        // Use first substantial paragraph as result
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
        if (paragraphs.length > 0) {
          result.result = paragraphs[0].trim();
        }
      }

      // Extract explanation
      const explanationMatch = text.match(/explanation:\s*["\']?([^"'\n]+)["\']?/i);
      if (explanationMatch) {
        result.explanation = explanationMatch[1].trim();
      } else {
        result.explanation = `Generated response using ${this.name} agent based on text analysis`;
      }

      return result;

    } catch (error) {
      return null;
    }
  }

  updateStats(success, executionTime) {
    this.stats.tasksExecuted++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = this.stats.totalExecutionTime / this.stats.tasksExecuted;
    
    if (success) {
      const successfulTasks = Math.round(this.stats.successRate * (this.stats.tasksExecuted - 1)) + 1;
      this.stats.successRate = successfulTasks / this.stats.tasksExecuted;
    } else {
      const successfulTasks = Math.round(this.stats.successRate * (this.stats.tasksExecuted - 1));
      this.stats.successRate = successfulTasks / this.stats.tasksExecuted;
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async *execAsyncStream(shared) {
    yield chalk.cyan(`🤖 ${this.name}: Starting task execution...\n`);
    
    const result = await this.execute(shared.task, shared.session);
    
    if (result.success) {
      yield chalk.green(`✅ ${this.name}: Task completed successfully\n`);
      yield chalk.gray(`Result: ${result.result.substring(0, 100)}...\n`);
    } else {
      yield chalk.red(`❌ ${this.name}: Task failed - ${result.error}\n`);
    }
  }
}

/**
 * Sub-Agent Manager
 */
export class SubAgentManager {
  constructor(config) {
    this.llm = config.llm;
    this.memory = config.memory;
    this.tools = config.tools;
    this.virtualFs = config.virtualFs;
    this.customSubAgents = config.subAgents || [];
    
    this.subAgents = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize built-in sub-agents
    for (const [name, definition] of Object.entries(SUB_AGENT_DEFINITIONS)) {
      const subAgent = new SubAgent(definition, {
        llm: this.llm,
        memory: this.memory,
        tools: this.tools,
        virtualFs: this.virtualFs
      });
      
      this.subAgents.set(name, subAgent);
    }

    // Initialize custom sub-agents
    for (const customDef of this.customSubAgents) {
      const subAgent = new SubAgent(customDef, {
        llm: this.llm,
        memory: this.memory,
        tools: this.tools,
        virtualFs: this.virtualFs
      });
      
      this.subAgents.set(customDef.name, subAgent);
    }

    this.initialized = true;
    console.log(chalk.green(`✅ Sub-agent manager initialized with ${this.subAgents.size} agents`));
  }

  selectSubAgent(task, session) {
    // If task specifies a sub-agent, use it
    if (task.assignedSubAgent && this.subAgents.has(task.assignedSubAgent)) {
      return this.subAgents.get(task.assignedSubAgent);
    }

    // Smart selection based on task content and type
    const taskContent = task.content.toLowerCase();
    
    // Research-related keywords
    if (taskContent.includes('research') || taskContent.includes('analyze') || 
        taskContent.includes('investigate') || taskContent.includes('study')) {
      return this.subAgents.get('research-agent');
    }

    // Code-related keywords
    if (taskContent.includes('code') || taskContent.includes('program') || 
        taskContent.includes('implement') || taskContent.includes('debug') ||
        taskContent.includes('function') || taskContent.includes('class')) {
      return this.subAgents.get('code-agent');
    }

    // Data-related keywords
    if (taskContent.includes('data') || taskContent.includes('statistics') || 
        taskContent.includes('chart') || taskContent.includes('graph') ||
        taskContent.includes('calculate') || taskContent.includes('analyze')) {
      return this.subAgents.get('data-agent');
    }

    // Content-related keywords
    if (taskContent.includes('write') || taskContent.includes('edit') || 
        taskContent.includes('content') || taskContent.includes('document') ||
        taskContent.includes('report') || taskContent.includes('article')) {
      return this.subAgents.get('content-agent');
    }

    // Default to general-purpose
    return this.subAgents.get('general-purpose');
  }

  getGeneralPurposeAgent() {
    return this.subAgents.get('general-purpose');
  }

  getSubAgent(name) {
    return this.subAgents.get(name);
  }

  getAllSubAgents() {
    return Array.from(this.subAgents.values());
  }

  getSubAgentCount() {
    return this.subAgents.size;
  }

  getSubAgentStats() {
    const stats = {};
    for (const [name, agent] of this.subAgents) {
      stats[name] = agent.getStats();
    }
    return stats;
  }
}

export default {
  SubAgent,
  SubAgentManager,
  SUB_AGENT_DEFINITIONS
};
