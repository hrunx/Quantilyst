
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
    .array(z.string())
    .describe('An array of AI-powered suggestions for SEO content based on trending keywords.'),
});
export type SeoContentSuggestionsOutput = z.infer<typeof SeoContentSuggestionsOutputSchema>;

// Wrapper function that calls the Genkit flow
export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  console.log("Calling seoContentSuggestionsFlow with input:", input);
  const flowResult = await seoContentSuggestionsFlow(input);

  if (!flowResult || !Array.isArray(flowResult.suggestions) || flowResult.suggestions.length === 0) {
    const errorMsg = "No valid suggestions array output from seoContentSuggestionsFlow.";
    console.error(errorMsg, "Received:", flowResult);
    // Return an empty array or throw, depending on desired error handling.
    // For now, let's ensure it matches the schema for an empty valid case.
    // The action layer will handle if this should be an error to the user.
    return { suggestions: [] }; 
  }
  return flowResult;
}

const prompt = ai.definePrompt({
  name: 'seoContentSuggestionsPrompt',
  input: {schema: SeoContentSuggestionsInputSchema},
  output: {schema: SeoContentSuggestionsOutputSchema},
  prompt: `You are an AI expert in SEO content generation.
Your task is to provide SEO content suggestions to improve website visibility and attract more customers, based on the provided business type and trending keywords.

Business Type: {{{businessType}}}
Trending Keywords: {{{trendingKeywords}}}

Your entire response MUST be a valid JSON object. Do not include any text, explanations, or apologies outside of this JSON object.
The JSON object must have a single key "suggestions". The value of "suggestions" must be an array of strings, where each string is a distinct content idea or SEO suggestion.

Example of the required JSON format:
{
  "suggestions": [
    "Develop a blog post series targeting '{{trendingKeywords}}' for '{{businessType}}'.",
    "Create an infographic explaining how '{{businessType}}' benefits from 'keyword_example_1'.",
    "Optimize existing product pages with terms related to 'keyword_example_2'."
  ]
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
    const genResponse = await prompt(input);

    console.log('SEO Flow Raw Text Response from model:', genResponse.text);
    console.log('SEO Flow Parsed Output by Genkit:', genResponse.output);

    if (!genResponse.output || !Array.isArray(genResponse.output.suggestions) ) {
      const errorMessage = 'AI model did not return valid suggestions in the expected array format.';
      console.error(errorMessage, 'Raw text:', genResponse.text, 'Parsed output:', genResponse.output);
      // If parsing fails or the structure is wrong, genResponse.output might be null or not match the schema.
      // Genkit's zod parsing should handle this, but an explicit check is good.
      // Returning an empty array if the suggestions are not in the correct format or empty.
      return { suggestions: [] };
    }
    // If suggestions array is present but empty, that's a valid output by schema.
    return genResponse.output; 
  }
);

