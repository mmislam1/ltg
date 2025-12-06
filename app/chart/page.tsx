'use client';

import { useRef } from 'react';


interface FoodItem {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface Meal {
    name: string;
    items: FoodItem[];
}

interface NutritionData {
    name: string;
    weight: number;
    weightUnit: string;
    age: number;
    height: number;
    heightUnit: string;
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    meals: Meal[];
}

 const Chart=() => {
    const chartRef = useRef<HTMLDivElement>(null);
    
    const data: NutritionData = {
        name: "Sajedur Rahman",
        weight: 82,
        weightUnit: "kg",
        age: 26,
        height: 178,
        heightUnit: "cm",

        totals: {
            calories: 1003.3,
            protein: 83.79,
            carbs: 128.52,
            fats: 16.45,
        },

        meals: [
            {
                name: "Breakfast",
                items: [
                    {
                        name: "Apple Regular",
                        quantity: "1 piece",
                        calories: 100.0,
                        protein: 0.0,
                        carbs: 25.0,
                        fats: 0.0,
                    },
                    {
                        name: "Yogurt (desi natural low fat)",
                        quantity: "100 gm",
                        calories: 66.76,
                        protein: 4.12,
                        carbs: 10.59,
                        fats: 0.88,
                    },
                    {
                        name: "Dymatize ISO 100 (Whey Isolate, Vanilla)",
                        quantity: "15 gm",
                        calories: 52.0,
                        protein: 12.5,
                        carbs: 0.5,
                        fats: 0.0,
                    },
                ],
            },
            {
                name: "Lunch",
                items: [
                    {
                        name: "Chicken Breast",
                        quantity: "100 gm",
                        calories: 127.1,
                        protein: 25.9,
                        carbs: 0.0,
                        fats: 3.0,
                    },
                    {
                        name: "Rice (boiled)",
                        quantity: "100 gm",
                        calories: 124.0,
                        protein: 3.0,
                        carbs: 28.0,
                        fats: 0.4,
                    },
                    {
                        name: "Mixed Vegetables",
                        quantity: "1 cup",
                        calories: 52.0,
                        protein: 2.0,
                        carbs: 11.0,
                        fats: 0.9,
                    },
                ],
            },
            {
                name: "Snacks",
                items: [
                    {
                        name: "Cashew/Walnut/Almond/Pista",
                        quantity: "10 gm",
                        calories: 68.4,
                        protein: 1.69,
                        carbs: 1.1,
                        fats: 6.4,
                    },
                    {
                        name: "Kiwi Fruit (Raw)",
                        quantity: "100 gm",
                        calories: 56.0,
                        protein: 1.0,
                        carbs: 14.0,
                        fats: 0.5,
                    },
                    {
                        name: "Apple Regular",
                        quantity: "1 piece",
                        calories: 100.0,
                        protein: 0.0,
                        carbs: 25.0,
                        fats: 0.0,
                    },
                ],
            },
            {
                name: "Dinner",
                items: [
                    {
                        name: "Yogurt",
                        quantity: "200 gm",
                        calories: 147.14,
                        protein: 10.57,
                        carbs: 12.33,
                        fats: 6.17,
                    },
                    {
                        name: "Dymatize ISO 100 (Whey Isolate, Vanilla)",
                        quantity: "30 gm",
                        calories: 110.0,
                        protein: 25.0,
                        carbs: 1.0,
                        fats: 0.9,
                    },
                ],
            },
        ],
    };
    const downloadPDF = async() => {
        const element = chartRef.current;
        if (!element) return;
        const html2pdf = (await import('html2pdf.js')).default;

        if (!chartRef.current) return;

        chartRef.current.querySelectorAll("*").forEach((el: any) => {
            const style = getComputedStyle(el);

            // Fix 'lab()' or 'oklab()'
            if (style.color.includes("lab") || style.backgroundColor.includes("lab")) {
                el.style.color = "#000"; // fallback
                el.style.backgroundColor = "#fff";
            }
        });

        const options = {
            margin: 10,
            filename: `${data.name}-nutrition-chart.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        };

        html2pdf().set(options).from(element).save();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-4 flex gap-2">
                <button
                    onClick={downloadPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Download PDF
                </button>
            </div>

            <div
                ref={chartRef}
                className="bg-white p-6 rounded-lg shadow-lg"
                style={{ fontSize: '14px' }}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">{data.name}</h1>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p>
                                <strong>Weight:</strong> {data.weight} {data.weightUnit}
                            </p>
                            <p>
                                <strong>Age:</strong> {data.age} years
                            </p>
                        </div>
                        <div>
                            <p>
                                <strong>Height:</strong> {data.height} {data.heightUnit}
                            </p>
                        </div>
                    </div>

                    {/* Nutrition Summary */}
                    <div className="grid grid-cols-4 gap-4 bg-gray-100 p-4 rounded">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Calories</p>
                            <p className="text-xl font-bold">{data.totals.calories.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Protein</p>
                            <p className="text-xl font-bold">{data.totals.protein.toFixed(2)}g</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Carbs</p>
                            <p className="text-xl font-bold">{data.totals.carbs.toFixed(2)}g</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Fats</p>
                            <p className="text-xl font-bold">{data.totals.fats.toFixed(2)}g</p>
                        </div>
                    </div>
                </div>

                {/* Meals */}
                {data.meals.map((meal, mealIdx) => (
                    <div key={mealIdx} className="mb-6">
                        <h2 className="text-lg font-bold mb-3 capitalize">{meal.name}</h2>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2 text-left">Food</th>
                                    <th className="border border-gray-300 p-2">Quantity</th>
                                    <th className="border border-gray-300 p-2">Calories</th>
                                    <th className="border border-gray-300 p-2">Protein</th>
                                    <th className="border border-gray-300 p-2">Carbs</th>
                                    <th className="border border-gray-300 p-2">Fats</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meal.items.map((item, itemIdx) => (
                                    <tr key={itemIdx} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-2">{item.name}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {item.quantity}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {item.calories.toFixed(1)}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {item.protein.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {item.carbs.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            {item.fats.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Total Row */}
                <div className="mt-6">
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr className="bg-gray-300 font-bold">
                                <td className="border border-gray-300 p-2">Total</td>
                                <td className="border border-gray-300 p-2"></td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {data.totals.calories.toFixed(1)}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {data.totals.protein.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {data.totals.carbs.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {data.totals.fats.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Chart;