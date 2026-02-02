'use client'
import { PlusIcon } from "lucide-react";
import React, { JSX } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Meals {
        id: number;
        mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
        image: string;
    }

const Meals = () => {

    const router =useRouter()

    const addMeal = (s: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined)=>{router.push(`/foodList/${s?s:undefined}`)}

    const meals = [
        {
            id: 1,
            mealType: "Breakfast",
            image: '/breakFast.png',
        },
        {
            id: 2,
            mealType: "Lunch",
            image: '/lunch.png',
        },
        {
            id: 3,
            mealType: "Dinner",
            image: '/dinner.png',
        },
        {
            id: 4,
            mealType: "Snack",
            image: '/snacks.png',
        },
    ];
    return (
        <div className="flex flex-col p-2 md:p-4 m-1 shadow-sm border border-gray-300 rounded-lg gap-4 bg-gray-100 md:max-w-xl md:m-auto">
            {meals.map((meal) => {
                return (
                    <div
                        key={meal.id}
                        className="w-full flex flex-row items-center justify-between gap-4 p-2 shadow-sm border border-gray-300 rounded-lg p-4 bg-white md:px-8"
                    >
                        <div className="flex gap-2 md:gap-15">
                            <div className="h-18 w-18 flex flex-row items-center justify-center rounded-md">
                                <Image src={meal.image} alt={meal.mealType} height={50} width={50} />
                            </div>
                            <div className="h-20 flex flex-row items-center justify-start rounded-md">
                                <h1 className="text-xl md:text-3xl font-semibold">{'Add '+meal.mealType}</h1>
                            </div>

                        </div>
                        <button onClick={()=>addMeal(meal.mealType)} className="flex">
                            <div className="h-10 w-10 flex flex-row items-center justify-center bg-gray-100 hover:bg-green-200 focus:bg-green-200 active:bg-green-200 flex flex-row items-center justify-center rounded-full">
                                <PlusIcon />
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Meals;
