'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateMeal, type Meal } from '../store/features/activitySlice';
import type { Food } from '../store/features/foodSlice';
import { NUTRIENT_UNITS, scaleNutrient } from '../store/nutritionUnits';
import FoodSelector from '../components/foodSelector';

export default function MealsPage() {

    const currentMeals = useAppSelector((state) => state.activity.current.chart.meals)

    const [meals, setMeals] = useState<Meal[]>(currentMeals.length===0?[
        {
            id: '1',
            mealType: 'Breakfast',
            list: [],
        },
        {
            id: '2',
            mealType: 'Lunch',
            list: [],
        },
        {
            id: '3',
            mealType: 'Dinner',
            list: [],
        },
        {
            id: '4',
            mealType: 'Snack',
            list: [],
        },
    ]:currentMeals);

    const foods = useAppSelector((state) => state.foods.list)

    const [showFoodSelector, setShowFoodSelector] = useState<string | null>(null);

    const dispatch=useAppDispatch()

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
        setMeals((prevMeals) =>
            prevMeals.map((meal) => {
                if (meal.id !== mealId) return meal;
                const selected = meal.list.some((item) => item.foodItem?.id === food.id);
                return {
                    ...meal,
                    list: selected
                        ? meal.list.filter((item) => item.foodItem?.id !== food.id)
                        : [...meal.list, { foodItem: food, quantity }],
                };
            })
        );
    };

    // Remove food from meal
    const removeFoodFromMeal = (mealId: string, foodId: string) => {
        setMeals((prevMeals) =>
            prevMeals.map((meal) => {
                if (meal.id === mealId) {
                    return {
                        ...meal,
                        list: meal.list.filter((item) => item.foodItem?.id !== foodId),
                    };
                }
                return meal;
            })
        );
    };

    // Update quantity
    const updateQuantity = (mealId: string, foodId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFoodFromMeal(mealId, foodId);
            return;
        }

        setMeals((prevMeals) =>
            prevMeals.map((meal) => {
                if (meal.id === mealId) {
                    return {
                        ...meal,
                        list: meal.list.map((item) =>
                            item.foodItem?.id === foodId
                                ? { ...item, quantity: newQuantity }
                                : item
                        ),
                    };
                }
                return meal;
            })
        );
    };

    useEffect(()=>{
        dispatch(updateMeal(meals))
        /*setMeals()*/
    },[dispatch, meals])

    return (
        <div className="min-h-screen bg-canvas py-4 md:py-8">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <h1 className="mb-3 text-xl font-bold text-ink md:text-3xl">My Meals</h1>

                <div className="space-y-6">
                    {meals.map((meal) => (
                        <div
                            key={meal.id}
                            className="card overflow-hidden"
                        >
                            {/* Meal Header */}
                            <div className="flex items-center justify-between border-b border-line px-3 py-3 md:px-6 md:py-4">
                                <h2 className="text-md font-semibold text-ink md:text-2xl">
                                    {meal.mealType}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-md font-semibold text-ink md:text-2xl">
                                        {calculateMealCalories(meal).toFixed(1)} {NUTRIENT_UNITS.calories}
                                    </span>
                                    {/* 
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                    */}
                                </div>
                            </div>

                            {/* Food List */}
                            <div className="divide-y divide-line">
                                {showFoodSelector !== meal.id && meal.list.length > 0 && (
                                    <FoodSelector
                                        foods={meal.list.flatMap((item) => item.foodItem ? [item.foodItem] : [])}
                                        selectedItems={meal.list}
                                        onToggle={(food, quantity) => toggleFoodForMeal(meal.id, food, quantity)}
                                        onQuantityChange={(foodId, quantity) => updateQuantity(meal.id, foodId, quantity)}
                                        showSearch={false}
                                    />
                                )}

                                {/* Add Food Button */}
                                <div className="px-2 py-4">
                                    {showFoodSelector === meal.id ? (
                                        <div className="selection-panel space-y-3 p-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-ink">
                                                    Select Food
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFoodSelector(null)}
                                                    className="btn btn-danger btn-icon"
                                                    aria-label="Close food selector"
                                                >
                                                    <X/>
                                                </button>
                                            </div>
                                            <FoodSelector
                                                foods={foods}
                                                selectedItems={meal.list}
                                                onToggle={(food, quantity) => toggleFoodForMeal(meal.id, food, quantity)}
                                                onQuantityChange={(foodId, quantity) => updateQuantity(meal.id, foodId, quantity)}
                                                maxHeight="32rem"
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowFoodSelector(meal.id)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            <Plus size={16} />
                                            ADD FOOD
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
