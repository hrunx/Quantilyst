
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
    .describe('The current trending keywords related to the specified business type, as a comma-separated string.'),
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
  const {output} = await seoContentSuggestionsFlow(input);
  if (!output) {
    throw new Error("No output from seoContentSuggestionsFlow");
  }
  return output;
}

const prompt = ai.definePrompt({
  name: 'seoContentSuggestionsPrompt',
  input: {schema: SeoContentSuggestionsInputSchema},
  output: {schema: SeoContentSuggestionsOutputSchema},
  prompt: `You are an AI expert in SEO content generation.
Your task is to provide SEO content suggestions to improve website visibility and attract more customers, based on the provided business type and trending keywords.

Business Type: {{{businessType}}}
Trending Keywords: {{{trendingKeywords}}}

Please format your response as a JSON object with a single key "suggestions". The value of "suggestions" should be a string containing your content ideas.
Example JSON output:
{
  "suggestions": "Here are some SEO content suggestions: 1. Create blog posts about relevant topics. 2. Optimize product descriptions with trending keywords. 3. Develop video content showcasing industry insights."
}
`,
});

const seoContentSuggestionsFlow = ai.defineFlow(
  {
    name: 'seoContentSuggestionsFlow',
    inputSchema: SeoContentSuggestionsInputSchema,
    outputSchema: SeoContentSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
