'use server';
/**
 * @fileOverview Arabic Keywords Translation using OpenAI SDK with Horizon Beta
 * 
 * Direct integration with OpenRouter's Horizon Beta model for KSA market localization.
 * Translates English keywords to Arabic with market data for Saudi Arabia.
 */

import { generateWithSchema } from '@/ai/genkit';
import {
  TranslateKeywordsArabicInputSchema,
  TranslateKeywordsArabicOutputSchema,
  type TranslateKeywordsArabicInput,
  type TranslateKeywordsArabicOutput,
} from '@/ai/types';

/**
 * Translates English keywords to Arabic using Horizon Beta with KSA market intelligence.
 * Provides localized keywords with realistic search volume and trend data.
 */
export async function translateKeywordsArabic(
  input: TranslateKeywordsArabicInput
): Promise<TranslateKeywordsArabicOutput> {
  
  const systemPrompt = `You are a master SEO specialist and Arabic linguist with deep expertise in the Saudi Arabia (KSA) market. You have 15+ years of experience in Middle Eastern digital marketing, Arabic search behavior, and KSA consumer trends.`;

  const userPrompt = `Translate English keywords to Arabic for the Saudi Arabia market with comprehensive market intelligence.

**BUSINESS CONTEXT:** ${input.businessType}

**KEYWORDS TO TRANSLATE:** ${input.keywords.join(', ')}

**REQUIREMENTS FOR KSA MARKET LOCALIZATION:**

1. **ACCURATE ARABIC TRANSLATION**:
   - Use the most commercially relevant Arabic terms for KSA market
   - Consider local dialects and business terminology preferences
   - Ensure translations match actual search behavior patterns
   - Use proper Arabic script and diacritical marks where appropriate

2. **REALISTIC MARKET DATA**:
   - Provide genuine search volume estimates based on KSA market size
   - Consider population demographics and internet penetration
   - Factor in economic conditions and purchasing power
   - Include seasonal and cultural considerations

3. **TREND ANALYSIS**:
   - Calculate realistic trend changes reflecting market dynamics
   - Consider recent developments in Saudi Vision 2030
   - Factor in government initiatives and economic diversification
   - Include regional competition and market evolution

**CONTEXT CONSIDERATIONS:**
- Saudi Arabia's digital transformation initiatives
- Arabic language search preferences and patterns
- Cultural sensitivities and business etiquette
- Economic sectors prioritized by Vision 2030
- Regional competition from UAE, Qatar, and other GCC countries
- Local consumer behavior and shopping patterns

**REQUIRED JSON STRUCTURE:**
{
  "translatedKeywords": [
    {
      "english": "original English keyword",
      "arabic": "Arabic translation in proper script",
      "volume": 1500,
      "change": 12.5
    }
  ]
}

**CRITICAL:** Return ONLY valid JSON with precise Arabic translations and realistic KSA market data. Each keyword must have exact search volume and trend data for Saudi Arabia market.`;

  try {
    const result = await generateWithSchema<TranslateKeywordsArabicOutput>(
      userPrompt,
      TranslateKeywordsArabicOutputSchema,
      systemPrompt
    );

    return result;
  } catch (error) {
    console.error('Error translating keywords to Arabic:', error);
    throw new Error(`Failed to translate keywords to Arabic: ${error}`);
  }
}