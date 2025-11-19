import openai from '../utils/openaiClient';

/**
 * Generates financial insights and recommendations using OpenAI GPT-5
 * @param {Object} financialData - Financial metrics and data to analyze
 * @returns {Promise<Object>} AI-generated insights and recommendations
 */
export async function generateFinancialAnalysis(financialData) {
  try {
    const response = await openai?.chat?.completions?.create({
      model: 'gpt-5',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert financial analyst. Analyze the provided financial data and provide actionable insights, recommendations, and risk assessments. Focus on cost optimization, revenue growth opportunities, and strategic financial planning.' 
        },
        { 
          role: 'user', 
          content: `Analyze this financial data and provide insights: ${JSON.stringify(financialData)}` 
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'financial_analysis',
          schema: {
            type: 'object',
            properties: {
              insights: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key financial insights discovered'
              },
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    action: { type: 'string' },
                    impact: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                  },
                  required: ['category', 'action', 'impact', 'priority']
                }
              },
              risks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    risk: { type: 'string' },
                    severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                    mitigation: { type: 'string' }
                  },
                  required: ['risk', 'severity', 'mitigation']
                }
              },
              optimizations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    area: { type: 'string' },
                    currentCost: { type: 'number' },
                    potentialSaving: { type: 'number' },
                    implementation: { type: 'string' }
                  },
                  required: ['area', 'currentCost', 'potentialSaving', 'implementation']
                }
              },
              confidence: { 
                type: 'number', 
                minimum: 0, 
                maximum: 1,
                description: 'Confidence level in analysis (0-1)'
              }
            },
            required: ['insights', 'recommendations', 'risks', 'confidence'],
            additionalProperties: false,
          },
        },
      },
      reasoning_effort: 'high',
      verbosity: 'high',
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('Error in AI financial analysis:', error);
    return {
      insights: ['AI analysis temporarily unavailable'],
      recommendations: [],
      risks: [],
      optimizations: [],
      confidence: 0
    };
  }
}

/**
 * Generates cost optimization suggestions using AI
 * @param {Object} costData - Current cost structure
 * @returns {Promise<Object>} AI-generated cost optimization suggestions
 */
export async function generateCostOptimization(costData) {
  try {
    const response = await openai?.chat?.completions?.create({
      model: 'gpt-5-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a cost optimization specialist. Analyze the provided cost structure and identify specific areas for cost reduction and efficiency improvements.' 
        },
        { 
          role: 'user', 
          content: `Analyze this cost structure and suggest optimizations: ${JSON.stringify(costData)}` 
        },
      ],
      reasoning_effort: 'medium',
      verbosity: 'medium',
    });

    return {
      analysis: response?.choices?.[0]?.message?.content,
      timestamp: new Date()?.toISOString()
    };
  } catch (error) {
    console.error('Error in AI cost optimization:', error);
    return {
      analysis: 'AI cost optimization analysis temporarily unavailable. Please review costs manually.',
      timestamp: new Date()?.toISOString()
    };
  }
}