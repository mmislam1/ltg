"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Calculator,
  CalendarDays,
  ChevronDown,
  Flame,
  Gauge,
  Ruler,
  Save,
  Target,
  UserRound,
  Weight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  bmiFromMeasurements,
  centimetersToFeet,
  feetInchesToCentimeters,
  feetInchesToFeet,
  feetToFeetInches,
  formatBmi,
  inputNumber,
} from "../bodyMetrics";
import api, { getApiError, getFieldErrors } from "../store/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  ActivityLevel,
  AuthError,
  FormulaSex,
  MacroRatioKey,
  updateProfile,
  UpdateProfileData,
  User,
  WeightGoalType,
} from "../store/features/authSlice";
import { NUTRIENT_UNITS } from "../store/nutritionUnits";

type ProfileForm = {
  name: string;
  age: string;
  weight: string;
  weight_unit: "kg" | "lb";
  height: string;
  height_inches: string;
  height_unit: "cm" | "ft";
  set_goals: boolean;
  target_goal: WeightGoalType;
  target_weight: string;
  target_weight_unit: "kg" | "lb";
  duration_weeks: string;
  activity_level: ActivityLevel;
  formula_sex: FormulaSex | "";
  macro_ratio: MacroRatioKey;
  target_calories: string;
  target_protein: string;
  target_carbs: string;
  target_fat: string;
};

type GoalPreviewPayload = {
  age: number;
  weight: number;
  weight_unit: "kg" | "lb";
  height: number;
  height_inches?: number;
  height_unit: "cm" | "ft";
  goal_type: WeightGoalType;
  target_weight: number;
  target_weight_unit: "kg" | "lb";
  duration_weeks: number;
  activity_level: ActivityLevel;
  formula_sex: FormulaSex;
  macro_ratio: MacroRatioKey;
};

type GoalPreviewResponse = {
  goal: {
    suggested_calories: number;
    bmr: number;
    tdee: number;
    calorie_adjustment: number;
    target_date: string;
    warnings: string[];
  };
  daily_goals: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
  };
};

type GoalPreview = {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  bmr: number;
  tdee: number;
  calorieAdjustment: number;
  targetDate: string;
  warnings: string[];
};

const goalOptions: { value: WeightGoalType; label: string }[] = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain_weight", label: "Maintain" },
  { value: "gain_weight", label: "Gain weight" },
];

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
];

const macroRatioOptions: {
  value: MacroRatioKey;
  label: string;
  protein: number;
  carbs: number;
  fat: number;
}[] = [
  { value: "balanced", label: "Balanced", protein: 30, carbs: 40, fat: 30 },
  { value: "high_protein", label: "High protein", protein: 40, carbs: 30, fat: 30 },
  { value: "lower_carb", label: "Lower carb", protein: 35, carbs: 25, fat: 40 },
  { value: "keto", label: "Keto", protein: 25, carbs: 5, fat: 70 },
  { value: "endurance", label: "Endurance", protein: 20, carbs: 55, fat: 25 },
];

const emptyForm: ProfileForm = {
  name: "",
  age: "",
  weight: "",
  weight_unit: "kg",
  height: "",
  height_inches: "0",
  height_unit: "cm",
  set_goals: false,
  target_goal: "lose_weight",
  target_weight: "",
  target_weight_unit: "kg",
  duration_weeks: "12",
  activity_level: "moderate",
  formula_sex: "",
  macro_ratio: "balanced",
  target_calories: "",
  target_protein: "",
  target_carbs: "",
  target_fat: "",
};

const formFromUser = (user: User): ProfileForm => {
  const heightParts = user.heightUnit === "ft" ? feetToFeetInches(user.height) : null;

  return {
    name: user.name,
    age: String(user.age),
    weight: String(user.weight),
    weight_unit: user.weightUnit,
    height: heightParts ? String(heightParts.feet) : String(user.height),
    height_inches: heightParts ? String(heightParts.inches) : "0",
    height_unit: user.heightUnit,
    set_goals: Boolean(user.goal),
    target_goal: user.goal?.goalType ?? "lose_weight",
    target_weight: user.goal ? String(user.goal.targetWeight) : String(user.weight),
    target_weight_unit: user.goal?.targetWeightUnit ?? user.weightUnit,
    duration_weeks: user.goal ? String(user.goal.durationWeeks) : "12",
    activity_level: user.goal?.activityLevel ?? "moderate",
    formula_sex: user.goal?.formulaSex ?? "",
    macro_ratio: user.goal?.macroRatio ?? "balanced",
    target_calories: String(user.dailyGoals.targetCalories),
    target_protein: String(user.dailyGoals.targetProtein),
    target_carbs: String(user.dailyGoals.targetCarb),
    target_fat: String(user.dailyGoals.targetFat),
  };
};

const previewFromUser = (user: User): GoalPreview | null =>
  user.goal
    ? {
        targetCalories: user.dailyGoals.targetCalories,
        targetProtein: user.dailyGoals.targetProtein,
        targetCarbs: user.dailyGoals.targetCarb,
        targetFat: user.dailyGoals.targetFat,
        bmr: user.goal.bmr,
        tdee: user.goal.tdee,
        calorieAdjustment: user.goal.calorieAdjustment,
        targetDate: user.goal.targetDate,
        warnings: user.goal.warnings,
      }
    : null;

const previewFromResponse = (response: GoalPreviewResponse): GoalPreview => ({
  targetCalories: response.daily_goals.target_calories,
  targetProtein: response.daily_goals.target_protein,
  targetCarbs: response.daily_goals.target_carbs,
  targetFat: response.daily_goals.target_fat,
  bmr: response.goal.bmr,
  tdee: response.goal.tdee,
  calorieAdjustment: response.goal.calorie_adjustment,
  targetDate: response.goal.target_date,
  warnings: response.goal.warnings,
});

const numberText = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const dateText = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );

const buildGoalPreviewPayload = (form: ProfileForm): GoalPreviewPayload | null => {
  if (!form.set_goals || !form.formula_sex) return null;

  const age = Number(form.age);
  const weight = Number(form.weight);
  const height = Number(form.height);
  const heightInches = form.height_unit === "ft" ? Number(form.height_inches || 0) : undefined;
  const durationWeeks = Number(form.duration_weeks);
  const targetWeight =
    form.target_goal === "maintain_weight" ? weight : Number(form.target_weight);

  if (
    !Number.isFinite(age) ||
    !Number.isFinite(weight) ||
    !Number.isFinite(height) ||
    !Number.isFinite(durationWeeks) ||
    !Number.isFinite(targetWeight) ||
    age < 13 ||
    weight <= 0 ||
    height <= 0 ||
    durationWeeks < 1 ||
    targetWeight <= 0
  ) {
    return null;
  }

  return {
    age,
    weight,
    weight_unit: form.weight_unit,
    height,
    ...(heightInches !== undefined ? { height_inches: heightInches } : {}),
    height_unit: form.height_unit,
    goal_type: form.target_goal,
    target_weight: targetWeight,
    target_weight_unit:
      form.target_goal === "maintain_weight" ? form.weight_unit : form.target_weight_unit,
    duration_weeks: durationWeeks,
    activity_level: form.activity_level,
    formula_sex: form.formula_sex,
    macro_ratio: form.macro_ratio,
  };
};

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, initialized, profileLoading } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [formUserId, setFormUserId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [goalPreview, setGoalPreview] = useState<GoalPreview | null>(null);
  const [goalPreviewLoading, setGoalPreviewLoading] = useState(false);
  const [goalPreviewError, setGoalPreviewError] = useState("");
  const [goalCardOpen, setGoalCardOpen] = useState(false);
  const heightForBmi =
    form.height_unit === "ft"
      ? feetInchesToFeet(Number(form.height), Number(form.height_inches || 0))
      : Number(form.height);
  const bmi = bmiFromMeasurements({
    weight: Number(form.weight),
    weightUnit: form.weight_unit,
    height: heightForBmi,
    heightUnit: form.height_unit,
  });

  useEffect(() => {
    if (initialized && !user) router.replace("/auth/signin");
  }, [initialized, router, user]);

  useEffect(() => {
    if (!user || formUserId === user.id) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setFormUserId(user.id);
      setForm(formFromUser(user));
      setGoalPreview(previewFromUser(user));
      setGoalPreviewError("");
      setGoalCardOpen(false);
    });

    return () => {
      cancelled = true;
    };
  }, [formUserId, user]);

  useEffect(() => {
    if (!user || formUserId !== user.id) return;
    const payload = buildGoalPreviewPayload(form);

    if (!payload) {
      queueMicrotask(() => {
        setGoalPreviewLoading(false);
        if (!form.set_goals) {
          setGoalPreview(null);
          setGoalPreviewError("");
        }
      });
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setGoalPreviewLoading(true);
      setGoalPreviewError("");
      void api
        .post<GoalPreviewResponse>("/goals/preview", payload)
        .then(({ data }) => {
          if (cancelled) return;
          const nextPreview = previewFromResponse(data);
          setGoalPreview(nextPreview);
          setForm((current) => ({
            ...current,
            target_calories: String(nextPreview.targetCalories),
            target_protein: String(nextPreview.targetProtein),
            target_carbs: String(nextPreview.targetCarbs),
            target_fat: String(nextPreview.targetFat),
          }));
        })
        .catch((error) => {
          if (cancelled) return;
          const fields = getFieldErrors(error) || {};
          setFieldErrors((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.entries(fields).map(([key, value]) => [
                key,
                Array.isArray(value) ? value[0] : String(value),
              ]),
            ),
          }));
          setGoalPreviewError(getApiError(error, "Goal preview failed."));
        })
        .finally(() => {
          if (!cancelled) setGoalPreviewLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    form.activity_level,
    form.age,
    form.duration_weeks,
    form.formula_sex,
    form.height,
    form.height_inches,
    form.height_unit,
    form.macro_ratio,
    form.set_goals,
    form.target_goal,
    form.target_weight,
    form.target_weight_unit,
    form.weight,
    form.weight_unit,
    formUserId,
    user,
  ]);

  const update = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setGoalPreviewError("");
  };

  const toggleGoalCard = () => {
    const nextOpen = !goalCardOpen;
    setGoalCardOpen(nextOpen);
    setForm((current) => ({
      ...current,
      set_goals: nextOpen || current.set_goals || Boolean(user?.goal),
      target_weight: current.target_weight || current.weight,
      target_weight_unit: current.target_weight_unit || current.weight_unit,
    }));

    if (!nextOpen && !user?.goal) {
      setForm((current) => ({ ...current, set_goals: false }));
      setGoalPreview(null);
    }

    setFieldErrors((current) => ({
      ...current,
      formula_sex: "",
      target_weight: "",
      duration_weeks: "",
    }));
    setGoalPreviewError("");
  };

  const updateGoalType = (value: WeightGoalType) => {
    setForm((current) => ({
      ...current,
      target_goal: value,
      ...(value === "maintain_weight"
        ? { target_weight: current.weight, target_weight_unit: current.weight_unit }
        : {}),
    }));
    setFieldErrors((current) => ({ ...current, goal_type: "", target_weight: "" }));
    setGoalPreviewError("");
  };

  const updateWeightUnit = (value: "kg" | "lb") => {
    setForm((current) => ({
      ...current,
      weight_unit: value,
      ...(current.target_goal === "maintain_weight"
        ? { target_weight_unit: value, target_weight: current.weight }
        : {}),
    }));
    setFieldErrors((current) => ({ ...current, weight: "" }));
  };

  const updateHeightUnit = (value: "cm" | "ft") => {
    setForm((current) => {
      if (current.height_unit === value) return current;
      const height = Number(current.height);
      const inches = Number(current.height_inches || 0);

      if (value === "ft") {
        const parts = feetToFeetInches(centimetersToFeet(height));
        return {
          ...current,
          height: parts.feet ? String(parts.feet) : "",
          height_inches: String(parts.inches),
          height_unit: value,
        };
      }

      return {
        ...current,
        height: inputNumber(feetInchesToCentimeters(height, inches), 1),
        height_inches: "0",
        height_unit: value,
      };
    });
    setFieldErrors((current) => ({ ...current, height: "", height_inches: "" }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: UpdateProfileData = {
      name: form.name.trim(),
      age: Number(form.age),
      weight: Number(form.weight),
      weight_unit: form.weight_unit,
      height: Number(form.height),
      height_inches: form.height_unit === "ft" ? Number(form.height_inches || 0) : undefined,
      height_unit: form.height_unit,
      target_calories: Number(form.target_calories),
      target_protein: Number(form.target_protein),
      target_carbs: Number(form.target_carbs),
      target_fat: Number(form.target_fat),
    };

    const errors: Record<string, string> = {};
    if (payload.name.length < 2) errors.name = "Enter at least 2 characters.";
    if (payload.age < 13 || payload.age > 120) errors.age = "Age must be between 13 and 120.";
    if (payload.weight <= 0) errors.weight = "Enter a valid weight.";
    if (form.height_unit === "ft") {
      const inches = Number(form.height_inches || 0);
      if (payload.height <= 0) errors.height = "Enter a valid height.";
      if (inches < 0 || inches >= 12) errors.height = "Inches must be between 0 and 11.";
    } else if (payload.height <= 0) {
      errors.height = "Enter a valid height.";
    }
    if (payload.target_calories < 500) errors.target_calories = "Calories must be at least 500.";

    if (form.set_goals) {
      const targetWeight = Number(form.target_weight);
      const durationWeeks = Number(form.duration_weeks);
      if (!form.formula_sex) errors.formula_sex = "Select a formula sex.";
      if (form.target_goal !== "maintain_weight" && targetWeight <= 0) {
        errors.target_weight = "Enter a valid target weight.";
      }
      if (durationWeeks < 1 || durationWeeks > 260) {
        errors.duration_weeks = "Duration must be between 1 and 260 weeks.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    if (form.set_goals && form.formula_sex) {
      payload.goal_type = form.target_goal;
      payload.target_weight =
        form.target_goal === "maintain_weight" ? Number(form.weight) : Number(form.target_weight);
      payload.target_weight_unit =
        form.target_goal === "maintain_weight" ? form.weight_unit : form.target_weight_unit;
      payload.duration_weeks = Number(form.duration_weeks);
      payload.activity_level = form.activity_level;
      payload.formula_sex = form.formula_sex;
      payload.macro_ratio = form.macro_ratio;
    }

    try {
      await dispatch(updateProfile(payload)).unwrap();
      setGoalCardOpen(false);
      toast.success("Profile saved.");
    } catch (reason) {
      const message = (reason as AuthError).message || "Profile update failed.";
      const fields = (reason as AuthError).fields || {};
      setFieldErrors(
        Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : String(value),
          ]),
        ),
      );
      toast.error(message);
    }
  };

  if (!initialized || !user) {
    return <div className="min-h-[60vh] bg-canvas" />;
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm mb-5 -ml-2 hidden sm:inline-flex"
        >
          <ArrowLeft size={17} /> Back
        </button>

        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-brand">
            Account settings
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Edit your profile</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Keep your body measurements and nutrition targets accurate.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="card overflow-hidden">
            <section className="border-b border-line p-5 sm:p-7">
              <h2 className="mb-5 text-lg font-bold text-ink">Personal information</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={(value) => update("name", value)}
                  icon={UserRound}
                  error={fieldErrors.name}
                />
                <label className="form-field">
                  <span className="form-label">Email address</span>
                  <input
                    value={user.email}
                    readOnly
                    className="form-control bg-canvas text-muted"
                    aria-label="Email address"
                  />
                  <span className="text-xs text-muted">Contact support to change your email.</span>
                </label>
                <Field
                  label="Age"
                  name="age"
                  type="number"
                  min="13"
                  max="120"
                  value={form.age}
                  onChange={(value) => update("age", value)}
                  icon={UserRound}
                  error={fieldErrors.age}
                />
                <div className="hidden sm:block" />
                <MeasurementField
                  label="Weight"
                  name="weight"
                  icon={Weight}
                  value={form.weight}
                  unit={form.weight_unit}
                  units={["kg", "lb"]}
                  onValueChange={(value) => update("weight", value)}
                  onUnitChange={(value) => updateWeightUnit(value as "kg" | "lb")}
                  error={fieldErrors.weight}
                />
                <HeightField
                  label="Height"
                  name="height"
                  icon={Ruler}
                  value={form.height}
                  inches={form.height_inches}
                  unit={form.height_unit}
                  onValueChange={(value) => update("height", value)}
                  onInchesChange={(value) => update("height_inches", value)}
                  onUnitChange={updateHeightUnit}
                  error={fieldErrors.height}
                />
                <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-canvas px-4 py-3 sm:col-span-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-active">
                      <Activity size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">BMI</p>
                      <p className="mt-0.5 text-xs text-muted">Based on current weight and height</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-2xl font-bold tabular-nums text-ink">
                    {formatBmi(bmi)}
                  </p>
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-7">
              <h2 className="text-lg font-bold text-ink">Daily nutrition targets</h2>
              <p className="mb-5 mt-1 text-xs text-muted">
                Adjust these values to match guidance from your nutrition plan.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField
                  label="Calories"
                  unit={NUTRIENT_UNITS.calories}
                  name="target_calories"
                  value={form.target_calories}
                  onChange={(value) => update("target_calories", value)}
                  error={fieldErrors.target_calories}
                />
                <NumberField
                  label="Protein"
                  unit={NUTRIENT_UNITS.protein}
                  name="target_protein"
                  value={form.target_protein}
                  onChange={(value) => update("target_protein", value)}
                  error={fieldErrors.target_protein}
                />
                <NumberField
                  label="Net carbs"
                  unit={NUTRIENT_UNITS.netCarbs}
                  name="target_carbs"
                  value={form.target_carbs}
                  onChange={(value) => update("target_carbs", value)}
                  error={fieldErrors.target_carbs}
                />
                <NumberField
                  label="Fat"
                  unit={NUTRIENT_UNITS.fats}
                  name="target_fat"
                  value={form.target_fat}
                  onChange={(value) => update("target_fat", value)}
                  error={fieldErrors.target_fat}
                />
              </div>
            </section>
          </div>

          <section className="card overflow-hidden bg-surface shadow-sm">
            <button
              type="button"
              onClick={toggleGoalCard}
              aria-expanded={goalCardOpen}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-brand-soft sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand-active">
                  <Target size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink">Set goals</h2>
                </div>
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-brand-active">
                <ChevronDown
                  size={18}
                  className={`transition-transform ${goalCardOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </span>
            </button>

            {goalCardOpen && (
              <div className="border-t border-line px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                <GoalPicker value={form.target_goal} onChange={updateGoalType} />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <MeasurementField
                    label="Target weight"
                    name="target_weight"
                    icon={Target}
                    value={form.target_weight}
                    unit={
                      form.target_goal === "maintain_weight"
                        ? form.weight_unit
                        : form.target_weight_unit
                    }
                    units={["kg", "lb"]}
                    disabled={form.target_goal === "maintain_weight"}
                    onValueChange={(value) => update("target_weight", value)}
                    onUnitChange={(value) => update("target_weight_unit", value as "kg" | "lb")}
                    error={fieldErrors.target_weight}
                  />
                  <NumberField
                    label="Duration"
                    unit="wk"
                    name="duration_weeks"
                    min="1"
                    max="260"
                    value={form.duration_weeks}
                    onChange={(value) => update("duration_weeks", value)}
                    error={fieldErrors.duration_weeks}
                  />
                  <SelectField
                    label="BMR formula sex"
                    name="formula_sex"
                    icon={UserRound}
                    value={form.formula_sex}
                    placeholder="Select"
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                    onChange={(value) => update("formula_sex", value as FormulaSex | "")}
                    error={fieldErrors.formula_sex}
                  />
                  <SelectField
                    label="Activity level"
                    name="activity_level"
                    icon={Gauge}
                    value={form.activity_level}
                    options={activityOptions}
                    onChange={(value) => update("activity_level", value as ActivityLevel)}
                    error={fieldErrors.activity_level}
                  />
                </div>

                <MacroRatioPicker
                  value={form.macro_ratio}
                  onChange={(value) => update("macro_ratio", value)}
                />

                <GoalPreviewPanel
                  preview={goalPreview}
                  loading={goalPreviewLoading}
                  error={goalPreviewError}
                  enabled={goalCardOpen}
                />
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-end">
            <button type="submit" disabled={profileLoading} className="btn btn-primary sm:min-w-36">
              {profileLoading ? (
                <span className="auth-spinner" aria-label="Saving profile" />
              ) : (
                <>
                  <Save size={17} /> Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  name: string;
  value: string;
  icon: LucideIcon;
  onChange: (value: string) => void;
  error?: string;
}

function Field({ label, name, value, icon: Icon, onChange, error, ...props }: FieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative">
        <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          {...props}
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="form-control !pl-10"
          aria-invalid={Boolean(error)}
        />
      </span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface MeasurementProps {
  label: string;
  name: string;
  value: string;
  unit: string;
  units: string[];
  icon: LucideIcon;
  onValueChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function MeasurementField({
  label,
  name,
  value,
  unit,
  units,
  icon: Icon,
  onValueChange,
  onUnitChange,
  error,
  disabled,
}: MeasurementProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative flex">
        <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
        <input
          id={name}
          type="number"
          min="1"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          className="form-control !rounded-r-none !pl-10"
          aria-invalid={Boolean(error)}
        />
        <select
          aria-label={`${label} unit`}
          value={unit}
          disabled={disabled}
          onChange={(event) => onUnitChange(event.target.value)}
          className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand"
        >
          {units.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface HeightFieldProps {
  label: string;
  name: string;
  value: string;
  inches: string;
  unit: "cm" | "ft";
  icon: LucideIcon;
  onValueChange: (value: string) => void;
  onInchesChange: (value: string) => void;
  onUnitChange: (value: "cm" | "ft") => void;
  error?: string;
}

function HeightField({
  label,
  name,
  value,
  inches,
  unit,
  icon: Icon,
  onValueChange,
  onInchesChange,
  onUnitChange,
  error,
}: HeightFieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      {unit === "ft" ? (
        <span className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <span className="relative">
            <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
            <input
              id={name}
              type="number"
              min="1"
              step="1"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              className="form-control !rounded-r-none !pl-10 !pr-8"
              aria-invalid={Boolean(error)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
              ft
            </span>
          </span>
          <span className="relative -ml-px">
            <input
              id={`${name}_inches`}
              type="number"
              min="0"
              max="11"
              step="1"
              value={inches}
              onChange={(event) => onInchesChange(event.target.value)}
              className="form-control !rounded-none !pr-8"
              aria-invalid={Boolean(error)}
              aria-label="Height inches"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
              in
            </span>
          </span>
          <select
            aria-label={`${label} unit`}
            value={unit}
            onChange={(event) => onUnitChange(event.target.value as "cm" | "ft")}
            className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand"
          >
            {["cm", "ft"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </span>
      ) : (
        <span className="relative flex">
          <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
          <input
            id={name}
            type="number"
            min="1"
            step="0.01"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            className="form-control !rounded-r-none !pl-10"
            aria-invalid={Boolean(error)}
          />
          <select
            aria-label={`${label} unit`}
            value={unit}
            onChange={(event) => onUnitChange(event.target.value as "cm" | "ft")}
            className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand"
          >
            {["cm", "ft"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </span>
      )}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface NumberFieldProps {
  label: string;
  unit: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

function NumberField({
  label,
  unit,
  name,
  value,
  onChange,
  error,
  min = "0",
  max,
  disabled,
}: NumberFieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative">
        <input
          id={name}
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="form-control !pr-12"
          aria-invalid={Boolean(error)}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
          {unit}
        </span>
      </span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  icon: LucideIcon;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

function SelectField({
  label,
  name,
  value,
  icon: Icon,
  options,
  onChange,
  error,
  placeholder,
  disabled,
}: SelectFieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative">
        <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
        <select
          id={name}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="form-control !pl-10"
          aria-invalid={Boolean(error)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

function GoalPicker({
  value,
  onChange,
  disabled,
}: {
  value: WeightGoalType;
  onChange: (value: WeightGoalType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Target goal">
      {goalOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`min-h-11 rounded-lg border px-3 text-sm font-bold transition ${
            value === option.value
              ? "border-brand bg-brand text-on-brand"
              : "border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MacroRatioPicker({
  value,
  onChange,
  disabled,
}: {
  value: MacroRatioKey;
  onChange: (value: MacroRatioKey) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-5">
      <p className="form-label mb-2">Macro ratio</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {macroRatioOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-3 py-3 text-left transition ${
              value === option.value
                ? "border-brand bg-brand text-on-brand"
                : "border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft"
            }`}
          >
            <span className="block text-sm font-bold">{option.label}</span>
            <span
              className={`mt-1 block text-xs ${
                value === option.value ? "text-on-brand/85" : "text-muted"
              }`}
            >
              {option.protein}/{option.carbs}/{option.fat}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GoalPreviewPanel({
  preview,
  loading,
  error,
  enabled,
}: {
  preview: GoalPreview | null;
  loading: boolean;
  error: string;
  enabled: boolean;
}) {
  if (!enabled) return null;

  return (
    <div className="mt-5 rounded-lg border border-line bg-canvas p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">Suggested targets</p>
        {loading && <span className="auth-spinner text-brand" aria-label="Calculating goals" />}
      </div>

      {preview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              icon={Flame}
              label="Calories"
              value={`${numberText(preview.targetCalories)} kcal`}
            />
            <MetricTile icon={Calculator} label="TDEE" value={`${numberText(preview.tdee)} kcal`} />
            <MetricTile
              icon={Gauge}
              label="Daily change"
              value={`${preview.calorieAdjustment > 0 ? "+" : ""}${numberText(
                preview.calorieAdjustment,
              )} kcal`}
            />
            <MetricTile icon={CalendarDays} label="Target date" value={dateText(preview.targetDate)} />
          </div>
          <div className="mt-3 grid gap-2 rounded-lg bg-surface p-3 text-sm font-bold text-ink sm:grid-cols-3">
            <span>Protein {numberText(preview.targetProtein)}g</span>
            <span>Carbs {numberText(preview.targetCarbs)}g</span>
            <span>Fat {numberText(preview.targetFat)}g</span>
          </div>
          {preview.warnings.length > 0 && (
            <div className="mt-3 grid gap-2">
              {preview.warnings.map((warning) => (
                <p key={warning} className="rounded-lg bg-surface px-3 py-2 text-xs text-muted">
                  {warning}
                </p>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted">
          {error || "Select the formula sex to calculate goal targets."}
        </p>
      )}

      {preview && error && <p className="form-error mt-3">{error}</p>}
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted">
        <Icon size={15} aria-hidden="true" />
        {label}
      </div>
      <p className="text-base font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
