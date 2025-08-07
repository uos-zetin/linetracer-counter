import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { UserStore } from "./types";

export const useZustandUserStore = create<UserStore>()(
  immer((set) => ({
    users: [],

    // Actions
    init: (users) =>
      set((state) => {
        state.users = users;
      }),

    add: (user) =>
      set((state) => {
        // 기존 항목 제거
        state.users = state.users.filter((u) => u.id !== user.id);
        // 새로운 사용자 추가
        state.users.push(user);
      }),

    addMany: (users) =>
      set((state) => {
        // 기존 항목 제거
        const existingIds = new Set(users.map((u) => u.id));
        state.users = state.users.filter((u) => !existingIds.has(u.id));
        // 새로운 사용자 추가
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
  }))
);
