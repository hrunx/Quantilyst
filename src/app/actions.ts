// src/app/actions.ts
'use server';

import { translateKeywordsArabic, TranslateKeywordsArabicInput, TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import { seoContentSuggestions, SeoContentSuggestionsInput, SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';

export async function getArabicTranslationsAction(input: TranslateKeywordsArabicInput): Promise<{ success: boolean; data?: TranslateKeywordsArabicOutput; error?: string }> {
  try {
    // console.log("Calling translateKeywordsArabic with input:", JSON.stringify(input, null, 2));
    if (!input.keywords || input.keywords.length === 0) {
      // console.log("No keywords provided for translation, returning empty array.");
      return { success: true, data: { translatedKeywords: [] } };
    }
    const result = await translateKeywordsArabic(input);
    // console.log("translateKeywordsArabic result:", JSON.stringify(result, null, 2));
    return { success: true, data: result };
  } catch (error) {
    console.error("Error translating keywords to Arabic:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to translate keywords." };
  }
}

export async function getSeoSuggestionsAction(input: SeoContentSuggestionsInput): Promise<{ success: boolean; data?: SeoContentSuggestionsOutput; error?: string }> {
  try {
    // console.log("Calling seoContentSuggestions with input:", JSON.stringify(input, null, 2));
    const result = await seoContentSuggestions(input);
    // console.log("seoContentSuggestions result:", JSON.stringify(result, null, 2));
    return { success: true, data: result };
  } catch (error)
