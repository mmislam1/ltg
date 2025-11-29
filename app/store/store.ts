import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import  foodReducer from "./features/foodSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    foods: foodReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
