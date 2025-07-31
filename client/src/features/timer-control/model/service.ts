import type { TimerLogType, TimerRepository } from "@/entities/timer";
import type { TimerControlService } from "./types";

interface TimerControlServiceProps {
  timerRepository: TimerRepository;
}

export const createTimerControlService = ({ timerRepository }: TimerControlServiceProps): TimerControlService => {
  const startTimer = async (participantId: string) => {
    try {
      await timerRepository.startTimer(participantId);
    } catch (error) {
      console.error("Failed to start timer:", error);
      throw error;
    }
  };

  const stopTimer = async (participantId: string) => {
    try {
      await timerRepository.stopTimer(participantId);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  };

  const adjustTimer = async (participantId: string, type: TimerLogType, value: number) => {
    try {
      await timerRepository.adjustTimer(participantId, type, value);
    } catch (error) {
      console.error("Failed to adjust timer:", error);
      throw error;
    }
  };

  const getTimerLogs = async (participantId: string) => {
    try {
      await timerRepository.getTimerLogs(participantId);
    } catch (error) {
      console.error("Failed to get timer logs:", error);
      throw error;
    }
  };

  return {
    startTimer,
    stopTimer,
    adjustTimer,
    getTimerLogs,
  };
};
