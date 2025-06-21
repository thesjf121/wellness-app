// Perplexity API service for real-time nutrition lookups

import { errorService } from './errorService';
import { environmentService } from '../config/environment';
import { NutritionData, GeminiAnalysisRequest, GeminiAnalysisResponse } from './geminiService';

class PerplexityService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    // Get API key from environment service
    this.API_KEY = environmentService.get('perplexityApiKey') || '';
    
    // Debug logging
    console.log('🔍 Perplexity API Key Length:', this.API_KEY.length);
    console.log('🔍 Perplexity API Key Configured:', this.isConfigured());
    if (this.API_KEY.length > 0) {
      console.log('🔍 Perplexity API Key Preview:', this.API_KEY.substring(0, 8) + '...');
    }
  }

  /**
   * Check if Perplexity API is properly configured
   */
  isConfigured(): boolean {
    return this.API_KEY.length > 0 && 
           this.API_KEY !== 'your_perplexity_api_key_here' && 
           !this.API_KEY.includes('placeholder') &&
           !this.API_KEY.includes('example') &&
           !this.API_KEY.includes('demo');
  }

  /**
   * Analyze food from text description using Perplexity's real-time search
   */
  async analyzeFoodText(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      console.log('Perplexity service - API Key configured:', this.isConfigured());
      
      if (!this.isConfigured()) {
        throw new Error('Perplexity API not configured');
      }

      console.log('🔍 Using Perplexity for real-time nutrition lookup:', request.text);
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online', // More powerful real-time web search model
          messages: [{
            role: 'system',
            content: `You are a nutrition data extractor. Your task is to search the web and find EXACT nutrition facts from product labels, manufacturer websites, or reliable sources. 

IMPORTANT: You must return actual numbers, not null values. If you find the product, extract the nutrition data from the search results or your knowledge.

Return ONLY a JSON object with this exact structure:
{
  "food_items": [{
    "food_name": "exact product name",
    "serving_size": "serving size from label (e.g., '1 scoop (30g)')",
    "calories": number (actual calories per serving),
    "protein_g": number (grams of protein),
    "carbohydrates_g": number (grams of carbs),
    "fat_g": number (grams of fat),
    "fiber_g": number (grams of fiber),
    "sugar_g": number (grams of sugar),
    "sodium_mg": number (milligrams of sodium),
    "source": "URL or description of source"
  }]
}`
          }, {
            role: 'user',
            content: `Find the nutrition facts for: ${request.text}

Search for and extract the actual nutrition label data. Common sources include:
- Official brand websites (nakednutrition.com for Naked products)
- Major retailers (Amazon, Walmart, Target)
- Nutrition databases
- Product packaging images

Return the actual nutrition numbers per serving, not placeholder values.`
          }],
          temperature: 0.1,
          max_tokens: 1000,
          return_citations: true,
          search_domain_filter: ["nakednutrition.com", "amazon.com", "walmart.com", "target.com", "iherb.com", "vitacost.com", "gnc.com", "bodybuilding.com"],
          search_recency_filter: "year"
        })
      });

      console.log('📡 Got response from Perplexity. Status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Perplexity API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          apiKeyLength: this.API_KEY.length
        });
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw Perplexity Response:', JSON.stringify(data, null, 2));
      
      // Extract nutrition data from response
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const nutritionData = this.parsePerplexityResponse(content, data.citations);
        console.log('✅ Parsed Perplexity Nutrition Data:', nutritionData);
        
        return {
          success: true,
          nutritionData,
          rawResponse: content
        };
      }
      
      throw new Error('No content received from Perplexity');

    } catch (error) {
      console.error('🚨 PERPLEXITY API CALL FAILED:', error);
      errorService.logError(error as Error, { 
        context: 'PerplexityService.analyzeFoodText',
        request 
      });
      
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Parse nutrition response from Perplexity
   */
  private parsePerplexityResponse(responseText: string, citations?: any[]): NutritionData[] {
    try {
      console.log('🧩 Parsing Perplexity response:', responseText);
      console.log('📚 Citations:', citations);
      
      // Try to extract JSON from the response
      let jsonText = responseText.trim();
      
      // Look for JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      const foodItems = parsed.food_items || [];
      
      return foodItems.map((item: any) => ({
        foodItem: item.food_name || 'Unknown food',
        calories: Math.max(0, Number(item.calories) || 0),
        macronutrients: {
          protein: Math.max(0, Number(item.protein_g) || 0),
          carbohydrates: Math.max(0, Number(item.carbohydrates_g) || 0),
          fat: Math.max(0, Number(item.fat_g) || 0),
          fiber: Math.max(0, Number(item.fiber_g) || 0),
          sugar: Math.max(0, Number(item.sugar_g) || 0),
        },
        micronutrients: {
          sodium: Math.max(0, Number(item.sodium_mg) || 0),
          potassium: 0, // Add more if available from search
          calcium: 0,
          iron: 0,
          magnesium: 0,
          phosphorus: 0,
          zinc: 0,
          copper: 0,
          manganese: 0,
          selenium: 0,
          iodine: 0,
          vitaminA: 0,
          vitaminD: 0,
          vitaminE: 0,
          vitaminK: 0,
          vitaminC: 0,
          thiamine: 0,
          riboflavin: 0,
          niacin: 0,
          pantothenicAcid: 0,
          vitaminB6: 0,
          biotin: 0,
          folate: 0,
          vitaminB12: 0,
          choline: 0,
        },
        servingSize: item.serving_size || '1 serving',
        confidence: item.source ? 0.95 : 0.7 // High confidence if source provided
      }));

    } catch (error) {
      console.error('❌ Error parsing Perplexity response:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const perplexityService = new PerplexityService();

export default perplexityService;