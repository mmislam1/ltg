"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  Home,
  NotebookTabs,
  Plus,
  Salad,
  type LucideIcon,
} from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/manage_meals", label: "Diary", icon: NotebookTabs },
  { href: "/chart", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { href: "/nutritionDashboard", label: "Nutrition", icon: Salad },
];

const isCurrentRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === href : pathname.startsWith(href);

function NavigationLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const active = isCurrentRoute(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors duration-200 ${
        active ? "text-brand" : "text-muted hover:text-ink"
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute top-0 h-1 w-7 rounded-b-full bg-brand"
        />
      )}
      <span
        className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          active ? "bg-brand-soft" : "group-hover:bg-canvas"
        }`}
      >
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
      </span>
      <span className={`text-[0.65rem] leading-none ${active ? "font-bold" : "font-semibold"}`}>
        {item.label}
      </span>
    </Link>
  );
}

export default function BottomBar() {
  const pathname = usePathname();
  const addActive = pathname.startsWith("/add_meal");

  return (
    <nav
      aria-label="Primary navigation"
      className="bottom-nav safe-area-bottom fixed inset-x-0 bottom-0 z-[100] w-full overflow-visible border-t border-line/80 bg-surface/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-5 items-center px-2">
        <NavigationLink item={navigationItems[0]} />
        <NavigationLink item={navigationItems[1]} />

        <Link
          href="/add_meal"
          aria-label="Add meal"
          aria-current={addActive ? "page" : undefined}
          className="group relative -mt-4 flex flex-col items-center gap-1 text-brand"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-brand text-on-brand shadow-[0_8px_20px_rgba(22,101,52,0.3)] transition-all duration-200 group-active:translate-y-0.5 group-active:shadow-md ${
              addActive ? "ring-4 ring-brand-soft" : "group-hover:bg-brand-hover"
            }`}
          >
            <Plus size={26} strokeWidth={2.6} />
          </span>
          <span className="text-[0.65rem] font-bold leading-none text-ink">Add meal</span>
        </Link>

        <NavigationLink item={navigationItems[2]} />
        <NavigationLink item={navigationItems[3]} />
      </div>
    </nav>
  );
}
