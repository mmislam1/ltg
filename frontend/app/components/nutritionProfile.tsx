import type { Nutrition } from "../store/features/foodSlice";
import NutritionLists, { type MacroTargets } from "./nutritionLists";

export default function NutritionProfile({
  nutrition,
  macroTargets,
  waterGlasses = 0,
}: {
  nutrition: Nutrition;
  macroTargets?: MacroTargets;
  waterGlasses?: number;
}) {
  return <NutritionLists nutrition={nutrition} macroTargets={macroTargets} waterGlasses={waterGlasses} />;
}
