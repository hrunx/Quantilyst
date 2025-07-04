'use server';
/**
 * @fileOverview Translates a list of keywords to Arabic and provides estimated trend data.
 *
 * - translateKeywordsArabic: A function that performs the translation and data estimation.
 * - TranslateKeywordsArabicInput: The input type for the function.
 * - TranslateKeywordsArabicOutput: The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const TranslateKeywordsArabicInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business or industry for context.'),
  keywords: z
    .array(z.string())
    .describe('A list of keywords to translate to Arabic.'),
});
export type TranslateKeywordsArabicInput = z.infer<
  typeof TranslateKeywordsArabicInputSchema
>;

export const TranslateKeywordsArabicOutputSchema = z.object({
  translatedKeywords: z
    .array(
      z.object({
        keyword: z.string().describe('The translated Arabic keyword.'),
        volume: z
          .number()
          .describe(
            'A realistic, simulated search volume for the KSA market.'
          ),
        change: z
          .number()
          .describe(
            'A realistic, simulated percentage trend change for the keyword.'
          ),
      })
    )
    .describe('An array of translated keywords with their trend data.'),
});
export type TranslateKeywordsArabicOutput = z.infer<
  typeof TranslateKeywordsArabicOutputSchema
>;

const translateKeywordsArabicPrompt = ai.definePrompt({
  name: 'translateKeywordsArabicPrompt',
  input: {schema: TranslateKeywordsArabicInputSchema},
  output: {schema: TranslateKeywordsArabicOutputSchema},
  prompt: `You are a localization and SEO expert specializing in the Saudi Arabian (KSA) market.
Your task is to translate a list of English keywords into Arabic and provide realistic, simulated SEO metrics for them.

Business Context: {{businessType}}
Keywords to Translate: {{#each keywords}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}

For each keyword, provide:
1.  An accurate and culturally relevant Arabic translation.
2.  A plausible, simulated search volume (e.g., between 500 and 50000).
3.  A plausible, simulated trend change percentage (e.g., between -20 and +50).

The final output must be a single, valid JSON object matching the requested schema.
`,
});

const translateKeywordsArabicFlow = ai.defineFlow(
  {
    name: 'translateKeywordsArabicFlow',
    inputSchema: TranslateKeywordsArabicInputSchema,
    outputSchema: TranslateKeywordsArabicOutputSchema,
  },
  async (input) => {
    const {output} = await translateKeywordsArabicPrompt(input);
    return output!;
  }
);

export async function translateKeywordsArabic(
  input: TranslateKeywordsArabicInput
): Promise<TranslateKeywordsArabicOutput> {
  return await translateKeywordsArabicFlow(input);
}
