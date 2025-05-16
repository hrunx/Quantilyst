
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

// Wrapper function that calls the Genkit flow
export async function seoContentSuggestions(
  input: SeoContentSuggestionsInput
): Promise<SeoContentSuggestionsOutput> {
  console.log("Calling seoContentSuggestionsFlow with input:", input);
  const flowResult = await seoContentSuggestionsFlow(input);

  if (!flowResult || typeof flowResult.suggestions !== 'string') {
    console.error("Invalid or empty suggestions returned from flow:", flowResult);
    throw new Error("No valid suggestions output from seoContentSuggestionsFlow. Received: " + JSON.stringify(flowResult));
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
The JSON object must have a single key "suggestions". The value of "suggestions" must be a string containing your content ideas.

Example of the required JSON format:
{
  "suggestions": "Content idea 1. Content idea 2. More details about content idea 2."
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

    if (!genResponse.output || typeof genResponse.output.suggestions !== 'string' || genResponse.output.suggestions.trim() === "") {
      const errorMessage = 'AI model did not return valid suggestions in the expected format.';
      console.error(errorMessage, 'Raw text:', genResponse.text, 'Parsed output:', genResponse.output);
      // Forcing a structured error that matches the schema but indicates failure.
      // Or, you could throw an error that the calling function (wrapper) will handle.
      // throw new Error(errorMessage); 
      // Returning a valid schema structure with an error message, if the schema allows for it,
      // or throwing is often better. Here, we'll let the wrapper handle the thrown error if parsing fails.
      // If genResponse.output is null/undefined due to parsing failure, the `!` would throw.
      // If it's not null but suggestions are missing, we also have a problem.
       throw new Error(errorMessage + ` Raw: ${genResponse.text}. Parsed: ${JSON.stringify(genResponse.output)}`);
    }
    return genResponse.output; // No `!`, the check above handles invalid/missing output
  }
);
