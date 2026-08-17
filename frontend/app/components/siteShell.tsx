"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import BottomBar from "./botomBar";
import Navbar from "./navbar";
import {
  NavigationSuspenseFallback,
  PageSuspenseFallback,
} from "./suspenseFallback";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) return <main className="w-full flex-1">{children}</main>;

  return (
    <>
      <header className="sticky top-0 z-[220] w-full">
        <Suspense fallback={<NavigationSuspenseFallback />}>
          <Navbar />
        </Suspense>
      </header>
      <main className="mobile-bottom-content w-full max-w-6xl overflow-x-hidden">
        <Suspense fallback={<PageSuspenseFallback />}>{children}</Suspense>
      </main>
      <Suspense fallback={null}>
        <BottomBar />
      </Suspense>
    </>
  );
}
