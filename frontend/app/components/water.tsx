'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust path as needed
import { incrementGlass } from '../store/features/activitySlice'; // Adjust path as needed
import { Glasses, GlassWater, GlassWaterIcon, LucideGlassWater, Plus } from 'lucide-react';
import { useDeviceType } from '../hooks/useDeviceType';
import Image from 'next/image';

// Use a union type for the icon size if you want better type safety
type IconSize = number | string | undefined;

const GlassIcon: React.FC<{ size?: IconSize }> = ({ size = 32 }) => (
    <GlassWater className="text-blue-500 fill-blue-500 transition-transform duration-200" size={size} />
);

export default function Water() {
    const dispatch = useDispatch();

    // 1. Fetch the value from the Redux store
    const glassesCount = useSelector(
        (state: RootState) => state.activity.current.water // Adjust slice name if needed
    );

    const handleIncrement = (e: React.MouseEvent) => {
        // Prevent any potential propagation if needed, although usually not necessary for a simple button
        e.stopPropagation();
        dispatch(incrementGlass());
    };

    const device=useDeviceType()

    // Create an array to map over for rendering the icons
    const glassesArray = Array(glassesCount).fill(0);
    const iconSize: IconSize = device==='m'?48:84;

    return (
        <div className="flex flex-col items-start justify-center p-4 rounded-xl m-2 shadow-md shadow-stone-300 border border-stone-300 bg-white">
            <div className="w-full fc flex-row pb-2 border-b-2 border-gray-300 mb-4">
                <h2 className="text-lg">Water</h2>
            </div>

            {/* Icon Display Area */}
            <div className="flex flex-wrap justify-left items-center gap-1 mb-6 min-h-[50px]">
                <button
                    onClick={handleIncrement}
                    className="flex items-center justify-center  transition-all duration-150 transform hover:scale-105 action:scale-105"
                    aria-label="Add a glass of water"
                >
                    
                    <div className="relative flex items-center justify-center">

                        {/* Background Icon 
                        <GlassIcon size={iconSize}/>*/}
                        <Image src={"/trimmed_glass_transparent.svg"} alt={'full glass'} height={iconSize} width={iconSize} />
                        
                        <Plus
                            size={iconSize / 2} // Half the size of the glass icon
                            className="absolute text-stone-600 font-semibold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        />
                    </div>
                </button>
                {glassesCount > 0 ? (
                    glassesArray.map((_, index) => (
                        /*<GlassIcon key={index} size={iconSize} />*/
                        <Image key={index} src={"/trimmed_glass_transparent.svg"} alt={'full glass'} height={iconSize} width={iconSize} />
                    ))
                ) : (
                    <p className="text-gray-500 italic">Click the glass below to start!</p>
                )}
            </div>

            
        </div>
    );
}