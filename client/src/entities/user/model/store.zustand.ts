import { create } from "zustand";
import type { UserStore } from "./types";
import { immer } from "zustand/middleware/immer";

export const useZustandUserStore = create<UserStore>()(
  immer((set, get) => ({
    users: [],

    // Actions
    init: (users) =>
      set((state) => {
        state.users = users;
      }),

    add: (user) =>
      set((state) => {
        state.users.push(user);
      }),

    addMany: (users) =>
      set((state) => {
        state.users.push(...users);
      }),

    update: (user) =>
      set((state) => {
        const index = state.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          state.users[index] = user;
        }
      }),

    remove: (userId) =>
      set((state) => {
        state.users = state.users.filter((u) => u.id !== userId);
      }),

    // Getters
    getById: (userId) => get().users.find((user) => user.id === userId) || null,
  })),
);
