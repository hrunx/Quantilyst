// 'use server'
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for SEO content based on trending keywords.
 *
 * - seoContentSuggestions - A function that provides SEO content suggestions.
 * - SeoContentSuggestionsInput - The input type for the seoContentSuggestions function.
 * - SeoContentSuggestionsOutput - The return type for the seoContentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeoContentSuggestionsInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business for which to generate SEO content suggestions.'),
  trendingKeywords: z
    .string()
    .describe('The current trending keywords related to the specified business type.'),
});
export type SeoContentSuggestionsInput = z.infer<typeof SeoContentSuggestionsInputSchema>;

const SeoContentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('AI-powered suggestions for SEO content based on trending keywords.'),
});
export type SeoContentSuggestionsOutput = z.infer<typeof SeoContentSuggestionsOutputSchema>;

export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  return seoContentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoContentSuggestionsPrompt',
  input: {schema: SeoContentSuggestionsInputSchema},
  output: {schema: SeoContentSuggestionsOutputSchema},
  prompt: `You are an AI expert in SEO content generation. Based on the business type and trending keywords provided, generate SEO content suggestions to improve website visibility and attract more customers.

Business Type: {{{businessType}}}
Trending Keywords: {{{trendingKeywords}}}

SEO Content Suggestions:`, // Removed the extra 