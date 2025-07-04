
'use server';
/**
 * @fileOverview Defines the Genkit flow for translating keywords to Arabic.
 *
 * This flow translates a list of English keywords to Arabic, focusing on the KSA market,
 * and provides simulated trend data for the translated keywords.
 *
 * The main export is `translateKeywordsArabic`.
 */

import { ai } from '@/ai/genkit';
import {
    TranslateKeywordsArabicInputSchema,
    type TranslateKeywordsArabicInput,
    TranslateKeywordsArabicOutputSchema,
    type TranslateKeywordsArabicOutput
} from '@/ai/types';

export async function translateKeywordsArabic(
  input: TranslateKeywordsArabicInput
): Promise<TranslateKeywordsArabicOutput> {
  return await translateKeywordsArabicFlow(input);
}


const prompt = ai.definePrompt({
  name: 'translateKeywordsArabicPrompt',
  input: { schema: TranslateKeywordsArabicInputSchema },
  output: { schema: TranslateKeywordsArabicOutputSchema },
  prompt: `
    You are an expert marketing translator specializing in the Saudi Arabia (KSA) market for a "{{businessType}}" business.
    Translate the following English keywords into natural, market-appropriate Arabic.
    
    Keywords to translate: {{jsonStringify keywords}}

    For each translated keyword, provide a realistic estimated search volume and a trend change percentage in the required JSON format.
  `,
});

const translateKeywordsArabicFlow = ai.defineFlow(
  {
    name: 'translateKeywordsArabicFlow',
    inputSchema: TranslateKeywordsArabicInputSchema,
    outputSchema: TranslateKeywordsArabicOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to translate keywords to Arabic.');
    }
    return output;
  }
);
