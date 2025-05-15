'use server';

/**
 * @fileOverview A flow to translate trending keywords into Arabic for the KSA region.
 *
 * - translateKeywordsArabic - A function that handles the translation and generation of Arabic keywords.
 * - TranslateKeywordsArabicInput - The input type for the translateKeywordsArabic function.
 * - TranslateKeywordsArabicOutput - The return type for the translateKeywordsArabic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateKeywordsArabicInputSchema = z.object({
  businessType: z.string().describe('The type of business for which to generate keywords.'),
  keywords: z.array(z.string()).describe('An array of trending keywords to translate.'),
});
export type TranslateKeywordsArabicInput = z.infer<typeof TranslateKeywordsArabicInputSchema>;

const TranslateKeywordsArabicOutputSchema = z.object({
  translatedKeywords: z.array(z.string()).describe('The translated keywords in Arabic.'),
});
export type TranslateKeywordsArabicOutput = z.infer<typeof TranslateKeywordsArabicOutputSchema>;

export async function translateKeywordsArabic(input: TranslateKeywordsArabicInput): Promise<TranslateKeywordsArabicOutput> {
  return translateKeywordsArabicFlow(input);
}

const translateKeywordsArabicPrompt = ai.definePrompt({
  name: 'translateKeywordsArabicPrompt',
  input: {schema: TranslateKeywordsArabicInputSchema},
  output: {schema: TranslateKeywordsArabicOutputSchema},
  prompt: `You are an expert in translating keywords to Arabic, specifically for the KSA (Kingdom of Saudi Arabia) region. Given the business type and a list of trending keywords, translate the keywords into Arabic.

Business Type: {{{businessType}}}
Trending Keywords: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return only the translated keywords in Arabic in an array.
`,
});

const translateKeywordsArabicFlow = ai.defineFlow(
  {
    name: 'translateKeywordsArabicFlow',
    inputSchema: TranslateKeywordsArabicInputSchema,
    outputSchema: TranslateKeywordsArabicOutputSchema,
  },
  async input => {
    const {output} = await translateKeywordsArabicPrompt(input);
    return output!;
  }
);
