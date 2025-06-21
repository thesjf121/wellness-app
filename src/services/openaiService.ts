// OpenAI API service for nutrition analysis

import { errorService } from './errorService';
import { environmentService } from '../config/environment';
import { NutritionData, GeminiAnalysisRequest, GeminiAnalysisResponse } from './geminiService';

class OpenAIService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // Get API key from environment service
    this.API_KEY = environmentService.get('openaiApiKey') || '';
    
    // Debug logging
    console.log('🔑 OpenAI API Key Length:', this.API_KEY.length);
    console.log('🔑 OpenAI API Key Configured:', this.isConfigured());
    if (this.API_KEY.length > 0) {
      console.log('🔑 OpenAI API Key Preview:', this.API_KEY.substring(0, 8) + '...');
    }
  }

  /**
   * Check if OpenAI API is properly configured
   */
  isConfigured(): boolean {
    return this.API_KEY.length > 0 && 
           this.API_KEY !== 'your_openai_api_key_here' && 
           !this.API_KEY.includes('placeholder') &&
           !this.API_KEY.includes('example') &&
           !this.API_KEY.includes('demo');
  }

  /**
   * Analyze food from text description using OpenAI function calling
   */
  async analyzeFoodText(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      console.log('OpenAI service - API Key configured:', this.isConfigured());
      
      if (!this.isConfigured()) {
        throw new Error('OpenAI API not configured');
      }

      console.log('📝 Using OpenAI for:', request.text);
      
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Analyze the nutrition information for: ${request.text}. Provide accurate nutrition data from the actual product label.`
          }],
          functions: [{
            name: 'get_nutrition_facts',
            description: 'Get accurate nutrition facts for food items including branded products',
            parameters: {
              type: 'object',
              properties: {
                food_items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      food_name: { type: 'string', description: 'Name of the food item' },
                      serving_size: { type: 'string', description: 'Serving size from product label' },
                      calories: { type: 'number', description: 'Calories per serving' },
                      protein_g: { type: 'number', description: 'Protein in grams' },
                      carbohydrates_g: { type: 'number', description: 'Carbohydrates in grams' },
                      fat_g: { type: 'number', description: 'Fat in grams' },
                      fiber_g: { type: 'number', description: 'Fiber in grams' },
                      sugar_g: { type: 'number', description: 'Sugar in grams' },
                      sodium_mg: { type: 'number', description: 'Sodium in milligrams' },
                      potassium_mg: { type: 'number', description: 'Potassium in milligrams' },
                      calcium_mg: { type: 'number', description: 'Calcium in milligrams' },
                      iron_mg: { type: 'number', description: 'Iron in milligrams' },
                      magnesium_mg: { type: 'number', description: 'Magnesium in milligrams' },
                      phosphorus_mg: { type: 'number', description: 'Phosphorus in milligrams' },
                      zinc_mg: { type: 'number', description: 'Zinc in milligrams' },
                      vitamin_c_mg: { type: 'number', description: 'Vitamin C in milligrams' },
                      vitamin_d_iu: { type: 'number', description: 'Vitamin D in IU' },
                      vitamin_a_iu: { type: 'number', description: 'Vitamin A in IU' },
                      confidence: { type: 'number', description: 'Confidence score 0-1' }
                    },
                    required: ['food_name', 'serving_size', 'calories', 'protein_g', 'carbohydrates_g', 'fat_g']
                  }
                }
              },
              required: ['food_items']
            }
          }],
          function_call: { name: 'get_nutrition_facts' },
          temperature: 0.1
        })
      });

      console.log('📡 Got response from OpenAI. Status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 OpenAI API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          apiKeyLength: this.API_KEY.length
        });
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw OpenAI Response:', JSON.stringify(data, null, 2));
      
      // Extract function call response
      const message = data.choices?.[0]?.message;
      if (message?.function_call && message.function_call.name === 'get_nutrition_facts') {
        const args = JSON.parse(message.function_call.arguments);
        const nutritionData = this.parseOpenAIResponse(args);
        console.log('✅ Parsed OpenAI Nutrition Data:', nutritionData);
        
        return {
          success: true,
          nutritionData,
          rawResponse: message.function_call.arguments
        };
      }

      // Fallback to content if no function call
      if (message?.content) {
        console.log('📝 OpenAI returned text instead of function call:', message.content);
        throw new Error('OpenAI did not use function calling');
      }
      
      throw new Error('No function call or content received from OpenAI');

    } catch (error) {
      console.error('🚨 OPENAI API CALL FAILED:', error);
      errorService.logError(error as Error, { 
        context: 'OpenAIService.analyzeFoodText',
        request 
      });
      
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Parse nutrition response from OpenAI function call
   */
  private parseOpenAIResponse(args: any): NutritionData[] {
    try {
      console.log('🧩 Parsing OpenAI response:', args);
      
      const foodItems = args.food_items || [];
      
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
          potassium: Math.max(0, Number(item.potassium_mg) || 0),
          calcium: Math.max(0, Number(item.calcium_mg) || 0),
          iron: Math.max(0, Number(item.iron_mg) || 0),
          magnesium: Math.max(0, Number(item.magnesium_mg) || 0),
          phosphorus: Math.max(0, Number(item.phosphorus_mg) || 0),
          zinc: Math.max(0, Number(item.zinc_mg) || 0),
          copper: 0,
          manganese: 0,
          selenium: 0,
          iodine: 0,
          vitaminA: Math.max(0, Number(item.vitamin_a_iu) || 0),
          vitaminD: Math.max(0, Number(item.vitamin_d_iu) || 0),
          vitaminE: 0,
          vitaminK: 0,
          vitaminC: Math.max(0, Number(item.vitamin_c_mg) || 0),
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
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.9))
      }));

    } catch (error) {
      console.error('❌ Error parsing OpenAI response:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const openaiService = new OpenAIService();

export default openaiService;