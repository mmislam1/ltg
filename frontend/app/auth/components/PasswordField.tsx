"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function PasswordField({ label, error, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;
  return (
    <label className="form-field" htmlFor={inputId}>
      <span className="form-label">{label}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input {...props} id={inputId} type={visible ? "text" : "password"} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} className="form-control !min-h-12 !pl-11 !pr-11" />
        <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-brand-soft hover:text-brand" aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && <span id={`${inputId}-error`} className="form-error">{error}</span>}
    </label>
  );
}
