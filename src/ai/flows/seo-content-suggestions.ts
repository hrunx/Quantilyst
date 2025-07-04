
'use server';
/**
 * @fileOverview This file defines the Genkit flow for generating SEO content suggestions.
 *
 * This flow provides actionable content briefs based on trending keywords for a given
 * business type. Each brief includes a title, hook, and key talking points.
 *
 * The main export is `seoContentSuggestions`.
 */

import { ai } from '@/ai/genkit';
import {
  SeoContentSuggestionsInputSchema,
  type SeoContentSuggestionsInput,
  SeoContentSuggestionsOutputSchema,
  type SeoContentSuggestionsOutput,
} from '@/ai/types';


export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  return await seoContentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoContentSuggestionsPrompt',
  input: { schema: SeoContentSuggestionsInputSchema },
  output: { schema: SeoContentSuggestionsOutputSchema },
  prompt: `
    You are an expert Content Strategist for a "{{businessType}}" business.
    Based on the following trending keywords: "{{trendingKeywords}}", generate 3 distinct and actionable content briefs.

    Each brief in the "suggestions" array must be a JSON object containing:
    1.  **title**: A compelling, SEO-friendly title for the content.
    2.  **hook**: An engaging opening line or hook to capture the reader's attention.
    3.  **points**: A list of 3-4 key talking points or sections that should be covered in the content.
  `,
});

const seoContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'seoContentSuggestionsFlow',
    inputSchema: SeoContentSuggestionsInputSchema,
    outputSchema: SeoContentSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate SEO content suggestions.');
    }
    return output;
  }
);
