
'use server';

/**
 * @fileOverview Generates a comprehensive set of trending keywords for different timeframes
 * based on a business type and location.
 *
 * - generateTrendingKeywords - A function that generates relevant trending keywords.
 * - GenerateTrendingKeywordsInput - The input type.
 * - GenerateTrendingKeywordsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// This schema mirrors the `Keyword` interface in `src/lib/mockData.ts`
const KeywordSchema = z.object({
  id: z.string().describe("A unique identifier for the keyword (e.g., 'h1', 'd2')."),
  name: z.string().describe('The name of the trending keyword.'),
  volume: z.number().describe('The search volume or trend score for the keyword.'),
  change: z.number().describe('The percentage change over the previous period.'),
  difficulty: z.number().min(0).max(100).describe('The SEO difficulty score (0-100).'),
  serpFeatures: z.array(z.string()).describe('An array of observed SERP features (e.g., "Featured Snippet", "Local Pack").'),
});

// This schema mirrors the `TimeFrameKeywords` interface in `src/lib/mockData.ts`
const GenerateTrendingKeywordsOutputSchema = z.object({
  hour: z.array(KeywordSchema).describe('An array of 3-5 trending keywords for the past hour.'),
  day: z.array(KeywordSchema).describe('An array of 3-5 trending keywords for the past day.'),
  week: z.array(KeywordSchema).describe('An array of 5-10 trending keywords for the past week.'),
  month: z.array(KeywordSchema).describe('An array of 5-10 trending keywords for the past month.'),
});
export type GenerateTrendingKeywordsOutput = z.infer<typeof GenerateTrendingKeywordsOutputSchema>;

const GenerateTrendingKeywordsInputSchema = z.object({
  businessType: z.string().describe('The type of business or industry.'),
  country: z.string().describe('The full name of the target country for the analysis (e.g., "United States", "Saudi Arabia").'),
  city: z.string().optional().describe('The optional target city.'),
});
export type GenerateTrendingKeywordsInput = z.infer<typeof GenerateTrendingKeywordsInputSchema>;


export async function generateTrendingKeywords(
  input: GenerateTrendingKeywordsInput
): Promise<GenerateTrendingKeywordsOutput> {
  return generateTrendingKeywordsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateTrendingKeywordsPrompt',
  input: {schema: GenerateTrendingKeywordsInputSchema},
  output: {schema: GenerateTrendingKeywordsOutputSchema},
  prompt: `You are a world-class Market Trend Analysis Engine for a professional SEO dashboard. Your task is to generate a realistic and relevant set of trending keywords based on a user's search query.

The user is a marketing director and needs to see keywords that are currently trending for their specific business and location.

Analyze the following search query:
- Business Type / Industry: {{{businessType}}}
- Target Country: {{{country}}}
{{#if city}}- Target City: {{{city}}}{{/if}}

Based on this query, generate a comprehensive JSON object containing trending keywords for four different timeframes: 'hour', 'day', 'week', and 'month'.

IMPORTANT INSTRUCTIONS:
1.  **Relevance is Key**: The keywords MUST be highly relevant to the provided business type and location. Do NOT use generic keywords like "sustainable business practices" unless it is directly relevant. For example, if the business is "Luxury Car Detailing in Dubai", keywords should be about high-end cars, ceramic coatings, paint protection, etc., in that region.
2.  **Realistic Data**: The 'volume', 'change', 'difficulty', and 'serpFeatures' must look like plausible data a real SEO tool would provide.
3.  **JSON Structure**: Your entire response MUST be a single, valid JSON object that strictly adheres to the output schema. Do not include any text, explanations, or markdown formatting outside of the JSON object.

Example of the required JSON output structure:
{
  "hour": [
    { "id": "h1", "name": "urgent relevant keyword 1", "volume": 150, "change": 12, "difficulty": 45, "serpFeatures": ["People Also Ask"] }
  ],
  "day": [
    { "id": "d1", "name": "daily trend keyword 1", "volume": 1200, "change": 7, "difficulty": 65, "serpFeatures": ["Featured Snippet", "Top Stories"] }
  ],
  "week": [
    { "id": "w1", "name": "weekly relevant topic 1", "volume": 8500, "change": 18, "difficulty": 70, "serpFeatures": ["Knowledge Panel"] },
    { "id": "w2", "name": "weekly relevant topic 2", "volume": 7200, "change": 11, "difficulty": 62, "serpFeatures": ["Related Searches"] }
  ],
  "month": [
    { "id": "m1", "name": "monthly core keyword 1", "volume": 35000, "change": 25, "difficulty": 80, "serpFeatures": ["Image Pack", "News Carousel"] }
  ]
}
`,
});

const generateTrendingKeywordsFlow = ai.defineFlow(
  {
    name: 'generateTrendingKeywordsFlow',
    inputSchema: GenerateTrendingKeywordsInputSchema,
    outputSchema: GenerateTrendingKeywordsOutputSchema,
  },
  async (input) => {
    const genResponse = await prompt(input);
    if (!genResponse.output) {
      console.error('Generate Trending Keywords Flow: AI model did not return parseable output.', 'Raw text:', genResponse.text);
      throw new Error('AI model did not return valid structured output for trending keywords.');
    }
    return genResponse.output;
  }
);


