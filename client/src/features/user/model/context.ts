import { createContext, useContext } from "react";
import type { UserService } from "./types";

export const UserContext = createContext<UserService | null>(null);

export const useUserService = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserService must be used within a UserProvider");
  }
  return context;
};