
'use server';
/**
 * @fileOverview Defines the Genkit flow for generating a comprehensive market deep-dive report.
 *
 * This flow acts as a virtual consultant, providing a C-suite level report including
 * TAM/SAM/SOM analysis, competitor benchmarks, and a full SWOT analysis.
 *
 * The main export is `marketDeepDive`.
 */

import { ai } from '@/ai/genkit';
import {
    MarketDeepDiveInputSchema,
    type MarketDeepDiveInput,
    MarketDeepDiveOutputSchema,
    type MarketDeepDiveOutput
} from '@/ai/types';


export async function marketDeepDive(input: MarketDeepDiveInput): Promise<MarketDeepDiveOutput> {
    return await marketDeepDiveFlow(input);
}


const prompt = ai.definePrompt({
    name: 'marketDeepDivePrompt',
    input: { schema: MarketDeepDiveInputSchema },
    output: { schema: MarketDeepDiveOutputSchema },
    prompt: `
        You are a top-tier market research consultant. Your client is a "{{businessType}}" business analyzing the market in {{country}}{{#if city}}, {{city}}{{/if}}.
        
        Generate a comprehensive, C-suite level deep-dive report in the required JSON format. The data should be realistic and insightful.

        1.  **executiveSummary**: Write a concise, professional summary of the market landscape, opportunities, and challenges for the client.
        2.  **tamSamSom**: Provide an estimated market sizing analysis.
            *   **tam**: Total Addressable Market. Include a realistic value in USD, a description, and 2-3 simulated source URLs (e.g., from Statista, Gartner, MarketResearch.com).
            *   **sam**: Serviceable Addressable Market. Include a realistic value, description, and sources.
            *   **som**: Serviceable Obtainable Market. Include a realistic value, description, and sources.
        3.  **competitors**: Identify 3-4 key competitors. For each, provide their name, key strengths, key weaknesses, and an estimated market share percentage.
        4.  **swot**: Conduct a SWOT analysis for the client's business in this market. Provide 3-4 bullet points for each category: Strengths, Weaknesses, Opportunities, and Threats.
    `,
});


const marketDeepDiveFlow = ai.defineFlow(
    {
        name: 'marketDeepDiveFlow',
        inputSchema: MarketDeepDiveInputSchema,
        outputSchema: MarketDeepDiveOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Failed to generate market deep-dive report.');
        }
        return output;
    }
);
