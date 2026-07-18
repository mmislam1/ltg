"use client";

import React, { useMemo } from "react";
import { useAppSelector } from "../store/hooks";

type MacroValues = {
  calories?: number;
  protein: number;
  carbs: number;
  netCarbs?: number;
  fiber?: number;
  fats: number;
};

type MacroGoals = {
  targetCalories?: number;
};

type MacroKey = "protein" | "carbs" | "fats";

const MACROS: ReadonlyArray<{
  key: MacroKey;
  label: string;
  caloriesPerGram: number;
  color: string;
}> = [
  {
    key: "protein",
    label: "Protein",
    caloriesPerGram: 4,
    color: "var(--nutrition-protein)",
  },
  {
    key: "carbs",
    label: "Net carbs",
    caloriesPerGram: 4,
    color: "var(--nutrition-carbs)",
  },
  {
    key: "fats",
    label: "Fat",
    caloriesPerGram: 9,
    color: "var(--nutrition-fat)",
  },
];

const compact = (value: number, maximumFractionDigits = 1) =>
  Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits })
    : "0";

export const macroCalorieDistribution = (macros: MacroValues) => {
  const macroGrams = (key: MacroKey) => {
    if (key === "carbs") {
      return macros.netCarbs ?? Math.max((macros.carbs || 0) - (macros.fiber || 0), 0);
    }
    return macros[key] || 0;
  };
  const items = MACROS.map((macro) => {
    const grams = macroGrams(macro.key);
    return {
      key: macro.key,
      label: macro.label,
      grams,
      calories: Math.max(0, grams * macro.caloriesPerGram),
      percent: 0,
      color: macro.color,
    };
  });
  const total = items.reduce((sum, item) => sum + item.calories, 0);

  return {
    total,
    items: items.map((item) => ({
      ...item,
      percent: total > 0 ? (item.calories / total) * 100 : 0,
    })),
  };
};

export function MacroCalorieRing({
  macros,
  goals,
  title = "Macro calorie split",
  subtitle = "Percentage of calories coming from protein, net carbs, and fat.",
  className = "",
  dense = false,
}: {
  macros: MacroValues;
  goals?: MacroGoals;
  title?: string;
  subtitle?: string;
  className?: string;
  dense?: boolean;
}) {
  const distribution = useMemo(() => macroCalorieDistribution(macros), [macros]);
  const energy = Math.max(0, macros.calories ?? distribution.total);
  const ringGradient = useMemo(() => {
    if (distribution.total <= 0) return "var(--theme-border) 0deg 360deg";

    let angle = 0;
    return distribution.items
      .map((item) => {
        const start = angle;
        const end = angle + item.percent * 3.6;
        angle = end;
        return `${item.color} ${start}deg ${end}deg`;
      })
      .join(", ");
  }, [distribution]);
  const targetCalories = Math.max(0, goals?.targetCalories ?? 0);
  const energyPercent = targetCalories > 0 ? (energy / targetCalories) * 100 : 0;
  const cappedEnergyPercent = Math.min(Math.max(energyPercent, 0), 100);

  return (
    <section className={`card p-4 ${className}`}>
      <div className="mb-4 border-b border-line pb-3">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="mt-1 max-w-xl text-sm leading-5 text-muted">{subtitle}</p>
        </div>
      </div>

      <div className={`grid items-center gap-5 ${dense ? "sm:grid-cols-[13rem_1fr]" : "md:grid-cols-[15rem_1fr]"}`}>
        <div
          className="relative mx-auto grid size-48 place-items-center rounded-full"
          style={{ background: `conic-gradient(from -90deg, ${ringGradient})` }}
          aria-label={
            distribution.total > 0
              ? `Macro calorie split: ${distribution.items
                  .map((item) => `${item.label} ${compact(item.percent, 0)} percent`)
                  .join(", ")}`
              : "No macro calorie data"
          }
          role="img"
        >
          <div className="grid size-[7.25rem] place-items-center rounded-full bg-surface text-center shadow-inner">
            {energy > 0 ? (
              <span>
                <span className="text-2xl font-bold tabular-nums text-ink">
                  {compact(energy, 0)}
                </span>
                <span className="block text-xs font-semibold text-muted">
                  kcal
                </span>
              </span>
            ) : (
              <span>
                <span className="text-lg font-bold text-ink">0%</span>
                <span className="block text-xs font-semibold text-muted">No meals</span>
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="space-y-3">
            {distribution.items.map((item) => (
              <div key={item.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-bold text-ink">{item.label}</p>
                    <p className="text-sm font-bold tabular-nums text-ink">
                      {compact(item.percent, 0)}%
                    </p>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-brand-soft">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(Math.max(item.percent, 0), 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
                <p className="w-24 text-right text-xs text-muted">
                  {compact(item.calories)} kcal
                  <span className="block">{compact(item.grams)} g</span>
                </p>
              </div>
            ))}
          </div>

          {targetCalories > 0 && (
            <div className="mt-5 rounded-lg bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-ink">Energy target</span>
                <span className="text-muted tabular-nums">
                  {compact(energy)} / {compact(targetCalories)} kcal
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                  style={{ width: `${cappedEnergyPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-muted">
                {compact(energyPercent, 0)}% of daily calories logged
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function RingChart() {
  const macros = useAppSelector((state) => state.activity.current.macros);
  const goals = useAppSelector((state) => state.auth.user?.dailyGoals);

  return (
    <MacroCalorieRing
      className="m-2"
      macros={macros}
      goals={{ targetCalories: goals?.targetCalories }}
    />
  );
}
