import { BadRequestException, Injectable } from '@nestjs/common';
import { HeightUnit, UserGoal, WeightUnit } from '../users/schemas/user.schema';
import { GoalPreviewDto } from './dto/goal-preview.dto';
import {
  ACTIVITY_LEVEL_OPTIONS,
  ActivityLevel,
  FormulaSex,
  GoalType,
  MACRO_RATIO_OPTIONS,
  MacroRatioKey,
} from './goals.types';

const KG_PER_LB = 0.45359237;
const KCAL_PER_KG = 7700;
const MIN_TARGET_CALORIES = 500;
const MAX_TARGET_CALORIES = 10_000;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

interface GoalPatch {
  goal_type?: GoalType;
  target_weight?: number;
  target_weight_unit?: WeightUnit;
  duration_weeks?: number;
  activity_level?: ActivityLevel;
  formula_sex?: FormulaSex;
  macro_ratio?: MacroRatioKey;
}

interface GoalProfileInput {
  age: number;
  weight: number;
  weightUnit: WeightUnit;
  heightCm: number;
  currentGoal?: UserGoal | null;
  patch: GoalPatch;
}

interface GoalSettings {
  goalType: GoalType;
  targetWeight: number;
  targetWeightUnit: WeightUnit;
  durationWeeks: number;
  activityLevel: ActivityLevel;
  formulaSex: FormulaSex;
  macroRatio: MacroRatioKey;
}

interface DailyTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

interface CalculatedGoal {
  goal: UserGoal;
  targets: DailyTargets;
  warnings: string[];
}

@Injectable()
export class GoalsService {
  options() {
    return {
      activity_levels: Object.entries(ACTIVITY_LEVEL_OPTIONS).map(([value, option]) => ({
        value,
        label: option.label,
        multiplier: option.multiplier,
      })),
      macro_ratios: Object.entries(MACRO_RATIO_OPTIONS).map(([value, option]) => ({
        value,
        label: option.label,
        protein: option.protein,
        carbs: option.carbs,
        fat: option.fat,
      })),
    };
  }

  preview(dto: GoalPreviewDto) {
    const calculated = this.calculate({
      age: dto.age,
      weight: dto.weight,
      weightUnit: dto.weight_unit,
      heightCm: this.heightToCentimeters(dto.height, dto.height_unit, dto.height_inches),
      settings: {
        goalType: dto.goal_type,
        targetWeight: dto.target_weight,
        targetWeightUnit: dto.target_weight_unit,
        durationWeeks: dto.duration_weeks,
        activityLevel: dto.activity_level,
        formulaSex: dto.formula_sex,
        macroRatio: dto.macro_ratio,
      },
    });

    return this.calculationResponse(calculated, dto.target_weight_unit);
  }

  hasGoalPatch(patch: GoalPatch) {
    return Object.values(patch).some((value) => value !== undefined);
  }

  buildGoalForProfile(input: GoalProfileInput): CalculatedGoal | null {
    if (!this.hasGoalPatch(input.patch)) return null;

    const settings = this.resolveSettings(input.patch, input);
    return this.calculate({
      age: input.age,
      weight: input.weight,
      weightUnit: input.weightUnit,
      heightCm: input.heightCm,
      settings,
      currentGoal: input.currentGoal,
    });
  }

  goalResponse(goal: UserGoal | null | undefined, weightUnit: WeightUnit) {
    if (!goal) return null;

    return {
      goal_type: goal.goalType,
      target_weight: this.round(this.kgToWeight(goal.targetWeightKg, weightUnit), 1),
      target_weight_unit: weightUnit,
      duration_weeks: goal.durationWeeks,
      activity_level: goal.activityLevel,
      formula_sex: goal.formulaSex,
      macro_ratio: goal.macroRatio,
      suggested_calories: goal.suggestedCalories,
      bmr: goal.bmr,
      tdee: goal.tdee,
      calorie_adjustment: goal.calorieAdjustment,
      target_date: this.dateToIso(goal.targetDate),
      warnings: this.goalWarnings(goal),
    };
  }

  calculationResponse(calculated: CalculatedGoal, weightUnit: WeightUnit) {
    return {
      goal: {
        ...this.goalResponse(calculated.goal, weightUnit),
        warnings: calculated.warnings,
      },
      daily_goals: {
        target_calories: calculated.targets.targetCalories,
        target_protein: calculated.targets.targetProtein,
        target_carbs: calculated.targets.targetCarbs,
        target_fat: calculated.targets.targetFat,
      },
    };
  }

  private resolveSettings(patch: GoalPatch, input: GoalProfileInput): GoalSettings {
    const targetWeightUnit = patch.target_weight_unit ?? input.weightUnit;
    const currentGoal = input.currentGoal;
    const targetWeight =
      patch.target_weight ??
      (currentGoal
        ? this.kgToWeight(currentGoal.targetWeightKg, targetWeightUnit)
        : input.weight);

    const settings: GoalSettings = {
      goalType: patch.goal_type ?? currentGoal?.goalType,
      targetWeight,
      targetWeightUnit,
      durationWeeks: patch.duration_weeks ?? currentGoal?.durationWeeks,
      activityLevel: patch.activity_level ?? currentGoal?.activityLevel,
      formulaSex: patch.formula_sex ?? currentGoal?.formulaSex,
      macroRatio: patch.macro_ratio ?? currentGoal?.macroRatio,
    } as GoalSettings;

    this.assertCompleteSettings(settings);
    return settings;
  }

  private assertCompleteSettings(settings: Partial<GoalSettings>): asserts settings is GoalSettings {
    const errors: Record<string, string[]> = {};
    if (!settings.goalType) errors.goal_type = ['Select a goal.'];
    if (!Number.isFinite(settings.targetWeight)) {
      errors.target_weight = ['Enter a target weight.'];
    }
    if (!settings.targetWeightUnit) errors.target_weight_unit = ['Select a target weight unit.'];
    if (!Number.isFinite(settings.durationWeeks)) {
      errors.duration_weeks = ['Enter a duration.'];
    }
    if (!settings.activityLevel) errors.activity_level = ['Select an activity level.'];
    if (!settings.formulaSex) errors.formula_sex = ['Select the sex used by the formula.'];
    if (!settings.macroRatio) errors.macro_ratio = ['Select a macro ratio.'];

    if (Object.keys(errors).length) {
      throw new BadRequestException({
        message: 'Please correct the highlighted fields.',
        errors,
      });
    }
  }

  private calculate({
    age,
    weight,
    weightUnit,
    heightCm,
    settings,
    currentGoal,
  }: {
    age: number;
    weight: number;
    weightUnit: WeightUnit;
    heightCm: number;
    settings: GoalSettings;
    currentGoal?: UserGoal | null;
  }): CalculatedGoal {
    const currentWeightKg = this.weightToKg(weight, weightUnit);
    const targetWeightKg =
      settings.goalType === GoalType.MAINTAIN_WEIGHT
        ? currentWeightKg
        : this.weightToKg(settings.targetWeight, settings.targetWeightUnit);

    this.assertGoalDirection(settings.goalType, currentWeightKg, targetWeightKg);

    const sexOffset = settings.formulaSex === FormulaSex.MALE ? 5 : -161;
    const bmr = this.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age + sexOffset);
    const tdee = this.round(bmr * ACTIVITY_LEVEL_OPTIONS[settings.activityLevel].multiplier);
    const dailyAdjustment =
      settings.goalType === GoalType.MAINTAIN_WEIGHT
        ? 0
        : ((targetWeightKg - currentWeightKg) * KCAL_PER_KG) / (settings.durationWeeks * 7);
    const rawCalories = tdee + dailyAdjustment;
    const suggestedCalories = this.clamp(
      Math.round(rawCalories),
      MIN_TARGET_CALORIES,
      MAX_TARGET_CALORIES,
    );
    const targets = this.targetsFromRatio(suggestedCalories, settings.macroRatio);
    const now = new Date();
    const startedAt = currentGoal?.startedAt ? new Date(currentGoal.startedAt) : now;
    const goal: UserGoal = {
      goalType: settings.goalType,
      targetWeightKg: this.round(targetWeightKg, 2),
      durationWeeks: settings.durationWeeks,
      activityLevel: settings.activityLevel,
      formulaSex: settings.formulaSex,
      macroRatio: settings.macroRatio,
      suggestedCalories,
      bmr,
      tdee,
      calorieAdjustment: this.round(dailyAdjustment),
      startedAt,
      targetDate: new Date(now.getTime() + settings.durationWeeks * MS_PER_WEEK),
      updatedAt: now,
    };

    return { goal, targets, warnings: this.goalWarnings(goal, rawCalories) };
  }

  private assertGoalDirection(
    goalType: GoalType,
    currentWeightKg: number,
    targetWeightKg: number,
  ) {
    if (goalType === GoalType.LOSE_WEIGHT && targetWeightKg >= currentWeightKg) {
      throw new BadRequestException({
        message: 'Please correct the highlighted fields.',
        errors: {
          target_weight: ['Target weight must be below current weight for weight loss.'],
        },
      });
    }

    if (goalType === GoalType.GAIN_WEIGHT && targetWeightKg <= currentWeightKg) {
      throw new BadRequestException({
        message: 'Please correct the highlighted fields.',
        errors: {
          target_weight: ['Target weight must be above current weight for weight gain.'],
        },
      });
    }
  }

  private targetsFromRatio(calories: number, macroRatio: MacroRatioKey): DailyTargets {
    const ratio = MACRO_RATIO_OPTIONS[macroRatio];

    return {
      targetCalories: calories,
      targetProtein: Math.round((calories * (ratio.protein / 100)) / 4),
      targetCarbs: Math.round((calories * (ratio.carbs / 100)) / 4),
      targetFat: Math.round((calories * (ratio.fat / 100)) / 9),
    };
  }

  private goalWarnings(goal: UserGoal, rawCalories = goal.suggestedCalories) {
    const warnings: string[] = [];

    if (Math.abs(goal.calorieAdjustment) > 1000) {
      warnings.push('This goal needs a large daily calorie change; a longer duration may be easier to sustain.');
    }

    if (rawCalories !== goal.suggestedCalories) {
      warnings.push('The calculated calorie target was adjusted to stay within the app range.');
    }

    return warnings;
  }

  private heightToCentimeters(
    height: number,
    heightUnit: HeightUnit,
    heightInches?: number,
  ) {
    if (heightUnit === HeightUnit.FT) {
      if (heightInches === undefined) {
        return this.legacyFeetToCentimeters(height);
      }
      return this.round((height * 12 + (heightInches ?? 0)) * 2.54, 2);
    }

    return this.round(height, 2);
  }

  private legacyFeetToCentimeters(height: number) {
    const feet = Math.trunc(height);
    const inchesText = height.toString().split('.')[1];
    const inches = inchesText ? Number(inchesText) : 0;

    if (Number.isFinite(inches) && inches >= 0 && inches < 12) {
      return this.round((feet * 12 + inches) * 2.54, 2);
    }

    return this.round(height * 30.48, 2);
  }

  private weightToKg(weight: number, unit: WeightUnit) {
    return unit === WeightUnit.LB ? weight * KG_PER_LB : weight;
  }

  private kgToWeight(weightKg: number, unit: WeightUnit) {
    return unit === WeightUnit.LB ? weightKg / KG_PER_LB : weightKg;
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  private round(value: number, decimals = 0) {
    return Number(value.toFixed(decimals));
  }

  private dateToIso(value: Date) {
    return new Date(value).toISOString();
  }
}
