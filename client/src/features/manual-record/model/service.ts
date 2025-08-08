import type { ManualRecord, ManualRecordForm, ManualRecordRepository } from "@/entities/manual-record";
import type { ManualRecordService } from "./types";

interface ManualRecordServiceProps {
  manualRecordRepository: ManualRecordRepository;
}

export const createManualRecordService = ({
  manualRecordRepository,
}: ManualRecordServiceProps): ManualRecordService => {
  const loadManualRecordsByParticipant = async (participantId: string): Promise<ManualRecord[]> => {
    try {
      return await manualRecordRepository.getAllManualRecords(participantId);
    } catch (error) {
      console.error("Failed to load manual records:", error);
      throw error;
    }
  };

  const createManualRecord = async (participantId: string, form: ManualRecordForm): Promise<ManualRecord> => {
    try {
      return await manualRecordRepository.createManualRecord(participantId, form);
    } catch (error) {
      console.error("Failed to create manual record:", error);
      throw error;
    }
  };

  return {
    // Load functions (데이터 조회)
    load: {
      byParticipant: loadManualRecordsByParticipant,
    },
    
    // Admin functions (수동 기록 관리)
    admin: {
      create: createManualRecord,
    },
  };
};
