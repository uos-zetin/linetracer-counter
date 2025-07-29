import { createContext, useContext } from "react";
import type { AdminUserService } from "./types";

export const AdminUserContext = createContext<AdminUserService | null>(null);

export const useAdminUserService = () => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error("useAdminUserContext must be used within an AdminUserProvider");
  }
  return context;
};
