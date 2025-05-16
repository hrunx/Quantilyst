
// src/app/actions.ts
'use server';

import { translateKeywordsArabic, TranslateKeywordsArabicInput, TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import { seoContentSuggestions, SeoContentSuggestionsInput, SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
import { advancedSeoKeywordAnalysis, AdvancedSeoKeywordAnalysisInput, AdvancedSeoKeywordAnalysisOutput } from '@/ai/flows/advanced-seo-keyword-analysis';

export async function getArabicTranslationsAction(input: TranslateKeywordsArabicInput): Promise<{ success: boolean; data?: TranslateKeywordsArabicOutput; error?: string }> {
  try {
    if (!input.keywords || input.keywords.length === 0) {
      return { success: true, data: { translatedKeywords: [] } };
    }
    const result = await translateKeywordsArabic(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error translating keywords to Arabic:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to translate keywords." };
  }
}

export async function getSeoSuggestionsAction(input: SeoContentSuggestionsInput): Promise<{ success: boolean; data?: SeoContentSuggestionsOutput; error?: string }> {
  try {
    const result = await seoContentSuggestions(input);
    if (result && result.suggestions && result.suggestions.length > 0) {
      return { success: true, data: result };
    } else if (result && result.suggestions && result.suggestions.length === 0) {
      return { success: true, data: {suggestions: []}, error: "No specific suggestions were generated for the given input, but the process completed." };
    }
    return { success: false, error: "Failed to get valid SEO suggestions. The AI did not return expected data."};
  } catch (error) {
    console.error("Error getting SEO suggestions:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to get SEO suggestions." };
  }
}

export async function getAdvancedSeoAnalysisAction(input: AdvancedSeoKeywordAnalysisInput): Promise<{ success: boolean; data?: AdvancedSeoKeywordAnalysisOutput; error?: string }> {
  try {
    const result = await advancedSeoKeywordAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting advanced SEO analysis:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to get advanced SEO analysis." };
  }
}
