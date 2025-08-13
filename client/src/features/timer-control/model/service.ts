import type { TimerLog, TimerLogType, TimerRepository } from "@/entities/timer";
import type { TimerControlService } from "./types";

interface TimerControlServiceProps {
  timerRepository: TimerRepository;
}

export const createTimerControlService = ({ timerRepository }: TimerControlServiceProps): TimerControlService => {
  const loadTimerLogs = async (participantId: string): Promise<TimerLog[]> => {
    try {
      return await timerRepository.getTimerLogs(participantId);
    } catch (error) {
      console.error("Failed to get timer logs:", error);
      throw error;
    }
  };

  const startTimer = async (participantId: string): Promise<TimerLog> => {
    try {
      return await timerRepository.startTimer(participantId);
    } catch (error) {
      console.error("Failed to start timer:", error);
      throw error;
    }
  };

  const stopTimer = async (participantId: string): Promise<TimerLog> => {
    try {
      return await timerRepository.stopTimer(participantId);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  };

  const adjustTimer = async (participantId: string, type: TimerLogType, value: number): Promise<TimerLog> => {
    try {
      return await timerRepository.adjustTimer(participantId, type, value);
    } catch (error) {
      console.error("Failed to adjust timer:", error);
      throw error;
    }
  };

  return {
    // Load functions (데이터 조회)
    load: {
      logs: loadTimerLogs,
    },

    // Admin functions (타이머 제어)
    admin: {
      start: startTimer,
      stop: stopTimer,
      adjust: adjustTimer,
    },
  };
};
