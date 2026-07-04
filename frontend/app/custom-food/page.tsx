"use client";

import {
  Check,
  ChevronRight,
  Clock3,
  ImagePlus,
  Plus,
  ScanLine,
  ShieldCheck,
  Trash2,
  Utensils,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Back from "../components/back";
import NutritionProfile from "../components/nutritionProfile";
import {
  approveFood,
  clearFoodError,
  createFood,
  deleteFood,
  fetchPendingFoods,
  type CreateFoodInput,
  type Minerals,
  type Nutrition,
  type Vitamins,
} from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FOOD_UNITS, NUTRIENT_UNITS, type FoodUnit } from "../store/nutritionUnits";

type NutrientKey = keyof Omit<Nutrition, "vitamins" | "minerals">;
type VitaminKey = keyof Vitamins;
type MineralKey = keyof Minerals;

interface NutrientField<Key extends string> {
  key: Key;
  label: string;
  unit: string;
}

const coreFields: NutrientField<NutrientKey>[] = [
  { key: "calories", label: "Calories", unit: NUTRIENT_UNITS.calories },
  { key: "protein", label: "Protein", unit: NUTRIENT_UNITS.protein },
  { key: "carbs", label: "Total carbs", unit: NUTRIENT_UNITS.carbs },
  { key: "fiber", label: "Fiber", unit: NUTRIENT_UNITS.fiber },
  { key: "netCarbs", label: "Net carbs", unit: NUTRIENT_UNITS.netCarbs },
  { key: "fats", label: "Total fat", unit: NUTRIENT_UNITS.fats },
];

const vitaminLabels: Record<VitaminKey, string> = {
  b1: "Vitamin B1",
  b2: "Vitamin B2",
  b3: "Vitamin B3",
  b5: "Vitamin B5",
  b6: "Vitamin B6",
  b7: "Vitamin B7",
  b8: "Vitamin B8",
  b9: "Vitamin B9",
  b12: "Vitamin B12",
  a: "Vitamin A",
  c: "Vitamin C",
  d: "Vitamin D",
  e: "Vitamin E",
  k: "Vitamin K",
};

const vitaminFields = (Object.keys(vitaminLabels) as VitaminKey[]).map((key) => ({
  key,
  label: vitaminLabels[key],
  unit: NUTRIENT_UNITS.vitamins[key],
}));

const mineralLabels: Record<MineralKey, string> = {
  calcium: "Calcium",
  copper: "Copper",
  iron: "Iron",
  magnesium: "Magnesium",
  manganese: "Manganese",
  phosphorus: "Phosphorus",
  potassium: "Potassium",
  selenium: "Selenium",
  sodium: "Sodium",
  zinc: "Zinc",
};

const mineralFields = (Object.keys(mineralLabels) as MineralKey[]).map((key) => ({
  key,
  label: mineralLabels[key],
  unit: NUTRIENT_UNITS.minerals[key],
}));

const emptyValues = <Key extends string>(fields: NutrientField<Key>[]) =>
  Object.fromEntries(fields.map(({ key }) => [key, "0"])) as Record<Key, string>;

const unitNames: Record<FoodUnit, string> = {
  g: "grams (g)",
  ml: "milliliters (ml)",
  pc: "piece (pc)",
  slice: "slice",
};

const SCAN_ENABLED = process.env.NEXT_PUBLIC_NUTRITION_LABEL_SCAN_ENABLED === "true";

function NutrientGrid<Key extends string>({
  fields,
  values,
  onChange,
}: {
  fields: NutrientField<Key>[];
  values: Record<Key, string>;
  onChange: (key: Key, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map(({ key, label, unit }) => (
        <label key={key} className="form-field">
          <span className="form-label">{label}</span>
          <span className="relative">
            <input
              type="number"
              min="0"
              max="100000"
              step="any"
              inputMode="decimal"
              value={values[key]}
              onChange={(event) => onChange(key, event.target.value)}
              className="form-control pr-16"
              required
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
              {unit}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default function CustomFoodPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { list, pending, creating, deletingIds, approvingIds, error, pendingError } =
    useAppSelector((state) => state.foods);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<FoodUnit>("g");
  const [nutritionPer, setNutritionPer] = useState("100");
  const [core, setCore] = useState(emptyValues(coreFields));
  const [vitamins, setVitamins] = useState(emptyValues(vitaminFields));
  const [minerals, setMinerals] = useState(emptyValues(mineralFields));
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanFile, setScanFile] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/signin");
  }, [initialized, router, user]);

  useEffect(() => {
    if (user?.role === "admin") dispatch(fetchPendingFoods());
  }, [dispatch, user?.role]);

  useEffect(() => () => {
    dispatch(clearFoodError());
  }, [dispatch]);

  const myFoods = useMemo(
    () => list.filter((food) => food.addedBy === user?.id),
    [list, user?.id],
  );

  const setNumericValues = <Key extends string>(values: Record<Key, string>) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ) as Record<Key, number>;

  const nutritionPreview: Nutrition = {
    ...setNumericValues(core),
    vitamins: setNumericValues(vitamins),
    minerals: setNumericValues(minerals),
  };

  const resetForm = () => {
    setName("");
    setNutritionPer(unit === "g" || unit === "ml" ? "100" : "1");
    setCore(emptyValues(coreFields));
    setVitamins(emptyValues(vitaminFields));
    setMinerals(emptyValues(mineralFields));
    setScanFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUnitChange = (nextUnit: FoodUnit) => {
    setUnit(nextUnit);
    setNutritionPer(nextUnit === "g" || nextUnit === "ml" ? "100" : "1");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    dispatch(clearFoodError());

    const numericGroups = [core, vitamins, minerals].flatMap((group) => Object.values(group));
    if (!name.trim()) {
      setFormError("Enter a food name.");
      return;
    }
    if (!Number.isFinite(Number(nutritionPer)) || Number(nutritionPer) <= 0) {
      setFormError("Serving basis must be greater than zero.");
      return;
    }
    if (numericGroups.some((value) => value === "" || Number(value) < 0 || !Number.isFinite(Number(value)))) {
      setFormError("Every nutrient needs a valid value of zero or more.");
      return;
    }

    const payload: CreateFoodInput = {
      name: name.trim(),
      unit,
      nutritionPer: Number(nutritionPer),
      nutrition: {
        ...setNumericValues(core),
        vitamins: setNumericValues(vitamins),
        minerals: setNumericValues(minerals),
      },
    };

    try {
      const created = await dispatch(createFood(payload)).unwrap();
      setSuccess(`${created.name} was saved and is awaiting admin approval.`);
      resetForm();
    } catch {
      // The API error from the food slice is displayed below.
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setScanFile(event.target.files?.[0]?.name ?? null);
  };

  if (!initialized || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="w-full px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start gap-3">
          <Back />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Food library</p>
            <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Create custom food</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Add the nutrition shown on your package. Your food stays private to you until an admin approves it.
            </p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <form onSubmit={handleSubmit} className="card overflow-hidden">
            {SCAN_ENABLED && (
              <section className="border-b border-line bg-brand-soft/45 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
                      <ScanLine size={22} />
                    </span>
                    <div>
                      <h2 className="font-bold text-ink">Scan a nutrition label</h2>
                      <p className="mt-1 text-sm text-muted">Upload a clear photo to prepare it for automatic extraction.</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFile}
                    className="sr-only"
                    id="nutrition-label-image"
                  />
                  <button type="button" className="btn btn-secondary shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus size={18} /> {scanFile ? "Change photo" : "Choose photo"}
                  </button>
                </div>
                {scanFile && (
                  <p className="mt-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
                    <strong className="text-ink">{scanFile}</strong> selected. OCR extraction can be connected here without changing the form flow.
                  </p>
                )}
              </section>
            )}

            <section className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="form-field">
                  <span className="form-label">Food name</span>
                  <input
                    type="text"
                    maxLength={160}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="form-control"
                    placeholder="e.g. Whole grain cereal"
                    autoComplete="off"
                    required
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Unit</span>
                  <select value={unit} onChange={(event) => handleUnitChange(event.target.value as FoodUnit)} className="form-control">
                    {FOOD_UNITS.map((option) => <option key={option} value={option}>{unitNames[option]}</option>)}
                  </select>
                </label>
              </div>

              <label className="form-field max-w-xs">
                <span className="form-label">Nutrition values are per</span>
                <span className="relative">
                  <input
                    type="number"
                    min="0.001"
                    max="100000"
                    step="any"
                    value={nutritionPer}
                    onChange={(event) => setNutritionPer(event.target.value)}
                    className="form-control pr-16"
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">{unit}</span>
                </span>
              </label>
            </section>

            <section className="border-t border-line p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-ink">Main nutrition</h2>
                <p className="mt-1 text-sm text-muted">Use the same serving basis entered above.</p>
              </div>
              <NutrientGrid fields={coreFields} values={core} onChange={(key, value) => setCore((current) => ({ ...current, [key]: value }))} />
            </section>

            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-bold text-ink sm:px-6">
                Vitamins <ChevronRight className="transition-transform group-open:rotate-90" size={19} />
              </summary>
              <div className="px-5 pb-6 sm:px-6">
                <NutrientGrid fields={vitaminFields} values={vitamins} onChange={(key, value) => setVitamins((current) => ({ ...current, [key]: value }))} />
              </div>
            </details>

            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-bold text-ink sm:px-6">
                Minerals <ChevronRight className="transition-transform group-open:rotate-90" size={19} />
              </summary>
              <div className="px-5 pb-6 sm:px-6">
                <NutrientGrid fields={mineralFields} values={minerals} onChange={(key, value) => setMinerals((current) => ({ ...current, [key]: value }))} />
              </div>
            </details>

            <div className="border-t border-line bg-canvas/60 p-5 sm:p-6">
              {(formError || error) && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">{formError || error}</div>}
              {success && <div role="status" className="mb-4 rounded-xl border border-brand/25 bg-brand-soft px-4 py-3 text-sm text-brand-active">{success}</div>}
              <button type="submit" disabled={creating} className="btn btn-primary w-full sm:w-auto">
                <Plus size={19} /> {creating ? "Saving food…" : "Save custom food"}
              </button>
            </div>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-20">
            <section className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><ShieldCheck size={21} /></span>
                <h2 className="font-bold text-ink">How approval works</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-muted">
                <li className="flex gap-2"><span className="font-bold text-brand">1.</span> You can use your food immediately.</li>
                <li className="flex gap-2"><span className="font-bold text-brand">2.</span> Other users cannot find it while it is pending.</li>
                <li className="flex gap-2"><span className="font-bold text-brand">3.</span> Approval adds it to the shared food library.</li>
              </ol>
            </section>

            <section className="card overflow-hidden">
              <div className="border-b border-line p-5">
                <h2 className="flex items-center gap-2 font-bold text-ink"><Utensils size={19} className="text-brand" /> My custom foods</h2>
              </div>
              <div className="divide-y divide-line">
                {myFoods.map((food) => (
                  <div key={food.id} className="flex items-center gap-3 px-5 py-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${food.approved ? "bg-brand-soft text-brand" : "bg-amber-50 text-amber-700"}`}>
                      {food.approved ? <Check size={16} /> : <Clock3 size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{food.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{food.approved ? "Approved · Visible to all" : "Pending · Only visible to you"}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-icon-sm text-danger"
                      aria-label={`Delete ${food.name}`}
                      disabled={deletingIds.includes(food.id)}
                      onClick={() => {
                        if (window.confirm(`Delete ${food.name}?`)) dispatch(deleteFood(food.id));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {myFoods.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">Your custom foods will appear here.</p>}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-ink">Nutrition preview</h2>
            <p className="mt-1 text-sm text-muted">Your entered values use the same display and daily comparisons as the app’s Nutrition screen.</p>
          </div>
          <NutritionProfile nutrition={nutritionPreview} />
        </section>

        {user.role === "admin" && (
          <section className="card mt-6 overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Admin</p>
                <h2 className="mt-1 text-xl font-bold text-ink">Pending food approvals</h2>
              </div>
              <span className="text-sm text-muted">{pending.length} waiting</span>
            </div>
            {pendingError && <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">{pendingError}</div>}
            <div className="divide-y divide-line">
              {pending.map((food) => (
                <div key={food.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-ink">{food.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {food.nutrition.calories} kcal · {food.nutrition.protein} g protein · per {food.nutritionPer} {food.unit}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">Submitted by user {food.addedBy}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-primary btn-sm" disabled={approvingIds.includes(food.id)} onClick={() => dispatch(approveFood(food.id))}>
                      <Check size={16} /> {approvingIds.includes(food.id) ? "Approving…" : "Approve"}
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" disabled={deletingIds.includes(food.id)} onClick={() => dispatch(deleteFood(food.id))}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && !pendingError && <p className="px-5 py-10 text-center text-sm text-muted">No foods are waiting for approval.</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
