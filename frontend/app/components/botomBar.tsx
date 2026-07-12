"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface NavigationItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home", icon: Home },
  { label: "Transformation", icon: Sparkles, disabled: true },
  { label: "Read", icon: BookOpen, disabled: true },
];

const isCurrentRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === href : pathname.startsWith(href);

function NavigationLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const active = item.href ? isCurrentRoute(pathname, item.href) : false;
  const Icon = item.icon;
  const classes = `group relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition-colors duration-200 ${
    active
      ? "text-brand"
      : item.disabled
        ? "cursor-not-allowed text-muted/60"
        : "text-muted hover:text-ink"
  }`;
  const content = (
    <>
      {active && (
        <span
          aria-hidden="true"
          className="absolute top-0 h-1 w-7 rounded-b-full bg-brand"
        />
      )}
      <span
        className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
          active
            ? "bg-brand-soft"
            : item.disabled
              ? "bg-canvas/40"
              : "group-hover:bg-canvas"
        }`}
      >
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
      </span>
      <span className={`text-[0.65rem] leading-none ${active ? "font-bold" : "font-semibold"}`}>
        {item.label}
      </span>
    </>
  );

  if (!item.href) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${item.label} coming soon`}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={classes}
    >
      {content}
    </Link>
  );
}

export default function BottomBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="bottom-nav safe-area-bottom fixed inset-x-0 bottom-0 z-[100] w-full overflow-visible border-t border-line/80 bg-surface/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[4.5rem] max-w-lg grid-cols-3 items-center px-2">
        {navigationItems.map((item) => (
          <NavigationLink key={item.label} item={item} />
        ))}
      </div>
    </nav>
  );
}
