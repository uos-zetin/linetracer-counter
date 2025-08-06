import { createContext, useContext } from "react";
import type { RecordControlService } from "./types";

export const RecordControlContext = createContext<RecordControlService | null>(null);

export const useRecordControlService = () => {
  const context = useContext(RecordControlContext);
  if (!context) {
    throw new Error("useRecordControlService must be used within a RecordControlProvider");
  }
  return context;
};
