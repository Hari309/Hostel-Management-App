import axios from "axios";
import { getToken } from "./auth";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const normalizedApiBaseUrl = (() => {
  if (!rawApiUrl) return "http://localhost:5000/api";

  const clean = rawApiUrl.replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

const api = axios.create({
  baseURL: normalizedApiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || fallback;

export const loginAdmin = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const registerAdmin = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const fetchDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const fetchTenants = async (params = {}) => {
  const response = await api.get("/tenants", { params });
  return response.data;
};

export const createTenant = async (payload) => {
  const response = await api.post("/tenants", payload);
  return response.data;
};

export const updateTenant = async (id, payload) => {
  const response = await api.put(`/tenants/${id}`, payload);
  return response.data;
};

export const deleteTenant = async (id) => {
  const response = await api.delete(`/tenants/${id}`);
  return response.data;
};

export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data;
};

export const createRoom = async (payload) => {
  const response = await api.post("/rooms", payload);
  return response.data;
};

export const updateRoom = async (id, payload) => {
  const response = await api.put(`/rooms/${id}`, payload);
  return response.data;
};

export const fetchPayments = async (params = {}) => {
  const response = await api.get("/payments", { params });
  return response.data;
};

export const createPayment = async (payload) => {
  const response = await api.post("/payments", payload);
  return response.data;
};

export const fetchExpenses = async (params = {}) => {
  const response = await api.get("/expenses", { params });
  return response.data;
};

export const createExpense = async (payload) => {
  const response = await api.post("/expenses", payload);
  return response.data;
};

export const updateExpense = async (id, payload) => {
  const response = await api.put(`/expenses/${id}`, payload);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const fetchComplaints = async (params = {}) => {
  const response = await api.get("/complaints", { params });
  return response.data;
};

export const createComplaint = async (payload) => {
  const response = await api.post("/complaints", payload);
  return response.data;
};

export const updateComplaint = async (id, payload) => {
  const response = await api.put(`/complaints/${id}`, payload);
  return response.data;
};

export { getErrorMessage };
