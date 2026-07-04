"use client";

import {
  CheckCircle2,
  ChefHat,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Back from "../components/back";
import { NUTRITION_COLORS } from "../nutritionColors";
import {
  clearFoodError,
  createRecipe,
  type Food,
  type Minerals,
  type Nutrition,
  type Vitamins,
} from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  NUTRIENT_UNITS,
  quantityStep,
  scaleNutrient,
} from "../store/nutritionUnits";

type SelectedIngredient = { food: Food; quantity: number };
type CoreKey = keyof Omit<Nutrition, "vitamins" | "minerals">;

const coreNutrients: { key: CoreKey; label: string }[] = [
  { key: "calories", label: "Calories" },
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbohydrates" },
  { key: "fiber", label: "Fiber" },
  { key: "netCarbs", label: "Net carbs" },
  { key: "fats", label: "Total fat" },
];

const vitaminLabels: Record<keyof Vitamins, string> = {
  b1: "Vitamin B1", b2: "Vitamin B2", b3: "Vitamin B3", b5: "Vitamin B5",
  b6: "Vitamin B6", b7: "Vitamin B7", b8: "Vitamin B8", b9: "Vitamin B9",
  b12: "Vitamin B12", a: "Vitamin A", c: "Vitamin C", d: "Vitamin D",
  e: "Vitamin E", k: "Vitamin K",
};

const mineralLabels: Record<keyof Minerals, string> = {
  calcium: "Calcium", copper: "Copper", iron: "Iron", magnesium: "Magnesium",
  manganese: "Manganese", phosphorus: "Phosphorus", potassium: "Potassium",
  selenium: "Selenium", sodium: "Sodium", zinc: "Zinc",
};

const emptyNutrition = (): Required<Nutrition> => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fiber: 0,
  netCarbs: 0,
  fats: 0,
  vitamins: Object.fromEntries(Object.keys(vitaminLabels).map((key) => [key, 0])) as unknown as Vitamins,
  minerals: Object.fromEntries(Object.keys(mineralLabels).map((key) => [key, 0])) as unknown as Minerals,
});

const formatValue = (value: number) =>
  value < 0.01 && value > 0 ? value.toFixed(4) : value.toFixed(1);

function NutrientDetails({
  title,
  labels,
  values,
  units,
}: {
  title: string;
  labels: Record<string, string>;
  values: Record<string, number>;
  units: Record<string, string>;
}) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold text-ink">
        {title}
        <Plus size={17} className="transition-transform group-open:rotate-45" />
      </summary>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3 px-5 pb-5 text-xs sm:grid-cols-3">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key}>
            <p className="text-muted">{label}</p>
            <p className="mt-0.5 font-bold text-ink tabular-nums">
              {formatValue(values[key] ?? 0)} {units[key]}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}

export default function CustomRecipePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { list: foods, loading, creatingRecipe, error } = useAppSelector((state) => state.foods);
  const [name, setName] = useState("");
  const [servings, setServings] = useState(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, SelectedIngredient>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/signin");
  }, [initialized, router, user]);

  useEffect(() => () => {
    dispatch(clearFoodError());
  }, [dispatch]);

  const ingredients = useMemo(() => Object.values(selected), [selected]);
  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return foods.filter((food) =>
      !selected[food.id] && (!normalized || food.name.toLowerCase().includes(normalized)),
    );
  }, [foods, query, selected]);

  const nutrition = useMemo(() => {
    const result = emptyNutrition();
    const divisor = Math.max(1, servings);
    for (const { food, quantity } of ingredients) {
      for (const { key } of coreNutrients) {
        result[key] += scaleNutrient(food, food.nutrition[key] ?? 0, quantity) / divisor;
      }
      for (const key of Object.keys(vitaminLabels) as (keyof Vitamins)[]) {
        result.vitamins[key] += scaleNutrient(food, food.nutrition.vitamins?.[key] ?? 0, quantity) / divisor;
      }
      for (const key of Object.keys(mineralLabels) as (keyof Minerals)[]) {
        result.minerals[key] += scaleNutrient(food, food.nutrition.minerals?.[key] ?? 0, quantity) / divisor;
      }
    }
    return result;
  }, [ingredients, servings]);

  const addIngredient = (food: Food) => {
    setSelected((current) => ({
      ...current,
      [food.id]: { food, quantity: food.nutritionPer },
    }));
    setSuccess(null);
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setSelected((current) => ({
      ...current,
      [foodId]: { ...current[foodId], quantity: Math.round(quantity * 1000) / 1000 },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    dispatch(clearFoodError());
    if (!name.trim()) return setFormError("Give your recipe a name.");
    if (!Number.isInteger(servings) || servings < 1) return setFormError("Servings must be a whole number of at least 1.");
    if (ingredients.length === 0) return setFormError("Add at least one ingredient.");

    try {
      const recipe = await dispatch(createRecipe({
        name: name.trim(),
        servings,
        ingredients: ingredients.map(({ food, quantity }) => ({ foodId: food.id, quantity })),
      })).unwrap();
      setSuccess(`${recipe.name} is now available in your foods.`);
      setName("");
      setServings(1);
      setSelected({});
    } catch {
      // The shared food error is rendered with the form.
    }
  };

  if (!initialized || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading recipe builder…</div>;
  }

  return (
    <div className="w-full bg-canvas pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Back />
        <header className="mb-6 mt-4 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <ChefHat size={25} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Recipe builder</p>
            <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Create a custom recipe</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Combine foods from your library. Nutrition is calculated per serving and the finished recipe becomes a food you can add to any meal.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
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

            <section className="card overflow-hidden">
              <div className="border-b border-line p-5 sm:px-6">
                <h2 className="text-lg font-bold text-ink">1. Choose ingredients</h2>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input type="search" className="form-control rounded-full pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search foods and recipes" aria-label="Search foods" />
                </div>
              </div>
              <div className="no-scr max-h-[25rem] divide-y divide-line overflow-y-auto">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{food.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{food.kind === "recipe" ? "Recipe · " : ""}{formatValue(food.nutrition.calories)} kcal per {food.nutritionPer} {food.unit}</p>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => addIngredient(food)}>
                      <Plus size={16} /> Add
                    </button>
                  </div>
                ))}
                {!loading && filteredFoods.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">No more matching foods.</p>}
                {loading && <p className="px-5 py-10 text-center text-sm text-muted">Loading foods…</p>}
              </div>
            </section>

            <section className="card overflow-hidden">
              <div className="border-b border-line p-5 sm:px-6">
                <h2 className="text-lg font-bold text-ink">2. Set batch amounts</h2>
                <p className="mt-1 text-sm text-muted">Enter the total amount used in the full recipe.</p>
              </div>
              <div className="divide-y divide-line">
                {ingredients.map(({ food, quantity }) => {
                  const step = quantityStep(food.unit);
                  return (
                    <div key={food.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap sm:px-6">
                      <div className="min-w-[10rem] flex-1">
                        <p className="truncate text-sm font-bold text-ink">{food.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{formatValue(scaleNutrient(food, food.nutrition.calories, quantity))} kcal in batch</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" className="btn btn-secondary btn-icon btn-icon-sm" onClick={() => updateQuantity(food.id, Math.max(0.001, quantity - step))} aria-label={`Decrease ${food.name}`}><Minus size={15} /></button>
                        <label className="relative">
                          <span className="sr-only">Amount of {food.name}</span>
                          <input className="form-control h-9 w-28 pr-9 text-center text-sm" type="number" min="0.001" step="any" value={quantity} onChange={(event) => updateQuantity(food.id, Number(event.target.value))} />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">{food.unit}</span>
                        </label>
                        <button type="button" className="btn btn-secondary btn-icon btn-icon-sm" onClick={() => updateQuantity(food.id, quantity + step)} aria-label={`Increase ${food.name}`}><Plus size={15} /></button>
                      </div>
                      <button type="button" className="btn btn-ghost btn-icon btn-icon-sm text-danger" onClick={() => setSelected((current) => { const next = { ...current }; delete next[food.id]; return next; })} aria-label={`Remove ${food.name}`}><Trash2 size={16} /></button>
                    </div>
                  );
                })}
                {ingredients.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">Add foods above to start your recipe.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20">
            <section className="card overflow-hidden">
              <div className="border-b border-line bg-brand-soft/50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Nutrition profile</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-bold text-ink tabular-nums">{formatValue(nutrition.calories)} <span className="text-base">kcal</span></p>
                  <p className="pb-1 text-xs font-semibold text-muted">per serving</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5">
                {[
                  { label: "Protein", value: nutrition.protein, color: NUTRITION_COLORS.protein },
                  { label: "Carbs", value: nutrition.carbs, color: NUTRITION_COLORS.carbs },
                  { label: "Fat", value: nutrition.fats, color: NUTRITION_COLORS.fat },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-xl border border-line p-3" style={{ borderTopColor: macro.color, borderTopWidth: 3 }}>
                    <p className="text-xs font-semibold text-muted">{macro.label}</p>
                    <p className="mt-1 text-sm font-bold text-ink tabular-nums">{formatValue(macro.value)} g</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-line px-5 py-4 text-xs">
                {coreNutrients.slice(3).map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-muted">{label}</p>
                    <p className="mt-0.5 font-bold text-ink">{formatValue(nutrition[key])} {NUTRIENT_UNITS[key]}</p>
                  </div>
                ))}
              </div>
              <NutrientDetails title="Vitamins" labels={vitaminLabels} values={nutrition.vitamins as unknown as Record<string, number>} units={NUTRIENT_UNITS.vitamins} />
              <NutrientDetails title="Minerals" labels={mineralLabels} values={nutrition.minerals as unknown as Record<string, number>} units={NUTRIENT_UNITS.minerals} />
            </section>

            {(formError || error) && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">{formError || error}</div>}
            {success && <div role="status" className="flex gap-2 rounded-xl border border-brand/25 bg-brand-soft px-4 py-3 text-sm text-brand-active"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{success}</div>}
            <button type="submit" disabled={creatingRecipe || ingredients.length === 0} className="btn btn-primary w-full">
              <ChefHat size={19} /> {creatingRecipe ? "Saving recipe…" : "Save recipe to foods"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
