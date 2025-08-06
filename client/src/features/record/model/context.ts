import { createContext, useContext } from "react";
import type { RecordService } from "./types";

export const recordServiceContext = createContext<RecordService | null>(null);

export const useRecordService = (): RecordService => {
  const service = useContext(recordServiceContext);
  if (!service) {
    throw new Error("useRecordService must be used within a RecordProvider");
  }
  return service;
};
