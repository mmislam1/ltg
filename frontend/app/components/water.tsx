'use client';

import type { MouseEvent } from 'react';
import { incrementGlass, saveDailyActivityMetrics } from '../store/features/activitySlice';
import { Droplets, GlassWater, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';

function WaterGlassIcon({
    className = '',
}: {
    className?: string;
}) {
    return (
        <span className={`relative inline-grid shrink-0 place-items-center ${className}`} aria-hidden="true">
            <svg
                viewBox="0 0 64 64"
                className="h-full w-full overflow-visible"
                fill="none"
            >
                <path
                    d="M17.5 11.5h29L42.7 53a4 4 0 0 1-4 3.6H25.3a4 4 0 0 1-4-3.6L17.5 11.5Z"
                    className="fill-surface stroke-line"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                />
                <path
                    d="M20 12.5c0-3 24-3 24 0s-24 3-24 0Z"
                    className="fill-surface stroke-line"
                    strokeWidth="3.5"
                />
                <path
                    d="M22.6 29.5c4.5-2.3 8.8-2.3 13.1 0 3.4 1.8 6.4 1.9 9.1.3L42.6 52a3.4 3.4 0 0 1-3.5 3H25.3a3.4 3.4 0 0 1-3.5-3l-2-21c.9-.3 1.8-.8 2.8-1.5Z"
                    className="fill-sky-500"
                />
                <path
                    d="M22.6 29.5c4.5-2.3 8.8-2.3 13.1 0 3.4 1.8 6.4 1.9 9.1.3"
                    className="stroke-sky-700"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
                <path
                    d="M45.2 17.5 41.8 52a3.4 3.4 0 0 1-3.5 3H26.1"
                    className="stroke-ink/20"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
                <path
                    d="M39.7 20.7 37.4 31"
                    className="stroke-white/80"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

export default function Water() {
    const dispatch = useAppDispatch();

    const glassesCount = useAppSelector((state) => state.activity.current.water);
    const selectedDate = useAppSelector((state) => state.activity.current.selectedDate);

    const handleIncrement = (e: MouseEvent) => {
        e.stopPropagation();
        if (glassesCount >= 100) return;
        const nextWater = glassesCount + 1;
        dispatch(incrementGlass());
        void dispatch(saveDailyActivityMetrics({ date: selectedDate || undefined, water: nextWater }));
    };

    const glassesArray = Array(glassesCount).fill(0);

    return (
        <div className="card m-2 flex flex-col gap-4 p-4">
            <div className="flex w-full items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                        <Droplets size={21} aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-lg font-bold text-ink">Water</h2>
                        <p className="text-sm font-semibold text-muted">{glassesCount} glasses</p>
                    </div>
                </div>
            </div>

            <div className="flex min-h-14 flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="group relative flex size-14 items-center justify-center rounded-xl border border-line bg-surface shadow-sm transition-colors hover:border-sky-500 hover:bg-sky-50 sm:size-16"
                    aria-label="Add a glass of water"
                >
                    <GlassWater size={31} strokeWidth={2.2} className="text-sky-600 sm:size-9" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-brand text-on-brand shadow-sm transition-colors group-hover:bg-brand-hover">
                        <Plus size={15} strokeWidth={3} aria-hidden="true" />
                    </span>
                </button>
                {glassesCount > 0 ? (
                    glassesArray.map((_, index) => (
                        <WaterGlassIcon key={index} className="size-12 sm:size-14" />
                    ))
                ) : (
                    <p className="text-sm font-semibold text-muted">No water logged yet.</p>
                )}
            </div>
        </div>
    );
}
