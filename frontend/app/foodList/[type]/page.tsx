"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import FoodSelector from "../../components/foodSelector";
import { addMeal, type Meal } from "../../store/features/activitySlice";
import type { Food } from "../../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

const isMealType = (value: unknown): value is MealType =>
  typeof value === "string" &&
  ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);

const newMeal = (mealType?: MealType): Meal => ({
  id: crypto.randomUUID(),
  mealType,
  list: [],
});

export default function FoodList() {
  const router = useRouter();
  const params = useParams();
  const foods = useAppSelector((state) => state.foods.list);
  const dispatch = useAppDispatch();
  const mealType = isMealType(params.type) ? params.type : undefined;
  const [meal, setMeal] = useState<Meal>(() => newMeal(mealType));

  const toggleFood = (food: Food, quantity: number) => {
    setMeal((current) => {
      const selected = current.list.some((item) => item.foodItem?.id === food.id);
      return {
        ...current,
        list: selected
          ? current.list.filter((item) => item.foodItem?.id !== food.id)
          : [...current.list, { foodItem: food, quantity }],
      };
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    setMeal((current) => ({
      ...current,
      list: current.list.map((item) =>
        item.foodItem?.id === foodId ? { ...item, quantity } : item,
      ),
    }));
  };

  const handleSubmit = () => {
    if (meal.list.length === 0) return;
    dispatch(addMeal(meal));
    router.replace("/chart");
    setMeal(newMeal(mealType));
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

      <button
        type="button"
        onClick={handleSubmit}
        disabled={meal.list.length === 0}
        className="btn btn-primary fixed bottom-18 left-1/2 z-50 w-77 -translate-x-1/2 rounded-full shadow-xl md:max-w-2xl"
      >
        Done ({meal.list.length})
      </button>
    </div>
  );
}
