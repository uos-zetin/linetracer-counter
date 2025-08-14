import { createContext, useContext } from "react";
import type { CsvService } from "./service";

export const CsvContext = createContext<CsvService | null>(null);

export const useCsvService = (): CsvService => {
  const context = useContext(CsvContext);
  if (!context) {
    throw new Error("useCsvService must be used within a CsvProvider");
  }
  return context;
};