'use server';
/**
 * @fileOverview A flow for conducting an advanced SEO analysis of a keyword.
 *
 * This file defines a Genkit flow that performs a deep dive into a specific keyword,
 * providing strategic insights for content creation and marketing. It simulates the
 * process of a senior SEO strategist analyzing a keyword's potential.
 *
 * The flow returns a comprehensive analysis including:
 * - Search Intent: The primary goal of a user when searching for the keyword.
 * - Target Audience: A description of the ideal user persona.
 * - Competitive Landscape: An overview of what content currently ranks for the keyword.
 * - Unique Content Angle: A novel perspective to make content stand out.
 * - Long-tail Keywords: A list of related, more specific keywords.
 * - Related Questions: Common questions users ask related to the keyword.
 * - Detailed Content Outline: A structured plan for a blog post or article.
 * - Difficulty Analysis: An explanation of the challenges in ranking for the keyword.
 * - Confidence Score & Sources: An assessment of the analysis's reliability and the data sources used.
 */

import {ai} from '@/ai/genkit';
import {
  AdvancedSeoKeywordAnalysisInputSchema,
  AdvancedSeoKeywordAnalysisOutputSchema,
  type AdvancedSeoKeywordAnalysisInput,
  type AdvancedSeoKeywordAnalysisOutput,
} from '@/ai/types';

/**
 * Performs an advanced SEO analysis for a given keyword and business type.
 * This is the main entry point to be called from the application server.
 * @param input - The keyword and business context for the analysis.
 * @returns A promise that resolves to a detailed SEO analysis report.
 */
export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  return advancedSeoKeywordAnalysisFlow(input);
}

// Defines the Genkit prompt for the advanced SEO analysis.
const advancedSeoKeywordAnalysisPrompt = ai.definePrompt({
  name: 'advancedSeoKeywordAnalysisPrompt',
  input: {schema: AdvancedSeoKeywordAnalysisInputSchema},
  output: {schema: AdvancedSeoKeywordAnalysisOutputSchema},
  prompt: `
    You are a world-class CMO and Senior SEO Strategist for a top-tier market intelligence firm.
    Your client is in the '{{businessType}}' industry.
    They want a comprehensive, executive-level strategic brief for the keyword: "{{keyword}}".

    Generate a detailed analysis covering the following points. Be insightful, specific, and actionable.

    1.  **Search Intent**: What is the primary user goal? (e.g., Informational, Navigational, Commercial, Transactional).
    2.  **Target Audience**: Describe the user persona. What are their goals and pain points?
    3.  **Competitive Landscape**: What kind of content currently ranks? Who are the main players? What is their general angle?
    4.  **Unique Content Angle**: What's a unique, defensible content angle that could outperform the competition?
    5.  **Long-tail Keywords**: List at least 5 related long-tail keywords that flesh out the topic.
    6.  **Related Questions**: List the top 5 questions people are asking related to this keyword (like "People Also Ask").
    7.  **Detailed Content Outline**: Provide a full content outline for a blog post. Include a compelling title and break it down into sections with clear headings and bullet points for what each section should cover.
    8.  **Difficulty Analysis**: Briefly explain why it might be easy or hard to rank for this keyword.
    9.  **Confidence Score**: How confident are you in this analysis on a scale of 0-100?
    10. **Simulated Data Sources**: List the types of sources you are simulating to generate this analysis (e.g., 'Google Search Results', 'Ahrefs Keyword Explorer', 'AnswerThePublic', 'Competitor Blogs').
  `,
});

// Defines the Genkit flow that orchestrates the advanced SEO analysis.
const advancedSeoKeywordAnalysisFlow = ai.defineFlow(
  {
    name: 'advancedSeoKeywordAnalysisFlow',
    inputSchema: AdvancedSeoKeywordAnalysisInputSchema,
    outputSchema: AdvancedSeoKeywordAnalysisOutputSchema,
  },
  async (input) => {
    // The prompt handles the entire analysis process.
    const {output} = await advancedSeoKeywordAnalysisPrompt(input);
    return output!;
  }
);
