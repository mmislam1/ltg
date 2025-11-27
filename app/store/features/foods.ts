import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import {del} from '../data'

export interface Nutrition {
    carb: number,
    fat: number,
    protein: number,
}

export interface Food {
    id:string,
    name: string,
    addedBy: string,
    selectedBy: number,
    favouritesBy: number,
    nutrition: Nutrition,
}
export interface Foods {
    list: Food[],
    favourites:Food[],
    loading: Boolean,
}



export const initialState: Foods = {
    list: [],
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