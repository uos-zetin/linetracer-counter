import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { recordServiceContext, createRecordService, type RecordService } from "@/features/record";

export const RecordProvider = ({ children }: { children: React.ReactNode }) => {
  const { recordRepository } = useRepository();

  const recordService = useMemo(() => {
    const service: RecordService = createRecordService({
      recordRepository,
    });

    return service;
  }, [recordRepository]);

  return <recordServiceContext.Provider value={recordService}>{children}</recordServiceContext.Provider>;
};