/**
 * Flow Orchestration Example using skingflow Framework
 * 
 * Demonstrates advanced flow composition and orchestration capabilities
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { createFramework } from '../../lib/builders/index.js';
import { AsyncNode } from '../../skingflow.js';
import { PromptTemplate } from '../../lib/core/llm.js';
import { FunctionTool } from '../../lib/core/tools.js';

// Custom nodes for the orchestration
class DataCollectionNode extends AsyncNode {
  async *execAsyncStream(shared) {
    yield 'Collecting data from multiple sources...\n';
    
    // Simulate data collection
    const data = {
      userQuery: shared.query || 'default query',
      timestamp: new Date().toISOString(),
      sources: ['database', 'api', 'cache'],
      metrics: {
        responseTime: Math.random() * 1000,
        accuracy: 0.95 + Math.random() * 0.05
      }
    };
    
    shared.collectedData = data;
    yield `Data collected: ${JSON.stringify(data, null, 2)}\n`;
  }
}

class DataProcessingNode extends AsyncNode {
  async *execAsyncStream(shared) {
    yield 'Processing collected data...\n';
    
    const data = shared.collectedData;
    if (!data) {
      yield 'No data to process!\n';
      return;
    }
    
    // Simulate data processing
    const processedData = {
      ...data,
      processed: true,
      insights: [
        'High accuracy detected',
        'Response time within acceptable range',
        'All sources responded successfully'
      ],
      confidence: Math.random() * 0.3 + 0.7
    };
    
    shared.processedData = processedData;
    yield `Data processed: ${JSON.stringify(processedData.insights)}\n`;
  }
}

class ReportGenerationNode extends AsyncNode {
  constructor(llmProvider) {
    super();
    this.llm = llmProvider;
  }
  
  async *execAsyncStream(shared) {
    yield 'Generating report using LLM...\n';
    
    const data = shared.processedData;
    if (!data) {
      yield 'No processed data available for report!\n';
      return;
    }
    
    const prompt = `Generate a brief analysis report based on this data:
    
Query: ${data.userQuery}
Sources: ${data.sources.join(', ')}
Insights: ${data.insights.join(', ')}
Confidence: ${(data.confidence * 100).toFixed(1)}%
Response Time: ${data.metrics.responseTime.toFixed(0)}ms

Please provide a concise summary and recommendations.`;

    if (this.llm) {
      for await (const chunk of this.llm.stream(prompt)) {
        yield chunk;
      }
    } else {
      yield 'LLM not available - using template report\n';
      yield `Analysis Report:
- Query processed: ${data.userQuery}
- Data sources: ${data.sources.length} sources
- Confidence level: ${(data.confidence * 100).toFixed(1)}%
- Performance: ${data.metrics.responseTime.toFixed(0)}ms response time
- Recommendations: System performing within normal parameters
`;
    }
    
    shared.reportGenerated = true;
  }
}

async function main() {
  console.log('🎭 Starting Flow Orchestration Example\n');

  try {
    // Create framework with tools
    const framework = await createFramework({
      llm: process.env.OPENAI_API_KEY ? {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3
      } : null,
      memory: {
        storage: {},
        autoEmbedding: false
      },
      tools: {
        loadBuiltin: true,
        custom: [
          {
            type: 'function',
            name: 'validate_data',
            description: 'Validate processed data quality',
            implementation: async (params) => {
              const threshold = params.threshold || 0.8;
              const confidence = params.confidence || 0;
              return {
                valid: confidence >= threshold,
                score: confidence,
                message: confidence >= threshold ? 'Data quality acceptable' : 'Data quality below threshold'
              };
            },
            parameters: {
              confidence: { type: 'number', description: 'Confidence score', required: true },
              threshold: { type: 'number', description: 'Minimum threshold', required: false }
            }
          }
        ]
      }
    });

    console.log('✅ Framework initialized');

    // Create orchestrated flow
    const orchestration = framework
      .createOrchestration({
        stopOnError: false,
        timeout: 60000
      })
      .addStep(new DataCollectionNode(), { name: 'Data Collection' })
      .addStep(new DataProcessingNode(), { name: 'Data Processing' })
      .addCondition(
        (shared) => shared.processedData && shared.processedData.confidence > 0.7,
        new ReportGenerationNode(framework.llm),
        null
      )
      .setVariable('startTime', Date.now())
      .build();

    console.log('🔧 Orchestration configured\n');

    // Execute the orchestration
    console.log('▶️  Starting orchestrated flow execution...\n');
    console.log('=' * 60);

    const shared = {
      query: 'Analyze system performance and generate insights',
      userId: 'orchestration-demo'
    };

    for await (const chunk of orchestration.execAsyncStream(shared)) {
      process.stdout.write(chunk);
    }

    // Show orchestration statistics
    console.log('\n📊 Orchestration Statistics:');
    console.log('=' * 40);
    const stats = orchestration.getStats();
    console.log(`Total executions: ${stats.executions}`);
    console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Average execution time: ${stats.averageTime.toFixed(0)}ms`);
    
    if (Object.keys(stats.stepStats).length > 0) {
      console.log('\nStep Statistics:');
      for (const [stepId, stepStat] of Object.entries(stats.stepStats)) {
        console.log(`  ${stepId}: ${stepStat.calls} calls, ${(stepStat.successRate * 100).toFixed(1)}% success`);
      }
    }

    // Demonstrate parallel execution
    console.log('\n\n🔄 Demonstrating Parallel Execution...\n');
    console.log('=' * 50);

    const parallelOrchestration = framework
      .createOrchestration()
      .addParallel([
        new DataCollectionNode(),
        new DataProcessingNode(),
      ], { waitForAll: true })
      .build();

    for await (const chunk of parallelOrchestration.execAsyncStream({
      query: 'Parallel processing test'
    })) {
      process.stdout.write(chunk);
    }

    await framework.close();
    console.log('\n✅ Orchestration example completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
