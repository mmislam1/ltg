"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Copy, FileText, Pencil } from "lucide-react";
import api, { getApiError } from "../store/api";
import { fetchMealActivity, type ListItems, type Meal } from "../store/features/activitySlice";
import type { User } from "../store/features/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { NUTRIENT_UNITS, scaleNutrient } from "../store/nutritionUnits";
import DatePicker from "./calender";

type Notice = { kind: "success" | "error"; text: string } | null;
type MacroValues = { calories: number; protein: number; carbs: number; fats: number };

const PDF_COLORS = {
  ink: "#172B2A",
  muted: "#657473",
  brand: "#0F766E",
  brandDark: "#115E59",
  brandSoft: "#DFF4F0",
  canvas: "#F5F8F7",
  line: "#DDE7E5",
  calories: "#F59E0B",
  protein: "#0EA5E9",
  carbs: "#8B5CF6",
  fats: "#F97316",
} as const;

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

const displayDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf())
    ? date
    : parsed.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
};

const compact = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 1 })
    : "0";

const itemMacros = (item: ListItems): MacroValues => ({
  calories: item.foodItem
    ? scaleNutrient(item.foodItem, item.foodItem.nutrition.calories, item.quantity)
    : 0,
  protein: item.foodItem
    ? scaleNutrient(item.foodItem, item.foodItem.nutrition.protein, item.quantity)
    : 0,
  carbs: item.foodItem
    ? scaleNutrient(item.foodItem, item.foodItem.nutrition.carbs, item.quantity)
    : 0,
  fats: item.foodItem
    ? scaleNutrient(item.foodItem, item.foodItem.nutrition.fats, item.quantity)
    : 0,
});

const chartTotals = (meals: Meal[]) =>
  meals.reduce<MacroValues>(
    (totals, meal) => {
      meal.list.forEach((item) => {
        const macros = itemMacros(item);
        totals.calories += macros.calories;
        totals.protein += macros.protein;
        totals.carbs += macros.carbs;
        totals.fats += macros.fats;
      });
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

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
  const totals = useMemo(() => chartTotals(meals), [meals]);

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
      setNotice({ kind: "error", text: "Complete your profile before requesting a diet chart PDF." });
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
      setNotice({ kind: "error", text: getApiError(requestError, "Unable to save the PDF request.") });
    } finally {
      setRequestingPdf(false);
    }
  };

  const copyToToday = async () => {
    if (isToday || !user) return;
    if (!window.confirm("Replace today's meals with the meals from this date?")) return;

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
      setNotice({ kind: "error", text: getApiError(copyError, "Unable to copy these meals to today.") });
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
    <section className="mx-auto min-h-screen w-full max-w-5xl bg-canvas px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Diet diary</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Your daily chart</h1>
      </header>

      {(error || notice) && (
        <div role="status" className={`mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice?.kind === "success" ? "border-brand/20 bg-brand-soft text-brand-active" : "border-red-200 bg-red-50 text-danger"}`}>
          {notice?.kind === "success" && <CheckCircle2 className="mt-0.5 shrink-0" size={17} />}
          <div>
            <span>{notice?.text || error}</span>
            {notice?.kind === "error" && notice.text.startsWith("Complete your profile") && (
              <Link href="/profile" className="ml-1 font-bold underline">Update profile</Link>
            )}
          </div>
        </div>
      )}

      <div className="card relative z-20 mb-4 flex min-h-16 items-center justify-between gap-3 overflow-visible px-3 py-2 sm:px-5">
        <DatePicker />
        {!isToday && (
          <button type="button" onClick={returnToToday} disabled={loading} className="btn btn-ghost btn-sm shrink-0">
            <CalendarClock size={16} /> <span className="hidden sm:inline">Return to today</span><span className="sm:hidden">Today</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
        <article className="mx-auto min-w-[760px] max-w-[800px] bg-white text-[#172B2A]">
          <PdfHero user={user} date={selectedDate} />
          <div className="px-10 py-8">
            <MacroCards user={user} totals={totals} />
            <div className="mt-7">
              {loading ? (
                <div className="rounded-lg bg-[#F5F8F7] px-5 py-12 text-center text-sm text-[#657473]">Loading chart...</div>
              ) : meals.length === 0 ? (
                <div className="rounded-lg bg-[#F5F8F7] px-5 py-8">
                  <h2 className="font-bold">No meals recorded</h2>
                  <p className="mt-2 text-sm text-[#657473]">Add meals to your diary and export this chart again.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {meals.map((meal) => <MealTable key={meal.id} meal={meal} />)}
                </div>
              )}
            </div>
            <DailyTotal totals={totals} />
            <NutritionDistribution totals={totals} />
            <div className="mt-8 flex items-center justify-between border-t border-[#DDE7E5] pt-3 text-[10px] text-[#657473]">
              <span>LOSE TO GAIN / DIET CHART</span><span>PDF preview</span>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Diary actions">
        <Link href="/manage_meals" className="btn btn-secondary px-2"><Pencil size={17} /><span>Edit</span></Link>
        <button type="button" onClick={requestPdf} disabled={requestingPdf} className="btn btn-primary px-2">
          <FileText size={17} /><span>{requestingPdf ? "Saving..." : "Get PDF"}</span>
        </button>
        <button type="button" onClick={copyToToday} disabled={isToday || copying} className="btn btn-secondary px-2">
          <Copy size={17} /><span>{copying ? "Copying..." : "Copy"}</span>
        </button>
      </div>
      {isToday && <p className="mt-2 text-right text-xs text-muted">Copy becomes available when viewing another date.</p>}
    </section>
  );
}

function PdfHero({ user, date }: { user: User; date: string }) {
  return (
    <div className="relative h-[176px] overflow-hidden bg-[#115E59] px-10 py-8 text-white">
      <span className="absolute -right-5 -top-16 h-36 w-36 rounded-full bg-[#147A72]" />
      <span className="absolute -bottom-16 -right-8 h-32 w-32 rounded-full bg-[#0D514D]" />
      <div className="relative">
        <p className="text-[11px] font-bold tracking-[0.18em]">LOSE TO GAIN</p>
        <h2 className="mt-2 text-[28px] font-bold leading-tight">Your daily diet chart</h2>
        <p className="mt-3 text-[11px] text-[#CDE9E5]">{displayDate(date)}</p>
        <p className="mt-2 text-[11px] text-[#CDE9E5]">{user.name} &nbsp; | &nbsp; {compact(user.weight)} {user.weightUnit} &nbsp; | &nbsp; {compact(user.height)} {user.heightUnit} &nbsp; | &nbsp; {user.age} years</p>
      </div>
    </div>
  );
}

function MacroCards({ user, totals }: { user: User; totals: MacroValues }) {
  const cards = [
    { label: "CALORIES", key: "calories", goal: user.dailyGoals.targetCalories, unit: "kcal", color: PDF_COLORS.calories },
    { label: "PROTEIN", key: "protein", goal: user.dailyGoals.targetProtein, unit: "g", color: PDF_COLORS.protein },
    { label: "CARBS", key: "carbs", goal: user.dailyGoals.targetCarb, unit: "g", color: PDF_COLORS.carbs },
    { label: "FATS", key: "fats", goal: user.dailyGoals.targetFat, unit: "g", color: PDF_COLORS.fats },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => {
        const consumed = totals[card.key];
        const ratio = card.goal > 0 ? Math.min(consumed / card.goal, 1) : 0;
        return (
          <div key={card.key} className="rounded-lg bg-[#F5F8F7] p-4">
            <p className="text-[9px] font-bold tracking-[0.1em] text-[#657473]">{card.label}</p>
            <p className="mt-2 text-xl font-bold">{compact(consumed)}</p>
            <p className="mt-1 text-[10px] text-[#657473]">/ {compact(card.goal)} {card.unit}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#DDE7E5]"><div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: card.color }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function MealTable({ meal }: { meal: Meal }) {
  return (
    <section>
      <h3 className="rounded-lg bg-[#DFF4F0] px-4 py-3 text-[11px] font-bold tracking-[0.1em] text-[#115E59]">{meal.mealType?.toUpperCase()}</h3>
      <table className="mt-2 w-full table-fixed border-collapse text-[10px]">
        <colgroup><col className="w-[36%]" /><col className="w-[14%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[13%]" /><col className="w-[13%]" /></colgroup>
        <thead className="bg-[#ECF2F1] text-[9px] font-bold text-[#657473]">
          <tr><th className="px-3 py-2 text-left">FOOD</th><th className="px-3 py-2 text-left">SERVING</th><th className="px-3 py-2 text-right">CAL</th><th className="px-3 py-2 text-right">PROTEIN</th><th className="px-3 py-2 text-right">CARBS</th><th className="px-3 py-2 text-right">FATS</th></tr>
        </thead>
        <tbody>
          {meal.list.map((item, index) => {
            const macros = itemMacros(item);
            return (
              <tr key={`${item.foodItem?.id || "food"}-${index}`} className={`border-b border-[#DDE7E5] ${index % 2 === 1 ? "bg-[#FAFCFB]" : "bg-white"}`}>
                <td className="px-3 py-3 font-medium">{item.foodItem?.name || "Unavailable food"}</td>
                <td className="px-3 py-3">{compact(item.quantity)} {item.foodItem?.unit || "serving"}</td>
                <td className="px-3 py-3 text-right">{compact(macros.calories)}</td>
                <td className="px-3 py-3 text-right">{compact(macros.protein)} g</td>
                <td className="px-3 py-3 text-right">{compact(macros.carbs)} g</td>
                <td className="px-3 py-3 text-right">{compact(macros.fats)} g</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function DailyTotal({ totals }: { totals: MacroValues }) {
  return (
    <div className="mt-5 flex items-center justify-between rounded-lg bg-[#172B2A] px-5 py-5 text-white">
      <span className="text-xs font-bold tracking-[0.08em]">DAILY TOTAL</span>
      <span className="text-[11px]">{compact(totals.calories)} kcal &nbsp; | &nbsp; {compact(totals.protein)} g protein &nbsp; | &nbsp; {compact(totals.carbs)} g carbs &nbsp; | &nbsp; {compact(totals.fats)} g fats</span>
    </div>
  );
}

function NutritionDistribution({ totals }: { totals: MacroValues }) {
  const entries = [
    { label: "Protein", grams: totals.protein, calories: totals.protein * 4, color: PDF_COLORS.protein },
    { label: "Carbohydrates", grams: totals.carbs, calories: totals.carbs * 4, color: PDF_COLORS.carbs },
    { label: "Fats", grams: totals.fats, calories: totals.fats * 9, color: PDF_COLORS.fats },
  ];
  const calorieTotal = entries.reduce((sum, item) => sum + item.calories, 0);

  return (
    <section className="mt-6">
      <h3 className="text-xs font-bold tracking-[0.08em]">NUTRITION DISTRIBUTION</h3>
      <p className="mt-1 text-[10px] text-[#657473]">Share of macro-derived calories</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {entries.map((item) => {
          const percent = calorieTotal > 0 ? (item.calories / calorieTotal) * 100 : 0;
          return (
            <div key={item.label} className="rounded-lg bg-[#F5F8F7] p-4">
              <p className="text-xl font-bold" style={{ color: item.color }}>{compact(percent)}%</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.06em]">{item.label.toUpperCase()}</p>
              <p className="mt-2 text-[10px] text-[#657473]">{compact(item.calories)} kcal from {compact(item.grams)} g</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
