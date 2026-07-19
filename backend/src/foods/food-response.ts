import { countedCalories } from './nutrition-energy';
import { FoodDocument, FoodKind, FoodUnit } from './schemas/food.schema';

export function foodToResponse(item: FoodDocument) {
  const nutritionPer = item.nutritionPer ??
    (item.unit === FoodUnit.GRAM || item.unit === FoodUnit.MILLILITER ? 100 : 1);
  const nutrition = {
    calories: countedCalories(item.nutrition),
    protein: item.nutrition.protein,
    carbs: item.nutrition.carbs,
    fiber: item.nutrition.fiber ?? 0,
    netCarbs: item.nutrition.netCarbs ?? item.nutrition.carbs,
    fats: item.nutrition.fats,
    vitamins: item.nutrition.vitamins,
    minerals: item.nutrition.minerals,
  };

  return {
    id: item.id,
    name: item.name,
    addedBy: item.addedBy,
    selectedBy: item.selectedBy,
    kind: item.kind ?? FoodKind.FOOD,
    unit: item.unit,
    nutritionPer,
    nutrition,
    recipeServings: item.recipeServings,
    ingredients: item.ingredients?.map((ingredient) => ({
      foodId: ingredient.foodId.toString(),
      quantity: ingredient.quantity,
    })),
    approved: item.approved,
  };
}
