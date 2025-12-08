'use client'
import React, { useState } from 'react';
import { Download } from 'lucide-react';

// Types matching your Redux slice
interface Macros {
    protein: number;
    carb: number;
    fat: number;
}

interface Food {
    name: string;
    quantity: string;
    calories: number;
    nutrition: {
        protein: number;
        carb: number;
        fat: number;
    };
}

interface Meal {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    list: Food[];
}

interface UserProfile {
    name: string;
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
    name: "Sajedur Rahman",
    weight: "82 kg",
    height: "178 cms",
    age: 26,
    dailyGoals: {
        calories: 1003.3,
        protein: 83.79,
        carbs: 128.52,
        fats: 16.45
    },
    meals: [
        {
            mealType: "breakfast",
            list: [
                {
                    name: "Apple Regular",
                    quantity: "1 piece",
                    calories: 100.0,
                    nutrition: { protein: 0.0, carb: 25.0, fat: 0.0 }
                },
                {
                    name: "yogurt (desi natural) low fat",
                    quantity: "100 gm",
                    calories: 66.76,
                    nutrition: { protein: 4.12, carb: 10.59, fat: 0.88 }
                },
                {
                    name: "Dymatize iso 100 hydrolyzed whey protein isolate gourmet vanilla, nutres",
                    quantity: "15 gm",
                    calories: 52.0,
                    nutrition: { protein: 12.5, carb: 0.5, fat: 0.0 }
                }
            ]
        },
        {
            mealType: "lunch",
            list: [
                {
                    name: "Chicken Breast",
                    quantity: "100 gm",
                    calories: 127.0,
                    nutrition: { protein: 25.9, carb: 0.0, fat: 3.0 }
                },
                {
                    name: "Brown Rice",
                    quantity: "100 gm",
                    calories: 143.0,
                    nutrition: { protein: 3.0, carb: 28.0, fat: 0.0 }
                },
                {
                    name: "Mixed Vegetables",
                    quantity: "1 cup",
                    calories: 52.0,
                    nutrition: { protein: 2.0, carb: 11.0, fat: 0.0 }
                }
            ]
        },
        {
            mealType: "snack",
            list: [
                {
                    name: "Cashew/Walnut / peanut / almonds / pista",
                    quantity: "10 gm",
                    calories: 68.4,
                    nutrition: { protein: 1.6, carb: 1.1, fat: 6.4 }
                },
                {
                    name: "Kiwi Fruit /Chinese Gooseberry Frsh Raw",
                    quantity: "100 gm",
                    calories: 56.0,
                    nutrition: { protein: 0.0, carb: 14.0, fat: 0.0 }
                },
                {
                    name: "Apple Regular",
                    quantity: "1 piece",
                    calories: 100.0,
                    nutrition: { protein: 0.0, carb: 25.0, fat: 0.0 }
                }
            ]
        },
        {
            mealType: "dinner",
            list: [
                {
                    name: "yogurt",
                    quantity: "200 gm",
                    calories: 147.14,
                    nutrition: { protein: 10.57, carb: 12.33, fat: 6.17 }
                },
                {
                    name: "Dymatize iso 100 hydrolyzed whey protein isolate gourmet vanilla, nutres",
                    quantity: "30 gm",
                    calories: 110.0,
                    nutrition: { protein: 25.0, carb: 1.0, fat: 0.0 }
                }
            ]
        }
    ]
};

const NutritionChart: React.FC = () => {
    const [data] = useState(sampleData);

    // Calculate totals
    const calculateTotals = () => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        data.meals.forEach(meal => {
            meal.list.forEach(food => {
                totalCalories += food.calories;
                totalProtein += food.nutrition.protein;
                totalCarbs += food.nutrition.carb;
                totalFats += food.nutrition.fat;
            });
        });

        return {
            calories: totalCalories.toFixed(1),
            protein: totalProtein.toFixed(2),
            carbs: totalCarbs.toFixed(2),
            fats: totalFats.toFixed(2)
        };
    };

    const totals = calculateTotals();

    const generatePDF = async () => {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nutrition Chart - ${data.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            background: white;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
          }
          .header-left h1 { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 8px;
          }
          .header-left p { 
            font-size: 12px; 
            color: #666;
            margin: 2px 0;
          }
          .header-right { 
            text-align: right;
          }
          .goals { 
            display: flex; 
            gap: 20px;
            font-size: 11px;
          }
          .goal-item { 
            text-align: center;
          }
          .goal-value { 
            font-weight: bold; 
            font-size: 13px;
            display: block;
          }
          .goal-label { 
            color: #666;
            font-size: 10px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 11px;
          }
          th { 
            background: #f5f5f5; 
            padding: 8px; 
            text-align: left;
            font-weight: 600;
            border: 1px solid #ddd;
          }
          td { 
            padding: 8px; 
            border: 1px solid #ddd;
          }
          .meal-header { 
            background: #e8e8e8; 
            font-weight: bold;
            text-transform: capitalize;
          }
          .total-row { 
            background: #f9f9f9; 
            font-weight: bold;
          }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>${data.name}</h1>
            <p><strong>Weight:</strong> ${data.weight}</p>
            <p><strong>Height:</strong> ${data.height}</p>
            <p><strong>Age:</strong> ${data.age} years</p>
          </div>
          <div class="header-right">
            <div class="goals">
              <div class="goal-item">
                <span class="goal-value">${data.dailyGoals.calories.toFixed(1)}kcl</span>
                <span class="goal-label">Cal</span>
              </div>
              <div class="goal-item">
                <span class="goal-value">${data.dailyGoals.protein.toFixed(2)}g</span>
                <span class="goal-label">Protein</span>
              </div>
              <div class="goal-item">
                <span class="goal-value">${data.dailyGoals.carbs.toFixed(2)}g</span>
                <span class="goal-label">Carbs</span>
              </div>
              <div class="goal-item">
                <span class="goal-value">${data.dailyGoals.fats.toFixed(2)}g</span>
                <span class="goal-label">Fats</span>
              </div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Calories</th>
              <th class="text-right">Protein</th>
              <th class="text-right">Carbs</th>
              <th class="text-right">Fats</th>
            </tr>
          </thead>
          <tbody>
            ${data.meals.map(meal => `
              <tr class="meal-header">
                <td colspan="6">${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</td>
              </tr>
              ${meal.list.map(food => `
                <tr>
                  <td>${food.name}</td>
                  <td class="text-right">${food.quantity}</td>
                  <td class="text-right">${food.calories.toFixed(1)} kcl</td>
                  <td class="text-right">${food.nutrition.protein.toFixed(1)} g</td>
                  <td class="text-right">${food.nutrition.carb.toFixed(1)} g</td>
                  <td class="text-right">${food.nutrition.fat.toFixed(1)} g</td>
                </tr>
              `).join('')}
            `).join('')}
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td class="text-right"></td>
              <td class="text-right"><strong>${totals.calories} kcl</strong></td>
              <td class="text-right"><strong>${totals.protein} g</strong></td>
              <td class="text-right"><strong>${totals.carbs} g</strong></td>
              <td class="text-right"><strong>${totals.fats} g</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Weight:</span> {data.weight}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Height:</span> {data.height}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Age:</span> {data.age} years</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-lg font-bold">{data.dailyGoals.calories.toFixed(1)}kcl</div>
                        <div className="text-xs text-gray-600">Cal</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold">{data.dailyGoals.protein.toFixed(2)}g</div>
                        <div className="text-xs text-gray-600">Protein</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold">{data.dailyGoals.carbs.toFixed(2)}g</div>
                        <div className="text-xs text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold">{data.dailyGoals.fats.toFixed(2)}g</div>
                        <div className="text-xs text-gray-600">Fats</div>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={generatePDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download size={18} />
                    Generate PDF
                </button>
            </div>

            {/* Nutrition Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Food</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Quantity</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Calories</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Protein</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Carbs</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Fats</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.meals.map((meal, mealIndex) => (
                            <React.Fragment key={mealIndex}>
                                <tr className="bg-gray-200">
                                    <td colSpan={6} className="border border-gray-300 px-4 py-2 font-bold capitalize">
                                        {meal.mealType}
                                    </td>
                                </tr>
                                {meal.list.map((food, foodIndex) => (
                                    <tr key={`${mealIndex}-${foodIndex}`} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{food.name}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{food.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{food.calories.toFixed(1)} kcl</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{food.nutrition.protein.toFixed(1)} g</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{food.nutrition.carb.toFixed(1)} g</td>
                                        <td className="border border-gray-300 px-4 py-2 text-right">{food.nutrition.fat.toFixed(1)} g</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                        <tr className="bg-gray-100 font-bold">
                            <td className="border border-gray-300 px-4 py-2">Total</td>
                            <td className="border border-gray-300 px-4 py-2"></td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{totals.calories} kcl</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{totals.protein} g</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{totals.carbs} g</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{totals.fats} g</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutritionChart;