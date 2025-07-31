import { useZustandRecordStore, type RecordRepository, type Record, type RecordStatus } from "@/entities/record";
import type { RecordControlService } from "./types";

interface RecordControlServiceProps {
  recordRepository: RecordRepository;
}

export const createRecordControlService = ({ recordRepository }: RecordControlServiceProps): RecordControlService => {
  const getAllRecords = async (participantId: string): Promise<Record[]> => {
    try {
      const records = await recordRepository.getAllRecords(participantId);
      const store = useZustandRecordStore.getState();
      store.init(records);
      return records;
    } catch (error) {
      console.error("Failed to get all records:", error);
      throw error;
    }
  };

  const getTopRecords = async (divisionId: string): Promise<Record[]> => {
    try {
      return await recordRepository.getTopRecords(divisionId);
    } catch (error) {
      console.error("Failed to get top records:", error);
      throw error;
    }
  };

  const createRecord = async (
    participantId: string,
    record: Pick<Record, "value" | "source" | "note">,
  ): Promise<Record> => {
    try {
      const newRecord = await recordRepository.createRecord(participantId, record);
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
      console.error("Failed to update record note:", error);
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
      console.error("Failed to update record status:", error);
      throw error;
    }
  };

  // Simple selector functions for React components
  const useRecords = () => {
    return useZustandRecordStore((state) => state.records);
  };

  const useRecordById = (recordId: string) => {
    return useZustandRecordStore((state) => state.getById(recordId));
  };

  // Service-level filtering methods
  const getRecordsByParticipant = (participantId: string): Record[] => {
    const store = useZustandRecordStore.getState();
    return store.records.filter((record) => record.participantId === participantId);
  };

  const getRecordsByStatus = (status: RecordStatus): Record[] => {
    const store = useZustandRecordStore.getState();
    return store.records.filter((record) => record.status === status);
  };

  return {
    getAllRecords,
    getTopRecords,
    createRecord,
    updateRecordNote,
    updateRecordStatus,
    useRecords,
    useRecordById,
    getRecordsByParticipant,
    getRecordsByStatus,
  };
};
