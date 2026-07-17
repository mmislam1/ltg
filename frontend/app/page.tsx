"use client";

import RingChart from "./components/ringChart";
import Water from "./components/water";
import StepCounter from "./components/stepCounter";
import WeightUpdater from "./components/weightUpdater";

export default function Home() {
  return (
    <div>
    <div className="w-full font-sans flex flex-col">
      <Water></Water>
      <StepCounter />
      <WeightUpdater />
      <RingChart></RingChart>

    </div>
    
    </div>
  );
}
