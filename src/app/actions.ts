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
    if (result && result.suggestions && result.suggestions.length > 0) {
      return { success: true, data: result };
    } else if (result && result.suggestions && result.suggestions.length === 0) {
      // If AI returns an empty list, treat it as success but maybe inform user.
      return { success: true, data: {suggestions: []}, error: "No specific suggestions were generated for the given input, but the process completed." };
    }
    // If result itself is falsy or suggestions array is missing (should be caught by flow, but as a safeguard)
    return { success: false, error: "Failed to get valid SEO suggestions. The AI did not return expected data."};
  } catch (error) {
    console.error("Error getting SEO suggestions:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to get SEO suggestions." };
  }
}
