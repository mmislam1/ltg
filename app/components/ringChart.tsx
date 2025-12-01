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
    const { burnt,total } = useSelector(
        (state: RootState) => state.activity
    );

    const data2 = [
        { name: 'Total', value: total, fill: '#00cca0ff' },
        { name: 'Burnt', value: burnt, fill: '#7f00d3ff' },
        
    ];
    const data3 = [
        { name: 'Total', value: total, fill: '#cacacaff' },
        { name: 'Remaining', value: total-burnt, fill: '#202020ff' },

    ];

    const data = [
        { name: 'Protein', value: protein, fill: '#22c55e' },
        { name: 'Carbs', value: carb, fill: '#3b82f6' },
        { name: 'Fat', value: fat, fill: '#ef4444' },
    ];

    

    return (
        <div className="w-full md:w-lg h-50 flex flex-row items-center justify-around">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={50}
                        paddingAngle={1}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    
                    <Tooltip
                        formatter={(value: number) => `${value}g`}
                        contentStyle={{
                            backgroundColor: '#ffffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(100, 100, 100, 1)',
                        }}
                    />
                    
                </PieChart>
                
                
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data2}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={50}
                        paddingAngle={1}
                        dataKey="value"
                    >
                        {data2.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value: number) => `${value}g`}
                        contentStyle={{
                            backgroundColor: '#ffffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(100, 100, 100, 1)',
                        }}
                    />

                </PieChart>


            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data3}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={50}
                        paddingAngle={1}
                        dataKey="value"
                    >
                        {data3.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value: number) => `${value}g`}
                        contentStyle={{
                            backgroundColor: '#ffffffff',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'rgba(100, 100, 100, 1)',
                        }}
                    />

                </PieChart>


            </ResponsiveContainer>
            
        </div>
    );
}