import { createContext, useContext } from "react";
import type { ParticipantService } from "./types";

export const participantServiceContext = createContext<ParticipantService | null>(null);

export const useParticipantService = (): ParticipantService => {
  const service = useContext(participantServiceContext);
  if (!service) {
    throw new Error("useParticipantService must be used within a ParticipantProvider");
  }
  return service;
};