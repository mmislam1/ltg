"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { DiaryPdfPreview } from "../components/simplifiedDietChart";
import { useAppSelector } from "../store/hooks";

export default function NutritionChart() {
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { current, loading, error } = useAppSelector((state) => state.activity);
  const meals = useMemo(
    () => current.chart.meals.filter((meal) => meal.list.length > 0),
    [current.chart.meals],
  );
  const selectedDate = current.selectedDate || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!initialized) return <div className="min-h-[60vh] bg-canvas" />;

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 text-center">
        <div className="card w-full p-7">
          <FileText className="mx-auto mb-3 text-brand" size={32} />
          <h1 className="text-xl font-bold text-ink">Your diet chart is private</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Sign in to view your daily diet chart.</p>
          <Link href="/auth/signin" className="btn btn-primary mt-5 w-full">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-5xl bg-canvas px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Diet chart</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Daily chart preview</h1>
        <p className="mt-2 text-sm leading-6 text-muted">The macro overview is shown once with targets, progress, and distribution together.</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <DiaryPdfPreview
          user={user}
          date={selectedDate}
          meals={meals}
          water={current.water}
          steps={current.steps}
          loading={loading}
        />
      </div>
    </section>
  );
}
