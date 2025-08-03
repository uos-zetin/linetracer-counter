import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { createRecordControlService, RecordControlContext } from "@/features/record-control";

export const RecordControlProvider = ({ children }: { children: React.ReactNode }) => {
  const { recordRepository } = useRepository();

  const recordControlService = useMemo(() => {
    const recordControlService = createRecordControlService({
      recordRepository,
    });
    return recordControlService;
  }, [recordRepository]);

  return <RecordControlContext.Provider value={recordControlService}>{children}</RecordControlContext.Provider>;
};
