'use server';
/**
 * @fileOverview Advanced SEO Keyword Analysis using OpenAI SDK with Horizon Beta
 * 
 * Direct integration with OpenRouter's Horizon Beta model for superior SEO intelligence.
 * Generates comprehensive keyword strategy and content recommendations.
 */

import { generateWithSchema } from '@/ai/genkit';
import {
  AdvancedSeoKeywordAnalysisInputSchema,
  AdvancedSeoKeywordAnalysisOutputSchema,
  type AdvancedSeoKeywordAnalysisInput,
  type AdvancedSeoKeywordAnalysisOutput,
} from '@/ai/types';

/**
 * Generates comprehensive SEO keyword analysis using Horizon Beta intelligence.
 * Provides strategic insights for content creation and SEO optimization.
 */
export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  
  const systemPrompt = `You are a Senior Partner at McKinsey Digital with 20+ years leading SEO strategy for Fortune 500 companies. Your keyword analysis directly influences billion-dollar marketing investments and competitive positioning strategies.

CRITICAL: Every recommendation must be INVESTMENT-GRADE with precise, actionable insights suitable for C-suite strategic planning and multi-million dollar marketing budgets.`;

  const userPrompt = `Analyze keyword "${input.keyword}" for ${input.businessType} industry with C-suite strategic precision.

**REQUIRED JSON STRUCTURE (INVESTMENT-GRADE PRECISION):**
{
  "searchIntent": "Commercial",
  "targetAudience": "Detailed user persona with demographics and behavior patterns",
  "competitiveLandscape": "Specific competitor analysis with market positioning",
  "uniqueContentAngle": "Defensible content strategy with competitive advantage",
  "longTailKeywords": ["related keyword 1", "related keyword 2", "related keyword 3", "related keyword 4", "related keyword 5"],
  "relatedQuestions": ["What is...", "How to...", "Why does...", "Best practices for..."],
  "contentOutline": {
    "title": "SEO-optimized content title under 60 characters",
    "sections": [
      {
        "heading": "Section 1 Title",
        "points": ["Key point 1", "Key point 2", "Key point 3"]
      },
      {
        "heading": "Section 2 Title", 
        "points": ["Key point 1", "Key point 2", "Key point 3"]
      }
    ]
  },
  "difficultyAnalysis": "Specific ranking difficulty assessment with success factors",
  "confidenceScore": 85,
  "simulatedDataSources": ["https://semrush.com/analytics", "https://ahrefs.com/keywords", "https://searchconsole.google.com"]
}

**INVESTMENT-GRADE REQUIREMENTS:**
- Search Intent: Precise classification with conversion potential analysis
- Target Audience: Specific demographics, pain points, and search behavior
- Competitive Analysis: Real market positioning with actionable differentiation
- Content Strategy: Implementable recommendations with measurable outcomes
- Keywords: Realistic search terms with actual commercial value
- Sources: Professional URLs to legitimate SEO intelligence platforms

**CRITICAL:** This analysis drives million-dollar marketing decisions. Precision over creativity.`;

  try {
    const result = await generateWithSchema<AdvancedSeoKeywordAnalysisOutput>(
      userPrompt,
      AdvancedSeoKeywordAnalysisOutputSchema,
      systemPrompt
    );

    return result;
  } catch (error) {
    console.error('Error generating SEO keyword analysis:', error);
    throw new Error(`Failed to generate SEO keyword analysis: ${error}`);
  }
}