import { createContext, useContext } from "react";
import type { DivisionService } from "./types";

export const divisionServiceContext = createContext<DivisionService | null>(null);

export const useDivisionService = (): DivisionService => {
  const service = useContext(divisionServiceContext);
  if (!service) {
    throw new Error("useDivisionService must be used within a DivisionProvider");
  }
  return service;
};
