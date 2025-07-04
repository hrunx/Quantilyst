'use server';
/**
 * @fileOverview A flow for generating trending keywords based on business context.
 *
 * This file defines a Genkit flow that simulates fetching trending keywords from various
 * data sources. It uses a "tool-based" approach where the AI is instructed to use
 * a simulated tool (`getSearchTrendData`) to gather information before presenting its findings.
 * This makes the simulation more realistic and the output more structured.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  GenerateTrendingKeywordsInputSchema,
  GenerateTrendingKeywordsOutputSchema,
  type GenerateTrendingKeywordsInput,
  type GenerateTrendingKeywordsOutput,
  KeywordSchema,
} from '@/ai/types';

// Define the simulated tool for getting search trend data.
const getSearchTrendData = ai.defineTool(
  {
    name: 'getSearchTrendData',
    description:
      'Provides a list of trending keywords with their search volume, trend change, and SEO difficulty. This is a simulation.',
    inputSchema: z.object({
      businessType: z
        .string()
        .describe('The type of business to get keyword trends for.'),
      country: z.string().describe('The target country for the trends.'),
      city: z.string().optional().describe('The target city for the trends.'),
    }),
    outputSchema: z.object({
      hour: z.array(KeywordSchema),
      day: z.array(KeywordSchema),
      week: z.array(KeywordSchema),
      month: z.array(KeywordSchema),
    }),
  },
  async (input) => {
    // In a real application, this would call an external API (e.g., Google Trends, SEMrush).
    // Here, we are returning realistic but randomly generated data to simulate the tool's output.
    // The AI will receive this data and use it to answer the user's request.

    const generateKeywords = (count: number, volumeMultiplier: number, changeRange: number) => {
      return Array.from({length: count}, (_, i) => ({
        id: `${Math.random().toString(36).substring(7)}-${i}`,
        name: `Simulated Keyword ${i + 1} for ${input.businessType}`,
        volume: Math.floor(Math.random() * 1000 * volumeMultiplier),
        change: Math.floor(Math.random() * (changeRange * 2)) - changeRange, // e.g., -10 to 10
        difficulty: Math.floor(Math.random() * 100),
        serpFeatures: ['Featured Snippet', 'People Also Ask'].slice(0, Math.floor(Math.random() * 3)),
        sources: ['getSearchTrendData'],
      }));
    };
    
    return {
      hour: generateKeywords(3, 1, 20),
      day: generateKeywords(5, 10, 15),
      week: generateKeywords(10, 50, 10),
      month: generateKeywords(15, 100, 5),
    };
  }
);


/**
 * Generates a list of trending keywords for different timeframes.
 * This is the main entry point to be called from the application server.
 * @param input - The business context for which to generate keywords.
 * @returns A promise that resolves to an object containing keywords for different timeframes.
 */
export async function generateTrendingKeywords(
  input: GenerateTrendingKeywordsInput
): Promise<GenerateTrendingKeywordsOutput> {
  // This flow now calls the tool to get the data.
  return await generateTrendingKeywordsFlow(input);
}


// Define the Genkit prompt which now uses the tool.
const generateTrendingKeywordsPrompt = ai.definePrompt({
  name: 'generateTrendingKeywordsPrompt',
  input: {schema: GenerateTrendingKeywordsInputSchema},
  output: {schema: GenerateTrendingKeywordsOutputSchema},
  tools: [getSearchTrendData],
  prompt: `
    You are a market intelligence analyst. Your task is to identify trending keywords for a '{{businessType}}' business
    in {{country}}{{#if city}}, {{city}}{{/if}}.
    
    Use the getSearchTrendData tool to fetch the required keyword data.
    
    Once you have the data from the tool, format it and return it to the user.
    Do not add any extra commentary. Your entire response should be the JSON data structure from the tool.
  `,
});

// Define the Genkit flow that orchestrates the keyword generation.
const generateTrendingKeywordsFlow = ai.defineFlow(
  {
    name: 'generateTrendingKeywordsFlow',
    inputSchema: GenerateTrendingKeywordsInputSchema,
    outputSchema: GenerateTrendingKeywordsOutputSchema,
  },
  async (input) => {
    const {output} = await generateTrendingKeywordsPrompt(input);
    // The AI is expected to call the tool and format the output directly.
    return output!;
  }
);
