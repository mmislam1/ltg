import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import { Food } from "./foodSlice";

export interface ListItems {
  foodItem: Food;
  quantity: number;
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
  list: ListItems[];
}

export interface Chart {
  //id: string;
  meals: Meal[];
  //lastModified: string;
  //macros: Macros;
  //total: number;
}

export interface ActivityState {
  chart: Chart;
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
    chart: {
      meals: [],
    },
    macros: { protein: 10, carbs: 20, fats: 30 },
    water: 7,
    burnt: 60,
    total: 200,
    selectedDate: new Date().toDateString(),
    completed: false,
  },
};

export const macroCount = (state: ActivitiesState): Macros => {
  return state.current.chart.meals.reduce(
    (total: Macros, meal) => {
      meal.list.forEach((item) => {
        total.protein += item.foodItem.nutrition.protein * item.quantity;
        total.carbs += item.foodItem.nutrition.carbs * item.quantity;
        total.fats += item.foodItem.nutrition.fats * item.quantity;
      });
      return total;
    },
    { protein: 0, carbs: 0, fats: 0 }
  );
};

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    addMeal: (state, action: PayloadAction<Meal>) => {
      const newMeal = action.payload;

      state.current.chart.meals.push(newMeal);

      state.current.macros = macroCount(state);

      state.current.total =
        state.current.macros.protein +
        state.current.macros.fats +
        state.current.macros.carbs;
    },
    updateMeal: (state, action: PayloadAction<Meal>) => {
      const newMeal = action.payload;

      state.current.chart.meals = [
        ...state.current.chart.meals.filter(
          (meal: Meal) => meal.id !== newMeal.id,
        ),
        newMeal,
      ];

      state.current.macros = macroCount(state);

      state.current.total =
        state.current.macros.protein +
        state.current.macros.fats +
        state.current.macros.carbs;
    },

    addFood: () => {},

    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.current.selectedDate = action.payload;
    },
    incrementGlass: (state) => {
      state.current.water += 1;
    },
  },
});

export const { addMeal, setSelectedDate, incrementGlass } =
  activitySlice.actions;
export default activitySlice.reducer;
