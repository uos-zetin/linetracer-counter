import { createContext, useContext } from "react";
import type { AdminRecordService } from "./types";

export const AdminRecordContext = createContext<AdminRecordService | null>(null);

export const useAdminRecordService = () => {
  const service = useContext(AdminRecordContext);

  if (!service) {
    throw new Error("useAdminRecordService must be used within AdminRecordProvider");
  }

  return service;
};
