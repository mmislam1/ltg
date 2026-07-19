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
