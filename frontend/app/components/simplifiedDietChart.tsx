"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Copy, Droplets, FileText, Footprints, Pencil } from "lucide-react";
import { toast } from "sonner";
import { bmiFromMeasurements, formatBmi, formatHeight } from "../bodyMetrics";
import api, { getApiError } from "../store/api";
import { fetchMealActivity, type ListItems, type Meal } from "../store/features/activitySlice";
import type { User } from "../store/features/authSlice";
import type { Minerals, Vitamins } from "../store/features/foodSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { countedCalories, scaleNutrient } from "../store/nutritionUnits";
import DatePicker from "./calender";
import NutritionLists, { MINERAL_NUTRIENTS, VITAMIN_NUTRIENTS } from "./nutritionLists";
import { MacroCalorieRing } from "./ringChart";

type MacroValues = { calories: number; protein: number; carbs: number; fats: number };
type NutritionTotals = MacroValues & {
  fiber: number;
  netCarbs: number;
  vitamins: Vitamins;
  minerals: Minerals;
};

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
    ? scaleNutrient(item.foodItem, countedCalories(item.foodItem.nutrition), item.quantity)
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

const emptyNutritionTotals = (): NutritionTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  netCarbs: 0,
  vitamins: { b1: 0, b2: 0, b3: 0, b5: 0, b6: 0, b7: 0, b8: 0, b9: 0, b12: 0, a: 0, c: 0, d: 0, e: 0, k: 0 },
  minerals: { calcium: 0, copper: 0, iron: 0, magnesium: 0, manganese: 0, phosphorus: 0, potassium: 0, selenium: 0, sodium: 0, zinc: 0 },
});

const chartTotals = (meals: Meal[]) =>
  meals.reduce<NutritionTotals>(
    (totals, meal) => {
      meal.list.forEach((item) => {
        const macros = itemMacros(item);
        totals.calories += macros.calories;
        totals.protein += macros.protein;
        totals.carbs += macros.carbs;
        totals.fats += macros.fats;
        if (!item.foodItem) return;
        const nutrition = item.foodItem.nutrition;
        totals.fiber += scaleNutrient(item.foodItem, nutrition.fiber ?? 0, item.quantity);
        totals.netCarbs += scaleNutrient(item.foodItem, nutrition.netCarbs ?? nutrition.carbs, item.quantity);
        VITAMIN_NUTRIENTS.forEach(({ key }) => {
          totals.vitamins[key] += scaleNutrient(item.foodItem!, nutrition.vitamins?.[key] ?? 0, item.quantity);
        });
        MINERAL_NUTRIENTS.forEach(({ key }) => {
          totals.minerals[key] += scaleNutrient(item.foodItem!, nutrition.minerals?.[key] ?? 0, item.quantity);
        });
      });
      return totals;
    },
    emptyNutritionTotals(),
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

  const today = dateInTimezone(new Date(), user?.timezone);
  const selectedDate = current.selectedDate || today;
  const isToday = selectedDate === today;
  const meals = useMemo(
    () => current.chart.meals.filter((meal) => meal.list.length > 0),
    [current.chart.meals],
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const returnToToday = () => {
    void dispatch(fetchMealActivity(today));
  };

  const requestPdf = async () => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    if (!profileIsComplete(user)) {
      toast.error("Complete your profile before requesting a diet chart PDF.", {
        action: {
          label: "Update profile",
          onClick: () => router.push("/profile"),
        },
      });
      return;
    }

    setRequestingPdf(true);
    try {
      const { data } = await api.post<{ message: string }>(
        "/diet-chart-exports/requests",
        {},
        { params: { date: selectedDate } },
      );
      toast.success(data.message);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to save the PDF request."));
    } finally {
      setRequestingPdf(false);
    }
  };

  const copyToToday = async () => {
    if (isToday || !user) return;

    setCopying(true);
    try {
      const { data } = await api.post<{ date: string }>(
        "/meal-activities/copy-to-today",
        {},
        { params: { date: selectedDate } },
      );
      await dispatch(fetchMealActivity(data.date)).unwrap();
      toast.success("Meals copied to today.");
    } catch (copyError) {
      toast.error(getApiError(copyError, "Unable to copy these meals to today."));
    } finally {
      setCopying(false);
    }
  };

  const requestCopyToToday = () => {
    if (isToday || !user || copying) return;
    const toastId = toast.warning("Replace today's meals?", {
      description: `Copy meals from ${displayDate(selectedDate)} into today.`,
      duration: 10000,
      action: {
        label: "Replace",
        onClick: () => {
          toast.dismiss(toastId);
          void copyToToday();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(toastId),
      },
    });
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

      <div className="card relative z-20 mb-4 flex min-h-16 items-center justify-between gap-3 overflow-visible px-3 py-2 sm:px-5">
        <DatePicker />
        {!isToday && (
          <button type="button" onClick={returnToToday} disabled={loading} className="btn btn-ghost btn-sm shrink-0">
            <CalendarClock size={16} /> <span className="hidden sm:inline">Return to today</span><span className="sm:hidden">Today</span>
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <DiaryPdfPreview
          user={user}
          date={selectedDate}
          meals={meals}
          water={current.water}
          steps={current.steps}
          showMealEdit
          loading={loading}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Diary actions">
        <Link href="/manage_meals" className="btn btn-secondary px-2"><Pencil size={17} /><span>Edit</span></Link>
        <button type="button" onClick={requestPdf} disabled={requestingPdf} className="btn btn-primary px-2">
          <FileText size={17} /><span>{requestingPdf ? "Saving..." : "Get PDF"}</span>
        </button>
        <button type="button" onClick={requestCopyToToday} disabled={isToday || copying} className="btn btn-secondary px-2">
          <Copy size={17} /><span>{copying ? "Copying..." : "Copy"}</span>
        </button>
      </div>
      {isToday && <p className="mt-2 text-right text-xs text-muted">Copy becomes available when viewing another date.</p>}
    </section>
  );
}

export function DiaryPdfPreview({
  user,
  date,
  meals,
  water = 0,
  steps = 0,
  showMealEdit = false,
  loading = false,
}: {
  user: User;
  date: string;
  meals: Meal[];
  water?: number;
  steps?: number;
  showMealEdit?: boolean;
  loading?: boolean;
}) {
  const totals = useMemo(() => chartTotals(meals), [meals]);
  return (
    <article className="mx-auto w-full max-w-[800px] bg-white text-[#172B2A]">
      <PdfHero user={user} date={date} />
      <div className="px-3 py-5 sm:px-10 sm:py-8">
        <MealSectionHeader />
        <div className="mt-3">
          {loading ? (
            <div className="rounded-lg bg-[#F5F8F7] px-5 py-12 text-center text-sm text-[#657473]">Loading chart...</div>
          ) : meals.length === 0 ? (
            <div className="rounded-lg bg-[#F5F8F7] px-5 py-8">
              <h2 className="font-bold">No meals recorded</h2>
              <p className="mt-2 text-sm text-[#657473]">Add meals to your diary and export this chart again.</p>
            </div>
          ) : (
            <div className="space-y-6">{meals.map((meal) => <MealTable key={meal.id} meal={meal} showEdit={showMealEdit} />)}</div>
          )}
        </div>
        <ActivitySummary water={water} steps={steps} />
        <MacroOverview user={user} totals={totals} water={water} />
        <div className="mt-8 flex items-center justify-between border-t border-[#DDE7E5] pt-3 text-xs text-[#657473] sm:text-[10px]">
          <span>LOSE TO GAIN / DIET CHART</span><span>PDF preview</span>
        </div>
      </div>
    </article>
  );
}

function PdfHero({ user, date }: { user: User; date: string }) {
  const bmi = formatBmi(
    bmiFromMeasurements({
      weight: user.weight,
      weightUnit: user.weightUnit,
      height: user.height,
      heightUnit: user.heightUnit,
    }),
  );

  return (
    <div className="relative min-h-[176px] overflow-hidden bg-[#115E59] px-5 py-7 text-white sm:px-10 sm:py-8">
      <span className="absolute -right-5 -top-16 h-36 w-36 rounded-full bg-[#147A72]" />
      <span className="absolute -bottom-16 -right-8 h-32 w-32 rounded-full bg-[#0D514D]" />
      <div className="relative">
        <p className="text-xs font-bold tracking-[0.18em] sm:text-[11px]">LOSE TO GAIN</p>
        <h2 className="mt-2 text-[26px] font-bold leading-tight sm:text-[28px]">Your daily diet chart</h2>
        <p className="mt-3 text-sm text-[#CDE9E5] sm:text-[11px]">{displayDate(date)}</p>
        <p className="mt-2 max-w-[85%] text-sm leading-6 text-[#CDE9E5] sm:text-[11px] sm:leading-5">{user.name} &nbsp; | &nbsp; {compact(user.weight)} {user.weightUnit} &nbsp; | &nbsp; {formatHeight(user.height, user.heightUnit)} &nbsp; | &nbsp; {user.age} years &nbsp; | &nbsp; BMI {bmi}</p>
      </div>
    </div>
  );
}

function MacroOverview({ user, totals, water }: { user: User; totals: NutritionTotals; water: number }) {
  return (
    <section className="mt-6 space-y-4">
      <MacroCalorieRing
        className="rounded-xl border-[#DDE7E5] shadow-none"
        dense
        goals={{ targetCalories: user.dailyGoals.targetCalories }}
        macros={totals}
        title="Macro calorie split"
        subtitle="Percentage of calories coming from protein, net carbs, and fat."
      />
      <NutritionLists
        nutrition={totals}
        macroTargets={{
          calories: user.dailyGoals.targetCalories,
          protein: user.dailyGoals.targetProtein,
          carbs: user.dailyGoals.targetCarb,
          netCarbs: user.dailyGoals.targetCarb,
          fats: user.dailyGoals.targetFat,
        }}
        waterGlasses={water}
        showFooter={false}
      />
    </section>
  );
}

function MealSectionHeader() {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold tracking-[0.08em] text-[#172B2A] sm:text-[11px]">MEALS</h3>
    </div>
  );
}

function ActivitySummary({ water, steps }: { water: number; steps: number }) {
  return (
    <section className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
      <div className="flex items-center gap-3 rounded-lg bg-[#F5F8F7] p-3 sm:p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#DFF4F0] text-[#115E59]">
          <Droplets size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-[#657473] sm:text-[9px]">WATER</p>
          <p className="mt-1 text-lg font-bold leading-tight">{compact(water)} glasses</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-[#F5F8F7] p-3 sm:p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#DFF4F0] text-[#115E59]">
          <Footprints size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-[#657473] sm:text-[9px]">STEPS</p>
          <p className="mt-1 text-lg font-bold leading-tight">{steps.toLocaleString("en-US")} steps</p>
        </div>
      </div>
    </section>
  );
}

function MealTable({ meal, showEdit = false }: { meal: Meal; showEdit?: boolean }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[#DFF4F0] px-4 py-3 text-[#115E59]">
        <h3 className="min-w-0 text-sm font-bold tracking-[0.1em] sm:text-[11px]">{meal.mealType?.toUpperCase()}</h3>
        {showEdit && meal.mealType && (
          <Link href={`/foodList/${meal.mealType}`} className="btn btn-secondary btn-sm min-h-8 shrink-0 px-2 py-1 text-xs">
            <Pencil size={14} aria-hidden="true" />
            <span>Edit</span>
          </Link>
        )}
      </div>
      <div className="mt-2 sm:hidden">
        {meal.list.map((item, index) => {
          const macros = itemMacros(item);
          return (
            <div key={`${item.foodItem?.id || "food"}-mobile-${index}`} className={`border-b border-[#DDE7E5] px-3 py-3 ${index % 2 === 1 ? "bg-[#FAFCFB]" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-base font-bold">{item.foodItem?.name || "Unavailable food"}</p>
                <p className="shrink-0 text-sm text-[#657473]">{compact(item.quantity)} {item.foodItem?.unit || "serving"}</p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                <MobileMacro label="CAL" value={compact(macros.calories)} />
                <MobileMacro label="PROTEIN" value={`${compact(macros.protein)} g`} />
                <MobileMacro label="CARBS" value={`${compact(macros.carbs)} g`} />
                <MobileMacro label="FATS" value={`${compact(macros.fats)} g`} />
              </div>
            </div>
          );
        })}
      </div>
      <table className="mt-2 hidden w-full table-fixed border-collapse text-[10px] sm:table">
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

function MobileMacro({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-bold text-[#657473]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
