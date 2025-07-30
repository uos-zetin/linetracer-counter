import type { ProgressChannel, ProgressRepository } from "../api/types";
import { useZustandProgressStore } from "./store.zustand";
import type { ProgressService, ProgressState } from "./types";

interface ProgressServiceProps {
  progressRepository: ProgressRepository;
  progressChannel: ProgressChannel;
}

export const createProgressService = ({
  progressRepository,
  progressChannel,
}: ProgressServiceProps): ProgressService => {
  let progressUpdate: (() => void) | null;

  const update = (progress: ProgressState) => {
    useZustandProgressStore.getState().setProgress(progress);
  };

  const connect = (divisionId: string) => {
    progressChannel.connect(divisionId);
    progressUpdate = progressChannel.subscribe(update);
  };

  const disconnect = () => {
    if (progressUpdate) {
      progressUpdate();
      progressUpdate = null;
    }
    progressChannel.disconnect();
  };

  const setProgress = (progress: ProgressState) => {
    useZustandProgressStore.getState().setProgress(progress);
  };

  const useProgress = () => {
    return useZustandProgressStore((state) => state.getProgress());
  };

  const useCompetition = () => {
    return useZustandProgressStore((state) => state.getCompetition());
  };

  const useDivision = () => {
    return useZustandProgressStore((state) => state.getDivision());
  };

  const useRunner = () => {
    return useZustandProgressStore((state) => state.getRunner());
  };

  const useNextRunners = () => {
    return useZustandProgressStore((state) => state.getNextRunners());
  };

  const useTopRecords = () => {
    return useZustandProgressStore((state) => state.getTopRecords());
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
  };
};
