export const FOOD_UNITS = ["g", "ml", "pc", "slice"] as const;
export type FoodUnit = (typeof FOOD_UNITS)[number];

export type NutrientUnit = "kcal" | "g" | "mg" | "µg" | "µg RAE" | "IU";

export const NUTRIENT_UNITS = {
  calories: "kcal",
  protein: "g",
  carbs: "g",
  fiber: "g",
  netCarbs: "g",
  fats: "g",
  vitamins: {
    b1: "mg",
    b2: "mg",
    b3: "mg",
    b5: "mg",
    b6: "mg",
    b7: "µg",
    b8: "mg",
    b9: "µg",
    b12: "µg",
    a: "µg RAE",
    c: "mg",
    d: "IU",
    e: "mg",
    k: "µg",
  },
  minerals: {
    calcium: "mg",
    copper: "mg",
    iron: "mg",
    magnesium: "mg",
    manganese: "mg",
    phosphorus: "mg",
    potassium: "mg",
    selenium: "µg",
    sodium: "mg",
    zinc: "mg",
  },
} as const satisfies Record<string, NutrientUnit | Record<string, NutrientUnit>>;

export interface NutritionBasis {
  unit: FoodUnit;
  nutritionPer: number;
}

export const nutritionMultiplier = (food: NutritionBasis, quantity: number) =>
  quantity / food.nutritionPer;

export const scaleNutrient = (
  food: NutritionBasis,
  nutrientValue: number,
  quantity: number,
) => nutrientValue * nutritionMultiplier(food, quantity);

export interface MacroEnergyValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fiber?: number;
  netCarbs?: number;
  fats?: number;
}

export const MACRO_CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

const finiteNutrient = (value: number | undefined) =>
  Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;

export const macroCarbGrams = (nutrition: MacroEnergyValues) => {
  if (Number.isFinite(nutrition.carbs)) return finiteNutrient(nutrition.carbs);
  if (Number.isFinite(nutrition.netCarbs)) return finiteNutrient(nutrition.netCarbs);
  return Math.max(
    finiteNutrient(nutrition.carbs) - finiteNutrient(nutrition.fiber),
    0,
  );
};

export const caloriesFromMacros = (nutrition: MacroEnergyValues) =>
  finiteNutrient(nutrition.protein) * MACRO_CALORIES_PER_GRAM.protein +
  macroCarbGrams(nutrition) * MACRO_CALORIES_PER_GRAM.carbs +
  finiteNutrient(nutrition.fats) * MACRO_CALORIES_PER_GRAM.fats;

export const countedCalories = (nutrition: MacroEnergyValues) =>
  Math.max(finiteNutrient(nutrition.calories), caloriesFromMacros(nutrition));

export const nutritionBasisLabel = (food: NutritionBasis) =>
  `${food.nutritionPer} ${food.unit}`;

export const quantityStep = (unit: FoodUnit) =>
  unit === "g" || unit === "ml" ? 10 : 1;
