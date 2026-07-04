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

export const nutritionBasisLabel = (food: NutritionBasis) =>
  `${food.nutritionPer} ${food.unit}`;

export const quantityStep = (unit: FoodUnit) =>
  unit === "g" || unit === "ml" ? 10 : 1;
