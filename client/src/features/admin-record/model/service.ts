import { useZustandRecordStore, type Record, type RecordRepository } from "@/entities/record";
import type { AdminRecordService } from "./types";

interface AdminRecordServiceProps {
  recordRepository: RecordRepository;
}

export const createAdminRecordService = ({ recordRepository }: AdminRecordServiceProps): AdminRecordService => {
  const loadAllRecords = async (): Promise<void> => {
    try {
      // 빈 배열로 초기화
      const store = useZustandRecordStore.getState();
      store.init([]);
    } catch (error) {
      console.error("Failed to load all records:", error);
      throw error;
    }
  };

  const loadRecordsByParticipant = async (participantId: string): Promise<void> => {
    try {
      const records = await recordRepository.getAllRecords(participantId);

      // 한 번에 여러 records 추가
      const store = useZustandRecordStore.getState();
      store.addMany(records);
    } catch (error) {
      console.error(`Failed to load records for participant ${participantId}:`, error);
      throw error;
    }
  };

  const loadRecordById = async (id: string): Promise<void> => {
    try {
      const store = useZustandRecordStore.getState();

      const record = await recordRepository.getRecordById(id);

      if (record && !store.getById(id)) {
        store.add(record);
      } else if (record && store.getById(id)) {
        store.update(record);
      } else {
        console.warn(`Record with id ${id} not found in repository.`);
      }
    } catch (error) {
      console.error(`Failed to load record by id ${id}:`, error);
      throw error;
    }
  };

  const createRecord = async (data: Record): Promise<void> => {
    try {
      const newRecord = await recordRepository.createRecord(data.participantId, data);
      const store = useZustandRecordStore.getState();
      store.add(newRecord);
    } catch (error) {
      console.error("Failed to create record:", error);
      throw error;
    }
  };

  const updateRecordNote = async (id: string, note: string): Promise<void> => {
    try {
      const updatedRecord = await recordRepository.updateRecordNote(id, note);
      const store = useZustandRecordStore.getState();
      store.update(updatedRecord);
    } catch (error) {
      console.error(`Failed to update record with id ${id}:`, error);
      throw error;
    }
  };

  const updateRecordStatus = async (id: string, status: Record["status"]): Promise<void> => {
    try {
      const updatedRecord = await recordRepository.updateRecordStatus(id, status);
      const store = useZustandRecordStore.getState();
      store.update(updatedRecord);
    } catch (error) {
      console.error(`Failed to update record status for id ${id}:`, error);
      throw error;
    }
  };

  // Store 구독 메서드들
  const useRecords = (): Record[] => {
    return useZustandRecordStore((state) => state.records);
  };

  const useRecordsByParticipant = (participantId: string): Record[] => {
    return useZustandRecordStore((state) => state.records.filter((record) => record.participantId === participantId));
  };

  const useRecordById = (id: string): Record | null => {
    return useZustandRecordStore((state) => state.getById(id)) || null;
  };

  return {
    // Store state updates
    loadAllRecords,
    loadRecordsByParticipant,
    loadRecordById,
    createRecord,
    updateRecordNote,
    updateRecordStatus,

    // Store 구독 메서드들
    useRecords,
    useRecordsByParticipant,
    useRecordById,
  };
};
