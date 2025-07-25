import {
  CounterFetcherRepository,
  CounterSocketIOChannel,
  type CounterChannel,
  type CounterRepository,
} from "@/entities/counter";
import { useFetcher } from "./fetcher-provider";
import { counterRepoContext, createCounterService, type CounterService } from "@/features/counter";

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const fetcher = useFetcher();
  const counterRepository: CounterRepository = new CounterFetcherRepository(fetcher.authenticatedFetcher);
  const counterChannel: CounterChannel = new CounterSocketIOChannel();

  const counterService: CounterService = createCounterService({
    counterRepository,
    counterChannel,
  });

  const CounterProvider = counterRepoContext.Provider;

  return <CounterProvider value={counterService}>{children}</CounterProvider>;
};
