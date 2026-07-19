"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, Ruler, Save, UserRound, Weight } from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  AuthError,
  User,
  updateProfile,
  UpdateProfileData,
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
  target_calories: string;
  target_protein: string;
  target_carbs: string;
  target_fat: string;
};

const emptyForm: ProfileForm = {
  name: "",
  age: "",
  weight: "",
  weight_unit: "kg",
  height: "",
  height_inches: "0",
  height_unit: "cm",
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
    target_calories: String(user.dailyGoals.targetCalories),
    target_protein: String(user.dailyGoals.targetProtein),
    target_carbs: String(user.dailyGoals.targetCarb),
    target_fat: String(user.dailyGoals.targetFat),
  };
};

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, initialized, profileLoading } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [formUserId, setFormUserId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  if (user && formUserId !== user.id) {
    setFormUserId(user.id);
    setForm(formFromUser(user));
  }

  const update = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
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
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await dispatch(updateProfile(payload)).unwrap();
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
        <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm mb-5 -ml-2">
          <ArrowLeft size={17} /> Back
        </button>

        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-brand">Account settings</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Edit your profile</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Keep your body measurements and nutrition targets accurate.</p>
        </div>

        <form onSubmit={submit} className="card overflow-hidden">
          <section className="border-b border-line p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-ink">Personal information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="name" value={form.name} onChange={(value) => update("name", value)} icon={UserRound} error={fieldErrors.name} />
              <label className="form-field">
                <span className="form-label">Email address</span>
                <input value={user.email} readOnly className="form-control bg-canvas text-muted" aria-label="Email address" />
                <span className="text-xs text-muted">Contact support to change your email.</span>
              </label>
              <Field label="Age" name="age" type="number" min="13" max="120" value={form.age} onChange={(value) => update("age", value)} icon={UserRound} error={fieldErrors.age} />
              <div className="hidden sm:block" />
              <MeasurementField label="Weight" name="weight" icon={Weight} value={form.weight} unit={form.weight_unit} units={["kg", "lb"]} onValueChange={(value) => update("weight", value)} onUnitChange={(value) => update("weight_unit", value as "kg" | "lb")} error={fieldErrors.weight} />
              <HeightField label="Height" name="height" icon={Ruler} value={form.height} inches={form.height_inches} unit={form.height_unit} onValueChange={(value) => update("height", value)} onInchesChange={(value) => update("height_inches", value)} onUnitChange={updateHeightUnit} error={fieldErrors.height} />
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
                <p className="shrink-0 text-2xl font-bold tabular-nums text-ink">{formatBmi(bmi)}</p>
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-7">
            <h2 className="text-lg font-bold text-ink">Daily nutrition targets</h2>
            <p className="mb-5 mt-1 text-xs text-muted">Adjust these values to match guidance from your nutrition plan.</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <NumberField label="Calories" unit={NUTRIENT_UNITS.calories} name="target_calories" value={form.target_calories} onChange={(value) => update("target_calories", value)} error={fieldErrors.target_calories} />
              <NumberField label="Protein" unit={NUTRIENT_UNITS.protein} name="target_protein" value={form.target_protein} onChange={(value) => update("target_protein", value)} error={fieldErrors.target_protein} />
              <NumberField label="Carbs" unit={NUTRIENT_UNITS.carbs} name="target_carbs" value={form.target_carbs} onChange={(value) => update("target_carbs", value)} error={fieldErrors.target_carbs} />
              <NumberField label="Fat" unit={NUTRIENT_UNITS.fats} name="target_fat" value={form.target_fat} onChange={(value) => update("target_fat", value)} error={fieldErrors.target_fat} />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
            <button type="submit" disabled={profileLoading} className="btn btn-primary sm:min-w-36">
              {profileLoading ? <span className="auth-spinner" aria-label="Saving profile" /> : <><Save size={17} /> Save changes</>}
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
  icon: typeof UserRound;
  onChange: (value: string) => void;
  error?: string;
}

function Field({ label, name, value, icon: Icon, onChange, error, ...props }: FieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative"><Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input {...props} id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} className="form-control !pl-10" aria-invalid={Boolean(error)} /></span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface MeasurementProps { label: string; name: string; value: string; unit: string; units: string[]; icon: typeof Weight; onValueChange: (value: string) => void; onUnitChange: (value: string) => void; error?: string }
function MeasurementField({ label, name, value, unit, units, icon: Icon, onValueChange, onUnitChange, error }: MeasurementProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative flex"><Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" /><input id={name} type="number" min="1" step="0.01" value={value} onChange={(event) => onValueChange(event.target.value)} className="form-control !rounded-r-none !pl-10" aria-invalid={Boolean(error)} /><select aria-label={`${label} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value)} className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand">{units.map((item) => <option key={item}>{item}</option>)}</select></span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface HeightFieldProps { label: string; name: string; value: string; inches: string; unit: "cm" | "ft"; icon: typeof Ruler; onValueChange: (value: string) => void; onInchesChange: (value: string) => void; onUnitChange: (value: "cm" | "ft") => void; error?: string }
function HeightField({ label, name, value, inches, unit, icon: Icon, onValueChange, onInchesChange, onUnitChange, error }: HeightFieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      {unit === "ft" ? (
        <span className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <span className="relative">
            <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
            <input id={name} type="number" min="1" step="1" value={value} onChange={(event) => onValueChange(event.target.value)} className="form-control !rounded-r-none !pl-10 !pr-8" aria-invalid={Boolean(error)} />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">ft</span>
          </span>
          <span className="relative -ml-px">
            <input id={`${name}_inches`} type="number" min="0" max="11" step="1" value={inches} onChange={(event) => onInchesChange(event.target.value)} className="form-control !rounded-none !pr-8" aria-invalid={Boolean(error)} aria-label="Height inches" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">in</span>
          </span>
          <select aria-label={`${label} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value as "cm" | "ft")} className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand">
            {["cm", "ft"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </span>
      ) : (
        <span className="relative flex">
          <Icon size={17} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
          <input id={name} type="number" min="1" step="0.01" value={value} onChange={(event) => onValueChange(event.target.value)} className="form-control !rounded-r-none !pl-10" aria-invalid={Boolean(error)} />
          <select aria-label={`${label} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value as "cm" | "ft")} className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand">
            {["cm", "ft"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </span>
      )}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

interface NumberFieldProps { label: string; unit: string; name: string; value: string; onChange: (value: string) => void; error?: string }
function NumberField({ label, unit, name, value, onChange, error }: NumberFieldProps) {
  return (
    <label className="form-field" htmlFor={name}>
      <span className="form-label">{label}</span>
      <span className="relative"><input id={name} type="number" min="0" value={value} onChange={(event) => onChange(event.target.value)} className="form-control !pr-12" aria-invalid={Boolean(error)} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">{unit}</span></span>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}
