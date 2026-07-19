"use client";

import StepCounter from "./components/stepCounter";
import Meals from "./components/meals";
import Water from "./components/water";

export default function Home() {
  return (
    <div className="mx-auto my-6 flex w-full max-w-xl flex-col gap-4 px-2 sm:px-4">
      <Meals />
      <Water />
      <StepCounter />
    </div>
  );
}
