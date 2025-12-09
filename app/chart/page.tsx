'use client'
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import dynamic from "next/dynamic";
import { Macros, Meal, Chart } from '../store/features/activitySlice';
import { Food } from '../store/features/foodSlice'


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
                    foodItem: {
                        id: '1',
                        name: 'Apple Regular',
                        addedBy: 'string',
                        selectedBy: 99,
                        unit: 'piece',
                        nutrition: { protein: 0.0, carb: 25.0, fat: 0.0 },
                    },
                    quantity: 1
                },
                {
                    foodItem: {
                        id: '2',
                        name: "yogurt (desi natural) low fat",
                        addedBy: 'string',
                        selectedBy: 99,
                        unit: 'gm',
                        nutrition: { protein: 4.12, carb: 10.59, fat: 0.88 },
                    },
                    quantity: 100
                },
                {
                    foodItem: {
                        id: '3',
                        name: "Dymatize iso 100 hydrolyzed whey protein isolate gourmet vanilla, nutres",
                        addedBy: 'string',
                        selectedBy: 99,
                        unit: 'gm',
                        nutrition: { protein: 12.5, carb: 0.5, fat: 0.0 },
                    },
                    quantity: 15
                },


            ]
        },
{
    mealType: "lunch",
        list: [
            {
                foodItem: {
                    id: '4',
                    name: "Chicken Breast",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 25.9, carb: 0.0, fat: 3.0 },
                },
                quantity: 100
            },
            {
                foodItem: {
                    id: '5',
                    name: "Brown Rice",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 3.0, carb: 28.0, fat: 0.0 },
                },
                quantity: 100
            },
            {
                foodItem: {
                    id: '6',
                    name: "Mixed Vegetables",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'cup',
                    nutrition: { protein: 2.0, carb: 11.0, fat: 0.0 },
                },
                quantity: 1
            },

        ]
},
{
    mealType: "snack",
        list: [
            {
                foodItem: {
                    id: '7',
                    name: "Cashew/Walnut / peanut / almonds / pista",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 1.6, carb: 1.1, fat: 6.4 },
                },
                quantity: 10
            },
            {
                foodItem: {
                    id: '8',
                    name: "Kiwi Fruit /Chinese Gooseberry Frsh Raw",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 0.0, carb: 14.0, fat: 0.0 },
                },
                quantity: 100
            },
            {
                foodItem: {
                    id: '9',
                    name: "Apple Regular",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'piece',
                    nutrition: { protein: 0.0, carb: 25.0, fat: 0.0 },
                },
                quantity: 1
            },
        
        ]
},
{
    mealType: "dinner",
        list: [
            {
                foodItem: {
                    id: '10',
                    name: "yogurt",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 10.57, carb: 12.33, fat: 6.17 },
                },
                quantity: 200
            },
            {
                foodItem: {
                    id: '11',
                    name: "Dymatize iso 100 hydrolyzed whey protein isolate gourmet vanilla, nutres",
                    addedBy: 'string',
                    selectedBy: 99,
                    unit: 'gm',
                    nutrition: { protein: 25.0, carb: 1.0, fat: 0.0 },
                },
                quantity: 30
            },
            
        ]
}
    ]
};

// PDF Styles
const pdfStyles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    headerLeft: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    info: {
        fontSize: 10,
        color: '#444',
        marginBottom: 2,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 15,
    },
    goalItem: {
        alignItems: 'center',
    },
    goalValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    goalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    table: {
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0ff',
        borderWidth: 2,
        borderColor: '#888',
        borderRadius: 5,
        marginBottom: 5
    },
    tableRow: {
        flexDirection: 'row',
        paddingLeft: 5,
        borderTopWidth: 1,
        borderColor: '#bbb',
    },
    mealHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#dfdfdfff',
        borderColor: '#888',

    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#dfdfdfff',
        borderTopWidth: 0,
        borderColor: '#dbdbdbff',
        fontWeight: 'bold',

    },
    cell: {
        padding: 6,
        fontSize: 9,
    },
    protein: {
        color: '#ff0037ff',
    },
    total: {
        color: '#ff008cff',
    },
    carbs: {
        color: '#ff7b00ff',
    },
    fats: {
        color: '#bd9100ff',
    },
    cellBold: {
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
    },
    col1: { width: '40%' },
    col2: { width: '12%', textAlign: 'center' },
    col3: { width: '12%', textAlign: 'center' },
    col4: { width: '12%', textAlign: 'center' },
    col5: { width: '12%', textAlign: 'center' },
    col6: { width: '12%', textAlign: 'center' },
    mealHeaderCell: {
        width: '100%',
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
});

// PDF Document Component
const NutritionPDF: React.FC<{ data: typeof sampleData; totals: any }> = ({ data, totals }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            {/* Header */}
            <View style={pdfStyles.header}>
                <View style={pdfStyles.headerLeft}>
                    <Text style={pdfStyles.name}>{data.name}</Text>
                    <Text style={pdfStyles.info}>Weight: {data.weight}</Text>
                    <Text style={pdfStyles.info}>Height: {data.height}</Text>
                    <Text style={pdfStyles.info}>Age: {data.age} years</Text>
                </View>
                <View style={pdfStyles.headerRight}>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.calories.toFixed(1)}kcl</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.total]}>Cal</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.protein.toFixed(2)}g</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.protein]}>Protein</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.carbs.toFixed(2)}g</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.carbs]}>Carbs</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.fats.toFixed(2)}g</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.fats]}>Fats</Text>
                    </View>
                </View>
            </View>

            {/* Table */}
            <View style={pdfStyles.table}>
                {/* Table Header */}
                <View style={pdfStyles.tableHeader}>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col1]}>Food</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col2]}>Quantity</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col3]}>Calories</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col4]}>Protein</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col5]}>Carbs</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col6]}>Fats</Text>
                </View>

                {/* Table Body */}
                {data.meals.map((meal, mealIndex) => (
                    <View key={mealIndex}>
                        {/* Meal Header */}
                        <View style={pdfStyles.mealHeaderRow}>
                            <Text style={pdfStyles.mealHeaderCell}>
                                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                            </Text>
                        </View>

                        {/* Food Items */}
                        {meal.list.map((food, foodIndex) => (
                            <View key={foodIndex} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.cell, pdfStyles.col1]}>{food.foodItem.name}</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col2]}>{food.quantity+' '+food.foodItem.unit}</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col3]}>{(food.foodItem.nutrition.protein + food.foodItem.nutrition.carb + food.foodItem.nutrition.fat).toFixed(1)} kcl</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col4]}>{food.foodItem.nutrition.protein.toFixed(1)} g</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col5]}>{food.foodItem.nutrition.carb.toFixed(1)} g</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col6]}>{food.foodItem.nutrition.fat.toFixed(1)} g</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Total Row */}
                <View style={pdfStyles.totalRow}>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col1]}>Total</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col2]}></Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col3]}>{totals.calories} kcl</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col4]}>{totals.protein} g</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col5]}>{totals.carbs} g</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col6]}>{totals.fats} g</Text>
                </View>
            </View>
        </Page>
    </Document>
);

const NutritionChart: React.FC = () => {
    const [data] = useState(sampleData);
    const PDFDownloadLink = dynamic(
        () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
        { ssr: false }
    );

    // Calculate totals
    const calculateTotals = () => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        data.meals.forEach(meal => {
            meal.list.forEach(food => {
                totalCalories += food.foodItem.nutrition.protein + food.foodItem.nutrition.carb + food.foodItem.nutrition.fat;
                totalProtein += food.foodItem.nutrition.protein;
                totalCarbs += food.foodItem.nutrition.carb;
                totalFats += food.foodItem.nutrition.fat;
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

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            {/* Header Section */}
            <div className="overflow-x-auto">
                <div className=" flex justify-between items-start mb-6 pb-3 border-b-2 border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
                        <p className="text-md text-gray-600"><span className="font-semibold">Weight:</span> {data.weight}</p>
                        <p className="text-md text-gray-600"><span className="font-semibold">Height:</span> {data.height}</p>
                        <p className="text-md text-gray-600"><span className="font-semibold">Age:</span> {data.age} years</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center ">
                            <div className="text-lg font-bold">{data.dailyGoals.calories.toFixed(1)}kcl</div>
                            <div className="text-lg font-bold">Cal</div>
                        </div>
                        <div className="text-center ">
                            <div className="text-lg font-bold">{data.dailyGoals.protein.toFixed(2)}g</div>
                            <div className="text-lg font-bold">Protein</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{data.dailyGoals.carbs.toFixed(2)}g</div>
                            <div className="text-lg font-bold">Carbs</div>
                        </div>
                        <div className="text-center ">
                            <div className="text-lg font-bold">{data.dailyGoals.fats.toFixed(2)}g</div>
                            <div className="text-lg font-bold">Fats</div>
                        </div>
                    </div>
                </div>



                {/* Nutrition Table */}

                <table className="w-full border-collapse text-md">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Food</th>
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Quantity</th>
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Calories</th>
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Protein</th>
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Carbs</th>
                            <th className="border-b border-t border-gray-300 px-3 py-2 text-center ">Fats</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.meals.map((meal, mealIndex) => (
                            <React.Fragment key={mealIndex}>
                                <tr className="bg-gray-200">
                                    <td colSpan={6} className="border-b border-gray-300 px-3 py-2 font-bold capitalize text-lg">
                                        {meal.mealType}
                                    </td>
                                </tr>
                                {meal.list.map((food, foodIndex) => (
                                    <tr key={`${mealIndex}-${foodIndex}`} className="hover:bg-gray-50">
                                        <td className="border-b border-gray-300 px-3 py-2 font-semibold">{food.foodItem.name}</td>
                                        <td className="border-b border-gray-300 px-3 py-2 text-center font-semibold">{food.quantity+' '+food.foodItem.unit}</td>
                                        <td className="border-b border-gray-300 px-3 py-2 text-center font-semibold">{(food.foodItem.nutrition.protein + food.foodItem.nutrition.carb + food.foodItem.nutrition.fat).toFixed(1)} kcl</td>
                                        <td className="border-b border-gray-300 px-3 py-2 text-center font-semibold">{food.foodItem.nutrition.protein.toFixed(1)} g</td>
                                        <td className="border-b border-gray-300 px-3 py-2 text-center font-semibold">{food.foodItem.nutrition.carb.toFixed(1)} g</td>
                                        <td className="border-b border-gray-300 px-3 py-2 text-center font-semibold">{food.foodItem.nutrition.fat.toFixed(1)} g</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                        <tr className="bg-gray-200 font-bold">
                            <td className="  px-3 py-2">Total</td>
                            <td className=" border-gray-300 px-3 py-2 font-semibold"></td>
                            <td className=" border-gray-300 px-3 py-2 text-center font-semibold">{totals.calories} kcl</td>
                            <td className=" border-gray-300 px-3 py-2 text-center font-semibold">{totals.protein} g</td>
                            <td className=" border-gray-300 px-3 py-2 text-center font-semibold">{totals.carbs} g</td>
                            <td className=" border-gray-300 px-3 py-2 text-center font-semibold">{totals.fats} g</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* Download Button */}
            <div className="flex justify-end mb-3">
                <PDFDownloadLink
                    document={<NutritionPDF data={data} totals={totals} />}
                    fileName={`nutrition-chart-${data.name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
                    className="flex items-center mt-8 gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {({ loading }) => (
                        <>
                            <Download size={18} />
                            {loading ? 'Generating PDF...' : 'Download PDF'}
                        </>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
};

export default NutritionChart;