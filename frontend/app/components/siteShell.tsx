"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import BottomBar from "./botomBar";
import Navbar from "./navbar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) return <main className="w-full flex-1">{children}</main>;

  return (
    <>
      <header className="sticky top-0 z-50 w-full"><Navbar /></header>
      <main className="w-full max-w-6xl overflow-hidden pb-24 md:pb-0">{children}</main>
      <footer className="mt-auto flex w-full flex-wrap items-center justify-center">
        <Footer />
        <BottomBar />
      </footer>
    </>
  );
}
