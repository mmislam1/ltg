"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ClipboardList,
  LogOut,
  Menu,
  NotebookTabs,
  UserRoundPen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/features/authSlice";

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const signOut = async () => {
    setIsOpen(false);
    await dispatch(logoutUser());
    router.push("/auth/signin");
  };

  const items = [
    { label: "Edit profile", icon: UserRoundPen, href: "/profile" },
    { label: "Daily report", icon: ClipboardList, href: "/" },
    { label: "Manage meals", icon: NotebookTabs, href: "/manage_meals" },
    { label: "Export chart", icon: ChartNoAxesColumnIncreasing, href: "/chart" },
  ];

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 items-center gap-1 rounded-xl border border-line bg-surface px-2.5 text-muted shadow-sm transition-colors hover:border-brand/30 hover:bg-brand-soft hover:text-brand sm:h-10"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Menu size={19} aria-hidden="true" />
        <ChevronDown size={14} className={`hidden transition-transform sm:block ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div ref={menuRef} className="card absolute right-0 top-[calc(100%+0.6rem)] z-50 w-72 overflow-hidden py-1" role="menu">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-on-brand">
              {initials || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <div className="py-1">
            {items.map(({ label, icon: Icon, href }) => (
              <button
                type="button"
                key={label}
                onClick={() => navigate(href)}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand"
                role="menuitem"
              >
                <Icon size={18} className="text-muted" />
                {label}
              </button>
            ))}
          </div>

          <div className="border-t border-line py-1">
            <button
              type="button"
              onClick={signOut}
              className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm font-semibold text-danger transition-colors hover:bg-red-50"
              role="menuitem"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
