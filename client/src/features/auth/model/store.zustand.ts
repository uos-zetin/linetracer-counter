import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@/entities/user";
import type { AuthStore } from "./types";

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      authState: {
        user: null,
        isAuthenticated: false,
      },

      setAuth: (user: User | null, isAuthenticated: boolean) =>
        set((state) => {
          state.authState.user = user;
          state.authState.isAuthenticated = isAuthenticated;
        }),

      clearAuth: () =>
        set((state) => {
          state.authState.user = null;
          state.authState.isAuthenticated = false;
        }),
    })),
    {
      name: "auth-store",
      partialize: (state) => ({
        authState: state.authState,
      }),
    }
  )
);
