export enum GoalType {
  LOSE_WEIGHT = 'lose_weight',
  MAINTAIN_WEIGHT = 'maintain_weight',
  GAIN_WEIGHT = 'gain_weight',
}

export enum FormulaSex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

export enum MacroRatioKey {
  BALANCED = 'balanced',
  HIGH_PROTEIN = 'high_protein',
  LOWER_CARB = 'lower_carb',
  KETO = 'keto',
  ENDURANCE = 'endurance',
}

export const ACTIVITY_LEVEL_OPTIONS: Record<
  ActivityLevel,
  { label: string; multiplier: number }
> = {
  [ActivityLevel.SEDENTARY]: { label: 'Sedentary', multiplier: 1.2 },
  [ActivityLevel.LIGHT]: { label: 'Light', multiplier: 1.375 },
  [ActivityLevel.MODERATE]: { label: 'Moderate', multiplier: 1.55 },
  [ActivityLevel.ACTIVE]: { label: 'Active', multiplier: 1.725 },
  [ActivityLevel.VERY_ACTIVE]: { label: 'Very active', multiplier: 1.9 },
};

export const MACRO_RATIO_OPTIONS: Record<
  MacroRatioKey,
  { label: string; protein: number; carbs: number; fat: number }
> = {
  [MacroRatioKey.BALANCED]: { label: 'Balanced', protein: 30, carbs: 40, fat: 30 },
  [MacroRatioKey.HIGH_PROTEIN]: { label: 'High protein', protein: 40, carbs: 30, fat: 30 },
  [MacroRatioKey.LOWER_CARB]: { label: 'Lower carb', protein: 35, carbs: 25, fat: 40 },
  [MacroRatioKey.KETO]: { label: 'Keto', protein: 25, carbs: 5, fat: 70 },
  [MacroRatioKey.ENDURANCE]: { label: 'Endurance', protein: 20, carbs: 55, fat: 25 },
};
