import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

interface Notification {
  id: string;
  orderId: string; 
  userId?:string;
  message: string;
  timestamp: number;
}
interface NotificationState{
 notifications: Notification[],
}
const initialState: NotificationState = {
    notifications: [
    {
      id: "1",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "2",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "3",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "4",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "5",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "6",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "7",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
  ],
}


export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
  },
});

export const {
  
  deleteNotification,
  clearAllNotifications,
  
} = notificationSlice.actions;
export default notificationSlice.reducer;
