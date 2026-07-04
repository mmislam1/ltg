'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { IDEAL_NUTRITION } from './idealNutritionState';
import { NUTRIENT_UNITS } from '../store/nutritionUnits';

interface RootState {
    activity: {
        current: {
            macros: {
                calories: number;
                protein: number;
                carbs: number;
                fiber: number;
                netCarbs: number;
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
    labelColor?: string;
}

const NutrientBar: React.FC<NutrientBarProps> = ({
    label,
    current,
    target,
    unit,
    color,
    labelColor = "text-ink",
}) => {
    const percentage = Math.min((current / target) * 100, 100);
    const percentageText = Math.round((current / target) * 100);
    return (
        <div className="mb-5">
            <div className="flex justify-between items-baseline mb-1.5">
                <span className={`text-[15px] font-medium ${labelColor}`}>{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-[13px] text-muted">
                        {current.toFixed(1)} / {target.toFixed(1)} {unit}
                    </span>
                    <span
                        className={`text-[15px] font-bold ${percentageText >= 90 && percentageText <= 110
                                ? 'text-emerald-600'
                                : percentageText > 110
                                    ? 'text-amber-600'
                                    : 'text-muted'
                            }`}
                    >
                        {percentageText}%
                    </span>
                </div>
            </div>
            <div className="relative h-[12px] overflow-hidden rounded-full bg-brand-soft shadow-inner">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
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

    const currentEnergy = activity.macros.calories;

    return (
        <div className="min-h-screen bg-canvas p-2">
            

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="fc mb-3 text-xl font-bold tracking-tight text-ink">
                        Daily Report
                    </h1>
                    
                </div>

                {/* Macronutrients Section */}
                <div className="card mb-8 p-4">
                    <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
                        <h2 className="text-xl font-bold text-ink">
                            Macronutrients
                        </h2>
                    </div>

                    <div className="grid gap-6">
                        <NutrientBar
                            label="Energy"
                            current={currentEnergy}
                            target={IDEAL_NUTRITION.macros.energy}
                            unit={NUTRIENT_UNITS.calories}
                            color="bg-calories"
                            labelColor="text-calories"
                        />
                        <NutrientBar
                            label="Protein"
                            current={activity.macros.protein}
                            target={IDEAL_NUTRITION.macros.protein}
                            unit={NUTRIENT_UNITS.protein}
                            color="bg-protein"
                            labelColor="text-protein"
                        />
                        <NutrientBar
                            label="Total Carbs"
                            current={activity.macros.carbs}
                            target={IDEAL_NUTRITION.macros.carbs}
                            unit={NUTRIENT_UNITS.carbs}
                            color="bg-carbs"
                            labelColor="text-carbs"
                        />
                        <NutrientBar
                            label="Fiber"
                            current={activity.macros.fiber}
                            target={IDEAL_NUTRITION.macros.fiber}
                            unit={NUTRIENT_UNITS.fiber}
                            color="bg-carbs"
                            labelColor="text-carbs"
                        />
                        <NutrientBar
                            label="Fat"
                            current={activity.macros.fats}
                            target={IDEAL_NUTRITION.macros.fats}
                            unit={NUTRIENT_UNITS.fats}
                            color="bg-fat"
                            labelColor="text-fat"
                        />
                    </div>
                </div>

                {/* Micronutrients Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Vitamins Section */}
                    <div className="card p-4">
                        <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
                            <h2 className="text-xl font-bold text-ink">
                                Vitamins
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <NutrientBar
                                label="B1 (Thiamine)"
                                current={activity.totalMicro.vitamins.b1}
                                target={IDEAL_NUTRITION.vitamins.b1}
                                unit={NUTRIENT_UNITS.vitamins.b1}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B2 (Riboflavin)"
                                current={activity.totalMicro.vitamins.b2}
                                target={IDEAL_NUTRITION.vitamins.b2}
                                unit={NUTRIENT_UNITS.vitamins.b2}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B3 (Niacin)"
                                current={activity.totalMicro.vitamins.b3}
                                target={IDEAL_NUTRITION.vitamins.b3}
                                unit={NUTRIENT_UNITS.vitamins.b3}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B5 (Pantothenic Acid)"
                                current={activity.totalMicro.vitamins.b5}
                                target={IDEAL_NUTRITION.vitamins.b5}
                                unit={NUTRIENT_UNITS.vitamins.b5}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B6 (Pyridoxine)"
                                current={activity.totalMicro.vitamins.b6}
                                target={IDEAL_NUTRITION.vitamins.b6}
                                unit={NUTRIENT_UNITS.vitamins.b6}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B7 (Biotin)"
                                current={activity.totalMicro.vitamins.b7}
                                target={IDEAL_NUTRITION.vitamins.b7}
                                unit={NUTRIENT_UNITS.vitamins.b7}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B8 (Choline)"
                                current={activity.totalMicro.vitamins.b8}
                                target={IDEAL_NUTRITION.vitamins.b8}
                                unit={NUTRIENT_UNITS.vitamins.b8}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="B12 (Cobalamin)"
                                current={activity.totalMicro.vitamins.b12}
                                target={IDEAL_NUTRITION.vitamins.b12}
                                unit={NUTRIENT_UNITS.vitamins.b12}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="Folate"
                                current={activity.totalMicro.vitamins.b9}
                                target={IDEAL_NUTRITION.vitamins.b9}
                                unit={NUTRIENT_UNITS.vitamins.b9}
                                color="bg-gradient-to-r from-green-400 to-green-600"
                            />
                            <NutrientBar
                                label="Vitamin A"
                                current={activity.totalMicro.vitamins.a}
                                target={IDEAL_NUTRITION.vitamins.a}
                                unit={NUTRIENT_UNITS.vitamins.a}
                                color="bg-gradient-to-r from-orange-400 to-orange-600"
                            />
                            <NutrientBar
                                label="Vitamin C"
                                current={activity.totalMicro.vitamins.c}
                                target={IDEAL_NUTRITION.vitamins.c}
                                unit={NUTRIENT_UNITS.vitamins.c}
                                color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                            />
                            <NutrientBar
                                label="Vitamin D"
                                current={activity.totalMicro.vitamins.d}
                                target={IDEAL_NUTRITION.vitamins.d}
                                unit={NUTRIENT_UNITS.vitamins.d}
                                color="bg-gradient-to-r from-amber-400 to-amber-600"
                            />
                            <NutrientBar
                                label="Vitamin E"
                                current={activity.totalMicro.vitamins.e}
                                target={IDEAL_NUTRITION.vitamins.e}
                                unit={NUTRIENT_UNITS.vitamins.e}
                                color="bg-gradient-to-r from-red-400 to-red-600"
                            />
                            <NutrientBar
                                label="Vitamin K"
                                current={activity.totalMicro.vitamins.k}
                                target={IDEAL_NUTRITION.vitamins.k}
                                unit={NUTRIENT_UNITS.vitamins.k}
                                color="bg-gradient-to-r from-teal-400 to-teal-600"
                            />
                        </div>
                    </div>

                    {/* Minerals Section */}
                    <div className="card p-4">
                        <div className="mb-8 flex items-center gap-3 border-b border-line pb-4">
                            <h2 className="text-xl font-bold text-ink">
                                Minerals
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <NutrientBar
                                label="Calcium"
                                current={activity.totalMicro.minerals.calcium}
                                target={IDEAL_NUTRITION.minerals.calcium}
                                unit={NUTRIENT_UNITS.minerals.calcium}
                                color="bg-gradient-to-r from-slate-400 to-slate-600"
                            />
                            <NutrientBar
                                label="Copper"
                                current={activity.totalMicro.minerals.copper}
                                target={IDEAL_NUTRITION.minerals.copper}
                                unit={NUTRIENT_UNITS.minerals.copper}
                                color="bg-gradient-to-r from-orange-400 to-orange-600"
                            />
                            <NutrientBar
                                label="Iron"
                                current={activity.totalMicro.minerals.iron}
                                target={IDEAL_NUTRITION.minerals.iron}
                                unit={NUTRIENT_UNITS.minerals.iron}
                                color="bg-gradient-to-r from-red-400 to-red-600"
                            />
                            <NutrientBar
                                label="Magnesium"
                                current={activity.totalMicro.minerals.magnesium}
                                target={IDEAL_NUTRITION.minerals.magnesium}
                                unit={NUTRIENT_UNITS.minerals.magnesium}
                                color="bg-gradient-to-r from-emerald-400 to-emerald-600"
                            />
                            <NutrientBar
                                label="Manganese"
                                current={activity.totalMicro.minerals.manganese}
                                target={IDEAL_NUTRITION.minerals.manganese}
                                unit={NUTRIENT_UNITS.minerals.manganese}
                                color="bg-gradient-to-r from-purple-400 to-purple-600"
                            />
                            <NutrientBar
                                label="Phosphorus"
                                current={activity.totalMicro.minerals.phosphorus}
                                target={IDEAL_NUTRITION.minerals.phosphorus}
                                unit={NUTRIENT_UNITS.minerals.phosphorus}
                                color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                            />
                            <NutrientBar
                                label="Potassium"
                                current={activity.totalMicro.minerals.potassium}
                                target={IDEAL_NUTRITION.minerals.potassium}
                                unit={NUTRIENT_UNITS.minerals.potassium}
                                color="bg-gradient-to-r from-lime-400 to-lime-600"
                            />
                            <NutrientBar
                                label="Selenium"
                                current={activity.totalMicro.minerals.selenium}
                                target={IDEAL_NUTRITION.minerals.selenium}
                                unit={NUTRIENT_UNITS.minerals.selenium}
                                color="bg-gradient-to-r from-gray-400 to-gray-600"
                            />
                            <NutrientBar
                                label="Sodium"
                                current={activity.totalMicro.minerals.sodium}
                                target={IDEAL_NUTRITION.minerals.sodium}
                                unit={NUTRIENT_UNITS.minerals.sodium}
                                color="bg-gradient-to-r from-blue-400 to-blue-600"
                            />
                            <NutrientBar
                                label="Zinc"
                                current={activity.totalMicro.minerals.zinc}
                                target={IDEAL_NUTRITION.minerals.zinc}
                                unit={NUTRIENT_UNITS.minerals.zinc}
                                color="bg-gradient-to-r from-indigo-400 to-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-muted">
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
