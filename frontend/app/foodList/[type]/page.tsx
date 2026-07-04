"use client";

import { useParams, useRouter } from "next/navigation";
import FoodSelector from "../../components/foodSelector";
import {
  type Meal,
  type MealType,
  saveMealActivity,
  upsertMeal,
} from "../../store/features/activitySlice";
import type { Food } from "../../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const isMealType = (value: unknown): value is MealType =>
  typeof value === "string" &&
  ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);

const newMeal = (mealType?: MealType): Meal => ({
  id: mealType?.toLowerCase() ?? "meal",
  mealType,
  list: [],
});

export default function FoodList() {
  const router = useRouter();
  const params = useParams();
  const foods = useAppSelector((state) => state.foods.list);
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
  const saving = useAppSelector((state) => state.activity.saving);
  const activityError = useAppSelector((state) => state.activity.error);
  const mealType = isMealType(params.type) ? params.type : undefined;
  const savedMeal = useAppSelector((state) =>
    state.activity.current.chart.meals.find((meal) => meal.mealType === mealType),
  );
  const meal = savedMeal ?? newMeal(mealType);

  const toggleFood = (food: Food, quantity: number) => {
    const selected = meal.list.some((item) => item.foodItem?.id === food.id);
    dispatch(upsertMeal({
      ...meal,
      list: selected
        ? meal.list.filter((item) => item.foodItem?.id !== food.id)
        : [...meal.list, { foodItem: food, quantity }],
    }));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    dispatch(upsertMeal({
      ...meal,
      list: meal.list.map((item) =>
        item.foodItem?.id === foodId ? { ...item, quantity } : item,
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!mealType || !selectedDate) return;
    try {
      await dispatch(saveMealActivity({ meal, date: selectedDate })).unwrap();
      router.replace("/chart");
    } catch {
      // The shared activity error is shown below.
    }
  };

  return (
    <div className="flex w-full flex-col items-center pb-24">
      <div className="w-full bg-brand px-4 py-3 text-center">
        <h2 className="text-xl font-bold text-on-brand">
          {mealType || "Select foods"}
        </h2>
      </div>

      <div className="flex w-full rounded-b-lg bg-brand">
        {['All', 'Recipes', 'Create', 'Favourites'].map((label) => (
          <button
            key={label}
            type="button"
            className="btn w-1/4 rounded-none text-xs text-on-brand hover:bg-brand-soft hover:text-brand-active md:text-base"
          >
            {label}
          </button>
        ))}
      </div>

      <FoodSelector
        foods={foods}
        selectedItems={meal.list}
        onToggle={toggleFood}
        onQuantityChange={updateQuantity}
        className="px-3 py-4 md:max-w-4xl"
      />

      {activityError && (
        <div role="alert" className="mx-3 mb-20 w-[calc(100%-1.5rem)] max-w-4xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {activityError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving > 0 || !selectedDate}
        className="btn btn-primary fixed bottom-18 left-1/2 z-50 w-77 -translate-x-1/2 rounded-full shadow-xl md:max-w-2xl"
      >
        {saving > 0 ? "Saving..." : `Done (${meal.list.length})`}
      </button>
    </div>
  );
}
