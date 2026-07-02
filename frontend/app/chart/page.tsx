'use client'
import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import dynamic from "next/dynamic";
import { Meal } from '../store/features/activitySlice';
import { useAppSelector } from '../store/hooks';
import { NUTRITION_COLORS } from '../nutritionColors';
import { NUTRIENT_UNITS, scaleNutrient } from '../store/nutritionUnits';


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
    meals: []
};

// PDF Styles
const pdfStyles = StyleSheet.create({
    page: {
        padding: 50,
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
        fontWeight: 'normal',
    },
    goalLabel: {
        fontSize: 10,
        fontWeight: 'normal',
        color: '#666',
    },
    table: {
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0ff',
        borderBottomWidth: 1,
        bordertopWidth: 1,
        borderBottomColor: '#bbb',
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
        fontWeight: 'normal',

    },
    cell: {
        padding: 6,
        fontSize: 9,
    },
    protein: {
        color: NUTRITION_COLORS.protein,
    },
    total: {
        color: NUTRITION_COLORS.calories,
    },
    carbss: {
        color: NUTRITION_COLORS.carbs,
    },
    fatss: {
        color: NUTRITION_COLORS.fat,
    },
    cellBold: {
        padding: 6,
        fontSize: 11,
        fontWeight: 'normal',
    },
    col1: { width: '35%' },
    col2: { width: '13%', textAlign: 'center' },
    col3: { width: '13%', textAlign: 'center' },
    col4: { width: '13%', textAlign: 'center' },
    col5: { width: '13%', textAlign: 'center' },
    col6: { width: '13%', textAlign: 'center' },
    mealHeaderCell: {
        width: '100%',
        padding: 6,
        fontSize: 11,
        fontWeight: 'normal',
        textTransform: 'capitalize',
    },
});

// PDF Document Component
interface NutritionTotals {
    calories: string;
    protein: string;
    carbss: string;
    fatss: string;
}

const NutritionPDF: React.FC<{ data: typeof sampleData; totals: NutritionTotals }> = ({ data, totals }) => (
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
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.calories.toFixed(2)} {NUTRIENT_UNITS.calories}</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.total]}>Cal</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.protein.toFixed(2)} {NUTRIENT_UNITS.protein}</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.protein]}>Protein</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.carbs.toFixed(2)} {NUTRIENT_UNITS.carbs}</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.carbss]}>Carbs</Text>
                    </View>
                    <View style={pdfStyles.goalItem}>
                        <Text style={[pdfStyles.goalValue]}>{data.dailyGoals.fats.toFixed(2)} {NUTRIENT_UNITS.fats}</Text>
                        <Text style={[pdfStyles.goalLabel, pdfStyles.fatss]}>Fats</Text>
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
                    <Text style={[pdfStyles.cellBold, pdfStyles.col4, pdfStyles.protein]}>Protein</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col5, pdfStyles.carbss]}>Carbs</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col6, pdfStyles.fatss]}>Fats</Text>
                </View>

                {/* Table Body */}
                {data.meals.map((meal, mealIndex) => (
                    <View key={mealIndex}>
                        {/* Meal Header */}
                        <View style={pdfStyles.mealHeaderRow}>
                            <Text style={pdfStyles.mealHeaderCell}>
                                {meal.mealType
                                    ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
                                    : ''}
                            </Text>
                        </View>

                        {/* Food Items */}
                        {meal.list?.map((food, foodIndex) => (
                            <View key={foodIndex} style={pdfStyles.tableRow}>
                                <Text style={[pdfStyles.cell, pdfStyles.col1]}>{food.foodItem ?food.foodItem.name:''}</Text>
                                <Text style={[pdfStyles.cell, pdfStyles.col2]}>{food.quantity+' '+food.foodItem?.unit}</Text>
                                 <Text style={[pdfStyles.cell, pdfStyles.col3]}>{food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.calories, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.calories}</Text>
                                 <Text style={[pdfStyles.cell, pdfStyles.col4]}>{food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.protein, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.protein}</Text>
                                 <Text style={[pdfStyles.cell, pdfStyles.col5]}>{food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.carbs, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.carbs}</Text>
                                 <Text style={[pdfStyles.cell, pdfStyles.col6]}>{food.foodItem ? scaleNutrient(food.foodItem, food.foodItem.nutrition.fats, food.quantity).toFixed(1) : 0} {NUTRIENT_UNITS.fats}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Total Row */}
                <View style={pdfStyles.totalRow}>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col1]}>Total</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col2]}></Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col3]}>{totals.calories} {NUTRIENT_UNITS.calories}</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col4]}>{totals.protein} {NUTRIENT_UNITS.protein}</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col5]}>{totals.carbss} {NUTRIENT_UNITS.carbs}</Text>
                    <Text style={[pdfStyles.cellBold, pdfStyles.col6]}>{totals.fatss} {NUTRIENT_UNITS.fats}</Text>
                </View>
            </View>
        </Page>
    </Document>
);

const NutritionChart: React.FC = () => {
    const [data,setData] = useState(sampleData);
    const meals = useAppSelector((store) => store.activity.current.chart.meals)

    //console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',store.activity.current)

    useEffect(()=>{

        setData((current) => ({ ...current, meals }))
    },[meals])
    const PDFDownloadLink = dynamic(
        () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
        { ssr: false }
    );

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
            {/* Scroll container (mobile behaves like PDF viewer) */}
            <div className="overflow-x-auto">
                {/* Fixed-width A4 layout */}
                <div className="min-w-[800px] max-w-[800px] mx-auto p-6 bg-white">

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6 pb-3 border-b-2 border-gray-800">
                        <div>
                            <h1 className="text-[18px] font-bold mb-2">{data.name}</h1>
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
            </div>{/* Download Button */}
                    <div className="fc justify-end mt-6">
                        <PDFDownloadLink
                            document={<NutritionPDF data={data} totals={totals} />}
                            fileName={`nutrition-chart-${data.name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
                            className="btn btn-primary"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={16} />
                                    {loading ? 'Generating PDF...' : 'Download PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                    </div>

        </div>
    );

};

export default NutritionChart;
