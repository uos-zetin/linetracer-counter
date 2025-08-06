import { createContext, useContext } from "react";
import type { TimerControlService } from "./types";

export const TimerControlContext = createContext<TimerControlService | null>(null);

export const useTimerControlService = () => {
  const context = useContext(TimerControlContext);
  if (!context) {
    throw new Error("useTimerControlService must be used within a TimerControlProvider");
  }
  return context;
};
