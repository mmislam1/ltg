"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Ruler, UserRound, Weight } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AuthError, clearAuthError, registerUser, SignUpData } from "../../store/features/authSlice";

type FormState = Omit<SignUpData, "age" | "weight" | "height"> & { age: string; weight: string; height: string };
const initialForm: FormState = { name: "", email: "", age: "", weight: "", weight_unit: "kg", height: "", height_unit: "cm", password: "", password_confirm: "" };

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, user } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) router.replace("/"); }, [router, user]);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };
  const validate = () => {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email address.";
    if (Number(form.age) < 13 || Number(form.age) > 120) errors.age = "Age must be between 13 and 120.";
    if (Number(form.weight) <= 0) errors.weight = "Enter your current weight.";
    if (Number(form.height) <= 0) errors.height = "Enter your height.";
    if (form.password.length < 8) errors.password = "Use at least 8 characters.";
    if (form.password !== form.password_confirm) errors.password_confirm = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(registerUser({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
      })).unwrap();
      router.replace("/");
    } catch (reason) {
      const authError = reason as AuthError;
      const fields = authError.fields || {};
      setFieldErrors((current) => ({ ...current, ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])) }));
      toast.error(authError.message || "Account creation failed. Please try again.");
    }
  };

  return (
    <AuthShell mode="signup">
      <div className="w-full max-w-2xl">
        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-brand">Start your journey</p>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Create your account</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Tell us the essentials so we can tailor your daily nutrition targets.</p>
        </div>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField icon={UserRound} label="Full name" name="name" value={form.name} onChange={(value) => update("name", value)} placeholder="Your full name" autoComplete="name" error={fieldErrors.name} />
            <TextField icon={Mail} label="Email address" name="email" type="email" value={form.email} onChange={(value) => update("email", value)} placeholder="you@example.com" autoComplete="email" error={fieldErrors.email} />
          </div>
          <div className="grid gap-5 sm:grid-cols-[0.7fr_1fr_1fr]">
            <TextField icon={UserRound} label="Age" name="age" type="number" value={form.age} onChange={(value) => update("age", value)} placeholder="28" min="13" max="120" inputMode="numeric" error={fieldErrors.age} />
            <MeasurementField icon={Weight} label="Weight" name="weight" value={form.weight} unit={form.weight_unit} units={["kg", "lb"]} onValueChange={(value) => update("weight", value)} onUnitChange={(value) => update("weight_unit", value)} error={fieldErrors.weight} />
            <MeasurementField icon={Ruler} label="Height" name="height" value={form.height} unit={form.height_unit} units={["cm", "ft"]} onValueChange={(value) => update("height", value)} onUnitChange={(value) => update("height_unit", value)} error={fieldErrors.height} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField label="Password" id="password" name="password" value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" placeholder="At least 8 characters" required error={fieldErrors.password} />
            <PasswordField label="Confirm password" id="password_confirm" name="password_confirm" value={form.password_confirm} onChange={(event) => update("password_confirm", event.target.value)} autoComplete="new-password" placeholder="Repeat your password" required error={fieldErrors.password_confirm} />
          </div>
          <div className="rounded-xl border border-line bg-brand-soft/50 px-4 py-3 text-xs leading-5 text-muted">Use 8+ characters and avoid common passwords. Your measurements stay private and personalize your plan.</div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full sm:justify-self-end sm:px-8">
            {loading ? <span className="auth-spinner" aria-label="Creating account" /> : <>Create account <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> { icon: typeof UserRound; label: string; name: string; value: string; onChange: (value: string) => void; error?: string }
function TextField({ icon: Icon, label, name, value, onChange, error, ...props }: TextFieldProps) {
  return <label className="form-field" htmlFor={name}><span className="form-label">{label}</span><span className="relative block"><Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} /><input {...props} id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} required aria-invalid={Boolean(error)} className="form-control !min-h-12 !pl-11" /></span>{error && <span className="form-error">{error}</span>}</label>;
}

interface MeasurementFieldProps { icon: typeof Weight; label: string; name: string; value: string; unit: string; units: string[]; onValueChange: (value: string) => void; onUnitChange: (value: string) => void; error?: string }
function MeasurementField({ icon: Icon, label, name, value, unit, units, onValueChange, onUnitChange, error }: MeasurementFieldProps) {
  return <label className="form-field" htmlFor={name}><span className="form-label">{label}</span><span className="relative flex"><Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" size={18} /><input id={name} name={name} type="number" min="1" step="0.01" inputMode="decimal" value={value} onChange={(event) => onValueChange(event.target.value)} required aria-invalid={Boolean(error)} className="form-control !min-h-12 !rounded-r-none !pl-11" placeholder={unit === "cm" ? "175" : unit === "ft" ? "5.9" : unit === "kg" ? "70" : "154"} /><select aria-label={`${label} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value)} className="min-h-12 rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-2 text-sm font-bold text-brand focus:border-brand focus:outline-none">{units.map((item) => <option key={item}>{item}</option>)}</select></span>{error && <span className="form-error">{error}</span>}</label>;
}
