'use client';

import type { MouseEvent } from 'react';
import { incrementGlass, saveDailyActivityMetrics } from '../store/features/activitySlice';
import { Droplets, GlassWater, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type WaterGlassMarkProps = {
    className?: string;
    iconClassName?: string;
    iconSize?: number;
};

function WaterGlassMark({ className = '', iconClassName = '', iconSize = 28 }: WaterGlassMarkProps) {
    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-b from-white via-sky-50 to-sky-100 text-sky-600 shadow-sm ${className}`}
            aria-hidden="true"
        >
            <span className="absolute bottom-[19%] h-[28%] w-[42%] rounded-b-md rounded-t-sm bg-sky-300/45" />
            <GlassWater size={iconSize} strokeWidth={2.25} className={`relative z-10 ${iconClassName}`} />
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
                    className="group relative flex size-14 items-center justify-center rounded-xl transition-transform active:translate-y-px sm:size-16"
                    aria-label="Add a glass of water"
                >
                    <WaterGlassMark
                        className="size-full transition-all group-hover:border-sky-300 group-hover:shadow-md"
                        iconClassName="sm:size-9"
                        iconSize={31}
                    />
                    <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-brand text-on-brand shadow-sm transition-colors group-hover:bg-brand-hover">
                        <Plus size={15} strokeWidth={3} aria-hidden="true" />
                    </span>
                </button>
                {glassesCount > 0 ? (
                    glassesArray.map((_, index) => (
                        <WaterGlassMark key={index} className="size-12 sm:size-14" iconClassName="sm:size-8" />
                    ))
                ) : (
                    <p className="text-sm font-semibold text-muted">No water logged yet.</p>
                )}
            </div>
        </div>
    );
}
