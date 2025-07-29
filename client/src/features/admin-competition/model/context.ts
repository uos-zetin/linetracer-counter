import { createContext, useContext } from "react";
import type { AdminCompetitionService } from "./types";

export const AdminCompetitionContext = createContext<AdminCompetitionService | null>(null);

export const useAdminCompetitionService = () => {
  const context = useContext(AdminCompetitionContext);
  if (!context) {
    throw new Error("useAdminCompetitionService must be used within an AdminCompetitionProvider");
  }
  return context;
};