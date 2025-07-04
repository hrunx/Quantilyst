'use server';
/**
 * @fileOverview Generates structured SEO content briefs based on trending keywords.
 *
 * - seoContentSuggestions: A function that generates the content briefs.
 * - SeoContentSuggestionsInput: The input type for the function.
 * - SeoContentSuggestionsOutput: The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SeoContentSuggestionsInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business or industry for context.'),
  trendingKeywords: z
    .string()
    .describe('A comma-separated list of trending keywords.'),
});
export type SeoContentSuggestionsInput = z.infer<
  typeof SeoContentSuggestionsInputSchema
>;

export const SeoContentSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().describe("A compelling, SEO-friendly title for the content piece."),
    hook: z.string().describe("A short, engaging hook or introduction for the content."),
    points: z.array(z.string()).describe("A list of key talking points, questions to answer, or sections for the content."),
  })).describe('An array of structured content briefs.'),
});
export type SeoContentSuggestionsOutput = z.infer<
  typeof SeoContentSuggestionsOutputSchema
>;

const seoContentSuggestionsPrompt = ai.definePrompt({
  name: 'seoContentSuggestionsPrompt',
  input: {schema: SeoContentSuggestionsInputSchema},
  output: {schema: SeoContentSuggestionsOutputSchema},
  prompt: `You are a Head of Content Strategy at a leading digital marketing agency.
Your task is to generate a list of actionable, professional content briefs for a client.

Client's Business Type: {{businessType}}
Current Trending Keywords: {{trendingKeywords}}

Based on this information, generate 3-4 distinct and creative content briefs. Each brief must be structured as a JSON object with a title, a hook, and key points.

- **Title**: Make it compelling and optimized for search engines.
- **Hook**: Write a 1-2 sentence introduction that grabs the reader's attention.
- **Points**: List 3-5 bullet points that outline the core topics, questions, or sections the content should cover. These should be substantive and guide the writer.

The output must be a single, valid JSON object containing an array of these structured suggestions.
`,
});

const seoContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'seoContentSuggestionsFlow',
    inputSchema: SeoContentSuggestionsInputSchema,
    outputSchema: SeoContentSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await seoContentSuggestionsPrompt(input);
    return output!;
  }
);

export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  return await seoContentSuggestionsFlow(input);
}
