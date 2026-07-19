"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChartNoAxesColumnIncreasing,
  Footprints,
  Scale,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import api, { getApiError } from "../store/api";
import { useAppSelector } from "../store/hooks";
import { NUTRITION_COLORS } from "../nutritionColors";

type WeightUnit = "kg" | "lb";

interface ProgressEntry {
  date: string;
  water: number;
  steps: number;
  weight: number | null;
  weight_unit: WeightUnit | null;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  distributedCalories: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface ProgressHistory {
  timezone: string;
  days: number;
  entries: ProgressEntry[];
}

const rangeOptions = [7, 30, 90] as const;

const compact = (value: number | null | undefined, digits = 0) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: digits })
    : "0";

const shortDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const convertWeight = (
  value: number | null,
  from: WeightUnit | null,
  to: WeightUnit,
) => {
  if (value === null || !from || from === to) return value;
  return from === "kg" ? value * 2.20462 : value / 2.20462;
};

export default function ProgressPage() {
  const { user, initialized } = useAppSelector((state) => state.auth);
  const [days, setDays] = useState<(typeof rangeOptions)[number]>(30);
  const [history, setHistory] = useState<ProgressHistory | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !user) return;
    let active = true;

    api
      .get<ProgressHistory>("/meal-activities/history", { params: { days } })
      .then(({ data }) => {
        if (active) setHistory(data);
      })
      .catch((requestError) => {
        if (!active) return;
        const message = getApiError(requestError, "Unable to load progress.");
        setError(message);
        toast.error(message);
      });

    return () => {
      active = false;
    };
  }, [days, initialized, user]);

  const weightUnit = user?.weightUnit ?? "kg";
  const chartData = useMemo(
    () =>
      (history?.entries ?? []).map((entry) => ({
        date: entry.date,
        label: shortDate(entry.date),
        totalCalories: Number(entry.totals.calories.toFixed(1)),
        proteinCalories: Number(entry.distributedCalories.protein.toFixed(1)),
        carbCalories: Number(entry.distributedCalories.carbs.toFixed(1)),
        fatCalories: Number(entry.distributedCalories.fats.toFixed(1)),
        steps: entry.steps,
        water: entry.water,
        weight: convertWeight(entry.weight, entry.weight_unit, weightUnit),
      })),
    [history?.entries, weightUnit],
  );

  const latest = [...chartData].reverse().find((entry) => entry.weight !== null);
  const weightPointCount = chartData.filter((entry) => entry.weight !== null).length;
  const averageCalories = chartData.length
    ? chartData.reduce((sum, entry) => sum + entry.totalCalories, 0) / chartData.length
    : 0;
  const totalSteps = chartData.reduce((sum, entry) => sum + entry.steps, 0);
  const loading = initialized && Boolean(user) && !history && !error;

  if (!initialized) return <div className="min-h-[60vh] bg-canvas" />;

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 text-center">
        <div className="card w-full p-7">
          <ChartNoAxesColumnIncreasing className="mx-auto mb-3 text-brand" size={32} />
          <h1 className="text-xl font-bold text-ink">Your progress is private</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Sign in to view your trends.</p>
          <Link href="/auth/signin" className="btn btn-primary mt-5 w-full">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-6xl bg-canvas px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Progress</p>
          <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">Trends over time</h1>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-line bg-surface p-1">
          {rangeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (option === days) return;
                setHistory(null);
                setError("");
                setDays(option);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                days === option
                  ? "bg-brand text-on-brand"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Activity} label="Avg calories" value={compact(averageCalories)} unit="kcal" />
        <MetricCard icon={Footprints} label="Steps" value={compact(totalSteps)} unit={`${days}d`} />
        <MetricCard icon={Scale} label="Latest weight" value={compact(latest?.weight, 1)} unit={weightUnit} />
      </div>

      <div className="grid gap-4">
        <ChartPanel
          title="Calorie intake"
          loading={loading}
          empty={!chartData.some((entry) => entry.totalCalories > 0)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--theme-border)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderColor: "var(--theme-border)", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="totalCalories" name="Total" stroke="var(--theme-primary)" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="proteinCalories" name="Protein kcal" stroke={NUTRITION_COLORS.protein} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="carbCalories" name="Carb kcal" stroke={NUTRITION_COLORS.carbs} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fatCalories" name="Fat kcal" stroke={NUTRITION_COLORS.fat} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title="Steps"
            loading={loading}
            empty={!chartData.some((entry) => entry.steps > 0)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--theme-border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderColor: "var(--theme-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="steps" name="Steps" stroke="#0EA5E9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel
            title="Weight"
            loading={loading}
            empty={weightPointCount === 0}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="var(--theme-border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ borderColor: "var(--theme-border)", borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name={`Weight (${weightUnit})`}
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{ r: weightPointCount === 1 ? 4 : 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="card flex min-h-24 items-center gap-3 p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <p className="truncate text-2xl font-bold text-ink">
          {value} <span className="text-sm text-muted">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  loading,
  empty,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {loading && <span className="auth-spinner" aria-label={`Loading ${title}`} />}
      </div>
      <div className="relative h-80 min-w-0">
        {children}
        {!loading && empty && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-surface/80 text-sm font-semibold text-muted">
            No data yet
          </div>
        )}
      </div>
    </section>
  );
}
