import type { Nutrition } from "../store/features/foodSlice";
import NutritionLists from "./nutritionLists";

export default function NutritionProfile({
  nutrition,
  waterGlasses = 0,
}: {
  nutrition: Nutrition;
  waterGlasses?: number;
}) {
  return <NutritionLists nutrition={nutrition} waterGlasses={waterGlasses} />;
}
