/**
 * Planning Agent for Multi-Agent Framework
 * 
 * Based on deepagents planning system with detailed prompts
 * Creates and manages task lists using write_todos functionality
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { AsyncNode } from '../../../skingflow.js';
import { PromptTemplate } from '../../core/llm.js';
import YAML from 'yaml';
import chalk from 'chalk';

/**
 * Planning Agent System Prompt (based on deepagents)
 */
const PLANNING_SYSTEM_PROMPT = `You are an expert planning agent responsible for breaking down complex user requests into structured, actionable task lists. Your role is crucial in ensuring comprehensive task completion through systematic planning.

## Core Responsibilities

1. **Task Analysis**: Analyze user requests to identify all required components and dependencies
2. **Task Decomposition**: Break complex tasks into specific, actionable steps
3. **Priority Assessment**: Determine task priorities and execution order
4. **Resource Planning**: Identify required tools, sub-agents, and resources
5. **Quality Assurance**: Ensure all user requirements are captured

## Planning Process

### Step 1: Request Analysis
- Understand the user's primary objective
- Identify explicit and implicit requirements
- Assess complexity and scope
- Note any constraints or preferences

### Step 2: Task Identification
- Break down the main objective into logical components
- Identify dependencies between tasks
- Consider error handling and validation steps
- Include testing and verification tasks where appropriate

### Step 3: Task Structuring
- Order tasks by dependencies and priority
- Group related tasks for efficient execution
- Assign appropriate sub-agents or tools
- Set realistic expectations for each task

### Step 4: Plan Validation
- Review plan completeness against user requirements
- Check for logical gaps or missing steps
- Ensure tasks are specific and actionable
- Verify resource availability

## Task Creation Guidelines

### When to Create Tasks
- Complex multi-step requests (3+ distinct steps)
- Non-trivial tasks requiring careful coordination
- User explicitly requests structured approach
- Multiple deliverables or components required
- Tasks involving multiple tools or sub-agents

### Task Quality Standards
Each task should be:
- **Specific**: Clear, unambiguous description
- **Actionable**: Can be executed by appropriate agent
- **Measurable**: Success criteria are defined
- **Realistic**: Achievable with available resources
- **Time-bound**: Reasonable completion expectations

### Task States Management
- **pending**: Not yet started, ready for assignment
- **in_progress**: Currently being executed (limit to ONE at a time)
- **completed**: Successfully finished with verification
- **blocked**: Cannot proceed due to dependencies or issues
- **cancelled**: No longer needed or superseded

## Sub-Agent Assignment Strategy

Consider these factors when assigning tasks to sub-agents:
- **Specialization**: Match task requirements to agent capabilities
- **Context**: Maintain context continuity where needed
- **Load Balancing**: Distribute work efficiently
- **Dependencies**: Respect task execution order

Available sub-agent types:
- **general-purpose**: Complex reasoning, research, multi-step tasks
- **research-agent**: Information gathering, analysis, synthesis
- **code-agent**: Programming, debugging, technical implementation
- **data-agent**: Data processing, analysis, visualization
- **content-agent**: Writing, editing, content creation

## Memory and Context Integration

Leverage memory system for:
- **User Preferences**: Apply known user preferences to planning
- **Historical Context**: Learn from previous similar requests
- **Success Patterns**: Reuse successful task structures
- **Error Prevention**: Avoid previously identified pitfalls

## Planning Examples

### Example 1: Simple Request
User: "Create a login form"
Analysis: Single-component UI task
Plan: Direct implementation (no task breakdown needed)

### Example 2: Complex Request
User: "Build a complete user authentication system with registration, login, password reset, and email verification"
Analysis: Multi-component system with dependencies
Plan: 
1. Design authentication database schema
2. Implement user registration with validation
3. Create login functionality with session management
4. Build password reset workflow
5. Implement email verification system
6. Create frontend forms and components
7. Add security measures and rate limiting
8. Write comprehensive tests
9. Deploy and configure production settings

### Example 3: Research Request
User: "Research and create a comprehensive report on renewable energy trends"
Analysis: Research-heavy task with deliverable
Plan:
1. Define research scope and key questions
2. Gather data from authoritative sources
3. Analyze current market trends
4. Identify emerging technologies
5. Compile comparative analysis
6. Create visualizations and charts
7. Write executive summary
8. Review and finalize report

## Error Handling and Adaptation

When plans encounter issues:
- **Reassess**: Re-evaluate remaining tasks
- **Adapt**: Modify plan based on new information
- **Communicate**: Update user on changes
- **Learn**: Store lessons for future planning

## Quality Metrics

Measure planning success by:
- **Completeness**: All requirements addressed
- **Efficiency**: Optimal task ordering and resource usage
- **Clarity**: Tasks are well-defined and actionable
- **Adaptability**: Plan can handle unexpected issues
- **User Satisfaction**: Meets or exceeds user expectations

Remember: A good plan is the foundation of successful task execution. Take time to create comprehensive, well-structured plans that set up the entire system for success.`;

/**
 * Planning Agent Implementation
 */
export class PlanningAgent extends AsyncNode {
  constructor(config) {
    super();
    
    this.llm = config.llm;
    this.memory = config.memory;
    this.tools = config.tools;
    this.instructions = config.instructions || '';
    
    this.promptTemplate = new PromptTemplate(`
${PLANNING_SYSTEM_PROMPT}

## Custom Instructions
${this.instructions}

## Current Context
User ID: {{userId}}
Session ID: {{sessionId}}

{{#if userPreferences}}
## User Preferences
{{#each userPreferences}}
- {{memory}}
{{/each}}
{{/if}}

{{#if longTermMemories}}
## Relevant History
{{#each longTermMemories}}
- {{content}}
{{/each}}
{{/if}}

{{#if shortTermMemories}}
## Recent Context
{{#each shortTermMemories}}
- {{content}}
{{/each}}
{{/if}}

## Available Tools
{{#each availableTools}}
- **{{name}}**: {{description}}
{{/each}}

## Available Sub-Agents
{{#each availableSubAgents}}
- **{{name}}**: {{description}}
{{/each}}

## User Request
{{userRequest}}

## Planning Task

Analyze the user request and create a comprehensive plan. Follow these steps:

1. **Analysis**: Assess the request complexity and requirements
2. **Planning**: If this requires multiple steps or is complex, create a structured task list
3. **Resource Assignment**: Identify appropriate sub-agents and tools for each task
4. **Validation**: Ensure the plan addresses all user requirements

If the request is simple and can be handled directly, respond with:
\`\`\`yaml
needsPlanning: false
reason: "Simple request that can be handled directly"
directAction: "description of direct action to take"
\`\`\`

If the request requires planning, respond with:
\`\`\`yaml
needsPlanning: true
analysis: "detailed analysis of the request"
tasks:
  - id: "task_1"
    content: "specific task description"
    priority: "high/medium/low"
    estimatedDuration: "time estimate"
    assignedSubAgent: "sub-agent name or null"
    requiredTools:
      - "tool1"
      - "tool2"
    dependencies:
      - "task_id"
    successCriteria: "how to verify completion"
executionStrategy: "overall approach and coordination notes"
riskAssessment: "potential issues and mitigation strategies"
\`\`\`

Focus on creating actionable, specific tasks that will lead to successful completion of the user's request.
`);
  }

  async initialize() {
    console.log(chalk.blue('📋 Planning agent initialized'));
  }

  async createPlan(session) {
    console.log(chalk.cyan('📋 Creating execution plan...'));

    try {
      // Prepare context for planning
      const context = {
        userId: session.userId,
        sessionId: session.id,
        userRequest: session.request,
        userPreferences: session.memories.userPreferences.map(m => ({ memory: m.content })),
        longTermMemories: session.memories.longTerm.map(m => ({ content: m.content })),
        shortTermMemories: session.memories.shortTerm.map(m => ({ content: m.content })),
        availableTools: this.tools.getAll().map(t => ({ 
          name: t.name, 
          description: t.description 
        })),
        availableSubAgents: [
          { name: 'general-purpose', description: 'General-purpose agent for complex reasoning and multi-step tasks' },
          { name: 'research-agent', description: 'Specialized in information gathering and analysis' },
          { name: 'code-agent', description: 'Programming and technical implementation tasks' },
          { name: 'data-agent', description: 'Data processing, analysis, and visualization' },
          { name: 'content-agent', description: 'Writing, editing, and content creation' }
        ]
      };

      // Generate plan using LLM
      const planningPrompt = this.promptTemplate.compile(context);
      let response = '';
      
      for await (const chunk of this.llm.stream(planningPrompt)) {
        if (typeof chunk === 'string') {
          response += chunk;
        }
      }

      // Parse the response
      const plan = this.parsePlanResponse(response);
      
      if (plan.needsPlanning) {
        // Store tasks in session
        session.todos = plan.tasks.map(task => ({
          ...task,
          status: 'pending',
          createdAt: new Date()
        }));

        // Store plan metadata
        session.planMetadata = {
          analysis: plan.analysis,
          executionStrategy: plan.executionStrategy,
          riskAssessment: plan.riskAssessment,
          createdAt: new Date()
        };

        // Use write_todos tool to create structured task list
        if (this.tools.has('write_todos')) {
          await this.tools.execute('write_todos', {
            todos: session.todos.map(task => ({
              content: task.content,
              status: task.status,
              priority: task.priority,
              metadata: {
                subAgent: task.assignedSubAgent,
                tools: task.requiredTools,
                dependencies: task.dependencies,
                successCriteria: task.successCriteria
              }
            }))
          });
        }

        console.log(chalk.green(`✅ Created plan with ${plan.tasks.length} tasks`));
        console.log(chalk.gray(`Strategy: ${plan.executionStrategy}`));
        
        // Store planning result in memory
        await this.memory.addShortTermMemory({
          userId: session.userId,
          sessionId: session.id,
          content: `Planning completed: ${plan.analysis}`,
          type: 'planning_result',
          category: 'system',
          metadata: {
            taskCount: plan.tasks.length,
            strategy: plan.executionStrategy
          }
        });

      } else {
        // Simple request - no planning needed
        session.directAction = plan.directAction;
        session.todos = [];
        
        console.log(chalk.yellow(`⚡ Direct action: ${plan.directAction}`));
        console.log(chalk.gray(`Reason: ${plan.reason}`));
      }

      return plan;

    } catch (error) {
      console.error(chalk.red('❌ Planning failed:'), error.message);
      
      // Fallback: create a simple general task
      session.todos = [{
        id: 'fallback_task',
        content: session.request,
        priority: 'medium',
        status: 'pending',
        assignedSubAgent: 'general-purpose',
        requiredTools: [],
        dependencies: [],
        successCriteria: 'User request addressed',
        createdAt: new Date()
      }];

      return {
        needsPlanning: true,
        analysis: 'Fallback plan due to planning error',
        tasks: session.todos
      };
    }
  }

  parsePlanResponse(response) {
    try {
      // Extract YAML from response
      const yamlMatch = response.match(/```yaml\s*([\s\S]*?)\s*```/);
      if (yamlMatch) {
        let yamlContent = yamlMatch[1];
        
        // Clean up common YAML formatting issues
        yamlContent = this.cleanYAMLContent(yamlContent);
        
        return YAML.parse(yamlContent);
      }

      // Try to extract JSON for backward compatibility
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Fallback: try to parse the entire response as YAML
      let cleanResponse = this.cleanYAMLContent(response);
      return YAML.parse(cleanResponse);

    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to parse planning response:'), error.message);
      
      // Try to extract key information from text
      const extractedInfo = this.extractInfoFromText(response);
      if (extractedInfo) {
        return extractedInfo;
      }
      
      // Ultimate fallback response
      return {
        needsPlanning: true,
        analysis: 'Unable to parse planning response, creating general task',
        tasks: [{
          id: 'general_task',
          content: 'Process user request',
          priority: 'medium',
          assignedSubAgent: 'general-purpose',
          requiredTools: [],
          dependencies: [],
          successCriteria: 'User request addressed'
        }]
      };
    }
  }

  cleanYAMLContent(content) {
    // Remove extra whitespace and fix common indentation issues
    let lines = content.split('\n');
    
    // Remove empty lines at start and end
    while (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    
    if (lines.length === 0) return '';
    
    // Fix common YAML syntax issues
    let fixedLines = [];
    let inTasksArray = false;
    let currentTaskIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      
      if (trimmed === '') {
        continue; // Skip empty lines
      }
      
      // Fix broken array syntax like "dependencies:ml_scope]"
      if (trimmed.includes(']:') || trimmed.includes(']') || trimmed.includes('[')) {
        trimmed = trimmed.replace(/\[|\]/g, '');
        if (trimmed.endsWith(':')) {
          trimmed += ' []';
        }
      }
      
      // Fix quotes in values that break YAML
      if (trimmed.includes(': ') && !trimmed.startsWith('- ')) {
        const colonIndex = trimmed.indexOf(': ');
        const key = trimmed.substring(0, colonIndex);
        let value = trimmed.substring(colonIndex + 2);
        
        // Handle complex values that might contain colons or special chars
        if (value.includes(';') || value.includes(':') || value.includes(',')) {
          value = `"${value.replace(/"/g, '\\"')}"`;
          trimmed = `${key}: ${value}`;
        }
      }
      
      // Detect start of tasks array
      if (trimmed.startsWith('tasks:')) {
        inTasksArray = true;
        fixedLines.push(trimmed);
        continue;
      }
      
      // Fix task array items
      if (inTasksArray && trimmed.startsWith('- ')) {
        currentTaskIndent = 2;
        fixedLines.push('  ' + trimmed);
        continue;
      }
      
      // Fix task properties
      if (inTasksArray && (trimmed.includes(': ') || trimmed.includes(':"'))) {
        if (!trimmed.startsWith('- ')) {
          // Ensure proper indentation for task properties
          fixedLines.push('    ' + trimmed);
          continue;
        }
      }
      
      // Check if we've left the tasks array
      if (inTasksArray && trimmed.match(/^[a-zA-Z][a-zA-Z0-9_]*:/) && !trimmed.includes('  ')) {
        inTasksArray = false;
      }
      
      // Add the line with appropriate indentation
      if (inTasksArray && !trimmed.startsWith('- ') && !trimmed.startsWith('tasks:')) {
        fixedLines.push('    ' + trimmed);
      } else {
        fixedLines.push(trimmed);
      }
    }
    
    return fixedLines.join('\n');
  }

  extractInfoFromText(text) {
    // Try to extract basic information even if YAML parsing fails
    try {
      const result = {
        needsPlanning: true,
        analysis: 'Extracted from text response',
        tasks: []
      };
      
      // Look for needsPlanning
      const needsPlanningMatch = text.match(/needsPlanning:\s*(true|false)/i);
      if (needsPlanningMatch) {
        result.needsPlanning = needsPlanningMatch[1].toLowerCase() === 'true';
      }
      
      // If doesn't need planning, look for directAction
      if (!result.needsPlanning) {
        const directActionMatch = text.match(/directAction:\s*["\']?([^"'\n]+)["\']?/i);
        if (directActionMatch) {
          result.directAction = directActionMatch[1].trim();
          return result;
        }
      }
      
      // Extract analysis
      const analysisMatch = text.match(/analysis:\s*["\']?([^"'\n]+)["\']?/i);
      if (analysisMatch) {
        result.analysis = analysisMatch[1].trim();
      }
      
      // Create a general task from the content
      result.tasks = [{
        id: 'extracted_task',
        content: 'Process user request based on extracted information',
        priority: 'medium',
        assignedSubAgent: 'general-purpose',
        requiredTools: [],
        dependencies: [],
        successCriteria: 'User request addressed'
      }];
      
      return result;
      
    } catch (error) {
      return null;
    }
  }

  async updatePlan(session, updates) {
    console.log(chalk.cyan('📋 Updating execution plan...'));

    // Update existing tasks
    for (const update of updates) {
      const task = session.todos.find(t => t.id === update.taskId);
      if (task) {
        Object.assign(task, update.changes);
        task.updatedAt = new Date();
      }
    }

    // Re-run write_todos if available
    if (this.tools.has('write_todos')) {
      await this.tools.execute('write_todos', {
        todos: session.todos.map(task => ({
          content: task.content,
          status: task.status,
          priority: task.priority
        }))
      });
    }

    console.log(chalk.green('✅ Plan updated'));
  }

  async *execAsyncStream(shared) {
    yield chalk.blue('📋 Planning Agent: Analyzing request...\n');
    
    const plan = await this.createPlan(shared);
    
    if (plan.needsPlanning) {
      yield chalk.green(`✅ Created execution plan with ${plan.tasks.length} tasks\n`);
      yield chalk.gray(`📊 Strategy: ${plan.executionStrategy}\n`);
      
      if (plan.riskAssessment) {
        yield chalk.yellow(`⚠️  Risk Assessment: ${plan.riskAssessment}\n`);
      }
    } else {
      yield chalk.yellow(`⚡ Direct action planned: ${plan.directAction}\n`);
    }
  }
}

export default PlanningAgent;
