'use server';
/**
 * @fileOverview Chart Takeaway Generation using OpenAI SDK with Horizon Beta
 * 
 * Direct integration with OpenRouter's Horizon Beta model for data insights.
 * Generates executive-level insights from keyword volume chart data.
 */

import { generateWithSchema } from '@/ai/genkit';
import {
  GenerateChartTakeawayInputSchema,
  GenerateChartTakeawayOutputSchema,
  type GenerateChartTakeawayInput,
  type GenerateChartTakeawayOutput,
} from '@/ai/types';

/**
 * Generates executive-level chart insights using Horizon Beta intelligence.
 * Analyzes keyword volume data to provide strategic marketing takeaways.
 */
export async function generateChartTakeaway(
  input: GenerateChartTakeawayInput
): Promise<GenerateChartTakeawayOutput> {
  
  const systemPrompt = `You are a Chief Marketing Officer (CMO) with 20+ years of experience in data-driven marketing strategy. You excel at analyzing complex data patterns and translating them into actionable business insights for executive decision-making.`;

  const userPrompt = `Analyze keyword volume chart data for ${input.businessType} and provide a strategic executive-level insight.

**CHART DATA:** ${input.keywordChartData}

**REQUIREMENTS FOR EXECUTIVE INSIGHT:**

Generate a single, powerful, executive-level sentence that captures the most important strategic insight from this keyword volume data.

**YOUR ANALYSIS SHOULD:**

1. **IDENTIFY THE STORY**: What is the data really telling us about market dynamics?

2. **STRATEGIC IMPLICATIONS**: What does this mean for marketing strategy and budget allocation?

3. **ACTIONABLE INSIGHT**: What should the marketing team do differently based on this data?

4. **EXECUTIVE FOCUS**: Frame the insight for C-suite decision makers who need clarity on:
   - Market opportunities and threats
   - Resource allocation priorities
   - Competitive positioning
   - Growth potential assessment

**INSIGHT CHARACTERISTICS:**
- Concise and impactful (1-2 sentences maximum)
- Data-driven and specific to the numbers shown
- Strategic rather than tactical
- Action-oriented for marketing teams
- Relevant to ${input.businessType} business context

**EXAMPLES OF EXECUTIVE-LEVEL INSIGHTS:**
- "The 340% surge in eco-friendly keywords signals a critical market shift requiring immediate budget reallocation to sustainability content."
- "Low-competition, high-volume long-tail keywords present a $2M untapped opportunity for rapid market share expansion."
- "Seasonal keyword patterns reveal Q4 represents 60% of annual search volume, demanding concentrated campaign timing."

**OUTPUT FORMAT:** Return a valid JSON object with the strategic takeaway.

Focus on insights that will help ${input.businessType} marketing leaders make informed, data-driven strategic decisions that drive business growth.`;

  try {
    const result = await generateWithSchema<GenerateChartTakeawayOutput>(
      userPrompt,
      GenerateChartTakeawayOutputSchema,
      systemPrompt
    );

    return result;
  } catch (error) {
    console.error('Error generating chart takeaway:', error);
    throw new Error(`Failed to generate chart takeaway: ${error}`);
  }
}