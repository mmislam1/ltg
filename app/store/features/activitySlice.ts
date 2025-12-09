import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import { del } from "../data";
import { Food } from "./foodSlice";

export interface ListItems{
  foodItem:Food,
  quantity:number,
}

export interface Macros {
  protein: number;
  carb: number;
  fat: number;
}
export interface Meal{
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  list: ListItems[];
  
  
}
export interface Chart {
  id: string;
  meals:Meal;
  lastModified: string;
  macros: Macros;
  total: number;
}

export interface ActivityState {
  charts: Chart[];
  water: number;
  burnt: number;
  macros: Macros;
  total: number;
  selectedDate: string;
  completed: boolean;
}

export interface ActivitiesState {
  activities: ActivityState[];
  current: ActivityState;
}

export const initialState: ActivitiesState = {
  activities: [],
  current: {
    charts: [],
    macros: { protein: 10, carb: 20, fat: 30 },
    water: 0,
    burnt: 60,
    total: 200,
    selectedDate: new Date().toDateString(),
    completed: false,
  },
};

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    addMeal: (state, action: PayloadAction<Chart>) => {
      const chartData = action.payload;

      // Calculate total calories from the food list
      const totalCalories = chartData.meals.list.reduce(
        (sum, food) =>
          sum +
          (food.foodItem.nutrition.protein + food.foodItem.nutrition.carb + food.foodItem.nutrition.fat ||
            0),
        0
      );

      // Get current timestamp for lastModified
      const lastModified = new Date().toISOString();

      // Update the chart with total calories and lastModified
      const updatedChart: Chart = {
        ...chartData,
        total: totalCalories,
        lastModified: lastModified,
      };

      // Add the updated chart to the charts array
      state.current.charts.push(updatedChart);

      // Update the total calories in state
      state.current.total += totalCalories;
    },

    updateMeal: () => {},

    addFood: () => {},

    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.current.selectedDate = action.payload;
    },
  },
});

export const { addMeal, setSelectedDate } = activitySlice.actions;
export default activitySlice.reducer;
