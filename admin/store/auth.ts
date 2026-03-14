"use client";

import { create } from "zustand";
import { api, setAccessToken } from "@/lib/api";

interface AdminUser {
  username: string;
  fullName: string;
  email: string;
  role: string;
  storeId: number | null;
  storeName: string | null;
}

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
  isSuperAdmin: () => boolean;
  hasRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await api.auth.login(username, password);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Credenziali non valide");
      }
      setAccessToken(res.data.accessToken);
      set({
        user: {
          username: res.data.username,
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
          storeId: res.data.storeId ?? null,
          storeName: res.data.storeName ?? null,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try { await api.auth.logout(); } catch { /* ignore */ }
    setAccessToken(null);
    set({ user: null });
    window.location.href = "/login";
  },

  setUser: (user) => set({ user }),

  isSuperAdmin: () => get().user?.role === "SUPER_ADMIN",
  hasRole: (roles) => roles.includes(get().user?.role ?? ""),
}));
