'use client';

import Link from 'next/link';
import { ChevronDown, Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    saveMealActivity,
    updateMeal,
    type Meal,
} from '../store/features/activitySlice';
import type { Food } from '../store/features/foodSlice';
import { NUTRIENT_UNITS, scaleNutrient } from '../store/nutritionUnits';
import FoodSelector from '../components/foodSelector';

export default function MealsPage() {

    const meals = useAppSelector((state) => state.activity.current.chart.meals)
    const selectedDate = useAppSelector((state) => state.activity.current.selectedDate)
    const loading = useAppSelector((state) => state.activity.loading)
    const saving = useAppSelector((state) => state.activity.saving)
    const activityError = useAppSelector((state) => state.activity.error)

    const dispatch=useAppDispatch()

    const addedMeals = meals.filter((meal) => meal.list.length > 0);

    const commitMeal = (nextMeal: Meal) => {
        if (!selectedDate) return;
        dispatch(updateMeal(
            meals.map((meal) => meal.id === nextMeal.id ? nextMeal : meal)
        ));
        void dispatch(saveMealActivity({ meal: nextMeal, date: selectedDate }));
    };

    // Calculate total calories for a meal
    const calculateMealCalories = (meal: Meal): number => {
        return meal.list.reduce((total, item) => {
            if (item.foodItem) {
                return total + scaleNutrient(
                    item.foodItem,
                    item.foodItem.nutrition.calories,
                    item.quantity,
                );
            }
            return total;
        }, 0);
    };

    const toggleFoodForMeal = (mealId: string, food: Food, quantity: number) => {
        const meal = meals.find((item) => item.id === mealId);
        if (!meal) return;
        const selected = meal.list.some((item) => item.foodItem?.id === food.id);
        commitMeal({
            ...meal,
            list: selected
                ? meal.list.filter((item) => item.foodItem?.id !== food.id)
                : [...meal.list, { foodItem: food, quantity }],
        });
    };

    // Remove food from meal
    const removeFoodFromMeal = (mealId: string, foodId: string) => {
        const meal = meals.find((item) => item.id === mealId);
        if (!meal) return;
        commitMeal({
            ...meal,
            list: meal.list.filter((item) => item.foodItem?.id !== foodId),
        });
    };

    // Update quantity
    const updateQuantity = (mealId: string, foodId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFoodFromMeal(mealId, foodId);
            return;
        }

        const meal = meals.find((item) => item.id === mealId);
        if (!meal) return;
        commitMeal({
            ...meal,
            list: meal.list.map((item) =>
                item.foodItem?.id === foodId
                    ? { ...item, quantity: newQuantity }
                    : item
            ),
        });
    };

    return (
        <div className="min-h-screen bg-canvas py-4 md:py-8">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-ink md:text-3xl">My Meals</h1>
                        {selectedDate && <p className="mt-1 text-sm text-muted">{selectedDate}</p>}
                    </div>
                    <span className="text-xs font-semibold text-muted">
                        {loading ? 'Loading record...' : saving > 0 ? 'Saving...' : 'Saved'}
                    </span>
                </div>
                {activityError && (
                    <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                        {activityError}
                    </div>
                )}

                <div className="space-y-6">
                    {addedMeals.map((meal) => (
                        <details
                            key={meal.id}
                            className="card group overflow-hidden"
                        >
                            {/* Meal Header */}
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 marker:content-none md:px-6 md:py-4">
                                <div>
                                    <h2 className="text-md font-semibold text-ink md:text-2xl">
                                        {meal.mealType}
                                    </h2>
                                    <span className="mt-1 block text-xs font-medium text-muted">
                                        {meal.list.length} {meal.list.length === 1 ? 'food' : 'foods'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <span className="text-md font-semibold text-ink md:text-2xl">
                                        {calculateMealCalories(meal).toFixed(1)} {NUTRIENT_UNITS.calories}
                                    </span>
                                    {meal.mealType && (
                                        <Link
                                            href={`/foodList/${meal.mealType}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="btn btn-secondary btn-sm px-2 sm:px-3"
                                            aria-label={`Edit ${meal.mealType}`}
                                        >
                                            <Pencil size={15} aria-hidden="true" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Link>
                                    )}
                                    <ChevronDown
                                        className="shrink-0 text-muted transition-transform group-open:rotate-180"
                                        size={20}
                                        aria-hidden="true"
                                    />
                                </div>
                            </summary>

                            {/* Food dropdown */}
                            <div className="border-t border-line p-2 md:p-3">
                                <FoodSelector
                                    foods={meal.list.flatMap((item) => item.foodItem ? [item.foodItem] : [])}
                                    selectedItems={meal.list}
                                    onToggle={(food, quantity) => toggleFoodForMeal(meal.id, food, quantity)}
                                    onQuantityChange={(foodId, quantity) => updateQuantity(meal.id, foodId, quantity)}
                                    showSearch={false}
                                />
                            </div>
                        </details>
                    ))}

                    {!loading && addedMeals.length === 0 && (
                        <div className="card px-6 py-10 text-center text-sm text-muted">
                            No meals added for this date yet.
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="card mt-8 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-ink">
                            Total Daily Calories
                        </span>
                        <span className="text-2xl font-bold text-ink">
                            {meals.reduce((total, meal) => total + calculateMealCalories(meal), 0).toFixed(1)} {NUTRIENT_UNITS.calories}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
