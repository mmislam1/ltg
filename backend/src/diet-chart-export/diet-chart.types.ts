export interface DietChartMacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietChartItem {
  name: string;
  quantity: number;
  unit: string;
  macros: DietChartMacroValues;
}

export interface DietChartMeal {
  name: string;
  items: DietChartItem[];
}

export interface DietChartDocument {
  user: {
    name: string;
    email: string;
    age: number;
    weight: number;
    weightUnit: string;
    height: number;
    heightUnit: string;
  };
  date: string;
  timezone: string;
  goals: DietChartMacroValues;
  totals: DietChartMacroValues;
  meals: DietChartMeal[];
  generatedAt: Date;
}
