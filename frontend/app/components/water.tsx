'use client';

import type { MouseEvent } from 'react';
import { incrementGlass, saveDailyActivityMetrics } from '../store/features/activitySlice';
import { Plus } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../store/hooks';

type IconSize = number | string | undefined;

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

    const device=useDeviceType()

    const glassesArray = Array(glassesCount).fill(0);
    const iconSize: IconSize = device==='m'?48:84;

    return (
        <div className="card m-2 flex flex-col items-start justify-center p-4">
            <div className="fc mb-4 w-full flex-row border-b border-line pb-2">
                <h2 className="text-lg">Water</h2>
            </div>

            {/* Icon Display Area */}
            <div className="flex flex-wrap justify-left items-center gap-1 mb-6 min-h-[50px]">
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="flex items-center justify-center border-0 bg-transparent p-0"
                    aria-label="Add a glass of water"
                >
                    
                    <div className="relative flex items-center justify-center">
                        <Image src={"/trimmed_glass_transparent.svg"} alt={'full glass'} height={iconSize} width={iconSize} />
                        
                        <Plus
                            size={iconSize / 2}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-ink"
                        />
                    </div>
                </button>
                {glassesCount > 0 ? (
                    glassesArray.map((_, index) => (
                        <Image key={index} src={"/trimmed_glass_transparent.svg"} alt={'full glass'} height={iconSize} width={iconSize} />
                    ))
                ) : (
                    <p className="text-muted italic">Click the glass below to start!</p>
                )}
            </div>

            
        </div>
    );
}
