import { createContext, useContext } from "react";
import type { AdminParticipantService } from "./types";

export const AdminParticipantContext = createContext<AdminParticipantService | null>(null);

export const useAdminParticipantService = () => {
  const service = useContext(AdminParticipantContext);

  if (!service) {
    throw new Error("useAdminParticipantService must be used within AdminParticipantProvider");
  }

  return service;
};
