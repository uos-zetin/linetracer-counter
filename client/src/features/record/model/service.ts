import { useZustandRecordStore, type Record, type RecordRepository } from "@/entities/record";
import type { RecordService } from "./types";

interface RecordServiceProps {
  recordRepository: RecordRepository;
}

export const createRecordService = ({ recordRepository }: RecordServiceProps): RecordService => {
  // 조회 기능 (공용)
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

  const loadTopRecordsByDivision = async (divisionId: string): Promise<void> => {
    try {
      const topRecords = await recordRepository.getTopRecords(divisionId);

      // Top records를 store에 추가/업데이트
      const store = useZustandRecordStore.getState();
      store.addMany(topRecords);
    } catch (error) {
      console.error(`Failed to load top records for division ${divisionId}:`, error);
      throw error;
    }
  };

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인됨)
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

  // Store 구독 메서드들 (공용)
  const useRecords = (): Record[] => {
    return useZustandRecordStore((state) => state.records);
  };

  const useRecordsByParticipant = (participantId: string): Record[] => {
    const allRecords = useZustandRecordStore((state) => state.records);
    return allRecords.filter((record) => record.participantId === participantId);
  };

  const useTopRecordsByDivision = (divisionId: string): Record[] => {
    const allRecords = useZustandRecordStore((state) => state.records);
    
    if (!divisionId) {
      return [];
    }

    // TODO: participant 정보를 통해 division 필터링 구현 필요
    // 현재는 값(value)으로 내림차순 정렬하여 최고 기록들 반환
    return allRecords.sort((a, b) => b.value - a.value);
  };

  const useRecordById = (id: string): Record | null => {
    const record = useZustandRecordStore((state) => state.records.find((record) => record.id === id));
    return record || null;
  };

  return {
    // 조회 기능 (공용)
    loadAllRecords,
    loadRecordsByParticipant,
    loadTopRecordsByDivision,
    useRecords,
    useRecordsByParticipant,
    useTopRecordsByDivision,
    useRecordById,

    // 관리 기능 (admin 전용)
    createRecord,
    updateRecordNote,
    updateRecordStatus,
  };
};