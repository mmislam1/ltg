import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import { foods } from "../foods";


export interface Vitamins {
  b1: number; // Thiamine (mg)
  b2: number; // Riboflavin (mg)
  b3: number; // Niacin (mg)
  b5: number; // Pantothenic Acid (mg)
  b6: number; // Pyridoxine (mg)
  b7: number; // Biotin (mg)
  b8: number; // Choline (mg)
  b9: number; // Folate (μg)
  b12: number; // Cobalamin (μg)
  a: number; // Vitamin A (μg)
  c: number; // Vitamin C (mg)
  d: number; // Vitamin D (IU)
  e: number; // Vitamin E (mg)
  k: number; // Vitamin K (μg)
}

export interface Minerals {
  calcium: number; // mg
  copper: number; // mg
  iron: number; // mg
  magnesium: number; // mg
  manganese: number; // mg
  phosphorus: number; // mg
  potassium: number; // mg
  selenium: number; // μg
  sodium: number; // mg
  zinc: number; // mg
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  vitamins?: Vitamins;
  minerals?: Minerals;
}

export interface Food {
  id: string;
  name: string;
  addedBy: string;
  selectedBy: number;
  unit: string;
  nutrition: Nutrition;
  approved: boolean;
}

export interface Foods {
    list: Food[],
    favourites:Food[],
    loading: boolean,
}



export const initialState: Foods = {
    list: foods,
    favourites: [],
    loading: true,
}

export const foodSlice = createSlice({
    name: "food",
    initialState,
    reducers: {
        
    },
});

export const {
    
} = foodSlice.actions;
export default foodSlice.reducer;