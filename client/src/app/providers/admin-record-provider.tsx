import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { AdminRecordContext, createAdminRecordService } from "@/features/admin-record";

export const AdminRecordProvider = ({ children }: { children: React.ReactNode }) => {
  const { recordRepository } = useRepository();

  const adminRecordService = useMemo(() => {
    return createAdminRecordService({
      recordRepository,
    });
  }, [recordRepository]);

  return <AdminRecordContext.Provider value={adminRecordService}>{children}</AdminRecordContext.Provider>;
};
