import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import {del} from '../data'
import { Food } from "./foodSlice";



export interface Macros{
    protein:number,
    carb: number,
    fat: number,
}

export interface Chart{
    id:string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    list:Food[],
    lastModified: string,
    macros:Macros,
    total: number,

}


export interface ActivityState {
    charts:Chart[],
    water: number,
    burnt: number,
    macros:Macros,
    total:number,
    selectedDate: string,

}

export const initialState: ActivityState = {
    charts:[],
    macros:{protein:10,
        carb:20,
        fat:30,
    },
    water: 0,
    burnt: 60,
    total:200,
    selectedDate: new Date().toDateString()
}

export const activitySlice = createSlice({
    name: "activity",
    initialState,
    reducers: {
        addMeal: (state, action: PayloadAction<Chart>) => {
            const chartData = action.payload;
            
            // Calculate total calories from the food list
            const totalCalories = chartData.list.reduce((sum, food) => sum + (food.nutrition.protein + food.nutrition.carb + food.nutrition.fat || 0), 0);
            
            // Get current timestamp for lastModified
            const lastModified = new Date().toISOString();
            
            // Update the chart with total calories and lastModified
            const updatedChart: Chart = {
                ...chartData,
                total: totalCalories,
                lastModified: lastModified,
            };
            
            // Add the updated chart to the charts array
            state.charts.push(updatedChart);
            
            // Update the total calories in state
            state.total += totalCalories;
        },


        updateMeal:()=>{

        },


        addFood:()=>{

        },

        setSelectedDate:(state,action:PayloadAction<string>)=>{
            state.selectedDate=action.payload
        }

    },
});

export const {
    addMeal,
    setSelectedDate,
    
} = activitySlice.actions;
export default activitySlice.reducer;