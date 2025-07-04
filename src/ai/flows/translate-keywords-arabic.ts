'use server';
/**
 * @fileOverview A flow for translating keywords to Arabic.
 * It translates a list of English keywords to Arabic, providing
 * estimated search volume and trend data for the KSA market.
 */

import {ai} from '@/ai/genkit';
import {
  TranslateKeywordsArabicInputSchema,
  TranslateKeywordsArabicOutputSchema,
} from '@/ai/types';
import type {TranslateKeywordsArabicOutput, TranslateKeywordsArabicInput} from '@/ai/types';


export async function translateKeywordsArabic(
  input: TranslateKeywordsArabicInput
): Promise<TranslateKeywordsArabicOutput> {
  return await translateKeywordsArabicFlow(input);
}

const prompt = ai.definePrompt({
    name: 'translateKeywordsArabicPrompt',
    input: {schema: TranslateKeywordsArabicInputSchema},
    output: {schema: TranslateKeywordsArabicOutputSchema},
    prompt: `
        You are a master SEO specialist and linguist focused on the Saudi Arabia (KSA) market.
        Your task is to translate a list of English keywords into Arabic and provide estimated market data for them.

        **Business Context:** {{{businessType}}}
        **Keywords to Translate:** {{{keywords}}}

        **Instructions:**
        1.  Translate each English keyword from the list into the most commercially relevant and commonly searched Arabic equivalent for the KSA market.
        2.  For each translated Arabic keyword, provide a realistic (but simulated) estimated search **volume**.
        3.  For each translated Arabic keyword, provide a realistic (but simulated) trend **change** percentage.
        4.  Return the data strictly in the format specified by the output schema.
    `,
});


const translateKeywordsArabicFlow = ai.defineFlow(
  {
    name: 'translateKeywordsArabicFlow',
    inputSchema: TranslateKeywordsArabicInputSchema,
    outputSchema: TranslateKeywordsArabicOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return valid Arabic translation data.');
    }
    return output;
  }
);
