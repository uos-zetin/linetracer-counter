import { createContext, useContext } from "react";
import type { CounterService } from "./types";

export const counterServiceContext = createContext<CounterService | null>(null);

export const useCounterService = () => {
  const context = useContext(counterServiceContext);
  if (!context) {
    throw new Error("useCounterService must be used within a CounterProvider");
  }
  return context;
};
