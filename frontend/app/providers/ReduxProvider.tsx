"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store/store";
import { restoreSession, syncTokens } from "../store/features/authSlice";
import { onTokensChanged } from "../store/api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchFoods } from "../store/features/foodSlice";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    const stopListening = onTokensChanged((tokens) => {
      dispatch(syncTokens(tokens));
    });
    dispatch(restoreSession());
    return stopListening;
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;
    dispatch(fetchFoods());
  }, [dispatch, initialized, userId]);

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
