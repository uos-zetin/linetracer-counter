import { useMemo } from "react";
import { CounterSocketIOChannel, type CounterChannel } from "@/entities/counter";
import { useRepository } from "./use-repository";
import { counterServiceContext, createCounterService, type CounterService } from "@/features/counter";

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const { counterRepository } = useRepository();

  const counterService = useMemo(() => {
    const counterChannel: CounterChannel = new CounterSocketIOChannel();
    const counterService: CounterService = createCounterService({
      counterRepository,
      counterChannel,
    });

    return counterService;
  }, [counterRepository]);

  return <counterServiceContext.Provider value={counterService}>{children}</counterServiceContext.Provider>;
};
