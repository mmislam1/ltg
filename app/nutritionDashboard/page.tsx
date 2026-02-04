'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IDEAL_NUTRITION } from './idealNutritionState';

interface RootState {
    activity: {
        current: {
            macros: {
                protein: number;
                carbs: number;
                fats: number;
            };
            total: number;
            totalMicro: {
                vitamins: {
                    b1: number;
                    b2: number;
                    b3: number;
                    b5: number;
                    b6: number;
                    b7: number;
                    b8: number;
                    b9: number;
                    b12: number;
                    a: number;
                    c: number;
                    d: number;
                    e: number;
                    k: number;
                };
                minerals: {
                    calcium: number;
                    copper: number;
                    iron: number;
                    magnesium: number;
                    manganese: number;
                    phosphorus: number;
                    potassium: number;
                    selenium: number;
                    sodium: number;
                    zinc: number;
                };
            };
        };
    };
}

interface NutrientBarProps {
    label: string;
    current: number;
    target: number;
    unit: string;
    color: string;
}

const NutrientBar: React.FC<NutrientBarProps> = ({
    label,
    current,
    target,
    unit,
    color,
}) => {
    const percentage = Math.min((current / target) * 100, 100);
    const percentageText = Math.round((current / target) * 100);
    const isOverTarget = current > target;

    // Dynamic color based on completion percentage
    const getBarColor = () => {
        if (percentageText >= 90 ) {
            return 'bg-gradient-to-r from-emerald-400 to-emerald-600'; 
        } else if (percentageText >= 70 && percentageText < 90) {
            return 'bg-gradient-to-r from-yellow-400 to-yellow-600'; 
        } else {
            return 'bg-gradient-to-r from-red-400 to-red-600'; 
        }
    };

    return (
        <div className="mb-5">
            <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[15px] font-medium text-stone-700">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-[13px] text-stone-500">
                        {current.toFixed(1)} / {target.toFixed(1)} {unit}
                    </span>
                    <span
                        className={`text-[15px] font-bold ${percentageText >= 90 && percentageText <= 110
                                ? 'text-emerald-600'
                                : percentageText > 110
                                    ? 'text-amber-600'
                                    : 'text-stone-400'
                            }`}
                    >
                        {percentageText}%
                    </span>
                </div>
            </div>
            <div className="h-[12px] bg-stone-100 rounded-full overflow-hidden relative shadow-inner">
                <div
                    className={`h-full ${getBarColor()} transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
            </div>
        </div>
    );
};

const NutritionDashboard: React.FC = () => {
    const activity = useSelector((state: RootState) => state.activity.current);

    // Calculate energy from macros (4 cal/g protein, 4 cal/g carbs, 9 cal/g fat)
    const currentEnergy =
        activity.macros.protein * 4 +
        activity.macros.carbs * 4 +
        activity.macros.fats * 9;

    return (
        <div className="min-h-screen bg-white p-2">
            

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="fc heading-font text-xl font-bold text-stone-800 mb-3 tracking-tight">
                        Daily Report
                    </h1>
                    
                </div>

                {/* Macronutrients Section */}
                <div className="bg-white rounded-xl shadow-md shadow-stone-300 p-4 mb-8 border border-stone-300">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-200">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
                        <h2 className="heading-font text-xl font-bold text-stone-800">
                            Macronutrients
                        </h2>
                    </div>

                    <div className="grid gap-6">
                        <NutrientBar
                            label="Energy"
                            current={currentEnergy}
                            target={IDEAL_NUTRITION.macros.energy}
                            unit="kcal"
                            color="bg-gradient-to-r from-blue-400 to-blue-600"
                        />
                        <NutrientBar
                            label="Protein"
                            current={activity.macros.protein}
                            target={IDEAL_NUTRITION.macros.protein}
                            unit="g"
                            color="bg-gradient-to-r from-emerald-400 to-emerald-600"
                        />
                        <NutrientBar
                            label="Net Carbs"
                            current={activity.macros.carbs}
                            target={IDEAL_NUTRITION.macros.carbs}
                            unit="g"
                            color="bg-gradient-to-r from-sky-400 to-sky-600"
                        />
                        <NutrientBar
                            label="Fat"
                            current={activity.macros.fats}
                            target={IDEAL_NUTRITION.macros.fats}
                            unit="g"
                            color="bg-gradient-to-r from-rose-400 to-rose-600"
                        />
                    </div>
                </div>

                {/* Micronutrients Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Vitamins Section */}
                    <div className="bg-white rounded-xl shadow-md shadow-stone-300 p-4 border border-stone-300">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-200">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
                            <h2 className="heading-font text-xl font-bold text-stone-800">
                                Vitamins
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <NutrientBar
                                label="B1 (Thiamine)"
                                current={activity.totalMicro.vitamins.b1}
                                target={IDEAL_NUTRITION.vitamins.b1}
                                unit="mg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B2 (Riboflavin)"
                                current={activity.totalMicro.vitamins.b2}
                                target={IDEAL_NUTRITION.vitamins.b2}
                                unit="mg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B3 (Niacin)"
                                current={activity.totalMicro.vitamins.b3}
                                target={IDEAL_NUTRITION.vitamins.b3}
                                unit="mg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B5 (Pantothenic Acid)"
                                current={activity.totalMicro.vitamins.b5}
                                target={IDEAL_NUTRITION.vitamins.b5}
                                unit="mg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B6 (Pyridoxine)"
                                current={activity.totalMicro.vitamins.b6}
                                target={IDEAL_NUTRITION.vitamins.b6}
                                unit="mg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B12 (Cobalamin)"
                                current={activity.totalMicro.vitamins.b12}
                                target={IDEAL_NUTRITION.vitamins.b12}
                                unit="μg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="Folate"
                                current={activity.totalMicro.vitamins.b9}
                                target={IDEAL_NUTRITION.vitamins.b9}
                                unit="μg"
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="Vitamin A"
                                current={activity.totalMicro.vitamins.a}
                                target={IDEAL_NUTRITION.vitamins.a}
                                unit="IU"
                                color="bg-gradient-to-r from-orange-400 to-orange-600"
                            />
                            <NutrientBar
                                label="Vitamin C"
                                current={activity.totalMicro.vitamins.c}
                                target={IDEAL_NUTRITION.vitamins.c}
                                unit="mg"
                                color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                            />
                            <NutrientBar
                                label="Vitamin D"
                                current={activity.totalMicro.vitamins.d}
                                target={IDEAL_NUTRITION.vitamins.d}
                                unit="IU"
                                color="bg-gradient-to-r from-amber-400 to-amber-600"
                            />
                            <NutrientBar
                                label="Vitamin E"
                                current={activity.totalMicro.vitamins.e}
                                target={IDEAL_NUTRITION.vitamins.e}
                                unit="mg"
                                color="bg-gradient-to-r from-red-400 to-red-600"
                            />
                            <NutrientBar
                                label="Vitamin K"
                                current={activity.totalMicro.vitamins.k}
                                target={IDEAL_NUTRITION.vitamins.k}
                                unit="μg"
                                color="bg-gradient-to-r from-teal-400 to-teal-600"
                            />
                        </div>
                    </div>

                    {/* Minerals Section */}
                    <div className="bg-white rounded-xl shadow-md shadow-stone-300 p-4 border border-stone-300">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-200">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full" />
                            <h2 className="heading-font text-xl font-bold text-stone-800">
                                Minerals
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <NutrientBar
                                label="Calcium"
                                current={activity.totalMicro.minerals.calcium}
                                target={IDEAL_NUTRITION.minerals.calcium}
                                unit="mg"
                                color="bg-gradient-to-r from-slate-400 to-slate-600"
                            />
                            <NutrientBar
                                label="Copper"
                                current={activity.totalMicro.minerals.copper}
                                target={IDEAL_NUTRITION.minerals.copper}
                                unit="mg"
                                color="bg-gradient-to-r from-orange-400 to-orange-600"
                            />
                            <NutrientBar
                                label="Iron"
                                current={activity.totalMicro.minerals.iron}
                                target={IDEAL_NUTRITION.minerals.iron}
                                unit="mg"
                                color="bg-gradient-to-r from-red-400 to-red-600"
                            />
                            <NutrientBar
                                label="Magnesium"
                                current={activity.totalMicro.minerals.magnesium}
                                target={IDEAL_NUTRITION.minerals.magnesium}
                                unit="mg"
                                color="bg-gradient-to-r from-emerald-400 to-emerald-600"
                            />
                            <NutrientBar
                                label="Manganese"
                                current={activity.totalMicro.minerals.manganese}
                                target={IDEAL_NUTRITION.minerals.manganese}
                                unit="mg"
                                color="bg-gradient-to-r from-purple-400 to-purple-600"
                            />
                            <NutrientBar
                                label="Phosphorus"
                                current={activity.totalMicro.minerals.phosphorus}
                                target={IDEAL_NUTRITION.minerals.phosphorus}
                                unit="mg"
                                color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                            />
                            <NutrientBar
                                label="Potassium"
                                current={activity.totalMicro.minerals.potassium}
                                target={IDEAL_NUTRITION.minerals.potassium}
                                unit="mg"
                                color="bg-gradient-to-r from-lime-400 to-lime-600"
                            />
                            <NutrientBar
                                label="Selenium"
                                current={activity.totalMicro.minerals.selenium}
                                target={IDEAL_NUTRITION.minerals.selenium}
                                unit="μg"
                                color="bg-gradient-to-r from-gray-400 to-gray-600"
                            />
                            <NutrientBar
                                label="Sodium"
                                current={activity.totalMicro.minerals.sodium}
                                target={IDEAL_NUTRITION.minerals.sodium}
                                unit="mg"
                                color="bg-gradient-to-r from-blue-400 to-blue-600"
                            />
                            <NutrientBar
                                label="Zinc"
                                current={activity.totalMicro.minerals.zinc}
                                target={IDEAL_NUTRITION.minerals.zinc}
                                unit="mg"
                                color="bg-gradient-to-r from-indigo-400 to-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-stone-500 text-sm">
                    <p>
                        Values shown are based on general RDA guidelines for adult males.
                        Consult a healthcare professional for personalized recommendations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NutritionDashboard;