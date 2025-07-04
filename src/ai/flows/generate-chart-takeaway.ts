
'use server';
/**
 * @fileOverview Defines the Genkit flow for generating a chart takeaway.
 *
 * This flow takes chart data and business context to produce a single,
 * insightful sentence summarizing the key takeaway, as a CMO would.
 *
 * The main export is `generateChartTakeaway`.
 */

import { ai } from '@/ai/genkit';
import {
    GenerateChartTakeawayInputSchema,
    type GenerateChartTakeawayInput,
    GenerateChartTakeawayOutputSchema,
    type GenerateChartTakeawayOutput
} from '@/ai/types';


export async function generateChartTakeaway(input: GenerateChartTakeawayInput): Promise<GenerateChartTakeawayOutput> {
    return await generateChartTakeawayFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateChartTakeawayPrompt',
    input: { schema: GenerateChartTakeawayInputSchema },
    output: { schema: GenerateChartTakeawayOutputSchema },
    prompt: `
        You are a CMO analyzing a keyword volume chart for a "{{businessType}}" business.
        The chart data is as follows: {{keywordChartData}}.

        Based on this data, provide a single, concise, executive-level sentence that summarizes the most important insight or takeaway for a marketing team. Focus on the story the numbers are telling.
    `,
});


const generateChartTakeawayFlow = ai.defineFlow(
    {
        name: 'generateChartTakeawayFlow',
        inputSchema: GenerateChartTakeawayInputSchema,
        outputSchema: GenerateChartTakeawayOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Failed to generate chart takeaway.');
        }
        return output;
    }
);
