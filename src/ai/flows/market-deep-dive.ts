
'use server';

/**
 * @fileOverview Provides a comprehensive, C-suite level market deep-dive analysis.
 *
 * - marketDeepDive - A function that generates a full market analysis report.
 * - MarketDeepDiveInput - The input type.
 * - MarketDeepDiveOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketDeepDiveInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business or industry for which the analysis is relevant.'),
  country: z
    .string()
    .describe('The target country for the analysis (e.g., US, SA).'),
  city: z.string().optional().describe('The optional target city for more specific analysis.'),
});
export type MarketDeepDiveInput = z.infer<typeof MarketDeepDiveInputSchema>;

const MarketDeepDiveOutputSchema = z.object({
  executiveSummary: z.string().describe("A concise, high-level summary of the entire market analysis, written for a C-suite audience."),
  tamSamSom: z.object({
    tam: z.object({
      value: z.number().describe("Estimated value of the Total Addressable Market in USD."),
      description: z.string().describe("Explanation of the TAM calculation and scope.")
    }),
    sam: z.object({
      value: z.number().describe("Estimated value of the Serviceable Available Market in USD."),
      description: z.string().describe("Explanation of the SAM calculation and scope.")
    }),
    som: z.object({
      value: z.number().describe("Estimated value of the Serviceable Obtainable Market in USD."),
      description: z.string().describe("Explanation of the SOM calculation and scope for the next 1-2 years.")
    }),
  }).describe("Analysis of the Total Addressable Market (TAM), Serviceable Available Market (SAM), and Serviceable Obtainable Market (SOM)."),
  competitors: z.array(z.object({
    name: z.string().describe("Name of the competitor."),
    strengths: z.string().describe("A brief summary of the competitor's key strengths."),
    weaknesses: z.string().describe("A brief summary of the competitor's key weaknesses."),
    marketShare: z.string().describe("Estimated market share percentage as a string (e.g., '15-20%').")
  })).describe("A benchmark analysis of 3-5 key competitors."),
  swot: z.object({
    strengths: z.array(z.string()).describe("A list of internal strengths for a business of the specified type in this market."),
    weaknesses: z.array(z.string()).describe("A list of internal weaknesses."),
    opportunities: z.array(z.string()).describe("A list of external opportunities in the market."),
    threats: z.array(z.string()).describe("A list of external threats in the market."),
  }).describe("A SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis."),
});
export type MarketDeepDiveOutput = z.infer<typeof MarketDeepDiveOutputSchema>;

export async function marketDeepDive(
  input: MarketDeepDiveInput
): Promise<MarketDeepDiveOutput> {
  return marketDeepDiveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketDeepDivePrompt',
  input: {schema: MarketDeepDiveInputSchema},
  output: {schema: MarketDeepDiveOutputSchema},
  prompt: `You are a Senior Partner at a Tier-1 management consulting firm (like McKinsey, Bain, or BCG), tasked with creating a comprehensive market deep-dive report for a client. Your analysis must be sharp, data-driven (even if simulated), and actionable.

Client Business Profile:
- Business Type / Industry: {{{businessType}}}
- Target Country: {{{country}}}
{{#if city}}- Target City: {{{city}}}{{/if}}

Generate a complete analysis covering the following sections. Your entire response must be a single, valid JSON object that strictly adheres to the output schema.

1.  **Executive Summary**: A brief, high-level overview for a CEO. What is the key takeaway about this market right now?
2.  **Market Sizing (TAM/SAM/SOM)**:
    *   **TAM (Total Addressable Market)**: Estimate the total market demand for products/services like this, globally or in a major region. Provide a USD value and a brief explanation.
    *   **SAM (Serviceable Available Market)**: Estimate the segment of the TAM targeted by the business's products/services that is within its geographical reach. Provide a USD value and explanation, narrowing the focus to {{{country}}}.
    *   **SOM (Serviceable Obtainable Market)**: Estimate the portion of the SAM that can realistically be captured in the next 1-2 years. Provide a USD value and rationale.
3.  **Competitor Benchmark**: Identify 3-5 key competitors in the {{{country}}} market. For each, provide their name, a key strength, a key weakness, and an estimated market share range (e.g., "10-15%").
4.  **SWOT Analysis**: Provide a SWOT analysis for a *new entrant* or *existing player* matching the client's business type in this specific market.
    *   **Strengths**: 2-3 internal advantages.
    *   **Weaknesses**: 2-3 internal disadvantages.
    *   **Opportunities**: 2-3 external market opportunities to seize.
    *   **Threats**: 2-3 external threats to be aware of.

Your entire response MUST be a single, valid JSON object. Do not include any text or markdown outside of the JSON structure.
`,
});

const marketDeepDiveFlow = ai.defineFlow(
  {
    name: 'marketDeepDiveFlow',
    inputSchema: MarketDeepDiveInputSchema,
    outputSchema: MarketDeepDiveOutputSchema,
  },
  async (input) => {
    const genResponse = await prompt(input);
    if (!genResponse.output) {
      console.error('Market Deep-Dive Flow: AI model did not return parseable output.', 'Raw text:', genResponse.text);
      throw new Error('AI model did not return valid structured output for the deep-dive analysis.');
    }
    return genResponse.output;
  }
);
