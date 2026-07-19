"use client";

import { SearchIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FoodSelector from "../../components/foodSelector";
import {
  type Meal,
  type MealType,
  saveMealActivity,
  upsertMeal,
} from "../../store/features/activitySlice";
import { fetchFoods, type Food } from "../../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const isMealType = (value: unknown): value is MealType =>
  typeof value === "string" &&
  ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);

const newMeal = (mealType?: MealType): Meal => ({
  id: mealType?.toLowerCase() ?? "meal",
  mealType,
  list: [],
});

type FoodFilter = "all" | "recipes" | "favourites";

const filterButtons: Array<{ label: string; value: FoodFilter | "create" }> = [
  { label: "All", value: "all" },
  { label: "Recipes", value: "recipes" },
  { label: "Create", value: "create" },
  { label: "Favourites", value: "favourites" },
];

export default function FoodList() {
  const router = useRouter();
  const params = useParams();
  const foods = useAppSelector((state) => state.foods.list);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FoodFilter>("all");
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
  const saving = useAppSelector((state) => state.activity.saving);
  const activityError = useAppSelector((state) => state.activity.error);
  const mealType = isMealType(params.type) ? params.type : undefined;
  const savedMeal = useAppSelector((state) =>
    state.activity.current.chart.meals.find((meal) => meal.mealType === mealType),
  );
  const meal = savedMeal ?? newMeal(mealType);

  useEffect(() => {
    if (activityError) toast.error(activityError);
  }, [activityError]);

  useEffect(() => {
    void dispatch(fetchFoods());
  }, [dispatch]);

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextFoods = foods.filter((food) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "recipes" && food.kind === "recipe") ||
        (activeFilter === "favourites" && food.selectedBy > 0);
      const matchesQuery =
        !normalizedQuery || food.name.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    if (activeFilter === "favourites") {
      return [...nextFoods].sort((first, second) => second.selectedBy - first.selectedBy);
    }

    return nextFoods;
  }, [activeFilter, foods, query]);

  const handleFilterClick = (value: FoodFilter | "create") => {
    if (value === "create") {
      router.push("/custom-food");
      return;
    }

    setActiveFilter(value);
  };

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
      router.replace("/diary");
    } catch {
      // The shared activity error is shown below.
    }
  };

  return (
    <div className="food-list-bottom-space flex w-full flex-col items-center">
      <div className="w-full bg-brand px-4 py-3 text-center">
        <h2 className="text-xl font-bold text-on-brand">
          {mealType || "Select foods"}
        </h2>

        <div className="relative mx-auto mt-3 w-full max-w-4xl">
          <label className="sr-only" htmlFor="food-list-search">Search foods</label>
          <SearchIcon
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={19}
            aria-hidden="true"
          />
          <input
            id="food-list-search"
            type="search"
            className="form-control rounded-full border-transparent bg-surface pl-11 text-left shadow-sm"
            placeholder="Search foods"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="flex w-full rounded-b-lg bg-brand">
        {filterButtons.map(({ label, value }) => {
          const active = value !== "create" && activeFilter === value;

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleFilterClick(value)}
              className={`btn w-1/4 rounded-none text-xs md:text-base ${
                active
                  ? "bg-surface text-brand-active"
                  : "text-on-brand hover:bg-brand-soft hover:text-brand-active"
              }`}
              aria-pressed={value === "create" ? undefined : active}
            >
              {label}
            </button>
          );
        })}
      </div>

      <FoodSelector
        foods={filteredFoods}
        selectedItems={meal.list}
        onToggle={toggleFood}
        onQuantityChange={updateQuantity}
        className="px-3 py-4 md:max-w-4xl"
        showSearch={false}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving > 0 || !selectedDate}
        className="food-list-done-button btn btn-primary fixed left-1/2 z-50 -translate-x-1/2 rounded-full shadow-xl"
      >
        {saving > 0 ? "Saving..." : `Done (${meal.list.length})`}
      </button>
    </div>
  );
}
