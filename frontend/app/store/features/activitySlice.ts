import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Food } from "./foodSlice";
import { nutritionMultiplier } from "../nutritionUnits";

export interface ListItems {
  foodItem: Food | undefined;
  quantity: number;
}

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
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
  list: ListItems[] | [];
}

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
}

export const initialState: ActivitiesState = {
  activities: [],
  current: {
    chart: {
      meals: [],
    },
    macros: { calories: 0, protein: 0, carbs: 0, fiber: 0, netCarbs: 0, fats: 0 },
    water: 0,
    burnt: 0,
    total: 0,
    selectedDate: new Date().toDateString(),
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
};

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

export const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    addMeal: (state, action: PayloadAction<Meal>) => {
      const newMeal = action.payload;

      state.current.chart.meals.push(newMeal);

      state.current.macros = macroCount(state);
      state.current.totalMicro = microCount(state);

      state.current.total = state.current.macros.calories;
    },
    updateMeal: (state, action: PayloadAction<Meal[]>) => {
      const newMeal = action.payload;

      state.current.chart.meals = newMeal

      state.current.macros = macroCount(state);
      state.current.totalMicro = microCount(state);

      state.current.total = state.current.macros.calories;
    },

    addFood: () => {},

    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.current.selectedDate = action.payload;
    },
    incrementGlass: (state) => {
      state.current.water += 1;
    },
  },
});

export const { addMeal, setSelectedDate, incrementGlass, updateMeal} =
  activitySlice.actions;
export default activitySlice.reducer;
