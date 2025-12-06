'use client';

import { useState } from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    Font,
} from '@react-pdf/renderer';

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

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 20,
    },
    infoColumn: {
        flex: 1,
    },
    infoRow: {
        marginBottom: 4,
        fontSize: 10,
    },
    label: {
        fontWeight: 'bold',
    },
    summaryContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        backgroundColor: '#f5f5f5',
    },
    summaryBox: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryBoxLast: {
        borderRightWidth: 0,
    },
    summaryLabel: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    mealTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 12,
        textTransform: 'capitalize',
    },
    table: {
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#d3d3d3',
        borderWidth: 1,
        borderColor: '#999',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ddd',
    },
    tableHeaderCell: {
        flex: 1,
        padding: 6,
        fontWeight: 'bold',
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#999',
    },
    tableHeaderCellLast: {
        borderRightWidth: 0,
    },
    tableCell: {
        flex: 1,
        padding: 5,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    tableCellLast: {
        borderRightWidth: 0,
    },
    tableCellCenter: {
        textAlign: 'center',
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#999',
        borderWidth: 1,
        borderColor: '#999',
        fontWeight: 'bold',
        color: 'white',
    },
    totalCell: {
        flex: 1,
        padding: 6,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#666',
    },
    totalCellLast: {
        borderRightWidth: 0,
    },
});

const NutritionPDF = ({ data }: { data: NutritionData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{data.name}</Text>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <Text>
                                <Text style={styles.label}>Weight</Text>
                                {'\n'}
                                {data.weight} {data.weightUnit}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text>
                                <Text style={styles.label}>Age</Text>
                                {'\n'}
                                {data.age} years
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <Text>
                                <Text style={styles.label}>Height</Text>
                                {'\n'}
                                {data.height} {data.heightUnit}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryBox]}>
                        <Text style={styles.summaryLabel}>Cal</Text>
                        <Text style={styles.summaryValue}>
                            {data.totals.calories.toFixed(1)}
                        </Text>
                    </View>
                    <View style={[styles.summaryBox]}>
                        <Text style={styles.summaryLabel}>Protein</Text>
                        <Text style={styles.summaryValue}>
                            {data.totals.protein.toFixed(2)}g
                        </Text>
                    </View>
                    <View style={[styles.summaryBox]}>
                        <Text style={styles.summaryLabel}>Carbs</Text>
                        <Text style={styles.summaryValue}>
                            {data.totals.carbs.toFixed(2)}g
                        </Text>
                    </View>
                    <View style={[styles.summaryBox, styles.summaryBoxLast]}>
                        <Text style={styles.summaryLabel}>Fats</Text>
                        <Text style={styles.summaryValue}>
                            {data.totals.fats.toFixed(2)}g
                        </Text>
                    </View>
                </View>
            </View>

            {/* Meals */}
            {data.meals.map((meal, mealIdx) => (
                <View key={mealIdx}>
                    <Text style={styles.mealTitle}>{meal.name}</Text>

                    {/* Meal Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>Food</Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCellCenter]}>
                                Quantity
                            </Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCellCenter]}>
                                Calories
                            </Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCellCenter]}>
                                Protein
                            </Text>
                            <Text style={[styles.tableHeaderCell, styles.tableCellCenter]}>
                                Carbs
                            </Text>
                            <Text
                                style={[
                                    styles.tableHeaderCell,
                                    styles.tableHeaderCellLast,
                                    styles.tableCellCenter,
                                ]}
                            >
                                Fats
                            </Text>
                        </View>

                        {/* Table Rows */}
                        {meal.items.map((item, itemIdx) => (
                            <View key={itemIdx} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.name}</Text>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.quantity}
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.calories.toFixed(1)}
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.protein.toFixed(2)}
                                </Text>
                                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                                    {item.carbs.toFixed(2)}
                                </Text>
                                <Text
                                    style={[styles.tableCell, styles.tableCellLast, styles.tableCellCenter]}
                                >
                                    {item.fats.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Total Row */}
            <View style={styles.totalRow}>
                <Text style={styles.totalCell}>Total</Text>
                <Text style={[styles.totalCell, styles.tableCellCenter]}></Text>
                <Text style={[styles.totalCell, styles.tableCellCenter]}>
                    {data.totals.calories.toFixed(1)}
                </Text>
                <Text style={[styles.totalCell, styles.tableCellCenter]}>
                    {data.totals.protein.toFixed(2)}
                </Text>
                <Text style={[styles.totalCell, styles.tableCellCenter]}>
                    {data.totals.carbs.toFixed(2)}
                </Text>
                <Text style={[styles.totalCell, styles.totalCellLast, styles.tableCellCenter]}>
                    {data.totals.fats.toFixed(2)}
                </Text>
            </View>
        </Page>
    </Document>
);

const NutritionChartComponent = ({ data }: { data: NutritionData }) => {
    const [isClient, setIsClient] = useState(true);

    if (!isClient) return null;

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <PDFDownloadLink
                    document={<NutritionPDF data={data} />}
                    fileName={`${data.name}-nutrition-chart.pdf`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
                >
                    {({ blob, url, loading, error }) =>
                        loading ? 'Generating PDF...' : 'Download PDF'
                    }
                </PDFDownloadLink>
            </div>

            {/* Preview */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h1 className="text-xl font-bold mb-4">{data.name}</h1>

                <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                    <div>
                        <p className="font-bold mb-2">Weight</p>
                        <p>{data.weight} {data.weightUnit}</p>
                        <p className="font-bold mt-3 mb-2">Age</p>
                        <p>{data.age} years</p>
                    </div>
                    <div>
                        <p className="font-bold mb-2">Height</p>
                        <p>{data.height} {data.heightUnit}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 bg-gray-200 p-4 rounded mb-6 text-center text-sm">
                    <div>
                        <p className="text-gray-700 text-xs mb-1">Cal</p>
                        <p className="font-bold">{data.totals.calories.toFixed(1)}</p>
                    </div>
                    <div>
                        <p className="text-gray-700 text-xs mb-1">Protein</p>
                        <p className="font-bold">{data.totals.protein.toFixed(2)}g</p>
                    </div>
                    <div>
                        <p className="text-gray-700 text-xs mb-1">Carbs</p>
                        <p className="font-bold">{data.totals.carbs.toFixed(2)}g</p>
                    </div>
                    <div>
                        <p className="text-gray-700 text-xs mb-1">Fats</p>
                        <p className="font-bold">{data.totals.fats.toFixed(2)}g</p>
                    </div>
                </div>

                {data.meals.map((meal, mealIdx) => (
                    <div key={mealIdx} className="mb-6">
                        <h2 className="text-sm font-bold mb-3 capitalize">{meal.name}</h2>
                        <table className="w-full text-xs border-collapse border border-gray-400">
                            <thead>
                                <tr className="bg-gray-300">
                                    <th className="border border-gray-400 p-2 text-left">Food</th>
                                    <th className="border border-gray-400 p-2 text-center">Quantity</th>
                                    <th className="border border-gray-400 p-2 text-center">Calories</th>
                                    <th className="border border-gray-400 p-2 text-center">Protein</th>
                                    <th className="border border-gray-400 p-2 text-center">Carbs</th>
                                    <th className="border border-gray-400 p-2 text-center">Fats</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meal.items.map((item, itemIdx) => (
                                    <tr key={itemIdx} className="hover:bg-gray-100">
                                        <td className="border border-gray-400 p-2">{item.name}</td>
                                        <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                                        <td className="border border-gray-400 p-2 text-center">
                                            {item.calories.toFixed(1)}
                                        </td>
                                        <td className="border border-gray-400 p-2 text-center">
                                            {item.protein.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-400 p-2 text-center">
                                            {item.carbs.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-400 p-2 text-center">
                                            {item.fats.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

                <table className="w-full text-xs border-collapse border border-gray-600">
                    <tbody>
                        <tr className="bg-gray-600 text-white font-bold">
                            <td className="border border-gray-600 p-2">Total</td>
                            <td className="border border-gray-600 p-2"></td>
                            <td className="border border-gray-600 p-2 text-center">
                                {data.totals.calories.toFixed(1)}
                            </td>
                            <td className="border border-gray-600 p-2 text-center">
                                {data.totals.protein.toFixed(2)}
                            </td>
                            <td className="border border-gray-600 p-2 text-center">
                                {data.totals.carbs.toFixed(2)}
                            </td>
                            <td className="border border-gray-600 p-2 text-center">
                                {data.totals.fats.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutritionChartComponent;