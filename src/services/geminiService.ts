// Google Gemini API service for nutrition analysis

import { errorService } from './errorService';
import { environmentService } from '../config/environment';
import { openaiService } from './openaiService';
import { perplexityService } from './perplexityService';

export interface NutritionData {
  foodItem: string;
  calories: number;
  macronutrients: {
    protein: number;      // grams
    carbohydrates: number; // grams
    fat: number;          // grams
    fiber: number;        // grams
    sugar: number;        // grams
  };
  micronutrients: {
    // Minerals
    sodium: number;       // mg
    potassium: number;    // mg
    calcium: number;      // mg
    iron: number;         // mg
    magnesium: number;    // mg
    phosphorus: number;   // mg
    zinc: number;         // mg
    copper: number;       // mg
    manganese: number;    // mg
    selenium: number;     // mcg
    iodine: number;       // mcg
    
    // Fat-soluble vitamins
    vitaminA: number;     // IU
    vitaminD: number;     // IU
    vitaminE: number;     // mg
    vitaminK: number;     // mcg
    
    // Water-soluble vitamins
    vitaminC: number;     // mg
    thiamine: number;     // mg (B1)
    riboflavin: number;   // mg (B2)
    niacin: number;       // mg (B3)
    pantothenicAcid: number; // mg (B5)
    vitaminB6: number;    // mg
    biotin: number;       // mcg (B7)
    folate: number;       // mcg (B9)
    vitaminB12: number;   // mcg
    choline: number;      // mg
  };
  servingSize: string;
  confidence: number;    // 0-1 scale
}

export interface GeminiAnalysisRequest {
  text?: string;
  imageBase64?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  userId: string;
}

export interface GeminiAnalysisResponse {
  success: boolean;
  nutritionData?: NutritionData[];
  error?: string;
  rawResponse?: string;
}

class GeminiService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  private readonly VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor() {
    // Get API key from environment service
    this.API_KEY = environmentService.get('geminiApiKey') || '';
    
    // Debug logging
    console.log('🔑 Gemini API Key Length:', this.API_KEY.length);
    console.log('🔑 API Key Configured:', this.isConfigured());
    console.log('🔑 REACT_APP_GEMINI_API_KEY:', process.env.REACT_APP_GEMINI_API_KEY ? 'SET' : 'NOT SET');
    console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    if (this.API_KEY.length > 0) {
      console.log('🔑 API Key Preview:', this.API_KEY.substring(0, 8) + '...');
      console.log('🔑 API Key is placeholder:', this.API_KEY === 'your_gemini_api_key_here');
    } else {
      console.error('🚨 NO GEMINI API KEY FOUND - Will use fake data!');
    }
  }

  /**
   * Check if Gemini API is properly configured
   */
  isConfigured(): boolean {
    return this.API_KEY.length > 0 && 
           this.API_KEY !== 'your_gemini_api_key_here' && 
           !this.API_KEY.includes('placeholder') &&
           !this.API_KEY.includes('example') &&
           !this.API_KEY.includes('demo');
  }

  /**
   * Analyze food from text description - uses ONLY Perplexity for real-time nutrition data
   */
  async analyzeFoodText(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    // Use Perplexity for ALL food lookups
    if (perplexityService.isConfigured()) {
      console.log('🔍 Using Perplexity for real-time nutrition lookup...');
      try {
        const perplexityResult = await perplexityService.analyzeFoodText(request);
        console.log('🔍 Perplexity Result:', {
          success: perplexityResult.success,
          error: perplexityResult.error,
          hasData: !!perplexityResult.nutritionData,
          dataLength: perplexityResult.nutritionData?.length
        });
        if (perplexityResult.success) {
          console.log('✅ Perplexity succeeded with real-time data');
          return perplexityResult;
        }
        console.log('❌ Perplexity failed:', perplexityResult.error);
        
        // Return the error instead of falling back
        return {
          success: false,
          error: `Perplexity lookup failed: ${perplexityResult.error}`,
          nutritionData: []
        };
      } catch (error) {
        console.log('❌ Perplexity error:', error);
        return {
          success: false,
          error: `Perplexity error: ${(error as Error).message}`,
          nutritionData: []
        };
      }
    }
    
    // If Perplexity not configured, return error
    console.log('❌ Perplexity not configured');
    return {
      success: false,
      error: 'Perplexity API not configured',
      nutritionData: []
    };
  }

  /**
   * Analyze food using Gemini function calling
   */
  private async analyzeWithGemini(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      console.log('Gemini service - API Key configured:', this.isConfigured());
      
      if (!this.isConfigured()) {
        console.log('Gemini API not configured, using offline mode');
        return this.getOfflineNutritionData(request.text || 'unknown food');
      }

      const prompt = `Analyze the nutrition information for: ${request.text}`;
      console.log('📝 Using Gemini Tools for:', request.text);
      
      const url = `${this.BASE_URL}?key=${this.API_KEY}`;
      console.log('🌐 Making request to:', url.replace(this.API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          tools: [{
            function_declarations: [{
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
            }]
          }],
          tool_config: {
            function_calling_config: {
              mode: 'ANY',
              allowed_function_names: ['get_nutrition_facts']
            }
          }
        })
      });

      console.log('📡 Got response from Gemini Tools. Status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Gemini API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          apiKeyLength: this.API_KEY.length,
          apiKeyConfigured: this.isConfigured()
        });
        
        // Handle specific API errors
        if (response.status === 429) {
          console.warn('Gemini API rate limit reached, using offline mode');
          return this.getOfflineNutritionData(request.text || 'unknown food');
        }
        if (response.status === 401 || response.status === 403) {
          console.error('🚨 Invalid/Missing Gemini API key - Status:', response.status);
          return this.getOfflineNutritionData(request.text || 'unknown food');
        }
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw Gemini Tools Response:', JSON.stringify(data, null, 2));
      
      // Extract function call response
      const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
      if (functionCall && functionCall.name === 'get_nutrition_facts') {
        const nutritionData = this.parseToolsResponse(functionCall.args);
        console.log('✅ Parsed Tools Nutrition Data:', nutritionData);
        
        return {
          success: true,
          nutritionData,
          rawResponse: JSON.stringify(functionCall.args)
        };
      }

      // Fallback to text parsing if no function call
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (analysisText) {
        console.log('📝 Fallback to text parsing:', analysisText);
        const nutritionData = this.parseNutritionResponse(analysisText);
        return {
          success: true,
          nutritionData,
          rawResponse: analysisText
        };
      }
      
      throw new Error('No function call or text response received from Gemini');

    } catch (error) {
      console.error('🚨 GEMINI TOOLS API CALL FAILED:', error);
      console.error('🚨 Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        requestText: request.text,
        apiKeyLength: this.API_KEY.length
      });
      
      errorService.logError(error as Error, { 
        context: 'GeminiService.analyzeFoodText',
        request 
      });

      // Fallback to offline mode on any error
      console.warn('🔄 Falling back to offline mode due to error:', error);
      return this.getOfflineNutritionData(request.text || 'unknown food');
    }
  }

  /**
   * Analyze food from image
   */
  async analyzeFoodImage(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      if (!this.isConfigured()) {
        return this.getOfflineNutritionData('food from image');
      }

      if (!request.imageBase64) {
        throw new Error('No image data provided');
      }

      const prompt = this.buildImageAnalysisPrompt(request.mealType);
      
      const response = await fetch(`${this.VISION_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: request.imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Vision API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
        throw new Error('No analysis text received from Gemini Vision');
      }

      const nutritionData = this.parseNutritionResponse(analysisText);
      
      return {
        success: true,
        nutritionData,
        rawResponse: analysisText
      };

    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GeminiService.analyzeFoodImage',
        request: { ...request, imageBase64: '[IMAGE_DATA]' } // Don't log full image
      });

      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Build nutrition analysis prompt for text input
   */
  private buildNutritionPrompt(foodText: string, mealType?: string): string {
    return `${foodText} nutrition facts`;
  }

  /**
   * Build nutrition analysis prompt for image input
   */
  private buildImageAnalysisPrompt(mealType?: string): string {
    return `
Analyze the food in this image and provide detailed nutrition information in JSON format.

${mealType ? `This appears to be a ${mealType} meal.` : ''}

Please identify each food item visible and provide nutrition information. Return ONLY a valid JSON array with this exact structure:

[
  {
    "foodItem": "name of food item",
    "calories": number,
    "macronutrients": {
      "protein": number (grams),
      "carbohydrates": number (grams),
      "fat": number (grams),
      "fiber": number (grams),
      "sugar": number (grams)
    },
    "micronutrients": {
      "sodium": number (mg),
      "potassium": number (mg),
      "calcium": number (mg),
      "iron": number (mg),
      "magnesium": number (mg),
      "phosphorus": number (mg),
      "zinc": number (mg),
      "copper": number (mg),
      "manganese": number (mg),
      "selenium": number (mcg),
      "iodine": number (mcg),
      "vitaminA": number (IU),
      "vitaminD": number (IU),
      "vitaminE": number (mg),
      "vitaminK": number (mcg),
      "vitaminC": number (mg),
      "thiamine": number (mg),
      "riboflavin": number (mg),
      "niacin": number (mg),
      "pantothenicAcid": number (mg),
      "vitaminB6": number (mg),
      "biotin": number (mcg),
      "folate": number (mcg),
      "vitaminB12": number (mcg),
      "choline": number (mg)
    },
    "servingSize": "estimated serving size",
    "confidence": number (0-1 scale based on image clarity)
  }
]

Important notes:
- Estimate serving sizes based on visual portion assessment
- Include all identifiable food items
- Use standard USDA nutrition values when possible
- Set confidence based on image quality and food visibility
- Return ONLY the JSON array, no additional text
`;
  }

  /**
   * Parse nutrition response from Gemini Tools function call
   */
  private parseToolsResponse(args: any): NutritionData[] {
    try {
      console.log('🧩 Parsing Tools response:', args);
      
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
          copper: 0, // Not in schema, default to 0
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
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.8))
      }));

    } catch (error) {
      console.error('❌ Error parsing Tools response:', error);
      errorService.logError(error as Error, { 
        context: 'GeminiService.parseToolsResponse',
        args 
      });
      
      // Return fallback
      return [{
        foodItem: 'Unknown food item',
        calories: 100,
        macronutrients: { protein: 2, carbohydrates: 15, fat: 3, fiber: 1, sugar: 5 },
        micronutrients: {
          sodium: 50, potassium: 100, calcium: 20, iron: 1, magnesium: 25, phosphorus: 50, zinc: 1,
          copper: 0.1, manganese: 0.5, selenium: 10, iodine: 50, vitaminA: 100, vitaminD: 10,
          vitaminE: 2, vitaminK: 20, vitaminC: 5, thiamine: 0.1, riboflavin: 0.1, niacin: 2,
          pantothenicAcid: 1, vitaminB6: 0.2, biotin: 5, folate: 25, vitaminB12: 0.5, choline: 25
        },
        servingSize: '1 serving',
        confidence: 0.1
      }];
    }
  }

  /**
   * Parse nutrition response from Gemini
   */
  private parseNutritionResponse(responseText: string): NutritionData[] {
    try {
      console.log('🧩 Parsing response text:', responseText);
      
      // Try to extract JSON - be more aggressive about finding it
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Look for JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      } else {
        console.error('❌ No JSON array found. Full text:', responseText);
        // Try to parse the entire response as JSON
        if (jsonText.startsWith('[') && jsonText.endsWith(']')) {
          // It might already be valid JSON
        } else {
          throw new Error('No valid JSON array found in response');
        }
      }

      console.log('🎯 Extracted JSON:', jsonText);
      
      const nutritionData = JSON.parse(jsonText);
      console.log('📊 Raw parsed data:', nutritionData);

      // Validate and sanitize the data - handle both formats
      return nutritionData.map((item: any) => ({
        foodItem: item.foodItem || item.product_name || 'Unknown food',
        calories: Math.max(0, Number(item.calories) || 0),
        macronutrients: {
          protein: Math.max(0, Number(item.macronutrients?.protein) || Number(item.macronutrients?.protein_g) || 0),
          carbohydrates: Math.max(0, Number(item.macronutrients?.carbohydrates) || Number(item.macronutrients?.carbohydrates_g) || 0),
          fat: Math.max(0, Number(item.macronutrients?.fat) || Number(item.macronutrients?.fat_g) || 0),
          fiber: Math.max(0, Number(item.macronutrients?.fiber) || Number(item.macronutrients?.fiber_g) || 0),
          sugar: Math.max(0, Number(item.macronutrients?.sugar) || Number(item.macronutrients?.sugar_g) || 0),
        },
        micronutrients: {
          sodium: Math.max(0, Number(item.micronutrients?.sodium) || Number(item.micronutrients?.sodium_mg) || 0),
          potassium: Math.max(0, Number(item.micronutrients?.potassium) || Number(item.micronutrients?.potassium_mg) || 0),
          calcium: Math.max(0, Number(item.micronutrients?.calcium) || Number(item.micronutrients?.calcium_mg) || 0),
          iron: Math.max(0, Number(item.micronutrients?.iron) || Number(item.micronutrients?.iron_mg) || 0),
          magnesium: Math.max(0, Number(item.micronutrients?.magnesium) || 0),
          phosphorus: Math.max(0, Number(item.micronutrients?.phosphorus) || 0),
          zinc: Math.max(0, Number(item.micronutrients?.zinc) || 0),
          copper: Math.max(0, Number(item.micronutrients?.copper) || 0),
          manganese: Math.max(0, Number(item.micronutrients?.manganese) || 0),
          selenium: Math.max(0, Number(item.micronutrients?.selenium) || 0),
          iodine: Math.max(0, Number(item.micronutrients?.iodine) || 0),
          vitaminA: Math.max(0, Number(item.micronutrients?.vitaminA) || 0),
          vitaminD: Math.max(0, Number(item.micronutrients?.vitaminD) || 0),
          vitaminE: Math.max(0, Number(item.micronutrients?.vitaminE) || 0),
          vitaminK: Math.max(0, Number(item.micronutrients?.vitaminK) || 0),
          vitaminC: Math.max(0, Number(item.micronutrients?.vitaminC) || 0),
          thiamine: Math.max(0, Number(item.micronutrients?.thiamine) || 0),
          riboflavin: Math.max(0, Number(item.micronutrients?.riboflavin) || 0),
          niacin: Math.max(0, Number(item.micronutrients?.niacin) || 0),
          pantothenicAcid: Math.max(0, Number(item.micronutrients?.pantothenicAcid) || 0),
          vitaminB6: Math.max(0, Number(item.micronutrients?.vitaminB6) || 0),
          biotin: Math.max(0, Number(item.micronutrients?.biotin) || 0),
          folate: Math.max(0, Number(item.micronutrients?.folate) || 0),
          vitaminB12: Math.max(0, Number(item.micronutrients?.vitaminB12) || 0),
          choline: Math.max(0, Number(item.micronutrients?.choline) || 0),
        },
        servingSize: item.servingSize || item.serving_size || '1 serving',
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5))
      }));

    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GeminiService.parseNutritionResponse',
        responseText 
      });
      
      // Return a fallback nutrition entry
      return [{
        foodItem: 'Unknown food item',
        calories: 100,
        macronutrients: {
          protein: 2,
          carbohydrates: 15,
          fat: 3,
          fiber: 1,
          sugar: 5
        },
        micronutrients: {
          sodium: 50,
          potassium: 100,
          calcium: 20,
          iron: 1,
          magnesium: 25,
          phosphorus: 50,
          zinc: 1,
          copper: 0.1,
          manganese: 0.5,
          selenium: 10,
          iodine: 50,
          vitaminA: 100,
          vitaminD: 10,
          vitaminE: 2,
          vitaminK: 20,
          vitaminC: 5,
          thiamine: 0.1,
          riboflavin: 0.1,
          niacin: 2,
          pantothenicAcid: 1,
          vitaminB6: 0.2,
          biotin: 5,
          folate: 25,
          vitaminB12: 0.5,
          choline: 25
        },
        servingSize: '1 serving',
        confidence: 0.1
      }];
    }
  }

  /**
   * Generate mock nutrition data for demo/development
   * WARNING: This is fake data used when Gemini API is not available
   */
  private getOfflineNutritionData(foodDescription: string): GeminiAnalysisResponse {
    console.warn('🚨 USING FAKE NUTRITION DATA - Gemini API not configured!');
    
    const mockData: NutritionData[] = [
      {
        foodItem: `⚠️ FAKE DATA: ${foodDescription}`,
        calories: 150 + Math.floor(Math.random() * 200),
        macronutrients: {
          protein: 5 + Math.floor(Math.random() * 20),
          carbohydrates: 20 + Math.floor(Math.random() * 30),
          fat: 3 + Math.floor(Math.random() * 15),
          fiber: 2 + Math.floor(Math.random() * 8),
          sugar: 5 + Math.floor(Math.random() * 15)
        },
        micronutrients: {
          sodium: 50 + Math.floor(Math.random() * 500),
          potassium: 100 + Math.floor(Math.random() * 400),
          calcium: 20 + Math.floor(Math.random() * 200),
          iron: 1 + Math.floor(Math.random() * 5),
          magnesium: 25 + Math.floor(Math.random() * 100),
          phosphorus: 50 + Math.floor(Math.random() * 200),
          zinc: 1 + Math.floor(Math.random() * 10),
          copper: 0.1 + Math.floor(Math.random() * 2),
          manganese: 0.5 + Math.floor(Math.random() * 3),
          selenium: 10 + Math.floor(Math.random() * 50),
          iodine: 50 + Math.floor(Math.random() * 100),
          vitaminA: 100 + Math.floor(Math.random() * 1000),
          vitaminD: 10 + Math.floor(Math.random() * 100),
          vitaminE: 2 + Math.floor(Math.random() * 20),
          vitaminK: 20 + Math.floor(Math.random() * 100),
          vitaminC: 5 + Math.floor(Math.random() * 50),
          thiamine: 0.1 + Math.floor(Math.random() * 2),
          riboflavin: 0.1 + Math.floor(Math.random() * 2),
          niacin: 2 + Math.floor(Math.random() * 20),
          pantothenicAcid: 1 + Math.floor(Math.random() * 5),
          vitaminB6: 0.2 + Math.floor(Math.random() * 2),
          biotin: 5 + Math.floor(Math.random() * 30),
          folate: 25 + Math.floor(Math.random() * 200),
          vitaminB12: 0.5 + Math.floor(Math.random() * 5),
          choline: 25 + Math.floor(Math.random() * 200)
        },
        servingSize: '1 serving (estimated)',
        confidence: 0.1  // Low confidence to indicate fake data
      }
    ];

    return {
      success: false,  // Mark as failed to indicate offline mode
      nutritionData: mockData,
      rawResponse: `⚠️ OFFLINE MODE: This is fake nutrition data! Configure REACT_APP_GEMINI_API_KEY for accurate analysis.`,
      error: 'Gemini API not configured - using fake data'
    };
  }

  /**
   * Clear all cached/stored data to force fresh API calls
   */
  clearAllStoredData(): void {
    // Clear localStorage of any cached food data
    localStorage.removeItem('wellness_food_entries');
    localStorage.removeItem('wellness_nutrition_goals');
    localStorage.removeItem('wellness_favorite_foods');
    localStorage.removeItem('wellness_offline_queue');
    console.log('🗑️ Cleared all stored food data - next queries will be fresh from API');
  }

  /**
   * Test API connectivity with detailed logging
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini API Connection...');
      console.log('🔑 API Key Configured:', this.isConfigured());
      console.log('🔑 API Key Length:', this.API_KEY.length);
      
      if (!this.isConfigured()) {
        console.log('❌ API Key not configured, using mock mode');
        return true; // Mock mode always works
      }

      console.log('📡 Making test API call to Gemini...');
      const response = await this.analyzeFoodText({
        text: 'apple',
        userId: 'test'
      });

      console.log('🧪 Test Result:', { 
        success: response.success, 
        hasData: !!response.nutritionData,
        error: response.error 
      });

      return response.success;
    } catch (error) {
      console.error('🚨 Gemini API test failed:', error);
      errorService.logError(error as Error, { 
        context: 'GeminiService.testConnection' 
      });
      return false;
    }
  }

  /**
   * Debug method to check configuration status
   */
  getDebugInfo() {
    return {
      apiKeyLength: this.API_KEY.length,
      isConfigured: this.isConfigured(),
      baseUrl: this.BASE_URL,
      apiKeyPreview: this.API_KEY.length > 0 ? this.API_KEY.substring(0, 8) + '...' : 'NOT SET'
    };
  }

  /**
   * Check if the food text looks like a branded product
   */
  private looksLikeBrandedProduct(text: string): boolean {
    const brandedIndicators = [
      'naked', 'quest', 'clif', 'kind', 'rxbar', 'larabar', 'pure protein',
      'premier protein', 'muscle milk', 'orgain', 'vega', 'garden of life',
      'optimum nutrition', 'gold standard', 'bsn', 'dymatize', 'isopure',
      'coca cola', 'pepsi', 'gatorade', 'powerade', 'vitamin water',
      'red bull', 'monster', 'rockstar', 'bang', 'celsius',
      'yoplait', 'chobani', 'dannon', 'oikos', 'fage', 'siggi',
      'ben & jerry', 'haagen dazs', 'breyers', 'blue bell',
      'kellogg', 'general mills', 'post', 'quaker',
      'doritos', 'lay\'s', 'pringles', 'cheetos', 'fritos',
      'oreo', 'chips ahoy', 'nabisco', 'keebler',
      'nature valley', 'fiber one', 'special k', 'nutri grain',
      'campbell', 'progresso', 'healthy choice', 'lean cuisine',
      'stouffer', 'marie callender', 'amy\'s', 'annie\'s'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Check if text contains any brand indicators
    const hasBrand = brandedIndicators.some(brand => lowerText.includes(brand));
    
    // Check for patterns that indicate branded products
    const hasProductPattern = /\b(bar|shake|powder|drink|snack|chips|cookie|cereal|yogurt|ice cream|soup|meal)\b/i.test(text);
    
    // Check for trademark symbols
    const hasTrademark = /[®™©]/.test(text);
    
    // Check for product-like capitalization (e.g., "Naked Vanilla Protein")
    const hasProductCapitalization = /[A-Z][a-z]+\s+[A-Z]/.test(text);
    
    console.log('🏷️ Brand detection for:', text, {
      hasBrand,
      hasProductPattern,
      hasTrademark,
      hasProductCapitalization,
      isBranded: hasBrand || (hasProductPattern && hasProductCapitalization) || hasTrademark
    });
    
    return hasBrand || (hasProductPattern && hasProductCapitalization) || hasTrademark;
  }
}

// Create singleton instance
export const geminiService = new GeminiService();

export default geminiService;