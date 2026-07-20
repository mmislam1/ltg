"use client";

import {
  Check,
  Edit3,
  Plus,
  Save,
  SearchIcon,
  ShieldCheck,
  ShieldX,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FoodSelector from "../../components/foodSelector";
import {
  type Meal,
  type MealType,
  saveMealActivity,
  upsertMeal,
} from "../../store/features/activitySlice";
import {
  approveFood,
  cancelFoodApproval,
  deleteFood,
  fetchFoods,
  fetchPendingFoods,
  type CreateFoodInput,
  type CreateRecipeInput,
  type Food,
  updateFood,
  updateRecipe,
} from "../../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { countedCalories, FOOD_UNITS, type FoodUnit } from "../../store/nutritionUnits";

const isMealType = (value: unknown): value is MealType =>
  typeof value === "string" &&
  ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);

const newMeal = (mealType?: MealType): Meal => ({
  id: mealType?.toLowerCase() ?? "meal",
  mealType,
  list: [],
});

type FoodFilter = "all" | "foods" | "recipes" | "pending" | "favourites";
type FilterButtonValue = FoodFilter | "create";

const mealFilterButtons: Array<{ label: string; value: FilterButtonValue }> = [
  { label: "All", value: "all" },
  { label: "Recipes", value: "recipes" },
  { label: "Create", value: "create" },
  { label: "Favourites", value: "favourites" },
];

const adminFilterButtons: Array<{ label: string; value: FilterButtonValue }> = [
  { label: "All", value: "all" },
  { label: "Foods", value: "foods" },
  { label: "Recipes", value: "recipes" },
  { label: "Pending", value: "pending" },
];

const unitNames: Record<FoodUnit, string> = {
  g: "grams (g)",
  ml: "milliliters (ml)",
  pc: "piece (pc)",
  slice: "slice",
};

const nutrientFields = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "netCarbs", label: "Net carbs", unit: "g" },
  { key: "fats", label: "Total fat", unit: "g" },
] as const;

type NutrientDraftKey = (typeof nutrientFields)[number]["key"];

interface FoodDraft {
  name: string;
  unit: FoodUnit;
  nutritionPer: string;
  nutrition: Record<NutrientDraftKey, string>;
}

interface RecipeDraft {
  name: string;
  servings: string;
  ingredients: Array<{ foodId: string; quantity: string }>;
}

const foodDraftFromFood = (food: Food): FoodDraft => ({
  name: food.name,
  unit: food.unit,
  nutritionPer: String(food.nutritionPer),
  nutrition: {
    calories: String(food.nutrition.calories),
    protein: String(food.nutrition.protein),
    fiber: String(food.nutrition.fiber),
    netCarbs: String(food.nutrition.netCarbs),
    fats: String(food.nutrition.fats),
  },
});

const recipeDraftFromFood = (food: Food): RecipeDraft => ({
  name: food.name,
  servings: String(food.recipeServings ?? 1),
  ingredients: (food.ingredients ?? []).map((ingredient) => ({
    foodId: ingredient.foodId,
    quantity: String(ingredient.quantity),
  })),
});

const validNumber = (value: string, min = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min ? parsed : null;
};

const foodPayloadFromDraft = (draft: FoodDraft, original: Food): CreateFoodInput | null => {
  const name = draft.name.trim();
  const nutritionPer = validNumber(draft.nutritionPer, 0.001);
  const nutritionValues = Object.fromEntries(
    nutrientFields.map(({ key }) => [key, validNumber(draft.nutrition[key])]),
  ) as Record<NutrientDraftKey, number | null>;

  if (!name || !nutritionPer || Object.values(nutritionValues).some((value) => value === null)) {
    return null;
  }

  const nutrition = {
    ...original.nutrition,
    calories: nutritionValues.calories!,
    protein: nutritionValues.protein!,
    fiber: nutritionValues.fiber!,
    carbs: nutritionValues.netCarbs!,
    netCarbs: nutritionValues.netCarbs!,
    fats: nutritionValues.fats!,
  };

  return {
    name,
    unit: draft.unit,
    nutritionPer,
    nutrition: {
      ...nutrition,
      calories: countedCalories(nutrition),
    },
  };
};

const recipePayloadFromDraft = (draft: RecipeDraft): CreateRecipeInput | null => {
  const name = draft.name.trim();
  const servings = Number(draft.servings);
  const ingredientIds = new Set<string>();

  if (!name || !Number.isInteger(servings) || servings < 1) return null;
  if (draft.ingredients.length === 0) return null;

  const ingredients = draft.ingredients.map((ingredient) => {
    const quantity = validNumber(ingredient.quantity, 0.001);
    if (!ingredient.foodId || !quantity || ingredientIds.has(ingredient.foodId)) return null;
    ingredientIds.add(ingredient.foodId);
    return { foodId: ingredient.foodId, quantity };
  });

  if (ingredients.some((ingredient) => ingredient === null)) return null;
  return { name, servings, ingredients: ingredients as CreateRecipeInput["ingredients"] };
};

export default function FoodList() {
  const router = useRouter();
  const params = useParams();
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const manageMode = typeParam === "manage";
  const {
    list: foods,
    pending,
    loading,
    pendingLoading,
    deletingIds,
    approvingIds,
    updatingIds,
    error,
    pendingError,
  } = useAppSelector((state) => state.foods);
  const { user, initialized } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FoodFilter>("all");
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodDraft | null>(null);
  const [recipeDraft, setRecipeDraft] = useState<RecipeDraft | null>(null);
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
  const saving = useAppSelector((state) => state.activity.saving);
  const activityError = useAppSelector((state) => state.activity.error);
  const mealType = !manageMode && isMealType(typeParam) ? typeParam : undefined;
  const savedMeal = useAppSelector((state) =>
    state.activity.current.chart.meals.find((meal) => meal.mealType === mealType),
  );
  const meal = savedMeal ?? newMeal(mealType);
  const filterButtons = manageMode ? adminFilterButtons : mealFilterButtons;
  const activeFilter = filterButtons.some((button) => button.value === selectedFilter)
    ? selectedFilter
    : "all";

  useEffect(() => {
    if (activityError) toast.error(activityError);
  }, [activityError]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (pendingError) toast.error(pendingError);
  }, [pendingError]);

  useEffect(() => {
    if (!manageMode) {
      void dispatch(fetchFoods());
      return;
    }

    if (!initialized) return;
    if (!user) {
      router.replace("/auth/signin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    void dispatch(fetchFoods());
    void dispatch(fetchPendingFoods());
  }, [dispatch, initialized, manageMode, router, user]);

  const managedFoods = useMemo(() => {
    const byId = new Map<string, Food>();
    [...foods, ...pending].forEach((food) => byId.set(food.id, food));
    return [...byId.values()].sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [foods, pending]);

  const foodById = useMemo(
    () => new Map(managedFoods.map((food) => [food.id, food])),
    [managedFoods],
  );

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sourceFoods = manageMode ? managedFoods : foods;

    const nextFoods = sourceFoods.filter((food) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "foods" && food.kind === "food") ||
        (activeFilter === "recipes" && food.kind === "recipe") ||
        (activeFilter === "pending" && !food.approved) ||
        (activeFilter === "favourites" && food.selectedBy > 0);
      const matchesQuery =
        !normalizedQuery || food.name.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    if (activeFilter === "favourites") {
      return [...nextFoods].sort((first, second) => second.selectedBy - first.selectedBy);
    }

    return nextFoods;
  }, [activeFilter, foods, managedFoods, manageMode, query]);

  const handleFilterClick = (value: FilterButtonValue) => {
    if (value === "create") {
      router.push("/custom-food");
      return;
    }

    setSelectedFilter(value);
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

  const resetEditor = () => {
    setEditingFoodId(null);
    setFoodDraft(null);
    setRecipeDraft(null);
  };

  const startEditing = (food: Food) => {
    setEditingFoodId(food.id);
    setFoodDraft(food.kind === "food" ? foodDraftFromFood(food) : null);
    setRecipeDraft(food.kind === "recipe" ? recipeDraftFromFood(food) : null);
  };

  const requestDeleteFood = (food: Food) => {
    const toastId = toast.warning(`Delete ${food.name}?`, {
      description: "This removes the item from the food library and approval queue.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: () => {
          toast.dismiss(toastId);
          void dispatch(deleteFood(food.id))
            .unwrap()
            .then(() => {
              if (editingFoodId === food.id) resetEditor();
              toast.success(`${food.name} deleted.`);
            })
            .catch(() => {});
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(toastId),
      },
    });
  };

  const toggleApproval = async (food: Food) => {
    try {
      const updated = food.approved
        ? await dispatch(cancelFoodApproval(food.id)).unwrap()
        : await dispatch(approveFood(food.id)).unwrap();
      toast.success(
        updated.approved
          ? `${updated.name} is approved.`
          : `${updated.name} is back in pending approval.`,
      );
    } catch {
      // The shared food error is shown as a toast.
    }
  };

  const submitFoodEdit = async (event: FormEvent<HTMLFormElement>, food: Food) => {
    event.preventDefault();
    if (!foodDraft) return;

    const payload = foodPayloadFromDraft(foodDraft, food);
    if (!payload) {
      toast.error("Enter a name, serving basis, and valid nutrient values.");
      return;
    }

    try {
      const updated = await dispatch(updateFood({ id: food.id, food: payload })).unwrap();
      toast.success(`${updated.name} updated.`);
      resetEditor();
    } catch {
      // The shared food error is shown as a toast.
    }
  };

  const submitRecipeEdit = async (event: FormEvent<HTMLFormElement>, food: Food) => {
    event.preventDefault();
    if (!recipeDraft) return;

    const payload = recipePayloadFromDraft(recipeDraft);
    if (!payload) {
      toast.error("Enter a recipe name, servings, and unique ingredients with valid quantities.");
      return;
    }

    try {
      const updated = await dispatch(updateRecipe({ id: food.id, recipe: payload })).unwrap();
      toast.success(`${updated.name} updated.`);
      resetEditor();
    } catch {
      // The shared food error is shown as a toast.
    }
  };

  const addRecipeIngredient = (recipe: Food) => {
    const usedIds = new Set(recipeDraft?.ingredients.map((ingredient) => ingredient.foodId) ?? []);
    const nextFood = managedFoods.find((food) => food.id !== recipe.id && !usedIds.has(food.id));
    if (!nextFood) {
      toast.error("No more ingredients are available to add.");
      return;
    }

    setRecipeDraft((current) => current
      ? {
          ...current,
          ingredients: [...current.ingredients, { foodId: nextFood.id, quantity: String(nextFood.nutritionPer) }],
        }
      : current);
  };

  const updateRecipeIngredient = (
    index: number,
    patch: Partial<{ foodId: string; quantity: string }>,
  ) => {
    setRecipeDraft((current) => current
      ? {
          ...current,
          ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
            ingredientIndex === index ? { ...ingredient, ...patch } : ingredient,
          ),
        }
      : current);
  };

  const removeRecipeIngredient = (index: number) => {
    setRecipeDraft((current) => current
      ? {
          ...current,
          ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
        }
      : current);
  };

  const renderAdminActions = (food: Food) => {
    const isEditing = editingFoodId === food.id;
    const isBusy =
      deletingIds.includes(food.id) ||
      approvingIds.includes(food.id) ||
      updatingIds.includes(food.id);

    return (
      <div className="mt-3 border-t border-line/70 pt-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${food.approved ? "bg-brand-soft text-brand-active" : "bg-amber-100 text-amber-700"}`}>
              {food.approved ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
              {food.approved ? "Approved" : "Pending"}
            </span>
            <span className="rounded-full bg-canvas px-2.5 py-1 font-bold uppercase tracking-wide text-muted">
              {food.kind === "recipe" ? "Recipe" : "Food"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={isBusy}
              onClick={() => startEditing(food)}
            >
              <Edit3 size={15} /> Edit
            </button>
            <button
              type="button"
              className={food.approved ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
              disabled={isBusy}
              onClick={() => void toggleApproval(food)}
            >
              {food.approved ? <ShieldX size={15} /> : <Check size={15} />}
              {food.approved ? "Cancel approval" : "Approve"}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={isBusy}
              onClick={() => requestDeleteFood(food)}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        {isEditing && food.kind === "food" && foodDraft && (
          <form onSubmit={(event) => void submitFoodEdit(event, food)} className="mt-4 rounded-lg border border-line bg-canvas/70 p-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_9rem]">
              <label className="form-field">
                <span className="form-label">Food name</span>
                <input
                  className="form-control"
                  value={foodDraft.name}
                  maxLength={160}
                  onChange={(event) => setFoodDraft((current) =>
                    current ? { ...current, name: event.target.value } : current)}
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Unit</span>
                <select
                  value={foodDraft.unit}
                  onChange={(event) => setFoodDraft((current) =>
                    current ? { ...current, unit: event.target.value as FoodUnit } : current)}
                  className="form-control"
                >
                  {FOOD_UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unitNames[unit]}</option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span className="form-label">Nutrition per</span>
                <span className="relative">
                  <input
                    className="form-control pr-12"
                    type="number"
                    min="0.001"
                    step="any"
                    value={foodDraft.nutritionPer}
                    onChange={(event) => setFoodDraft((current) =>
                      current ? { ...current, nutritionPer: event.target.value } : current)}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                    {foodDraft.unit}
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {nutrientFields.map(({ key, label, unit }) => (
                <label key={key} className="form-field">
                  <span className="form-label">{label}</span>
                  <span className="relative">
                    <input
                      className="form-control pr-12"
                      type="number"
                      min="0"
                      step="any"
                      value={foodDraft.nutrition[key]}
                      onChange={(event) => setFoodDraft((current) =>
                        current
                          ? {
                              ...current,
                              nutrition: { ...current.nutrition, [key]: event.target.value },
                            }
                          : current)}
                      required
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                      {unit}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetEditor}>
                <X size={15} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={updatingIds.includes(food.id)}>
                <Save size={15} /> {updatingIds.includes(food.id) ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        {isEditing && food.kind === "recipe" && recipeDraft && (
          <form onSubmit={(event) => void submitRecipeEdit(event, food)} className="mt-4 rounded-lg border border-line bg-canvas/70 p-3">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <label className="form-field">
                <span className="form-label">Recipe name</span>
                <input
                  className="form-control"
                  value={recipeDraft.name}
                  maxLength={160}
                  onChange={(event) => setRecipeDraft((current) =>
                    current ? { ...current, name: event.target.value } : current)}
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Servings</span>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={recipeDraft.servings}
                  onChange={(event) => setRecipeDraft((current) =>
                    current ? { ...current, servings: event.target.value } : current)}
                  required
                />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink">Ingredients</p>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => addRecipeIngredient(food)}>
                  <Plus size={15} /> Add
                </button>
              </div>

              {recipeDraft.ingredients.map((ingredient, index) => {
                const selectedIngredient = foodById.get(ingredient.foodId);
                const selectedIds = new Set(
                  recipeDraft.ingredients
                    .filter((_, ingredientIndex) => ingredientIndex !== index)
                    .map((entry) => entry.foodId),
                );

                return (
                  <div key={`${ingredient.foodId}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
                    <label className="form-field">
                      <span className="sr-only">Ingredient</span>
                      <select
                        className="form-control"
                        value={ingredient.foodId}
                        onChange={(event) => updateRecipeIngredient(index, { foodId: event.target.value })}
                      >
                        {managedFoods
                          .filter((option) => option.id !== food.id && (option.id === ingredient.foodId || !selectedIds.has(option.id)))
                          .map((option) => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="sr-only">Quantity</span>
                      <span className="relative">
                        <input
                          className="form-control pr-12"
                          type="number"
                          min="0.001"
                          step="any"
                          value={ingredient.quantity}
                          onChange={(event) => updateRecipeIngredient(index, { quantity: event.target.value })}
                          required
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                          {selectedIngredient?.unit ?? ""}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon text-danger"
                      aria-label="Remove ingredient"
                      onClick={() => removeRecipeIngredient(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

              {recipeDraft.ingredients.length === 0 && (
                <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-sm text-muted">
                  Add at least one ingredient.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetEditor}>
                <X size={15} /> Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={updatingIds.includes(food.id)}>
                <Save size={15} /> {updatingIds.includes(food.id) ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  if (manageMode && (!initialized || !user || user.role !== "admin")) {
    return <div className="flex min-h-[55vh] items-center justify-center text-sm text-muted">Checking admin access...</div>;
  }

  const loadingManagedFoods = manageMode && (loading || pendingLoading);

  return (
    <div className="food-list-bottom-space flex w-full flex-col items-center">
      <div className="w-full bg-brand px-4 py-3 text-center">
        <h2 className="text-xl font-bold text-on-brand">
          {manageMode ? "Manage foods" : mealType || "Select foods"}
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
            placeholder={manageMode ? "Search foods and recipes" : "Search foods"}
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
        selectedItems={manageMode ? [] : meal.list}
        onToggle={manageMode ? undefined : toggleFood}
        onQuantityChange={manageMode ? undefined : updateQuantity}
        renderActions={manageMode ? renderAdminActions : undefined}
        className="px-3 py-4 md:max-w-4xl"
        showSearch={false}
      />

      {loadingManagedFoods && <p className="pb-4 text-sm text-muted">Loading foods...</p>}

      {!manageMode && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving > 0 || !selectedDate}
          className="food-list-done-button btn btn-primary fixed left-1/2 z-50 -translate-x-1/2 rounded-full shadow-xl"
        >
          {saving > 0 ? "Saving..." : `Done (${meal.list.length})`}
        </button>
      )}
    </div>
  );
}
