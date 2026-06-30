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

    const meals: Meals[] = [
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
        <div className="card m-1 flex flex-col gap-4 bg-canvas p-2 md:m-auto md:max-w-xl md:p-4">
            {meals.map((meal) => {
                return (
                    <div
                        key={meal.id}
                        className="card flex w-full flex-row items-center justify-between gap-4 p-4 md:px-8"
                    >
                        <div className="flex gap-2 md:gap-15">
                            <div className="h-18 w-18 flex flex-row items-center justify-center rounded-md">
                                <Image src={meal.image} alt={meal?.mealType ? meal?.mealType:''} height={50} width={50} />
                            </div>
                            <div className="h-20 flex flex-row items-center justify-start rounded-md">
                                <h1 className="text-xl md:text-3xl font-semibold">{'Add '+meal.mealType}</h1>
                            </div>

                        </div>
                        <button type="button" onClick={()=>addMeal(meal.mealType)} className="btn btn-secondary btn-icon" aria-label={`Add ${meal.mealType}`}>
                            <PlusIcon />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Meals;
