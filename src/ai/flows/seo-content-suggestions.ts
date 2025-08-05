'use server';
/**
 * @fileOverview SEO Content Suggestions using OpenAI SDK with Horizon Beta
 * 
 * Direct integration with OpenRouter's Horizon Beta model for content strategy.
 * Generates actionable content briefs based on trending keywords.
 */

import { generateWithSchema } from '@/ai/genkit';
import {
  SeoContentSuggestionsInputSchema,
  SeoContentSuggestionsOutputSchema,
  type SeoContentSuggestionsInput,
  type SeoContentSuggestionsOutput,
} from '@/ai/types';

/**
 * Generates SEO content suggestions using Horizon Beta intelligence.
 * Creates actionable content briefs optimized for trending keywords.
 */
export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  
  const systemPrompt = `You are an expert Content Strategist and SEO specialist with 12+ years of experience in content marketing, search optimization, and audience engagement. You have deep expertise in creating viral content that ranks well and drives conversions.`;

  const userPrompt = `Generate 3 SEO content briefs for ${input.businessType} using these keywords: ${input.trendingKeywords}

**REQUIRED JSON STRUCTURE:**
{
  "suggestions": [
    {
      "title": "SEO-optimized headline under 60 chars",
      "hook": "Engaging opening line",
      "points": ["point1", "point2", "point3", "point4"]
    }
  ]
}

**CRITICAL:** Return ONLY valid JSON with exactly 3 suggestions. Focus on high-conversion, business-critical content for ${input.businessType} industry.`;

  try {
    const result = await generateWithSchema<SeoContentSuggestionsOutput>(
      userPrompt,
      SeoContentSuggestionsOutputSchema,
      systemPrompt
    );

    return result;
  } catch (error) {
    console.error('Error generating SEO content suggestions:', error);
    throw new Error(`Failed to generate SEO content suggestions: ${error}`);
  }
}