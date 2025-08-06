import { createContext, useContext } from "react";
import type { AuthService } from "./types";

export const authServiceContext = createContext<AuthService | null>(null);

export const useAuthService = () => {
  const context = useContext(authServiceContext);
  if (!context) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};
