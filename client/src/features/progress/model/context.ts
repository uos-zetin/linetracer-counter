import { createContext, useContext } from "react";
import type { ProgressService } from "./types";

export const progressServiceContext = createContext<ProgressService | null>(null);

export const useProgressService = () => {
  const context = useContext(progressServiceContext);
  if (!context) {
    throw new Error("useProgressService must be used within a ProgressServiceProvider");
  }
  return context;
};
