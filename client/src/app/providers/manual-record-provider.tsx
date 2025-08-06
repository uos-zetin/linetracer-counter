import { useMemo } from "react";
import { ManualRecordContext, createManualRecordService } from "@/features/manual-record";
import { useRepository } from "./use-repository";

export const ManualRecordProvider = ({ children }: { children: React.ReactNode }) => {
  const { manualRecordRepository } = useRepository();

  const manualRecordService = useMemo(() => {
    return createManualRecordService({
      manualRecordRepository,
    });
  }, [manualRecordRepository]);

  return <ManualRecordContext.Provider value={manualRecordService}>{children}</ManualRecordContext.Provider>;
};
