import { useMemo } from "react";
import { AdminRecordContext, createAdminRecordService } from "@/features/admin-record";
import { useRepository } from "./use-repository";

export const AdminRecordProvider = ({ children }: { children: React.ReactNode }) => {
  const { recordRepository } = useRepository();

  const adminRecordService = useMemo(() => {
    return createAdminRecordService({
      recordRepository,
    });
  }, [recordRepository]);

  return <AdminRecordContext.Provider value={adminRecordService}>{children}</AdminRecordContext.Provider>;
};
