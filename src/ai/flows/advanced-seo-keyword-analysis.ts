
'use server';

/**
 * @fileOverview Provides comprehensive, CMO-level SEO and content strategy analysis for a given keyword.
 *
 * - advancedSeoKeywordAnalysis - A function that provides advanced SEO insights.
 * - AdvancedSeoKeywordAnalysisInput - The input type.
 * - AdvancedSeoKeywordAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvancedSeoKeywordAnalysisInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business for which the keyword analysis is relevant.'),
  keyword: z
    .string()
    .describe('The specific keyword to analyze.'),
});
export type AdvancedSeoKeywordAnalysisInput = z.infer<typeof AdvancedSeoKeywordAnalysisInputSchema>;

const AdvancedSeoKeywordAnalysisOutputSchema = z.object({
  searchIntent: z.string().describe("The primary search intent (e.g., 'Informational', 'Commercial', 'Transactional', 'Navigational')."),
  targetAudience: z.string().describe("A brief description of the target audience persona for this keyword."),
  competitiveLandscape: z.string().describe("A summary of the competitive landscape, identifying content gaps or opportunities."),
  contentAngle: z.string().describe("A unique content angle or hook to make the content stand out."),
  detailedContentOutline: z.object({
    title: z.string().describe('A suggested compelling title for a piece of content about the keyword.'),
    sections: z.array(z.object({
      heading: z.string().describe("Main section heading (H2)."),
      points: z.array(z.string()).describe("Key talking points or sub-topics for this section (H3s or bullet points).")
    })).describe('An array of suggested main sections for the content.'),
  }).describe('A detailed content outline including a title and section details.'),
  difficultyAnalysis: z
    .string()
    .describe('A brief qualitative analysis of the keyword\'s SEO difficulty and ranking potential.'),
});
export type AdvancedSeoKeywordAnalysisOutput = z.infer<typeof AdvancedSeoKeywordAnalysisOutputSchema>;

export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  return advancedSeoKeywordAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedSeoKeywordAnalysisPrompt',
  input: {schema: AdvancedSeoKeywordAnalysisInputSchema},
  output: {schema: AdvancedSeoKeywordAnalysisOutputSchema},
  prompt: `You are a world-class Chief Marketing Officer (CMO) and SEO Strategist, tasked with providing a deep, actionable analysis for a given keyword, tailored to a specific business. Your audience is a marketing team that needs clear, strategic direction.

Business Type: {{{businessType}}}
Keyword for Analysis: {{{keyword}}}

Provide a comprehensive strategic brief covering the following areas. Your entire response MUST be a valid JSON object.

1.  **Search Intent**: Classify the primary user intent. Is it Informational, Commercial Investigation, Transactional, or Navigational?
2.  **Target Audience**: Describe the likely persona of the person searching this. What are their goals and pain points?
3.  **Competitive Landscape**: Analyze the top search results. Are they dominated by blogs, e-commerce sites, videos, or forums? Identify a key opportunity or content gap.
4.  **Content Angle**: Suggest a unique hook or angle for our content that will make it stand out from the competition.
5.  **Detailed Content Outline**: Propose a structured outline for a piece of content (like a blog post). Include a compelling title and at least 3-4 main sections (H2s), each with 2-3 key talking points or sub-headings (H3s/bullets).
6.  **Difficulty Analysis**: Give a concise, qualitative summary of the SEO difficulty. Explain *why* it's difficult or easy (e.g., "High authority domains dominate," "Low competition in this niche," etc.).

Your entire response MUST be a valid JSON object that strictly follows this structure:
{
  "searchIntent": "Informational",
  "targetAudience": "A description of the target audience.",
  "competitiveLandscape": "A summary of the SERP competition and opportunities.",
  "contentAngle": "A unique hook or angle for the content.",
  "detailedContentOutline": {
    "title": "A Compelling and SEO-Optimized Title for '{{{keyword}}}'",
    "sections": [
      { "heading": "Section 1 Title (H2)", "points": ["Point 1.1", "Point 1.2"] },
      { "heading": "Section 2 Title (H2)", "points": ["Point 2.1", "Point 2.2", "Point 2.3"] }
    ]
  },
  "difficultyAnalysis": "A qualitative analysis of the keyword's SEO difficulty."
}
`,
});

const advancedSeoKeywordAnalysisFlow = ai.defineFlow(
  {
    name: 'advancedSeoKeywordAnalysisFlow',
    inputSchema: AdvancedSeoKeywordAnalysisInputSchema,
    outputSchema: AdvancedSeoKeywordAnalysisOutputSchema,
  },
  async (input) => {
    const genResponse = await prompt(input);
    if (!genResponse.output) {
      console.error('Advanced SEO Analysis Flow: AI model did not return parseable output.', 'Raw text:', genResponse.text);
      throw new Error('AI model did not return valid structured output for advanced SEO analysis.');
    }
    return genResponse.output;
  }
);
