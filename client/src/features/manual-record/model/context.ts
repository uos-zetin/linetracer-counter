import { createContext, useContext } from "react";
import type { ManualRecordService } from "./types";

export const ManualRecordContext = createContext<ManualRecordService | null>(null);

export const useManualRecordService = (): ManualRecordService => {
  const context = useContext(ManualRecordContext);
  if (!context) {
    throw new Error("useManualRecordService must be used within a ManualRecordProvider");
  }
  return context;
};
