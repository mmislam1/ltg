import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api, {
  clearStoredTokens,
  getApiError,
  getFieldErrors,
  getStoredTokens,
  storeTokens,
  StoredTokens,
} from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  image?: string;
  age: number;
  weight: number;
  weightUnit: "kg" | "lb";
  height: number;
  heightUnit: "cm" | "ft";
  timezone: string;
  dailyGoals: {
    targetCalories: number;
    targetProtein: number;
    targetCarb: number;
    targetFat: number;
  };
  goal: UserGoal | null;
}

export type WeightGoalType = "lose_weight" | "maintain_weight" | "gain_weight";
export type FormulaSex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type MacroRatioKey = "balanced" | "high_protein" | "lower_carb" | "keto" | "endurance";

export interface UserGoal {
  goalType: WeightGoalType;
  targetWeight: number;
  targetWeightUnit: "kg" | "lb";
  durationWeeks: number;
  activityLevel: ActivityLevel;
  formulaSex: FormulaSex;
  macroRatio: MacroRatioKey;
  suggestedCalories: number;
  bmr: number;
  tdee: number;
  calorieAdjustment: number;
  targetDate: string;
  warnings: string[];
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  age: number;
  weight: number;
  weight_unit: "kg" | "lb";
  height: number;
  height_unit: "cm" | "ft";
  timezone: string;
  daily_goals: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
  };
  goal?: {
    goal_type: WeightGoalType;
    target_weight: number;
    target_weight_unit: "kg" | "lb";
    duration_weeks: number;
    activity_level: ActivityLevel;
    formula_sex: FormulaSex;
    macro_ratio: MacroRatioKey;
    suggested_calories: number;
    bmr: number;
    tdee: number;
    calorie_adjustment: number;
    target_date: string;
    warnings?: string[];
  } | null;
}

interface AuthResponse {
  user: ApiUser;
  access: string;
  refresh: string;
}

export interface SignUpData {
  name: string;
  email: string;
  age: number;
  weight: number;
  weight_unit: "kg" | "lb";
  height: number;
  height_inches?: number;
  height_unit: "cm" | "ft";
  timezone?: string;
  password: string;
  password_confirm: string;
}

export interface UpdateProfileData {
  name: string;
  age: number;
  weight: number;
  weight_unit: "kg" | "lb";
  height: number;
  height_inches?: number;
  height_unit: "cm" | "ft";
  timezone?: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  clear_goal?: boolean;
  goal_type?: WeightGoalType;
  target_weight?: number;
  target_weight_unit?: "kg" | "lb";
  duration_weeks?: number;
  activity_level?: ActivityLevel;
  formula_sex?: FormulaSex;
  macro_ratio?: MacroRatioKey;
}

type UpdateProfileInput = Partial<UpdateProfileData>;

export interface AuthError {
  message: string;
  fields?: Record<string, string[] | string>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  profileLoading: boolean;
  profileError: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  initialized: false,
  error: null,
  profileLoading: false,
  profileError: null,
};

const mapUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  age: user.age,
  weight: Number(user.weight),
  weightUnit: user.weight_unit,
  height: Number(user.height),
  heightUnit: user.height_unit,
  timezone: user.timezone || "Asia/Dhaka",
  dailyGoals: {
    targetCalories: user.daily_goals.target_calories,
    targetProtein: user.daily_goals.target_protein,
    targetCarb: user.daily_goals.target_carbs,
    targetFat: user.daily_goals.target_fat,
  },
  goal: user.goal
    ? {
        goalType: user.goal.goal_type,
        targetWeight: Number(user.goal.target_weight),
        targetWeightUnit: user.goal.target_weight_unit,
        durationWeeks: user.goal.duration_weeks,
        activityLevel: user.goal.activity_level,
        formulaSex: user.goal.formula_sex,
        macroRatio: user.goal.macro_ratio,
        suggestedCalories: user.goal.suggested_calories,
        bmr: user.goal.bmr,
        tdee: user.goal.tdee,
        calorieAdjustment: user.goal.calorie_adjustment,
        targetDate: user.goal.target_date,
        warnings: user.goal.warnings || [],
      }
    : null,
});

const authError = (error: unknown, fallback: string): AuthError => ({
  message: getApiError(error, fallback),
  fields: getFieldErrors(error),
});

export const loginUser = createAsyncThunk<
  { user: User; tokens: StoredTokens },
  { email: string; password: string },
  { rejectValue: AuthError }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/signin", credentials);
    const tokens = { accessToken: data.access, refreshToken: data.refresh };
    storeTokens(tokens);
    return { user: mapUser(data.user), tokens };
  } catch (error) {
    return rejectWithValue(authError(error, "Sign in failed. Please try again."));
  }
});

export const registerUser = createAsyncThunk<
  { user: User; tokens: StoredTokens },
  SignUpData,
  { rejectValue: AuthError }
>("auth/register", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/signup", formData);
    const tokens = { accessToken: data.access, refreshToken: data.refresh };
    storeTokens(tokens);
    return { user: mapUser(data.user), tokens };
  } catch (error) {
    return rejectWithValue(authError(error, "Account creation failed. Please try again."));
  }
});

export const restoreSession = createAsyncThunk<
  { user: User; tokens: StoredTokens } | null,
  void,
  { rejectValue: AuthError }
>("auth/restore", async (_, { rejectWithValue }) => {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  try {
    const { data } = await api.get<ApiUser>("/auth/me");
    return { user: mapUser(data), tokens: getStoredTokens() || tokens };
  } catch (error) {
    clearStoredTokens();
    return rejectWithValue(authError(error, "Your session has expired."));
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  const refresh = getStoredTokens()?.refreshToken;
  try {
    if (refresh) await api.post("/auth/logout", { refresh });
  } finally {
    clearStoredTokens();
  }
});

export const updateProfile = createAsyncThunk<
  User,
  UpdateProfileInput,
  { rejectValue: AuthError }
>("auth/updateProfile", async (profile, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<ApiUser>("/auth/me", profile);
    return mapUser(data);
  } catch (error) {
    return rejectWithValue(authError(error, "Profile update failed. Please try again."));
  }
});

const applyAuth = (
  state: AuthState,
  payload: { user: User; tokens: StoredTokens },
) => {
  state.user = payload.user;
  state.accessToken = payload.tokens.accessToken;
  state.refreshToken = payload.tokens.refreshToken;
  state.error = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    syncTokens(state, action: PayloadAction<StoredTokens | null>) {
      state.accessToken = action.payload?.accessToken || null;
      state.refreshToken = action.payload?.refreshToken || null;
      if (!action.payload) state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        applyAuth(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Sign in failed.";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        applyAuth(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Account creation failed.";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initialized = true;
        if (action.payload) applyAuth(state, action.payload);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profileError = null;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload?.message || "Profile update failed.";
      });
  },
});

export const { clearAuthError, syncTokens } = authSlice.actions;
export default authSlice.reducer;
