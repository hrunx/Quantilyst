import OpenAI from 'openai';

// Direct OpenAI SDK with OpenRouter configuration for Horizon Beta
export const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://quantilyst.com',
    'X-Title': 'Quantilyst Market Intelligence',
  },
});

// Model configuration
export const MODEL = 'openrouter/horizon-beta';

// Helper function to generate AI content with structured output
export async function generateWithSchema<T>(
  prompt: string,
  schema: any,
  systemPrompt?: string
): Promise<T> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  // Enhanced prompt with JSON formatting instructions
  const enhancedPrompt = `${prompt}

**CRITICAL JSON FORMATTING REQUIREMENTS:**
- Return ONLY valid JSON - no markdown, no explanations, no additional text
- Ensure all strings are properly escaped with quotes
- Do not include any line breaks within string values
- Keep response concise but comprehensive
- Validate JSON structure before returning`;

  messages.push({ role: 'user', content: enhancedPrompt });

  const response = await ai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.3, // Lower temperature for more consistent JSON
    max_tokens: 4000, // Reduced to prevent overly complex responses
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI model');
  }

  console.log('🤖 AI Response received:', {
    model: MODEL,
    length: content.length,
    preview: content.substring(0, 300) + '...',
    endsWithBrace: content.trim().endsWith('}'),
    startsWithBrace: content.trim().startsWith('{')
  });

  try {
    // Enhanced JSON cleanup for better parsing success
    let cleanedContent = content.trim();
    
    // Remove any markdown code blocks
    cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Extract JSON object if embedded in other text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }
    
    // Clean up common JSON issues
    cleanedContent = cleanedContent
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/"/g, '"') // Normalize quotes
      .replace(/"/g, '"') // Normalize quotes
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([}\]]\s*),(\s*[}\]])/g, '$1$2'); // Remove commas before closing brackets
    
    const parsed = JSON.parse(cleanedContent);
    console.log('✅ JSON parsing successful! Data structure:', {
      keys: Object.keys(parsed),
      hasArrays: Object.values(parsed).some(v => Array.isArray(v)),
      sampleValue: typeof parsed === 'object' ? Object.values(parsed)[0] : 'primitive'
    });
    return parsed as T;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('AI Response Length:', content.length);
    console.error('AI Response Preview:', content.substring(0, 500) + '...');
    
    // Last resort: try to fix common issues automatically
    try {
      let fixedContent = content.trim();
      
      // Extract JSON more aggressively
      const jsonStart = fixedContent.indexOf('{');
      const jsonEnd = fixedContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        fixedContent = fixedContent.substring(jsonStart, jsonEnd + 1);
      }
      
      // Basic cleanup
      fixedContent = fixedContent
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ')
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      return JSON.parse(fixedContent) as T;
    } catch (finalError) {
      console.error('Final JSON fix attempt failed:', finalError);
      throw new Error(`Failed to parse AI response as JSON: ${error}. Response length: ${content.length}. Content preview: ${content.substring(0, 200)}...`);
    }
  }
}
