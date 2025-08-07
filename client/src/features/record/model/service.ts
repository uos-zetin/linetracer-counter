import { useZustandRecordStore, type Record, type RecordRepository, type RecordStatus } from "@/entities/record";
import type { RecordService } from "./types";

interface RecordServiceProps {
  recordRepository: RecordRepository;
}

export const createRecordService = ({ recordRepository }: RecordServiceProps): RecordService => {
  // ===== Load Functions (Public) =====
  const loadAllRecords = async (): Promise<void> => {
    try {
      // 빈 배열로 초기화 (전체 초기화용)
      const store = useZustandRecordStore.getState();
      store.init([]);
    } catch (error) {
      console.error("Failed to load all records:", error);
      throw error;
    }
  };

  const loadRecordsByParticipant = async (participantId: string): Promise<Record[]> => {
    try {
      const records = await recordRepository.getAllRecords(participantId);
      const store = useZustandRecordStore.getState();
      store.addMany(records);
      return records;
    } catch (error) {
      console.error(`Failed to load records for participant ${participantId}:`, error);
      throw error;
    }
  };

  const loadTopRecordsByDivision = async (divisionId: string): Promise<Record[]> => {
    try {
      const topRecords = await recordRepository.getTopRecords(divisionId);
      const store = useZustandRecordStore.getState();
      store.addMany(topRecords);
      return topRecords;
    } catch (error) {
      console.error(`Failed to load top records for division ${divisionId}:`, error);
      throw error;
    }
  };

  // ===== CRUD Functions (Admin) =====
  const createRecord = async (
    participantId: string,
    recordData: Pick<Record, "value" | "source" | "note">
  ): Promise<Record> => {
    try {
      const newRecord = await recordRepository.createRecord(participantId, recordData);
      const store = useZustandRecordStore.getState();
      store.add(newRecord);
      return newRecord;
    } catch (error) {
      console.error("Failed to create record:", error);
      throw error;
    }
  };

  const updateRecordNote = async (recordId: string, note: string): Promise<Record> => {
    try {
      const updatedRecord = await recordRepository.updateRecordNote(recordId, note);
      const store = useZustandRecordStore.getState();
      store.update(updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`Failed to update record note for id ${recordId}:`, error);
      throw error;
    }
  };

  const updateRecordStatus = async (recordId: string, status: RecordStatus): Promise<Record> => {
    try {
      const updatedRecord = await recordRepository.updateRecordStatus(recordId, status);
      const store = useZustandRecordStore.getState();
      store.update(updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`Failed to update record status for id ${recordId}:`, error);
      throw error;
    }
  };

  // ===== Filter Functions (Control) =====
  const getRecordsByParticipant = (participantId: string): Record[] => {
    const store = useZustandRecordStore.getState();
    return store.records.filter((record) => record.participantId === participantId);
  };

  const getRecordsByStatus = (status: RecordStatus): Record[] => {
    const store = useZustandRecordStore.getState();
    return store.records.filter((record) => record.status === status);
  };

  // ===== Subscription Hooks =====
  const useRecords = (): Record[] => {
    return useZustandRecordStore((state) => state.records);
  };

  const useRecordsByParticipant = (participantId: string): Record[] => {
    return useZustandRecordStore((state) => 
      state.records.filter((record) => record.participantId === participantId)
    );
  };

  const useTopRecordsByDivision = (divisionId: string): Record[] => {
    const allRecords = useZustandRecordStore((state) => state.records);

    if (!divisionId) {
      return [];
    }

    // TODO: participant 정보를 통해 division 필터링 구현 필요
    // 현재는 값(value)으로 오름차순 정렬하여 최고 기록들 반환
    return allRecords.sort((a, b) => a.value - b.value);
  };

  const useRecordById = (recordId: string): Record | null => {
    return useZustandRecordStore((state) => 
      state.records.find((record) => record.id === recordId) || null
    );
  };

  // ===== Public API =====
  return {
    // Load functions (공용)
    load: {
      allRecords: loadAllRecords,
      byParticipant: loadRecordsByParticipant,
      topByDivision: loadTopRecordsByDivision,
    },

    // Admin functions (관리자 전용)
    admin: {
      create: createRecord,
      updateNote: updateRecordNote,
      updateStatus: updateRecordStatus,
    },

    // Filter functions (제어용)
    filter: {
      byParticipant: getRecordsByParticipant,
      byStatus: getRecordsByStatus,
    },

    // Subscription hooks (구독)
    use: {
      records: useRecords,
      recordsByParticipant: useRecordsByParticipant,
      topRecordsByDivision: useTopRecordsByDivision,
      recordById: useRecordById,
    },
  };
};