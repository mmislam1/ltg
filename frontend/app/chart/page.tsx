'use client'
import React, { useEffect, useState } from 'react';
import { Meal } from '../store/features/activitySlice';
import { useAppSelector } from '../store/hooks';
import { NUTRIENT_UNITS, scaleNutrient } from '../store/nutritionUnits';


interface UserProfile {
    name: string;
    date: string;
    weight: string;
    height: string;
    age: number;
    dailyGoals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

// Sample data matching the image
const sampleData: UserProfile & { meals: Meal[] } = {
    name: "Meal record",
    date: "",
    weight: "-",
    height: "-",
    age: 0,
    dailyGoals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    },
    meals: []
};

const NutritionChart: React.FC = () => {
    const [data,setData] = useState(sampleData);
    const meals = useAppSelector((store) => store.activity.current.chart.meals)
    const selectedDate = useAppSelector((store) => store.activity.current.selectedDate)
    const activityError = useAppSelector((store) => store.activity.error)
    const user = useAppSelector((store) => store.auth.user)

    //console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',store.activity.current)

    useEffect(()=>{

        setData({
            name: user?.name || "Meal record",
            date: selectedDate,
            weight: user ? `${user.weight} ${user.weightUnit}` : "-",
            height: user ? `${user.height} ${user.heightUnit}` : "-",
            age: user?.age || 0,
            dailyGoals: {
                calories: user?.dailyGoals.targetCalories || 0,
                protein: user?.dailyGoals.targetProtein || 0,
                carbs: user?.dailyGoals.targetCarb || 0,
                fats: user?.dailyGoals.targetFat || 0,
            },
            meals,
        })
    },[meals, selectedDate, user])
    // Calculate totals
    const calculateTotals = () => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalcarbss = 0;
        let totalfatss = 0;

        data.meals.forEach(meal => {
            meal.list?.forEach(food => {
                if (!food.foodItem) return;
                totalCalories += scaleNutrient(food.foodItem, food.foodItem.nutrition.calories, food.quantity);
                totalProtein += scaleNutrient(food.foodItem, food.foodItem.nutrition.protein, food.quantity);
                totalcarbss += scaleNutrient(food.foodItem, food.foodItem.nutrition.carbs, food.quantity);
                totalfatss += scaleNutrient(food.foodItem, food.foodItem.nutrition.fats, food.quantity);
            });
        });

        return {
            calories: totalCalories.toFixed(1),
            protein: totalProtein.toFixed(2),
            carbss: totalcarbss.toFixed(2),
            fatss: totalfatss.toFixed(2)
        };
    };

    const totals = calculateTotals();

    return (
        <div className="w-full bg-canvas py-4">
            {activityError && (
                <div role="alert" className="mx-auto mb-4 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                    {activityError}
                </div>
            )}
            {/* Scroll container (mobile behaves like PDF viewer) */}
            <div className="overflow-x-auto">
                {/* Fixed-width A4 layout */}
                <div className="min-w-[800px] max-w-[800px] mx-auto p-6 bg-white">

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 pb-3 border-b-2 border-gray-800">
                        <div>
                            <h1 className="text-[18px] font-bold mb-2">{data.name}</h1>
                            <p className="text-[12px] text-gray-600">Date: {data.date}</p>
                            <p className="text-[12px] text-gray-600">Weight: {data.weight}</p>
                            <p className="text-[12px] text-gray-600">Height: {data.height}</p>
                            <p className="text-[12px] text-gray-600">Age: {data.age} years</p>
                        </div>

                        <div className="grid grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-[14px] font-bold">{data.dailyGoals.calories.toFixed(1)} {NUTRIENT_UNITS.calories}</div>
                                <div className="text-[12px] font-bold text-calories">Cal</div>
                            </div>
                            <div>
                                <div className="text-[14px] font-bold">{data.dailyGoals.protein.toFixed(2)} {NUTRIENT_UNITS.protein}</div>
                                <div className="text-[12px] font-bold text-protein">Protein</div>
                            </div>
                            <div>
                                <div className="text-[14px] font-bold">{data.dailyGoals.carbs.toFixed(2)} {NUTRIENT_UNITS.carbs}</div>
                                <div className="text-[12px] font-bold text-carbs">Carbs</div>
                            </div>
                            <div>
                                <div className="text-[14px] font-bold">{data.dailyGoals.fats.toFixed(2)} {NUTRIENT_UNITS.fats}</div>
                                <div className="text-[12px] font-bold text-fat">Fats</div>
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Table */}
                    <table className="w-full border-collapse text-[12px]">
                        <thead>
                            <tr className="bg-gray-200 border-y border-gray-400">
                                <th className="w-[40%] px-2 py-2 text-left font-bold">Food</th>
                                <th className="w-[12%] px-2 py-2 text-center font-bold">Quantity</th>
                                <th className="w-[12%] px-2 py-2 text-center font-bold">Calories</th>
                                <th className="w-[12%] px-2 py-2 text-center font-bold text-protein">Protein</th>
                                <th className="w-[12%] px-2 py-2 text-center font-bold text-carbs">Carbs</th>
                                <th className="w-[12%] px-2 py-2 text-center font-bold text-fat">Fats</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.meals.map((meal, mealIndex) =>{ 
                                if(meal.list.length===0){
                                    return null
                                }
                                return(
                                <React.Fragment key={mealIndex}>
                                    {/* Meal Header */}
                                    <tr className="bg-gray-300">
                                        <td colSpan={6} className="px-2 py-2 font-bold capitalize">
                                            {meal.mealType}
                                        </td>
                                    </tr>

                                    {/* Food Rows */}
                                    {meal.list?.map((food, foodIndex) => (
                                        <tr key={foodIndex} className="border-t border-gray-300">
                                            <td className="px-2 py-2 whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                                                {food.foodItem?.name}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {food.quantity} {food.foodItem?.unit}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                 {food.foodItem
                                                     ? scaleNutrient(food.foodItem, food.foodItem.nutrition.calories, food.quantity).toFixed(1)
                                                     : 0} {NUTRIENT_UNITS.calories}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                 {food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.protein, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.protein}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                 {food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.carbs, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.carbs}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                 {food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.fats, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.fats}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            )})}

                            {/* Total Row */}
                            <tr className="bg-gray-300 font-bold border-t border-gray-400">
                                <td className="px-2 py-2">Total</td>
                                <td></td>
                                <td className="text-center">{totals.calories} {NUTRIENT_UNITS.calories}</td>
                                <td className="text-center">{totals.protein} {NUTRIENT_UNITS.protein}</td>
                                <td className="text-center">{totals.carbss} {NUTRIENT_UNITS.carbs}</td>
                                <td className="text-center">{totals.fatss} {NUTRIENT_UNITS.fats}</td>
                            </tr>
                        </tbody>
                    </table>

                    
                </div>
            </div>
        </div>
    );

};

export default NutritionChart;
