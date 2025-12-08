import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  weight: number;
  height: number;
  age: number;
  dailyGoals: {
    calories: number;
    protein: number;
    carb: number;
    fat: number;
  };
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}
const initialState: AuthState = {
  user: { id: "1", name: "mm", email: "mmislam272@gmail.com", image: "", weight: 99,
  height: 188,
  age: 29,
  dailyGoals: {
    calories: 1600,
    protein: 200,
    carb: 34,
    fat: 256,
  }
 },
  accessToken: "dfgdfgd",
  refreshToken: "dfgdfgd",
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    /*const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Login failed");
    return (await res.json()) as { user: User; accessToken: string; refreshToken: string };*/
    return {
      user: { id: "1", name: "mm", email: "mmislam272@gmail.com", image: "", weight: 99,
  height: 188,
  age: 29,
  dailyGoals: {
    calories: 1600,
    protein: 200,
    carb: 34,
    fat: 256,
  }
 },
      accessToken: "dfgdfgd",
      refreshToken: "",
    };
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: {
    password2: string;
    password: string;
    email: string;
    name: string;
    phone: string;
    adress: string;
  }) => {
    /*const res = await fetch("/api/auth/register", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Register failed");
    return (await res.json()) as { user: User; accessToken: string; refreshToken: string };*/
    return {
      user: { id: "1", name: "mm", email: "mmislam272@gmail.com", image: "", weight: 99,
  height: 188,
  age: 29,
  dailyGoals: {
    calories: 1600,
    protein: 200,
    carb: 34,
    fat: 256,
  }
 },
      accessToken: "",
      refreshToken: "",
    };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Login error";
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
