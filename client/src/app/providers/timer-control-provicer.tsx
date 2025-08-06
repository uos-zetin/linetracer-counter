import { useMemo } from "react";
import { createTimerControlService, TimerControlContext, type TimerControlService } from "@/features/timer-control";
import { useRepository } from "./use-repository";

export const TimerControlProvider = ({ children }: { children: React.ReactNode }) => {
  const { timerRepository } = useRepository();

  const timerControlService = useMemo(() => {
    const timerControlService: TimerControlService = createTimerControlService({
      timerRepository,
    });
    return timerControlService;
  }, [timerRepository]);

  return <TimerControlContext.Provider value={timerControlService}>{children}</TimerControlContext.Provider>;
};
