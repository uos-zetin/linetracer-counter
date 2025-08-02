import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { ManualRecordContext, createManualRecordService } from "@/features/manual-record";

export const ManualRecordProvider = ({ children }: { children: React.ReactNode }) => {
  const { manualRecordRepository } = useRepository();

  const manualRecordService = useMemo(() => {
    return createManualRecordService({
      manualRecordRepository,
    });
  }, [manualRecordRepository]);

  return <ManualRecordContext.Provider value={manualRecordService}>{children}</ManualRecordContext.Provider>;
};