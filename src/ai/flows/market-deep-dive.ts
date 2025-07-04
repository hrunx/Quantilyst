'use server';
/**
 * @fileOverview A flow for generating a C-suite level market deep-dive report.
 *
 * This file defines a Genkit flow that uses a "tool-based" approach to simulate
 * a comprehensive market analysis. It defines and uses several tools to gather
 * different pieces of information (market size, competitor data, SWOT analysis),
 * making the final report more structured and credible.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  MarketDeepDiveInputSchema,
  MarketDeepDiveOutputSchema,
  type MarketDeepDiveInput,
  type MarketDeepDiveOutput,
} from '@/ai/types';

// Tool to get market sizing data (TAM/SAM/SOM).
const getMarketSizeData = ai.defineTool(
  {
    name: 'getMarketSizeData',
    description: 'Provides simulated market sizing data (TAM, SAM, SOM) for a given business type and location.',
    inputSchema: MarketDeepDiveInputSchema,
    outputSchema: MarketDeepDiveOutputSchema.shape.tamSamSom,
  },
  async (input) => {
    // In a real application, this would query financial databases or market research reports.
    // Here, we return a realistic but simulated data structure.
    const tamValue = Math.floor(Math.random() * 5_000_000_000) + 1_000_000_000;
    const samValue = tamValue * (Math.random() * 0.2 + 0.1); // SAM is 10-30% of TAM
    const somValue = samValue * (Math.random() * 0.1 + 0.05); // SOM is 5-15% of SAM

    return {
      tam: {
        value: tamValue,
        description: `Total global demand for solutions related to ${input.businessType}.`,
        sources: ['Simulated: Gartner Reports', 'Simulated: Statista Market Forecast'],
      },
      sam: {
        value: samValue,
        description: `The segment of the TAM targeted by products and services for ${input.country}, reachable through sales and marketing channels.`,
        sources: ['Simulated: Local Government Economic Data', 'Simulated: Industry Association Surveys'],
      },
      som: {
        value: somValue,
        description: `The portion of SAM that can realistically be captured in the short term, considering competition and resources.`,
        sources: ['Simulated: Internal Business Projections', 'Simulated: Competitor Annual Reports'],
      },
    };
  }
);

// Tool to get competitor benchmark data.
const getCompetitorBenchmark = ai.defineTool(
    {
        name: 'getCompetitorBenchmark',
        description: 'Provides a simulated benchmark of key competitors.',
        inputSchema: MarketDeepDiveInputSchema,
        outputSchema: MarketDeepDiveOutputSchema.shape.competitors,
    },
    async (input) => {
        // Simulation of competitor data.
        return [
            { name: `Competitor Alpha for ${input.businessType}`, strengths: 'Strong brand recognition, large user base.', weaknesses: 'Slow to innovate, poor customer support.', marketShare: '35%' },
            { name: 'Competitor Beta Inc.', strengths: 'Agile development, strong niche community.', weaknesses: 'Limited marketing budget, low brand awareness.', marketShare: '15%' },
            { name: `Startup Gamma (${input.country})`, strengths: 'Disruptive technology, highly focused.', weaknesses: 'Unproven business model, high burn rate.', marketShare: '5%' },
        ];
    }
);

// Tool to perform a SWOT analysis.
const getSwotAnalysis = ai.defineTool(
    {
        name: 'getSwotAnalysis',
        description: 'Provides a simulated SWOT analysis for the given business context.',
        inputSchema: MarketDeepDiveInputSchema,
        outputSchema: MarketDeepDiveOutputSchema.shape.swot,
    },
    async (input) => {
        // Simulation of SWOT analysis.
        return {
            strengths: [`Unique value proposition for ${input.businessType}.`, 'Experienced founding team.'],
            weaknesses: ['Limited brand awareness.', 'Dependency on a single supplier.'],
            opportunities: [`Untapped market segment in ${input.country}.`, 'Leveraging new AI technologies.'],
            threats: ['New regulations impacting the industry.', 'Price wars from major competitors.'],
        };
    }
);

/**
 * Generates a C-suite level market deep-dive report.
 * This is the main entry point to be called from the application server.
 * @param input - The business context for the report.
 * @returns A promise that resolves to a comprehensive market analysis.
 */
export async function marketDeepDive(
  input: MarketDeepDiveInput
): Promise<MarketDeepDiveOutput> {
  return marketDeepDiveFlow(input);
}


// Define the Genkit prompt which now uses multiple tools to build the report.
const marketDeepDivePrompt = ai.definePrompt({
  name: 'marketDeepDivePrompt',
  input: {schema: MarketDeepDiveInputSchema},
  output: {schema: MarketDeepDiveOutputSchema},
  tools: [getMarketSizeData, getCompetitorBenchmark, getSwotAnalysis],
  prompt: `
    You are a principal analyst at a top-tier venture capital firm. Your task is to compile an executive-level market deep-dive report
    for a potential investment in the '{{businessType}}' sector, focusing on the market in {{country}}{{#if city}}, specifically in {{city}}{{/if}}.

    Follow these steps to construct the report:
    1.  First, call the \`getMarketSizeData\` tool to get the TAM/SAM/SOM analysis.
    2.  Next, call the \`getCompetitorBenchmark\` tool to get data on the key competitors.
    3.  Then, call the \`getSwotAnalysis\` tool to perform a SWOT analysis for a new entrant in this market.
    4.  Finally, synthesize all the gathered information into a cohesive report. Write a concise **Executive Summary** that summarizes the key findings and provides a strategic recommendation.
    5.  Assemble all the data from the tools and your executive summary into the final JSON output format. Ensure every field is populated correctly.
  `,
});

// Define the Genkit flow that orchestrates the market deep-dive report generation.
const marketDeepDiveFlow = ai.defineFlow(
  {
    name: 'marketDeepDiveFlow',
    inputSchema: MarketDeepDiveInputSchema,
    outputSchema: MarketDeepDiveOutputSchema,
  },
  async (input) => {
    const {output} = await marketDeepDivePrompt(input);
    return output!;
  }
);
