import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api, { getApiError } from "../api";
import type { FoodUnit } from "../nutritionUnits";

export interface Vitamins {
  b1: number;
  b2: number;
  b3: number;
  b5: number;
  b6: number;
  b7: number;
  b8: number;
  b9: number;
  b12: number;
  a: number;
  c: number;
  d: number;
  e: number;
  k: number;
}

export interface Minerals {
  calcium: number;
  copper: number;
  iron: number;
  magnesium: number;
  manganese: number;
  phosphorus: number;
  potassium: number;
  selenium: number;
  sodium: number;
  zinc: number;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  netCarbs: number;
  fats: number;
  vitamins?: Vitamins;
  minerals?: Minerals;
}

export interface Food {
  id: string;
  name: string;
  addedBy: string;
  selectedBy: number;
  kind: "food" | "recipe";
  unit: FoodUnit;
  nutritionPer: number;
  nutrition: Nutrition;
  recipeServings?: number;
  ingredients?: RecipeIngredient[];
  approved: boolean;
}

export interface RecipeIngredient {
  foodId: string;
  quantity: number;
}

export interface CreateFoodInput {
  name: string;
  unit: FoodUnit;
  nutritionPer: number;
  nutrition: Nutrition;
}

export interface CreateRecipeInput {
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
}

export interface FoodsState {
  list: Food[];
  pending: Food[];
  loading: boolean;
  pendingLoading: boolean;
  creating: boolean;
  creatingRecipe: boolean;
  scanningLabel: boolean;
  deletingIds: string[];
  approvingIds: string[];
  error: string | null;
  pendingError: string | null;
}

const initialState: FoodsState = {
  list: [],
  pending: [],
  loading: false,
  pendingLoading: false,
  creating: false,
  creatingRecipe: false,
  scanningLabel: false,
  deletingIds: [],
  approvingIds: [],
  error: null,
  pendingError: null,
};

const reject = (error: unknown, fallback: string) => getApiError(error, fallback);

export const fetchFoods = createAsyncThunk<Food[], void, { rejectValue: string }>(
  "foods/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Food[]>("/foods");
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to load food items."));
    }
  },
);

export const createFood = createAsyncThunk<Food, CreateFoodInput, { rejectValue: string }>(
  "foods/create",
  async (food, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Food>("/custom/foods", food);
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to create the food item."));
    }
  },
);

export const scanNutritionLabel = createAsyncThunk<CreateFoodInput, File, { rejectValue: string }>(
  "foods/scanNutritionLabel",
  async (image, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      const { data } = await api.post<CreateFoodInput>("/custom/foods/scan-label", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000,
      });
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to scan the image."));
    }
  },
);

export const createRecipe = createAsyncThunk<Food, CreateRecipeInput, { rejectValue: string }>(
  "foods/createRecipe",
  async (recipe, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Food>("/custom/recipes", recipe);
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to create the recipe."));
    }
  },
);

export const fetchPendingFoods = createAsyncThunk<Food[], void, { rejectValue: string }>(
  "foods/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Food[]>("/foods/pending");
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to load pending food items."));
    }
  },
);

export const approveFood = createAsyncThunk<Food, string, { rejectValue: string }>(
  "foods/approve",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Food>(`/foods/${id}/approve`);
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to approve the food item."));
    }
  },
);

export const deleteFood = createAsyncThunk<string, string, { rejectValue: string }>(
  "foods/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/foods/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(reject(error, "Unable to delete the food item."));
    }
  },
);

const upsert = (items: Food[], food: Food) => {
  const index = items.findIndex((item) => item.id === food.id);
  if (index === -1) items.push(food);
  else items[index] = food;
};

export const foodSlice = createSlice({
  name: "foods",
  initialState,
  reducers: {
    clearFoodError(state) {
      state.error = null;
      state.pendingError = null;
    },
    resetFoods: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load food items.";
      })
      .addCase(createFood.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createFood.fulfilled, (state, action) => {
        state.creating = false;
        upsert(state.list, action.payload);
      })
      .addCase(createFood.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Unable to create the food item.";
      })
      .addCase(scanNutritionLabel.pending, (state) => {
        state.scanningLabel = true;
        state.error = null;
      })
      .addCase(scanNutritionLabel.fulfilled, (state) => {
        state.scanningLabel = false;
      })
      .addCase(scanNutritionLabel.rejected, (state, action) => {
        state.scanningLabel = false;
        state.error = action.payload || "Unable to scan the image.";
      })
      .addCase(createRecipe.pending, (state) => {
        state.creatingRecipe = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.creatingRecipe = false;
        upsert(state.list, action.payload);
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.creatingRecipe = false;
        state.error = action.payload || "Unable to create the recipe.";
      })
      .addCase(fetchPendingFoods.pending, (state) => {
        state.pendingLoading = true;
        state.pendingError = null;
      })
      .addCase(fetchPendingFoods.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pending = action.payload;
      })
      .addCase(fetchPendingFoods.rejected, (state, action) => {
        state.pendingLoading = false;
        state.pendingError = action.payload || "Unable to load pending food items.";
      })
      .addCase(approveFood.pending, (state, action) => {
        state.approvingIds.push(action.meta.arg);
        state.pendingError = null;
      })
      .addCase(approveFood.fulfilled, (state, action) => {
        state.approvingIds = state.approvingIds.filter((id) => id !== action.payload.id);
        state.pending = state.pending.filter((item) => item.id !== action.payload.id);
        upsert(state.list, action.payload);
      })
      .addCase(approveFood.rejected, (state, action) => {
        state.approvingIds = state.approvingIds.filter((id) => id !== action.meta.arg);
        state.pendingError = action.payload || "Unable to approve the food item.";
      })
      .addCase(deleteFood.pending, (state, action) => {
        state.deletingIds.push(action.meta.arg);
        state.error = null;
      })
      .addCase(deleteFood.fulfilled, (state, action: PayloadAction<string>) => {
        state.deletingIds = state.deletingIds.filter((id) => id !== action.payload);
        state.list = state.list.filter((item) => item.id !== action.payload);
        state.pending = state.pending.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteFood.rejected, (state, action) => {
        state.deletingIds = state.deletingIds.filter((id) => id !== action.meta.arg);
        state.error = action.payload || "Unable to delete the food item.";
      });
  },
});

export const { clearFoodError, resetFoods } = foodSlice.actions;
export default foodSlice.reducer;
