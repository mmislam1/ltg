"use client";

import {
  Camera,
  Check,
  ChevronRight,
  Clock3,
  ImageUp,
  Plus,
  ScanLine,
  ShieldCheck,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Back from "../components/back";
import NutritionProfile from "../components/nutritionProfile";
import {
  approveFood,
  clearFoodError,
  createFood,
  deleteFood,
  fetchPendingFoods,
  scanNutritionLabel,
  type CreateFoodInput,
  type Food,
  type Minerals,
  type Nutrition,
  type Vitamins,
} from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { countedCalories, FOOD_UNITS, NUTRIENT_UNITS, type FoodUnit } from "../store/nutritionUnits";

type NutrientKey = keyof Omit<Nutrition, "vitamins" | "minerals">;
type CoreInputKey = Exclude<NutrientKey, "carbs">;
type VitaminKey = keyof Vitamins;
type MineralKey = keyof Minerals;

interface NutrientField<Key extends string> {
  key: Key;
  label: string;
  unit: string;
}

const coreFields: NutrientField<CoreInputKey>[] = [
  { key: "calories", label: "Calories", unit: NUTRIENT_UNITS.calories },
  { key: "protein", label: "Protein", unit: NUTRIENT_UNITS.protein },
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { list, pending, creating, scanningLabel, deletingIds, approvingIds, error, pendingError } =
    useAppSelector((state) => state.foods);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<FoodUnit>("g");
  const [nutritionPer, setNutritionPer] = useState("100");
  const [core, setCore] = useState(emptyValues(coreFields));
  const [vitamins, setVitamins] = useState(emptyValues(vitaminFields));
  const [minerals, setMinerals] = useState(emptyValues(mineralFields));
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/signin");
  }, [initialized, router, user]);

  useEffect(() => {
    if (user?.role === "admin") dispatch(fetchPendingFoods());
  }, [dispatch, user?.role]);

  useEffect(() => () => {
    dispatch(clearFoodError());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (pendingError) toast.error(pendingError);
  }, [pendingError]);

  const myFoods = useMemo(
    () => list.filter((food) => food.addedBy === user?.id),
    [list, user?.id],
  );

  const setNumericValues = <Key extends string>(values: Record<Key, string>) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ) as Record<Key, number>;

  const nutritionFromForm = (): Nutrition => {
    const coreValues = setNumericValues(core);
    const carbGrams = coreValues.netCarbs;
    const nutrition: Nutrition = {
      ...coreValues,
      carbs: carbGrams,
      netCarbs: carbGrams,
      vitamins: setNumericValues(vitamins),
      minerals: setNumericValues(minerals),
    };
    return {
      ...nutrition,
      calories: countedCalories(nutrition),
    };
  };

  const nutritionPreview = nutritionFromForm();

  const formatScannedNumber = (value: number | undefined) =>
    Number.isFinite(Number(value)) ? String(Number(value)) : "0";

  const valuesFromScan = <Key extends string>(
    fields: NutrientField<Key>[],
    values: Partial<Record<Key, number>> | undefined,
  ) =>
    Object.fromEntries(
      fields.map(({ key }) => [key, formatScannedNumber(values?.[key])]),
    ) as Record<Key, string>;

  const fillFromScan = (food: CreateFoodInput) => {
    if (food.name.trim()) setName(food.name.trim());
    setUnit(food.unit);
    setNutritionPer(formatScannedNumber(food.nutritionPer));
    setCore(valuesFromScan(coreFields, {
      ...food.nutrition,
      netCarbs: food.nutrition.carbs ?? food.nutrition.netCarbs,
    }));
    setVitamins(valuesFromScan(vitaminFields, food.nutrition.vitamins));
    setMinerals(valuesFromScan(mineralFields, food.nutrition.minerals));
  };

  const resetForm = () => {
    setName("");
    setNutritionPer(unit === "g" || unit === "ml" ? "100" : "1");
    setCore(emptyValues(coreFields));
    setVitamins(emptyValues(vitaminFields));
    setMinerals(emptyValues(mineralFields));
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleUnitChange = (nextUnit: FoodUnit) => {
    setUnit(nextUnit);
    setNutritionPer(nextUnit === "g" || nextUnit === "ml" ? "100" : "1");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearFoodError());

    const numericGroups = [core, vitamins, minerals].flatMap((group) => Object.values(group));
    if (!name.trim()) {
      toast.error("Enter a food name.");
      return;
    }
    if (!Number.isFinite(Number(nutritionPer)) || Number(nutritionPer) <= 0) {
      toast.error("Serving basis must be greater than zero.");
      return;
    }
    if (numericGroups.some((value) => value === "" || Number(value) < 0 || !Number.isFinite(Number(value)))) {
      toast.error("Every nutrient needs a valid value of zero or more.");
      return;
    }

    const payload: CreateFoodInput = {
      name: name.trim(),
      unit,
      nutritionPer: Number(nutritionPer),
      nutrition: nutritionFromForm(),
    };

    try {
      const created = await dispatch(createFood(payload)).unwrap();
      toast.success(`${created.name} was saved and is awaiting admin approval.`);
      resetForm();
    } catch {
      // The API error from the food slice is shown as a toast.
    }
  };

  const handleScanImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    setScanModalOpen(false);
    dispatch(clearFoodError());

    try {
      const scannedFood = await dispatch(scanNutritionLabel(image)).unwrap();
      fillFromScan(scannedFood);
    } catch {
      // The API error from the food slice is shown as a toast.
    }
  };

  const requestDeleteFood = (food: Food) => {
    const toastId = toast.warning(`Delete ${food.name}?`, {
      description: "This removes it from your custom foods.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: () => {
          toast.dismiss(toastId);
          void dispatch(deleteFood(food.id))
            .unwrap()
            .then(() => toast.success(`${food.name} deleted.`))
            .catch(() => {});
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(toastId),
      },
    });
  };

  if (!initialized || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="w-full px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Back />
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">Create custom food</h1>
          </div>
          {SCAN_ENABLED && (
            <button
              type="button"
              className="btn btn-secondary shrink-0"
              disabled={scanningLabel}
              onClick={() => setScanModalOpen(true)}
            >
              <ScanLine size={18} /> {scanningLabel ? "Scanning..." : "Scan"}
            </button>
          )}
        </div>

        {SCAN_ENABLED && (
          <>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleScanImage}
              className="sr-only"
              aria-hidden="true"
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handleScanImage}
              className="sr-only"
              aria-hidden="true"
            />
          </>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <form onSubmit={handleSubmit} className="card overflow-hidden">
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

            <div className="border-t border-line bg-canvas/60 p-5 sm:flex sm:justify-center sm:p-6">
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
                      onClick={() => requestDeleteFood(food)}
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
          <NutritionProfile
            nutrition={nutritionPreview}
            macroTargets={{
              calories: user.dailyGoals.targetCalories,
              protein: user.dailyGoals.targetProtein,
              carbs: user.dailyGoals.targetCarb,
              netCarbs: user.dailyGoals.targetCarb,
              fats: user.dailyGoals.targetFat,
            }}
          />
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

        {SCAN_ENABLED && scanModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-label="Scan">
            <div className="card w-full max-w-sm overflow-hidden p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink">Scan</h2>
                <button type="button" className="btn btn-ghost btn-icon btn-icon-sm" aria-label="Close" onClick={() => setScanModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="btn btn-secondary min-h-24 flex-col"
                  disabled={scanningLabel}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={24} />
                  Camera
                </button>
                <button
                  type="button"
                  className="btn btn-secondary min-h-24 flex-col"
                  disabled={scanningLabel}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <ImageUp size={24} />
                  Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
