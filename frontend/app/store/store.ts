import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import  foodReducer from "./features/foodSlice";
import activityReducer from "./features/activitySlice"


export const store = configureStore({
  reducer: {
    auth: authReducer,
    foods: foodReducer,
    activity: activityReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
