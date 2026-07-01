"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "../store/store";
import { restoreSession, syncTokens } from "../store/features/authSlice";
import { onTokensChanged } from "../store/api";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

function SessionBootstrap() {
  useEffect(() => {
    const stopListening = onTokensChanged((tokens) => {
      store.dispatch(syncTokens(tokens));
    });
    store.dispatch(restoreSession());
    return stopListening;
  }, []);

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
