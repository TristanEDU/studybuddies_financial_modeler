import { supabase } from '../lib/supabase';

/**
 * Generates financial insights and recommendations using OpenAI via Supabase Edge Function
 * @param {Object} financialData - Financial metrics and data to analyze
 * @returns {Promise<Object>} AI-generated insights and recommendations
 */
export async function generateFinancialAnalysis(financialData) {
  try {
    // Call the Supabase Edge Function that proxies to OpenAI
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert financial analyst. Analyze the provided financial data and provide actionable insights, recommendations, and risk assessments. Focus on cost optimization, revenue growth opportunities, and strategic financial planning. Return your response as a JSON object with the following structure: { "insights": ["..."], "recommendations": [{"category": "...", "action": "...", "impact": "...", "priority": "high|medium|low"}], "risks": [{"risk": "...", "severity": "high|medium|low", "mitigation": "..."}], "optimizations": [{"area": "...", "suggestion": "...", "estimatedSavings": "..."}], "summary": "..." }' 
          },
          { 
            role: 'user', 
            content: `Analyze this financial data and provide insights: ${JSON.stringify(financialData)}` 
          },
        ],
      },
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(error.message || 'Failed to generate AI analysis');
    }

    // Parse the response from OpenAI
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Try to parse as JSON
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, returning raw content');
      // Fallback: create structured response from text
      return {
        insights: [content],
        recommendations: [],
        risks: [],
        optimizations: [],
        summary: content
      };
    }
  } catch (error) {
    console.error('Error in AI financial analysis:', error);
    return {
      insights: ['AI analysis temporarily unavailable'],
      recommendations: [],
      risks: [],
      optimizations: [],
      summary: 'AI analysis service is currently unavailable. Please try again later.'
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
    // Call the Supabase Edge Function that proxies to OpenAI
    const { data, error } = await supabase.functions.invoke('openai-proxy', {
      body: {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1500,
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
      },
    });

    if (error) {
      console.error('Error calling OpenAI proxy:', error);
      throw new Error(error.message || 'Failed to generate cost optimization');
    }

    const content = data?.choices?.[0]?.message?.content;

    return {
      analysis: content || 'No analysis available',
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