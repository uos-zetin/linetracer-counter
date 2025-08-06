import { createContext, useContext } from "react";
import type { CompetitionService } from "./types";

export const competitionServiceContext = createContext<CompetitionService | null>(null);

export const useCompetitionService = (): CompetitionService => {
  const service = useContext(competitionServiceContext);
  if (!service) {
    throw new Error("useCompetitionService must be used within a CompetitionProvider");
  }
  return service;
};
