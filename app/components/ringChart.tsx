"use client";

import React from "react";
import { useSelector } from "react-redux";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ActivityState } from "../store/features/activitySlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";

interface MacroState {
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

export default function RingChart() {
    const { protein, carbs, fats } = useAppSelector(
        (state: RootState) => state.activity.current.macros
    );
    const goals = useAppSelector(
        (state: RootState) => state.auth.user?.dailyGoals
    );
    const { targetCalories, targetProtein, targetCarb, targetFat } = goals ? goals : { targetCalories: 0, targetProtein: 0, targetCarb: 0, targetFat: 0 } 
    const { burnt, total } = useSelector(
        (state: RootState) => state.activity.current
    );

    const data2 = [
        { name: "Protein", value: targetProtein ? targetProtein :0, fill: "#22c55e" },
        { name: "Carbs", value: targetCarb ? targetCarb :0, fill: "#3b82f6" },
        { name: "Fat", value: targetFat ? targetFat:0, fill: "#ef4444" },
    ];
    const data3 = [
        { name: "Total", value: total, fill: "#cacacaff" },
        { name: "Remaining", value: total - burnt, fill: "#383838ff" },
    ];

    const data = [
        { name: "Protein", value: protein, fill: "#22c55e" },
        { name: "Carbs", value: carbs, fill: "#3b82f6" },
        { name: "Fat", value: fats, fill: "#ef4444" },
    ];


    if (targetCalories===0){
        data2.push({ name: "No Data", value: 1, fill: "#a5a5a5" })
        data2[0] = { name: "Protein", value: 0, fill: "#22c55e" }
        data2[1] = { name: "Carbs", value: 0, fill: "#3b82f6" }
        data2[2] = { name: "Fat", value: 0, fill: "#ef4444" }   
    }
    if (protein === 0 && carbs===0 && fats===0) {
        data.push({ name: "No Data", value: 1, fill: "#a5a5a5" })
        data[0] = { name: "Protein", value: 0, fill: "#22c55e" }
        data[1] = { name: "Carbs", value: 0, fill: "#3b82f6" }
        data[2] = { name: "Fat", value: 0, fill: "#ef4444" }
    }




    return (
        <div className="w-full flex flex-col items-center p-2 pt-4 justify-center">
            <div className="w-full md:w-2xl h-48 flex flex-row items-center justify-between">
                <div className="w-full md:w-2xl h-48 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-right justify-start gap-1 w-full h-30">
                        {data.map((it, n) => {
                            if(it.name==="No Data")
                            return
                            return (
                                <div
                                    key={n + "a"}
                                    className="flex flex-row items-center justify-left gap-1"
                                >
                                    <div
                                        className={`h-3 w-3 rounded-sm`}
                                        style={{ backgroundColor: it.fill }}
                                    ></div>
                                    <h3
                                        className="text-sm text-gray-400 font-semibold"
                                        style={{ color: it.fill }}
                                    >
                                        {it.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
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
                                    backgroundColor: "#ffffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "rgba(100, 100, 100, 1)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full md:w-2xl h-48 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-right justify-start gap-1 w-full h-30 ml-2">
                        {data2.map((it, n) => {
                            if (it.name === "No Data")
                                return
                            return (
                                <div
                                    key={n + "a"}
                                    className="flex flex-row items-center justify-left gap-1"
                                >
                                    <div
                                        className={`h-3 w-3 rounded-sm`}
                                        style={{ backgroundColor: it.fill }}
                                    ></div>
                                    <h3
                                        className="text-sm text-gray-400 font-semibold"
                                        style={{ color: it.fill }}
                                    >
                                        {it.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
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
                                    backgroundColor: "#ffffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "rgba(100, 100, 100, 1)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full md:w-2xl h-48 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-right justify-start gap-1 w-full h-30 ml-2">
                        {data3.map((it, n) => {
                            return (
                                <div
                                    key={n + "a"}
                                    className="flex flex-row items-center justify-left gap-1"
                                >
                                    <div
                                        className={`h-3 w-3 rounded-sm`}
                                        style={{ backgroundColor: it.fill }}
                                    ></div>
                                    <h3
                                        className="text-sm text-gray-400 font-semibold"
                                        style={{ color: it.fill }}
                                    >
                                        {it.name}
                                    </h3>
                                </div>
                            );
                        })}
                    </div>
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
                                    backgroundColor: "#ffffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "rgba(100, 100, 100, 1)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="w-[100%] flex flex-col items-start justify-center mt-4 mx-6">
                <p className="text-md font-semibold">Remaining</p>
            </div>
            <div className="w-full h-2 bg-gray-300 rounded-lg overflow-hidden mx-6 mb-8">
                <div
                    className="h-full bg-orange-400 transition-all duration-500 ease-in-out"
                    style={{
                        width: `${Math.min(
                            100,
                            Math.max(0, ((total - burnt) / total) * 100)
                        )}%`,
                    }}
                />
            </div>
        </div>
    );
}
