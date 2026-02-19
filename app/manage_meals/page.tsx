'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, MoreVertical, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateMeal } from '../store/features/activitySlice';

// Interfaces
export interface ListItems {
    foodItem: Food | undefined;
    quantity: number;
}

export interface Meal {
    id: string;
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
    list: ListItems[] | [];
}

export interface Vitamins {
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
}

export interface Minerals {
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
}

export interface Nutrition {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    vitamins?: Vitamins;
    minerals?: Minerals;
}

export interface Food {
    id: string;
    name: string;
    addedBy: string;
    selectedBy: number;
    unit: string;
    nutrition: Nutrition;
    approved: boolean;
}

// Sample food data
const sampleFoods: Food[] = [
    {
        id: '1',
        name: 'Mixed Vegetables',
        addedBy: 'admin',
        selectedBy: 0,
        unit: '1 cup',
        nutrition: {
            calories: 90,
            protein: 3,
            carbs: 18,
            fats: 0.5,
        },
        approved: true,
    },
    {
        id: '2',
        name: 'ruhi fish',
        addedBy: 'admin',
        selectedBy: 0,
        unit: '100 g',
        nutrition: {
            calories: 178,
            protein: 20,
            carbs: 0,
            fats: 10,
        },
        approved: true,
    },
    {
        id: '3',
        name: 'Brown Rice',
        addedBy: 'admin',
        selectedBy: 0,
        unit: '1 cup',
        nutrition: {
            calories: 216,
            protein: 5,
            carbs: 45,
            fats: 1.8,
        },
        approved: true,
    },
    {
        id: '4',
        name: 'Chicken Breast',
        addedBy: 'admin',
        selectedBy: 0,
        unit: '100 g',
        nutrition: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
        },
        approved: true,
    },
    {
        id: '5',
        name: 'Greek Yogurt',
        addedBy: 'admin',
        selectedBy: 0,
        unit: '1 cup',
        nutrition: {
            calories: 130,
            protein: 11,
            carbs: 9,
            fats: 5,
        },
        approved: true,
    },
];

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

    const [foods, setFoods] = useState<Food[]>(useAppSelector((state) => state.foods.list))

    const [showFoodSelector, setShowFoodSelector] = useState<string | null>(null);

    const dispatch=useAppDispatch()

    // Calculate total calories for a meal
    const calculateMealCalories = (meal: Meal): number => {
        return meal.list.reduce((total, item) => {
            if (item.foodItem) {
                return total + item.foodItem.nutrition.calories * item.quantity;
            }
            return total;
        }, 0);
    };

    // Add food to meal
    const addFoodToMeal = (mealId: string, food: Food) => {
        setMeals((prevMeals) =>
            prevMeals.map((meal) => {
                if (meal.id === mealId) {
                    const existingItem = meal.list.find(
                        (item) => item.foodItem?.id === food.id
                    );

                    if (existingItem) {
                        // Increment quantity if food already exists
                        return {
                            ...meal,
                            list: meal.list.map((item) =>
                                item.foodItem?.id === food.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    } else {
                        // Add new food
                        return {
                            ...meal,
                            list: [...meal.list, { foodItem: food, quantity: 1 }],
                        };
                    }
                }
                return meal;
            })
        );
        setShowFoodSelector(null);
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
    },[meals])

    return (
        <div className="min-h-screen bg-white py-4 md:py-8">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">My Meals</h1>

                <div className="space-y-6">
                    {meals.map((meal) => (
                        <div
                            key={meal.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden"
                        >
                            {/* Meal Header */}
                            <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b border-gray-300">
                                <h2 className="text-md md:text-2xl font-semibold text-gray-900">
                                    {meal.mealType}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-md md:text-2xl font-semibold text-gray-900">
                                        {calculateMealCalories(meal)}
                                    </span>
                                    {/* 
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                    */}
                                </div>
                            </div>

                            {/* Food List */}
                            <div className="divide-y divide-gray-300">
                                {meal.list.map((item) => {
                                    if (!item.foodItem) return null;

                                    const totalCalories = item.foodItem.nutrition.calories * item.quantity;

                                    return (
                                        <div
                                            key={item.foodItem.id}
                                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-base font-medium text-gray-900">
                                                        {item.foodItem.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-sm text-gray-500">
                                                            {item.foodItem.unit}
                                                        </p>
                                                        {item.quantity > 1 && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() =>
                                                                            updateQuantity(
                                                                                meal.id,
                                                                                item.foodItem!.id,
                                                                                item.quantity - 1
                                                                            )
                                                                        }
                                                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="text-sm text-gray-600 px-2">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() =>
                                                                            updateQuantity(
                                                                                meal.id,
                                                                                item.foodItem!.id,
                                                                                item.quantity + 1
                                                                            )
                                                                        }
                                                                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-semibold"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 ml-4">
                                                    <span className="text-base font-medium text-gray-900">
                                                        {totalCalories}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            removeFoodFromMeal(meal.id, item.foodItem!.id)
                                                        }
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Food Button */}
                                <div className="px-2 py-4">
                                    {showFoodSelector === meal.id ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-medium text-gray-700">
                                                    Select Food
                                                </h3>
                                                <button
                                                    onClick={() => setShowFoodSelector(null)}
                                                    className="text-sm text-red-700 hover:text-red-500 mr-1"
                                                >
                                                    <X/>
                                                </button>
                                            </div>
                                            <div className="grid gap-2 max-h-64 border p-1 border-stone-300 rounded-lg shadow-[0_0_6px_1px_rgb(0,0,0)] shadow-stone-300 overflow-y-auto no-scr">
                                                {foods.map((food) => (
                                                    <button
                                                        key={food.id}
                                                        onClick={() => addFoodToMeal(meal.id, food)}
                                                        className="text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {food.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">{food.unit}</p>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {food.nutrition.calories} cal
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowFoodSelector(meal.id)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-xs md:text-md transition-colors"
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
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-300 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-700">
                            Total Daily Calories
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                            {meals.reduce((total, meal) => total + calculateMealCalories(meal), 0)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}