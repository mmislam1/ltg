"use client";

import NutritionProfile from "./nutritionProfile";
import { useAppSelector } from "../store/hooks";

export default function DailyReport() {
  const activity = useAppSelector((state) => state.activity.current);
  const nutrition = {
    ...activity.macros,
    vitamins: activity.totalMicro.vitamins,
    minerals: activity.totalMicro.minerals,
  };

  return (
    <div className="min-h-screen bg-canvas p-2">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="fc mb-3 text-xl font-bold tracking-tight text-ink">Daily Report</h1>
        </div>
        <NutritionProfile nutrition={nutrition} waterGlasses={activity.water} />
      </div>
    </div>
  );
}
