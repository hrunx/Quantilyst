'use server';
/**
 * @fileOverview A flow for generating relevant trending keywords.
 * This acts as a Market Trend Analysis Engine, taking business context
 * and returning a list of relevant, AI-generated keywords with simulated metrics.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateTrendingKeywordsInputSchema,
  GenerateTrendingKeywordsOutputSchema,
} from '@/ai/types';
import type {GenerateTrendingKeywordsOutput, GenerateTrendingKeywordsInput} from '@/ai/types';

export async function generateTrendingKeywords(
  input: GenerateTrendingKeywordsInput
): Promise<GenerateTrendingKeywordsOutput> {
  return await generateTrendingKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingKeywordsPrompt',
  input: {schema: GenerateTrendingKeywordsInputSchema},
  output: {schema: GenerateTrendingKeywordsOutputSchema},
  prompt: `
    You are a world-class Market Trend Analyst AI. Your task is to generate a list of trending keywords relevant to a specific business context.

    **Instructions:**
    1.  **Analyze the Input:** Carefully consider the user's business type: '{{{businessType}}}', country: '{{{country}}}', and city: '{{{city}}}'.
    2.  **Generate Relevant Keywords:** Create lists of keywords that are genuinely trending for that business in that location. DO NOT use generic or unrelated keywords like "sustainable business practices" unless the business is in the sustainability sector. All keywords must be highly relevant.
    3.  **Simulate Realistic Metrics:** For each keyword, provide realistic-looking (but simulated) data for search volume, trend change percentage, and SEO difficulty.
    4.  **Provide Simulated Sources:** For each keyword, list 1-2 plausible (but simulated) sources for the trend data, such as 'Google Trends', 'Exploding Topics', 'SEMrush Data', or a relevant industry publication. This adds a layer of authenticity.
    5.  **Categorize by Time Frame:** Generate keyword lists for the past hour, day, week, and month.
    6.  **Adhere Strictly to the Output Schema:** Ensure the output is a valid JSON object that matches the required schema. Each keyword must have a unique 'id'.
  `,
});


const generateTrendingKeywordsFlow = ai.defineFlow(
  {
    name: 'generateTrendingKeywordsFlow',
    inputSchema: GenerateTrendingKeywordsInputSchema,
    outputSchema: GenerateTrendingKeywordsOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;

    if (!output) {
      throw new Error('AI did not return valid trending keyword data.');
    }
    
    // Ensure unique IDs
    const allKeywords = [...output.hour, ...output.day, ...output.week, ...output.month];
    const usedIds = new Set<string>();
    allKeywords.forEach((kw, index) => {
      let newId = kw.id || `kw-${index}`;
      while (usedIds.has(newId)) {
        newId = `kw-${index}-${Math.random().toString(36).substring(7)}`;
      }
      kw.id = newId;
      usedIds.add(newId);
    });

    return output;
  }
);
