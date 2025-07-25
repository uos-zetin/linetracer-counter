import type { ProgressChannel } from "../api/types";
import { useZustandProgressStore } from "./store.zustand";
import type { ProgressService, ProgressState } from "./types";

interface ProgressServiceProps {
  // progressRepository: ProgressRepository;
  progressChannel: ProgressChannel;
}

export const createProgressService = ({
  // progressRepository,
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
  };
};
