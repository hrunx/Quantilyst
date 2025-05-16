
'use server';

/**
 * @fileOverview Provides advanced AI-powered SEO analysis for a given keyword.
 *
 * - advancedSeoKeywordAnalysis - A function that provides advanced SEO insights.
 * - AdvancedSeoKeywordAnalysisInput - The input type.
 * - AdvancedSeoKeywordAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvancedSeoKeywordAnalysisInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business for which the keyword analysis is relevant.'),
  keyword: z
    .string()
    .describe('The specific keyword to analyze.'),
});
export type AdvancedSeoKeywordAnalysisInput = z.infer<typeof AdvancedSeoKeywordAnalysisInputSchema>;

const AdvancedSeoKeywordAnalysisOutputSchema = z.object({
  longTailSuggestions: z
    .array(z.string())
    .describe('An array of long-tail keyword variations and suggestions related to the input keyword.'),
  relatedQuestions: z
    .array(z.string())
    .describe('An array of common questions people ask related to the input keyword.'),
  basicContentOutline: z.object({
    title: z.string().describe('A suggested compelling title for a piece of content about the keyword.'),
    sections: z.array(z.string()).describe('An array of suggested main sections or H2s for the content.'),
  }).describe('A basic content outline including a title and main sections.'),
  difficultyAnalysis: z
    .string()
    .describe('A brief qualitative analysis of the keyword\'s SEO difficulty and ranking potential.'),
});
export type AdvancedSeoKeywordAnalysisOutput = z.infer<typeof AdvancedSeoKeywordAnalysisOutputSchema>;

export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  return advancedSeoKeywordAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedSeoKeywordAnalysisPrompt',
  input: {schema: AdvancedSeoKeywordAnalysisInputSchema},
  output: {schema: AdvancedSeoKeywordAnalysisOutputSchema},
  prompt: `You are an expert SEO strategist and content planner.
Your task is to perform an advanced analysis for the given keyword, considering the business type.

Business Type: {{{businessType}}}
Keyword for Analysis: {{{keyword}}}

Provide the following insights:
1.  **Long-Tail Suggestions**: Generate 3-5 relevant long-tail keyword variations.
2.  **Related Questions**: Identify 3-5 common questions people search for related to this keyword.
3.  **Basic Content Outline**: Suggest a compelling title and 3-4 main section headings (like H2s) for a blog post or article targeting this keyword.
4.  **Difficulty Analysis**: Briefly explain the likely SEO difficulty for ranking for this keyword (e.g., "Highly competitive, requires significant authority and backlinks." or "Moderately competitive, focus on niche content.").

Your entire response MUST be a valid JSON object. Do not include any text, explanations, or apologies outside of this JSON object.
The JSON object must match the following structure:
{
  "longTailSuggestions": ["example long-tail 1", "example long-tail 2"],
  "relatedQuestions": ["example question 1?", "example question 2?"],
  "basicContentOutline": {
    "title": "Example Compelling Title for '{{{keyword}}}'",
    "sections": ["Introduction to {{{keyword}}}", "Key Aspect of {{{keyword}}}", "Benefits of {{{keyword}}}", "Conclusion about {{{keyword}}}"]
  },
  "difficultyAnalysis": "A brief textual analysis of the keyword's SEO difficulty."
}
`,
});

const advancedSeoKeywordAnalysisFlow = ai.defineFlow(
  {
    name: 'advancedSeoKeywordAnalysisFlow',
    inputSchema: AdvancedSeoKeywordAnalysisInputSchema,
    outputSchema: AdvancedSeoKeywordAnalysisOutputSchema,
  },
  async (input) => {
    const genResponse = await prompt(input);
    if (!genResponse.output) {
      console.error('Advanced SEO Analysis Flow: AI model did not return parseable output.', 'Raw text:', genResponse.text);
      throw new Error('AI model did not return valid structured output for advanced SEO analysis.');
    }
    return genResponse.output;
  }
);
