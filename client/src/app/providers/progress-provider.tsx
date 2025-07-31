import { useMemo } from "react";
import type { ProgressChannel, ProgressService } from "@/features/progress";
import { useRepository } from "./use-repository";
import { createProgressService, ProgressSocketIOChannel, progressServiceContext } from "@/features/progress";
import { useAuthService } from "@/features/auth";

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { progressRepository, manualRecordRepository } = useRepository();
  const authService = useAuthService();

  const { progressService, ProgressServiceProvider } = useMemo(() => {
    const progressChannel: ProgressChannel = new ProgressSocketIOChannel(() => 
      authService.getSessionKey()
    );

    const progressService: ProgressService = createProgressService({
      progressRepository,
      progressChannel,
      manualRecordRepository,
    });
    const ProgressServiceProvider = progressServiceContext.Provider;

    return { progressService, ProgressServiceProvider };
  }, [progressRepository, manualRecordRepository, authService]);

  return <ProgressServiceProvider value={progressService}>{children}</ProgressServiceProvider>;
};
