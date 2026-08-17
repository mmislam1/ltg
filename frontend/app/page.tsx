import { Suspense } from "react";
import StepCounter from "./components/stepCounter";
import Meals from "./components/meals";
import Water from "./components/water";
import PageSuspense from "./components/pageSuspense";
import { ComponentSuspenseFallback } from "./components/suspenseFallback";

export default function Home() {
  return (
    <PageSuspense>
      <div className="mx-auto my-6 flex w-full max-w-xl flex-col gap-4 px-2 sm:px-4">
        <Suspense fallback={<ComponentSuspenseFallback label="Loading meals" />}>
          <Meals />
        </Suspense>
        <Suspense fallback={<ComponentSuspenseFallback label="Loading water" />}>
          <Water />
        </Suspense>
        <Suspense fallback={<ComponentSuspenseFallback label="Loading steps" />}>
          <StepCounter />
        </Suspense>
      </div>
    </PageSuspense>
  );
}
