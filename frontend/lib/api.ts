"""
Cliente HTTP para conectar con el backend
"""

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autorización
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intenta refrescar
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============= AUTH ENDPOINTS =============

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    company_name: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  refresh: async (refresh_token: string) => {
    const response = await api.post("/auth/refresh", {
      refresh_token,
    });
    return response.data;
  },
};
