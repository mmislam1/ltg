import type { Minerals, Nutrition, Vitamins } from "../store/features/foodSlice";
import { NUTRIENT_UNITS } from "../store/nutritionUnits";
import { IDEAL_NUTRITION } from "../nutritionDashboard/idealNutritionState";

type MacroKey = "calories" | "protein" | "carbs" | "netCarbs" | "fiber" | "fats";

interface BaseNutrientEntry<Key extends string> {
  key: Key;
  label: string;
  unit: string;
  target: number;
  barClassName: string;
  labelClassName?: string;
}

export type MacroNutrientEntry = BaseNutrientEntry<MacroKey>;
export type VitaminNutrientEntry = BaseNutrientEntry<keyof Vitamins>;
export type MineralNutrientEntry = BaseNutrientEntry<keyof Minerals>;

export type NutritionValues = Pick<
  Nutrition,
  "calories" | "protein" | "carbs" | "fiber" | "netCarbs" | "fats"
> & {
  vitamins?: Partial<Vitamins>;
  minerals?: Partial<Minerals>;
};

export const MACRO_NUTRIENTS: MacroNutrientEntry[] = [
  {
    key: "calories",
    label: "Energy",
    target: IDEAL_NUTRITION.macros.energy,
    unit: NUTRIENT_UNITS.calories,
    barClassName: "bg-calories",
    labelClassName: "text-calories",
  },
  {
    key: "protein",
    label: "Protein",
    target: IDEAL_NUTRITION.macros.protein,
    unit: NUTRIENT_UNITS.protein,
    barClassName: "bg-protein",
    labelClassName: "text-protein",
  },
  {
    key: "carbs",
    label: "Total Carbs",
    target: IDEAL_NUTRITION.macros.carbs,
    unit: NUTRIENT_UNITS.carbs,
    barClassName: "bg-carbs",
    labelClassName: "text-carbs",
  },
  {
    key: "netCarbs",
    label: "Net Carbs",
    target: IDEAL_NUTRITION.macros.carbs,
    unit: NUTRIENT_UNITS.netCarbs,
    barClassName: "bg-carbs",
    labelClassName: "text-carbs",
  },
  {
    key: "fiber",
    label: "Fiber",
    target: IDEAL_NUTRITION.macros.fiber,
    unit: NUTRIENT_UNITS.fiber,
    barClassName: "bg-carbs",
    labelClassName: "text-carbs",
  },
  {
    key: "fats",
    label: "Fat",
    target: IDEAL_NUTRITION.macros.fats,
    unit: NUTRIENT_UNITS.fats,
    barClassName: "bg-fat",
    labelClassName: "text-fat",
  },
];

export const VITAMIN_NUTRIENTS: VitaminNutrientEntry[] = [
  { key: "b1", label: "B1 (Thiamine)", target: IDEAL_NUTRITION.vitamins.b1, unit: NUTRIENT_UNITS.vitamins.b1, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b2", label: "B2 (Riboflavin)", target: IDEAL_NUTRITION.vitamins.b2, unit: NUTRIENT_UNITS.vitamins.b2, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b3", label: "B3 (Niacin)", target: IDEAL_NUTRITION.vitamins.b3, unit: NUTRIENT_UNITS.vitamins.b3, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b5", label: "B5 (Pantothenic Acid)", target: IDEAL_NUTRITION.vitamins.b5, unit: NUTRIENT_UNITS.vitamins.b5, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b6", label: "B6 (Pyridoxine)", target: IDEAL_NUTRITION.vitamins.b6, unit: NUTRIENT_UNITS.vitamins.b6, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b7", label: "B7 (Biotin)", target: IDEAL_NUTRITION.vitamins.b7, unit: NUTRIENT_UNITS.vitamins.b7, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b8", label: "B8 (Choline)", target: IDEAL_NUTRITION.vitamins.b8, unit: NUTRIENT_UNITS.vitamins.b8, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b12", label: "B12 (Cobalamin)", target: IDEAL_NUTRITION.vitamins.b12, unit: NUTRIENT_UNITS.vitamins.b12, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "b9", label: "Folate", target: IDEAL_NUTRITION.vitamins.b9, unit: NUTRIENT_UNITS.vitamins.b9, barClassName: "bg-gradient-to-r from-green-400 to-green-600" },
  { key: "a", label: "Vitamin A", target: IDEAL_NUTRITION.vitamins.a, unit: NUTRIENT_UNITS.vitamins.a, barClassName: "bg-gradient-to-r from-orange-400 to-orange-600" },
  { key: "c", label: "Vitamin C", target: IDEAL_NUTRITION.vitamins.c, unit: NUTRIENT_UNITS.vitamins.c, barClassName: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
  { key: "d", label: "Vitamin D", target: IDEAL_NUTRITION.vitamins.d, unit: NUTRIENT_UNITS.vitamins.d, barClassName: "bg-gradient-to-r from-amber-400 to-amber-600" },
  { key: "e", label: "Vitamin E", target: IDEAL_NUTRITION.vitamins.e, unit: NUTRIENT_UNITS.vitamins.e, barClassName: "bg-gradient-to-r from-red-400 to-red-600" },
  { key: "k", label: "Vitamin K", target: IDEAL_NUTRITION.vitamins.k, unit: NUTRIENT_UNITS.vitamins.k, barClassName: "bg-gradient-to-r from-teal-400 to-teal-600" },
];

export const MINERAL_NUTRIENTS: MineralNutrientEntry[] = [
  { key: "calcium", label: "Calcium", target: IDEAL_NUTRITION.minerals.calcium, unit: NUTRIENT_UNITS.minerals.calcium, barClassName: "bg-gradient-to-r from-slate-400 to-slate-600" },
  { key: "copper", label: "Copper", target: IDEAL_NUTRITION.minerals.copper, unit: NUTRIENT_UNITS.minerals.copper, barClassName: "bg-gradient-to-r from-orange-400 to-orange-600" },
  { key: "iron", label: "Iron", target: IDEAL_NUTRITION.minerals.iron, unit: NUTRIENT_UNITS.minerals.iron, barClassName: "bg-gradient-to-r from-red-400 to-red-600" },
  { key: "magnesium", label: "Magnesium", target: IDEAL_NUTRITION.minerals.magnesium, unit: NUTRIENT_UNITS.minerals.magnesium, barClassName: "bg-gradient-to-r from-emerald-400 to-emerald-600" },
  { key: "manganese", label: "Manganese", target: IDEAL_NUTRITION.minerals.manganese, unit: NUTRIENT_UNITS.minerals.manganese, barClassName: "bg-gradient-to-r from-purple-400 to-purple-600" },
  { key: "phosphorus", label: "Phosphorus", target: IDEAL_NUTRITION.minerals.phosphorus, unit: NUTRIENT_UNITS.minerals.phosphorus, barClassName: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
  { key: "potassium", label: "Potassium", target: IDEAL_NUTRITION.minerals.potassium, unit: NUTRIENT_UNITS.minerals.potassium, barClassName: "bg-gradient-to-r from-lime-400 to-lime-600" },
  { key: "selenium", label: "Selenium", target: IDEAL_NUTRITION.minerals.selenium, unit: NUTRIENT_UNITS.minerals.selenium, barClassName: "bg-gradient-to-r from-gray-400 to-gray-600" },
  { key: "sodium", label: "Sodium", target: IDEAL_NUTRITION.minerals.sodium, unit: NUTRIENT_UNITS.minerals.sodium, barClassName: "bg-gradient-to-r from-blue-400 to-blue-600" },
  { key: "zinc", label: "Zinc", target: IDEAL_NUTRITION.minerals.zinc, unit: NUTRIENT_UNITS.minerals.zinc, barClassName: "bg-gradient-to-r from-indigo-400 to-indigo-600" },
];

const compact = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
    : "0";

function NutrientBar({
  label,
  current,
  target,
  unit,
  barClassName,
  labelClassName = "text-ink",
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  barClassName: string;
  labelClassName?: string;
}) {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const percentage = target > 0 ? Math.min((safeCurrent / target) * 100, 100) : 0;
  const percentageText = target > 0 ? Math.round((safeCurrent / target) * 100) : 0;

  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={`text-[15px] font-medium ${labelClassName}`}>{label}</span>
        <div className="flex items-baseline gap-2 text-right">
          <span className="text-[13px] text-muted tabular-nums">
            {compact(safeCurrent)} / {compact(target)} {unit}
          </span>
          <span className={`text-[15px] font-bold ${percentageText >= 90 && percentageText <= 110 ? "text-emerald-600" : percentageText > 110 ? "text-amber-600" : "text-muted"}`}>
            {percentageText}%
          </span>
        </div>
      </div>
      <div className="relative h-[12px] overflow-hidden rounded-full bg-brand-soft shadow-inner">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${barClassName}`} style={{ width: `${percentage}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function NutrientSection<Key extends string>({
  title,
  entries,
  values,
}: {
  title: string;
  entries: ReadonlyArray<BaseNutrientEntry<Key>>;
  values: Partial<Record<Key, number | undefined>>;
}) {
  return (
    <div className="card p-4">
      <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
      </div>
      <div className="space-y-5">
        {entries.map((entry) => (
          <NutrientBar
            key={entry.key}
            label={entry.label}
            current={values[entry.key] ?? 0}
            target={entry.target}
            unit={entry.unit}
            barClassName={entry.barClassName}
            labelClassName={entry.labelClassName}
          />
        ))}
      </div>
    </div>
  );
}

export default function NutritionLists({
  nutrition,
  waterGlasses = 0,
  showWater = true,
  showFooter = true,
  className = "",
}: {
  nutrition: NutritionValues;
  waterGlasses?: number;
  showWater?: boolean;
  showFooter?: boolean;
  className?: string;
}) {
  const macroValues: Record<MacroKey | "water", number> = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    netCarbs: nutrition.netCarbs,
    fiber: nutrition.fiber,
    fats: nutrition.fats,
    water: waterGlasses,
  };
  const macroEntries = showWater
    ? [
        ...MACRO_NUTRIENTS,
        {
          key: "water" as const,
          label: "Water",
          target: 8,
          unit: "glasses",
          barClassName: "bg-sky-500",
          labelClassName: "text-blue-600",
        },
      ]
    : MACRO_NUTRIENTS;

  return (
    <div className={className}>
      <NutrientSection title="Macronutrients" entries={macroEntries} values={macroValues} />

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <NutrientSection title="Vitamins" entries={VITAMIN_NUTRIENTS} values={nutrition.vitamins ?? {}} />
        <NutrientSection title="Minerals" entries={MINERAL_NUTRIENTS} values={nutrition.minerals ?? {}} />
      </div>

      {showFooter && (
        <p className="mt-8 text-center text-sm text-muted">Values are compared with the same general daily guidelines used in the Nutrition screen.</p>
      )}
    </div>
  );
}
