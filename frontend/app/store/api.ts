import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[] | string>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_STORAGE_KEY = "ltg.auth.tokens";

let memoryTokens: StoredTokens | null = null;
let tokenListener: ((tokens: StoredTokens | null) => void) | null = null;
let refreshRequest: Promise<StoredTokens> | null = null;

export const getStoredTokens = (): StoredTokens | null => {
  if (memoryTokens) return memoryTokens;
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    memoryTokens = value ? (JSON.parse(value) as StoredTokens) : null;
  } catch {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    memoryTokens = null;
  }
  return memoryTokens;
};

export const storeTokens = (tokens: StoredTokens) => {
  memoryTokens = tokens;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  }
  tokenListener?.(tokens);
};

export const clearStoredTokens = () => {
  memoryTokens = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  tokenListener?.(null);
};

export const onTokensChanged = (
  listener: (tokens: StoredTokens | null) => void,
) => {
  tokenListener = listener;
  return () => {
    if (tokenListener === listener) tokenListener = null;
  };
};

export const getApiError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return fallback;
  if (!error.response) return "Unable to reach the server. Check your connection and try again.";
  return error.response.data?.message || fallback;
};

export const getFieldErrors = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) return undefined;
  return error.response?.data?.errors;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const accessToken = getStoredTokens()?.accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const refreshTokens = async () => {
  const current = getStoredTokens();
  if (!current?.refreshToken) throw new Error("No refresh token is available.");

  const response = await axios.post<{
    access: string;
    refresh?: string;
  }>(`${API_URL}/auth/refresh/`, { refresh: current.refreshToken }, { timeout: 15_000 });

  const tokens = {
    accessToken: response.data.access,
    refreshToken: response.data.refresh || current.refreshToken,
  };
  storeTokens(tokens);
  return tokens;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isRefreshRequest = request?.url?.includes("/auth/refresh/");

    if (error.response?.status !== 401 || !request || request._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshRequest ??= refreshTokens().finally(() => {
        refreshRequest = null;
      });
      const tokens = await refreshRequest;
      request.headers.Authorization = `Bearer ${tokens.accessToken}`;
      if (request.url?.includes("/auth/logout/")) {
        request.data = JSON.stringify({ refresh: tokens.refreshToken });
      }
      return api(request);
    } catch (refreshError) {
      clearStoredTokens();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
