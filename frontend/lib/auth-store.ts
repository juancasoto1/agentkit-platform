/**
 * Store de Zustand para autenticación
 */

import { create } from "zustand";
import { authAPI } from "./api";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name: string,
    company_name: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      set({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Error al iniciar sesión",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (
    email: string,
    password: string,
    full_name: string,
    company_name: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({
        email,
        password,
        full_name,
        company_name,
      });
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      set({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Error al registrarse",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // En producción, verificar que el token sea válido
      // Por ahora, solo lo restauramos
      set({ accessToken: token });
    }
  },
}));
