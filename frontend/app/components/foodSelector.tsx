"use client";

import { Minus, Plus, SearchIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { NUTRITION_COLORS } from "../nutritionColors";
import type { ListItems } from "../store/features/activitySlice";
import type { Food } from "../store/features/foodSlice";
import {
  countedCalories,
  MACRO_CALORIES_PER_GRAM,
  macroCarbGrams,
  NUTRIENT_UNITS,
  quantityStep,
  scaleNutrient,
} from "../store/nutritionUnits";

interface FoodSelectorProps {
  foods: Food[];
  selectedItems: ListItems[];
  onToggle: (food: Food, quantity: number) => void;
  onQuantityChange: (foodId: string, quantity: number) => void;
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
}

const validQuantity = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? Math.round(value * 1000) / 1000 : fallback;

export default function FoodSelector({
  foods,
  selectedItems,
  onToggle,
  onQuantityChange,
  className = "",
  maxHeight,
  showSearch = true,
}: FoodSelectorProps) {
  const [query, setQuery] = useState("");
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});
  const searchId = useId();

  const selectedById = useMemo(
    () => new Map(
      selectedItems
        .filter((item): item is ListItems & { foodItem: Food } => Boolean(item.foodItem))
        .map((item) => [item.foodItem.id, item]),
    ),
    [selectedItems],
  );

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return foods;
    return foods.filter((food) => food.name.toLowerCase().includes(normalizedQuery));
  }, [foods, query]);

  const quantityFor = (food: Food) =>
    selectedById.get(food.id)?.quantity ?? draftQuantities[food.id] ?? food.nutritionPer;

  const changeQuantity = (food: Food, nextValue: number) => {
    const quantity = validQuantity(nextValue, quantityFor(food));
    setDraftQuantities((current) => ({ ...current, [food.id]: quantity }));
    if (selectedById.has(food.id)) onQuantityChange(food.id, quantity);
  };

  return (
    <section className={`w-full ${className}`} aria-label="Food selector">
      {showSearch && (
        <div className="relative mb-3 w-full">
          <label className="sr-only" htmlFor={searchId}>Search foods</label>
          <SearchIcon
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={19}
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            className="form-control rounded-full pl-11"
            placeholder="Search foods"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}

      <div
        className="no-scr divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {filteredFoods.map((food) => {
          const selected = selectedById.has(food.id);
          const quantity = quantityFor(food);
          const step = quantityStep(food.unit);
          const totalCalories = scaleNutrient(food, countedCalories(food.nutrition), quantity);
          const macroCalories = [
            {
              label: "Protein",
              calories: scaleNutrient(food, food.nutrition.protein, quantity) * MACRO_CALORIES_PER_GRAM.protein,
              color: NUTRITION_COLORS.protein,
            },
            {
              label: "Net carbs",
              calories: scaleNutrient(food, macroCarbGrams(food.nutrition), quantity) * MACRO_CALORIES_PER_GRAM.carbs,
              color: NUTRITION_COLORS.carbs,
            },
            {
              label: "Fat",
              calories: scaleNutrient(food, food.nutrition.fats, quantity) * MACRO_CALORIES_PER_GRAM.fats,
              color: NUTRITION_COLORS.fat,
            },
          ];

          return (
            <article
              key={food.id}
              className={`relative px-3 py-3 pr-16 transition-colors sm:px-4 sm:pr-16 ${selected ? "bg-brand-soft/60" : "hover:bg-canvas"}`}
            >
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink">{food.name}</h3>

                <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:bg-brand-soft"
                      onClick={() => changeQuantity(food, Math.max(1, quantity - step))}
                      aria-label={`Decrease ${food.name} portion`}
                    >
                      <Minus size={13} />
                    </button>
                    <label className="relative flex items-center">
                      <span className="sr-only">{food.name} portion in {food.unit}</span>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        inputMode="decimal"
                        value={quantity}
                        onChange={(event) => changeQuantity(food, Number(event.target.value))}
                        className="h-7 w-20 rounded-md border border-line bg-surface px-1.5 pr-7 text-center text-xs text-ink tabular-nums outline-none focus:border-brand"
                        aria-label={`${food.name} portion`}
                      />
                      <span className="pointer-events-none absolute right-1.5 text-[10px] font-bold text-muted">
                        {food.unit}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:bg-brand-soft"
                      onClick={() => changeQuantity(food, quantity + step)}
                      aria-label={`Increase ${food.name} portion`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="truncate text-right text-base font-bold text-ink tabular-nums">
                    {totalCalories.toFixed(1)} {NUTRIENT_UNITS.calories}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-line/70 pt-2 text-xs tabular-nums">
                  {macroCalories.map((macro) => (
                    <div key={macro.label} className="min-w-0 border-l-2 pl-2" style={{ borderColor: macro.color }}>
                      <div className="truncate font-semibold" style={{ color: macro.color }}>
                        {macro.label}
                      </div>
                      <div className="truncate font-bold text-ink">
                        {macro.calories.toFixed(1)} {NUTRIENT_UNITS.calories}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggle(food, quantity)}
                className={`btn btn-icon absolute right-3 top-1/2 -translate-y-1/2 ${selected ? "btn-danger" : "btn-primary"}`}
                aria-label={selected ? `Remove ${food.name}` : `Add ${food.name}`}
                aria-pressed={selected}
              >
                <Plus
                  size={21}
                  className={`transition-transform ${selected ? "rotate-45" : ""}`}
                />
              </button>
            </article>
          );
        })}

        {filteredFoods.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted">No foods found.</p>
        )}
      </div>
    </section>
  );
}
