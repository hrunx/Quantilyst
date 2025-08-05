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
  
  const systemPrompt = `You are a world-class CMO and Senior SEO Strategist at a top-tier digital marketing agency with 20+ years of experience. You have access to premium SEO tools, competitive analysis platforms, and real-time search data.`;

  const userPrompt = `Generate a comprehensive, executive-level SEO strategic analysis for the keyword "${input.keyword}" in the context of the ${input.businessType} industry.

**REQUIREMENTS FOR STRATEGIC SEO ANALYSIS:**

1. **SEARCH INTENT ANALYSIS**:
   - Determine primary search intent (Informational, Navigational, Commercial, Transactional)
   - Analyze user journey stage and conversion potential
   - Identify intent modifiers and semantic patterns

2. **TARGET AUDIENCE PROFILING**:
   - Define detailed user persona demographics and psychographics
   - Identify pain points, goals, and motivations
   - Analyze search behavior patterns and preferences

3. **COMPETITIVE LANDSCAPE ASSESSMENT**:
   - Analyze current top-ranking content and competitors
   - Identify content gaps and differentiation opportunities
   - Assess competitor strengths, weaknesses, and strategies

4. **UNIQUE CONTENT STRATEGY**:
   - Develop a defensible, unique content angle
   - Recommend content format and distribution strategy
   - Identify competitive advantages and differentiation points

5. **LONG-TAIL KEYWORD EXPANSION**:
   - Provide 5+ semantically related long-tail keywords
   - Include search volume estimates and difficulty scores
   - Focus on high-value, low-competition opportunities

6. **RELATED QUESTIONS & TOPICS**:
   - Identify common user questions and pain points
   - Suggest FAQ content and topic clusters
   - Include voice search and conversational queries

7. **CONTENT OUTLINE & STRATEGY**:
   - Create detailed content structure with compelling title
   - Provide section-by-section content recommendations
   - Include optimization tips for featured snippets and rankings

8. **DIFFICULTY & SUCCESS ANALYSIS**:
   - Assess ranking difficulty and competition level
   - Identify success factors and optimization requirements
   - Provide realistic timeline and resource recommendations

9. **CONFIDENCE & DATA SOURCES**:
   - Assign confidence score (0-100) based on data quality
   - List simulated data sources for credibility
   - Include methodology and analytical approach

**STRATEGIC FOCUS:**
- Provide actionable, implementable recommendations
- Consider current SEO best practices and algorithm updates
- Include technical SEO and user experience factors
- Address content marketing and distribution strategy

**OUTPUT FORMAT:** Return a valid JSON object with comprehensive analysis data.

Ensure all recommendations are specific, strategic, and provide genuine competitive advantage for ${input.businessType} content marketing.`;

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