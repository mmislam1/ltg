export interface DietChartMacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietChartVitaminValues {
  b1: number;
  b2: number;
  b3: number;
  b5: number;
  b6: number;
  b7: number;
  b8: number;
  b9: number;
  b12: number;
  a: number;
  c: number;
  d: number;
  e: number;
  k: number;
}

export interface DietChartMineralValues {
  calcium: number;
  copper: number;
  iron: number;
  magnesium: number;
  manganese: number;
  phosphorus: number;
  potassium: number;
  selenium: number;
  sodium: number;
  zinc: number;
}

export interface DietChartNutritionTotals extends DietChartMacroValues {
  fiber: number;
  netCarbs: number;
  vitamins: DietChartVitaminValues;
  minerals: DietChartMineralValues;
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
  totals: DietChartNutritionTotals;
  meals: DietChartMeal[];
  generatedAt: Date;
}
