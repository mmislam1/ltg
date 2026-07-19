"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./botomBar";
import Navbar from "./navbar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) return <main className="w-full flex-1">{children}</main>;

  return (
    <>
      <header className="sticky top-0 z-50 w-full"><Navbar /></header>
      <main className="mobile-bottom-content w-full max-w-6xl overflow-x-hidden">{children}</main>
      <BottomBar />
    </>
  );
}
