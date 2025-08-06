import { useShallow } from "zustand/shallow";
import type { ManualRecordRepository } from "@/entities/manual-record";
import type { ProgressChannel, ProgressRepository } from "../api/types";
import { useZustandProgressStore } from "./store.zustand";
import type { ProgressService, ProgressState } from "./types";

interface ProgressServiceProps {
  manualRecordRepository: ManualRecordRepository;
  progressRepository: ProgressRepository;
  progressChannel: ProgressChannel;
}

export const createProgressService = ({
  manualRecordRepository,
  progressRepository,
  progressChannel,
}: ProgressServiceProps): ProgressService => {
  let progressUpdate: (() => void) | null;

  const update = (progress: ProgressState) => {
    const store = useZustandProgressStore.getState();
    store.setProgress(progress);
  };

  const connect = async (divisionId: string) => {
    try {
      if (progressUpdate) {
        progressUpdate();
        progressUpdate = null;
      }

      progressUpdate = progressChannel.subscribe(update);
      await progressChannel.connect(divisionId);
    } catch (error) {
      console.error("Failed to connect to progress channel:", error);
      // 연결 실패 시 정리
      if (progressUpdate) {
        progressUpdate();
        progressUpdate = null;
      }
      throw error;
    }
  };

  const disconnect = async () => {
    if (progressUpdate) {
      progressUpdate();
      progressUpdate = null;
    }
    await progressChannel.disconnect();

    const store = useZustandProgressStore.getState();
    store.reset(); // Reset the progress store on disconnect
  };

  const setProgress = (progress: ProgressState) => {
    useZustandProgressStore.getState().setProgress(progress);
  };

  const useProgress = () => {
    const result = useZustandProgressStore(
      useShallow((state) => ({
        id: state.id,
        competition: state.competition,
        division: state.division,
        runner: state.runner,
        nextRunners: state.nextRunners,
        topRecords: state.topRecords,
      }))
    );

    return result;
  };

  const useCompetition = () => {
    return useZustandProgressStore(useShallow((state) => state.competition));
  };

  const useDivision = () => {
    return useZustandProgressStore(useShallow((state) => state.division));
  };

  const useRunner = () => {
    return useZustandProgressStore(useShallow((state) => state.runner));
  };

  const useNextRunners = () => {
    return useZustandProgressStore(useShallow((state) => state.nextRunners));
  };

  const useTopRecords = () => {
    return useZustandProgressStore(useShallow((state) => state.topRecords));
  };

  // Runner control methods
  const postponeCurrentRunner = async (divisionId: string) => {
    try {
      await progressRepository.postponeCurrentRunner(divisionId);
    } catch (error) {
      console.error("Failed to postpone current runner:", error);
      throw error;
    }
  };

  const setCurrentRunner = async (divisionId: string, participantId: string) => {
    try {
      await progressRepository.setCurrentRunner(divisionId, participantId);
    } catch (error) {
      console.error("Failed to set current runner:", error);
      throw error;
    }
  };

  const changeOrder = async (divisionId: string, participantId: string, order: number) => {
    try {
      await progressRepository.changeOrder(divisionId, participantId, order);
    } catch (error) {
      console.error("Failed to change order:", error);
      throw error;
    }
  };

  const getOrder = async (divisionId: string) => {
    try {
      return await progressRepository.getOrder(divisionId);
    } catch (error) {
      console.error("Failed to get order:", error);
      throw error;
    }
  };

  const openDivision = async (divisionId: string) => {
    try {
      await progressRepository.openProgressDivision(divisionId);
    } catch (error) {
      console.error("Failed to open division:", error);
      throw error;
    }
  };

  const closeDivision = async (divisionId: string) => {
    try {
      await progressRepository.closeProgressDivision(divisionId);
    } catch (error) {
      console.error("Failed to close division:", error);
      throw error;
    }
  };

  const resetDivision = async (divisionId: string) => {
    try {
      await progressRepository.resetProgressDivision(divisionId);
    } catch (error) {
      console.error("Failed to reset division:", error);
      throw error;
    }
  };

  const loadProgressByDivision = async (divisionId: string): Promise<ProgressState | null> => {
    try {
      const progress = await progressRepository.getProgress(divisionId);
      if (progress) {
        // Store에 최신 progress 정보 업데이트
        const store = useZustandProgressStore.getState();
        store.setProgress(progress);
        return progress;
      }
      return null;
    } catch (error) {
      console.error(`Failed to load progress for division ${divisionId}:`, error);
      throw error;
    }
  };

  // Manual record methods
  const useCurrentRunnerManualRecords = () => {
    const runner = useZustandProgressStore((state) => state.runner);
    return runner?.manualRecords || [];
  };

  const addManualRecord = async (participantId: string, value: number, recorderName: string) => {
    try {
      await manualRecordRepository.createManualRecord(participantId, { value, recorderName });
      // Note: The progress store will be updated via WebSocket when the manual record is created
    } catch (error) {
      console.error("Failed to add manual record:", error);
      throw error;
    }
  };

  return {
    connect,
    disconnect,
    setProgress,
    useProgress,
    useCompetition,
    useDivision,
    useRunner,
    useNextRunners,
    useTopRecords,
    postponeCurrentRunner,
    setCurrentRunner,
    changeOrder,
    getOrder,
    openDivision,
    closeDivision,
    resetDivision,
    loadProgressByDivision,
    useCurrentRunnerManualRecords,
    addManualRecord,
  };
};
