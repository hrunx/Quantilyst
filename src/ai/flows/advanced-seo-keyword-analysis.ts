'use server';
/**
 * @fileOverview Provides advanced SEO analysis for a given keyword, including search intent,
 * target audience, competitive landscape, unique content angles, and a detailed content outline.
 *
 * - advancedSeoKeywordAnalysis: A function that performs the analysis.
 * - AdvancedSeoKeywordAnalysisInput: The input type for the analysis function.
 * - AdvancedSeoKeywordAnalysisOutput: The return type for the analysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AdvancedSeoKeywordAnalysisInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business or industry for context.'),
  keyword: z.string().describe('The specific keyword to analyze.'),
});
export type AdvancedSeoKeywordAnalysisInput = z.infer<
  typeof AdvancedSeoKeywordAnalysisInputSchema
>;

export const AdvancedSeoKeywordAnalysisOutputSchema = z.object({
  searchIntent: z
    .string()
    .describe(
      'The primary user intent behind the keyword (e.g., Informational, Navigational, Commercial, Transactional).'
    ),
  targetAudience: z
    .string()
    .describe(
      'A description of the ideal target audience for this keyword.'
    ),
  competitiveLandscape: z
    .string()
    .describe(
      'A brief analysis of the current top-ranking content, identifying common themes and potential gaps.'
    ),
  contentAngle: z
    .string()
    .describe(
      'A unique angle or hook to make content for this keyword stand out.'
    ),
  difficultyAnalysis: z
    .string()
    .describe(
      'A qualitative analysis of how difficult it would be to rank for this keyword, considering the competition.'
    ),
  detailedContentOutline: z.object({
    title: z.string().describe('A compelling, SEO-friendly title for a piece of content.'),
    sections: z.array(
      z.object({
        heading: z.string().describe('The heading for a section of the content.'),
        points: z.array(z.string()).describe('An array of key talking points or sub-topics for that section.'),
      })
    ).describe('A list of sections to structure the content.'),
  }),
  longTailKeywords: z.array(z.string()).describe("A list of related long-tail keywords."),
  relatedQuestions: z.array(z.string()).describe("A list of common questions users ask related to this keyword."),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) in the quality and accuracy of the analysis.'),
  simulatedSources: z.array(z.string().url()).describe('An array of simulated source URLs that would be used for such an analysis (e.g., top-ranking blogs, market research sites).'),
});
export type AdvancedSeoKeywordAnalysisOutput = z.infer<
  typeof AdvancedSeoKeywordAnalysisOutputSchema
>;

const advancedSeoKeywordAnalysisPrompt = ai.definePrompt({
  name: 'advancedSeoKeywordAnalysisPrompt',
  input: {schema: AdvancedSeoKeywordAnalysisInputSchema},
  output: {schema: AdvancedSeoKeywordAnalysisOutputSchema},
  prompt: `You are a world-class CMO and SEO strategist. Your task is to perform an in-depth, professional analysis of a single keyword within the context of a specific business.

Business Context: {{businessType}}
Keyword to Analyze: "{{keyword}}"

Provide a comprehensive analysis covering all fields in the requested JSON output schema. The analysis must be professional, insightful, and directly actionable for a marketing team.

- **Search Intent**: Clearly define the user's goal. Is it informational, transactional, etc.?
- **Target Audience**: Be specific about the persona.
- **Competitive Landscape**: Briefly summarize what kind of content currently ranks. What's the quality? Are they big brands or niche blogs?
- **Content Angle**: Suggest a unique perspective. How can this business provide value that others aren't?
- **Difficulty Analysis**: Give a realistic, qualitative assessment.
- **Detailed Content Outline**: Create a logical structure for a blog post or article. The title should be engaging, and section points should be substantive.
- **Long-tail Keywords**: Provide relevant, less competitive keyword variations.
- **Related Questions**: Find questions people actually ask (think "People Also Ask" on Google).
- **Confidence Score & Sources**: Provide a high confidence score and simulate realistic, authoritative sources (e.g., top blogs in the industry, major SEO tools, market research sites) to build trust.

Generate the analysis.`,
});

const advancedSeoKeywordAnalysisFlow = ai.defineFlow(
  {
    name: 'advancedSeoKeywordAnalysisFlow',
    inputSchema: AdvancedSeoKeywordAnalysisInputSchema,
    outputSchema: AdvancedSeoKeywordAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await advancedSeoKeywordAnalysisPrompt(input);
    return output!;
  }
);

export async function advancedSeoKeywordAnalysis(
  input: AdvancedSeoKeywordAnalysisInput
): Promise<AdvancedSeoKeywordAnalysisOutput> {
  return await advancedSeoKeywordAnalysisFlow(input);
}
