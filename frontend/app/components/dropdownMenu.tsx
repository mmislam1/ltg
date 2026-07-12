"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  CheckIcon,
  CheckCircle2,
  CookingPot,
  CopyIcon,
  File,
  Home,
  List,
  LogOut,
  LoaderCircle,
  Mail,
  MenuIcon,
  MoreVertical,
  NotebookTabs,
  Plus,
  PlusCircleIcon,
  Salad,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/features/authSlice";
import api, { getApiError } from "../store/api";

type ExportNotice = { kind: "success" | "error"; message: string } | null;

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<ExportNotice>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);
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

  const exportChart = async () => {
    setIsOpen(false);
    setExportNotice(null);
    setExporting(true);
    try {
      const { data } = await api.post<{ message: string }>(
        "/diet-chart-exports/requests",
        null,
        { params: selectedDate ? { date: selectedDate } : undefined },
      );
      setExportNotice({ kind: "success", message: data.message });
    } catch (error) {
      setExportNotice({
        kind: "error",
        message: getApiError(error, "Unable to email the diet chart."),
      });
    } finally {
      setExporting(false);
    }
  };

  const menuNavigationItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Diary", icon: NotebookTabs, href: "/diary" },
    { label: "Add meal", icon: Plus, href: "/add_meal" },
    { label: "Progress", icon: ChartNoAxesColumnIncreasing, href: "/chart" },
    { label: "Nutrition", icon: Salad, href: "/nutritionDashboard" },
  ];

  const items = [
    { label: "Mark Day as Complete", icon: CheckIcon, href: "/" },
    { label: "Daily Report", icon: List, href: "/" },
    { label: "Multi-Select", icon: PlusCircleIcon, href: "/" },
    { label: "Copy Current Day", icon: CopyIcon, href: "/" },
    { label: "Copy Previous Day", icon: File, href: "/" },
    { label: "Clear All Serving Sizes", icon: MenuIcon, href: "/" },
    { label: "Delete All Diary Entries", icon: Trash2, href: "/" },
    { label: "Manage meals", icon: NotebookTabs, href: "/manage_meals" },
  ];

  return (
    <div className="relative inline-block">
      {exportNotice && (
        <div
          role={exportNotice.kind === "error" ? "alert" : "status"}
          className={`fixed right-4 top-20 z-[70] flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            exportNotice.kind === "success"
              ? "border-brand/25 bg-brand-soft text-brand-active"
              : "border-red-200 bg-red-50 text-danger"
          }`}
        >
          {exportNotice.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
          ) : null}
          <span>{exportNotice.message}</span>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="ml-2 font-bold"
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen((open) => !open)}
        className="btn btn-ghost btn-icon"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical size={20} aria-hidden="true" />
      </button>

      {isOpen && (
        <div ref={menuRef} className="card absolute right-0 top-[calc(100%+0.5rem)] z-50 max-h-[calc(100vh-5rem)] w-72 overflow-y-auto py-1" role="menu">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-on-brand">
              {initials || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <div className="border-b border-line py-1">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
              role="menuitem"
            >
              <UserRoundPen size={18} className="text-muted" />
              <span>Edit profile</span>
            </button>
          </div>

          <div className="py-1">
            {menuNavigationItems.map(({ label, icon: Icon, href }) => (
              <button
                type="button"
                key={label}
                onClick={() => navigate(href)}
                className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
                role="menuitem"
              >
                <Icon size={18} className="text-muted" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-line py-1">
            <button
              type="button"
              onClick={() => navigate("/custom_recipe")}
              className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
              role="menuitem"
            >
              <CookingPot size={18} className="text-muted" />
              <span>Create custom recipe</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/custom-food")}
              className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
              role="menuitem"
            >
              <Salad size={18} className="text-muted" />
              <span>Create custom food</span>
            </button>
            <button
              type="button"
              onClick={exportChart}
              disabled={exporting}
              className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
              role="menuitem"
            >
              {exporting ? (
                <LoaderCircle size={18} className="animate-spin text-muted" />
              ) : (
                <Mail size={18} className="text-muted" />
              )}
              <span>{exporting ? "Requesting PDF..." : "Request PDF by email"}</span>
            </button>
            {items.map(({ label, icon: Icon, href }) => (
              <button
                type="button"
                key={label}
                onClick={() => navigate(href)}
                className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm"
                role="menuitem"
              >
                <Icon size={18} className="text-muted" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-line py-1">
            <button
              type="button"
              onClick={signOut}
              className="btn btn-ghost min-h-11 w-full justify-start rounded-none px-4 text-left text-sm text-danger hover:bg-red-50"
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
