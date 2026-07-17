'use client';

import { FormEvent, useState } from 'react';
import { Footprints, Plus } from 'lucide-react';
import {
  addSteps,
  saveDailyActivityMetrics,
} from '../store/features/activitySlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const MAX_DAILY_STEPS = 250_000;

export default function StepCounter() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector((state) => state.activity.current.steps);
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
  const [entry, setEntry] = useState('');
  const [fieldError, setFieldError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const amount = Number(entry);

    if (!Number.isInteger(amount) || amount <= 0) {
      setFieldError('Enter whole steps greater than 0.');
      return;
    }

    const nextSteps = Math.min(MAX_DAILY_STEPS, steps + amount);
    const amountToAdd = nextSteps - steps;
    if (amountToAdd <= 0) {
      setFieldError('Daily steps are already at the limit.');
      return;
    }

    dispatch(addSteps(amountToAdd));
    void dispatch(
      saveDailyActivityMetrics({
        date: selectedDate || undefined,
        steps: nextSteps,
      }),
    );
    setEntry('');
    setFieldError('');
  };

  return (
    <section className="card m-2 flex flex-col gap-4 p-4">
      <div className="fc w-full flex-row border-b border-line pb-2">
        <h2 className="text-lg">Steps</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Footprints size={24} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-muted">Today</p>
            <p className="truncate text-2xl font-bold text-ink">
              {steps.toLocaleString()} steps
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          min="1"
          max={MAX_DAILY_STEPS}
          step="1"
          inputMode="numeric"
          value={entry}
          onChange={(event) => {
            setEntry(event.target.value);
            setFieldError('');
          }}
          className="form-control sm:flex-1"
          placeholder="Steps taken"
          aria-label="Steps taken today"
          aria-invalid={Boolean(fieldError)}
        />
        <button type="submit" className="btn btn-primary justify-center sm:min-w-32">
          <Plus size={17} /> Add
        </button>
      </form>

      {fieldError && <p className="form-error">{fieldError}</p>}
    </section>
  );
}
