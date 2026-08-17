import { Suspense, type ReactNode } from "react";
import { PageSuspenseFallback } from "./suspenseFallback";

type PageSuspenseProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export default function PageSuspense({ children, fallback }: PageSuspenseProps) {
  return (
    <Suspense fallback={fallback ?? <PageSuspenseFallback />}>
      {children}
    </Suspense>
  );
}
