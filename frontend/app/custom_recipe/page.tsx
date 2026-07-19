"use client";

import { ChefHat } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Back from "../components/back";
import FoodSelector from "../components/foodSelector";
import NutritionProfile from "../components/nutritionProfile";
import type { ListItems } from "../store/features/activitySlice";
import {
  clearFoodError,
  createRecipe,
  type Food,
  type Minerals,
  type Nutrition,
  type Vitamins,
} from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { countedCalories, macroCarbGrams, scaleNutrient } from "../store/nutritionUnits";

type SelectedIngredient = { food: Food; quantity: number };
type CoreKey = keyof Omit<Nutrition, "vitamins" | "minerals">;

const coreKeys: CoreKey[] = ["calories", "protein", "carbs", "fiber", "netCarbs", "fats"];
const vitaminKeys: (keyof Vitamins)[] = ["b1", "b2", "b3", "b5", "b6", "b7", "b8", "b9", "b12", "a", "c", "d", "e", "k"];
const mineralKeys: (keyof Minerals)[] = ["calcium", "copper", "iron", "magnesium", "manganese", "phosphorus", "potassium", "selenium", "sodium", "zinc"];

const emptyNutrition = (): Required<Nutrition> => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fiber: 0,
  netCarbs: 0,
  fats: 0,
  vitamins: Object.fromEntries(vitaminKeys.map((key) => [key, 0])) as unknown as Vitamins,
  minerals: Object.fromEntries(mineralKeys.map((key) => [key, 0])) as unknown as Minerals,
});

export default function CustomRecipePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { list: foods, loading, creatingRecipe, error } = useAppSelector((state) => state.foods);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [selected, setSelected] = useState<Record<string, SelectedIngredient>>({});

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/signin");
  }, [initialized, router, user]);

  useEffect(() => () => {
    dispatch(clearFoodError());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const ingredients = useMemo(() => Object.values(selected), [selected]);
  const selectedItems = useMemo<ListItems[]>(
    () => ingredients.map(({ food, quantity }) => ({ foodItem: food, quantity })),
    [ingredients],
  );

  const nutrition = useMemo(() => {
    const result = emptyNutrition();
    const divisor = Math.max(1, servings);
    for (const { food, quantity } of ingredients) {
      for (const key of coreKeys) {
        const nutrientValue = key === "calories"
          ? countedCalories(food.nutrition)
          : key === "carbs" || key === "netCarbs"
            ? macroCarbGrams(food.nutrition)
          : food.nutrition[key] ?? 0;
        result[key] += scaleNutrient(food, nutrientValue, quantity) / divisor;
      }
      for (const key of vitaminKeys) {
        result.vitamins[key] += scaleNutrient(food, food.nutrition.vitamins?.[key] ?? 0, quantity) / divisor;
      }
      for (const key of mineralKeys) {
        result.minerals[key] += scaleNutrient(food, food.nutrition.minerals?.[key] ?? 0, quantity) / divisor;
      }
    }
    result.calories = countedCalories(result);
    return result;
  }, [ingredients, servings]);

  const toggleFood = (food: Food, quantity: number) => {
    setSelected((current) => {
      const next = { ...current };
      if (next[food.id]) delete next[food.id];
      else next[food.id] = { food, quantity };
      return next;
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    setSelected((current) => current[foodId]
      ? { ...current, [foodId]: { ...current[foodId], quantity } }
      : current);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearFoodError());
    if (!name.trim()) return toast.error("Give your recipe a name.");
    if (!Number.isInteger(servings) || servings < 1) return toast.error("Servings must be a whole number of at least 1.");
    if (ingredients.length === 0) return toast.error("Add at least one ingredient.");

    try {
      const recipe = await dispatch(createRecipe({
        name: name.trim(),
        servings,
        ingredients: ingredients.map(({ food, quantity }) => ({ foodId: food.id, quantity })),
      })).unwrap();
      toast.success(`${recipe.name} is now available in your foods.`);
      setName("");
      setServings(1);
      setSelected({});
    } catch {
      // The shared food error is shown as a toast.
    }
  };

  if (!initialized || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="w-full bg-canvas pb-24">
      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6">
        <header className="mb-6 flex items-center gap-3">
          <Back />
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Create custom recipe</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="card p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <label className="form-field">
                <span className="form-label">Recipe name</span>
                <input className="form-control" value={name} maxLength={160} onChange={(event) => setName(event.target.value)} placeholder="e.g. Sunday vegetable soup" required />
              </label>
              <label className="form-field">
                <span className="form-label">Number of servings</span>
                <input className="form-control" type="number" min="1" max="10000" step="1" value={servings} onChange={(event) => setServings(Number(event.target.value))} required />
              </label>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-ink">Choose ingredients</h2>
              <p className="mt-1 text-sm text-muted">Amounts are for the complete batch. Selected foods use the same highlighted cards and controls as the meal screen.</p>
            </div>
            <FoodSelector
              foods={foods}
              selectedItems={selectedItems}
              onToggle={toggleFood}
              onQuantityChange={updateQuantity}
              maxHeight="32rem"
            />
            {loading && <p className="mt-3 text-center text-sm text-muted">Loading foods…</p>}
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-ink">Nutrition per serving</h2>
              <p className="mt-1 text-sm text-muted">Compared with the same daily targets shown in the app’s Nutrition screen.</p>
            </div>
            <NutritionProfile
              nutrition={nutrition}
              macroTargets={{
                calories: user.dailyGoals.targetCalories,
                protein: user.dailyGoals.targetProtein,
                carbs: user.dailyGoals.targetCarb,
                netCarbs: user.dailyGoals.targetCarb,
                fats: user.dailyGoals.targetFat,
              }}
            />
          </section>

          <button type="submit" disabled={creatingRecipe || ingredients.length === 0} className="btn btn-primary w-full sm:w-auto">
            <ChefHat size={19} /> {creatingRecipe ? "Saving recipe…" : "Save recipe to foods"}
          </button>
        </form>
      </div>
    </div>
  );
}
