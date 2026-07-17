import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Food } from "./foodSlice";
import { nutritionMultiplier } from "../nutritionUnits";
import api, { getApiError } from "../api";

export interface ListItems {
  foodItem: Food | undefined;
  quantity: number;
}

export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  netCarbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  mealType: MealType | undefined;
  list: ListItems[] | [];
}

const defaultMeals = (): Meal[] =>
  MEAL_TYPES.map((mealType) => ({
    id: mealType.toLowerCase(),
    mealType,
    list: [],
  }));

export interface Chart {
  //id: string;
  meals: Meal[];
  //lastModified: string;
  //macros: Macros;
  //total: number;
}

export interface ActivityState {
  chart: Chart;
  water: number;
  steps: number;
  burnt: number;
  macros: Macros;
  total: number;
  selectedDate: string;
  completed: boolean;
  totalMicro: {
    vitamins: {
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
    };
    minerals: {
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
    };
  };
}

export interface ActivitiesState {
  activities: ActivityState[];
  current: ActivityState;
  loading: boolean;
  saving: number;
  error: string | null;
  persistedMealTypes: MealType[];
  loadRequestId: string | null;
}

const createInitialState = (): ActivitiesState => ({
  activities: [],
  current: {
    chart: {
      meals: defaultMeals(),
    },
    macros: { calories: 0, protein: 0, carbs: 0, fiber: 0, netCarbs: 0, fats: 0 },
    water: 0,
    steps: 0,
    burnt: 0,
    total: 0,
    selectedDate: "",
    completed: false,
    totalMicro: {
      vitamins: {
        b1: 0,
        b2: 0,
        b3: 0,
        b5: 0,
        b6: 0,
        b7: 0,
        b8: 0,
        b9: 0,
        b12: 0,
        a: 0,
        c: 0,
        d: 0,
        e: 0,
        k: 0,
      },
      minerals: {
        calcium: 0,
        copper: 0,
        iron: 0,
        magnesium: 0,
        manganese: 0,
        phosphorus: 0,
        potassium: 0,
        selenium: 0,
        sodium: 0,
        zinc: 0,
      },
    },
  },
  loading: false,
  saving: 0,
  error: null,
  persistedMealTypes: [],
  loadRequestId: null,
});

export const initialState: ActivitiesState = createInitialState();

export const macroCount = (state: ActivitiesState): Macros => {
  return state.current.chart.meals.reduce(
    (total: Macros, meal) => {
      meal?.list?.forEach((item) => {
        const factor = item.foodItem
          ? nutritionMultiplier(item.foodItem, item.quantity)
          : 0;
        total.calories += item.foodItem
          ? item.foodItem.nutrition.calories * factor
          : 0;
        total.protein += item.foodItem
          ? item.foodItem.nutrition.protein * factor
          : 0;
        total.carbs += item.foodItem
          ? item.foodItem.nutrition.carbs * factor
          : 0;
        total.fiber += item.foodItem
          ? item.foodItem.nutrition.fiber * factor
          : 0;
        total.netCarbs += item.foodItem
          ? item.foodItem.nutrition.netCarbs * factor
          : 0;
        total.fats += item.foodItem
          ? item.foodItem.nutrition.fats * factor
          : 0;
      });
      return total;
    },
    { calories: 0, protein: 0, carbs: 0, fiber: 0, netCarbs: 0, fats: 0 },
  );
};

export const microCount = (state: ActivitiesState) => {
  return state.current.chart.meals.reduce(
    (total, meal) => {
      meal?.list?.forEach((item) => {
        if (item.foodItem && item.foodItem.nutrition) {
          const factor = nutritionMultiplier(item.foodItem, item.quantity);
          const vitamins = item.foodItem.nutrition.vitamins;
          const minerals = item.foodItem.nutrition.minerals;

          if (vitamins) {
            total.vitamins.b1 += (vitamins.b1 || 0) * factor;
            total.vitamins.b2 += (vitamins.b2 || 0) * factor;
            total.vitamins.b3 += (vitamins.b3 || 0) * factor;
            total.vitamins.b5 += (vitamins.b5 || 0) * factor;
            total.vitamins.b6 += (vitamins.b6 || 0) * factor;
            total.vitamins.b7 += (vitamins.b7 || 0) * factor;
            total.vitamins.b8 += (vitamins.b8 || 0) * factor;
            total.vitamins.b9 += (vitamins.b9 || 0) * factor;
            total.vitamins.b12 += (vitamins.b12 || 0) * factor;
            total.vitamins.a += (vitamins.a || 0) * factor;
            total.vitamins.c += (vitamins.c || 0) * factor;
            total.vitamins.d += (vitamins.d || 0) * factor;
            total.vitamins.e += (vitamins.e || 0) * factor;
            total.vitamins.k += (vitamins.k || 0) * factor;
          }

          if (minerals) {
            total.minerals.calcium += (minerals.calcium || 0) * factor;
            total.minerals.copper += (minerals.copper || 0) * factor;
            total.minerals.iron += (minerals.iron || 0) * factor;
            total.minerals.magnesium +=
              (minerals.magnesium || 0) * factor;
            total.minerals.manganese +=
              (minerals.manganese || 0) * factor;
            total.minerals.phosphorus +=
              (minerals.phosphorus || 0) * factor;
            total.minerals.potassium +=
              (minerals.potassium || 0) * factor;
            total.minerals.selenium += (minerals.selenium || 0) * factor;
            total.minerals.sodium += (minerals.sodium || 0) * factor;
            total.minerals.zinc += (minerals.zinc || 0) * factor;
          }
        }
      });
      return total;
    },
    {
      vitamins: {
        b1: 0,
        b2: 0,
        b3: 0,
        b5: 0,
        b6: 0,
        b7: 0,
        b8: 0,
        b9: 0,
        b12: 0,
        a: 0,
        c: 0,
        d: 0,
        e: 0,
        k: 0,
      },
      minerals: {
        calcium: 0,
        copper: 0,
        iron: 0,
        magnesium: 0,
        manganese: 0,
        phosphorus: 0,
        potassium: 0,
        selenium: 0,
        sodium: 0,
        zinc: 0,
      },
    },
  );
};

interface ApiMealActivity {
  id: string;
  date: string;
  timezone: string;
  water: number;
  steps: number;
  meals: Array<{
    mealType: MealType;
    list: Array<{ foodId: string; quantity: number }>;
  }>;
}

interface ActivityStoreState {
  activity: ActivitiesState;
  foods: { list: Food[] };
}

interface SaveMealArgs {
  meal: Meal;
  date: string;
}

interface SaveDailyActivityArgs {
  date?: string;
  water?: number;
  steps?: number;
}

const mealsFromApi = (record: ApiMealActivity, foods: Food[]): Meal[] => {
  const foodsById = new Map(foods.map((food) => [food.id, food]));
  const mealsByType = new Map(record.meals.map((meal) => [meal.mealType, meal]));
  return MEAL_TYPES.map((mealType) => {
    const savedMeal = mealsByType.get(mealType);
    return {
      id: mealType.toLowerCase(),
      mealType,
      list: (savedMeal?.list ?? []).map((item) => ({
        foodItem: foodsById.get(item.foodId),
        quantity: item.quantity,
      })),
    };
  });
};

const mealRequest = (meal: Meal) => ({
  list: meal.list.flatMap((item) =>
    item.foodItem
      ? [{ foodId: item.foodItem.id, quantity: item.quantity }]
      : [],
  ),
});

export const fetchMealActivity = createAsyncThunk<
  { record: ApiMealActivity; foods: Food[] },
  string | undefined,
  { state: ActivityStoreState; rejectValue: string }
>("activity/fetchForDate", async (date, { getState, rejectWithValue }) => {
  try {
    const { data } = await api.get<ApiMealActivity>("/meal-activities", {
      params: date ? { date } : undefined,
    });
    return { record: data, foods: getState().foods.list };
  } catch (error) {
    return rejectWithValue(getApiError(error, "Unable to load meal activity."));
  }
});

export const saveMealActivity = createAsyncThunk<
  ApiMealActivity,
  SaveMealArgs,
  { state: ActivityStoreState; rejectValue: string }
>("activity/saveMeal", async ({ meal, date }, { getState, rejectWithValue }) => {
  if (!meal.mealType) return rejectWithValue("A valid meal type is required.");

  const params = date ? { date } : undefined;
  const body = mealRequest(meal);
  const path = `/meal-activities/meals/${encodeURIComponent(meal.mealType)}`;
  const exists = getState().activity.persistedMealTypes.includes(meal.mealType);

  try {
    if (exists) {
      const { data } = await api.patch<ApiMealActivity>(path, body, { params });
      return data;
    }

    try {
      const { data } = await api.post<ApiMealActivity>(
        "/meal-activities/meals",
        { mealType: meal.mealType, ...body },
        { params },
      );
      return data;
    } catch (error) {
      if ((error as { response?: { status?: number } }).response?.status !== 409) throw error;
      const { data } = await api.patch<ApiMealActivity>(path, body, { params });
      return data;
    }
  } catch (error) {
    return rejectWithValue(getApiError(error, "Unable to save meal activity."));
  }
});

export const saveDailyActivityMetrics = createAsyncThunk<
  ApiMealActivity,
  SaveDailyActivityArgs,
  { state: ActivityStoreState; rejectValue: string }
>("activity/saveDailyMetrics", async ({ date, water, steps }, { rejectWithValue }) => {
  if (water === undefined && steps === undefined) {
    return rejectWithValue("No daily activity change was provided.");
  }

  try {
    const { data } = await api.patch<ApiMealActivity>(
      "/meal-activities/daily",
      {
        ...(water !== undefined ? { water } : {}),
        ...(steps !== undefined ? { steps } : {}),
      },
      { params: date ? { date } : undefined },
    );
    return data;
  } catch (error) {
    return rejectWithValue(getApiError(error, "Unable to save daily activity."));
  }
});

const recalculate = (state: ActivitiesState) => {
  state.current.macros = macroCount(state);
  state.current.totalMicro = microCount(state);
  state.current.total = state.current.macros.calories;
};

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    upsertMeal: (state, action: PayloadAction<Meal>) => {
      const nextMeal = action.payload;
      const existingIndex = state.current.chart.meals.findIndex(
        (meal) => meal.mealType === nextMeal.mealType,
      );

      if (existingIndex === -1) {
        state.current.chart.meals.push(nextMeal);
      } else {
        const existingMeal = state.current.chart.meals[existingIndex];
        state.current.chart.meals[existingIndex] = {
          ...nextMeal,
          id: existingMeal.id,
        };
      }

      recalculate(state);
    },
    updateMeal: (state, action: PayloadAction<Meal[]>) => {
      const newMeal = action.payload;

      state.current.chart.meals = newMeal

      recalculate(state);
    },

    addFood: () => {},

    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.current.selectedDate = action.payload;
    },
    incrementGlass: (state) => {
      state.current.water += 1;
    },
    addSteps: (state, action: PayloadAction<number>) => {
      state.current.steps += action.payload;
    },
    resetActivity: () => createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealActivity.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.loadRequestId = action.meta.requestId;
        if (action.meta.arg && action.meta.arg !== state.current.selectedDate) {
          state.current.selectedDate = action.meta.arg;
          state.current.chart.meals = defaultMeals();
          state.current.water = 0;
          state.current.steps = 0;
          state.persistedMealTypes = [];
          recalculate(state);
        }
      })
      .addCase(fetchMealActivity.fulfilled, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.loadRequestId = null;
        state.current.selectedDate = action.payload.record.date;
        state.current.chart.meals = mealsFromApi(
          action.payload.record,
          action.payload.foods,
        );
        state.current.water = action.payload.record.water ?? 0;
        state.current.steps = action.payload.record.steps ?? 0;
        state.persistedMealTypes = action.payload.record.meals.map(
          (meal) => meal.mealType,
        );
        recalculate(state);
      })
      .addCase(fetchMealActivity.rejected, (state, action) => {
        if (state.loadRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.loadRequestId = null;
        state.error = action.payload || "Unable to load meal activity.";
      })
      .addCase(saveMealActivity.pending, (state) => {
        state.saving += 1;
        state.error = null;
      })
      .addCase(saveMealActivity.fulfilled, (state, action) => {
        state.saving = Math.max(0, state.saving - 1);
        if (action.payload.date !== state.current.selectedDate) return;
        state.persistedMealTypes = action.payload.meals.map(
          (meal) => meal.mealType,
        );
      })
      .addCase(saveMealActivity.rejected, (state, action) => {
        state.saving = Math.max(0, state.saving - 1);
        if (action.meta.arg.date === state.current.selectedDate) {
          state.error = action.payload || "Unable to save meal activity.";
        }
      })
      .addCase(saveDailyActivityMetrics.pending, (state) => {
        state.saving += 1;
        state.error = null;
      })
      .addCase(saveDailyActivityMetrics.fulfilled, (state, action) => {
        state.saving = Math.max(0, state.saving - 1);
        if (action.payload.date !== state.current.selectedDate) return;
        state.current.water = action.payload.water ?? 0;
        state.current.steps = action.payload.steps ?? 0;
      })
      .addCase(saveDailyActivityMetrics.rejected, (state, action) => {
        state.saving = Math.max(0, state.saving - 1);
        if (!action.meta.arg.date || action.meta.arg.date === state.current.selectedDate) {
          state.error = action.payload || "Unable to save daily activity.";
        }
      });
  },
});

export const {
  upsertMeal,
  setSelectedDate,
  incrementGlass,
  addSteps,
  updateMeal,
  resetActivity,
} =
  activitySlice.actions;
export default activitySlice.reducer;
