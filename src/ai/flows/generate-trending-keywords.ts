
'use server';
/**
 * @fileOverview This file defines the Genkit flow for generating trending keywords.
 *
 * This flow acts as a Market Trend Analysis Engine, taking a business type and location
 * to generate a realistic and relevant set of trending keywords for different timeframes.
 *
 * The main export is `generateTrendingKeywords`.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateTrendingKeywordsInputSchema,
  type GenerateTrendingKeywordsInput,
  GenerateTrendingKeywordsOutputSchema,
  type GenerateTrendingKeywordsOutput,
} from '@/ai/types';


export async function generateTrendingKeywords(
  input: GenerateTrendingKeywordsInput
): Promise<GenerateTrendingKeywordsOutput> {
  return await generateTrendingKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingKeywordsPrompt',
  input: { schema: GenerateTrendingKeywordsInputSchema },
  output: { schema: GenerateTrendingKeywordsOutputSchema },
  prompt: `
    You are a Market Trend Analysis Engine. Your task is to generate a list of trending keywords for a "{{businessType}}" business located in {{country}}{{#if city}}, {{city}}{{/if}}.

    The keywords must be highly relevant to the business type and location provided. Do NOT include generic, unrelated, or placeholder keywords like "sustainable business practices" unless it is directly relevant to the query.

    Generate realistic-looking data for each keyword, including:
    - id: A unique identifier (e.g., h1, d1, w1, m1).
    - name: The keyword phrase.
    - volume: An estimated search volume or trend score. This should vary realistically across different timeframes.
    - change: The percentage change. This should be dynamic.
    - difficulty: An SEO difficulty score from 0-100.
    - serpFeatures: A list of 0-2 relevant SERP features (e.g., "Featured Snippet", "Local Pack", "News Carousel", "Video Carousel", "People Also Ask").

    Provide lists for the past hour, day, week, and month. The number of keywords should be smaller for shorter timeframes (e.g., 3-4 for hour/day) and larger for longer ones (e.g., 5-10 for week/month). Ensure the data is plausible and contextually appropriate.
  `,
});

const generateTrendingKeywordsFlow = ai.defineFlow(
  {
    name: 'generateTrendingKeywordsFlow',
    inputSchema: GenerateTrendingKeywordsInputSchema,
    outputSchema: GenerateTrendingKeywordsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate trending keywords.');
    }
    return output;
  }
);
