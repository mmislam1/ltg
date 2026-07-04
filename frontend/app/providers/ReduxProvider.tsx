"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store/store";
import {
  restoreSession,
  syncTokens,
  updateProfile,
} from "../store/features/authSlice";
import { onTokensChanged } from "../store/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchFoods } from "../store/features/foodSlice";
import {
  fetchMealActivity,
  resetActivity,
} from "../store/features/activitySlice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userTimezone = user?.timezone;

  useEffect(() => {
    const stopListening = onTokensChanged((tokens) => {
      dispatch(syncTokens(tokens));
    });
    dispatch(restoreSession());
    return stopListening;
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;
    let active = true;
    const loadUserData = async () => {
      if (userId) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone && timezone !== userTimezone) {
          await dispatch(updateProfile({ timezone }));
        }
      }
      await dispatch(fetchFoods());
      if (!active) return;
      if (userId) await dispatch(fetchMealActivity());
      else dispatch(resetActivity());
    };
    void loadUserData();
    return () => {
      active = false;
    };
  }, [dispatch, initialized, userId, userTimezone]);

  return null;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      {children}
    </Provider>
  );
}
