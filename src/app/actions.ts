
// src/app/actions.ts
'use server';

import { translateKeywordsArabic, TranslateKeywordsArabicInput, TranslateKeywordsArabicOutput } from '@/ai/flows/translate-keywords-arabic';
import { seoContentSuggestions, SeoContentSuggestionsInput, SeoContentSuggestionsOutput } from '@/ai/flows/seo-content-suggestions';
import { advancedSeoKeywordAnalysis, AdvancedSeoKeywordAnalysisInput, AdvancedSeoKeywordAnalysisOutput } from '@/ai/flows/advanced-seo-keyword-analysis';
import { generateTrendingKeywords, GenerateTrendingKeywordsInput, GenerateTrendingKeywordsOutput } from '@/ai/flows/generate-trending-keywords';
import { generateChartTakeaway, GenerateChartTakeawayInput, GenerateChartTakeawayOutput } from '@/ai/flows/generate-chart-takeaway';
import { marketDeepDive, MarketDeepDiveInput, MarketDeepDiveOutput } from '@/ai/flows/market-deep-dive';

export async function getTrendingKeywordsAction(input: GenerateTrendingKeywordsInput): Promise<{ success: boolean; data?: GenerateTrendingKeywordsOutput; error?: string }> {
  try {
    const result = await generateTrendingKeywords(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating trending keywords:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to generate trending keywords." };
  }
}

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
    if (result && result.suggestions) {
      return { success: true, data: result };
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

export async function getChartTakeawayAction(input: GenerateChartTakeawayInput): Promise<{ success: boolean; data?: GenerateChartTakeawayOutput; error?: string }> {
    try {
        const result = await generateChartTakeaway(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error generating chart takeaway:", error);
        return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to generate chart takeaway." };
    }
}

export async function getMarketDeepDiveAction(input: MarketDeepDiveInput): Promise<{ success: boolean; data?: MarketDeepDiveOutput; error?: string }> {
  try {
    const result = await marketDeepDive(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating market deep-dive:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) || "Failed to generate market deep-dive." };
  }
}
