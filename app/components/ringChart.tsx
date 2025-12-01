'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityState } from '../store/features/activitySlice';
import { RootState } from '../store/store';

interface MacroState {
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}



export default function RingChart() {
    const { protein, carb, fat } = useSelector(
        (state: RootState) => state.activity.macros
    );

    const data = [
        { name: 'Protein', value: protein, fill: '#22c55e' },
        { name: 'Carbs', value: carb, fill: '#3b82f6' },
        { name: 'Fat', value: fat, fill: '#ef4444' },
    ];

    const total = protein + carb + fat;

    return (
        <div className="w-full h-96 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `${value}g`}
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Total: {total}g</p>
            </div>
        </div>
    );
}