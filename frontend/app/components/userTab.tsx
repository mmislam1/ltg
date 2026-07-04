'use client'

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Link from "next/link";
import { logoutUser } from "../store/features/authSlice";
import { LogOut } from "lucide-react";
import { useDeviceType } from "../hooks/useDeviceType";
import { useRouter } from "next/navigation";

interface UserIconProps {
    variant?: "small" | "medium" | "large";
    onClick?: () => void;
    className?: string;
}

const UserTab: React.FC<UserIconProps> = ({
    
    variant = 'small',
    onClick,
    className = "",
}) => {
    const user = useAppSelector((store) => store.auth.user);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", closeMenu);
        return () => document.removeEventListener("mousedown", closeMenu);
    }, []);

    const signOut = async () => {
        await dispatch(logoutUser());
        setMenuOpen(false);
        router.push("/auth/signin");
    };

    // Responsive sizing
    const sizeConfig = {
        small: {
            container: "w-8 h-8 md:w-10 md:h-10",
            image: 40,
        },
        medium: {
            container: "w-8 h-8 md:w-10 md:h-10",
            image: 48,
        },
        large: {
            container: "w-12 h-12 md:w-16 md:h-16",
            image: 64,
        },
    };

    const config = sizeConfig[useDeviceType()==='d'?"medium":'small'];

    // Fallback initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-row items-center justify-center gap-4">
            {!user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                        href="/auth/signin"
                        className="btn btn-secondary"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="btn btn-primary"
                    >
                        Sign Up
                    </Link>
                </div>
            ) : (
                <div ref={menuRef} className={`relative inline-flex ${className}`}>
                    {/* Avatar Container */}
                    <button
                        type="button"
                        onClick={() => {
                            setMenuOpen((value) => !value);
                            onClick?.();
                        }}
                        aria-label="Open account menu"
                        aria-expanded={menuOpen}
                        className={`
          ${config.container}
          relative
          rounded-full
          overflow-hidden
          border-2
          border-line
          hover:border-brand
          transition-colors
          duration-200
          cursor-pointer
          flex
          items-center
          justify-center
          bg-brand
                        flex-shrink-0
                        p-0
                      `}
                    >
                        {!imageError && user.image ? (
                            <Image
                                src={"/driver.png"}
                                alt={"User avatar"}
                                width={config.image}
                                height={config.image}
                                className="w-full h-full object-cover"
                                priority
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span
                                className={`
              font-bold
              text-on-brand
              ${variant === "small" ? "text-xs" : ""}
              ${variant === "medium" ? "text-sm" : ""}
              ${variant === "large" ? "text-lg" : ""}
              select-none
            `}
                            >
                                {getInitials(user.name || "U")}
                            </span>
                        )}
                    </button>

                    {menuOpen && (
                        <div className="card absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden" role="menu">
                            <div className="border-b border-line px-4 py-3">
                                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={signOut}
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-danger hover:bg-red-50"
                                role="menuitem"
                            >
                                <LogOut size={17} /> Sign out
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default UserTab;
