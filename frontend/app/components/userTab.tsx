'use client'

import React, { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { RootState } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Link from "next/link";
import { User } from "../store/features/authSlice";
import { BellDot } from "lucide-react";
import { useDeviceType } from "../hooks/useDeviceType";

interface UserIconProps {
    variant?: "small" | "medium" | "large";
    showNotification?: boolean;
    onClick?: () => void;
    className?: string;
}

const UserTab: React.FC<UserIconProps> = ({
    
    variant = 'small',
    showNotification = true,
    onClick,
    className = "",
}) => {
    const user = useAppSelector((store) => store.auth.user);
    const [imageError, setImageError] = useState(false);

    // Responsive sizing
    const sizeConfig = {
        small: {
            container: "w-8 h-8 md:w-10 md:h-10",
            image: 40,
            notification: "w-4 h-4 text-xs",
            notificationBg: "top-0 right-0",
            notificationAlign:'right-3 bottom-8'
        },
        medium: {
            container: "w-8 h-8 md:w-10 md:h-10",
            image: 48,
            notification: "w-4 h-4 text-sm",
            notificationBg: "top-0 right-0",
            notificationAlign: 'right-3 bottom-8'
        },
        large: {
            container: "w-12 h-12 md:w-16 md:h-16",
            image: 64,
            notification: "w-7 h-7 text-base",
            notificationBg: "top-2 right-2",
            notificationAlign: 'right-3 bottom-2'
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
        <div className="flex flex-row items-center justify-center gap-6">
            <div className="flex flex-row items-center justify-center gap-6"></div>
            <div className=" h-8 flex flex-row items-center justify-center">
                <BellDot></BellDot>
                {showNotification && 8 > 0 && (
                    <div
                        className={`
            ${config.notificationBg}
            relative
            ${config.notification}
            ${config.notificationAlign}
            rounded-full
            bg-rose-600
            hover:bg-rose-700
            text-white
            flex
            items-center
            justify-center
            font-semibold
            ring-2
            ring-white
            dark:ring-gray-900
            transition-colors
            duration-200
          `}
                    >
                        {8 > 99 ? "99+" : 8}
                    </div>
                )}
            </div>

            {!user ? (
                <div className="flex items-center gap-4">
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
                <div
                    className={`relative inline-flex ${className}`}
                    onClick={onClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && onClick) onClick();
                    }}
                >
                    {/* Avatar Container */}
                    <div
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
                    </div>

                    {/* Notification Badge */}
                </div>
            )}
        </div>
    );
};

export default UserTab;
