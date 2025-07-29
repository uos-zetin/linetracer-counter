import { createContext, useContext } from "react";
import type { AdminDivisionService } from "./types";

export const AdminDivisionContext = createContext<AdminDivisionService | null>(null);

export const useAdminDivisionService = (): AdminDivisionService => {
  const context = useContext(AdminDivisionContext);
  if (!context) {
    throw new Error("useAdminDivisionService must be used within AdminDivisionProvider");
  }
  return context;
};