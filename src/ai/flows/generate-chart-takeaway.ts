
'use server';

/**
 * @fileOverview Provides an AI-generated, one-sentence takeaway for chart data.
 *
 * - generateChartTakeaway - A function that provides an executive summary for a chart.
 * - GenerateChartTakeawayInput - The input type.
 * - GenerateChartTakeawayOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartTakeawayInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business for context.'),
  keywordChartData: z
    .string()
    .describe('A JSON string representing the data used to generate the chart.'),
});
export type GenerateChartTakeawayInput = z.infer<typeof GenerateChartTakeawayInputSchema>;

const GenerateChartTakeawayOutputSchema = z.object({
  takeaway: z
    .string()
    .describe('A single, insightful sentence summarizing the chart data from a CMO\'s perspective.'),
});
export type GenerateChartTakeawayOutput = z.infer<typeof GenerateChartTakeawayOutputSchema>;

export async function generateChartTakeaway(
  input: GenerateChartTakeawayInput
): Promise<GenerateChartTakeawayOutput> {
  return generateChartTakeawayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartTakeawayPrompt',
  input: {schema: GenerateChartTakeawayInputSchema},
  output: {schema: GenerateChartTakeawayOutputSchema},
  prompt: `You are a Chief Marketing Officer (CMO) with a talent for distilling complex data into a single, powerful insight.

Your task is to analyze the provided chart data for a given business type and provide a one-sentence executive summary or "takeaway". This sentence should be insightful and action-oriented.

Business Context: {{{businessType}}}

Chart Data (JSON):
\`\`\`json
{{{keywordChartData}}}
\`\`\`

Based on this data, what is the single most important takeaway for the marketing team?

Example: "While 'AI tools' has the highest search volume, the rapid growth of 'Email automation' suggests an emerging opportunity we should target immediately."

Your entire response MUST be a valid JSON object with a single key "takeaway".
`,
});

const generateChartTakeawayFlow = ai.defineFlow(
  {
    name: 'generateChartTakeawayFlow',
    inputSchema: GenerateChartTakeawayInputSchema,
    outputSchema: GenerateChartTakeawayOutputSchema,
  },
  async (input) => {
    const genResponse = await prompt(input);
    if (!genResponse.output) {
      console.error('Generate Chart Takeaway Flow: AI model did not return parseable output.', 'Raw text:', genResponse.text);
      throw new Error('AI model did not return valid structured output for chart takeaway.');
    }
    return genResponse.output;
  }
);
