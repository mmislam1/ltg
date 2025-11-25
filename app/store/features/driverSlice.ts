import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";
import { Search } from "lucide-react";
import {del} from '../data'

export interface Delivery {
    deliveryId: string;
    orderId: string;
    orderDate: string;
    customerName: string;
    deliveryDate: string;
    payment: number;
    Pickup: string;
    dropOff: string;
    Distance: number;
    Earning: number;
    Company: string;
    Status: "pending" | "accepted" | "pickedup" | "trip" | "reached" | "delivered";
    Description: string;
    rating: number;
    vehicle: "bike" | "pickup" | "truck";
    weight: number;
}

export interface Profile {
    name: string;
    totalEarning: number;
    driverId: string;
    Avatar: string;
    Email: string;
    phoneNumber: string;
    vehicle: "bike" | "pickup" | "truck";
    vehicleRegistration: string;
    drivingLicense: string;
}

export interface Message {
    userId: string;
    Text: string;
    Timestamp: string;
}

export interface Messages {
    orderId: string;
    clientId: string;
    clientAvatar: string;
    messages: Message[];
}

export interface Notification {
    id: string;
    text: string;
    timeStamp: string;
}

export interface DriverState {
    profile: Profile | null;
    deliveries: Delivery[];
    messages: Messages[];
    notifications: Notification[];
    searchDelivery: null | Delivery;
    activeDelivery: Delivery | null;
    view:'date'|'ongoing' | 'delivered';
    date: string;
}

export const initialState: DriverState = {
    profile: null,
    deliveries: del,
    messages: [],
    notifications: [],
    searchDelivery: {
        deliveryId: 'string',
        customerName: 'sdfgsdfg',
        orderId: 'string',
        orderDate: 'string',
        deliveryDate: 'string',
        payment: 7867,
        Pickup: 'string',
        dropOff: 'string',
        Distance: 675688,
        Earning: 465467879,
        Company: 'string',
        Status: "pending",
        Description: 'string',
        rating: 4,
        vehicle: "truck",
        weight: 454356,
    },
    activeDelivery: {
        deliveryId: 'string',
        customerName: 'sdfgsdfg',
        orderId: 'string',
        orderDate: 'string',
        deliveryDate: 'string',
        payment: 7867,
        Pickup: 'string',
        dropOff: 'string',
        Distance: 675688,
        Earning: 465467879,
        Company: 'string',
        Status: "pending",
        Description: 'string',
        rating: 4,
        vehicle: "truck",
        weight: 34345,
    },
    view: 'ongoing',
    date: new Date().toISOString()
}

export const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {
        acceptOrder: (state) => {
            state.deliveries = state.searchDelivery ? [...state.deliveries, state.searchDelivery] : state.deliveries
            state.activeDelivery = state.searchDelivery
            state.searchDelivery = null
        },
        declineOrder: (state) => {
            state.searchDelivery = null
        },
        updateStatus: (state, action: PayloadAction<"pending" | "accepted" | "pickedup" | "trip" | "reached" | "delivered">) => {
            if (state.activeDelivery) { state.activeDelivery.Status = action.payload }
        },
        setView: (state, action: PayloadAction<'date' | 'ongoing' | 'delivered'>)=>{
            state.view=action.payload
        },
        setDate: (state, action: PayloadAction<string>)=>{
            state.date=action.payload
        }
    },
});

export const {
    acceptOrder,
    declineOrder,
    updateStatus,
    setView,
    setDate,
} = driverSlice.actions;
export default driverSlice.reducer;