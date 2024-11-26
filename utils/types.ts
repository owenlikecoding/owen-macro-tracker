export interface Goal {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  }
  
  export interface Food {
    food_name: string;
    nf_calories: number;
    nf_protein: number;
    nf_total_fat: number;
    nf_total_carbohydrate: number;
    consumed_at: string;
  }
  
  export interface Exercise {
    exercise: string;
    duration_min: number;
    nf_calories: number;
    consumed_at: string;
  }