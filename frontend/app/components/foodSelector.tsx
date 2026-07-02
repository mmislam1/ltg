"use client";

import { Minus, Plus, SearchIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { NUTRITION_COLORS } from "../nutritionColors";
import type { ListItems } from "../store/features/activitySlice";
import type { Food } from "../store/features/foodSlice";
import {
  NUTRIENT_UNITS,
  nutritionBasisLabel,
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

      <div
        className="no-scr divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {filteredFoods.map((food) => {
          const selected = selectedById.has(food.id);
          const quantity = quantityFor(food);
          const step = quantityStep(food.unit);
          const totalCalories = scaleNutrient(food, food.nutrition.calories, quantity);
          const macroCalories = [
            {
              label: "Protein",
              calories: scaleNutrient(food, food.nutrition.protein, quantity) * 4,
              color: NUTRITION_COLORS.protein,
            },
            {
              label: "Carbs",
              calories: scaleNutrient(food, food.nutrition.carbs, quantity) * 4,
              color: NUTRITION_COLORS.carbs,
            },
            {
              label: "Fat",
              calories: scaleNutrient(food, food.nutrition.fats, quantity) * 9,
              color: NUTRITION_COLORS.fat,
            },
          ];

          return (
            <article
              key={food.id}
              className={`relative grid gap-3 px-3 py-4 pr-16 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-4 sm:pr-16 ${selected ? "bg-brand-soft/60" : "hover:bg-canvas"}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="truncate font-semibold text-ink">{food.name}</h3>
                  <span className="text-xs text-muted">
                    Base: {nutritionBasisLabel(food)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs tabular-nums">
                  <span
                    className="rounded-full px-2 py-1 font-bold text-white"
                    style={{ backgroundColor: NUTRITION_COLORS.calories }}
                  >
                    {totalCalories.toFixed(1)} {NUTRIENT_UNITS.calories}
                  </span>
                  {macroCalories.map((macro) => (
                    <span
                      key={macro.label}
                      className="rounded-full border px-2 py-1 font-semibold"
                      style={{ borderColor: macro.color, color: macro.color }}
                    >
                      {macro.label} {macro.calories.toFixed(1)} {NUTRIENT_UNITS.calories}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 justify-self-start sm:justify-self-end">
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-icon-sm"
                  onClick={() => changeQuantity(food, Math.max(1, quantity - step))}
                  aria-label={`Decrease ${food.name} portion`}
                >
                  <Minus size={15} />
                </button>
                <label className="relative flex items-center">
                  <span className="sr-only">{food.name} portion in {food.unit}</span>
                  <input
                    type="number"
                    min="0.001"
                    step={step}
                    inputMode="decimal"
                    value={quantity}
                    onChange={(event) => changeQuantity(food, Number(event.target.value))}
                    className="form-control h-9 w-24 px-2 pr-9 text-center text-sm tabular-nums"
                    aria-label={`${food.name} portion`}
                  />
                  <span className="pointer-events-none absolute right-2 text-xs font-bold text-muted">
                    {food.unit}
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-icon-sm"
                  onClick={() => changeQuantity(food, quantity + step)}
                  aria-label={`Increase ${food.name} portion`}
                >
                  <Plus size={15} />
                </button>
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
