import { PlusIcon } from "lucide-react";
import React, { JSX } from "react";
import Image from "next/image";


const Meals = () => {
    interface Meals {
        id: number;
        title: string;
        image: string;
    }

    const meals = [
        {
            id: 1,
            title: "Add Breakfast",
            image: '/breakFast.png',
        },
        {
            id: 2,
            title: "Add Lunch",
            image: '/lunch.png',
        },
        {
            id: 3,
            title: "Add Dinner",
            image: '/dinner.png',
        },
        {
            id: 4,
            title: "Add Snacks",
            image: '/snacks.png',
        },
    ];
    return (
        <div className="flex flex-col p-4 m-1 shadow-sm border border-gray-300 rounded-lg gap-4 bg-gray-100 md:max-w-2xl md:m-auto">
            {meals.map((meal) => {
                return (
                    <div
                        key={meal.id}
                        className="w-full flex flex-row items-center justify-between gap-4 p-2 shadow-sm border border-gray-300 rounded-lg p-2 bg-white"
                    >
                        <div className="h-20 w-20 flex flex-row items-center justify-center rounded-md">
                            <Image src={meal.image} alt={meal.title} height={50} width={50}/>
                        </div>
                        <div className="h-20 flex flex-row items-center justify-start rounded-md">
                            <h1 className="text-2xl font-semibold">{meal.title}</h1>
                        </div>
                        <div className="h-10 w-10 flex flex-row items-center justify-center bg-gray-100 flex flex-row items-center justify-center rounded-full">
                            <PlusIcon />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Meals;
