"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  FileText,
  Pencil,
} from "lucide-react";
import api, { getApiError } from "../store/api";
import { fetchMealActivity, type Meal } from "../store/features/activitySlice";
import type { User } from "../store/features/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { NUTRIENT_UNITS, scaleNutrient } from "../store/nutritionUnits";
import DatePicker from "./calender";

type Notice = { kind: "success" | "error"; text: string } | null;

const dateInTimezone = (date: Date, timezone?: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
};

const profileIsComplete = (user: User) => {
  const values = [
    user.age,
    user.weight,
    user.height,
    user.dailyGoals.targetCalories,
    user.dailyGoals.targetProtein,
    user.dailyGoals.targetCarb,
    user.dailyGoals.targetFat,
  ];
  return Boolean(
    user.name.trim() &&
      user.email.trim() &&
      values.every(Number.isFinite) &&
      user.age > 0 &&
      user.weight > 0 &&
      user.height > 0 &&
      user.dailyGoals.targetCalories > 0,
  );
};

const mealCalories = (meal: Meal) =>
  meal.list.reduce(
    (sum, item) =>
      sum +
      (item.foodItem
        ? scaleNutrient(
            item.foodItem,
            item.foodItem.nutrition.calories,
            item.quantity,
          )
        : 0),
    0,
  );

export default function SimplifiedDietChart() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { current, loading, error } = useAppSelector((state) => state.activity);
  const [requestingPdf, setRequestingPdf] = useState(false);
  const [copying, setCopying] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const today = dateInTimezone(new Date(), user?.timezone);
  const selectedDate = current.selectedDate || today;
  const isToday = selectedDate === today;
  const meals = useMemo(
    () => current.chart.meals.filter((meal) => meal.list.length > 0),
    [current.chart.meals],
  );
  const totalCalories = useMemo(
    () => meals.reduce((sum, meal) => sum + mealCalories(meal), 0),
    [meals],
  );

  const returnToToday = () => {
    setNotice(null);
    void dispatch(fetchMealActivity(today));
  };

  const requestPdf = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    if (!profileIsComplete(user)) {
      setNotice({
        kind: "error",
        text: "Complete your profile before requesting a diet chart PDF.",
      });
      return;
    }

    setRequestingPdf(true);
    setNotice(null);
    try {
      const { data } = await api.post<{ message: string }>(
        "/diet-chart-exports/requests",
        null,
        { params: { date: selectedDate } },
      );
      setNotice({ kind: "success", text: data.message });
    } catch (requestError) {
      setNotice({
        kind: "error",
        text: getApiError(requestError, "Unable to save the PDF request."),
      });
    } finally {
      setRequestingPdf(false);
    }
  };

  const copyToToday = async () => {
    if (isToday || !user) return;
    const confirmed = window.confirm(
      "Replace today’s meals with the meals from this date?",
    );
    if (!confirmed) return;

    setCopying(true);
    setNotice(null);
    try {
      const { data } = await api.post<{ date: string }>(
        "/meal-activities/copy-to-today",
        null,
        { params: { date: selectedDate } },
      );
      await dispatch(fetchMealActivity(data.date)).unwrap();
      setNotice({ kind: "success", text: "Meals copied to today." });
    } catch (copyError) {
      setNotice({
        kind: "error",
        text: getApiError(copyError, "Unable to copy these meals to today."),
      });
    } finally {
      setCopying(false);
    }
  };

  if (!initialized) return <div className="min-h-[60vh] bg-canvas" />;

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 text-center">
        <div className="card w-full p-7">
          <FileText className="mx-auto mb-3 text-brand" size={32} />
          <h1 className="text-xl font-bold text-ink">Your diary is private</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Sign in to view your daily diet chart.</p>
          <Link href="/auth/signin" className="btn btn-primary mt-5 w-full">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-3xl bg-canvas px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Diet diary</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Your daily chart</h1>
        <div className="mt-3 flex justify-center"><DatePicker /></div>
        {!isToday && (
          <button type="button" onClick={returnToToday} disabled={loading} className="btn btn-ghost btn-sm mt-2">
            <CalendarClock size={16} /> Return to today
          </button>
        )}
      </header>

      {(error || notice) && (
        <div
          role="status"
          className={`mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice?.kind === "success"
              ? "border-brand/20 bg-brand-soft text-brand-active"
              : "border-red-200 bg-red-50 text-danger"
          }`}
        >
          {notice?.kind === "success" && <CheckCircle2 className="mt-0.5 shrink-0" size={17} />}
          <div>
            <span>{notice?.text || error}</span>
            {notice?.kind === "error" && notice.text.startsWith("Complete your profile") && (
              <Link href="/profile" className="ml-1 font-bold underline">Update profile</Link>
            )}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-brand-soft/50 px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold text-muted">Daily total</p>
            <p className="text-xl font-bold text-ink">{totalCalories.toFixed(1)} {NUTRIENT_UNITS.calories}</p>
          </div>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-brand shadow-sm">
            {meals.length} {meals.length === 1 ? "meal" : "meals"}
          </span>
        </div>

        <div className="divide-y divide-line">
          {meals.map((meal) => (
            <article key={meal.id} className="px-4 py-4 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="font-bold text-ink">{meal.mealType}</h2>
                <span className="text-sm font-bold text-brand">{mealCalories(meal).toFixed(1)} {NUTRIENT_UNITS.calories}</span>
              </div>
              <ul className="space-y-2">
                {meal.list.map((item, index) => (
                  <li key={`${item.foodItem?.id || "food"}-${index}`} className="flex items-center justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate text-ink">{item.foodItem?.name || "Unavailable food"}</span>
                    <span className="shrink-0 text-xs font-semibold text-muted">{item.quantity} {item.foodItem?.unit || "serving"}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          {!loading && meals.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto mb-3 text-muted" size={30} />
              <p className="font-bold text-ink">No meals recorded</p>
              <p className="mt-1 text-sm text-muted">Use Edit to add meals for this date.</p>
            </div>
          )}
          {loading && <div className="px-6 py-12 text-center text-sm text-muted">Loading chart…</div>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Diary actions">
        <Link href="/manage_meals" className="btn btn-secondary px-2"><Pencil size={17} /><span>Edit</span></Link>
        <button type="button" onClick={requestPdf} disabled={requestingPdf} className="btn btn-primary px-2">
          <FileText size={17} /><span>{requestingPdf ? "Saving…" : "Get PDF"}</span>
        </button>
        <button type="button" onClick={copyToToday} disabled={isToday || copying} className="btn btn-secondary px-2">
          <Copy size={17} /><span>{copying ? "Copying…" : "Copy"}</span>
        </button>
      </div>
      {isToday && <p className="mt-2 text-right text-xs text-muted">Copy becomes available when viewing another date.</p>}
    </section>
  );
}
