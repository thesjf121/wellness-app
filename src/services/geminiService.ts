// Google Gemini API service for nutrition analysis

import { errorService } from './errorService';
import { environmentService } from '../config/environment';

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
    sodium: number;       // mg
    potassium: number;    // mg
    calcium: number;      // mg
    iron: number;         // mg
    vitaminC: number;     // mg
    vitaminA: number;     // IU
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
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private readonly VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Get API key from environment service
    this.API_KEY = environmentService.get('geminiApiKey') || '';
    
    // Debug logging
    console.log('🔑 Gemini API Key Length:', this.API_KEY.length);
    console.log('🔑 API Key Configured:', this.isConfigured());
    if (this.API_KEY.length > 0) {
      console.log('🔑 API Key Preview:', this.API_KEY.substring(0, 8) + '...');
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
   * Analyze food from text description
   */
  async analyzeFoodText(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      console.log('Gemini service - API Key configured:', this.isConfigured());
      
      if (!this.isConfigured()) {
        console.log('Gemini API not configured, using offline mode');
        return this.getOfflineNutritionData(request.text || 'unknown food');
      }

      const prompt = this.buildNutritionPrompt(request.text || '', request.mealType);
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
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
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

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
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
        throw new Error('No analysis text received from Gemini');
      }

      const nutritionData = this.parseNutritionResponse(analysisText);
      
      return {
        success: true,
        nutritionData,
        rawResponse: analysisText
      };

    } catch (error) {
      errorService.logError(error as Error, { 
        context: 'GeminiService.analyzeFoodText',
        request 
      });

      // Fallback to offline mode on any error
      console.warn('Gemini API error, falling back to offline mode:', error);
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
    return `
Analyze the following food description and provide detailed nutrition information in JSON format.

Food description: "${foodText}"
${mealType ? `Meal type: ${mealType}` : ''}

Please provide nutrition information for each food item mentioned. Return ONLY a valid JSON array with this exact structure:

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
      "vitaminC": number (mg),
      "vitaminA": number (IU)
    },
    "servingSize": "description of serving size",
    "confidence": number (0-1 scale)
  }
]

Important notes:
- Estimate reasonable serving sizes if not specified
- If multiple foods are mentioned, create separate entries
- Use standard USDA nutrition values when possible
- Set confidence based on how specific the description is
- Return ONLY the JSON array, no additional text
`;
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
      "vitaminC": number (mg),
      "vitaminA": number (IU)
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
   * Parse nutrition response from Gemini
   */
  private parseNutritionResponse(responseText: string): NutritionData[] {
    try {
      // Remove any markdown formatting or extra text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonText = jsonMatch[0];
      const nutritionData = JSON.parse(jsonText);

      // Validate and sanitize the data
      return nutritionData.map((item: any) => ({
        foodItem: item.foodItem || 'Unknown food',
        calories: Math.max(0, Number(item.calories) || 0),
        macronutrients: {
          protein: Math.max(0, Number(item.macronutrients?.protein) || 0),
          carbohydrates: Math.max(0, Number(item.macronutrients?.carbohydrates) || 0),
          fat: Math.max(0, Number(item.macronutrients?.fat) || 0),
          fiber: Math.max(0, Number(item.macronutrients?.fiber) || 0),
          sugar: Math.max(0, Number(item.macronutrients?.sugar) || 0),
        },
        micronutrients: {
          sodium: Math.max(0, Number(item.micronutrients?.sodium) || 0),
          potassium: Math.max(0, Number(item.micronutrients?.potassium) || 0),
          calcium: Math.max(0, Number(item.micronutrients?.calcium) || 0),
          iron: Math.max(0, Number(item.micronutrients?.iron) || 0),
          vitaminC: Math.max(0, Number(item.micronutrients?.vitaminC) || 0),
          vitaminA: Math.max(0, Number(item.micronutrients?.vitaminA) || 0),
        },
        servingSize: item.servingSize || '1 serving',
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
          vitaminC: 5,
          vitaminA: 100
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
          vitaminC: 5 + Math.floor(Math.random() * 50),
          vitaminA: 100 + Math.floor(Math.random() * 1000)
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
}

// Create singleton instance
export const geminiService = new GeminiService();

export default geminiService;