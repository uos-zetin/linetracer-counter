import type { ManualRecordForm, ManualRecordRepository } from "@/entities/manual-record";
import type { ManualRecordService } from "./types";

interface ManualRecordServiceProps {
  manualRecordRepository: ManualRecordRepository;
}

export const createManualRecordService = ({
  manualRecordRepository,
}: ManualRecordServiceProps): ManualRecordService => {
  const createManualRecord = async (participantId: string, form: ManualRecordForm) => {
    try {
      const manualRecord = await manualRecordRepository.createManualRecord(participantId, form);
      return manualRecord;
    } catch (error) {
      console.error("Failed to create manual record:", error);
      throw error;
    }
  };

  return {
    createManualRecord,
  };
};
