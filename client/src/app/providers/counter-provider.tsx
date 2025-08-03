import { useMemo } from "react";
import { CounterSocketIOChannel, type CounterChannel } from "@/entities/counter";
import { useRepository } from "./use-repository";
import { counterServiceContext, createCounterService, type CounterService } from "@/features/counter";
import { useAuthService } from "@/features/auth";

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const { counterRepository } = useRepository();
  const authService = useAuthService();

  const counterService = useMemo(() => {
    const counterChannel: CounterChannel = new CounterSocketIOChannel(() => 
      authService.getSessionKey()
    );
    const counterService: CounterService = createCounterService({
      counterRepository,
      counterChannel,
    });

    return counterService;
  }, [counterRepository, authService]);

  return <counterServiceContext.Provider value={counterService}>{children}</counterServiceContext.Provider>;
};
