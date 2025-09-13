/**
 * Data Analyzer Tool Implementation
 * 
 * @author skingko <venture2157@gmail.com>
 */

export default async function analyzeData(params) {
  const { data, analysis_type = 'statistical', include_charts = false } = params;
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  
  const results = {
    summary: '',
    statistics: {},
    insights: [],
    recommendations: [],
    charts: [],
    metadata: {
      analysis_type,
      data_points: data.length,
      timestamp: new Date().toISOString()
    }
  };
  
  // Determine if data is numeric or object-based
  const isNumeric = data.every(item => typeof item === 'number');
  const isObjectData = data.every(item => typeof item === 'object' && item !== null);
  
  if (isNumeric) {
    results.statistics = analyzeNumericData(data);
    results.summary = `Analyzed ${data.length} numeric data points. `;
    
    if (analysis_type === 'statistical') {
      results.insights = generateNumericInsights(results.statistics);
    }
    
  } else if (isObjectData) {
    results.statistics = analyzeObjectData(data);
    results.summary = `Analyzed ${data.length} structured data points. `;
    
    if (analysis_type === 'trend') {
      results.insights = generateTrendInsights(data);
    }
  } else {
    // Mixed data types
    results.statistics = analyzeMixedData(data);
    results.summary = `Analyzed ${data.length} mixed-type data points. `;
    results.insights = ['Data contains mixed types - consider data cleaning'];
  }
  
  // Generate recommendations
  results.recommendations = generateRecommendations(results.statistics, analysis_type);
  
  // Add chart recommendations if requested
  if (include_charts) {
    results.charts = generateChartRecommendations(data, analysis_type);
  }
  
  return results;
}

function analyzeNumericData(data) {
  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / data.length;
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: data.length,
    sum,
    mean: Math.round(mean * 100) / 100,
    median: getMedian(sorted),
    mode: getMode(data),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    variance: Math.round(variance * 100) / 100,
    standardDeviation: Math.round(stdDev * 100) / 100,
    quartiles: getQuartiles(sorted)
  };
}

function analyzeObjectData(data) {
  const keys = Object.keys(data[0] || {});
  const analysis = {
    count: data.length,
    fields: keys.length,
    fieldAnalysis: {}
  };
  
  keys.forEach(key => {
    const values = data.map(item => item[key]).filter(val => val != null);
    const isNumericField = values.every(val => typeof val === 'number');
    
    if (isNumericField && values.length > 0) {
      analysis.fieldAnalysis[key] = analyzeNumericData(values);
    } else {
      analysis.fieldAnalysis[key] = {
        type: 'categorical',
        unique_values: [...new Set(values)].length,
        most_common: getMode(values),
        null_count: data.length - values.length
      };
    }
  });
  
  return analysis;
}

function analyzeMixedData(data) {
  const types = {};
  data.forEach(item => {
    const type = Array.isArray(item) ? 'array' : typeof item;
    types[type] = (types[type] || 0) + 1;
  });
  
  return {
    count: data.length,
    type_distribution: types,
    most_common_type: Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b)
  };
}

function generateNumericInsights(stats) {
  const insights = [];
  
  if (stats.standardDeviation / stats.mean < 0.1) {
    insights.push('Data shows low variability - values are clustered around the mean');
  } else if (stats.standardDeviation / stats.mean > 0.5) {
    insights.push('Data shows high variability - values are spread widely');
  }
  
  if (stats.mean > stats.median) {
    insights.push('Distribution is right-skewed (mean > median)');
  } else if (stats.mean < stats.median) {
    insights.push('Distribution is left-skewed (mean < median)');
  } else {
    insights.push('Distribution appears symmetric (mean ≈ median)');
  }
  
  const iqr = stats.quartiles.q3 - stats.quartiles.q1;
  const lowerBound = stats.quartiles.q1 - 1.5 * iqr;
  const upperBound = stats.quartiles.q3 + 1.5 * iqr;
  
  if (stats.min < lowerBound || stats.max > upperBound) {
    insights.push('Potential outliers detected in the data');
  }
  
  return insights;
}

function generateTrendInsights(data) {
  const insights = [];
  
  // Look for time-based fields
  const timeFields = Object.keys(data[0] || {}).filter(key => 
    key.toLowerCase().includes('date') || 
    key.toLowerCase().includes('time') ||
    key.toLowerCase().includes('timestamp')
  );
  
  if (timeFields.length > 0) {
    insights.push(`Time-based analysis possible with field(s): ${timeFields.join(', ')}`);
  }
  
  // Look for numeric trends
  const numericFields = Object.keys(data[0] || {}).filter(key => 
    typeof data[0][key] === 'number'
  );
  
  if (numericFields.length > 0) {
    insights.push(`Trend analysis available for numeric fields: ${numericFields.join(', ')}`);
  }
  
  return insights;
}

function generateRecommendations(stats, analysisType) {
  const recommendations = [];
  
  if (analysisType === 'statistical') {
    recommendations.push('Consider visualizing the distribution with a histogram');
    recommendations.push('Check for outliers using box plots');
    
    if (stats.standardDeviation && stats.standardDeviation > 0) {
      recommendations.push('Explore data normalization if needed for modeling');
    }
  }
  
  if (analysisType === 'trend') {
    recommendations.push('Create time-series plots to visualize trends');
    recommendations.push('Consider seasonal decomposition for periodic patterns');
  }
  
  recommendations.push('Validate data quality and completeness');
  recommendations.push('Document assumptions and methodology used');
  
  return recommendations;
}

function generateChartRecommendations(data, analysisType) {
  const charts = [];
  
  const isNumeric = data.every(item => typeof item === 'number');
  
  if (isNumeric) {
    charts.push({
      type: 'histogram',
      title: 'Data Distribution',
      description: 'Shows the frequency distribution of values'
    });
    
    charts.push({
      type: 'box_plot',
      title: 'Box Plot',
      description: 'Displays quartiles and potential outliers'
    });
    
    charts.push({
      type: 'line_chart',
      title: 'Value Sequence',
      description: 'Shows values in order'
    });
  } else {
    charts.push({
      type: 'bar_chart',
      title: 'Category Distribution',
      description: 'Shows frequency of different categories'
    });
    
    if (analysisType === 'trend') {
      charts.push({
        type: 'time_series',
        title: 'Trend Over Time',
        description: 'Shows how values change over time'
      });
    }
  }
  
  return charts;
}

// Helper functions
function getMedian(sortedArray) {
  const mid = Math.floor(sortedArray.length / 2);
  return sortedArray.length % 2 === 0
    ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
    : sortedArray[mid];
}

function getMode(array) {
  const frequency = {};
  array.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  
  let maxFreq = 0;
  let mode = null;
  
  Object.entries(frequency).forEach(([value, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = isNaN(value) ? value : Number(value);
    }
  });
  
  return mode;
}

function getQuartiles(sortedArray) {
  const q1Index = Math.floor(sortedArray.length * 0.25);
  const q3Index = Math.floor(sortedArray.length * 0.75);
  
  return {
    q1: sortedArray[q1Index],
    q2: getMedian(sortedArray), // median
    q3: sortedArray[q3Index]
  };
}
