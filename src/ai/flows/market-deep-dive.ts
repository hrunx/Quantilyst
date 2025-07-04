'use server';
/**
 * @fileOverview Generates a comprehensive, C-suite level market deep-dive report.
 * This includes an executive summary, TAM/SAM/SOM analysis with sources, competitor benchmarking, and a SWOT analysis.
 *
 * - marketDeepDive: A function that performs the deep-dive analysis.
 * - MarketDeepDiveInput: The input type for the analysis function.
 * - MarketDeepDiveOutput: The return type for the analysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const MarketDeepDiveInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business or industry for context.'),
  country: z.string().describe('The target country for the analysis.'),
  city: z.string().optional().describe('The target city for the analysis (if applicable).'),
});
export type MarketDeepDiveInput = z.infer<typeof MarketDeepDiveInputSchema>;

const MarketValueSchema = z.object({
    value: z.number().describe('The estimated market value in USD.'),
    description: z.string().describe('A brief description of this market segment.'),
    sources: z.array(z.string().url()).describe('An array of simulated source URLs used to justify the estimation.')
});

export const MarketDeepDiveOutputSchema = z.object({
    executiveSummary: z.string().describe("A concise, C-suite level summary of the entire market analysis."),
    tamSamSom: z.object({
        tam: MarketValueSchema.describe('Total Addressable Market'),
        sam: MarketValueSchema.describe('Serviceable Addressable Market'),
        som: MarketValueSchema.describe('Serviceable Obtainable Market'),
    }),
    competitors: z.array(z.object({
        name: z.string().describe('Name of the competitor.'),
        strengths: z.string().describe('Key strengths of the competitor.'),
        weaknesses: z.string().describe('Key weaknesses of the competitor.'),
        marketShare: z.string().describe('Estimated market share as a percentage string (e.g., "15%").'),
    })).describe('A list of key competitors and their analysis.'),
    swot: z.object({
        strengths: z.array(z.string()).describe('Internal strengths for the business in this market.'),
        weaknesses: z.array(z.string()).describe('Internal weaknesses for the business in this market.'),
        opportunities: z.array(z.string()).describe('External opportunities in the market.'),
        threats: z.array(z.string()).describe('External threats in the market.'),
    }),
});
export type MarketDeepDiveOutput = z.infer<typeof MarketDeepDiveOutputSchema>;


const marketDeepDivePrompt = ai.definePrompt({
    name: 'marketDeepDivePrompt',
    input: { schema: MarketDeepDiveInputSchema },
    output: { schema: MarketDeepDiveOutputSchema },
    prompt: `You are a top-tier market research analyst from a major consulting firm. Your task is to generate a comprehensive "Deep-Dive" report for a client based on their business profile.

Client Profile:
- Business / Industry: {{businessType}}
- Target Geography: {{city}}{{^city}}{{country}}{{/city}}{{#city}}, {{country}}{{/city}}

Generate a full report that is insightful, data-driven, and professional.

**Instructions for each section:**

- **Executive Summary**: Write a short, powerful summary that a busy executive can read to get the complete picture.
- **TAM/SAM/SOM**: Generate realistic, non-zero market size estimations in USD. The numbers should be logical relative to each other (TAM > SAM > SOM). For each, provide a brief description and, crucially, a list of 2-3 **simulated but realistic source URLs** (e.g., from Statista, Gartner, marketresearch.com, government reports, industry publications) to justify your estimations.
- **Competitor Benchmark**: Identify 3-4 plausible competitors. Provide concise, believable strengths and weaknesses. Estimate their market share.
- **SWOT Analysis**: Provide 3-4 distinct and actionable points for each category (Strengths, Weaknesses, Opportunities, Threats) tailored to the client's business type and target market.

The final output must be a single, valid JSON object matching the schema. Do not include any commentary outside of the JSON structure.
`
});


const marketDeepDiveFlow = ai.defineFlow(
    {
        name: 'marketDeepDiveFlow',
        inputSchema: MarketDeepDiveInputSchema,
        outputSchema: MarketDeepDiveOutputSchema,
    },
    async (input) => {
        const { output } = await marketDeepDivePrompt(input);
        return output!;
    }
);


export async function marketDeepDive(input: MarketDeepDiveInput): Promise<MarketDeepDiveOutput> {
    return marketDeepDiveFlow(input);
}
