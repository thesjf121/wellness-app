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
      console.log('📝 EXACT PROMPT BEING SENT:', prompt);
      
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
          generationConfig: {
            temperature: 0.0,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096,
          }
        })
      });

      console.log('📡 Got response from Gemini. Status:', response.status, 'OK:', response.ok);

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
      console.log('🔍 Raw Gemini Response:', JSON.stringify(data, null, 2));
      
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('📝 Analysis Text from Gemini:', analysisText);
      
      if (!analysisText) {
        console.error('❌ No analysis text received from Gemini. Full response:', data);
        throw new Error('No analysis text received from Gemini');
      }

      const nutritionData = this.parseNutritionResponse(analysisText);
      console.log('✅ Parsed Nutrition Data:', nutritionData);
      
      return {
        success: true,
        nutritionData,
        rawResponse: analysisText
      };

    } catch (error) {
      console.error('🚨 GEMINI API CALL FAILED:', error);
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
    return `Provide detailed nutrition information for "${foodText}". Return only a JSON array with accurate nutrition data including calories, macronutrients (protein, carbohydrates, fat, fiber, sugar), micronutrients (sodium, potassium, calcium, iron, etc.), and serving size. Use exact product label information for branded products.`;
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