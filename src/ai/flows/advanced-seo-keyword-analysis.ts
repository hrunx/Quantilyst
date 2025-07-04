
'use server';
/**
 * @fileOverview This file defines the Genkit flow for advanced SEO keyword analysis.
 *
 * This flow provides a deep, CMO-level strategic brief for a given keyword, including
 * search intent, target audience, competitive landscape, content angles, and more.
 *
 * The main export is `advancedSeoKeywordAnalysis`, which is the entry point for this flow.
 */

import { ai } from '@/ai/genkit';
import {
  AdvancedSeoKeywordAnalysisInputSchema,
  type AdvancedSeoKeywordAnalysisInput,
  AdvancedSeoKeywordAnalysisOutputSchema,
  type AdvancedSeoKeywordAnalysisOutput,
} from '@/ai/types';

export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  return await advancedSeoKeywordAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedSeoKeywordAnalysisPrompt',
  input: { schema: AdvancedSeoKeywordAnalysisInputSchema },
  output: { schema: AdvancedSeoKeywordAnalysisOutputSchema },
  prompt: `
    You are a world-class CMO and SEO strategist. Your task is to provide a comprehensive, investor-grade strategic brief for the keyword: "{{keyword}}" in the context of a "{{businessType}}" business.

    Analyze the keyword and provide the following insights in the required JSON format:

    1.  **searchIntent**: Classify the user's primary intent (e.g., "Informational", "Commercial Investigation", "Transactional", "Navigational").
    2.  **targetAudience**: Describe the ideal person searching for this keyword. Be specific about their role, goals, and pain points.
    3.  **competitiveLandscape**: Briefly analyze the top-ranking results. What kind of content is succeeding (e.g., blog posts, videos, tools)? What is the general difficulty?
    4.  **contentAngle**: Propose a unique, compelling angle for a piece of content that would stand out from the competition.
    5.  **longTailKeywords**: Generate 5-7 related, more specific long-tail keywords.
    6.  **relatedQuestions**: List 5-7 common questions users ask related to this keyword (suitable for "People Also Ask" sections).
    7.  **detailedContentOutline**: Create a detailed content outline with a compelling title and at least 3-4 section headings. Each section should have 2-3 bullet points outlining the key talking points.
    8.  **difficultyAnalysis**: Provide a brief, qualitative explanation of the ranking difficulty. Consider factors like competitor authority, content type, and intent.
    9.  **confidenceScore**: Provide a confidence score (0-100) for your analysis based on the clarity of the keyword and business context.
    10. **simulatedSources**: List 3-5 simulated but realistic-looking URLs of sources you might have consulted for this analysis (e.g., 'https://blog.hubspot.com/marketing/seo-strategy', 'https://moz.com/beginners-guide-to-seo').
  `,
});

const advancedSeoKeywordAnalysisFlow = ai.defineFlow(
  {
    name: 'advancedSeoKeywordAnalysisFlow',
    inputSchema: AdvancedSeoKeywordAnalysisInputSchema,
    outputSchema: AdvancedSeoKeywordAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate advanced SEO analysis.');
    }
    return output;
  }
);
