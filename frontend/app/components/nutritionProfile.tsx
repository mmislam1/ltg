import type { Minerals, Nutrition, Vitamins } from "../store/features/foodSlice";
import { NUTRIENT_UNITS } from "../store/nutritionUnits";
import { IDEAL_NUTRITION } from "../nutritionDashboard/idealNutritionState";

interface NutrientBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  labelColor?: string;
}

function NutrientBar({
  label,
  current,
  target,
  unit,
  color,
  labelColor = "text-ink",
}: NutrientBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const percentageText = target > 0 ? Math.round((current / target) * 100) : 0;
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={`text-[15px] font-medium ${labelColor}`}>{label}</span>
        <div className="flex items-baseline gap-2 text-right">
          <span className="text-[13px] text-muted tabular-nums">
            {current.toFixed(1)} / {target.toFixed(1)} {unit}
          </span>
          <span className={`text-[15px] font-bold ${percentageText >= 90 && percentageText <= 110 ? "text-emerald-600" : percentageText > 110 ? "text-amber-600" : "text-muted"}`}>
            {percentageText}%
          </span>
        </div>
      </div>
      <div className="relative h-[12px] overflow-hidden rounded-full bg-brand-soft shadow-inner">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${percentage}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}

const vitamins: { key: keyof Vitamins; label: string; color: string }[] = [
  { key: "b1", label: "B1 (Thiamine)", color: "from-green-400 to-green-600" },
  { key: "b2", label: "B2 (Riboflavin)", color: "from-green-400 to-green-600" },
  { key: "b3", label: "B3 (Niacin)", color: "from-green-400 to-green-600" },
  { key: "b5", label: "B5 (Pantothenic Acid)", color: "from-green-400 to-green-600" },
  { key: "b6", label: "B6 (Pyridoxine)", color: "from-green-400 to-green-600" },
  { key: "b7", label: "B7 (Biotin)", color: "from-green-400 to-green-600" },
  { key: "b8", label: "B8 (Choline)", color: "from-green-400 to-green-600" },
  { key: "b12", label: "B12 (Cobalamin)", color: "from-green-400 to-green-600" },
  { key: "b9", label: "Folate", color: "from-green-400 to-green-600" },
  { key: "a", label: "Vitamin A", color: "from-orange-400 to-orange-600" },
  { key: "c", label: "Vitamin C", color: "from-yellow-400 to-yellow-600" },
  { key: "d", label: "Vitamin D", color: "from-amber-400 to-amber-600" },
  { key: "e", label: "Vitamin E", color: "from-red-400 to-red-600" },
  { key: "k", label: "Vitamin K", color: "from-teal-400 to-teal-600" },
];

const minerals: { key: keyof Minerals; label: string; color: string }[] = [
  { key: "calcium", label: "Calcium", color: "from-slate-400 to-slate-600" },
  { key: "copper", label: "Copper", color: "from-orange-400 to-orange-600" },
  { key: "iron", label: "Iron", color: "from-red-400 to-red-600" },
  { key: "magnesium", label: "Magnesium", color: "from-emerald-400 to-emerald-600" },
  { key: "manganese", label: "Manganese", color: "from-purple-400 to-purple-600" },
  { key: "phosphorus", label: "Phosphorus", color: "from-yellow-400 to-yellow-600" },
  { key: "potassium", label: "Potassium", color: "from-lime-400 to-lime-600" },
  { key: "selenium", label: "Selenium", color: "from-gray-400 to-gray-600" },
  { key: "sodium", label: "Sodium", color: "from-blue-400 to-blue-600" },
  { key: "zinc", label: "Zinc", color: "from-indigo-400 to-indigo-600" },
];

export default function NutritionProfile({ nutrition }: { nutrition: Nutrition }) {
  const vitaminValues = nutrition.vitamins;
  const mineralValues = nutrition.minerals;

  return (
    <div>
      <div className="card mb-8 p-4">
        <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
          <h2 className="text-xl font-bold text-ink">Macronutrients</h2>
        </div>
        <div className="grid gap-6">
          <NutrientBar label="Energy" current={nutrition.calories} target={IDEAL_NUTRITION.macros.energy} unit={NUTRIENT_UNITS.calories} color="bg-calories" labelColor="text-calories" />
          <NutrientBar label="Protein" current={nutrition.protein} target={IDEAL_NUTRITION.macros.protein} unit={NUTRIENT_UNITS.protein} color="bg-protein" labelColor="text-protein" />
          <NutrientBar label="Total Carbs" current={nutrition.carbs} target={IDEAL_NUTRITION.macros.carbs} unit={NUTRIENT_UNITS.carbs} color="bg-carbs" labelColor="text-carbs" />
          <NutrientBar label="Fiber" current={nutrition.fiber} target={IDEAL_NUTRITION.macros.fiber} unit={NUTRIENT_UNITS.fiber} color="bg-carbs" labelColor="text-carbs" />
          <NutrientBar label="Fat" current={nutrition.fats} target={IDEAL_NUTRITION.macros.fats} unit={NUTRIENT_UNITS.fats} color="bg-fat" labelColor="text-fat" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card p-4">
          <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
            <h2 className="text-xl font-bold text-ink">Vitamins</h2>
          </div>
          <div className="space-y-5">
            {vitamins.map(({ key, label, color }) => (
              <NutrientBar key={key} label={label} current={vitaminValues?.[key] ?? 0} target={IDEAL_NUTRITION.vitamins[key]} unit={NUTRIENT_UNITS.vitamins[key]} color={`bg-gradient-to-r ${color}`} />
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
            <h2 className="text-xl font-bold text-ink">Minerals</h2>
          </div>
          <div className="space-y-5">
            {minerals.map(({ key, label, color }) => (
              <NutrientBar key={key} label={label} current={mineralValues?.[key] ?? 0} target={IDEAL_NUTRITION.minerals[key]} unit={NUTRIENT_UNITS.minerals[key]} color={`bg-gradient-to-r ${color}`} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted">Values are compared with the same general daily guidelines used in the Nutrition screen.</p>
    </div>
  );
}
