/**
 * RDA (Recommended Daily Allowance) Service
 * Provides reference values and calculations for nutrition tracking
 */

export interface RDAValues {
  // Calories
  calories: number;
  
  // Macronutrients (grams)
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number; // No official RDA, but WHO recommends <10% of calories
  
  // Minerals (mg unless noted)
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  phosphorus: number;
  zinc: number;
  copper: number;
  manganese: number;
  selenium: number; // mcg
  iodine: number; // mcg
  
  // Fat-soluble vitamins
  vitaminA: number; // IU
  vitaminD: number; // IU
  vitaminE: number; // mg
  vitaminK: number; // mcg
  
  // Water-soluble vitamins
  vitaminC: number; // mg
  thiamine: number; // mg
  riboflavin: number; // mg
  niacin: number; // mg
  pantothenicAcid: number; // mg
  vitaminB6: number; // mg
  biotin: number; // mcg
  folate: number; // mcg
  vitaminB12: number; // mcg
  choline: number; // mg
}

export interface NutrientStatus {
  name: string;
  current: number;
  rda: number;
  percentage: number;
  unit: string;
  status: 'deficient' | 'adequate' | 'optimal' | 'excessive';
  category: 'macronutrient' | 'mineral' | 'fat-soluble-vitamin' | 'water-soluble-vitamin';
}

class RDAService {
  // RDA values for healthy adults (average of male/female recommendations)
  private readonly standardRDA: RDAValues = {
    // Calories (based on average adult needs)
    calories: 2000, // Average daily calorie needs
    
    // Macronutrients (estimated for 2000 calorie diet)
    protein: 50, // 10-35% of calories (50g = 10% of 2000 calories)
    carbohydrates: 130, // DRI minimum requirement (130g per day)
    fat: 65, // 20-35% of calories (65g = 29% of 2000 calories)
    fiber: 28, // Average of 25g (women) and 38g (men)
    sugar: 50, // WHO recommendation: <10% of calories
    
    // Minerals
    sodium: 2300, // Upper limit (AI is 1500mg)
    potassium: 4700,
    calcium: 1000,
    iron: 15, // Average of 8mg (men) and 18mg (women)
    magnesium: 350, // Average of 310mg (women) and 400mg (men)
    phosphorus: 700,
    zinc: 10, // Average of 8mg (women) and 11mg (men)
    copper: 0.9,
    manganese: 2, // Average of 1.8mg (women) and 2.3mg (men)
    selenium: 55, // mcg
    iodine: 150, // mcg
    
    // Fat-soluble vitamins
    vitaminA: 2500, // IU (average of 2300 women, 3000 men)
    vitaminD: 600, // IU
    vitaminE: 15, // mg
    vitaminK: 100, // mcg (average of 90 women, 120 men)
    
    // Water-soluble vitamins
    vitaminC: 80, // mg (average of 75 women, 90 men)
    thiamine: 1.1, // mg (average of 1.1 women, 1.2 men)
    riboflavin: 1.2, // mg (average of 1.1 women, 1.3 men)
    niacin: 15, // mg (average of 14 women, 16 men)
    pantothenicAcid: 5, // mg
    vitaminB6: 1.4, // mg (average of 1.3-1.5)
    biotin: 30, // mcg
    folate: 400, // mcg
    vitaminB12: 2.4, // mcg
    choline: 475 // mg (average of 425 women, 550 men)
  };

  /**
   * Get RDA values for all nutrients
   */
  getRDAValues(): RDAValues {
    return { ...this.standardRDA };
  }

  /**
   * Get RDA value for a specific nutrient
   */
  getRDA(nutrient: keyof RDAValues): number {
    return this.standardRDA[nutrient];
  }

  /**
   * Calculate percentage of RDA met for a nutrient
   */
  calculatePercentage(current: number, nutrient: keyof RDAValues): number {
    const rda = this.standardRDA[nutrient];
    return Math.round((current / rda) * 100);
  }

  /**
   * Determine nutrient status based on percentage of RDA
   */
  getNutrientStatus(current: number, nutrient: keyof RDAValues): NutrientStatus {
    const rda = this.standardRDA[nutrient];
    const percentage = this.calculatePercentage(current, nutrient);
    
    let status: NutrientStatus['status'];
    if (percentage < 50) {
      status = 'deficient';
    } else if (percentage < 80) {
      status = 'adequate';
    } else if (percentage <= 150) {
      status = 'optimal';
    } else {
      status = 'excessive';
    }

    // Special handling for sodium (lower is better)
    if (nutrient === 'sodium') {
      if (percentage <= 65) { // <1500mg (AI recommendation)
        status = 'optimal';
      } else if (percentage <= 100) { // <2300mg (upper limit)
        status = 'adequate';
      } else {
        status = 'excessive';
      }
    }

    // Special handling for sugar (lower is better)
    if (nutrient === 'sugar') {
      if (percentage <= 100) { // <50g (10% of calories)
        status = 'optimal';
      } else if (percentage <= 120) { // <60g 
        status = 'adequate';
      } else {
        status = 'excessive';
      }
    }

    // Special handling for calories (closer to target is better)
    if (nutrient === 'calories') {
      if (percentage < 70) {
        status = 'deficient';
      } else if (percentage < 90) {
        status = 'adequate';
      } else if (percentage <= 110) {
        status = 'optimal';
      } else {
        status = 'excessive';
      }
    }

    return {
      name: this.getNutrientDisplayName(nutrient),
      current,
      rda,
      percentage,
      unit: this.getNutrientUnit(nutrient),
      status,
      category: this.getNutrientCategory(nutrient)
    };
  }

  /**
   * Get display name for nutrient
   */
  private getNutrientDisplayName(nutrient: keyof RDAValues): string {
    const names: Record<keyof RDAValues, string> = {
      calories: 'Calories',
      protein: 'Protein',
      carbohydrates: 'Carbohydrates',
      fat: 'Fat',
      fiber: 'Fiber',
      sugar: 'Sugar',
      sodium: 'Sodium',
      potassium: 'Potassium',
      calcium: 'Calcium',
      iron: 'Iron',
      magnesium: 'Magnesium',
      phosphorus: 'Phosphorus',
      zinc: 'Zinc',
      copper: 'Copper',
      manganese: 'Manganese',
      selenium: 'Selenium',
      iodine: 'Iodine',
      vitaminA: 'Vitamin A',
      vitaminD: 'Vitamin D',
      vitaminE: 'Vitamin E',
      vitaminK: 'Vitamin K',
      vitaminC: 'Vitamin C',
      thiamine: 'Thiamine (B1)',
      riboflavin: 'Riboflavin (B2)',
      niacin: 'Niacin (B3)',
      pantothenicAcid: 'Pantothenic Acid (B5)',
      vitaminB6: 'Vitamin B6',
      biotin: 'Biotin (B7)',
      folate: 'Folate (B9)',
      vitaminB12: 'Vitamin B12',
      choline: 'Choline'
    };
    return names[nutrient];
  }

  /**
   * Get unit for nutrient
   */
  private getNutrientUnit(nutrient: keyof RDAValues): string {
    const units: Record<keyof RDAValues, string> = {
      calories: 'cal',
      protein: 'g',
      carbohydrates: 'g',
      fat: 'g',
      fiber: 'g',
      sugar: 'g',
      sodium: 'mg',
      potassium: 'mg',
      calcium: 'mg',
      iron: 'mg',
      magnesium: 'mg',
      phosphorus: 'mg',
      zinc: 'mg',
      copper: 'mg',
      manganese: 'mg',
      selenium: 'mcg',
      iodine: 'mcg',
      vitaminA: 'IU',
      vitaminD: 'IU',
      vitaminE: 'mg',
      vitaminK: 'mcg',
      vitaminC: 'mg',
      thiamine: 'mg',
      riboflavin: 'mg',
      niacin: 'mg',
      pantothenicAcid: 'mg',
      vitaminB6: 'mg',
      biotin: 'mcg',
      folate: 'mcg',
      vitaminB12: 'mcg',
      choline: 'mg'
    };
    return units[nutrient];
  }

  /**
   * Get category for nutrient
   */
  private getNutrientCategory(nutrient: keyof RDAValues): NutrientStatus['category'] {
    if (['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar'].includes(nutrient)) {
      return 'macronutrient';
    }
    if (['sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc', 'copper', 'manganese', 'selenium', 'iodine'].includes(nutrient)) {
      return 'mineral';
    }
    if (['vitaminA', 'vitaminD', 'vitaminE', 'vitaminK'].includes(nutrient)) {
      return 'fat-soluble-vitamin';
    }
    return 'water-soluble-vitamin';
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: NutrientStatus['status']): string {
    const colors = {
      deficient: 'text-red-600',
      adequate: 'text-yellow-600',
      optimal: 'text-green-600',
      excessive: 'text-orange-600'
    };
    return colors[status];
  }

  /**
   * Get progress bar color for UI
   */
  getProgressBarColor(status: NutrientStatus['status']): string {
    const colors = {
      deficient: 'bg-red-500',
      adequate: 'bg-yellow-500',
      optimal: 'bg-green-500',
      excessive: 'bg-orange-500'
    };
    return colors[status];
  }

  /**
   * Get recommendations for improving nutrient status
   */
  getRecommendations(nutrientStatus: NutrientStatus): string[] {
    const recommendations: Record<string, string[]> = {
      'Vitamin C': ['Citrus fruits, berries, bell peppers', 'Broccoli, tomatoes, leafy greens'],
      'Iron': ['Lean red meat, poultry, fish', 'Beans, lentils, fortified cereals', 'Pair with Vitamin C for better absorption'],
      'Calcium': ['Dairy products, fortified plant milks', 'Leafy greens, sardines, almonds'],
      'Vitamin D': ['Fatty fish, fortified milk', 'Egg yolks, mushrooms', 'Consider moderate sun exposure'],
      'Potassium': ['Bananas, oranges, potatoes', 'Spinach, beans, yogurt'],
      'Folate': ['Leafy greens, legumes', 'Fortified grains, citrus fruits'],
      'Magnesium': ['Nuts, seeds, whole grains', 'Dark chocolate, leafy greens'],
      'Zinc': ['Meat, shellfish, legumes', 'Nuts, seeds, dairy products']
    };

    return recommendations[nutrientStatus.name] || ['Eat a varied, balanced diet', 'Consider consulting a nutritionist'];
  }
}

// Create singleton instance
export const rdaService = new RDAService();

export default rdaService;