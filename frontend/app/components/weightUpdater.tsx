'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Save, Weight } from 'lucide-react';
import { updateProfile } from '../store/features/authSlice';
import { saveDailyActivityMetrics } from '../store/features/activitySlice';
import type { AuthError } from '../store/features/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function WeightUpdater() {
  const dispatch = useAppDispatch();
  const { user, profileLoading, profileError } = useAppSelector((state) => state.auth);
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
  const [draft, setDraft] = useState({
    weight: '',
    unit: 'kg' as 'kg' | 'lb',
    dirty: false,
  });
  const [fieldError, setFieldError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const weight = draft.dirty ? draft.weight : String(user.weight);
  const unit = draft.dirty ? draft.unit : user.weightUnit;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextWeight = Number(weight);

    if (!Number.isFinite(nextWeight) || nextWeight < 20 || nextWeight > 700) {
      setFieldError('Weight must be between 20 and 700.');
      setSaved(false);
      return;
    }

    try {
      await dispatch(
        updateProfile({
          weight: nextWeight,
          weight_unit: unit,
        }),
      ).unwrap();
      void dispatch(
        saveDailyActivityMetrics({
          date: selectedDate || undefined,
          weight: nextWeight,
          weight_unit: unit,
        }),
      );
      setDraft({ weight: String(nextWeight), unit, dirty: false });
      setFieldError('');
      setSaved(true);
    } catch (reason) {
      const fields = (reason as AuthError).fields || {};
      const weightError = fields.weight;
      setFieldError(
        Array.isArray(weightError)
          ? weightError[0]
          : weightError
            ? String(weightError)
            : '',
      );
      setSaved(false);
    }
  };

  return (
    <section className="card m-2 flex flex-col gap-4 p-4">
      <div className="fc w-full flex-row border-b border-line pb-2">
        <h2 className="text-lg">Weight</h2>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="form-field" htmlFor="daily-weight">
          <span className="form-label">Current weight</span>
          <span className="relative flex">
            <Weight
              size={17}
              className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="daily-weight"
              type="number"
              min="20"
              max="700"
              step="0.01"
              value={weight}
              onChange={(event) => {
                setDraft({ weight: event.target.value, unit, dirty: true });
                setFieldError('');
                setSaved(false);
              }}
              className="form-control !rounded-r-none !pl-10"
              aria-invalid={Boolean(fieldError)}
            />
            <select
              aria-label="Weight unit"
              value={unit}
              onChange={(event) => {
                setDraft({
                  weight,
                  unit: event.target.value as 'kg' | 'lb',
                  dirty: true,
                });
                setSaved(false);
              }}
              className="rounded-r-[0.625rem] border border-l-0 border-line bg-surface px-3 text-sm font-bold text-brand"
            >
              <option>kg</option>
              <option>lb</option>
            </select>
          </span>
          {fieldError && <span className="form-error">{fieldError}</span>}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-sm">
            {saved && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                <CheckCircle2 size={17} /> Profile updated
              </span>
            )}
            {!saved && profileError && <span className="text-danger">{profileError}</span>}
          </div>
          <button type="submit" disabled={profileLoading} className="btn btn-primary justify-center sm:min-w-36">
            {profileLoading ? (
              <span className="auth-spinner" aria-label="Updating weight" />
            ) : (
              <>
                <Save size={17} /> Update
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
