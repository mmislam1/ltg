import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

interface Driver {
  name: string;
  vehicle: string;
  rating: number;
  avatar: string;
  phone: string;
}

interface Activity {
  id: string;
  orderId: string;
  status: string;
  timestamp: string;
  driver: Driver;
}

interface DeliveryState {
  todayDeliverers: number;
  pendingOrders: number;
  completedOrders: number;
  activities: Activity[];
  history: Activity[];
}

interface CustomerState {
  delivery: DeliveryState;
  name: string;
  email: string;
  phone: string;
  notifications: Notification[];
  deliveryRequest: DeliveryRequestState;
  historyView: "delivered" | "ongoing" | string;
}

interface Notification {
  id: string;
  orderId: string;
  message: string;
  timestamp: number;
}

export interface DeliveryRequestFormData {
  orderId: string;
  companyName: string;
  productDescription: string;
  productWeight: string;
  productAmount: string;
  pickupLocation: string;
  deliveryLocation: string;
}

interface DeliveryRequestState {
  formData: DeliveryRequestFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CustomerState = {
  delivery: {
    todayDeliverers: 2,
    pendingOrders: 2,
    completedOrders: 2,
    activities: [
      {
        id: "1",
        orderId: "0",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/Ellipse 7.png",
          phone: "+880123456789",
        },
      },
      {
        id: "2",
        orderId: "1",
        status: "Delivered Successfully",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "3",
        orderId: "2",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "4",
        orderId: "3",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "5",
        orderId: "4",
        status: "pending",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "6",
        orderId: "5",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
    ],
    history: [
      {
        id: "1",
        orderId: "0",
        status: "delivered",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/Ellipse 7.png",
          phone: "+880123456789",
        },
      },
      {
        id: "2",
        orderId: "1",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "3",
        orderId: "2",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "4",
        orderId: "3",
        status: "pending",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "5",
        orderId: "4",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
      {
        id: "6",
        orderId: "5",
        status: "delivered",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        driver: {
          name: "Abdur Rahim",
          vehicle: "Toyota",
          rating: 4.9,
          avatar: "/driver-avatar.jpg",
          phone: "+880123456789",
        },
      },
    ],
  },
  name: "",
  email: "",
  phone: "",
  notifications: [
    {
      id: "1",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "2",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "3",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "4",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "5",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "6",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
    {
      id: "7",
      orderId: "ID#12345",
      message: "Driver on the way",
      timestamp: 1,
    },
  ],
  deliveryRequest: {
    formData: {
      orderId: "",
      companyName: "",
      productDescription: "",
      productWeight: "",
      productAmount: "",
      pickupLocation: "",
      deliveryLocation: "",
    },
    loading: false,
    error: null,
    success: true,
  },
  historyView: "ongoing",
};

function isISODateString(value: string): boolean {
  // Simple check for ISO date format
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockData: Notification[] = Array.from({ length: 7 }, (_, i) => ({
        id: `notif-${i + 1}`,
        orderId: "ID#12345",
        message: "Driver on the way",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      }));

      return mockData;
    } catch (error) {
      return rejectWithValue("Failed to fetch notifications");
    }
  }
);

export const submitDeliveryRequest = createAsyncThunk(
  "delivery/submitRequest",
  async (formData: DeliveryRequestFormData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit delivery request");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

export const cancelDelivery = createAsyncThunk(
  "delivery/cancelDelivery",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/delivery/cancel_request/${id}`);
      return response.data.id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

export const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    updateDeliverers: (state, action: PayloadAction<number>) => {
      state.delivery.todayDeliverers = action.payload;
    },
    updatePendingOrders: (state, action: PayloadAction<number>) => {
      state.delivery.pendingOrders = action.payload;
    },
    updateCompletedOrders: (state, action: PayloadAction<number>) => {
      state.delivery.completedOrders = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.delivery.activities.unshift(action.payload);
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    updateDeliveryRequestFormField: (
      state,
      action: PayloadAction<{
        field: keyof DeliveryRequestFormData;
        value: string;
      }>
    ) => {
      state.deliveryRequest.formData[action.payload.field] =
        action.payload.value;
      state.deliveryRequest.error = null;
    },
    resetDeliveryRequestForm: (state) => {
      state.deliveryRequest.formData = initialState.deliveryRequest.formData;
      state.deliveryRequest.error = null;
      state.deliveryRequest.success = false;
    },
    clearDeliveryRequestError: (state) => {
      state.deliveryRequest.error = null;
    },
    updateHistoryView: (state, action: PayloadAction<string>) => {
      state.historyView = action.payload;
    },
  },
});

export const {
  updateDeliverers,
  updatePendingOrders,
  updateCompletedOrders,
  addActivity,
  deleteNotification,
  clearAllNotifications,
  updateDeliveryRequestFormField,
  resetDeliveryRequestForm,
  clearDeliveryRequestError,
  updateHistoryView,
} = customerSlice.actions;
export default customerSlice.reducer;
