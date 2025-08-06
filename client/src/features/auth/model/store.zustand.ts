import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@/entities/user";
import type { AuthStore } from "./types";

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,

      // Actions
      setAuth: (user: User | null, isAuthenticated: boolean) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = isAuthenticated;
        }),
      clearAuth: () =>
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
        }),

      // Getters
      getUser: () => get().user || null,
      getIsAuthenticated: () => get().isAuthenticated,
    })),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
