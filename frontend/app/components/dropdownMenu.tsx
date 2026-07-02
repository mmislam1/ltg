"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckIcon,
  CopyIcon,
  File,
  List,
  LogOut,
  MenuIcon,
  MoreVertical,
  NotebookTabs,
  PlusCircleIcon,
  Send,
  Trash2,
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
    { label: "Mark Day as Complete", icon: CheckIcon, href: "/" },
    { label: "Daily Report", icon: List, href: "/" },
    { label: "Multi-Select", icon: PlusCircleIcon, href: "/" },
    { label: "Copy Current Day", icon: CopyIcon, href: "/" },
    { label: "Copy Previous Day", icon: File, href: "/" },
    { label: "Clear All Serving Sizes", icon: MenuIcon, href: "/" },
    { label: "Delete All Diary Entries", icon: Trash2, href: "/" },
    { label: "Export Chart", icon: Send, href: "/chart" },
    { label: "Manage meals", icon: NotebookTabs, href: "/manage_meals" },
  ];

  return (
    <div className="relative inline-block">
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
