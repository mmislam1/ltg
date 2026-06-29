// src/api/axiosClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com", // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
