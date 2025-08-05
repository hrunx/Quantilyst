'use server';
/**
 * @fileOverview Market Deep Dive Analysis using OpenAI SDK with Horizon Beta
 * 
 * Direct integration with OpenRouter's Horizon Beta model for superior market intelligence.
 * Generates comprehensive C-suite level market analysis with dynamic AI-powered insights.
 */

import { generateWithSchema } from '@/ai/genkit';
import {
  MarketDeepDiveInputSchema,
  MarketDeepDiveOutputSchema,
  type MarketDeepDiveInput,
  type MarketDeepDiveOutput,
} from '@/ai/types';

/**
 * Generates a comprehensive C-suite level market deep-dive report using Horizon Beta.
 * Direct AI-powered analysis with no simulated data - everything dynamically generated.
 */
export async function marketDeepDive(
  input: MarketDeepDiveInput
): Promise<MarketDeepDiveOutput> {
  
  const systemPrompt = `You are a Senior Partner at McKinsey & Company with 25+ years leading billion-dollar investment decisions and market analysis for Fortune 500 companies. Your analysis directly influences:

- Multi-billion dollar M&A transactions and strategic investments
- C-suite strategic planning and capital allocation decisions
- Private equity fund deployment and portfolio optimization
- Government policy development and regulatory frameworks

CRITICAL: Every data point, financial figure, and market estimate must be INVESTMENT-GRADE with:
- Precise numerical accuracy suitable for billion-dollar decisions
- Real, verifiable company names and market data
- Professional-grade methodology and conservative estimates
- Actual industry sources and databases

This analysis will be used for major business decisions involving billions of dollars. Precision and accuracy are paramount.`;

  const userPrompt = `Analyze the ${input.businessType} market in ${input.country}${input.city ? `, ${input.city}` : ''}.

**REQUIRED JSON STRUCTURE (INVESTMENT-GRADE PRECISION):**
{
  "executiveSummary": "2-3 sentence strategic recommendation with specific ROI/growth projections",
  "tamSamSom": {
    "tam": {
      "value": 123456789000, 
      "description": "Total market size methodology and growth rate", 
      "sources": ["https://bloomberg.com/data", "https://mckinsey.com/insights", "https://statista.com/markets"]
    },
    "sam": {
      "value": 12345678900, 
      "description": "Serviceable market calculation with penetration assumptions", 
      "sources": ["https://pitchbook.com/data", "https://cbinsights.com/research"]
    }, 
    "som": {
      "value": 1234567890, 
      "description": "Realistic obtainable market with 3-5 year timeline", 
      "sources": ["https://capitaliq.com", "https://factset.com"]
    }
  },
  "competitors": [
    {"name": "Real Company Name", "strengths": "specific competitive advantage", "weaknesses": "documented market gap", "marketShare": "15.2%"}
  ],
  "swot": {
    "strengths": ["quantified strength with metrics", "verified market position"],
    "weaknesses": ["specific operational constraint", "documented market challenge"],
    "opportunities": ["quantified market opportunity with timeline", "regulatory/tech trend impact"], 
    "threats": ["competitive threat with probability", "market risk with impact assessment"]
  }
}

**INVESTMENT-GRADE REQUIREMENTS:**
- TAM/SAM/SOM: Use actual market data, realistic growth rates, conservative estimates
- Competitors: Real companies only, verified market shares, specific strengths/weaknesses
- Sources: Provide actual URLs to reputable sources (Bloomberg, McKinsey, Statista, PitchBook, etc.)
- SWOT: Quantified, specific, actionable insights with measurable impact

**CRITICAL:** This analysis influences billion-dollar decisions. Precision over creativity.`;

  try {
    const result = await generateWithSchema<MarketDeepDiveOutput>(
      userPrompt,
      MarketDeepDiveOutputSchema,
      systemPrompt
    );

    return result;
  } catch (error) {
    console.error('Error generating market deep dive:', error);
    throw new Error(`Failed to generate market deep dive: ${error}`);
  }
}
