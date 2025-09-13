# 数据分析

使用 SkinFlow 的多智能体系统进行智能数据处理和分析。

## 概述

本示例演示如何构建智能数据分析工作流，能够处理各种数据类型、生成洞察并创建报告。

## 功能特性

- **数据摄取**：处理多种数据格式（CSV、JSON、Excel、数据库）
- **数据清洗**：自动化数据预处理和质量检查
- **统计分析**：生成描述性和推论性统计
- **模式识别**：识别趋势、异常和相关性
- **报告生成**：创建全面的分析报告和可视化
- **预测建模**：构建和评估预测模型

## 用例

- **商业智能**：销售分析、客户细分、市场趋势
- **财务分析**：投资组合分析、风险评估、欺诈检测
- **科学研究**：实验数据分析、假设检验
- **运营分析**：流程优化、性能监控
- **客户分析**：行为分析、流失预测、满意度指标

## 设置

```bash
cd examples/data-analysis
npm install
cp env.example .env
```

## 基础使用

### 简单数据分析

```javascript
import { createMultiAgentFramework } from 'skingflow'

const framework = await createMultiAgentFramework({
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4'
  }
})

// 分析销售数据
const result = await framework.processRequest(
  "分析此销售数据并识别关键趋势、异常值和洞察",
  {
    userId: 'data-analyst',
    context: {
      dataType: 'sales',
      timePeriod: 'Q1-2024',
      metrics: ['revenue', 'units_sold', 'customer_acquisition']
    }
  }
)
```

### 高级分析工作流

```javascript
// 定义全面分析工作流
const analysisWorkflow = {
  dataSources: ['sales.csv', 'customer_data.json', 'market_trends.xlsx'],
  objectives: [
    'identify_growth_opportunities',
    'analyze_customer_behavior',
    'detect_seasonal_patterns',
    'predict_future_trends'
  ],
  deliverables: [
    'executive_summary',
    'detailed_findings',
    'visualizations',
    'recommendations'
  ]
}

const result = await framework.processRequest(
  `执行全面数据分析：${JSON.stringify(analysisWorkflow)}`,
  { userId: 'business-intelligence-team' }
)
```

## 数据处理流水线

### 数据摄取和清洗

```javascript
// 自动化数据预处理
const preprocessingResult = await framework.processRequest(
  "清洗和预处理此数据集以进行分析",
  {
    userId: 'data-engineer',
    context: {
      rawDataset: salesData,
      requirements: {
        handleMissingValues: true,
        normalizeFormats: true,
        removeOutliers: true,
        standardizeColumns: true
      }
    }
  }
)
```

### 统计分析

```javascript
// 生成全面统计
const statsResult = await framework.processRequest(
  "执行统计分析并生成描述性统计",
  {
    userId: 'statistician',
    context: {
      dataset: cleanedData,
      analysisTypes: [
        'descriptive_statistics',
        'correlation_analysis',
        'trend_analysis',
        'distribution_analysis'
      ]
    }
  }
)
```

### 模式识别

```javascript
// 识别模式和异常
const patternResult = await framework.processRequest(
  "识别此数据中的模式、趋势和异常",
  {
    userId: 'ml-specialist',
    context: {
      data: timeSeriesData,
      methods: [
        'time_series_analysis',
        'anomaly_detection',
        'clustering',
        'classification'
      ]
    }
  }
)
```

## 高级分析

### 预测建模

```javascript
// 构建预测模型
const predictionResult = await framework.processRequest(
  "构建和评估预测模型以进行预测",
  {
    userId: 'data-scientist',
    context: {
      historicalData: salesHistory,
      targetVariable: 'revenue',
      timeHorizon: '6_months',
      modelTypes: ['linear_regression', 'random_forest', 'neural_network']
    }
  }
)
```

### 假设分析

```javascript
// 场景分析
const scenarioResult = await framework.processRequest(
  "执行假设分析和场景建模",
  {
    userId: 'business-analyst',
    context: {
      baseModel: predictiveModel,
      scenarios: [
        { name: 'optimistic', changes: { market_growth: '+20%' } },
        { name: 'pessimistic', changes: { market_growth: '-10%' } },
        { name: 'realistic', changes: { market_growth: '+5%' } }
      ]
    }
  }
)
```

## 可视化和报告

### 自动化图表生成

```javascript
// 生成数据可视化
const vizResult = await framework.processRequest(
  "为此分析创建适当的可视化",
  {
    userId: 'data-visualizer',
    context: {
      analysisResults: comprehensiveAnalysis,
      visualizationTypes: [
        'time_series_charts',
        'correlation_matrices',
        'distribution_plots',
        'comparative_analyses'
      ],
      outputFormat: 'interactive_dashboard'
    }
  }
)
```

### 报告生成

```javascript
// 生成全面报告
const reportResult = await framework.processRequest(
  "创建包含执行摘要的全面分析报告",
  {
    userId: 'business-intelligence',
    context: {
      findings: analysisResults,
      audience: 'executives',
      reportStructure: [
        'executive_summary',
        'methodology',
        'key_findings',
        'recommendations',
        'appendix'
      ]
    }
  }
)
```

## 实时分析

### 流式数据处理

```javascript
// 实时数据分析
async function processStreamingData(dataStream) {
  for await (const dataPoint of dataStream) {
    const analysis = await framework.processRequest(
      "分析此流式数据点并检测异常",
      {
        userId: 'real-time-analyst',
        context: {
          currentData: dataPoint,
          historicalContext: recentData,
          thresholds: anomalyThresholds
        }
      }
    )

    // 处理实时洞察
    if (analysis.anomalyDetected) {
      triggerAlert(analysis)
    }
  }
}
```

## 集成示例

### 数据库集成

```javascript
// 连接数据库进行分析
const dbAnalysisResult = await framework.processRequest(
  "分析数据库中的数据并生成洞察",
  {
    userId: 'database-analyst',
    context: {
      connectionString: process.env.DB_CONNECTION,
      query: "SELECT * FROM sales WHERE date >= '2024-01-01'",
      analysisType: 'sales_performance'
    }
  }
)
```

### API 集成

```javascript
// 与外部数据源集成
const apiAnalysisResult = await framework.processRequest(
  "从外部 API 获取和分析数据",
  {
    userId: 'api-analyst',
    context: {
      apiEndpoints: [
        'https://api.example.com/market-data',
        'https://api.example.com/customer-data'
      ],
      analysisGoals: [
        'market_trends',
        'customer_segments',
        'competitive_analysis'
      ]
    }
  }
)
```

## 最佳实践

1. **数据质量优先**：在分析之前始终验证和清洗数据
2. **定义明确目标**：知道您正在寻求什么洞察
3. **使用适当方法**：将分析技术与数据类型匹配
4. **验证结果**：使用多种方法交叉检查发现
5. **记录过程**：保持分析方法论和假设

## 性能优化

### 处理优化
- 对大型数据集使用流式处理
- 在可能的情况下实施并行处理
- 缓存中间结果
- 优化查询性能

### 资源管理
- 监控大型数据集的内存使用
- 实施超时机制
- 使用高效的数据结构
- 为分布式处理进行水平扩展

## 安全考虑

- **数据隐私**：确保符合数据保护法规
- **访问控制**：实施适当的身份验证和授权
- **数据加密**：保护传输中和静态的敏感数据
- **审计日志**：维护分析活动日志

## 故障排除

### 常见问题

1. **数据质量问题**：实施强大的验证和清洗
2. **性能问题**：优化算法并使用缓存
3. **内存约束**：使用流式处理和分块处理
4. **模型准确性**：使用测试数据集验证并调整参数

### 调试工具

```javascript
// 分析调试
const debugResult = await framework.processRequest(
  "调试此分析并识别问题",
  {
    userId: 'debug-specialist',
    context: {
      analysisProcess: currentAnalysis,
      inputData: rawData,
      expectedOutput: targetResults,
      actualOutput: currentResults
    }
  }
)
```

## 相关示例

- [智能助手](intelligent-assistant.md) - 用于分析任务的通用 AI 助手
- [内容创作](content-creation.md) - 分析报告生成
- [快速开始](quick-start.md) - 基础框架设置

## 下一步

- 探索特定领域分析的自定义工具
- 实现实时监控仪表板
- 设置自动化报告和警报系统
- 与商业智能平台集成