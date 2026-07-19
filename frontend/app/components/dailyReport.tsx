"use client";

import NutritionProfile from "./nutritionProfile";
import { useAppSelector } from "../store/hooks";
import RingChart from "./ringChart";
import StepCounter from "./stepCounter";
import Water from "./water";
import WeightUpdater from "./weightUpdater";

export default function DailyReport() {
  const activity = useAppSelector((state) => state.activity.current);
  const goals = useAppSelector((state) => state.auth.user?.dailyGoals);
  const nutrition = {
    ...activity.macros,
    vitamins: activity.totalMicro.vitamins,
    minerals: activity.totalMicro.minerals,
  };

  return (
    <div className="min-h-screen bg-canvas px-2 py-4 sm:px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Today</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Daily Report</h1>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Water />
            <StepCounter />
            <WeightUpdater />
          </div>
          <RingChart />
        </div>

        <NutritionProfile
          nutrition={nutrition}
          macroTargets={{
            calories: goals?.targetCalories,
            protein: goals?.targetProtein,
            carbs: goals?.targetCarb,
            netCarbs: goals?.targetCarb,
            fats: goals?.targetFat,
          }}
          waterGlasses={activity.water}
        />
      </div>
    </div>
  );
}
