import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import customerReducer from './features/customerSlice';
import chatReducer from './features/chatSlice'; 
import driverReducer from './features/driverSlice';
import notificationReducer from './features/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    chat: chatReducer,
    driver: driverReducer,
    notifications: notificationReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
