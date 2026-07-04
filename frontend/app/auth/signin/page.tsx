"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AuthError, clearAuthError, loginUser } from "../../store/features/authSlice";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => { if (user) router.replace("/"); }, [router, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      router.replace("/");
    } catch (reason) {
      const fields = (reason as AuthError).fields || {};
      setFieldErrors(Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])));
    }
  };

  return (
    <AuthShell mode="signin">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-brand">Welcome back</p>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sign in to your account</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Continue your nutrition plan and pick up right where you left off.</p>
        </div>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}
          <label className="form-field" htmlFor="email">
            <span className="form-label">Email address</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="form-control !min-h-12 !pl-11" aria-invalid={Boolean(fieldErrors.email)} />
            </span>
            {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
          </label>
          <PasswordField label="Password" id="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required error={fieldErrors.password || fieldErrors.detail} />
          <button type="submit" disabled={loading || !email || !password} className="btn btn-primary btn-lg mt-1 w-full">
            {loading ? <span className="auth-spinner" aria-label="Signing in" /> : <>Sign in <ArrowRight size={18} /></>}
          </button>
          <p className="text-center text-xs leading-5 text-muted">Secure access uses short-lived and renewable authentication tokens.</p>
        </form>
      </div>
    </AuthShell>
  );
}
