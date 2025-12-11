import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import {del} from '../data'
import { foods } from "../foods";

export interface Nutrition {
    calories:number,
    carbs: number,
    fats: number,
    protein: number,
}

export interface Food {
    id:string,
    name: string,
    addedBy: string,
    selectedBy: number,
    unit: string,
    nutrition: Nutrition,
    approved: boolean,
}
export interface Foods {
    list: Food[],
    favourites:Food[],
    loading: Boolean,
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