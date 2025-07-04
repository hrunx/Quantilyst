import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const KeywordSchema = z.object({
  id: z.string().describe('Unique identifier for the keyword'),
  name: z.string().describe('The keyword text'),
  volume: z.number().describe('Monthly search volume'),
  change: z.number().describe('Percentage change in volume'),
  difficulty: z.number().min(0).max(100).describe('SEO difficulty score (0-100)'),
  serpFeatures: z.array(z.string()).describe('SERP features present for this keyword'),
  sources: z.array(z.string()).describe('Data sources used for this keyword'),
});

export type Keyword = z.infer<typeof KeywordSchema>;

// ============================================================================
// TRENDING KEYWORDS FLOW
// ============================================================================

export const GenerateTrendingKeywordsInputSchema = z.object({
  businessType: z.string().describe('The type of business to analyze'),
  country: z.string().describe('Target country code'),
  city: z.string().optional().describe('Target city (optional)'),
});

export const GenerateTrendingKeywordsOutputSchema = z.object({
  hour: z.array(KeywordSchema).describe('Keywords trending in the last hour'),
  day: z.array(KeywordSchema).describe('Keywords trending in the last day'),
  week: z.array(KeywordSchema).describe('Keywords trending in the last week'),
  month: z.array(KeywordSchema).describe('Keywords trending in the last month'),
});

export type GenerateTrendingKeywordsInput = z.infer<typeof GenerateTrendingKeywordsInputSchema>;
export type GenerateTrendingKeywordsOutput = z.infer<typeof GenerateTrendingKeywordsOutputSchema>;

// ============================================================================
// ADVANCED SEO KEYWORD ANALYSIS FLOW
// ============================================================================

export const AdvancedSeoKeywordAnalysisInputSchema = z.object({
  keyword: z.string().describe('The keyword to analyze'),
  businessType: z.string().describe('The type of business context'),
});

export const AdvancedSeoKeywordAnalysisOutputSchema = z.object({
  searchIntent: z.string().describe('Primary search intent (Informational, Navigational, Commercial, Transactional)'),
  targetAudience: z.string().describe('Description of the target user persona'),
  competitiveLandscape: z.string().describe('Overview of current ranking content and competitors'),
  uniqueContentAngle: z.string().describe('Unique, defensible content angle recommendation'),
  longTailKeywords: z.array(z.string()).describe('Related long-tail keywords'),
  relatedQuestions: z.array(z.string()).describe('Common questions users ask about this keyword'),
  contentOutline: z.object({
    title: z.string().describe('Compelling blog post title'),
    sections: z.array(z.object({
      heading: z.string().describe('Section heading'),
      points: z.array(z.string()).describe('Key points to cover in this section'),
    })).describe('Detailed content outline sections'),
  }).describe('Structured content outline'),
  difficultyAnalysis: z.string().describe('Analysis of ranking difficulty and challenges'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence in analysis (0-100)'),
  simulatedDataSources: z.array(z.string()).describe('Types of data sources simulated'),
});

export type AdvancedSeoKeywordAnalysisInput = z.infer<typeof AdvancedSeoKeywordAnalysisInputSchema>;
export type AdvancedSeoKeywordAnalysisOutput = z.infer<typeof AdvancedSeoKeywordAnalysisOutputSchema>;

// ============================================================================
// MARKET DEEP DIVE FLOW
// ============================================================================

export const MarketDeepDiveInputSchema = z.object({
  businessType: z.string().describe('The type of business to analyze'),
  country: z.string().describe('Target country'),
  city: z.string().optional().describe('Target city (optional)'),
});

export const MarketDeepDiveOutputSchema = z.object({
  executiveSummary: z.string().describe('Executive-level summary with strategic recommendations'),
  tamSamSom: z.object({
    tam: z.object({
      value: z.number().describe('Total Addressable Market value'),
      description: z.string().describe('TAM description'),
      sources: z.array(z.string()).describe('Data sources'),
    }),
    sam: z.object({
      value: z.number().describe('Serviceable Addressable Market value'),
      description: z.string().describe('SAM description'),
      sources: z.array(z.string()).describe('Data sources'),
    }),
    som: z.object({
      value: z.number().describe('Serviceable Obtainable Market value'),
      description: z.string().describe('SOM description'),
      sources: z.array(z.string()).describe('Data sources'),
    }),
  }).describe('TAM/SAM/SOM analysis'),
  competitors: z.array(z.object({
    name: z.string().describe('Competitor name'),
    strengths: z.string().describe('Key strengths'),
    weaknesses: z.string().describe('Key weaknesses'),
    marketShare: z.string().describe('Market share percentage'),
  })).describe('Competitor benchmark data'),
  swot: z.object({
    strengths: z.array(z.string()).describe('Internal strengths'),
    weaknesses: z.array(z.string()).describe('Internal weaknesses'),
    opportunities: z.array(z.string()).describe('External opportunities'),
    threats: z.array(z.string()).describe('External threats'),
  }).describe('SWOT analysis'),
});

export type MarketDeepDiveInput = z.infer<typeof MarketDeepDiveInputSchema>;
export type MarketDeepDiveOutput = z.infer<typeof MarketDeepDiveOutputSchema>;

// ============================================================================
// SEO CONTENT SUGGESTIONS FLOW
// ============================================================================

export const SeoContentSuggestionsInputSchema = z.object({
  businessType: z.string().describe('The type of business'),
  trendingKeywords: z.string().describe('Comma-separated trending keywords'),
});

export const SeoContentSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().describe('SEO-friendly content title'),
    hook: z.string().describe('Engaging opening hook'),
    points: z.array(z.string()).describe('Key talking points to cover'),
  })).describe('Array of content suggestions'),
});

export type SeoContentSuggestionsInput = z.infer<typeof SeoContentSuggestionsInputSchema>;
export type SeoContentSuggestionsOutput = z.infer<typeof SeoContentSuggestionsOutputSchema>;

// ============================================================================
// TRANSLATE KEYWORDS ARABIC FLOW
// ============================================================================

export const TranslateKeywordsArabicInputSchema = z.object({
  businessType: z.string().describe('The type of business context'),
  keywords: z.array(z.string()).describe('English keywords to translate'),
});

export const TranslateKeywordsArabicOutputSchema = z.object({
  translatedKeywords: z.array(z.object({
    english: z.string().describe('Original English keyword'),
    arabic: z.string().describe('Arabic translation'),
    volume: z.number().describe('Estimated search volume in KSA'),
    change: z.number().describe('Trend change percentage'),
  })).describe('Array of translated keywords with market data'),
});

export type TranslateKeywordsArabicInput = z.infer<typeof TranslateKeywordsArabicInputSchema>;
export type TranslateKeywordsArabicOutput = z.infer<typeof TranslateKeywordsArabicOutputSchema>;

// ============================================================================
// GENERATE CHART TAKEAWAY FLOW
// ============================================================================

export const GenerateChartTakeawayInputSchema = z.object({
  businessType: z.string().describe('The type of business context'),
  keywordChartData: z.string().describe('Chart data as a string representation'),
});

export const GenerateChartTakeawayOutputSchema = z.object({
  takeaway: z.string().describe('Single executive-level sentence summarizing the chart insight'),
});

export type GenerateChartTakeawayInput = z.infer<typeof GenerateChartTakeawayInputSchema>;
export type GenerateChartTakeawayOutput = z.infer<typeof GenerateChartTakeawayOutputSchema>; 