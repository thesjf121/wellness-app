import { FoodEntry } from '../types';

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence: number;
  description: string;
}

export interface GeminiRequest {
  foodDescription: string;
  mealType?: string;
  portion?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
  }

  async analyzeFoodDescription(request: GeminiRequest): Promise<NutritionAnalysis> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = this.buildNutritionPrompt(request);
      const response = await this.callGeminiAPI(prompt);
      return this.parseNutritionResponse(response, request.foodDescription);
    } catch (error) {
      console.error('Error analyzing food description:', error);
      throw new Error('Failed to analyze food. Please try again or enter nutrition manually.');
    }
  }

  private buildNutritionPrompt(request: GeminiRequest): string {
    const { foodDescription, mealType, portion } = request;
    
    return `
Please analyze the following food description and provide nutrition information in JSON format.

Food: ${foodDescription}
${mealType ? `Meal Type: ${mealType}` : ''}
${portion ? `Portion: ${portion}` : ''}

Provide a JSON response with the following structure:
{
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fats": number (in grams),
  "fiber": number (in grams, optional),
  "sugar": number (in grams, optional),
  "sodium": number (in mg, optional),
  "confidence": number (0-1, how confident you are in this analysis),
  "description": "cleaned up description of the food"
}

Rules:
- If portion size is unclear, assume a standard serving
- Be conservative with estimates if uncertain
- For mixed dishes, break down components
- Include confidence score based on how specific the description is
- Return only valid JSON, no additional text
`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private parseNutritionResponse(response: string, originalDescription: string): NutritionAnalysis {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const nutritionData = JSON.parse(jsonMatch[0]);

      // Validate required fields
      const requiredFields = ['calories', 'protein', 'carbs', 'fats', 'confidence'];
      for (const field of requiredFields) {
        if (typeof nutritionData[field] !== 'number') {
          throw new Error(`Missing or invalid ${field} in response`);
        }
      }

      return {
        calories: Math.round(nutritionData.calories),
        protein: Math.round(nutritionData.protein * 10) / 10,
        carbs: Math.round(nutritionData.carbs * 10) / 10,
        fats: Math.round(nutritionData.fats * 10) / 10,
        fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * 10) / 10 : undefined,
        sugar: nutritionData.sugar ? Math.round(nutritionData.sugar * 10) / 10 : undefined,
        sodium: nutritionData.sodium ? Math.round(nutritionData.sodium) : undefined,
        confidence: Math.min(Math.max(nutritionData.confidence, 0), 1),
        description: nutritionData.description || originalDescription,
      };
    } catch (error) {
      console.error('Error parsing nutrition response:', error);
      throw new Error('Failed to parse nutrition analysis. Please try again.');
    }
  }

  async batchAnalyzeFoods(requests: GeminiRequest[]): Promise<NutritionAnalysis[]> {
    const results: NutritionAnalysis[] = [];
    
    // Process in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      const batchPromises = batch.map(request => 
        this.analyzeFoodDescription(request).catch(error => {
          console.error('Batch analysis error:', error);
          return this.getFallbackNutrition(request.foodDescription);
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  private getFallbackNutrition(description: string): NutritionAnalysis {
    // Provide basic fallback nutrition estimates
    return {
      calories: 200,
      protein: 10,
      carbs: 20,
      fats: 8,
      confidence: 0.1,
      description,
    };
  }

  // Utility method to estimate calories from macros
  static calculateCaloriesFromMacros(protein: number, carbs: number, fats: number): number {
    return Math.round((protein * 4) + (carbs * 4) + (fats * 9));
  }

  // Method to validate nutrition data
  static validateNutritionData(nutrition: Partial<NutritionAnalysis>): boolean {
    if (!nutrition.calories || nutrition.calories < 0) return false;
    if (!nutrition.protein || nutrition.protein < 0) return false;
    if (!nutrition.carbs || nutrition.carbs < 0) return false;
    if (!nutrition.fats || nutrition.fats < 0) return false;
    
    // Check if calculated calories are roughly consistent with macros
    const calculatedCalories = this.calculateCaloriesFromMacros(
      nutrition.protein,
      nutrition.carbs,
      nutrition.fats
    );
    const difference = Math.abs(calculatedCalories - nutrition.calories);
    
    // Allow up to 20% difference
    return difference / nutrition.calories <= 0.2;
  }
}

export const aiService = new AIService();